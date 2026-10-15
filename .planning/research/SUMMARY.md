# Project Research Summary

**Project:** Happy Health
**Domain:** Home-care medical services marketplace / booking platform (Pakistan-first, Karachi pilot)
**Researched:** 2026-10-15
**Confidence:** MEDIUM-HIGH (HIGH on stack + Supabase architecture patterns; MEDIUM on feature synthesis, regulatory status, and Pakistan notification channels)

## Executive Summary

Happy Health is an on-demand home-care marketplace that connects patients in Pakistan to **verified** nurses, doctors (home visits), and rentable medical equipment — with a 6-month SEIC incubation forcing weekly, mentor-visible progress. Experts build this class of product as a **concierge, manually-operated marketplace first**: a single-sided buyer surface plus operator-driven matching, with supply (credential-verified nurses) hand-seeded in one city before demand is pulled. The technology is deliberately small — a static React (Vite + TypeScript) SPA on GitHub Pages talking to Supabase (Postgres, Auth, Storage, Edge Functions, Realtime) — but the **domain is regulated healthcare with vulnerable patients**, so verification, consent, and incident handling are first-class features, not paperwork.

The recommended approach concentrates all security in the database. The frontend is an untrusted, world-readable static bundle holding only the Supabase publishable key; **Row Level Security is the entire security model**, every booking/credential/role rule is enforced by Postgres (RLS policies + a DB-enforced booking state machine + append-only audit), and anything secret-bearing (email, SMS, admin invites, scheduled jobs) lives in Supabase Edge Functions. The stack is pinned and verified: React 19.3.1, TypeScript 6.0.3 (not 7.x — `typescript-eslint` caps at `<6.1.0`), Vite 8.3.4, `react-router` 8.4.0 (`react-router-dom` was removed), Tailwind v4, TanStack Query, react-hook-form + Zod, Leaflet + OSM (no API key), and Resend for email. GitHub Pages' static-only constraint dictates the two structural workarounds: a `base: '/happy-health/'` + `404.html`/`HashRouter` SPA fallback, and Supabase-as-backend.

The dominant risks are **operational and legal, not code**: (1) misconfigured/absent RLS or a leaked `service_role` key exposes every patient and credential record; (2) superficial credential verification (trusting an uploaded licence card rather than checking the PNMC/PMDC public registers) creates patient-safety, quackery, and liability exposure; (3) no explicit consent for sensitive health data is a PECA 2016 §38 criminal exposure; and (4) solo-founder scope creep over six months, building a two-sided marketplace before one paid booking is proven. Two platform-level risks must be planned for now: GitHub Pages **prohibits commercial use** (so the paid production site must move off Pages before the first transaction), and Supabase's free tier **pauses projects after ~7 days idle** (so a keepalive is required before mentors/reviewers use a cold link). Mitigations are concrete and phase-mapped below.

## Key Findings

### Recommended Stack

The stack is pre-constrained by the founder and verified against live npm registry + official docs on 2026-10-15 (see `STACK.md`). The one non-obvious pin: **TypeScript stays at 6.0.3** because `typescript-eslint@8.71.2` peer-caps it at `<6.1.0`; do not adopt TS 7.x yet. Routing is the other trap: **React Router v8 removed the `react-router-dom` package** — install `react-router`, import `RouterProvider` from `react-router/dom`. GitHub Pages conflicts are all solved workarounds (documented in Phase 1): `base: '/happy-health/'`, a `404.html` copy (or `HashRouter`), Edge Functions instead of any Express/Node server, and strict `VITE_*` hygiene (only the anon key may be client-side). Notifications layer in-app (Realtime) → email (Resend) → web push (deferred) → SMS/WhatsApp (provider TBD — a real gap for Pakistan).

