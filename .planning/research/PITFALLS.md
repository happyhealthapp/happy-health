# Pitfalls Research

**Domain:** Home care medical services marketplace (Pakistan-first, Karachi pilot)
**Researched:** 2026-10-15
**Confidence:** MEDIUM-HIGH (official GitHub/Supabase/Vite/SHCC/PNMC docs = HIGH; community post-mortems and draft-law status = MEDIUM)

## How to read this

This file is written for a **solo founder on a 6-month SEIC incubation clock**, shipping a React/Vite + Supabase app hosted on **GitHub Pages**. Every pitfall below names the phase that should prevent it. Phase labels used here map to a lean roadmap:

- **P1 — Assignments Site & Deploy Pipeline** (this week: dated Mon/Wed/Fri folder structure, mentor README, GitHub Pages auto-deploy)
- **P2 — Supabase Foundation** (schema, auth, RLS, roles)
- **P3 — Staff Onboarding & Credential Verification**
- **P4 — Patient Booking Flow**
- **P5 — Trust & Safety & Ops Console**
- **P6 — Payments & Commission** (deferred until bookings validated manually — per PROJECT.md Out of Scope)
- **P7 — Pilot, Compliance & Scale-Out** (move off GitHub Pages if commercial)

> **The single most important insight:** this project has two very different risk profiles at once. Technically it looks small (free static host + BaaS), but the **domain is regulated health care with vulnerable patients who invite strangers into their homes**. Most catastrophic outcomes here are *operational/legal*, not code. The roadmap must treat verification, consent, and incident handling as first-class features, not paperwork to do "later."

---

## Critical Pitfalls

### Pitfall 1: GitHub Pages is a SPA-hostile, commercially-restricted host — and you will discover both at the worst time

**What goes wrong:**
Three distinct failures land together:

1. **Deep-link 404s.** GitHub Pages is a static file server with no rewrite support. Any URL that is not a real file on disk (e.g. `happy-health/about`, `happy-health/booking/123`, a booking confirmation link you email a patient) returns GitHub's **404 page** on refresh, direct entry, or share. Mentor clicks a shared link → "Page not found."
2. **Broken asset/base paths under a project subpath.** Because the repo is a *project* site (`nursingcareinfo.github.io/happy-health/`), Vite must build with `base: '/happy-health/'` and React Router must use `basename: '/happy-health'`. Miss either and the deployed app loads a blank white screen (assets 404) even though `npm run dev` works perfectly.
3. **Prohibited commercial use.** GitHub's own limits page states Pages is **"not intended for or allowed to be used as a free web-hosting service to run your online business, e-commerce site, or any other website that is primarily directed at either facilitating commercial transactions or providing commercial software as a service (SaaS)."** Once Happy Health takes commission on real bookings, the *production* site on Pages is in violation.

**Why it happens:**
`npm run dev` runs a dev server that rewrites all unknown routes to `index.html` and serves from `/`. So *every* routing and base-path bug is invisible locally and only appears after deploy. Founders also conflate "free hosting" with "hosting suitable for a business."

**How to avoid:**
- Set `base: '/happy-health/'` in `vite.config.ts` (drive it from an env var so a future custom domain can use `/`). Set `basename` on the router from `import.meta.env.BASE_URL`.
- Add a **404.html fallback**: in the deploy workflow, run `cp ./dist/index.html ./dist/404.html` so GH Pages serves the SPA shell for unknown routes. Note the route still returns HTTP 404 (bad for SEO but fine for a demo).
- **Alternative:** use `HashRouter` — sidesteps the whole class of problem at the cost of `/#/` URLs. Recommended for P1 (mentor reviews care about content, not clean URLs), migrate to BrowserRouter + real host later.
- Never use `<a href="/foo">` for internal nav — use `<Link>` / `useNavigate`, or a full page reload will 404.
- Ship a tiny **routing smoke test** and, in the P1 workflow, assert that `dist/404.html` and `dist/index.html` both exist.
- **Plan the exit now:** keep the app framework-portable (plain Vite + static output) so moving to Cloudflare Pages / Vercel / Netlify at P7 is a hosting change, not a rewrite. Move *before* the first commercial transaction.

**Warning signs:**
- "It works on my machine but the deployed site is blank."
- A mentor says "the link you sent says 404."
- `dist/index.html` references `/assets/...` (root) instead of `/happy-health/assets/...`.
- Nobody has ever refreshed a non-root deployed page.

**Phase to address:** **P1** (404.html + base + basename + smoke test); **P7** (migrate the commercial production site off Pages).

---

### Pitfall 2: Supabase Row Level Security misconfiguration leaks patient health data

**What goes wrong:**
The Supabase anon key ships in the browser bundle *by design*. If RLS is off, absent, or too permissive on any table, **anyone with the public anon key can read every patient record, every staff credential, every booking note** — via the auto-generated REST API — without ever visiting your UI. Specific traps:

- **RLS is off by default** on new tables. A table created in the SQL editor with no `enable row level security` and no policies is fully readable by `anon`.
- **Views bypass RLS** because they run as the definer (`postgres`). A "convenience view" over `patients` hands out every row.
- **Mutually recursive policies** on two tables produce Postgres error `42P17` (infinite recursion in policy) — pages break, and the tempting fix is to disable RLS.
- **Using `user_metadata` for authorization.** It is user-editable, so a patient can self-assign `role: 'admin'`.
- **`service_role` key in the frontend.** It has `BYPASSRLS` — it ignores *all* policies. One `VITE_SUPABASE_SERVICE_ROLE_KEY` and the entire database is public.

