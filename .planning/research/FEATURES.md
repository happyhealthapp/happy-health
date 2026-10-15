# Feature Research

**Domain:** Home-care / on-demand health-booking marketplace (Pakistan-first: home nursing, doctor home visits, medical-equipment rental)
**Project:** Happy Health
**Researched:** 2026-10-15
**Confidence:** MEDIUM (cross-verified across many independent sources; official PNMC/PMDC/SHCC sources corroborate the credential-verification items at HIGH)

---

## How to Read This Document

This is the **features dimension** of project research. It answers: *what do home-care / on-demand health-booking products actually ship, and which of those belong in Happy Health's v1?*

Three buckets:

- **Table Stakes** — users assume these exist. Missing = product feels broken/unsafe.
- **Differentiators** — where Happy Health can win. Align to Core Value ("trustworthy, on-demand access … delivered by verified professionals").
- **Anti-Features** — things that look attractive but create disproportionate cost, risk, or complexity. Documented with the *better alternative*.

**Founder's stated v1 focus (earliest milestone):** assignments structure (SEIC session tracking in the repo) + basic patient booking + nurse/doctor onboarding. Every table-stakes row below carries a **v1?** column:

| v1? | Meaning |
|-----|---------|
| **V1** | In scope for the earliest milestone (assignments repo structure + booking/onboarding). |
| **V1.x** | Ship right after the first paid booking is validated. |
| **V2+** | Defer until product-market fit / funding. |

---

## Feature Landscape

### Table Stakes (Users Expect These)

These are the features whose absence makes a home-care booking product feel incomplete or unsafe. Sourced from Pakistan platforms (Sehat Kahani, Dawaai, Marham, Qare, Nannzy, E-Tib), India operators (Portea, Nightingales, HealthAtHome, MedRabbits), and generic service-marketplace playbooks (Sharetribe, Stripe, Leeonex).

| Feature | Why Expected | Complexity | v1? | Notes |
|---------|--------------|------------|-----|-------|
| **Service catalog** (nursing / doctor home visit / equipment) | Patients must see what can be booked and roughly what it costs before they commit. Every competitor leads with a categorized service list. | LOW | **V1** | Static-first: categories → service → short description → indicative price. Seed manually. Satisfies REQ-PLAT-03 "browse services". |
| **Booking request flow** (service → date/time → address → patient details → submit) | The core transaction. Without it there is no product. | MEDIUM | **V1** | Do **not** build a calendar/availability engine at v1. A *request* (not guaranteed instant slot) is the MVP — admin confirms manually. Matches the high-touch reality of Pakistan's referral-driven market. |
| **User accounts & auth** (patient + staff) | Both sides need identity to book, track, and be contacted. | LOW–MEDIUM | **V1** | Supabase Auth. Phone (+92) or email. Passwordless/OTP is friendlier for Pakistani users; email+password acceptable to start. Satisfies REQ-PLAT-05. |
| **Location / address capture** (city + area + house/street/landmark) | In-person service; the provider must reach a real door. Pakistani addressing is area/landmark-based, not street-number-based. | LOW | **V1** | Karachi-first. Fields: City → Area/Town → House No. → Street → nearest Landmark. Area-level (not exact pin) is enough at v1. |
| **Staff registration / onboarding** (license number, CV/experience, services) | Supply side of the marketplace; also the trust foundation. | MEDIUM | **V1** | Nurse: PNC/PNMC registration number + CNIC. Doctor: PMDC number. Plus years of experience, services offered, city. Satisfies REQ-PLAT-04. |
| **Staff profile** (photo, bio, experience, services, indicative rate) | Patients choose people, not services — they need to see who is coming into their home. | LOW–MEDIUM | **V1** | Profile is the primary trust artifact. Keep it simple: photo, credentials summary, experience, service list, service area. |
| **Credential / license verification (admin review)** | Healthcare is regulated; an unverified "nurse" is a safety and legal liability. | MEDIUM | **V1** | Admin manually checks the submitted PNC/PNMC/PMDC number against the official public register before a profile goes live. See "Credential verification" under Differentiators — at minimum, manual review must exist at v1. |
| **Booking status lifecycle** (requested → confirmed → assigned → in-progress → completed / cancelled) | Both sides need to know where a booking stands; support load collapses without it. | MEDIUM | **V1** | Implement as an explicit state field with defined transitions. Target the 9 canonical states documented in marketplace research (requested, accepted, declined, expired, paid, in-progress, completed, cancelled-by-patient, cancelled-by-staff). v1 can ship the core 5 and expand. |
| **Admin dashboard** (view bookings, view/verify staff, assign staff to booking) | The marketplace is operated, not self-serve, in early days. The operator is the algorithm. | MEDIUM | **V1** | This *is* the earliest milestone's second half. Admin assigns staff to a booking, confirms/cancels, approves staff. Supabase tables + a simple internal view. |
| **Notifications** (booking confirmed / assigned / reminder) | Users will not refresh a web page to learn if a nurse is coming. | MEDIUM | **V1 (minimal) → V1.x** | v1 minimum: transactional email + a "click to chat"/WhatsApp link. Full WhatsApp Business API / SMS automation is V1.x (see below — WhatsApp is the dominant channel in Pakistan). |
| **Human support channel** (phone / WhatsApp helpline) | Pakistani consumers expect to talk to a person; a web-only funnel loses high-intent families. Marham, Portea, Nightingales all publish phone numbers prominently. | LOW | **V1** | A visible number + WhatsApp deep-link is enough. This mirrors the "concierge mode" that successful early marketplaces use. |
| **Equipment catalog with rental terms** (device → daily/weekly/monthly rate → availability) | If equipment rental is advertised, users expect rates and a way to ask for it. | MEDIUM | **V1 (catalog/request) → V1.x (full rental lifecycle)** | v1: list equipment + rates + a request form (manually fulfilled). Deposits, serialized units, delivery/install and recurring billing are V1.x (see Equipment-specific features below). |
| **Payment path (at least defined)** | Users must understand how and when they pay. In Pakistan, **cash / COD is normal and expected**; online wallets are growing. | MEDIUM | **V1 (cash/offline) → V1.x (online)** | PROJECT.md defers payments/escrow until bookings are validated manually. v1 = state clearly that payment is on completion (cash) and record a paid/unpaid flag in admin. Online JazzCash/Easypaisa is V1.x. |
| **Basic trust signals** ("verified" badge, credentials shown, reviews count) | Users are inviting a stranger into their home for medical care. Trust is the product. | LOW–MEDIUM | **V1** | "Verified" badge + PNC/PMDC number shown on profile. Public star reviews can wait (see Anti-Features). |

