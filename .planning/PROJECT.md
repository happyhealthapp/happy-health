# Happy Health

## What This Is

Happy Health is a home care medical services platform for Pakistan — connecting patients to qualified nursing staff, doctor home visits, and rentable medical equipment delivered at the patient's residence. The venture is being built as part of a 6-month founder incubation at SEIC (Sindh Enterprise Incubation Center), with program assignments and progress documented in this repo for mentor review.

## Core Value

Give patients trustworthy, on-demand access to home nursing, doctor visits, and medical equipment — delivered by verified professionals at home.

## Business Context

- **Customer**: Patients and families in Pakistan needing at-home medical care; nurses/doctors seeking work; equipment renters
- **Revenue model**: Commission per booking (nursing/doctor visits) + equipment rental fees — to be validated in SEIC business model canvas
- **Success metric**: First paid home-care booking completed end-to-end (MVP), steady booking growth after
- **Strategy notes**: SEIC.ac.pk 6-month incubation program (started Sep 25, 2026)

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] REQ-ASG-01: SEIC assignments organized in a dated Mon/Wed/Fri folder structure, reviewable by mentors via GitHub
- [ ] REQ-ASG-02: Repo README gives mentors a single entry point linking each session's notes, assignment, and resources
- [ ] REQ-PLAT-03: Patient can browse services (nursing, doctor visit, equipment) and request a home booking
- [ ] REQ-PLAT-04: Nurse/doctor can register with credentials (license number, CV/experience)
- [ ] REQ-PLAT-05: Staff credentials and bookings persist to Supabase (auth + database)
- [ ] REQ-PLAT-06: Site deploys automatically to GitHub Pages on push to main

### Out of Scope

- Full hospital/EHR management system — focus stays on home-visit booking and staff onboarding
- Payments/escrow integration — deferred until bookings are validated manually
- Native mobile apps — web-first (responsive) for the 6-month MVP
- Multi-city expansion — Karachi-first pilot

## Context

- **Program**: SEIC.ac.pk founder training, sessions Mon/Wed/Fri from Sep 25, 2026
- **Session topics so far**: Business Model Canvas, Accounts & Finance, Law, Sales Tax
- **Venture concept**: Home care — nursing staff, doctor visits, medical equipment at patient's residence
- **Immediate need**: a shareable GitHub link where mentors can review assignments easily
- **Later need**: the actual platform (patient booking, staff onboarding, equipment rental)
- **Prior experience**: familiar with React + Vite + TypeScript + Supabase + GitHub Pages deployments

## Constraints

- **Timeline**: Mentor-reviewable assignments this week; platform MVP within the 6-month program
- **Tech stack**: React (Vite + TypeScript) frontend + Supabase (Postgres + Auth + Edge Functions) backend
- **Hosting**: GitHub Pages, auto-deploy on push to `main`
- **Account**: GitHub account `nursingcareinfo`, new repo `happy-health`
- **Compliance**: Healthcare context — credential verification and patient data privacy matter (Pakistan PNC licensing)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| New dedicated repo `happy-health` (not reusing international_nurses) | Clean slate for this venture; mentor link dedicated to this project | — Pending |
| v1 focus = assignments structure, platform phases follow | Nearest milestone is mentor-reviewable assignments this week | — Pending |
| Stack: React + Vite + TS + Supabase | Proven stack, fast MVP, built-in auth/DB/storage, free-tier friendly | — Pending |
| GitHub Pages auto-deploy on push to main | Frictionless sharing with mentors | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition:**
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone:**
1. Full review of all sections
2. Core Value check — still the right priority?
3. Business Context check — customer, revenue model, success metric still accurate?
4. Audit Out of Scope — reasons still valid?
5. Update Context with current state

---
*Last updated: 2026-10-15 after initialization*
