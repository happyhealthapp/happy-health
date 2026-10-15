# Roadmap: Happy Health

## Overview

Happy Health ships in five phases that first put mentor-reviewable value on GitHub, then build a security-first platform slice proving one home-care booking is possible end-to-end. **Phase 1** delivers the dated SEIC assignments structure and the auto-deploying site shell — the founder's nearest milestone. **Phase 2** establishes Supabase accounts and database-enforced roles, the security foundation every later table rides on. **Phase 3** exposes the service and equipment catalog plus the human support channels. **Phase 4** onboards nurses and doctors and verifies their registration before any profile goes live. **Phase 5** closes the loop: a patient requests a service, an admin confirms it and assigns a verified staff member, emails fire on key transitions, and payment is recorded on completion. The order is **security-first** (roles and RLS before data) and **supply-first** (verified staff before patient demand), which neutralises the research's top pitfalls.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Assignments & Deploy Pipeline** - Dated SEIC session folders mentors can browse; site auto-deploys on push
- [ ] **Phase 2: Accounts & Roles** - Patient and staff sign-up, persistent sessions, database-enforced roles
- [ ] **Phase 3: Service & Equipment Catalog + Support** - Browsable catalog with indicative pricing and human support channels
- [ ] **Phase 4: Staff Onboarding & Verification** - Staff apply with credentials; profiles go live only after admin verification
- [ ] **Phase 5: Booking, Admin Operations & Notifications** - End-to-end booking request, admin confirm/assign, emails, payment flag

## Phase Details

### Phase 1: Assignments & Deploy Pipeline
**Goal**: Mentors can browse every SEIC session's notes, assignment, and resources in a dated structure on GitHub, and the site deploys automatically on every push to `main`.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: ASG-01, ASG-02, DEPL-01
**Success Criteria** (what must be TRUE):
  1. A mentor opening the repository README reaches the `assignments/` index and every session folder in one click, with no broken links.
  2. Each SEIC session has its own dated Mon/Wed/Fri folder containing a README with that session's notes, assignment, and resources.
  3. The React (Vite + TypeScript) app shell loads at the GitHub Pages URL without errors.
  4. A push to `main` automatically rebuilds and republishes the site on GitHub Pages.
**Plans**: TBD
**UI hint**: yes

### Phase 2: Accounts & Roles
**Goal**: Patients and staff can create accounts, sign in, and reach the surface for their role, with sessions that persist across browser refresh.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04
**Success Criteria** (what must be TRUE):
  1. A new patient can register and reach a patient-facing authenticated page.
  2. A new nurse/doctor can register and reach a staff-facing authenticated page.
  3. Reloading the browser keeps the signed-in user logged in.
  4. Patient and staff logins route to different surfaces by role, and role is enforced by the database (a patient cannot read staff or admin data).
**Plans**: TBD
**UI hint**: yes

### Phase 3: Service & Equipment Catalog + Support
**Goal**: Visitors can see what Happy Health offers — home nursing, doctor home visits, and medical equipment — with indicative pricing, and can reach a human for help.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: CATL-01, CATL-02, EQUP-01, SUPP-01
**Success Criteria** (what must be TRUE):
  1. A visitor can browse home nursing, doctor home visit, and medical equipment categories, each with a description and indicative price.
  2. A visitor can view an equipment catalog with rental rates and submit an equipment request for manual fulfilment.
  3. An admin can add or edit a catalog item and the change appears without a code deploy.
  4. A visible phone helpline and a working WhatsApp click-to-chat link are present on the site.
**Plans**: TBD
**UI hint**: yes

### Phase 4: Staff Onboarding & Verification
**Goal**: Nurses and doctors can apply with their credentials, and a staff profile becomes patient-visible only after an admin verifies the registration against the official public register.
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: STAFF-01, STAFF-02, STAFF-03, VERF-01, VERF-02
**Success Criteria** (what must be TRUE):
  1. A nurse can submit a registration with PNC/PNMC number, CNIC, years of experience, services offered, and city.
  2. A doctor can submit a registration with PMDC number, years of experience, services offered, and city.
  3. A staff profile renders photo, bio, credentials summary, experience, service list, service area, and gender — but stays hidden until an admin marks it verified.
  4. An admin can check a submitted registration number against the public PNMC/PMDC register and record the verification outcome.
  5. Assigning an unverified staff member to a booking is rejected at the data layer, not by convention.
**Plans**: TBD
**UI hint**: yes

### Phase 5: Booking, Admin Operations & Notifications
**Goal**: A patient can request a home service end-to-end and an admin can confirm it, assign a verified staff member, and drive it to completion — with email notifications on key transitions and cash-on-completion recorded.
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: ADDR-01, BOOK-01, BOOK-02, BOOK-03, ADMN-01, ADMN-02, SUPP-02, NOTF-01
**Success Criteria** (what must be TRUE):
  1. A patient can submit a booking (service → date/time → Pakistan-style address → patient details) with a staff gender preference, and an incomplete address (missing city or area) is rejected.
  2. A booking moves through its defined lifecycle (requested → confirmed → assigned → in-progress → completed/cancelled) and illegal transitions are rejected.
  3. An admin can view bookings, confirm or cancel one, and assign a verified staff member to it.
  4. Confirming or assigning a booking triggers the expected email notification.
  5. The site states payment is due on completion, and an admin can record a paid/unpaid flag on a booking.
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Assignments & Deploy Pipeline | TBD | Not started | - |
| 2. Accounts & Roles | TBD | Not started | - |
| 3. Service & Equipment Catalog + Support | TBD | Not started | - |
| 4. Staff Onboarding & Verification | TBD | Not started | - |
| 5. Booking, Admin Operations & Notifications | TBD | Not started | - |

---
*Roadmap created: 2026-10-15*
