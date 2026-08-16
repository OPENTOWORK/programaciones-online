-- Amplía plan_type para entrenamiento a domicilio y programación de gimnasio.
alter table public.athlete_plans
  drop constraint if exists athlete_plans_plan_type_check;

alter table public.athlete_plans
  add constraint athlete_plans_plan_type_check
  check (plan_type in ('personalized', 'nutrition', 'home_training', 'gym_training'));
