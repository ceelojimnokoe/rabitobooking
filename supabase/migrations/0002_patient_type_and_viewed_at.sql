-- Adds patient-type tracking and an admin "viewed" marker (used to badge
-- new pending requests and drive the dashboard's new-request notification).

alter table public.appointments
  add column if not exists patient_type text not null default 'new'
    constraint appointments_patient_type_check
    check (patient_type in ('new', 'existing'));

alter table public.appointments
  add column if not exists viewed_at timestamptz;

comment on column public.appointments.patient_type is
  'Whether the patient identified as new or existing when booking.';
comment on column public.appointments.viewed_at is
  'Set the first time an administrator opens this request. Null means unseen.';

create index if not exists appointments_viewed_at_idx
  on public.appointments (viewed_at)
  where status = 'pending';
