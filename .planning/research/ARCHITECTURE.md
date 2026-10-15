# Architecture Research

**Domain:** On-demand home-care marketplace / booking platform (Pakistan)
**Researched:** 2026-10-15
**Confidence:** HIGH (Supabase security/architecture patterns), MEDIUM (Pakistan regulatory state, product-specific scheduling synthesis)

**Project shape:** React (Vite + TypeScript) SPA on GitHub Pages + Supabase (Postgres, Auth, Storage, Edge Functions, Realtime, RLS). Three roles: `patient`, `staff` (nurse/doctor), `admin`.

> **The one idea that drives this entire architecture:** the frontend is a *static, untrusted, world-readable bundle* hosted on GitHub Pages with only a publishable key. **The database is the security boundary, not the client.** Every authorization rule, every state transition, and every role check must be enforceable by Postgres/RLS alone. Anything that needs a secret or the service-role key *must* live in an Edge Function, because GitHub Pages cannot run server code.

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│  CLIENT — GitHub Pages (static: HTML/CSS/JS only, no server)              │
│                                                                            │
│  React SPA (Vite + TS)     Router: HashRouter / 404.html fallback         │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐                 │
│  │ Patient   │ │ Staff     │ │ Admin     │ │ Shared    │                 │
│  │ features  │ │ features  │ │ console   │ │ auth/ui   │                 │
│  └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └─────┬─────┘                 │
│        └─────────────┴──────┬──────┴─────────────┘                        │
│                             │                                              │
│  lib/supabase.ts  — single client, publishable key + user JWT             │
│  lib/api/*        — typed query modules (PostgREST + RPC + Storage)       │
└─────────────────────────────┬────────────────────────────────────────────┘
                              │  HTTPS (JWT on every request)
        ┌─────────────────────┼──────────────────────────────┐
        │                     │                              │
        ▼                     ▼                              ▼
┌───────────────┐   ┌────────────────────┐        ┌──────────────────────┐
│  Auth          │   │  Data API (PostgREST)│        │  Storage             │
│  email/pw      │   │  tables/views/RPC   │        │  private buckets     │
│  phone OTP     │   │  ▲ RLS enforced     │        │  ▲ RLS on objects    │
│  JWT + claims  │   │  │                  │        │  │                   │
└───────┬───────┘   └────┬────────────────┘        └────┬─────────────────┘
        │                │                              │
        └────────────────┼──────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  POSTGRES — the real backend                                               │
│  public schema : profiles, staff_profiles, services, bookings, ...         │
│  private schema: SECURITY DEFINER helpers (is_admin, has_role, ...)        │
│  triggers      : booking state machine, audit, updated_at, notif fan-out   │
│  extensions    : pg_cron + pg_net (scheduled function invocation)          │
└───────────────────────────┬──────────────────────────────────────────────┘
                            │ pg_cron → pg_net (HTTP)
                            ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  EDGE FUNCTIONS (Deno) — the only place server secrets exist               │
│  notify (email/SMS) · admin-invite-user · scheduled reminders · webhooks   │
└───────────────────────────┬──────────────────────────────────────────────┘
                            ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  THIRD PARTIES: SMS (Twilio/MessageBird) · Email (Resend) · Maps (OSM)     │
└──────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Owns | Typical Implementation |
|-----------|------|------------------------|
| **Client SPA** | Rendering, routing, form state, optimistic UI, calling Data API/Storage/Realtime *as the user* | Vite + React + TS; `@supabase/supabase-js`; TanStack Query for server state; react-hook-form + zod for forms |
| **Supabase Auth** | Identity, sessions, JWT issuance, phone OTP | Built-in; Custom Access Token Hook injects `user_role` claim |
| **Data API (PostgREST)** | Auto REST over tables/views/functions | Built-in; every request runs as `anon` or `authenticated` with RLS |
| **Postgres `public` schema** | All domain data + policies | Migrations via Supabase CLI (`supabase db` / migration files) |
| **Postgres `private` schema** | Security-definer helper functions; **not exposed** in API settings | Hand-written SQL, revoked from `anon`/`authenticated` |
| **Triggers / functions** | State-machine enforcement, audit trail, role bootstrap, notification fan-out | PL/pgSQL `BEFORE UPDATE` / `AFTER INSERT` |
| **Storage** | Private credential documents | `credentials` bucket (private); RLS on `storage.objects` scoped by folder = `auth.uid()` |
| **Edge Functions** | Secrets-only work: send email/SMS, invite/create users, call external APIs, scheduled jobs | Deno functions under `supabase/functions/`; `verify_jwt` on by default |
| **Realtime** | Live booking status pushes to patient/staff/admin dashboards | `postgres_changes` subscriptions (respect RLS) |
| **pg_cron + pg_net** | Time-based triggers (reminders, no-show, license expiry) | `cron.schedule(...)` → `net.http_post(...)` → Edge Function |
| **GitHub Actions** | Build + deploy SPA to Pages on push to `main` | `actions/deploy-pages`; `vite build` with correct `base` |

## Recommended Project Structure

```
src/
├── app/                     # Shell: providers, router, layout, error boundaries
│   ├── router.tsx           # HashRouter (GitHub Pages safe) + role guards
│   └── providers.tsx        # Auth session, QueryClient
├── lib/
│   ├── supabase.ts          # createClient(url, VITE_SUPABASE_PUBLISHABLE_KEY)
│   ├── auth/
│   │   ├── useSession.ts    # session + role from JWT claim / profile
│   │   └── RequireRole.tsx  # <RequireRole role="admin">…</RequireRole>
│   └── api/                 # One typed module per domain — the ONLY data access layer
│       ├── services.ts      # catalog reads
│       ├── bookings.ts      # create/transition/list bookings (RPC + table)
│       ├── staff.ts         # staff profile + credential_documents
│       ├── admin.ts         # verification queue, assignment
│       └── types.ts         # generated DB types (supabase gen types)
├── features/
│   ├── patient/             # Browse, booking wizard, my-bookings (Realtime)
│   ├── staff/               # Onboarding, credential upload, job list, availability
│   ├── admin/               # Verification queue, booking oversight, catalog CRUD
│   └── auth/                # Sign-in, sign-up, phone OTP
├── components/              # Dumb, reusable UI
└── data/                    # Static reference data (cities, doc types, copy)

supabase/
├── migrations/              # Ordered SQL: 0001 roles/RLS foundation, 0002 catalog, ...
├── functions/
│   ├── notify/index.ts      # email/SMS via secrets
│   ├── admin-invite/index.ts# auth.admin.inviteUserByEmail (service_role)
│   └── scheduled/index.ts   # reminders/no-show/expiry (invoked by pg_cron)
└── config.toml

.github/workflows/deploy.yml # build SPA → Pages
```

### Structure Rationale

- **`lib/api/` as the single data-access layer:** every Supabase call goes through one typed module per domain. This keeps RLS-correct query shapes in one place, makes the client's contract with the DB auditable, and lets role-guards and error handling be uniform. Never scatter `supabase.from(...)` across components.
- **`features/` by role:** the three dashboards are genuinely different products sharing one shell. Grouping by role keeps patient booking logic from leaking into admin tooling.
- **`supabase/migrations/` ordered and never edited after apply:** schema + RLS policies ship together as migrations so security is reproducible across local and hosted environments.
- **`supabase/functions/` for anything secret-bearing:** the boundary is "does this need a key the browser must never hold?" — if yes, it's an Edge Function.

## Data Model

Core enums first — they drive every policy and transition check:

```sql
create type public.user_role        as enum ('patient', 'staff', 'admin');
create type public.staff_type       as enum ('nurse', 'doctor');
create type public.verification_status as enum ('pending','under_review','approved','rejected');
create type public.booking_status   as enum (
  'requested','confirmed','assigned','en_route','in_progress','completed','cancelled','no_show'
);
create type public.service_category as enum ('nursing','doctor_visit','equipment');
```

| Table | Key columns | Purpose / boundary |
|-------|-------------|--------------------|
| `profiles` | `id` (=`auth.uid()` PK), `role user_role default 'patient'`, `full_name`, `phone`, `created_at` | One row per user. **Source of truth for role.** Created by an `AFTER INSERT ON auth.users` trigger, never by the client. |
| `patient_profiles` | `profile_id` PK→profiles, `address_line`, `city`, `area_id` | Patient-specific fields, kept out of `profiles` so columns can be granted narrowly. |
| `staff_profiles` | `profile_id` PK→profiles, `staff_type`, `reg_no` (PNMC/PMDC), `license_expiry`, `bio`, `verification_status`, `verified_by`, `verified_at`, `rejection_reason` | Staff identity + license data. `verification_status` gates assignment. |
| `credential_documents` | `id`, `staff_id`→profiles, `doc_type`, `storage_path`, `status`, `reviewed_by`, `reviewed_at` | Metadata for files in the `credentials` bucket. One row per uploaded doc. |
| `services` | `id`, `category service_category`, `name`, `description`, `base_price`, `duration_min`, `active` | Public catalog (nursing tasks, doctor visits). |
| `equipment` | `id`, `name`, `description`, `daily_rate`, `stock_qty`, `available_qty`, `active` | Rentable equipment inventory. |
| `service_areas` | `id`, `city`, `area`, `postal_code`, `active` | Karachi-first pilot coverage; used to validate a booking address. |
| `bookings` | `id`, `patient_id`, `service_id`, `equipment_id?`, `staff_id?`, `scheduled_start/end`, `address_snapshot`, `status booking_status`, `price`, `notes`, `created_at`, `updated_at` | The central transactional entity. `address_snapshot` is JSON/text copied at booking time (never a live join to a mutable address). |
| `booking_events` | `id`, `booking_id`, `from_status`, `to_status`, `actor_id`, `at`, `note` | **Append-only audit trail**, written by trigger (SECURITY DEFINER), not by the client. |
| `staff_availability` | `staff_id`, `weekday`, `start_time`, `end_time` | Weekly availability windows. |
| `notifications` | `id`, `profile_id`, `channel`, `payload`, `read_at`, `sent_at` | In-app notification feed (Realtime); email/SMS handled by Edge Function. |

**Relationship spine:**
```
auth.users 1─1 profiles 1─1 patient_profiles
                     │  1─1 staff_profiles 1─* credential_documents
                     │
                     └─* bookings *─1 services
                              │   *─1 equipment (nullable)
                              │   *─1 staff_profiles (nullable until assigned)
                              └─* booking_events
```

**Design decisions worth defending:**
- **`address_snapshot` on `bookings`, not a live FK to an address table.** A booking must record where the visit was requested *at the time*; editing a saved address later must not silently move historical visits.
- **`booking_events` audit table from day one.** Healthcare dispute resolution and admin oversight both need an immutable "who changed what, when."
- **License data lives in `staff_profiles`, never in `profiles`.** Patients must never be able to `select` a license number — keep it in a table they have no grant on, and expose an approved-only public *view*.

## Role-Based Access (patient / staff / admin) with RLS

### The recommended pattern: SECURITY DEFINER helpers in a `private` schema

Do **not** write role checks as table subqueries inside RLS policies — a policy on `profiles` that reads `profiles` causes Postgres error `42P17` (`infinite recursion detected in policy for relation`), and even non-recursive subqueries are evaluated per-row and are slow. The documented fix (Supabase RLS guide) is a `security definer` function owned by a role with `bypassrls` (on Supabase, `postgres`):

```sql
create schema if not exists private;

-- Reads public.profiles as its owner → can't recurse, can't be manipulated by the caller.
create function private.current_role()
returns public.user_role
language sql
security definer
set search_path = ''
stable
as $$
  select role from public.profiles where id = (select auth.uid());
$$;

create function private.is_admin() returns boolean
language sql security definer set search_path = '' stable
as $$ select (select private.current_role()) = 'admin' $$;

create function private.has_role(r public.user_role) returns boolean
language sql security definer set search_path = '' stable
as $$ select (select private.current_role()) = r $$;

-- CRITICAL: revoke direct execution so clients cannot call these over /rest/v1/rpc/
revoke execute on function private.current_role()          from public, anon, authenticated;
revoke execute on function private.is_admin()              from public, anon, authenticated;
revoke execute on function private.has_role(public.user_role) from public, anon, authenticated;
grant usage on schema private to authenticated;
```

Then policies read cleanly and safely:

```sql
-- profiles: read own, admins read all
create policy "read own profile" on public.profiles
  for select to authenticated
  using ( id = (select auth.uid()) or (select private.is_admin()) );

create policy "update own profile" on public.profiles
  for update to authenticated
  using ( id = (select auth.uid()) )
  with check ( id = (select auth.uid()) );   -- role change is blocked by trigger, see below

-- bookings: patient sees own; staff sees jobs assigned to them; admin sees all
create policy "bookings by participant" on public.bookings
  for select to authenticated
  using (
    patient_id = (select auth.uid())
    or staff_id = (select auth.uid())
    or (select private.is_admin())
  );
```

**Never** store role in `user_metadata` — it is user-editable. If you want a client-convenient role claim, add it via a **Custom Access Token Auth Hook** into `app_metadata` (also not user-writable), e.g.:

```sql
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb language plpgsql stable as $$
declare claims jsonb; r public.user_role;
begin
  select role into r from public.profiles where id = (event->>'user_id')::uuid;
  claims := event->'claims';
  claims := jsonb_set(claims, '{app_metadata,user_role}', to_jsonb(coalesce(r,'patient')));
  return jsonb_set(event, '{claims}', claims);
end $$;
```

Then the *client* can read `session.user.app_metadata.user_role` for routing, while RLS still uses the always-fresh helper functions.

> **JWT staleness rule:** a JWT is a snapshot. If an admin approves a staff member and flips their role, that user's existing token still says `patient` until it refreshes. Either (a) force `supabase.auth.refreshSession()` after an admin-side change the user will notice, or (b) rely on `private.current_role()` for anything security-critical (it always reads live). Recommend (b) for authorization and (a) only as UX polish.

### Per-table RLS intent (build against this checklist)

| Table | anon | patient | staff | admin |
|-------|------|---------|-------|-------|
| `services`, `equipment`, `service_areas` | SELECT (public catalog) | SELECT | SELECT | ALL |
| `profiles` | — | own SELECT/UPDATE | own SELECT/UPDATE | ALL |
| `patient_profiles` | — | own ALL | — | ALL |
| `staff_profiles` | — | SELECT **approved public view only** | own ALL (not `verification_status`) | ALL |
| `credential_documents` | — | — | own INSERT/SELECT | ALL |
| `bookings` | — | own INSERT/SELECT, cancel own | assigned SELECT/UPDATE (status only) | ALL |
| `booking_events` | — | SELECT where booking visible | SELECT where booking visible | SELECT (write via trigger only) |
| `notifications` | — | own | own | own/all |
| `storage.objects` (`credentials`) | — | — | own folder | bucket-wide |

**Column-level protection:** RLS cannot express "patients may update `phone` but not `role`." Two mechanisms:
1. **Column grants** — `grant update (full_name, phone) on public.profiles to authenticated;` (Postgres grants are per-column).
2. **A `BEFORE UPDATE` trigger** that raises if `new.role is distinct from old.role` and the caller is not an admin. Use this for anything the client must never self-elevate.

## Booking / Scheduling State Machine

Model `bookings.status` as an explicit finite state machine, **enforced in the database**, not in React. Three independent roles mutate it, so client-side enforcement would be trivially bypassable (the SPA is public code).

```
                (patient creates)
                       │
                       ▼
                  ┌───────────┐  admin confirm   ┌───────────┐  admin assigns   ┌──────────┐
                  │ requested │ ───────────────► │ confirmed │ ───────────────► │ assigned │
                  └─────┬─────┘                  └─────┬─────┘                  └────┬─────┘
                        │                              │                             │ staff en-route
                        │ patient/admin cancel         │ cancel                       ▼
                        └──────────────► ┌───────────┐  │                        ┌──────────┐
                                         │ cancelled │◄─┘                        │ en_route │
                                         └───────────┘        staff start        └────┬─────┘
                                                              ▼                       │
                                                         ┌─────────────┐              │
                                                         │ in_progress │◄─────────────┘
                                                         └──────┬──────┘
                                                     staff finish│
                                                                ▼
                                                          ┌───────────┐
                                                          │ completed │
                                                          └───────────┘
                             staff does not show → no_show
```

**Enforcement trigger (skeleton):**

```sql
create or replace function public.enforce_booking_transition()
returns trigger language plpgsql as $$
declare allowed public.booking_status[];
begin
  if new.status is not distinct from old.status then return new; end if;

  allowed := case old.status
    when 'requested'   then array['confirmed','cancelled']::public.booking_status[]
    when 'confirmed'   then array['assigned','cancelled']::public.booking_status[]
    when 'assigned'    then array['en_route','no_show','cancelled']::public.booking_status[]
    when 'en_route'    then array['in_progress','no_show']::public.booking_status[]
    when 'in_progress' then array['completed']::public.booking_status[]
    else array[]::public.booking_status[]        -- terminal states
  end;

  if not (new.status = any(allowed)) then
    raise exception 'invalid booking transition % → %', old.status, new.status
      using errcode = 'check_violation';
  end if;

  -- role-specific guard: must be approved staff to be assigned
  if new.staff_id is distinct from old.staff_id then
    if (select verification_status from public.staff_profiles where profile_id = new.staff_id) <> 'approved' then
      raise exception 'cannot assign unverified staff';
    end if;
    if not (select private.is_admin()) then
      raise exception 'only admin can assign staff';
    end if;
  end if;

  return new;
end $$;

create trigger booking_transition_check
  before update on public.bookings
  for each row execute function public.enforce_booking_transition();

-- audit: every status change becomes an immutable event
create or replace function public.log_booking_event()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status is distinct from old.status then
    insert into public.booking_events(booking_id, from_status, to_status, actor_id, at)
    values (new.id, old.status, new.status, (select auth.uid()), now());
  end if;
  return new;
end $$;
create trigger booking_event_audit
  after update on public.bookings
  for each row execute function public.log_booking_event();
```

**Concurrency:** a trigger prevents illegal transitions but not races (two admins assigning the same slot). Guard assignment with an optimistic check — `update bookings set staff_id = $1 where id = $2 and status = 'confirmed'` — and treat zero rows affected as "someone changed it; refresh." Add a partial unique index if you enforce one-staff-one-time-window:
```sql
create unique index no_double_booking on public.bookings (staff_id, scheduled_start)
  where status in ('assigned','en_route','in_progress');
```

**Availability/slot model (MVP):** patients pick from `staff_availability` windows + `bookings` that don't collide, filtered by `service_areas`. Full drive-time/routing optimization (the Driive/ServiceTitan model) is explicitly **out of scope** for the MVP — model it later as a separate scheduling service. See FEATURES/PITFALLS for the "don't build a routing engine in v1" warning.

## Credential Verification Flow (document upload + admin approval)

```
Staff signs up ──► profiles row (role='patient' default, via trigger)
      │
      ▼
Staff submits application ──► staff_profiles(verification_status='pending')
      │                         + row per document in credential_documents
      ▼
Uploads files ──► Storage bucket 'credentials'  (PRIVATE)
                  path = "<auth.uid()>/<doc_type>-<ts>.<ext>"
                  Storage RLS: foldername(name)[1] = auth.uid()::text
      │
      ▼
Admin opens review queue ──► reads credential_documents + signed URLs (short TTL)
      │                       checks license against PNMC (nurses, by CNIC)
      │                       or PMDC (doctors, by registration number) online registers
      ▼
Admin approves ──► staff_profiles.verification_status='approved',
                   verified_by=admin, verified_at=now(),
                   profiles.role='staff'     (triggers JWT refresh on next login)
Admin rejects  ──► verification_status='rejected', rejection_reason=…
      │
      ▼
Trigger fans out to notification (Realtime row + Edge Function for email)
```

**Storage RLS for the private bucket** (mirrors the documented Supabase pattern):

```sql
-- staff upload only into their own <uid>/ folder
create policy "credentials upload own folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'credentials'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

-- staff read their own; admin reads the whole bucket
create policy "credentials read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'credentials'
    and ( (storage.foldername(name))[1] = (select auth.uid()::text)
          or (select private.is_admin()) )
  );
```

**Key points:**
- Bucket is **private**. The only download paths are (a) the authenticated client's JWT (RLS-checked) or (b) a short-lived signed URL. The client can only mint a signed URL for an object RLS already lets it read.
- **Folder = `auth.uid()`** decouples upload permission from *role*. A pending applicant who is still `role='patient'` can upload — only admin approval grants the `staff` role.
- **The DB row and the Storage object are two separate writes.** Insert the `credential_documents` row first (or in the same user action with rollback on failure); reconcile with a nightly pg_cron job that finds orphaned objects/rows.
- **There is no automated PNMC/PMDC API.** Verification is a *manual external check* against the councils' public registers (PNMC: online by CNIC; PMDC: by registration number). Design the admin queue around a human reviewer with a link out to the register and a "verified against register" checkbox. Do not promise automated license validation.
- **Legal driver (not just quality):** the Pakistan Nursing & Midwifery Council Act (amended 2023) prohibits employing unregistered nurses. Verifying staff is a compliance requirement for a healthcare marketplace.

## Data Flow

### Request flow — patient creates a booking

```
Patient fills wizard         (address validated against service_areas)
        ↓
lib/api/bookings.create()  → supabase.from('bookings').insert({...})
        ↓                                │
   RLS WITH CHECK:                       │  Data API runs as `authenticated`
   patient_id = auth.uid()               │  with the user's JWT
   AND status = 'requested'              ▼
   AND service_id active            INSERT accepted → trigger sets defaults,
        ↓                           row visible to admin, patient, (later) staff
   Realtime broadcasts INSERT   ──────► admin dashboard "new request" (live)
        ↓
Confirmation email queued  ──► notifications row  +  Edge Function `notify`
```

### Request flow — staff status update (assigned → en_route → in_progress → completed)

```
Staff taps "Start travel"    →  supabase.from('bookings').update({status:'en_route'})
        ↓                                │
   RLS USING: staff_id = auth.uid()      │
   + BEFORE trigger validates transition  │
   + role guard: not advancing an illegal state
        ↓
   AFTER trigger → booking_events row      (audit)
        ↓
   Realtime UPDATE → patient sees live status; admin timeline updates
```

### State management (client)

```
Supabase session (JWT)  ──► AuthProvider context  ──► RequireRole guards
        │
        ├─► TanStack Query cache  ──► components read from cache
        │        ▲
        │        └── invalidated by Realtime postgres_changes events
        │
        └─► all mutations go through lib/api/*  →  RLS is the enforcement point
```

**Rule:** the client treats the DB as authoritative. No role checks or state-transition logic that *only* exists in React — those are guardrails for UX; the database is the gate.

## Edge Functions vs Client — the responsibility split

The single most important architectural call in this stack. Rule of thumb:

> **Default to the client + PostgREST/Storage with RLS. Use an Edge Function only when the operation needs a secret, the service-role key, a third-party API, or trusted server time.**

| Responsibility | Where it lives | Why |
|----------------|----------------|-----|
| Read catalog, read/insert own bookings | **Client → Data API** | RLS already authorizes it; no secret needed |
| Upload credential docs | **Client → Storage** | Storage RLS scopes to `auth.uid()` folder |
| Mark booking `in_progress` (staff) | **Client → Data API** (update) | RLS + state-machine trigger enforce it |
| Read own profile / update own phone | **Client → Data API** | RLS + column grants |
| Sign in (email/password) | **Client → Auth** | Built-in |
| Phone OTP login | **Client → Auth → SMS provider** | Auth's built-in SMS integration; provider creds live in Supabase config, not the browser |
| Send booking confirmation **email** | **Edge Function `notify`** | Needs Resend/API key |
| Send **SMS** beyond auth OTP | **Edge Function `notify`** | Needs SMS provider key |
| Invite/create staff users, set custom claims server-side | **Edge Function (service_role / `auth.admin`)** | Needs service-role key |
| Call an external API (geocoding, later payments) | **Edge Function** | Secret + CORS control |
| Scheduled reminders / no-show detection / license-expiry sweep | **pg_cron → Edge Function `scheduled`** | Trusted clock; no user request to hang it on |
| Payment callbacks (later) | **Edge Function webhook** | Must not trust client |

**Edge Function auth mechanics (verified):** every request hits a platform-level `verify_jwt` check before your code runs. Inside, extract the caller:
```ts
const token = req.headers.get('Authorization')?.replace('Bearer ', '');
const { data: { user } } = await supabaseClient.auth.getUser(token);
```
Never ship `--no-verify-jwt` unless you have a hard reason (e.g. WebSocket clients); if you do, you must verify the JWT yourself.

**Secrets:** store provider keys via `supabase secrets set` and read them from `Deno.env`. Never in the Vite bundle. Anything prefixed `VITE_` is compiled into the public JS and is **not a secret**.

## Where GitHub Pages' static-only constraint forces the backend

GitHub Pages serves **static files only** — HTML, CSS, JS, images. No PHP/Ruby/Python, no server-side code, no CGI, no database. This is a hard platform rule, not a config. Consequences for this project:

| Need | GitHub Pages cannot do it | Forced solution |
|------|---------------------------|-----------------|
| Any API call | No runtime | **Supabase Data API** from the browser |
| Auth | No sessions on a server | **Supabase Auth** (JWT in browser) |
| File storage for licenses | No filesystem | **Supabase Storage** (private bucket) |
| Sending email/SMS | No server code | **Edge Function** (or provider called from it) |
| Scheduled jobs / cron | No scheduler | **pg_cron + pg_net → Edge Function** |
| Server-only secrets | Public repo, public bundle | **Edge Function env secrets** |
| Privileged DB writes (service role) | No safe place for the key | **Edge Function** |
| Deep links / refresh on `/bookings/123` | No SPA fallback server | **HashRouter** or a **404.html redirect** shim |

**Routing detail (relevant to the SPA shell):** GitHub Pages returns 404 for a deep link like `/bookings/123` because no file exists there. Two fixes: (a) `HashRouter` (URLs get `#/bookings/123`, always serves `index.html`), or (b) ship `public/404.html` that redirects to `index.html` preserving the path. Also set Vite `base` correctly for the project subpath (`/<repo>/`) and remember Pages serves from Linux (case-sensitive) — relative paths, no leading `/`.

**Net:** GitHub Pages is a *hosting* choice, not a backend. Supabase **is** the backend. If a requirement can't be met by RLS-authorized Data/Storage calls or an Edge Function, it can't be met on this stack without a new host.

## Architectural Patterns

### Pattern 1: RLS-first authorization (the default)

**What:** every table has RLS enabled with least-privilege policies; the client is assumed hostile.
**When to use:** always, for every table in the `public` schema.
**Trade-offs:** + security is centralized and testable; + no per-endpoint auth code. − requires disciplined policy writing; − one missing policy = a locked screen or a leak.

```sql
-- defense in depth: least-privilege grants, then policies
alter table public.bookings enable row level security;
grant select, insert, update on public.bookings to authenticated;  -- anon: no grant at all
```

### Pattern 2: Security-definer helpers for role/relationship checks

**What:** `private.is_admin()`, `private.has_role()`, `private.owns_booking()` — read restricted tables as their owner.
**When to use:** any policy that would otherwise query the same or a related table (prevents `42P17` recursion, improves performance).
**Trade-offs:** + correct + fast (wrappable in `(select …)`); − must `revoke execute` from `anon`/`authenticated` or the function becomes a callable API endpoint.

### Pattern 3: DB-enforced state machine + append-only audit

**What:** `BEFORE UPDATE` trigger whitelists transitions; `AFTER UPDATE` trigger writes `booking_events`.
**When to use:** multi-actor workflows (booking, credential review, equipment rental).
**Trade-offs:** + impossible to bypass from any client; + audit is automatic; − every new state costs a trigger edit (acceptable for a small, stable workflow).

### Pattern 4: Server-authoritative notifications

**What:** writes insert a `notifications` row (Realtime pushes it in-app); a DB trigger or Edge Function sends email/SMS out-of-band.
**When to use:** confirmations, approvals, reminders.
**Trade-offs:** + one fan-out point; + in-app and email stay consistent. − needs the `notify` function and secret config early; keep it nullable so the app works before email is wired.

### Pattern 5: Realtime instead of polling

**What:** subscribe to `postgres_changes` on `bookings`/`notifications`, filtered per role; invalidate TanStack Query caches on event.
**When to use:** live dashboards (patient tracking, admin queue, staff job list).
**Trade-offs:** + cheap, responsive; + respects RLS. − needs a connection in the client; RLS on Realtime is enforced but channel setup must be scoped.

```ts
supabase.channel('bookings')
  .on('postgres_changes',
      { event: '*', schema: 'public', table: 'bookings' },
      () => queryClient.invalidateQueries({ queryKey: ['bookings'] }))
  .subscribe();
```

## Anti-Patterns

### Anti-Pattern 1: Role stored in `user_metadata` (or localStorage)
**What people do:** put `role` in `user_metadata` or a client-side store and branch on it.
**Why it's wrong:** `user_metadata` is user-editable; localStorage is user-editable; the bundle is public. A patient can set `role='admin'` and the UI will happily show admin screens (RLS still blocks data *if* you did RLS right — but if you also trusted the client anywhere, you leak).
**Do this instead:** role lives in `profiles.role`; authorization is RLS + `private.is_admin()`; client role claims come only from `app_metadata` (hook-injected).

### Anti-Pattern 2: Recursive RLS policies
**What people do:** a `profiles` policy that selects from `profiles`; two tables whose policies read each other.
**Why it's wrong:** Postgres raises `42P17 infinite recursion detected in policy for relation` and **every** query on those tables fails.
**Do this instead:** move the lookup into a `security definer` function in the `private` schema.

### Anti-Pattern 3: Doing state transitions only in React
**What people do:** enforce `requested→confirmed→…` in a reducer, then `update({status})` freely.
**Why it's wrong:** the client is public; anyone can PATCH an arbitrary status (subject only to RLS row-visibility, not transition legality).
**Do this instead:** transition trigger + role guards in the DB; the client only *requests* the next legal state.

### Anti-Pattern 4: Public storage bucket for license documents
**What people do:** use a public bucket for convenience; anyone with the URL reads CNICs and licenses.
**Why it's wrong:** public buckets bypass RLS entirely; URLs leak.
**Do this instead:** private `credentials` bucket, folder-scoped RLS, short-TTL signed URLs for admin review.

### Anti-Pattern 5: `service_role` key anywhere near the frontend
**What people do:** "just use the service key to make the admin page work." It bypasses RLS. If it lands in a `VITE_` var it is published to the world.
**Do this instead:** service-role work goes in Edge Functions; admins get an `admin` *role* enforced by RLS, not a service key.

### Anti-Pattern 6: `SELECT *` from `staff_profiles` for patients
**What people do:** expose the whole staff table so patients can see who's available.
**Why it's wrong:** leaks license numbers, expiry, rejection reasons, contact data.
**Do this instead:** an approved-only `public_staff` **view** exposing name, type, bio, rating — and grant `select` on the view, not the table.

### Anti-Pattern 7: Unwrapped `auth.uid()` in policies
**What people do:** `using (auth.uid() = user_id)`.
**Why it's wrong:** `auth.uid()` is re-evaluated per row; on large tables this is a noticeable cost.
**Do this instead:** wrap as `(select auth.uid())` so it's evaluated once (initplan).

### Anti-Pattern 8: Building a routing/drive-time scheduling engine in v1
**What people do:** jump straight to technician routing, travel buffers, live GPS.
**Why it's wrong:** it's a multi-month project on its own and delays the first paid booking (the actual success metric).
**Do this instead:** availability windows + conflict check for MVP; treat routing as a later dedicated service.

## Suggested Build Order

Dependencies are strict — each layer's policies depend on the prior layer's helpers, and bookings reference the catalog.

```
PHASE 0  Repo + deploy        ──► GitHub Actions → Pages, HashRouter/404, Vite base
         (no Supabase dependency)      (Also: the SEIC assignment structure lives here.)
                │
PHASE 1  Security foundation  ──► Supabase project, migrations baseline, Auth config,
         profiles + role enum,     handle_new_user trigger, private.* helpers,
         Custom Access Token Hook, RLS on profiles, seed first admin (manual SQL)
                │  (EVERYTHING below depends on Private.* + role model.)
                ▼
PHASE 2  Catalog              ──► services, equipment, service_areas
         public read + admin write policies; admin CRUD screens
                │  (bookings FK to services/areas.)
                ▼
PHASE 3  Patient booking      ──► bookings + booking_status enum + transition trigger
         booking_events + patient RLS; booking wizard; Realtime on own bookings
                │  (assignment needs approved staff → Phase 4.)
                ▼
PHASE 4  Staff onboarding     ──► staff_profiles, credential_documents,
         credentials bucket + storage RLS; upload UI; staff dashboard shell
                │
                ▼
PHASE 5  Admin console        ──► verification queue (PNMC/PMDC check), approve/reject,
         assignment, booking oversight timeline, catalog admin
                │
                ▼
PHASE 6  Edge Functions       ──► notify (email/SMS), admin-invite,
         + pg_cron scheduled reminders / no-show / license-expiry
                │
                ▼
PHASE 7  Equipment rental     ──► equipment_rentals + its own state machine & availability
                │
                ▼
PHASE 8  Hardening            ──► RLS test suite, audit review, rate limits,
                                       privacy/consent, retention, observability
```

**Ordering rationale:**
- **Phase 1 before anything:** every policy calls `private.*`. Building tables first means rewriting policies.
- **Catalog (2) before booking (3):** `bookings` FK to `services`/`service_areas`.
- **Staff onboarding (4) before admin assignment (5):** you can't assign unverified staff, so the verification pipeline must exist before assignment UX.
- **Edge Functions (6) after core flows (3–5):** the app must function without email; notifications are additive, not blocking. This keeps the first end-to-end booking achievable without wiring Resend.
- **Equipment (7) late:** it's a separable vertical with its own state machine; don't let it block the core nursing/doctor booking.
- **Hardening (8) is a phase, not a vibe:** an RLS test suite (assert patient cannot read another patient's booking; staff cannot read unassigned bookings; non-admin cannot flip role) is the safety net for the whole security model.

**Parallelizable:** Phase 0 (deploy/assignments) and Phase 1 (Supabase foundation) can proceed in parallel if separate people own them. Phases 2 (catalog) and the staff UI shell can start once Phase 1 merges.

## Scaling Considerations

| Scale | Architecture adjustments |
|-------|--------------------------|
| 0–1k users (pilot) | Defaults are fine. Single Supabase project, no read replicas. Focus on correctness + RLS tests. Index FKs (`patient_id`, `staff_id`, `status`) and `bookings(scheduled_start)`. |
| 1k–100k users | Wrap all `auth.uid()` in `(select …)`; add composite indexes for the hot dashboards; move heavy admin reads to views/RPC; enable connection pooling (Supavisor); batch/replace per-row notification triggers with a queue. |
| 100k+ users | Partition `bookings`/`booking_events` by time; move notifications to a proper queue (pgmq/Edge); consider a dedicated scheduling service; read replicas for analytics; revisit data-localization (below). |

### Scaling priorities
1. **First bottleneck:** admin dashboard queries fanning out with per-row role checks — fix with `(select auth.uid())`, security-definer helpers, and covering indexes.
2. **Second bottleneck:** synchronous notification fan-out on writes — move to a queued/async model (pg_cron sweep or queue) so booking writes stay fast.
3. **Third bottleneck:** booking table growth — partition by `scheduled_start`.

## Integration Points

### External Services

| Service | Integration pattern | Notes / gotchas |
|---------|---------------------|-----------------|
| **Supabase Auth** | `@supabase/supabase-js`; phone OTP via Twilio/MessageBird/Vonage | Provider creds live in Supabase Auth config, not the browser. OTP default 6 digits, ~60s resend throttle. WhatsApp only via Twilio/Twilio Verify. |
| **Supabase Storage** | Client upload; folder = `auth.uid()` | Private bucket; reconcile orphan objects/rows with a cron job. |
| **Supabase Edge Functions** | `supabase.functions.invoke()` from client; `pg_net` from cron | `verify_jwt` on by default; return permissive CORS is fine, but never embed keys. |
| **Email (Resend et al.)** | Called from `notify` Edge Function | Store API key via `supabase secrets`. |
| **SMS provider** | Auth-native for OTP; Edge Function for non-auth SMS | Keep non-auth SMS minimal (cost + spam). |
| **PNMC / PMDC registers** | **Manual** human check (link-out) | No public API; nurses verify by CNIC on `online.pnmc.gov.pk`, doctors by registration number on `pmdc.pk`. |
| **Maps (Leaflet/OSM)** | Client-side only | Address picker only for MVP; no routing engine. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Client ↔ Data API | HTTPS + JWT | RLS is the boundary. Never bypass with a service key. |
| Client ↔ Storage | HTTPS + JWT | Bucket-private; folder-scoped policies. |
| Client ↔ Edge Functions | `functions.invoke()` | Only for secret-bearing ops. |
| Data API ↔ Postgres `private` | Function calls inside policies | `private` schema excluded from API; `execute` revoked. |
| Postgres ↔ Edge Functions | `pg_cron` + `pg_net` HTTP | Trusted clock; secrets from Vault. |
| Postgres ↔ Realtime | Logical replication | `postgres_changes` subscriptions respect RLS. |

## Security & Privacy (Pakistan healthcare context)

**Regulatory state (as of research):**
- **Personal Data Protection Bill (PDPB) 2023** — drafted by MoITT; a private member's version was introduced in the Senate and later withdrawn, so **it is not enacted law yet**. The draft nonetheless signals the compliance direction: health data is explicitly **"sensitive personal data"**, and "critical personal data" would have a **data-localization** requirement (processing only on servers inside Pakistan). Watch this — Supabase has no Pakistan region, so localization, if enacted, would force a self-hosted Postgres in-country.
- **PECA 2016** — cybercrime / unauthorized access; relevant to access control and breach handling.
- **PNMC Act (amended 2023), §23** — **prohibits employing unregistered nurses.** Verifying staff is a legal requirement. PMDC governs doctors.
- **CNIC** is the national identity number and a high-sensitivity field — do not treat it like a display name.

**Practical controls to build in from Phase 1 (don't retrofit):**
1. **Data minimization** — collect only what a booking needs; don't store ID scans you don't verify against.
2. **RLS least privilege + private buckets** as the primary technical control (this whole doc).
3. **Consent capture** — record explicit consent for processing health data (PDPB direction), timestamped, per user.
4. **Audit trail** — `booking_events` + a credential-review log; who saw/approved what, when.
5. **Retention & deletion** — a defined retention window for credential docs and a deletion path for patient records.
6. **Breach readiness** — the draft PDPB contemplates notification within 72 hours; know who is notified and how.
7. **Region awareness** — document which Supabase region holds the data and flag PDPB localization as an open risk.
8. **Staff PII separation** — license numbers never selectable by patients (view-only public projection).

## Sources

- Supabase — Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security (HIGH)
- Supabase — Custom Claims & RBAC: https://supabase.com/docs/guides/api/custom-claims-and-role-based-access-control-rbac (HIGH)
- Supabase — Custom Access Token Hook: https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook (HIGH)
- Supabase — Storage Access Control / private buckets / helper functions: https://supabase.com/docs/guides/storage/security/access-control , https://supabase.com/docs/guides/storage/buckets/fundamentals , https://supabase.com/docs/guides/storage/schema/helper-functions (HIGH)
- Supabase — Storage ownership (`owner_id`, folder RLS): https://supabase.com/docs/guides/storage/security/ownership (HIGH)
- Supabase — Edge Function auth: https://supabase.com/docs/guides/functions/auth , https://supabase.com/docs/guides/functions/auth-headers (HIGH)
- Supabase — Scheduling Edge Functions (pg_cron + pg_net + Vault): https://supabase.com/docs/guides/functions/schedule-functions , https://supabase.com/docs/guides/cron/quickstart (HIGH)
- Supabase — Phone Login / OTP: https://supabase.com/docs/guides/auth/phone-login (HIGH)
- Supabase — Secure your data (key model, secret vs publishable): https://supabase.com/docs/guides/database/secure-data (HIGH)
- PostgreSQL — CREATE CONSTRAINT TRIGGER / state enforcement via triggers: https://www.postgresql.org/docs/18/sql-createtrigger.html (HIGH)
- General state-machine-via-trigger pattern (independent reference): https://www.pgshift.dev/adapters/state-postgres (MEDIUM)
- GitHub — Pages limits & static-only hosting: https://docs.github.com/en/pages ; custom 404: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site (HIGH)
- SPA deep-link/fallback behavior on static hosts: https://dev.to/buildandcodewithraman/how-to-fix-cannot-get-route-errors-in-single-page-applications-spas-with-static-servers-3460 (MEDIUM)
- Pakistan — Personal Data Protection Bill 2023 (draft): https://moitt.gov.pk/SiteImage/Legislations/Final%20Draft%20Personal%20Data%20Protection%20Bill%20May%202023%20%281%29.pdf ; Senate status (withdrawn) https://www.senate.gov.pk/en/billsummary.php?bid=1182 (MEDIUM — draft, not enacted)
- Pakistan — Digital Rights Foundation analysis (localization, sensitive data): https://digitalrightsfoundation.pk/wp-content/uploads/2023/07/Legal-Analysis-Statement-on-PDPB-July-2023.pdf (MEDIUM)
- PNMC (nurses) — online verification by CNIC: https://online.pnmc.gov.pk/ , https://pnmc.gov.pk/verification-registration-2 (HIGH — official register)
- PNMC Act amendment §23 (prohibition on employing unregistered nurses): https://pnmc.gov.pk/verification-registration-2 (MEDIUM)
- PMDC (doctors) — practitioner register search: https://pmdc.pk/ (HIGH — official register)
- Home-service scheduling domain synthesis (no routing engine in v1; deterministic slot engine): https://getdriive.com/blog/scheduling-engine-for-ai-agents , https://getdriive.com/smart-scheduling (MEDIUM — vendor perspective)

---

*Architecture research for: Happy Health — home care medical services platform (Pakistan)*
*Researched: 2026-10-15*


