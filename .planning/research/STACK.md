# Stack Research

**Domain:** Home-care medical services booking platform (web, Pakistan-first) — nursing staff, doctor home visits, rentable medical equipment
**Researched:** 2026-10-15
**Confidence:** HIGH (core stack) / MEDIUM (notifications + maps specifics)

> Stack is pre-constrained by the founder: **React (Vite + TypeScript) + Supabase + GitHub Pages**.
> This document verifies current versions, fills the gaps (auth/RLS, storage, maps, notifications, CI/CD),
> and flags everything that fights GitHub Pages.

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| Node.js | 24.22.0 (LTS "Krypton") | Build/runtime for tooling | Current LTS; Vite 8 + Vitest 5 require Node ≥20.19/22.12. Pin major 24 for CI. | HIGH |
| React | 19.3.1 | UI library | Stable; required floor for React Router v8 (≥19.2.7) and react-leaflet 5. | HIGH |
| React DOM | 19.3.1 | DOM renderer | Must match `react` exactly (React 19 throws on version mismatch). | HIGH |
| TypeScript | 6.0.3 | Type checking (`tsc --noEmit`) | **Do NOT jump to TS 7.0.2 yet** — `typescript-eslint` peer-caps at `<6.1.0`. TS 6.0.3 is the newest line that keeps type-aware linting working. See "What NOT to Use". | HIGH |
| Vite | 8.3.4 | Build tool + dev server | Current major. Vite 8 ships **Rolldown** (`rolldown ~1.2.12`) as the bundler — fast Rust builds. `base` config solves GitHub Pages. | HIGH |
| @vitejs/plugin-react | 6.1.2 | React transform/HMR | Official Vite React plugin; peer `vite ^8.0.0`. (`@vitejs/plugin-react-swc` 4.3.3 is a faster drop-in if desired.) | HIGH |
| @supabase/supabase-js | 2.117.3 | DB, Auth, Storage, Realtime, Functions client | Single client for the whole backend. Browser-safe with the anon key + RLS. | HIGH |
| Supabase CLI | 2.121.0 | Local dev, migrations, Edge Function deploy | Needed to deploy Edge Functions and version the schema as migrations. | HIGH |
| react-router | **8.4.0** | Client-side routing | Current major. **v8 removed the `react-router-dom` package** — import from `react-router` and `react-router/dom`. v8 is ESM-only. | HIGH |

> **Routing gotcha (v8):** `react-router-dom@7.18.4` is now a legacy mirror held only for v6→v7 upgrades. In v8 you install `react-router`, import `RouterProvider` from `react-router/dom`, and everything else from `react-router`. `createBrowserRouter` + `RouterProvider` still work exactly as in v7.

### Supporting Libraries

| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| @tanstack/react-query | 5.104.2 | Server-state cache/fetch | Every Supabase read/write over the PostgREST API — caching, refetch, optimistic updates. Peer `react ^18 \|\| ^19`. | HIGH |
| @tanstack/react-query-devtools | 5.104.2 | Query debugging | Dev only. | HIGH |
| @tanstack/react-table | 9.3.1 | Admin data tables | Admin dashboards: bookings, staff, equipment, credential review queues. | MEDIUM |
| react-hook-form | 7.90.0 | Forms | Booking request, staff onboarding, equipment rental — all multi-field forms. | HIGH |
| @hookform/resolvers | 5.9.1 | RHF ↔ Zod bridge | Use with `zodResolver`. | HIGH |
| zod | 4.6.7 | Schema validation | Share one schema for client validation + Edge Function payload validation. | HIGH |
| tailwindcss | 4.3.3 | Styling | v4 CSS-first config; first-party Vite plugin, no `tailwind.config.js` needed. | HIGH |
| @tailwindcss/vite | 4.3.3 | Tailwind × Vite integration | Add `tailwindcss()` to `vite.config.ts`; `@import "tailwindcss";` in CSS. | HIGH |
| shadcn (CLI) | 4.21.5 | Component generator | Copies accessible Radix-based components into `src/components/ui`. Own the code, no runtime lock-in. | HIGH |
| lucide-react | 1.57.0 | Icons | Default icon set shipped with shadcn. | HIGH |
| clsx | 2.1.1 | Class composition | shadcn dependency. | HIGH |
| tailwind-merge | 3.7.0 | Class de-duplication | shadcn dependency (`cn()` helper). | HIGH |
| class-variance-authority | 0.7.1 | Component variants | shadcn dependency. | HIGH |
| sonner | 2.0.8 | Toasts | Booking confirmations, form errors, admin actions. | MEDIUM |
| react-day-picker | 10.0.2 | Date picker | Booking date/time selection (pairs with shadcn Calendar). | MEDIUM |
| date-fns | 4.4.0 | Date math/format | Booking windows, shift schedules. | HIGH |
| date-fns-tz | 3.2.0 | Timezone handling | **Critical for Pakistan** — store UTC, render `Asia/Karachi`. | HIGH |
| i18next + react-i18next | 26.4.5 / 17.0.16 | i18n (Urdu/English) | Add at MVP or first post-MVP phase; Pakistani users need Urdu/RTL support. | MEDIUM |
| leaflet | 1.9.4 | Map rendering | Free, no API key. See Maps section. | HIGH |
| react-leaflet | 5.0.0 | React bindings for Leaflet | **Requires React 19** (peer `react ^19`) — matches our React. | HIGH |
| vite-plugin-pwa | 2.0.0 | PWA / service worker / manifest | Offline shell + installable app + push foundation. Peer supports Vite 8. | MEDIUM |
| @supabase/server | 1.9.2 | Deno helpers for Edge Functions | `withSupabase({ auth: ... })` wrapper is the current documented Edge Function pattern. | MEDIUM |