**Why it happens:**
Solo devs enable RLS on the "obvious" tables and forget junction/child tables (`booking_notes`, `staff_credentials`, `documents`). Supabase's ergonomics make direct-from-browser queries so easy that the policy layer gets treated as an afterthought. The failure is silent: the app works fine for the founder and leaks for everyone else.

**How to avoid:**
- **Default-deny:** every table gets `alter table ... enable row level security` and explicit policies. Add a migration-time guard/check that fails CI if any `public` table has RLS disabled.
- **Three roles, three policies:** `anon` → select only public catalogue data (services, equipment listings); `authenticated` → scoped by `auth.uid()` and role; `service_role` → server-side (Edge Functions) only.
- **Role check via `app_metadata`/custom claims or a roles table**, never `user_metadata`. For membership-style checks use a `SECURITY DEFINER` helper with `REVOKE EXECUTE ... FROM anon, authenticated` (avoid recursion, avoid direct RPC calls).
- **Avoid table joins in policy predicates** (`col in (select ... from membership where user_id = (select auth.uid()))`); it keeps queries fast and avoids recursion.
- **Views:** create with `security_invoker = true` or don't expose views at all; prefer RLS-protected tables.
- Write a **negative test**: with only the anon key, attempt to read another user's patient row and assert 0 rows / 403. Run it in CI.

**Warning signs:**
- Any table where you cannot state its policy in one sentence.
- A migration that adds a table without an accompanying policy.
- `curl` with just the anon key returns rows you didn't expect.
- "I'll lock it down before launch."

**Phase to address:** **P2**. This is the foundation; retrofitting RLS after P4 data exists is a rewrite.

---

### Pitfall 3: Leaking secrets through Vite env vars and a public GitHub Pages repo

**What goes wrong:**
Vite **statically replaces and bundles** every variable prefixed `VITE_` into the shipped JavaScript. So `VITE_SUPABASE_SERVICE_ROLE_KEY`, `VITE_GEMINI_API_KEY`, or a DB password is readable by anyone who opens DevTools or greps the bundle. Worse, because **GitHub Pages sites are publicly served even if the repository is private** (and on the free plan the repo must be *public* anyway), a committed `.env` is public regardless of what the built output contains.

**Why it happens:**
The Supabase anon key *is* safe to expose, so founders generalize "keys in the frontend are fine." The service key looks nearly identical and is catastrophic. AI codegen often scaffolds `VITE_SUPABASE_SERVICE_ROLE_KEY` without warning.

**How to avoid:**
- **Allow-list rule:** the only Supabase credential in `VITE_` is the **anon/publishable** key. Everything else (`service_role`/secret key, Gemini/LLM keys, DB password, admin tokens) lives **only** in Supabase Edge Function secrets and GitHub Actions repository secrets.
- Add `.env`, `.env.local`, `.env.*.local` to `.gitignore` **before the first commit**. Commit a `.env.example` with placeholder names only.
- Business logic that needs elevated access (credential verification writes, commission records) runs in an **Edge Function**, not the browser.
- Turn on **GitHub secret scanning + push protection**; enable Supabase's **API key rotation** and rotate immediately if a key was ever committed (git history retains it).
- Vite refuses `envPrefix: ''` for exactly this reason — never override that.

**Warning signs:**
- `.env` appears in `git status` or `git log --all -- .env`.
- A `VITE_*` variable name contains `SECRET`, `SERVICE`, `PRIVATE`, or `PASSWORD`.
- The browser bundle contains a JWT with `"role":"service_role"`.

**Phase to address:** **P1** (.gitignore, secret scanning, deploy workflow hygiene); re-audited **P2** and **P6**.

---

### Pitfall 4: Credential/licence verification done superficially — the credential card is not the credential

**What goes wrong:**
Staff "register with credentials (license number, CV/experience)" is implemented as **file upload + self-declared number**, and the platform lists anyone who submits. Forged or borrowed licence cards, expired registrations, stolen identities, and "nurses" who are actually unqualified attendants slip through. In Sindh this is not merely a trust problem: unregistered practice is **quackery** under the SHCC framework, and letting an unverified person perform a procedure at a patient's home exposes the founder to **medical negligence** liability.

**Why it happens:**
A file upload is trivial to build; verifying against a registry is a manual phone/portal task with no API. The founder wants supply fast (marketplace cold-start pressure) so "we'll verify later" wins. Verification is also invisible in a demo, so it feels low-value.

**How to avoid:**
- Treat verification as a **state machine**: `submitted → docs_received → registry_checked → id_verified → approved | rejected`, with an audit trail (who checked, when, against what source).
- **Verify against the official registry, not the document.** For nurses/LHVs/midwives, look the person up on the **PNMC (Pakistan Nursing & Midwifery Council)** online register by CNIC/token; for doctors, **PM&DC**. Record the registry result and the licence expiry date on the record.
- Store the **licence expiry** and auto-flag/re-suspend staff when it lapses (a "Verified" badge must expire).
- Add **identity + liveness** verification (live selfie compared to the ID) — this also defeats account sharing (see Pitfall 8).
- Store credential documents in **private** Supabase Storage buckets with signed URLs, never public buckets.
- **Publish the verification policy** on the site (what is checked, by whom, what a "Verified" badge means) — this is both a trust signal and a liability shield.
- Concretely document the operator's own side: an individual nurse providing services is a Healthcare Service Provider and the operating entity likely needs **SHCC registration**; budget the paperwork as a real milestone task, not a footnote.

