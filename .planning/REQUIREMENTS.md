# Requirements: Happy Health

**Defined:** 2026-10-15
**Core Value:** Give patients trustworthy, on-demand access to home nursing, doctor visits, and medical equipment — delivered by verified professionals at home.

**Source research:** `.planning/research/FEATURES.md` (v1/V1.x/V2+ buckets), `.planning/PROJECT.md` (REQ-ASG-\*, REQ-PLAT-\*).

---

## v1 Requirements

Requirements for the first milestone. Two linked workstreams: **(A)** the mentor-reviewable SEIC assignments structure and **(B)** the minimum platform slice that proves the concept — a patient can request a service and an admin can onboard + assign verified staff. Each maps to a roadmap phase.

> Legacy IDs from PROJECT.md map as follows: `REQ-ASG-01/02` → **ASG-\***; `REQ-PLAT-03` → **CATL/BOOK/ADDR-\***; `REQ-PLAT-04` → **STAFF-\***; `REQ-PLAT-05` → **AUTH-\***; `REQ-PLAT-06` → **DEPL-01**.

### Assignments (SEIC program)

- [x] **ASG-01**: SEIC session assignments are organized in a dated Mon/Wed/Fri folder structure under `assignments/` that mentors can browse
- [x] **ASG-02**: Repository README gives mentors one entry point linking each session's notes, assignment, and resources, in date order

### Authentication & Accounts

- [ ] **AUTH-01**: A patient can create an account and sign in
- [ ] **AUTH-02**: A nurse/doctor (staff) can create an account and sign in
- [ ] **AUTH-03**: User session persists across browser refresh
- [ ] **AUTH-04**: Staff and patient accounts are distinguishable (role-bearing) so each sees the right surface

### Service Catalog

- [ ] **CATL-01**: A patient can browse categorized services — home nursing, doctor home visit, medical equipment — each with a short description and indicative price
- [ ] **CATL-02**: Catalog content is seedable/editable by an admin without a code change

### Address Capture

- [ ] **ADDR-01**: A patient can enter a Pakistan-style address (City → Area/Town → House No. → Street → nearest Landmark) when requesting a booking

### Booking

- [ ] **BOOK-01**: A patient can submit a booking request (service → date/time → address → patient details)
- [ ] **BOOK-02**: A booking has an explicit status lifecycle with defined transitions (requested → confirmed → assigned → in-progress → completed / cancelled)
- [ ] **BOOK-03**: A patient can state a staffing gender preference (e.g. female nurse for a female patient) at booking time

### Staff Onboarding

- [ ] **STAFF-01**: A nurse can register with PNC/PNMC registration number, CNIC, years of experience, services offered, and city
- [ ] **STAFF-02**: A doctor can register with PMDC registration number, years of experience, services offered, and city
- [ ] **STAFF-03**: A staff member has a profile (photo, bio, credentials summary, experience, service list, service area, gender) visible to patients

### Credential Verification

- [ ] **VERF-01**: An admin can verify a submitted PNC/PNMC/PMDC number against the official public register before a staff profile goes live
- [ ] **VERF-02**: An unverified staff member cannot be assigned to a booking (enforced, not by convention)

### Admin Operations

- [ ] **ADMN-01**: An admin dashboard lets an operator view bookings, view/verify staff, and assign staff to a booking
- [ ] **ADMN-02**: An admin can confirm or cancel a booking and record a paid/unpaid flag

### Notifications & Support

- [ ] **NOTF-01**: A booking's key status transitions (confirmed, assigned) trigger a transactional email notification
- [ ] **SUPP-01**: A visible phone helpline and a WhatsApp click-to-chat link are available on the site
- [ ] **SUPP-02**: The site clearly states payment is due on completion (cash/offline) — no online payment at v1

### Equipment (catalog only)

- [ ] **EQUP-01**: A patient can view an equipment catalog with rates and submit an equipment request that an admin fulfils manually

### Deployment

- [x] **DEPL-01**: The site deploys automatically to GitHub Pages on push to `main`

---

## Acceptance Criteria

Per-requirement success is defined by the table below; a phase passes only when every listed criterion is observably TRUE.

| Requirement | Acceptance criterion |
|-------------|----------------------|
| ASG-01 | `assignments/` contains one dated Mon/Wed/Fri folder per session; each has a README explaining the session |
| ASG-02 | Root README links `assignments/` and every session folder resolves without a 404 on GitHub |
| AUTH-01 | A new patient can register and reach an authenticated page after refresh |
| AUTH-02 | A new nurse/doctor can register and reach their staff surface after refresh |
| AUTH-03 | Reloading the browser keeps the user signed in |
| AUTH-04 | Patient and staff logins route to different surfaces based on role |
| CATL-01 | The three service categories render with description and indicative price |
| CATL-02 | An admin can add/edit a catalog item without a deploy |
| ADDR-01 | A booking cannot be submitted with an incomplete address (city + area required) |
| BOOK-01 | A submitted request appears in the admin dashboard with all captured fields |
| BOOK-02 | A booking moves through the defined states and illegal transitions are rejected |
| BOOK-03 | A gender preference is stored on the booking and visible to the admin |
| STAFF-01 | A nurse submission stores PNC/PNMC number, CNIC, experience, services, city |
| STAFF-02 | A doctor submission stores PMDC number, experience, services, city |
| STAFF-03 | A staff profile renders photo, credentials, experience, services, area, gender |
| VERF-01 | A staff profile cannot become patient-visible until an admin marks it verified |
| VERF-02 | Assigning an unverified staff member to a booking fails at the data layer |
| ADMN-01 | An admin can view bookings, verify staff, and assign a staff member to a booking |
| ADMN-02 | An admin can confirm/cancel a booking and set paid/unpaid |
| NOTF-01 | Confirming/assigning a booking sends the expected email |
| SUPP-01 | The phone number and WhatsApp link are visible and functional |
| SUPP-02 | The payment-on-completion statement is present and a paid/unpaid flag is recorded |
| EQUP-01 | An equipment request from the catalog appears in the admin dashboard |
| DEPL-01 | A push to `main` results in the updated site on the GitHub Pages URL |