### Notifications (see dedicated section)

| Library | Version | Purpose | Notes | Confidence |
|---------|---------|---------|-------|------------|
| resend | 6.33.0 | Transactional email | Send from a Supabase Edge Function. Free: 100/day, 3,000/mo. | HIGH |
| @react-email/components | 1.0.12 | Email templates in React/TSX | Rendering hook is `renderAsync`; import via `npm:@react-email/components@^1` in Deno. | MEDIUM |
| web-push | 3.6.7 | Web Push (VAPID) | Defer to a later phase; iOS requires installed PWA. | MEDIUM |

### Development Tools

| Tool | Version | Purpose | Notes |
|------|---------|---------|-------|
| vitest | 5.0.4 | Unit/component tests | Peer `vite ^6 \|\| ^7 \|\| ^8`; jsdom 30.1.2. |
| @testing-library/react | 16.3.3 | Component tests | + `@testing-library/jest-dom` 7.0.1. |
| jsdom | 30.1.2 | DOM environment | Vitest `environment: 'jsdom'`. |
| eslint | 10.12.0 | Linting | Peer range of typescript-eslint includes `^10.0.0`. |
| typescript-eslint | 8.71.2 | TS lint rules | **Peer caps TypeScript at `<6.1.0`** — this is why TS is pinned to 6.0.3. |
| prettier | 3.9.10 | Formatting | + `prettier-plugin-tailwindcss` 0.8.1 (sorts class names). |
| husky | 9.1.7 | Git hooks | Pre-commit lint-staged; optional for solo MVP. |
| lint-staged | 17.6.0 | Staged-file lint | Pairs with husky. |

---

## Installation

```bash
# Scaffold (React + TS)
npm create vite@latest happy-health -- --template react-ts

# Core runtime
npm install react-router @supabase/supabase-js @tanstack/react-query

# UI
npm install tailwindcss @tailwindcss/vite
npx shadcn@latest init
npm install lucide-react clsx tailwind-merge class-variance-authority sonner react-day-picker

# Forms + validation
npm install react-hook-form @hookform/resolvers zod

# Dates
npm install date-fns date-fns-tz

# Maps
npm install leaflet react-leaflet

# Optional: i18n + PWA
npm install i18next react-i18next
npm install -D vite-plugin-pwa

# Dev dependencies
npm install -D @tanstack/react-query-devtools @tanstack/react-table \
  @types/node@24 vitest @testing-library/react @testing-library/jest-dom jsdom \
  eslint typescript-eslint prettier prettier-plugin-tailwindcss husky lint-staged

# Pin TypeScript to the lint-compatible line
npm install -D typescript@6.0.3

# Supabase CLI (per machine / CI)
npm install -g supabase
```

Edge Functions (Deno — dependencies declared in the function, not package.json):

```ts
// supabase/functions/send-email/index.ts
import { withSupabase } from 'npm:@supabase/server@^1'
import { Resend } from 'npm:resend@^6'
import { renderAsync } from 'npm:@react-email/components@^1'
```

---

## GitHub Pages: Conflicts and Resolutions

GitHub Pages is **static-only**. It has no server runtime, no rewrites, no SPA fallback, and no secret storage. Everything below is the concrete workaround.