**Core technologies:**
- **React 19.3.1 + react-dom 19.3.1** — UI; must be the *exact* same version (React 19 throws otherwise)
- **Vite 8.3.4** — build/dev server; ships Rolldown (Rust); `base` config solves the GitHub Pages subpath
- **TypeScript 6.0.3** — type checking; pinned below 6.1 for lint compatibility
- **react-router 8.4.0** — routing; `react-router-dom` no longer exists
- **@supabase/supabase-js 2.117.3 + Supabase CLI 2.121.0** — DB/Auth/Storage/Realtime/Functions client + migrations/deploy
- **@tanstack/react-query 5.104.2** — server-state cache/refetch/optimistic updates for every Supabase read/write
- **react-hook-form 7.90.0 + zod 4.6.7** — forms + one shared schema for client and Edge Function validation
- **tailwindcss 4.3.3 (+ @tailwindcss/vite) + shadcn** — styling and owned, accessible components
- **leaflet 1.9.4 + react-leaflet 5.0.0** — maps with OpenStreetMap tiles; zero cost, no API key
- **date-fns 4.4.0 + date-fns-tz 3.2.0** — store UTC, render `Asia/Karachi` (critical for booking windows)
- **resend 6.33.0** — transactional email from an Edge Function (free tier: 100/day, 3,000/mo)
- **vitest 5.0.4 + @testing-library/react 16.3.3** — tests; **eslint 10.x + typescript-eslint 8.71.2 + prettier** — lint/format
- **Deferred/optional:** `i18next`/`react-i18next` (Urdu/RTL, v1.x), `vite-plugin-pwa` + `web-push` (push, later)

### Expected Features

Full detail in `FEATURES.md`. v1 = the earliest milestone: the SEIC assignments structure **plus** the most basic platform slice that proves the concept — *a patient can request a service and an admin can onboard + assign verified staff*. The critical dependency spine: **booking requires catalog + auth; staff assignment requires credential verification; notifications require the status lifecycle; reviews require completed bookings; equipment lifecycle requires deposits/billing + availability.**

**Must have (table stakes, V1):**
- Service catalog (nursing / doctor home visit / equipment) with indicative pricing — **V1**
- Booking **request** flow (service → date/time → address → patient details) — **V1** (a request, *not* an instant-slot engine)
- Auth / accounts (patient + staff) via Supabase — **V1** (phone OTP preferred by users but needs a paid SMS provider; email+password acceptable to start)
- Pakistan-style address capture (City → Area → House → Street → **landmark**) — **V1**, Karachi-first
- Staff onboarding (PNMC/PMDC registration number, CNIC, CV/experience, services, city, **gender**) — **V1**
- Staff profile (photo, credentials summary, experience, service area) — **V1**
- Credential / licence verification (**admin manual** check against the public register) — **V1**
- Booking status lifecycle (requested → confirmed → assigned → in-progress → completed/cancelled) — **V1**
- Admin dashboard (view/verify staff, assign staff, confirm/cancel) — **V1** (the operator *is* the assignment engine)
- Minimal notifications (email + "chat on WhatsApp" link on key transitions) — **V1**
- Human support channel (visible phone number + WhatsApp deep-link) — **V1**
- Equipment catalog + request form (manually fulfilled) — **V1**
- Payment stated as **cash on completion** + a paid/unpaid admin flag — **V1**
- Basic trust signals ("Verified" badge + shown registration number) — **V1**

**Should have (competitive differentiators, V1):**
- **Registry-backed credential verification** — the single highest-leverage differentiator; turns "verified" into a claim a patient can trust (manual at v1, assisted/expiry-tracked at v1.x)
- **Concierge / assisted booking** — matches how Pakistani families actually buy care (trust + referrals); the admin dashboard is the matching engine
- **Female-staff / gender-preference matching** — culturally decisive; small data-model change, large conversion effect

**Add after validation (v1.x):** WhatsApp Business API notifications · ratings & reviews (blind/double-sided, only after ~20 completed bookings) · staff availability calendar · online payments (JazzCash/Easypaisa) · family/care portal · equipment rental fulfillment · Urdu/bilingual UI · registry-assisted verification with expiry.

**Defer (v2+):** care packages / subscriptions (12h/24h shifts) · serialized equipment-rental lifecycle · native mobile apps · multi-city expansion · automated/AI matching · escrow / split payouts.

**Anti-features (deliberately NOT building):** full EHR/clinical records · payments/escrow at MVP · in-app real-time chat · native apps at launch · advanced search/ranking · AI matching · multi-vendor cart · public reviews at launch · US-style EVV/HIPAA/insurance billing · multi-city at launch · "real-time everything."