### Differentiators (Competitive Advantage)

Where Happy Health can be more than "another directory". Ranked loosely by leverage for a Pakistan-first launch. A healthy MVP ships **one or two** of these well rather than all of them poorly.

| Feature | Value Proposition | Complexity | v1? | Notes |
|---------|-------------------|------------|-----|-------|
| **Registry-backed credential verification** (check PNC/PNMC + PMDC public registers, plus CNIC) | Turns "verified" from a marketing word into a claim a patient can trust. Local competitor Qare already advertises verification "against the Pakistan Nursing Council register and their CNIC" — this is becoming table stakes for the trust-conscious segment. | MEDIUM | **V1 (manual) → V1.x (assisted)** | Official registries exist and are public: PNMC allows lookup by CNIC; PMDC allows search by registration number and shows license validity. v1 = admin manually checks; V1.x = store the registry result and expiry, surface it on the profile. **This is the single highest-leverage differentiator for Happy Health's stated Core Value.** |
| **Concierge / assisted booking** (operator matches staff by phone or WhatsApp, not a self-serve grid) | Matches how Pakistani families actually buy care — via trust and referrals. Data point: technology-first home-care startups (Respect, HomeHero) failed partly because "the market is not open to anything other than a high-touch referral model." | LOW | **V1** | Low cost, high fit: the admin dashboard *is* the matching engine at v1. Automate later only when volume demands it. |
| **Female-staff / gender-preference matching** | Culturally decisive in Pakistan: families frequently require a female nurse/attendant for female patients. Home-care sellers in the region explicitly offer gender filtering. | LOW | **V1** | Capture staff gender and let patients request a preference at booking. Small data-model addition, large conversion effect for the target segment. |
| **Urdu + English bilingual UI and content** | Broadens reach and signals "for us, not for expats only." Research on Pakistani e-commerce consistently recommends Urdu labels and bilingual messaging. | LOW–MEDIUM | **V1.x** | Start with bilingual service descriptions and key UI strings; full localization later. |
| **WhatsApp-first communication** (booking confirmation, updates, reminders) | In Pakistan, WhatsApp is the primary channel (~80M users; open rates far above SMS/email). It is the pragmatic national notification layer. | MEDIUM | **V1.x** | v1 = "chat on WhatsApp" links; V1.x = WhatsApp Business API templates for confirmation/reminder. |
| **Doctor + nurse + equipment on ONE platform** | Bundled home-care (e.g. post-surgical: doctor visit + nurse shifts + hospital bed) is a stronger value proposition than any single vertical. Sehat Kahani bundles similarly and reports strong patient satisfaction. | MEDIUM | **V1 (catalog) → V1.x (journey)** | The catalog can list all three at v1; the *integrated care journey* (one patient, one care plan, many providers) is the differentiator to build next. |
| **Care packages / care plans** (post-acute, chronic, palliative; day/night; 12h/24h shifts) | Sells outcomes and recurring revenue rather than one-off gigs; a proven pattern in India (Nightingales, Portea) and by Sehat Kahani in Pakistan. | MEDIUM–HIGH | **V2+** | Requires availability, recurring scheduling, and billing to be solid first. |
| **Family portal / care monitoring** (share visit updates with family) | Many payers are adult children not living at home; remote visibility is the emotional buying trigger. Called out as a "rare" differentiator among home-care software. | MEDIUM | **V1.x** | Supabase + a simple read-only view of a booking's status/notes shared by link or login. |
| **Ratings & reviews (double-sided / blind)** | The strongest scalable trust mechanism for a two-sided marketplace; also an anti-leakage tool. | MEDIUM | **V1.x** | Only after enough completed bookings exist to be credible (see Anti-Features). Blind/reciprocal design to reduce retaliation. |
| **Availability calendar** (staff set working hours; prevent double-booking) | Core supply-side tool that makes the marketplace usable without an operator in the loop. | MEDIUM | **V1.x** | v1 relies on the admin matching; add a real availability model once volume justifies it. |
| **Shift-based / live-in booking** (multi-hour, overnight, weekly contracts) | Home nursing is often long-duration (recovery, geriatric, palliative), not a 30-minute slot. Qare/E-Tib model day/night/hourly options. | MEDIUM | **V2+** | Needs duration modeling and recurring billing. |
| **Equipment rental lifecycle** (serialized units, deposits, delivery/install, sanitization, recurring billing, e-signed agreement at the door) | A genuinely differentiated operational capability; most emergent-market competitors treat equipment as an afterthought. | HIGH | **V2+** | The full pattern from rental-software research: unit-level records, deposit held separately, monthly auto-invoice until collection, technician-app install + OTP-signed agreement, condition photos, service-blocked units. Over-built for v1. |
| **Online payments (JazzCash / Easypaisa / Raast QR)** | Higher checkout completion and far lower no-show/return rates than cash; wallets are growing fast in Pakistan. | MEDIUM–HIGH | **V2+** | Founder explicitly deferred payments. Do not take this on until the booking flow is validated and a business entity/merchant account exists. |

