-- Planes personalizados y nutricionales asignados por entrenadores a atletas

create table if not exists public.athlete_plans (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references auth.users(id) on delete cascade,
  trainer_id uuid not null references auth.users(id) on delete cascade,
  plan_type text not null check (plan_type in ('personalized', 'nutrition')),
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists athlete_plans_athlete_id_idx on public.athlete_plans (athlete_id);
create index if not exists athlete_plans_trainer_id_idx on public.athlete_plans (trainer_id);
create index if not exists athlete_plans_plan_type_idx on public.athlete_plans (plan_type);

alter table public.athlete_plans enable row level security;

drop policy if exists "Athletes can view own plans" on public.athlete_plans;
create policy "Athletes can view own plans"
  on public.athlete_plans for select
  to authenticated
  using (auth.uid() = athlete_id);

drop policy if exists "Trainers can view athlete plans" on public.athlete_plans;
create policy "Trainers can view athlete plans"
  on public.athlete_plans for select
  to authenticated
  using (public.is_entrenador());

drop policy if exists "Trainers can create athlete plans" on public.athlete_plans;
create policy "Trainers can create athlete plans"
  on public.athlete_plans for insert
  to authenticated
  with check (
    public.is_entrenador()
    and trainer_id = auth.uid()
  );

drop policy if exists "Trainers can update own athlete plans" on public.athlete_plans;
create policy "Trainers can update own athlete plans"
  on public.athlete_plans for update
  to authenticated
  using (public.is_entrenador() and trainer_id = auth.uid())
  with check (public.is_entrenador() and trainer_id = auth.uid());

drop policy if exists "Trainers can delete own athlete plans" on public.athlete_plans;
create policy "Trainers can delete own athlete plans"
  on public.athlete_plans for delete
  to authenticated
  using (public.is_entrenador() and trainer_id = auth.uid());

alter table public.athlete_plans
  add column if not exists pdf_storage_path text,
  add column if not exists pdf_file_name text;

-- PDF adjunto (columnas + bucket en athlete-plan-pdfs-storage.sql)
alter table public.athlete_plans
  add column if not exists pdf_storage_path text,
  add column if not exists pdf_file_name text;