### Architecture Approach

One idea drives the whole design (see `ARCHITECTURE.md`): **the frontend is a static, untrusted, world-readable bundle with only a publishable key — the database is the security boundary, not the client.** Every authorization rule, role check, and state transition must be enforceable by Postgres/RLS alone; anything needing a secret or the service-role key *must* live in an Edge Function, because GitHub Pages cannot run server code. Authorization uses `SECURITY DEFINER` helpers in a `private` schema (`private.is_admin()`, `private.has_role()`) with `REVOKE EXECUTE` from `anon`/`authenticated` — this avoids the `42P17` RLS-recursion failure and per-row subquery cost. Roles live in `profiles.role` (never `user_metadata`); a Custom Access Token Hook mirrors the role into `app_metadata` for client routing only, while RLS always reads the live value.

**Major components:**
1. **Client SPA (GitHub Pages)** — rendering, routing, form state, optimistic UI; calls Data API/Storage/Realtime *as the user* through a single `lib/api/*` typed layer
2. **Supabase Auth** — identity, sessions, JWT, phone OTP; Custom Access Token Hook injects the role claim
3. **Postgres `public` schema** — all domain data + RLS policies; **`private` schema** — security-definer helpers, excluded from the API
4. **Triggers / state machine** — `BEFORE UPDATE` booking-transition whitelist + `AFTER UPDATE` append-only `booking_events` audit
5. **Storage** — private `credentials` bucket, folder-scoped RLS (`{auth.uid()}/…`), short-TTL signed URLs for admin review
6. **Edge Functions (Deno)** — the only place secrets exist: `notify` (email/SMS), `admin-invite`, scheduled jobs
7. **Realtime + pg_cron + pg_net** — live booking status pushes; time-based reminders / no-show / licence-expiry sweeps
8. **GitHub Actions** — build + deploy SPA to Pages on push to `main`

**Data model spine:** `auth.users 1─1 profiles 1─1 {patient_profiles | staff_profiles}`; `staff_profiles 1─* credential_documents`; `profiles *─* bookings *─1 services`; `bookings *─1 {equipment?, staff_profiles?}` + `*─* booking_events`. Worth defending: `address_snapshot` copied onto the booking (not a live FK), `booking_events` from day one, and licence data kept out of `profiles` (patients must never be able to `select` a licence number — expose an approved-only public view).

### Critical Pitfalls

Top pitfalls from `PITFALLS.md` (11 documented; these five are most consequential):

1. **Supabase RLS misconfiguration leaks patient health data** — RLS is **off by default**; views bypass it (run as definer); `user_metadata` and a client-side `service_role` key are self-elevation/self-exposure. *Avoid:* default-deny on every table, three roles (anon → catalog only; authenticated → `auth.uid()`-scoped; service_role → Edge Functions only), `SECURITY DEFINER` helpers with `REVOKE EXECUTE`, a CI guard that fails if any `public` table lacks RLS, and an anon-key negative test.
2. **Leaking secrets through Vite env vars + a public Pages repo** — Vite bundles every `VITE_*` var into public JS, and Pages sites are public even when the repo is private. *Avoid:* only the **anon/publishable** key may be `VITE_`; all other secrets live in Edge Function secrets + GitHub Actions secrets; `.gitignore` `.env` before the first commit; enable secret scanning + push protection; rotate on any exposure.
3. **GitHub Pages is SPA-hostile and commercially restricted** — deep links 404, wrong `base`/`basename` yields a blank deployed page (invisible in `npm run dev`), and GitHub's limits forbid using Pages for a commercial/e-commerce/SaaS site. *Avoid:* `base: '/happy-health/'` + router `basename`, copy `dist/index.html → dist/404.html` (or `HashRouter`), `<Link>` for all navigation, and **move the paid production site off Pages before the first commission transaction**.
4. **Superficial credential verification — the card is not the credential** — file-upload + self-declared number lets forged/expired/borrowed licences through; in Sindh this is quackery/negligence exposure. *Avoid:* a verification *state machine* with audit trail, **look the person up in the official PNMC (by CNIC) / PMDC (by reg number) register**, store licence expiry and auto-suspend on lapse, private documents + signed URLs, and a published verification policy.
5. **No consent / privacy notice / breach plan for sensitive health data** — Pakistan's comprehensive law is still a draft, but **PECA 2016 §38** already criminalises unauthorised disclosure (up to 3 years and/or PKR 1m). *Avoid:* explicit, timestamped, versioned consent before collecting health data; data minimisation; field-level access by assignment; a one-page breach-response runbook; and never put real patient data in the public repo.