**Warning signs:**
- Any staff member is bookable while their verification state is not `approved`.
- "Verified" badge appears on profiles whose registry check was never recorded.
- Documents in a public bucket (test by opening a URL logged-out).
- No field in the schema for licence number, issuing council, or expiry.

**Phase to address:** **P3** (design the state machine + registry check + expiry); **P5** (badge/expiry automation and enforcement).

---

### Pitfall 5: No consent, no privacy notice, no breach plan for sensitive health data (and PECA s.38 has teeth)

**What goes wrong:**
The platform collects **sensitive personal data** (health conditions, medical records, CNIC, address, potentially photos) but ships with no privacy notice, no explicit consent capture, and no access controls — because Pakistan "has no data protection law yet," so it feels optional. It is not: **PECA 2016 s.38** makes unauthorised disclosure/transfer of personal or sensitive data punishable by **up to 3 years imprisonment and/or PKR 1 million**, and privacy is a **fundamental right** under Constitution Arts. 9/14. A leaked patient list, or sharing a patient's details with the wrong staff member, is a criminal-exposure event, not just an embarrassment.

**Why it happens:**
The absence of an enacted comprehensive law (the Personal Data Protection Bill 2023 / draft PDA 2025 is **still not law** as of 2026) is misread as "no rules." In fact, **explicit informed consent is currently the *only* lawful basis** for processing patient data, and the coming law (GDPR-shaped) will impose registration, 72-hour breach notification, and data-localisation obligations.

**How to avoid:**
- Ship a plain-language **Privacy & Consent notice** at P2/P4: what is collected, why, who sees it (assigned nurse/doctor), how long it is kept, how to withdraw consent.
- Capture **explicit, timestamped, versioned consent** before collecting health details; store the consent text version with the record.
- **Data minimisation:** don't collect history you don't need to make the visit safe. Field-level access: a nurse sees the assigned patient; a nurse never sees another patient's record.
- Encrypt at rest (Supabase default) and restrict access via RLS; keep documents in private buckets.
- Write a one-page **breach-response runbook** now (who to notify, PECA/NCCIA exposure) even though notification isn't yet statutorily mandatory — future-proofing is cheap now, expensive later.
- Avoid placing any real patient data in the **public** GitHub repo (Pages sites are public even with a private repo). No demo screenshots with real names; seed with fictional data.

**Warning signs:**
- Signup/signin form collects health info with no consent checkbox or notice link.
- A nurse account can query patients they are not assigned to.
- Real patient names/CNICs appear in seed data, issues, screenshots, or commit history.
- "We'll add a privacy policy before we launch."

**Phase to address:** **P2** (consent capture + RLS by assignment); **P3/P4** (notice + minimisation); **P7** (compliance hardening, registration, breach plan).

---

### Pitfall 6: Patient safety and liability for at-home procedures treated as someone else's problem

**What goes wrong:**
The platform frames itself as a "connector" and assumes liability sits with the nurse/doctor. At-home care happens in an uncontrolled setting — no crash cart, no second pair of hands, no supervisor. Adverse events (medication error, fall, infection, delayed escalation) are more likely than in a facility, and the marketplace's vetting/listing decisions are exactly what a plaintiff (and a regulator) will point to. A single serious incident in a Karachi pilot can end the venture and the incubator's backing.

**Why it happens:**
Marketplaces instinctively write "we just connect people" disclaimers. But where a platform **verifies, badges, matches, and takes commission**, claiming pure-neutrality is legally fragile and reputationally hollow. Home care moves the risk into the patient's house, where the platform's choices (who is sent, what is in-scope) directly cause harm.

**How to avoid:**
- Define, in writing, an **in-scope / out-of-scope service list** ("wound dressing, vitals, IV administration under doctor's order; NOT emergency care, NOT controlled-substance administration"). Enforce it in the booking flow (service catalogue only).
- Require **structured visit records**: vitals, medications, observations, and a **session start/complete** log per booking (also your evidence trail for disputes and PECA).
- Provide an **in-app emergency/SOS path** and a clear "call the local emergency number first" flow (mirror how mature home-care platforms do it).
- Get the **legal/consent wording reviewed in the SEIC Law session** and have staff acknowledge documented SOPs; consider professional-indemnity expectations for listed staff.
- Train staff on scope, escalation, and incident reporting; make **incident reporting mandatory and low-friction**.
- Never let the marketing claim more than operationally true (e.g. don't say "24/7 emergency care" if you don't run it).

**Warning signs:**
- The booking catalogue has no explicit scope boundaries.
- No per-visit record exists beyond "booking completed."
- There is no documented incident/emergency path.
- Staff are listed without agreeing to any SOP.

**Phase to address:** **P4** (scope-limited catalogue, visit records); **P5** (incident reporting, SOS, enforcement); **P7** (legal review, insurance/indemnity).

---

### Pitfall 7: Trust & safety gaps — fake staff, no-shows, and off-platform extraction