### Anti-Features (Commonly Requested, Often Problematic)

Deliberately **not** building these. Each lists the surface appeal, the real problem, and the better alternative. Several align with the explicit Out-of-Scope list in PROJECT.md.

| Anti-Feature | Why Requested | Why Problematic | Alternative |
|--------------|---------------|-----------------|-------------|
| **Full EHR / clinical-records system** | "We're healthcare — we need patient records." | Massive scope + compliance (data privacy, retention), and it is explicitly Out of Scope in PROJECT.md. It does not move the success metric (first paid booking). | Store only what booking needs: patient name, contact, service, address, notes. Add clinical notes only if a real service requires them. |
| **Payments / escrow / split payouts at MVP** | "A marketplace needs payments." | Founder deferred it; and multi-party payments require merchant onboarding, compliance, refunds, disputes, and payout reconciliation — weeks of work for zero validation value at 0 bookings. | v1 = manual/off-platform settlement (cash on completion) with a paid/unpaid flag. Revisit after booking volume proves willingness to pay. |
| **In-app real-time chat** | Every founder's first feature request. | The first 50 bookings do not need it; the request form *is* the message. Chat hides where the booking loop breaks. | WhatsApp/phone contact link. Add structured messaging only if usability testing shows both sides need a pre-booking question that the request form cannot capture. |
| **Native mobile apps (iOS/Android) at launch** | "Home care is a mobile use case." | Explicitly Out of Scope; doubles build + release surface; app-store review latency vs. web deploy. | Responsive web (Vite/React) + PWA-friendly. Defer native until repeat usage is proven. |
| **Advanced search, ranking & recommendation engine** | "Marketplaces need smart search." | These need hundreds of listings to work; at 10–50 staff they are noise and add complexity (candidate retrieval/re-ranking, cold-start handling, rich-get-richer bias). | A simple list/filtered view sorted by availability, area, and gender preference. This is the documented MVP-search pattern. |
| **Automated / AI staff-matching algorithm** | "Smart matching is our edge." | Premature: the criteria (good supply, what buyers accept, where trust breaks) are still unknown. Manual matching *is* the learning loop. | Operator-driven matching in the admin dashboard; record why each match was accepted/rejected to inform future rules. |
| **Multi-vendor shopping cart** | "Let patients book several things at once." | Complex to build; niche marketplaces rarely need it. | One booking per service; support bundle requests via the concierge flow if needed. |
| **Public star ratings & reviews at launch** | "Reviews build trust." | Reviews are only credible with enough completed exchanges; early sparse/fake-looking reviews can *reduce* trust and invite gaming. | At v1, use admin verification + completion confirmation + a private issue log. Launch public double-blind reviews once there is a real base of completed bookings. |
| **US-style GPS/EVV visit verification, Medicaid/EDI billing, HIPAA audit trails** | Found in every US home-care product's feature list. | These are US regulatory artifacts with no equivalent need in Pakistan; enormous complexity for zero local value. | Simple completion confirmation (patient/admin marks the visit done). Add geolocation only if no-show fraud becomes a real problem. |
| **Insurance-claims / corporate-billing automation** | "Payer integration is where the money is." | Requires payer contracts that do not exist yet; HomeHero failed partly by overestimating payer willingness to fund home care. | Private-pay first (the realistic path). Add corporate/insurer packages only after private-pay demand is proven. |
| **Multi-city expansion at launch** | "Bigger market = faster growth." | Explicitly Out of Scope; marketplace liquidity is local — breadth without density yields empty results and churn. | Karachi-first pilot. Prove one city's liquidity before expanding (matches documented cold-start guidance). |
| **Real-time everything (live tracking, live chat, live dashboards)** | Feels modern. | Adds WebSocket infra and operational load with no early value; introduces failure modes (stale state, partial writes). | Pull-based status pages + notifications. Add real-time only for a named, measured need. |