Also critical: **solo-founder scope creep** (build one V1 outcome; publish a kill list; ≤1 core workflow in flight; 4–6-week increments) and **free-tier limits** (Supabase pauses after ~7 days idle — add a keepalive; watch the 500 MB DB / 1 GB storage / 5 GB egress quotas; build via a custom Actions workflow to escape the 10 builds/hr limit).

## Implications for Roadmap

Research converged on a **dependency-driven build order** with one strategic opinion added: **seed the harder side (verified nurse supply) early**, because the marketplace fails on trust and liquidity, not on UI. The suggested structure harmonizes the build order in `ARCHITECTURE.md` (Phases 0–8) with the phase mapping in `PITFALLS.md` (P1–P7). Two phases (Assignments/Deploy and Supabase Foundation) are independent and can run in parallel.

### Phase 1: Assignments Site & Deploy Pipeline
**Rationale:** The nearest milestone and the only one with no Supabase dependency — ships mentor-visible value this week (REQ-ASG-01/02) and establishes the deploy pipeline every later phase rides on.
**Delivers:** dated Mon/Wed/Fri `assignments/` folder structure + mentor README entry point; Vite/React app shell deployed to GitHub Pages via Actions; correct `base` + `basename`; `404.html`/`HashRouter` fallback; `.gitignore` + secret-scanning hygiene; deploy keepalive.
**Addresses:** REQ-ASG-01, REQ-ASG-02, REQ-PLAT-06.
**Avoids:** Pitfall 1 (SPA 404 / wrong base), Pitfall 3 (secret leakage), Pitfall 9 (paused project / build limits).
**Research flag:** standard patterns — skip deep research.

### Phase 2: Supabase Security Foundation
**Rationale:** Every later policy calls `private.*` and the role model; building tables before this means rewriting policies. Retrofitting RLS after patient data exists is a rewrite. Runs in parallel with Phase 1.
**Delivers:** Supabase project + migration baseline; role enums (`patient`/`staff`/`admin`); `profiles` table + `handle_new_user` trigger; `private.*` `SECURITY DEFINER` helpers with `REVOKE EXECUTE`; Custom Access Token Hook; RLS on `profiles`; first admin seeded; Auth (email/password).
**Uses:** Supabase Auth + RLS approach from STACK.md; security-definer pattern from ARCHITECTURE.md.
**Implements:** the "database is the security boundary" architecture.
**Avoids:** Pitfall 2 (RLS misconfiguration), Pitfall 11 (ad-hoc multi-role access), and lays the consent/audit foundation for Pitfall 5.
**Research flag:** standard, well-documented Supabase patterns — skip deep research.

### Phase 3: Service Catalog & Public Surface
**Rationale:** `bookings` foreign-key to `services`/`service_areas`, and both patient booking and staff service-selection read the catalog. Public-read/admin-write is a small, well-understood surface.
**Delivers:** `services`, `equipment`, `service_areas` tables; public read + admin write policies; admin CRUD screens; the patient-facing catalog page (nursing / doctor visit / equipment with copy + indicative price).
**Addresses:** service catalog (table stakes), equipment catalog listing.
**Avoids:** Pitfall 10 (keep it a static catalog — no search engine, no availability engine).
**Research flag:** standard CRUD — skip deep research.