**What goes wrong:**
The classic home-care marketplace failures: a bad actor circumvents vetting using aliases or a fake business (a documented Care.com case where a person with grand-theft/forgery history repeatedly re-enrolled); a caregiver takes the booking then extracts the patient **off-platform** for future visits (you lose the commission and any accountability); a nurse **no-shows** and a fragile patient is left without care; "buddy punching" — the booked nurse sends someone else.

**Why it happens:**
Trust features (identity/liveness checks, session logging, in-app-only communication, reviews gated on completed sessions, no-show penalties) are invisible in a demo and cost effort. The pressure to get supply online fast pushes vetting to "later," and money that never passes through the platform makes off-platform extraction trivial.

**How to avoid:**
- **Identity + liveness** verification at onboarding, plus a per-visit **"who is at the door" identity badge** in the patient's view.
- Keep **communication inside the app** (messaging/logged) and **number anonymisation** so contact details aren't exchanged; make off-platform solicitation a policy violation with suspension.
- **Session start/complete logging** with a grace period: if the nurse doesn't start on time, notify the patient and offer free cancellation.
- **Reviews only after a completed session**; liquidate fake/coerced reviews; suspend on substantiated complaints.
- Publish and enforce a **no-show / cancellation policy** (for both staff and patients) with consequence tiers.
- Run a **manual, human review** for the first cohort — solo-founder advantage: you can personally verify the first 20–50 staff and triage every incident.

**Warning signs:**
- Patients report staff asking to be paid/contacted directly.
- A staff member's profile is approved but no registry/ID check is recorded.
- No-shows have no consequence and no patient-side compensation.
- Reviews exist on listings with zero completed bookings.

**Phase to address:** **P3** (identity/liveness + policy); **P5** (session logging, in-app comms, reviews, suspension, incident handling).

---

### Pitfall 8: Payments/refunds without escrow — commission you cannot collect and refunds you cannot control

**What goes wrong:**
Payment is deferred (correctly, per Out of Scope), but the *design* still assumes the platform can take commission and issue refunds. In a cash-first market, if the patient pays the nurse in cash directly, the platform **cannot collect its commission** and **cannot refund** a dissatisfied patient. A deposit/advance held by the platform without a licensed payment partner can become an escrow/regulatory problem. Disputes with no escrow become civil matters (a documented US case: a family lost a ~$2,940 deposit and was told it was "not theft"). Cancellation/no-show fees need an explicit, published basis.

**Why it happens:**
Marketplaces assume money flows through them. In Pakistan, mature players deliberately **avoid holding funds**: one platform states it "never holds your customers' money," with each payment rail paying the merchant directly; another has families pay providers in cash and only charges providers a commission on completed jobs. Founders copy Stripe-style escrow designs that don't fit the rails and the licensing reality.

**How to avoid:**
- For the MVP, **keep money out of the platform**: patient pays staff directly (cash/bank/wallet), and the platform **bills commission separately** (invoice/mobile wallet) after a completed booking. Track "commission due / collected" as its own record.
- Publish an explicit **Cancellation, No-show & Refund policy** (windows, fees, who bears the loss) modeled on local practice — and cite the applicable consumer protection act.
- Log every booking with an immutable **completion record** (evidence for disputes and for commission collection).
- When you do introduce online payments, use a **licensed PSP** (card/wallet) and a settlement model rather than building escrow from scratch; only then consider holding funds.
- Don't over-promise "money-back guarantee" before you have a refund mechanism that actually works.

**Warning signs:**
- Commission is tracked nowhere when cash changes hands.
- No published refund/cancellation policy exists.
- The UI implies the platform can refund but has no path to do so.
- Anyone is "designing escrow" before 25 bookings have happened manually.

**Phase to address:** **P4** (completion records + policy link); **P6** (commission tracking, PSP integration, refunds) — deliberately gated behind manual validation.

---

### Pitfall 9: Free-tier limits and a paused Supabase project break the mentor demo at the worst moment

**What goes wrong:**
Two things bite a free-tier app shown to reviewers:

1. **Supabase Free projects pause after 7 days of low activity.** A mentor opening the app after a quiet week gets errors / a paused project. Paid plans don't pause.
2. **Quotas are small and shared:** **500 MB database**, **5 GB egress/month**, **1 GB Storage**, **50,000 MAU**, **500k Edge Function invocations/month**, **10 Edge Functions**, **2M realtime messages**, **200 realtime peak connections**. Storing staff CVs, licence scans, and visit documents in Storage can approach the **1 GB** cap quickly; large images/PDFs burn egress.
3. **GitHub Pages** adds its own ceilings: **1 GB site**, **100 GB/month soft bandwidth**, **10 builds/hour soft limit** (unless building via a custom Actions workflow), **10-minute deploy timeout**.

**Why it happens:**
"Free tier is plenty" is true at demo scale and false the moment a reviewer loads heavy assets repeatedly or the project goes quiet. Pausing is invisible until someone else opens the link.

**How to avoid:**
- Add a **keepalive** (scheduled GitHub Actions ping / lightweight request) so the project never hits 7 days idle — or accept a Pro plan before external reviewers use it.
- **Compress and cap uploads**: downscale images client-side, limit document sizes, use signed-URL private storage, don't store full-resolution scans if a compressed copy suffices.
- Keep an eye on the dashboard **usage charts**; set the **spend cap** so overage can't silently bill (and so you notice before it blocks).
- **Build via a custom Actions workflow** (not the branch build) to escape the 10 builds/hour limit and get faster deploys.
- Treat "will the mentor's link work cold?" as an acceptance test for the demo milestone.