---

## Feature Dependencies

```
[Service Catalog]
    └──requires──> [Auth/Accounts]              (to attach a booking to a user)
    └──requires──> [Staff Onboarding]           (catalog is only real if supply exists)

[Booking Request]
    └──requires──> [Service Catalog]
    └──requires──> [Address Capture]
    └──requires──> [Booking Status Lifecycle]

[Staff Assignment]
    └──requires──> [Staff Onboarding]
    └──requires──> [Credential Verification]     (never assign an unverified provider)
    └──enhances──> [Booking Status Lifecycle]    (assignment advances the state)

[Notifications]
    └──requires──> [Booking Status Lifecycle]    (you notify on state transitions)

[Ratings / Reviews]
    └──requires──> [Booking Status Lifecycle]    (must reach "completed")

[Payments (online)]
    └──requires──> [Booking Status Lifecycle]
    └──requires──> [Pricing model on Service Catalog]

[Equipment Rental Lifecycle]
    └──requires──> [Equipment Catalog]
    └──requires──> [Availability]
    └──requires──> [Deposits / Billing]          (V2+)

[Availability Calendar]
    └──enhances──> [Staff Assignment]            (replaces manual checking at scale)

[Care Packages / Subscriptions]
    └──requires──> [Availability]
    └──requires──> [Recurring Billing]
    └──conflicts──> [Escrow/one-off payment model]  (recurring vs. per-transaction settlement)
```

### Dependency Notes

- **Booking requires Service Catalog + Auth:** you cannot request a service that is not listed, and a booking needs an owner identity.
- **Staff Assignment requires Credential Verification:** the safety rule of the whole product. An unverified provider must be *unassignable* — enforce at the data layer, not by convention.
- **Notifications require the Status Lifecycle:** notifications are events on state transitions (`requested→confirmed`, `confirmed→assigned`, etc.). Build the state machine first.
- **Reviews require Completed bookings:** treat "completed" as the gate for any review.
- **Equipment Lifecycle requires Deposits/Billing and Availability:** it is a distinct product surface; do not start it until the core booking loop is solid.
- **Care Packages conflict with the v1 cash/one-off settlement model:** recurring billing implies stored payment or invoicing, which the founder deferred. Keep packages in V2+.