### Phase 4: Staff Onboarding & Credential Verification
**Rationale:** *Supply-first is the strategic call.* Verification is the trust foundation and the highest-leverage differentiator; building it early avoids retrofitting onto live data, and the concierge model needs a seeded pool of verified nurses before demand. The verification pipeline must exist before any assignment UX can make sense.
**Delivers:** `staff_profiles` + `credential_documents` tables with RLS; private `credentials` storage bucket + folder-scoped policies; staff application/upload UI; verification **state machine** (`submitted → docs_received → registry_checked → id_verified → approved | rejected`) with audit; licence-expiry field; admin review queue with link-out to PNMC/PMDC registers and a "verified against register" record.
**Addresses:** staff onboarding, staff profile, credential verification (manual V1), gender capture.
**Avoids:** Pitfall 4 (superficial verification), Pitfall 7 (fake staff), plus the private-bucket element of Pitfall 2.
**Research flag:** **needs deeper research** — no automated PNMC/PMDC API (manual registry workflow), identity/liveness verification vendor selection, and SHCC/HSP registration requirements for the operating entity (resolve in the SEIC Law session).

### Phase 5: Patient Booking Flow
**Rationale:** Depends on catalog (Phase 3) and Auth (Phase 2). Ships the core transaction — the literal "basic booking" in the founder's v1 focus — while relying on the admin to confirm/assign manually.
**Delivers:** `bookings` + `booking_status` enum + `BEFORE UPDATE` transition trigger + `booking_events` audit + patient RLS; booking-request wizard (service → date/time → Pakistan-style address → patient details, address validated against `service_areas`); "my bookings" view with Realtime; completion record.
**Addresses:** booking request flow, address capture, booking status lifecycle, patient booking RLS.
**Avoids:** Pitfall 10 (a *request*, not a slot/routing engine), Pitfall 8 (cash-on-completion + completion records, no held funds).
**Research flag:** standard patterns (state machine + RLS documented in ARCHITECTURE.md) — skip deep research.

### Phase 6: Admin Ops Console & Assignment
**Rationale:** Needs approved staff (Phase 4) and bookings (Phase 5) to exist. This is where the operator becomes the algorithm: verify/approve staff, confirm bookings, assign staff, oversee the lifecycle timeline.
**Delivers:** verification queue UI + approve/reject actions (server-enforced); booking oversight timeline (from `booking_events`); staff-to-booking assignment guarded by the "approved only" trigger; catalog admin; the **minimal** in-app notification feed.
**Addresses:** admin dashboard, staff assignment, minimal notifications, human support / concierge matching.
**Avoids:** Pitfall 11 (admin actions server-side, never UI-only), Pitfall 7 (assignment gated on verification).
**Research flag:** standard patterns built on Phases 2–5 — skip deep research.

### Phase 7: Notifications & Scheduled Automation
**Rationale:** Additive, not blocking — the app must complete an end-to-end booking *without* email wired. Deliberately after the core flows so Resend/SMS setup never blocks the first booking.
**Delivers:** `notify` Edge Function (Resend email via React Email templates); `admin-invite` (service_role); `pg_cron` + `pg_net` scheduled jobs (reminders, no-show detection, licence-expiry sweep); notification fan-out trigger on booking state changes.
**Addresses:** notifications (v1 minimal → v1.x), status-transition notifications.
**Avoids:** Pitfall 8 (publish cancellation/no-show/refund policy alongside), Pitfall 9 (batch work, not per-request functions).
**Research flag:** **needs deeper research** — WhatsApp Business API / Pakistan SMS provider selection (the largest unresolved gap for the target market), Resend domain/SPF-DKIM setup, pg_cron↔Edge Function auth.

### Phase 8: Trust/Safety & Compliance Hardening
**Rationale:** A phase, not a vibe — the safety net for the entire security model, and the point at which the legal/compliance posture is formalised before a public pilot.
**Delivers:** RLS **role-matrix test suite** (assert patient↔patient isolation, staff sees only assigned patients, non-admin cannot flip role); consent capture + privacy notice + retention/deletion paths; incident-reporting + SOS + scope-limited catalogue enforcement; breach-response runbook; **commercial-host migration plan** (off GitHub Pages) and free-tier/plan review.
**Addresses:** patient safety/liability, consent/privacy, trust & safety, compliance.
**Avoids:** Pitfall 5 (consent/PECA), Pitfall 6 (safety/liability), Pitfall 1 (commercial-use violation), Pitfall 9 (quotas).
**Research flag:** **needs deeper research** — PDPB 2023 / draft PDA 2025 status (not enacted; data-localisation risk — Supabase has no Pakistan region), PECA §38 exposure, SHCC licensing, professional-indemnity expectations.