**Warning signs:**
- No request to the project for >5 days.
- Storage usage climbing after each staff upload.
- Deploy fails or takes minutes during a demo push.
- Usage approaching 80% of any quota with no plan.

**Phase to address:** **P1** (persistent deploy workflow + keepalive); **P2/P3** (upload size limits + storage strategy); **P7** (plan upgrade before public pilot).

---

### Pitfall 10: Solo-founder scope creep — building a two-sided marketplace before proving one booking

**What goes wrong:**
Over six months, with an incubator rewarding visible progress, the natural failure is to build **both sides at once**: search, filters, matching, real-time chat, admin dashboards, multiple roles, reviews, notifications, payments. None of it is tested against a real patient. The single most common MVP mistake is **overbuilding**, not underbuilding — precisely because it feels responsible. Meanwhile the actual riskiest assumption ("will a Karachi family pay for a vetted home nurse booked online?") goes untested until month 5.

**Why it happens:**
Feature lists are easy to measure; validated learning is not. Competitor breadth becomes the benchmark. AI tooling makes building feel cheap, so the "possible to build" is confused with the "necessary to build." Marketplace chicken-and-egg pressure pushes toward building both sides.

**How to avoid:**
- Adopt a **concierge/single-sided MVP**: build the **buyer surface** for real; source **supply manually** (spreadsheets + phone) for the first ~25–50 bookings. Automate only what breaks under repetition.
- **Pick the harder side (supply — verified nurses) and seed it densely in one city (Karachi-first, per PROJECT.md)** before pulling demand.
- Define **one critical V1 outcome**: "first paid home-care booking completed end-to-end" (already the stated success metric in PROJECT.md). Write a **kill list** of features you will NOT build this milestone (search, filters, chat, native apps, multi-city, reviews on day one).
- **Don't build escrow, matching algorithms, or rating systems on day one.** Launch reviews only after ~20 completed transactions (empty review sections hurt conversion).
- Timebox major build increments to **4–6 weeks**; if a plan doesn't fit, cut scope, don't extend.
- Keep the **6-month clock and assignment cadence** (Mon/Wed/Fri) as the forcing function: every phase ships something mentor-visible.

**Warning signs:**
- The roadmap lists more than one core workflow in parallel.
- No completed booking yet but the schema/UI covers 6 feature areas.
- "Just one more feature before we show a patient."
- Launch date slipping because the product "never feels complete."

**Phase to address:** **All phases** — enforced at **P1** (define V1 outcome + kill list) and reviewed at every milestone boundary.

---

### Pitfall 11: Multi-role access done ad hoc — patients, staff, and admin end up in one undifferentiated bucket

**What goes wrong:**
Auth is implemented as "signup → logged in," and a single `profiles` table with no role semantics. Consequences: a patient can read staff credential documents; a nurse can see other nurses' patients; an admin-only action (approve a credential, adjust commission) is reachable by any authenticated user because authorization was enforced only in the UI. Combined with `user_metadata`-based role checks, a user can self-elevate.

**Why it happens:**
RBAC feels like "enterprise" scope and gets deferred. UI-level hiding is mistaken for authorization. The three roles (patient / staff / admin) are obvious in the domain but not encoded in the data model.

**How to avoid:**
- Model **explicit roles** (`patient`, `nurse`, `doctor`, `admin`) and drive RLS from them; authorize on the **server** (RLS + Edge Functions), never only in React.
- Put roles in **`app_metadata`/custom claims or a `roles` table** — never `user_metadata`.
- Use a `SECURITY DEFINER` helper for cross-table role checks with `REVOKE EXECUTE` to avoid recursion and RPC abuse.
- Add a **role-matrix test**: for each (role × table × operation), assert allowed/denied. This is the cheapest way to prevent the "one forgotten policy" breach.
- Keep admin actions (credential approval, refunds, suspensions) in **Edge Functions** with server-side checks, so they're never a client-trusted bool.

**Warning signs:**
- A single boolean like `isAdmin` on a client-editable profile.
- Policies that only check `auth.role() = 'authenticated'` rather than ownership/role.
- Admin screens that work purely because the button is hidden.
- No test that a nurse cannot read another patient's row.