---

## MVP Definition

### Launch With (v1) — the earliest milestone

Two linked workstreams: **(A) the SEIC assignments structure** and **(B) the most basic platform slice that proves the concept.** Minimum viable = a patient can request a service and an admin can onboard + assign verified staff.

- [ ] **SEIC assignments repo structure** (Mon/Wed/Fri dated folders, README entry point) — REQ-ASG-01/02. *This is literally the nearest milestone; it is docs + IA, not engineering.*
- [ ] **Supabase project + Auth** (schema for services, staff, bookings; patient + staff accounts) — REQ-PLAT-05.
- [ ] **Service catalog page** (nursing / doctor home visit / equipment with short copy + indicative price) — REQ-PLAT-03.
- [ ] **Patient booking request form** (service, date/time, address, patient details) — REQ-PLAT-03.
- [ ] **Nurse/doctor onboarding form** (name, role, PNC/PMDC number, CNIC, experience, services, city, gender) — REQ-PLAT-04.
- [ ] **Admin verification + assignment dashboard** (approve/reject staff against registry; assign staff to booking; confirm/cancel) — the operator-as-algorithm core.
- [ ] **Booking status + minimal notifications** (status field; email/WhatsApp-link on key transitions).
- [ ] **Human support channel** (phone + WhatsApp link) and **cash-on-completion payment note**.
- [ ] **GitHub Pages auto-deploy on push to main** — REQ-PLAT-06.

### Add After Validation (v1.x)

Add when the first paid bookings are flowing and a pattern of friction is visible.

- [ ] **Ratings & reviews (blind/double-sided)** — trigger: enough completed bookings that reviews are credible.
- [ ] **WhatsApp Business API notifications** — trigger: manual messaging becomes a bottleneck.
- [ ] **Availability calendar for staff** — trigger: double-bookings or manual scheduling overhead.
- [ ] **Online payments (JazzCash/Easypaisa)** — trigger: cash handling/no-shows hurt; business entity + merchant account ready.
- [ ] **Family portal / care updates** — trigger: families asking for remote visibility.
- [ ] **Equipment rental request → fulfillment flow** (deposits, delivery scheduling) — trigger: equipment demand proven.
- [ ] **Urdu/bilingual UI** — trigger: drop-off among non-English users.
- [ ] **Registry-assisted verification** (store registry result + expiry, surface on profile) — trigger: manual checks scale past a handful/week.

### Future Consideration (v2+)

Defer until product-market fit is established.

- [ ] **Care packages / subscriptions (post-acute, chronic, palliative; 12h/24h shifts)** — needs recurring billing + availability.
- [ ] **Serialized equipment-rental lifecycle** (unit records, sanitization, recurring invoices, technician app, door e-signature) — a whole product; wait for demand.
- [ ] **Native mobile apps** — wait for repeat usage.
- [ ] **Multi-city expansion** — wait for Karachi liquidity.
- [ ] **Automated matching / ranking** — wait for enough data to learn from.
- [ ] **Escrow / split payouts** — wait for transaction volume and legal structure.

---

## Founder's v1 Focus Mapping

Direct mapping of the requested features to the stated earliest milestone (assignments structure + basic booking/onboarding):