### Phase Ordering Rationale

- **Deploy/shell (1) and security foundation (2) are foundational and parallelizable** — nothing depends on the app being *featured*, but every later phase depends on the role model and the deploy pipeline.
- **Catalog before booking** is a hard dependency (`bookings` FKs `services`/`service_areas`).
- **Supply-first (staff onboarding before patient booking)** is the opinionated synthesis call: the research's strongest strategic insight is that marketplace liquidity and trust fail first, so seed verified nurse supply before pulling demand. (If the founder prefers demand-first, Phases 4 and 5 can swap — there is **no technical dependency** forcing the relative order of staff onboarding vs. patient booking, only the strategic one.)
- **Admin console after both sides exist** because assignment requires approved staff *and* an open booking.
- **Notifications last among core phases** so Resend/SMS never blocks the first end-to-end booking.
- **Hardening is explicit** because RLS correctness, consent, and incident handling are the failure modes that end a healthcare venture — not missing features.
- This ordering directly neutralises the research's top pitfalls: security first (Pitfall 2/11), verification before assignment (Pitfall 4/7), cash-only + completion records (Pitfall 8), and scope discipline throughout (Pitfall 10).

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4 (Staff Onboarding & Verification):** no PNMC/PMDC API — manual registry workflow; identity/liveness vendor; SHCC/HSP licensing.
- **Phase 7 (Notifications & Automation):** WhatsApp Business API / Pakistan SMS provider (major unresolved gap); Resend deliverability setup; pg_cron↔Edge Function wiring.
- **Phase 8 (Trust/Safety & Compliance):** PDPB status is a moving target; PECA §38 exposure; commercial-host migration timing.

Phases with standard patterns (skip research-phase):
- **Phase 1** — GitHub Pages + Vite deploy is extensively documented.
- **Phase 2** — Supabase Auth/RLS/RBAC patterns are official and well-covered.
- **Phase 3** — standard public-read/admin-write CRUD.
- **Phase 5** — booking state machine + RLS documented in ARCHITECTURE.md.
- **Phase 6** — composes Phases 2–5; no new external unknowns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | **HIGH** | Every version live-checked against the npm registry on 2026-10-15; React Router v8 / TS-cap / Vite 8 / GitHub Pages behaviors corroborated by official docs. MEDIUM only on notifications (Resend/React Email) and maps specifics. |
| Features | **MEDIUM** (HIGH on credential verification) | Feature set cross-verified across Pakistani (Qare, Sehat Kahani, Dawaai, Marham), Indian (Portea, Nightingales), and generic marketplace playbooks; credential-verification items corroborated by official PNMC/PMDC/SHCC sources (HIGH). v1 scope itself is a judgment call. |
| Architecture | **HIGH** (Supabase patterns) / MEDIUM (regulatory, scheduling) | RLS/RBAC/storage/Edge-Function patterns are official Supabase guidance; the Pakistan regulatory state and the availability/scheduling synthesis are MEDIUM. |
| Pitfalls | **MEDIUM-HIGH** | Official GitHub/Supabase/Vite/GitHub Pages/SHCC/PNMC sources are HIGH; community post-mortems and the draft-law status are MEDIUM. |

**Overall confidence:** **MEDIUM-HIGH** — HIGH on the technical stack and architecture, MEDIUM on feature prioritisation, regulatory state, and Pakistan notification channels.

### Gaps to Address

Resolve during planning/execution; none block Phase 1–2:

