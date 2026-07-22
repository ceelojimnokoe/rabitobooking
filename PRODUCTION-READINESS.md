# Production Readiness

This project is a **working demonstration**, built to show the appointment
request → review → confirmation workflow end to end. It is **not** an
official Rabito Clinic platform and is not ready for real patient data or
clinical use. This document lists what would need to happen before that
changed.

## Governance and approval

- **Formal clinic approval** of the concept, workflow, and this codebase
  (or a production rebuild of it) before any real patient uses it.
- **Confirmed branch and service information.** Branch names and hours in
  `src/config/clinic.ts` (Osu, East Legon, Tema Comm 11, Dansoman, Kasoa,
  Adiebeba, Koforidua, plus Online) reflect what was provided during this
  build — double-check them against the clinic's actual current branch
  list and opening hours before any real use, and update that one file if
  anything has changed since.
- **A privacy policy** covering what's collected (name, phone, email,
  service, branch, date/time preference), how long it's kept, and who can
  access it — linked from the booking form, not just implied.
- **A Ghana Data Protection Act (2012, Act 843) review**, including
  registration with the Data Protection Commission if required for this
  processing activity, and a lawful-basis assessment for storing contact
  details and appointment preferences.
- **A patient-data retention policy** — how long pending/rejected/expired
  requests are kept, and an automated deletion or anonymization process
  rather than indefinite retention (this demo keeps everything
  indefinitely).

## Access control and security

- **Stronger role-based access.** Today, any allowlisted email in
  `ADMIN_EMAILS` has full access to every appointment. A real system needs
  distinct roles (e.g. front-desk, clinician, manager) with different
  permissions.
- **Audit trails.** There is no history of who confirmed, rejected, or
  edited a request, or when. Production needs an append-only audit log.
- **Secure backups** of the database, tested restore procedures, and a
  documented recovery-time objective.
- **Administrator password policy** (minimum strength, rotation
  expectations) — currently whatever Supabase Auth's defaults allow.
- **Multi-factor authentication** for administrator accounts. Supabase
  Auth supports MFA; this demo does not enable or require it.
- **Staff permissions** distinct from "is an administrator at all" —
  e.g. a receptionist who can view/assign but not permanently delete
  records, versus a manager who can.
- **Rate limiting** is currently a simple in-memory, per-instance sliding
  window (`src/lib/rate-limit.ts`) — fine for a demo, but it resets on
  every deploy/restart and doesn't share state across serverless
  instances. Production should use a shared store (e.g. Upstash Redis) or
  a platform-level solution (e.g. Vercel Firewall / WAF rate limiting).

## Reliability and operations

- **Monitoring and error reporting** (e.g. Sentry, Vercel's own
  observability, or similar) — today, errors are only visible in server
  logs.
- **Email-domain verification** with Resend (or an alternative provider)
  for reliable, non-spam-flagged delivery to real patient inboxes, plus
  DMARC/SPF/DKIM monitoring.
- **Alerting** when email delivery fails so staff can follow up manually
  instead of a patient silently not receiving their confirmation.

## Missing workflows

- **Cancellation and rescheduling.** The status enum includes `cancelled`,
  but there is no UI for a patient or administrator to cancel or
  reschedule a confirmed appointment.
- **Availability management.** There's no concept of clinician-specific
  schedules, holidays, capacity per slot, or blocking out unavailable
  times beyond the fixed weekly hours in `src/config/clinic.ts`.
- **Integration with the clinic's existing systems** — this demo is a
  standalone Supabase table, not connected to any existing patient
  record system, EHR, or billing system the clinic may already run.

## What this demo deliberately does not do

By design, and worth preserving even after any production rebuild:

- It never asks for or stores symptoms, diagnoses, medical records, or
  identification documents — only contact and scheduling details.
- The public browser never receives the Supabase service-role key; all
  privileged data access happens through server-only code after an
  authenticated, allowlisted check.
- Internal administrative notes are never exposed to patients.
