-- Rabito Clinic demo — appointments table
--
-- Design notes:
--   * `service`, `requested_branch`, `confirmed_branch` and `assigned_team`
--     are free text validated against src/config/clinic.ts at the
--     application layer (services/branches/teams are demo config, not
--     normalized DB tables, so they can be relabelled without a migration).
--   * `status` and `email_status` are constrained with CHECK constraints,
--     acting as lightweight enums without requiring a Postgres ENUM type
--     (simpler to evolve for a demo).
--   * Row Level Security is enabled with NO policies for `anon` or
--     `authenticated` roles. All reads/writes to this table happen
--     exclusively through trusted server-side code using the Supabase
--     service-role key (booking submission route, admin dashboard/server
--     actions), after the server has independently verified an
--     authenticated Supabase session and checked the caller's email
--     against the ADMIN_EMAILS allowlist. This means even if the
--     NEXT_PUBLIC_SUPABASE_ANON_KEY leaks (it is public by design), it
--     cannot be used to read or write appointment data directly.

create extension if not exists pgcrypto;

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),

  request_reference text not null unique,
  appointment_reference text unique,

  patient_name text not null,
  phone text not null,
  email text not null,

  service text not null,
  requested_branch text not null,
  confirmed_branch text,

  requested_date date not null,
  requested_time text not null,
  confirmed_date date,
  confirmed_time text,

  assigned_team text,

  status text not null default 'pending'
    constraint appointments_status_check
    check (status in ('pending', 'confirmed', 'rejected', 'cancelled')),

  internal_note text,
  patient_message text,

  email_status text not null default 'not_sent'
    constraint appointments_email_status_check
    check (email_status in ('not_sent', 'sent', 'failed', 'preview_only')),
  email_provider_id text,
  email_preview jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  confirmed_at timestamptz
);

comment on table public.appointments is
  'Rabito Clinic demo booking requests and confirmed appointments. Contains only contact and scheduling data — no medical/diagnosis information is ever stored here.';

create index if not exists appointments_status_idx on public.appointments (status);
create index if not exists appointments_requested_date_idx on public.appointments (requested_date);
create index if not exists appointments_confirmed_date_idx on public.appointments (confirmed_date);
create index if not exists appointments_email_idx on public.appointments (email);
create index if not exists appointments_request_reference_idx on public.appointments (request_reference);
create index if not exists appointments_appointment_reference_idx on public.appointments (appointment_reference);

-- Speeds up the conflict check (same confirmed branch/date/time) run before
-- an administrator confirms a request.
create index if not exists appointments_confirmed_slot_idx
  on public.appointments (confirmed_branch, confirmed_date, confirmed_time)
  where status = 'confirmed';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at
  before update on public.appointments
  for each row
  execute function public.set_updated_at();

alter table public.appointments enable row level security;

-- Intentionally no policies: all access goes through the service-role key
-- in trusted server-side code (see comment above). RLS being enabled with
-- zero policies means anon/authenticated roles are denied by default.