| Requested feature | Bucket | v1? | Why |
|-------------------|--------|-----|-----|
| Booking flow | Table stakes | **V1** | The literal "basic booking" in the v1 focus. |
| Staff profiles | Table stakes | **V1** | Doctors/nurses onboarding is half the v1 focus. |
| Credential / license verification | Table stakes (manual at v1), Differentiator (assisted later) | **V1** | A nurse/doctor cannot be "onboarded" safely without it; manual registry check at v1. |
| Service catalog | Table stakes | **V1** | Patients must browse before they request. |
| Scheduling / availability | Table stakes → Differentiator | **V1 (manual) → V1.x (calendar)** | v1 uses admin assignment, not a calendar engine. |
| Admin dashboard | Table stakes | **V1** | The operator *is* the assignment engine at v1. |
| Notifications | Table stakes | **V1 (minimal) → V1.x (WhatsApp API)** | Needed to confirm bookings; full automation later. |
| Ratings | Table stakes-in-principle, Anti-Feature-at-launch | **V1.x** | Deferred until credible volume; private feedback at v1. |
| Payments | Table stakes (defined), Differentiator (online) | **V1 (cash/offline) → V2+ (online)** | Founder explicitly deferred payments integration. |
| Assignments structure | Table stakes (program requirement) | **V1** | REQ-ASG-01/02 — the nearest milestone. |

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Service catalog | HIGH | LOW | **P1** |
| Patient booking request | HIGH | LOW–MEDIUM | **P1** |
| Auth / accounts | HIGH | LOW | **P1** |
| Address capture (Pakistan-style) | HIGH | LOW | **P1** |
| Staff onboarding (credentials) | HIGH | MEDIUM | **P1** |
| Staff profile | HIGH | LOW | **P1** |
| Credential verification (manual) | HIGH | MEDIUM | **P1** |
| Booking status lifecycle | HIGH | MEDIUM | **P1** |
| Admin dashboard + assignment | HIGH | MEDIUM | **P1** |
| Notifications (minimal) | MEDIUM | LOW | **P1** |
| Human support (phone/WhatsApp) | HIGH | LOW | **P1** |
| SEIC assignments structure | HIGH (program) | LOW | **P1** |
| Gender-preference matching | HIGH (segment) | LOW | **P1** |
| Equipment catalog + request | MEDIUM | MEDIUM | **P2** |
| Ratings & reviews | MEDIUM | MEDIUM | **P2** |
| WhatsApp Business API | HIGH | MEDIUM | **P2** |
| Availability calendar | MEDIUM | MEDIUM | **P2** |
| Family portal | MEDIUM | MEDIUM | **P2** |
| Bilingual UI | MEDIUM | MEDIUM | **P2** |
| Online payments (JazzCash/Easypaisa) | MEDIUM | HIGH | **P3** |
| Equipment rental lifecycle | MEDIUM | HIGH | **P3** |
| Care packages / subscriptions | MEDIUM | HIGH | **P3** |
| Native mobile apps | MEDIUM | HIGH | **P3** |
| Automated matching | LOW (early) | HIGH | **P3** |
| Escrow / split payouts | LOW (early) | HIGH | **P3** |

**Priority key:** P1 = must have for launch · P2 = should have, add when possible · P3 = nice to have / future.

---

## Competitor Feature Analysis

| Feature | Qare (PK) | Sehat Kahani / Dawaai / Marham (PK) | Portea / Nightingales (IN) | Our Approach (v1) |
|---------|-----------|--------------------------------------|----------------------------|-------------------|
| Booking model | Browse profiles **or** post a job; providers apply | Phone/app booking + video consult; home services | App/website appointment + packages | **Request form + admin confirm** (concierge) |
| Credential verification | PNC register + CNIC (advertised) | PMC-verified doctors; PNMC-based staff | KYC + police verification + caregiver documents | **Manual PNC/PMDC registry check at v1**, assisted later |
| Service breadth | Nurses + physiotherapists | Nursing, doctor visits, therapies, dietitian, mental health, labs, pharmacy | Nursing, doctor visits, physio, diagnostics, equipment, ICU-at-home | **Nursing + doctor visit + equipment catalog** at v1 |
| Equipment rental | No | Dawaai/Sehat Kahani: delivery of equipment | Nightingales: equipment + install/demo by engineers | **Catalog + request at v1**, lifecycle later |
| Payments | Family pays provider directly in cash; 10% commission | App payments / subscription plans | Online + packages | **Cash on completion** at v1 |
| Reviews / trust | Ratings + reviews on profiles | Verified badges + patient reviews | Reviews | Verified badge + credentials at v1; reviews v1.x |
| Availability / scheduling | Post-and-apply; shifts (day/night/hourly) | Appointments / care plans | Rostering + packages | **Admin-assigned** at v1 |
| Language | — | — | Multilingual (regional languages) | **English v1, Urdu v1.x** |
| Coverage | 6 cities | National | Multi-city | **Karachi-first** |

*(Competitors analysed are feature references, not v1 parity targets. Happy Health should not try to match every column — see Anti-Features.)*

---

## Sources

Confidence: MEDIUM overall (multi-source, websearch provider per the research-plan seam; `classify-confidence --provider websearch --verified` → MEDIUM). Credential-verification items corroborated by official sources → HIGH.

