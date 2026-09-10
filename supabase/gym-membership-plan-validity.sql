-- Caducidad configurable por tarifa (días desde el inicio de la membresía).
alter table public.gym_membership_plans
  add column if not exists validity_days integer check (validity_days is null or validity_days > 0);

comment on column public.gym_membership_plans.validity_days is
  'Días de validez al asignar la tarifa. NULL = según billing_period.';