---

## v2 Requirements

Deferred to a future release. Acknowledged but **not** in the current roadmap.

### Trust & Feedback

- **REVW-01**: Patients can leave double-blind ratings/reviews after a completed booking

### Communications

- **NOTF-02**: WhatsApp Business API templates for confirmation/reminder
- **FAM-01**: Family portal — read-only shared view of a booking's status and notes

### Scheduling & Payments

- **AVAIL-01**: Staff can set an availability calendar; double-booking is prevented
- **PAY-01**: Online payments via JazzCash / Easypaisa / Raast QR

### Verification (assisted)

- **VERF-03**: Store registry-lookup result + expiry and surface it on the staff profile

### Operations

- **EQUP-02**: Full equipment rental lifecycle (serialized units, deposits, delivery/install, sanitization, recurring billing)
- **PKG-01**: Care packages / subscriptions (post-acute, chronic, palliative; 12h/24h shifts)
- **I18N-01**: Urdu/bilingual UI and service content

### Scale

- **MOB-01**: Native mobile apps (iOS/Android)
- **CITY-01**: Multi-city expansion beyond Karachi
- **MTCG-01**: Automated/AI staff matching and ranking

---

## Out of Scope

Explicitly excluded. Documented to prevent scope creep. Anti-features sourced from `FEATURES.md`.

| Feature | Reason |
|---------|--------|
| Full EHR / clinical-records system | Compliance-heavy, does not move the success metric (first paid booking); store only booking-relevant data |
| Payments / escrow / split payouts at MVP | Deferred by founder; multi-party settlement needs merchant onboarding + compliance for zero validation value at 0 bookings |
| In-app real-time chat | The request form *is* the message; chat hides where the booking loop breaks — use phone/WhatsApp |
| Native mobile apps at launch | Doubles build + release surface; web-first (responsive/PWA-friendly) |
| Public star ratings at launch | Sparse/fake-looking early reviews reduce trust; launch double-blind reviews once volume is credible |
| Advanced search / ranking / recommendation engine | Needs hundreds of listings to be useful; simple filtered list is the documented MVP pattern |
| US-style GPS/EVV visit verification, Medicaid/EDI billing, HIPAA audit trails | US-regulatory artifacts with no equivalent local need |
| Insurance-claims / corporate-billing automation | Requires payer contracts that do not exist yet; private-pay first |
| Multi-city expansion at launch | Marketplace liquidity is local; Karachi-first pilot |
| Multi-vendor shopping cart | Complex; niche marketplaces rarely need it — one booking per service, bundle via concierge |
| Real-time everything (live tracking/chat/dashboards) | Adds WebSocket infra + failure modes with no early value; pull-based status pages |

---

## Definition of Done

A v1 requirement is **Complete** only when all of the following hold:

1. **Implemented** — the behavior exists on the deployed GitHub Pages site (not just locally).
2. **Verified** — automated checks pass where applicable, and the linked acceptance criterion above has been manually confirmed on the real surface.
3. **Committed** — the change is committed to the `happy-health` repo on `main`.
4. **Traceable** — the requirement's row in the Traceability table is marked `Complete`.

**Milestone release criteria (first mentor-reviewable milestone):**

- The `assignments/` structure is live on GitHub and browsable by mentors (ASG-01/02, DEPL-01).
- A patient can request a service and an admin can onboard + assign a verified staff member end-to-end (CATL/BOOK/STAFF/VERF/ADMN).
- No requirement in a phase is marked Complete without its acceptance criterion observed as TRUE.

---

## Traceability

Which phases cover which requirements. Populated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| ASG-01 | Phase 1 | Complete |
| ASG-02 | Phase 1 | Complete |
| DEPL-01 | Phase 1 | Complete |
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 2 | Pending |
| AUTH-03 | Phase 2 | Pending |
| AUTH-04 | Phase 2 | Pending |
| CATL-01 | Phase 3 | Pending |
| CATL-02 | Phase 3 | Pending |
| EQUP-01 | Phase 3 | Pending |
| SUPP-01 | Phase 3 | Pending |
| STAFF-01 | Phase 4 | Pending |
| STAFF-02 | Phase 4 | Pending |
| STAFF-03 | Phase 4 | Pending |
| VERF-01 | Phase 4 | Pending |
| VERF-02 | Phase 4 | Pending |
| ADDR-01 | Phase 5 | Pending |
| BOOK-01 | Phase 5 | Pending |
| BOOK-02 | Phase 5 | Pending |
| BOOK-03 | Phase 5 | Pending |
| ADMN-01 | Phase 5 | Pending |
| ADMN-02 | Phase 5 | Pending |
| SUPP-02 | Phase 5 | Pending |
| NOTF-01 | Phase 5 | Pending |

**Coverage:**

- v1 requirements: 24 total
- Mapped to phases: 24 ✓
- Unmapped: 0

---
*Requirements defined: 2026-10-15*
*Last updated: 2026-10-15 after roadmap creation*