**Phase to address:** **P2** (role model + RLS), **P5** (admin/ops actions server-side).

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| `HashRouter` instead of BrowserRouter + 404.html | Zero routing config, works on Pages instantly | Ugly `/#/` URLs, poor SEO, must migrate before marketing site | **Acceptable for P1** demo; migrate by P7 |
| Defer RLS, use service_role from client to "make it work" | Features ship fast in dev | Full DB exposure; rewrite when policies land on live data | **Never** |
| Store credentials in a public Supabase Storage bucket | One-line upload | Licence scans/CNICs are world-readable = PECA exposure | **Never** |
| Self-declared licence number, no registry check | Instant supply | Fake staff, quackery, liability, patient harm | **Never** for nurses/doctors; manual ops review required |
| No consent checkbox ("we'll add policy later") | Faster signup form | No lawful basis for health data; criminal exposure under PECA s.38 | **Never** once real patient data exists |
| Cash commission collected "by hand" untracked | Zero payment code | Uncollectable commission, untraceable refunds | **Acceptable in P6 MVP** if logged |
| Single `profiles` table, role in a client flag | Simplest auth | Privilege escalation, cross-patient data leak | **Never** |
| Keeping production on GitHub Pages after payments | Free, already deployed | Violates GitHub's commercial-use policy; risk of takedown | **Never** for the paid production site |
| Free-tier Supabase, no keepalive | Free | Project pauses, mentor/demo link breaks | **Acceptable** only with an automated keepalive or before external reviewers |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| **GitHub Pages (project subpath)** | Omitting `base` in `vite.config.ts` / `basename` in router → blank deployed page | Set both from the repo name; verify deployed assets load from `/happy-health/assets/` |
| **GitHub Pages (routing)** | Assuming a dev server's rewrite behavior exists in production | Copy `index.html`→`404.html` in the deploy step, or use HashRouter |
| **GitHub Pages (policy)** | Using it to host a commercial booking site | Host production commerce elsewhere (Cloudflare/Vercel/Netlify); use Pages for the SEIC/assignment site + demo |
| **GitHub Pages (privacy)** | Assuming a private repo keeps the site private | Pages sites are public even when the repo is private — never put real patient data in the repo |
| **Vite env vars** | Prefixing `SUPABASE_SERVICE_ROLE_KEY` or an LLM key with `VITE_` | Only the *anon* key may be client-side; everything else in Edge Function/Actions secrets |
| **Supabase (RLS)** | Leaving RLS off on child/junction tables and views | Enable RLS on every table; create views with `security_invoker`; add a CI guard |
| **Supabase (roles)** | Authorizing from `user_metadata` | Use `app_metadata`/custom claims or a roles table |
| **Supabase (free tier)** | Ignoring the 7-day idle pause | Scheduled keepalive ping or Pro plan before external reviewers |
| **Supabase (storage)** | Public buckets for licence/medical documents | Private buckets + signed, time-limited URLs |
| **Supabase (Edge Functions)** | Embedding secrets in the function source / repo | Use function secrets; never commit keys |
| **PNMC / PM&DC registries** | Treating the uploaded card as proof | Look the professional up in the official register by CNIC; record result + expiry |
| **SHCC registration** | Assuming a "platform" is exempt | Home-care provision is an HSP/HCE activity; confirm registration requirements in the SEIC Law session |
| **Payments (PK rails)** | Building escrow without a licensed PSP | Keep money out of the platform for MVP; charge commission separately |
| **Keepalive cron** | Ping that requires an authenticated endpoint and fails silently | Ping an unauthenticated health/read endpoint; alert if it fails |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Client-side image/PDF uploads at full resolution | Storage fills, slow page loads, egress spikes | Downscale images before upload; cap file sizes; serve thumbnails | Storage nears 1 GB free-tier cap; egress nears 5 GB |
| RLS policies that JOIN the source table | Queries slow as rows grow | Rewrite as `col in (select ... where user_id = (select auth.uid()))` | Around tens of thousands of rows / large team tables |
| Fetching entire tables then filtering in React | App feels fine in dev, slow with data; also risks over-exposure | Filter in the query with pagination; rely on RLS, not client filters | A few hundred/thousand rows, or on mobile networks |
| N+1 booking/patient joins from the client | Spiky latency per screen | Single query with joins/views (RLS-safe), or an Edge Function aggregation | Dozens of bookings per screen |
| Unbounded realtime subscriptions | 200 peak-connection free-tier ceiling reached; messages dropped | Use realtime only where it adds value (visit status); poll elsewhere | ~200 concurrent connections |
| Edge Function per tiny request | Burns 500k/month invocation quota fast | Batch reads/writes into fewer functions | High-frequency polling or chatty clients |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| RLS disabled/absent on any table | Public read/write of patient & credential data via anon key | Enable RLS everywhere + CI guard that no public table lacks RLS |
| `service_role`/secret key in the client bundle or repo | Total DB bypass; full exfiltration | Server-only secret; secret scanning + push protection; rotate on exposure |
| Views over protected tables | Silent bypass of RLS (views run as definer) | `security_invoker = true` or avoid views; test as anon |
| `user_metadata` used for roles | Privilege escalation via self-edited metadata | Use `app_metadata`/custom claims or a roles table |
| Public storage buckets for credentials/medical docs | CNICs, licences, records world-readable (PECA s.38) | Private buckets + signed URLs; least-privilege storage policies |
| No consent capture for health data | No lawful basis; criminal exposure | Explicit versioned consent before collecting health info |
| Admin actions enforced only in the UI | Any authenticated user performs privileged ops | Server-side checks in RLS/Edge Functions |
| Real patient data in seed files/screenshots/issues | Public exposure via a public Pages repo/history | Fictional seed data; scrub before commit; secret scanning |
| Overly permissive CORS / open Edge Functions | Abuse of your functions and quotas | Restrict allowed origins; require auth where appropriate |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Trusting uploaded credentials visually | Patients harmed by unqualified staff | Show a *registry-verified* badge with clear meaning; verify before listing |
| No verification status transparency | Families can't tell verified from pending staff | Publish the verification policy; display badge + "what we checked" |
| Booking with no confirmation/visit record | Family has no idea who is coming or what happened | Send confirmation with staff identity badge; show a visit record after |
| No-show with no recourse | Fragile patient left unattended | Grace period, auto-free-cancel, patient-side compensation, staff penalties |
| Deep links that 404 on share/refresh | Mentors and patients hit "Page not found" | 404.html fallback + correct base/basename; use `<Link>` internally |
| Empty review sections / fake-feeling polish | Low trust, hurts conversion | Launch reviews after ~20 completed sessions; show real completed-visit counts |
| Emergency path buried or absent | Life-threatening delay | Prominent SOS with location; "call emergency number first" guidance |
| Both sides asked for too much upfront | Drop-off in signup/booking | Progressive profiling; collect only what the visit needs |
| Opaque pricing/commission | Distrust, disputes | Publish commission, cancellation and refund terms plainly |