- **WhatsApp / SMS provider (Pakistan):** the real national notification channel, and unresolved. Needs a paid provider + a decision on WhatsApp Business API vs. SMS. Handle in Phase 7 research; keep a "chat on WhatsApp" link as the v1 stopgap.
- **Phone OTP login:** preferred by Pakistani users but requires a paid SMS provider — deferred; email+password acceptable at v1.
- **PNMC/PMDC verification workflow:** no public API — the admin queue must be designed around a human reviewer with link-outs and a recorded result + expiry. Research in Phase 4.
- **Identity + liveness verification:** vendor/approach not researched — needed to defeat account-sharing and fake staff (Phase 4/7).
- **PDPB 2023 / draft PDA 2025:** not enacted; signals health data = sensitive and a possible data-localisation requirement. Supabase has **no Pakistan region** — document the hosting region and flag localisation as an open risk (Phase 8).
- **SHCC registration / HSP licensing:** the operating entity likely needs registration to provide home-care services — confirm in the SEIC Law session (Phase 4/8).
- **Commission collection without holding funds:** design the invoice/wallet commission model (money stays out of the platform at MVP) (Phase 6/8).
- **GitHub Pages commercial-use limit:** plan and time the move to Cloudflare Pages / Netlify / Vercel **before the first paid transaction** (Phase 8).
- **Supabase free-tier pause + quotas:** add a keepalive before external reviewers; watch storage/egress; consider Pro pre-pilot (Phase 1/8).
- **Address geocoding accuracy in Pakistan:** Leaflet + OSM is the MVP choice; Google Maps is a deliberate later spend if accuracy becomes critical — unresolved tradeoff.
- **Equipment rental lifecycle:** genuinely differentiated but over-built for v1 — deferred to v2+; v1 ships catalog + request only.

## Sources

### Primary (HIGH confidence)
- **npm registry** (`npm view <pkg> version`, live-checked 2026-10-15) — all stack version numbers (STACK.md)
- **React Router v7→v8 upgrade guide / v8 release notes** (reactrouter.com, remix.run) — ESM-only, `react-router-dom` removal, React ≥19.2.7 floor
- **Supabase official docs** — Row Level Security, Custom Claims & RBAC, Custom Access Token Hook, Storage access control/ownership, Edge Function auth, Scheduling functions (pg_cron + pg_net + Vault), Phone Login/OTP, key model
- **GitHub official docs** — Pages limits (static-only, 1 GB site / 100 GB-mo / 10 builds-hr / commercial-use restriction), custom 404, Actions Pages deployment
- **Vite official docs** — Env variables & modes, `envPrefix`, `base` for GitHub Pages, official Pages workflow; **PostgreSQL official docs** — trigger-based state enforcement
- **PNMC** (`online.pnmc.gov.pk`) — public nurse verification by CNIC, Act 2023 §23 prohibition on employing unregistered nurses; **PMDC** (`pmdc.pk`) — doctor register by registration number; **SHCC** — HSP registration / HCE licensing

### Secondary (MEDIUM confidence)
- **Pakistan platforms** — Qare, Sehat Kahani, Dawaai, Marham, Nannzy, E-Tib, InstaCare (feature + payment/verification references)
- **India platforms** — Portea, Nightingales, HealthAtHome, MedRabbits (service breadth, equipment, care packages)
- **Marketplace & rental playbooks** — Sharetribe, Stripe, Leeonex, StudioScale, Rigby; Rentrax/Booqable/Reservety (equipment rental)
- **Failure evidence** — WIRED (Homejoy), Home Health Care News, Scaled and Failed (Honor vs HomeHero), Allen Cheng postmortems (anti-feature validation)
- **Trust & safety** — Fierce Healthcare/Bloomberg (Papa), WTSP (Care.com vetting failure), marketplace + Guardian (buddy-punching/EVV)
- **Pakistan payment/channel behaviour** — Releasit (COD), JazzCash gateway, eGrow/Kliovo (WhatsApp + COD)
- **Pakistan data protection** — ICLG / DLA Piper / Chambers — PECA 2016 §38, PDP Bill 2023 / draft PDA 2025 not enacted, consent-only basis today; Digital Rights Foundation analysis (localisation)

### Tertiary (LOW confidence — needs validation)
- **Sindh Healthcare Commission licensing specifics** (fines, HSP/HCE categories) — official source exists, application to a marketplace entity needs legal confirmation
- **PDPB localisation scope** — draft-only; monitor before relying on any interpretation
- **Pakistan SMS/WhatsApp provider pricing & eligibility** — not researched; validate in Phase 7

---
*Research completed: 2026-10-15*
*Ready for roadmap: yes*