### Conflict 1 — SPA deep links 404

GitHub Pages serves `404.html` for any unknown path and offers no rewrite rules. A React Router deep link (e.g. `/happy-health/bookings/123`) returns 404.

**Fix (recommended):** copy the built `index.html` to `404.html` in the CI step. The 404 handler then serves the app shell, and the router resolves the path client-side.

```yaml
- name: Build
  run: npm run build
- name: SPA fallback
  run: cp dist/index.html dist/404.html
```

**Fix (bulletproof fallback):** use `HashRouter` (`react-router`) if anything about the 404 trick misbehaves. URLs become `/#/bookings/123`, `base` still applies, and no server behavior is needed. Trade-off: uglier URLs, no per-route SEO. For an auth-gated booking app this is acceptable.

**Trade-off to accept:** the 404-copy approach returns HTTP 404 status for deep links. Fine for an app behind login; for a public marketing/SEO surface, move to a custom domain + Cloudflare Pages/Netlify (both support real SPA rewrites) later.

### Conflict 2 — Sub-path asset 404s

A project page is served from `https://nursingcareinfo.github.io/happy-health/`, so every asset URL must include `/happy-health/`.

```ts
// vite.config.ts
export default defineConfig({
  base: '/happy-health/',
  plugins: [react(), tailwindcss()],
})
```

If a custom domain (`happyhealth.pk`) is added later → set `base: '/'` and add a `CNAME` file.

### Conflict 3 — No server runtime

Any server logic (signed URL creation, email sending, payment webhooks, credential review uploads) **cannot** run on GitHub Pages. It runs on **Supabase Edge Functions**, which are hosted on `*.supabase.co`.

**Do not** build an Express/Node server like the prior project's `server.ts` — GitHub Pages cannot host it and it would need separate hosting. Edge Functions replace it entirely.

### Conflict 4 — Secrets

- **Never** place the Supabase `service_role` key (or any secret) in the frontend — anything in a Vite build is public.
- The `anon`/publishable key **is safe** in the frontend **only because RLS is enabled**. Treat RLS as the security boundary.
- `VITE_*` vars are inlined at **build time**. Pass them from GitHub Actions repo variables/secrets:

```yaml
- name: Build
  run: npm run build
  env:
    VITE_SUPABASE_URL: ${{ vars.SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ vars.SUPABASE_ANON_KEY }}
```