## "Looks Done But Isn't" Checklist

- [ ] **Deploy:** A non-root route (e.g. `/happy-health/staff/onboarding`) refreshes and deep-links without a 404 — verify directly on the deployed URL, not locally.
- [ ] **Base paths:** Deployed assets load from `/happy-health/assets/...` (not root) — verify in the built `dist/index.html`.
- [ ] **Routing:** No internal navigation uses `<a href>` — grep for `<a ` in components.
- [ ] **Secret hygiene:** Browser bundle contains *no* `service_role`/LLM key — verify by grepping the built JS and the DevTools Network tab.
- [ ] **Repo hygiene:** `.env` is gitignored and never committed to any branch — verify with `git log --all -- .env`.
- [ ] **RLS:** Every `public` table has RLS enabled and at least one policy — verify by querying `pg_tables`/`pg_policies`.
- [ ] **RLS negative test:** With only the anon key, another user's patient row returns 0 rows — verify with `curl`.
- [ ] **Views:** Any view is `security_invoker` — verify a policy-protected table is not leaked through a view.
- [ ] **Roles:** Roles come from `app_metadata`/claims or a roles table, not `user_metadata` — verify a self-edited metadata field cannot grant admin.
- [ ] **Staff onboarding:** "Verified" badge only appears after a recorded registry check — verify by attempting to book a `pending` staff member.
- [ ] **Credential expiry:** A lapsed licence auto-flags/suspends the staff member — verify by setting an expiry in the past.
- [ ] **Storage:** Credential/medical documents are in a private bucket reachable only via signed URL — verify by opening the raw URL logged-out.
- [ ] **Consent:** Health data cannot be submitted without a versioned consent record — verify in the DB.
- [ ] **Patient isolation:** A nurse sees only assigned patients — verify by logging in as a staff account.
- [ ] **Liability boundary:** Service catalogue enforces the in-scope/out-of-scope list — verify excluded services cannot be booked.
- [ ] **Payments:** No platform-held funds before a licensed PSP is integrated — verify commission is tracked, not escrowed.
- [ ] **Free-tier health:** Project has not paused (>7 days idle) and usage <80% of quota — verify in the Supabase dashboard; keepalive runs.
- [ ] **Commercial-use:** Production (paid) site is not on GitHub Pages — verify the policy decision before first transaction.
- [ ] **Admin ops:** Credential approval / refund / suspension run server-side — verify the action fails for a non-admin via the API, not just the UI.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| SPA deep-link 404 on Pages | LOW | Add `cp dist/index.html dist/404.html` to the workflow; fix base/basename; redeploy |
| Blank deployed page from wrong base | LOW | Set `base` + router `basename`; rebuild; verify asset URLs |
| Leaked `service_role`/LLM key in bundle or git | HIGH | Rotate the key immediately (assume compromised), purge from `.env`, add secret scanning; if in git history, rewrite history or accept rotation as mitigation |
| RLS gap on a live table | HIGH | Enable RLS + policies, run the negative test, audit access logs for prior exposure, notify affected users if data was readable |
| Fake/unverified staff discovered | HIGH | Suspend immediately, re-verify the entire roster against PNMC/PM&DC, notify affected patients, review checks; treat as an incident |
| Patient safety incident | HIGH | Immediate patient care/escalation, document everything, incident report, suspend staff pending review, legal consultation (SEIC Law), decide disclosure |
| Health-data breach / unconsented sharing | HIGH | Contain access, rotate credentials, document scope, consult on PECA s.38 exposure, notify affected individuals, tighten RLS/consent |
| Trust erosion from no-shows | MEDIUM | Compensate affected patients, enforce staff penalties, add grace period + auto-cancel, tighten supply vetting |
| Commission uncollectable (cash direct) | MEDIUM | Move to invoice/wallet prepay or booking deposit; publish policy; chase via records |
| Supabase project paused before demo | LOW | Unpause in dashboard; add keepalive; consider Pro before external reviewers |
| Scope creep has consumed the timeline | HIGH | Freeze feature work, ship the single V1 outcome manually (concierge), rebuild roadmap around the validated booking |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| GH Pages SPA deep-link 404 / base path | P1 | Refresh a non-root deployed route → renders, no 404; asset URLs show `/happy-health/` |
| GH Pages commercial-use violation | P7 | Production (paid) site hosted off Pages; Pages used only for SEIC/demo |
| Supabase RLS misconfiguration / leaked data | P2 | Anon-key `curl` for another user's row returns 0 rows; CI guard: no public table without RLS |
| Leaked service/LLM keys (Vite + public repo) | P1 → re-audit P2/P6 | Bundle & git history contain no `service_role`/LLM key; secret scanning on |
| Superficial credential verification | P3 → enforced P5 | No `pending` staff bookable; registry check recorded; lapsed licence auto-flags |
| Health-data consent/privacy (PECA s.38) | P2/P4 → P7 | Health data rejected without versioned consent; privacy notice live; breach runbook exists |
| Patient safety / liability for at-home procedures | P4 → P5 → P7 | Scope list enforced in catalogue; per-visit record + SOS exist; legal review done in SEIC |
| Trust & safety: fake staff, no-shows, off-platform | P3 → P5 | ID+liveness check recorded; session logging + no-show policy enforced; in-app-only comms |
| Payments/refunds without escrow | P4 → P6 | Commission tracked per completed booking; published cancellation/refund policy; no held funds |
| Free-tier limits / paused project | P1 → P2/P3 → P7 | Usage <80% of quotas; keepalive green; upload size caps in place |
| Scope creep (solo founder, 6 months) | All (set at P1) | V1 = one critical outcome; kill list published; ≤1 core workflow in flight; 4–6 wk increments |
| Multi-role access done ad hoc | P2 → P5 | Role-matrix test passes; admin ops reject non-admin via API; roles from claims not metadata |