**Official / regulatory (HIGH):**
- Pakistan Nursing & Midwifery Council (PNMC) online portal — public verification by CNIC, registration/renewal lifecycle; PNMC Act 2023 §23 prohibits employing unregistered nurses — http://online.pnmc.gov.pk/
- PMDC online practitioner register — search doctors by registration number, licence validity — https://www.pmdc.pk/
- Sindh Healthcare Commission (SHCC) — licensing of Healthcare Establishments, required PNC/PMDC registration — https://shcc.org.pk/licensing/

**Pakistan platforms (MEDIUM):**
- Sehat Kahani Home Healthcare (three care plans; central monitoring; family portal) — https://sehatkahani.com/hhc/
- Dawaai home services (nursing, doctor house calls, lab) — https://dawaai.pk/home-services
- Marham home visits / PMC-verified doctors / booking helpline — https://www.marham.pk/all-services/home-visits
- Qare (PNC-register + CNIC verification, post-and-apply, cash payment, 10% commission) — https://qarepk.com/
- Nannzy (CNIC + credential verification, marketplace model) — https://nannzy.com/home-nursing
- E-Tib (admin-reviewed professional documents, request/apply) — https://etib.net/
- InstaCare (healthcare HR / credential tracking, PHC/SHCC/IHRA compliance) — https://instacare.com.pk/hr-software-for-healthcare/

**India platforms (MEDIUM):**
- Portea doctor home visits — https://www.portea.com/doctor-consultations/
- Nightingales home healthcare services & equipment — https://www.nightingales.in/services/
- HealthAtHome — https://www.healthathomes.com/
- MedRabbits — https://www.medrabbits.com/
- AppAdvisor home-healthcare software guide (caregiver rostering, visit verification, GST billing, ABDM readiness) — https://appadvisor.in/healthcare-software/home-healthcare-software

**Home-care software feature references (MEDIUM):**
- Alora Home Care — https://www.alorahealth.com/home-care-agency-software/
- BridgeCare OS — https://bridgecareos.com/features/
- Carecenta Platform — https://www.carecenta.com/Platform
- Viv Technologies — https://www.vivtechnologies.com/full-features
- LEMR Systems — https://www.lemrsystems.com/features.html
- usehomecareops — https://usehomecareops.com/guide

**Marketplace playbooks (MEDIUM):**
- Sharetribe — two-sided marketplace playbook & website features — https://www.sharetribe.com/how-to-build/two-sided-marketplace/ , https://www.sharetribe.com/how-to-build/marketplace-website-features/
- Stripe — two-sided marketplace strategy — https://stripe.com/resources/more/two-sided-marketplace-strategy
- Leeonex — marketplace MVP requirements checklist — https://www.leeonex.com/blog/marketplace-mvp-requirements-checklist
- StudioScale — 2-sided marketplace MVP product design — https://studioscale.co/blog/marketplace-product-design
- Rigby — services marketplace features — https://www.rigbyjs.com/blog/services-marketplace-features

**Equipment rental references (MEDIUM):**
- Rentrax — https://rentrax.com/industries/medical-mobility-equipment/
- Rentablez — https://rentablez.com/medical-equipment/
- Reservety — https://reservety.com/solutions/medical-equipment-rental-software.html
- Booqable — https://booqable.com/industries/medical-equipment-rental-software/
- Renttix — https://www.renttix.com/en-us/industries/medical-equipment-rental-software

**Failure / anti-feature evidence (MEDIUM):**
- Home Health Care News — home-care startup shutdown — https://homehealthcarenews.com/2017/07/another-tech-forward-home-care-startup-shuts-down/
- Scaled and Failed — Honor vs HomeHero — https://scaledandfailed.substack.com/p/issue-8-home-care
- WIRED — Why Homejoy Failed — https://www.wired.com/2015/10/why-homejoy-failed/
- Allen Cheng — startup postmortems — https://www.allencheng.com/failed-startups-why-businesses-fail-postmortems/

**Pakistan payment/channel behaviour (MEDIUM):**
- Releasit — COD in Pakistan guide — https://www.releas.it/blogs/cod-by-country/cash-on-delivery-cod-in-pakistan-2026-guide
- JazzCash payment gateway — https://www.jazzcash.com.pk/accept-payments/payment-gateway
- eGrow / Kliovo — Pakistan WhatsApp + COD playbooks — https://www.egrow.com/en/blog/pakistan-cod-whatsapp-2026

---

*Feature research for: home-care / on-demand health-booking marketplace (Pakistan-first)*
*Researched: 2026-10-15*