- Server-side secrets (`RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) live only as Edge Function secrets: `supabase secrets set --env-file`.

### Conflict 5 — `.nojekyll`

When deploying via **Actions** (`upload-pages-artifact` + `deploy-pages`), Jekyll does **not** run — `.nojekyll` is unnecessary. It **is** required if you ever switch to pushing a `gh-pages` branch. Prefer the Actions flow.

### Conflict 6 — Free-tier platform limits

| Platform | Limit | Impact |
|----------|-------|--------|
| GitHub Pages | 1 GB site, ~100 GB/mo bandwidth, 10 builds/hr | Fine for MVP. |
| Supabase DB | 500 MB | Fine; keep credential metadata + bookings only. |
| Supabase Storage | 1 GB total, 50 MB/file | Enough for CVs/licenses early; compress equipment photos. |
| Supabase Edge Functions | 500k invocations/mo, 150s wall clock | Fine; keep functions short. |
| Supabase Project | **Pauses after ~1 week of inactivity** | Add a weekly keep-alive ping or accept cold restarts. |
| Supabase built-in email | Very low throughput (default SMTP) | Move to Resend/custom SMTP before real users. |

---

## Auth + RLS Approach (three roles)

**Roles:** `patient`, `staff` (nurse/doctor), `admin`.

1. **Auth methods:** Email + password and magic link (free). **Phone OTP** is what Pakistani users actually prefer, but it needs a paid SMS provider (Twilio / a local gateway) — defer to a later phase and note it as a gap.
2. **Store the role in a `profiles` table** (1:1 with `auth.users`), created by a trigger on `auth.users` insert.
3. **Mirror the role into the JWT** via a **Custom Access Token Auth Hook** and read it in policies with `auth.jwt()`. This avoids a per-row subquery in RLS and is the documented Supabase RBAC pattern.
4. **RLS helper:** a `SECURITY DEFINER` function such as `public.is_admin()` so admin policies stay readable.
5. **Enforce every rule in RLS**, never in the client. A patient must be unable to read another patient's bookings; a staff member must be unable to read another staff member's credentials; only admins see the verification queue.
6. **Staff onboarding flow:** sign up → `profiles.role = 'staff'`, `status = 'pending'` → upload credentials to private storage → admin reviews → `status = 'approved'`. RLS gates the approved state.

```sql
-- shape of the core policies
create policy "patients read own bookings"
on bookings for select
using ( (select auth.uid()) = patient_id );

create policy "admins read all"
on bookings for select
using ( public.is_admin() );

create policy "staff read assigned bookings"
on bookings for select
using ( (select auth.uid()) = staff_id );
```

---

## File Storage for Credentials

Use **private** Supabase Storage buckets (buckets are private by default). Never a public bucket for licenses, CNIC, or CVs.

| Bucket | Contents | Access |
|--------|----------|--------|
| `staff-credentials` | PNC license, CNIC, CV, certificates | Private; staff write own folder, admins read |
| `equipment-photos` | Equipment listing images | Public-read is acceptable (listing photos) |
| `patient-documents` | Prescriptions, reports | Private; patient + assigned staff only |

**Path convention:** `{auth.uid()}/{filename}` — enables a simple folder-scoped RLS policy.

```sql
create policy "staff manage own credential files"
on storage.objects for all
using (
  bucket_id = 'staff-credentials'
  and (select auth.uid()::text) = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'staff-credentials'
  and (select auth.uid()::text) = (storage.foldername(name))[1]
);
```

**Admin review:** the browser cannot bypass RLS to mint a signed URL for someone else's private file. Generate a **short-TTL signed URL** inside an Edge Function running with the `service_role` key:

```ts
const { data } = await supabase.storage
  .from('staff-credentials')
  .createSignedUrl(`private-document.pdf`, 300) // 5 minutes
```

Use short TTLs (300s) for credential review links; log who viewed what.

---

## Maps / Geolocation for Home Visits

**Recommendation: Leaflet 1.9.4 + react-leaflet 5.0.0 with OpenStreetMap-based tiles.**

- **Why:** zero cost, zero API key, works in Pakistan, and react-leaflet 5's React 19 peer requirement matches our React. Karachi has solid OSM coverage.
- **Tile provider:** OpenStreetMap standard tiles are fine for light MVP traffic; move to a free/cheap vector provider (Carto, Stadia, MapTiler free tier, Protomaps) as traffic grows, per OSM tile usage policy.
- **Home address capture:** `navigator.geolocation` for "use my location" + a draggable/pin-drop marker (`useMapEvents`) for precise placement. This is more reliable than address geocoding in Pakistan.
- **Reverse geocoding (optional):** Nominatim (OSM) is free but rate-limited (~1 req/s) and requires a descriptive `User-Agent`. Keep it server-side (Edge Function) if used.
- **Distance/service-area checks:** compute haversine distance in a Postgres function or Edge Function rather than shipping a routing engine.

**If Pakistan address accuracy becomes critical, upgrade to Google Maps** (`@vis.gl/react-google-maps`) — Google has the best Pakistan address coverage — but it requires a billing account and an API key, so it is a deliberate later-stage spend, not an MVP choice.

---

## Notifications

Layer them; start at the top and add downward as needed.

| Channel | Mechanism | When | Confidence |
|---------|-----------|------|------------|
| **In-app** | Supabase Realtime (`postgres_changes`) on a `notifications` table + a bell UI | MVP — booking status changes, admin approvals | HIGH |
| **Email** | Edge Function → **Resend** (`resend@6`) with React Email templates | MVP for confirmations; also wire as the Supabase Auth "Send Email" hook | HIGH |
| **Web Push** | `vite-plugin-pwa` service worker + VAPID + `web-push@3` in an Edge Function; store subscriptions in `push_subscriptions` | Post-MVP. iOS only after "Add to Home Screen" | MEDIUM |
| **SMS / WhatsApp** | Provider TBD | **Important gap for Pakistan** — email is weak adoption there; WhatsApp/SMS is the real channel. Needs a paid provider; defer but plan for it | LOW |

**Trigger pattern:** a Postgres trigger on `bookings` inserts a `notifications` row → Realtime pushes it in-app → optionally a database webhook calls an Edge Function that sends email/push. Configure the webhook's auth header with the service key.

---

## CI/CD for GitHub Pages

Deploy via **GitHub Actions with the Pages actions** (not the `gh-pages` branch package). Enable once at *Settings → Pages → Source: GitHub Actions*.

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: ['main']
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: 'npm'
      - run: npm ci
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ vars.SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ vars.SUPABASE_ANON_KEY }}
      - name: SPA fallback (see Conflict 1)
        run: cp dist/index.html dist/404.html
      - uses: actions/configure-pages@v6
      - uses: actions/upload-pages-artifact@v5
        with:
          path: './dist'
      - id: deployment
        uses: actions/deploy-pages@v5
```

**Verified action majors (as of research date):** `actions/checkout@v7`, `actions/setup-node@v7`, `actions/configure-pages@v6`, `actions/upload-pages-artifact@v5`, `actions/deploy-pages@v5`. (Vite's own docs still show older v4/v5 pins — use the current majors above.)

**Supabase schema + functions deploy separately** (they are not on GitHub Pages):

```bash
supabase link --project-ref <ref>
supabase db push                 # apply migrations
supabase functions deploy send-email
supabase secrets set --env-file supabase/functions/.env
```

Consider a second workflow (`.github/workflows/supabase.yml`) that runs `supabase db push` / `functions deploy` on push to `main` when `supabase/**` changes, using a `SUPABASE_ACCESS_TOKEN` repo secret.

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| react-router 8 | TanStack Router | If you want fully type-safe routing and don't need React Router's framework mode. |
| Leaflet + OSM | Google Maps (`@vis.gl/react-google-maps`) | When Pakistan address accuracy justifies a billed API key. |
| Leaflet + OSM | MapLibre GL + free vector tiles | When you need vector styling/performance at scale; heavier to set up. |
| Supabase | Firebase | If you want managed push + Firestore; costs the RLS/Postgres-you-own advantage. |
| GitHub Pages | Cloudflare Pages / Netlify / Vercel | When you outgrow static-only: real SPA rewrites, edge functions, preview deploys, no 404-status deep links. |
| Resend | SendGrid / Postmark / AWS SES | Higher volume or existing accounts; SES is cheapest at scale but more setup. |
| vite-plugin-pwa | Serwist / Workbox manual | If you need finer service-worker control than the plugin exposes. |
| TypeScript 6.0.3 | TypeScript 7.0.2 (native Go compiler) | If you're willing to drop type-aware ESLint rules (or wait for typescript-eslint to raise its `<6.1.0` cap) for faster `tsc`. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **`react-router-dom`** | **Removed in React Router v8.** Only a legacy v6→v7 mirror; installs an older line. | `react-router` (import `RouterProvider` from `react-router/dom`) |
| **TypeScript 7.0.2 *right now*** | `typescript-eslint@8.71.2` peer-caps TypeScript at `<6.1.0` → typed lint rules break/warn. | `typescript@6.0.3` (or 5.9.3 as the ultra-safe pin) |
| **Create React App (CRA)** | Unmaintained/deprecated; no Vite-speed builds. | Vite 8 (`npm create vite@latest`) |
| **A custom Express/Node API** (like the prior project's `server.ts`) | GitHub Pages has no server runtime; you'd need separate hosting. | Supabase Edge Functions + direct PostgREST/Storage calls |
| **`gh-pages` npm branch deploy** | Runs Jekyll (needs `.nojekyll`), no artifact/environment semantics, messier. | `actions/upload-pages-artifact` + `actions/deploy-pages` |
| **`HashRouter` as a default** | Ugly URLs, no per-route SEO — only a fallback. | `BrowserRouter` + `404.html` copy; HashRouter only if the trick fails |
| **`service_role` key in the frontend** | Grants full DB bypass; anything in the bundle is public. | `anon`/publishable key in frontend + RLS; `service_role` only in Edge Function secrets |
| **Public storage bucket for credentials** | Exposes PNC licenses / CNIC / CVs to anyone. | Private bucket + folder-scoped RLS + short-TTL signed URLs |
| **Client-side-only role checks** | Trivially bypassed; patient could read others' data. | Enforce every rule in Postgres RLS |
| **Supabase built-in SMTP for production** | Severe rate limits; emails silently drop. | Resend (or custom SMTP) via the Send Email hook |
| **`localStorage` for auth tokens** | Manual token handling invites leaks/XSS exposure. | Supabase client session persistence (default) |
| **Google Maps for MVP** | Requires billing + API key; cost risk. | Leaflet + OSM for MVP; upgrade later if needed |
| **Assuming RLS is optional** | With `anon` key in the browser, RLS *is* the entire security model. | Enable RLS on every table before writing data |

---

## Stack Patterns by Variant

**If Urdu / RTL support is required at launch:**
- Add `i18next` + `react-i18next` and set `dir="rtl"` on the document; Tailwind v4 handles logical properties.
- Because a Pakistan-first product will lose users on English-only UI.

**If phone-OTP login is required (likely for Pakistan):**
- Add a paid SMS provider (Twilio or a local gateway) as a Supabase Auth SMS hook; keep email as a secondary channel.
- Because email is a weak adoption channel for the target audience.

**If a custom domain (`happyhealth.pk`) is purchased:**
- Set `base: '/'`, add `CNAME`, drop the `/happy-health/` prefix everywhere.
- Because the root-domain base also unlocks a clean move to Cloudflare Pages later.

**If the app outgrows static hosting (real SEO, server rendering, payment webhooks):**
- Move to Cloudflare Pages / Netlify / Vercel, or add a small server for webhooks.
- Because GitHub Pages is static-only and returns 404 status on deep links.

**If real-time staff-location tracking is added:**
- Use Supabase Realtime presence + a PostGIS-enabled Postgres for geo queries.
- Because Postgres supports PostGIS natively on Supabase.

---

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| react 19.3.1 | react-dom 19.3.1 | Must be the **exact same version** — React 19 throws otherwise. |
| react-router 8.4.0 | react ≥ 19.2.7, react-dom ≥ 19.2.7 | v8 is ESM-only; `react-router-dom` removed. |
| react-leaflet 5.0.0 | react ^19, react-dom ^19, leaflet ^1.9 | Pairs with Leaflet 1.9.4. |
| @vitejs/plugin-react 6.1.2 | vite ^8.0.0 | Peer-locked to Vite 8. |
| vite 8.3.4 | Node ≥ 20.19 / 22.12; bundles `rolldown ~1.2.12` | Vite 8 uses Rolldown by default. |
| vitest 5.0.4 | vite ^6 \|\| ^7 \|\| ^8; @types/node ≥ 24 | Install `@types/node@24` to match the Node LTS major. |
| typescript-eslint 8.71.2 | typescript `>=4.8.4 <6.1.0`; eslint ^8.57 \|\| ^9 \|\| ^10 | **Hard cap — do not use TS 6.1+/7 with it.** |
| @tanstack/react-query 5.104.2 | react ^18 \|\| ^19 | |
| vite-plugin-pwa 2.0.0 | vite ^3–^8 | Needs `workbox-build`/`workbox-window` ^7.4.1. |
| @tailwindcss/vite 4.3.3 | tailwindcss 4.3.3 | Keep both on the same version. |

---

## Sources

- `/react/react` (Context7) — React 19 `createRoot` migration; exact-version requirement (HIGH)
- `/vitejs/vite` (Context7) — `base` for GitHub Pages, official Pages workflow, `build.outDir` (HIGH)
- npm registry (`npm view <pkg> version`) — all version numbers above, live-checked 2026-10-15 (HIGH)
- React Router Upgrade v7→v8 guide + v8 release notes (reactrouter.com, remix.run) — ESM-only, `react-router-dom` removal, React ≥19.2.7 floor (HIGH)
- `/remix-run/react-router` (Context7) — `createBrowserRouter`, SPA `_redirects`/fallback concept (HIGH)
- `/supabase/supabase` (Context7) — custom-claims RBAC, `auth.uid()` RLS, private buckets + signed URLs (HIGH)
- Supabase docs — "Custom Auth Emails with React Email and Resend", "Sending Emails", "Sending Push Notifications" (HIGH for email; MEDIUM for push)
- `/react-hook-form/resolvers` (Context7) — `zodResolver` TypeScript usage (HIGH)
- `/websites/react-leaflet_js` (Context7) — `MapContainer`, `useMapEvents`, `map.locate()` (HIGH)
- `/tailwindlabs/tailwindcss.com` (Context7) — Tailwind v4 `@tailwindcss/vite` setup (HIGH)
- gitHub Pages SPA articles (rafgraph/spa-github-pages, noahtigner.com, Stack Overflow) — 404.html fallback pattern (MEDIUM)
- GitHub Actions releases API — verified action majors `checkout@v7`, `setup-node@v7`, `configure-pages@v6`, `upload-pages-artifact@v5`, `deploy-pages@v5` (HIGH)
- nodejs.org/dist/index.json — Node 24.22.0 LTS "Krypton" (HIGH)

---

*Stack research for: home-care medical services booking platform (Pakistan-first)*
*Researched: 2026-10-15*