## Sources

- **GitHub Pages limits** (official) — https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits — 1 GB site, 100 GB/mo bandwidth, 10 builds/hr, 10-min timeout, and the "not intended for commercial/e-commerce/SaaS" clause. (HIGH)
- **GitHub Pages usage/product limits & Actions minutes** (official) — https://docs.github.com/en/billing/reference/product-usage-included and https://docs.github.com/github/working-with-github-pages/creating-a-github-pages-site (public repo requirement; Pages public even when repo private). (HIGH)
- **rafgraph/spa-github-pages** — https://github.com/rafgraph/spa-github-pages (404.html redirect pattern, `pathSegmentsToKeep`). (MEDIUM)
- **Vite: Env Variables and Modes** (official) — https://vite.dev/guide/env-and-mode and **Shared Options `envPrefix`** — https://vite.dev/config/shared-options — `VITE_*` is bundled and must not hold secrets. (HIGH)
- **Debloying Vite React + React Router to GitHub Pages** — https://blog.paulserban.eu/post/deploy-vite-react-with-react-router-app-to-github-pages/ (base + basename pitfalls). (MEDIUM)
- **Stack Overflow: 404 on refresh with SPA React Router on GitHub Pages** — https://stackoverflow.com/questions/63462828 (copy index.html→404.html). (MEDIUM)
- **Supabase RLS guide & performance guide** (official) — row-level-security.mdx, security-definer helper + `REVOKE EXECUTE`, views bypass RLS, policy-join performance. (HIGH)
- **Supabase Custom Claims & RBAC / token security** (official) — custom claims, `app_metadata`, RLS recursion error 42P17. (HIGH)
- **Supabase pricing / free plan quotas** (official) — https://supabase.com/pricing — 500 MB DB, 5 GB egress, 1 GB storage, 50k MAU, 500k edge invocations, 10 functions, 7-day pause. (HIGH)
- **SHCC (Sindh Healthcare Commission)** (official) — https://shcc.org.pk/licensing/, /faqs-reg-licen/, DLA SOP, SHCC Act 2013 §13/§14 — HSP registration + HCE licensing, PKR 500,000 fines. (HIGH)
- **PNMC (Pakistan Nursing & Midwifery Council)** (official) — https://pnmc.gov.pk/ and https://online.pnmc.gov.pk (licence verification register by CNIC; Act amendment 2023). (HIGH)
- **Pakistan digital health law / data protection** — ICLG Pakistan Digital Health 2024; DLA Piper Data Protection Laws of the World (Pakistan); Chambers Data Protection & Privacy 2026 — PECA 2016 §38 (3 yrs / PKR 1m), PDP Bill 2023/draft PDA 2025 not enacted, health data = sensitive, consent-only basis today. (MEDIUM)
- **Papa trust & safety transparency + Bloomberg coverage** — Fierce Healthcare (2023–2024) — background/credential-check failures, mandatory training, identity verification, emergency button. (MEDIUM)
- **Care.com vetting failure investigation** — WTSP 10 Investigates (2024) — bad actor circumvented background checks via aliases/fake business. (MEDIUM)
- **EVV / buddy-punching post-mortems** — Marketplace & The Guardian (2021), CareCade (2026) — GPS-only verification defeated by credential sharing; face/liveness needed; missed-pay harms. (MEDIUM)
- **Pakistan marketplace payment/refund policies** — ANOC, Qare, Kamkar, AbhiLaya, Looks (public Terms/Service Policies) — platforms avoiding fund custody; commission-only-on-completed-jobs; refund liability disclaimed. (MEDIUM)
- **Solo-founder MVP / marketplace cold-start** — a16z (Andrew Chen), NFX, Y Combinator (Michael Seibel), Idea Score, Cadence — concierge/single-sided MVP, seed the hard side, pick one workflow, kill list. (MEDIUM)

---
*Pitfalls research for: Home care medical services marketplace (Pakistan-first)*
*Researched: 2026-10-15*
