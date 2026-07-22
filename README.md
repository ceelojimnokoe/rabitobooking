# Rabito Clinic — Appointment Booking Demo

A concept demonstration of an online appointment-booking experience for
Rabito Clinic: patients submit a request in a mobile-friendly multi-step
form, an administrator reviews and confirms it in a protected dashboard,
and the patient receives an email confirmation with a unique appointment
reference.

> This is a working demo, not an official Rabito Clinic platform. See
> [`PRODUCTION-READINESS.md`](./PRODUCTION-READINESS.md) for what would be
> required before any real clinical use.

## What's included

- **Public landing page** (`/`) — branding, a five-step explainer, services,
  and three "coming soon" feature cards.
- **Booking wizard** (`/book`) — patient details (including new/existing
  patient) → service & branch → date & time (opening days/hours vary by
  branch) → review & consent → confirmation screen with a request reference.
- **Admin login** (`/admin/login`) — Supabase email/password auth, gated by
  an `ADMIN_EMAILS` allowlist.
- **Admin dashboard** (`/admin`) — summary counts, a "New" badge and toast
  notification for unopened pending requests, search, filters (status,
  service, branch, patient type, date range), an Excel export of the
  current filtered view, and a responsive table/card list of every request.
- **Appointment review** (`/admin/appointments/[id]`) — confirm (with an
  optional different branch/date/time/team), reject with a reason, add an
  internal note, and a conflict check before confirming.
- **Email delivery** via Resend, with a graceful preview-only fallback (and
  an in-dashboard "View email preview") when Resend isn't configured.

## Tech stack

Next.js (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres +
Auth) · Resend · React Hook Form · Zod · Lucide React · Playwright.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000. The landing page and booking form work
immediately. Admin login and saving booking requests require Supabase to
be configured first — **see [`README-DEMO-SETUP.md`](./README-DEMO-SETUP.md)
for the exact, step-by-step walkthrough** (Supabase project, SQL
migration, first admin user, Resend, and deploying to Vercel).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the local dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build locally |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm run test:unit` | Unit tests (Node's built-in test runner) |
| `npm run test:e2e` | Playwright end-to-end tests |
| `npm run test` | Unit tests, then e2e tests |
| `npm run seed` | Seed ~8 fictional demo appointments (requires Supabase) |

## Project structure

```
src/
  app/                     Routes (App Router)
    page.tsx               Landing page
    book/                  Public booking wizard
    admin/login/           Admin login (public)
    admin/(protected)/      Dashboard + appointment review (auth-gated)
    api/book/               Booking submission route handler
  components/              UI components (booking, admin, landing, ui)
  config/clinic.ts         Single source of truth for branding/services/
                            branches/teams/hours/contact/disclaimer
  lib/
    scheduling.ts           Date/time-slot rules (pure, unit-tested)
    reference.ts             Reference-number generation (unit-tested)
    conflicts.ts              Slot-conflict detection (unit-tested)
    phone.ts                   Ghana phone validation (unit-tested)
    validation/booking.ts       Shared Zod schema (client + server)
    supabase/                    Browser/server/admin Supabase clients
    auth/admin.ts                  Admin session + allowlist check
    db/appointments.ts              All appointments-table DB access
    email/                            Templates + Resend send + fallback
    actions/appointment-actions.ts     Confirm/reject/note server actions
  proxy.ts                  Route protection for /admin/* (Next.js 16
                            renamed "middleware" to "proxy")
supabase/migrations/        SQL migration (run this in the Supabase SQL editor)
scripts/seed-demo-data.ts   Fictional demo data seeder
e2e/                        Playwright tests
```

## Rebranding

Everything clinic-specific — name, disclaimer, services, branches, teams,
hours, contact placeholders — lives in [`src/config/clinic.ts`](./src/config/clinic.ts).
To remove the demo disclaimer everywhere at once, set `demoDisclaimer` in
that file to an empty string.

## Further reading

- [`README-DEMO-SETUP.md`](./README-DEMO-SETUP.md) — full setup walkthrough
  (Supabase, Resend, Vercel) and a manual demo script for a pitch.
- [`PRODUCTION-READINESS.md`](./PRODUCTION-READINESS.md) — what's out of
  scope for this demo and would be needed for real clinical use.
