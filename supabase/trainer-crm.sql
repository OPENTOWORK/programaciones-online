-- Tablero CRM de leads/atletas para entrenadores (columnas personalizadas + posición de cada atleta)

create table if not exists public.trainer_crm_stages (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists trainer_crm_stages_trainer_id_idx on public.trainer_crm_stages (trainer_id, position);

alter table public.trainer_crm_stages enable row level security;

drop policy if exists "Trainers can view own stages" on public.trainer_crm_stages;
create policy "Trainers can view own stages"
  on public.trainer_crm_stages for select
  to authenticated
  using (public.is_entrenador() and trainer_id = auth.uid());

drop policy if exists "Trainers can create own stages" on public.trainer_crm_stages;
create policy "Trainers can create own stages"
  on public.trainer_crm_stages for insert
  to authenticated
  with check (public.is_entrenador() and trainer_id = auth.uid());

drop policy if exists "Trainers can update own stages" on public.trainer_crm_stages;
create policy "Trainers can update own stages"
  on public.trainer_crm_stages for update
  to authenticated
  using (public.is_entrenador() and trainer_id = auth.uid())
  with check (public.is_entrenador() and trainer_id = auth.uid());

drop policy if exists "Trainers can delete own stages" on public.trainer_crm_stages;
create policy "Trainers can delete own stages"
  on public.trainer_crm_stages for delete
  to authenticated
  using (public.is_entrenador() and trainer_id = auth.uid());

create table if not exists public.trainer_crm_leads (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references auth.users(id) on delete cascade,
  athlete_id uuid not null references auth.users(id) on delete cascade,
  stage_id uuid references public.trainer_crm_stages(id) on delete set null,
  position integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (trainer_id, athlete_id)
);

create index if not exists trainer_crm_leads_trainer_id_idx on public.trainer_crm_leads (trainer_id, stage_id, position);

alter table public.trainer_crm_leads enable row level security;

drop policy if exists "Trainers can view own leads" on public.trainer_crm_leads;
create policy "Trainers can view own leads"
  on public.trainer_crm_leads for select
  to authenticated
  using (public.is_entrenador() and trainer_id = auth.uid());

drop policy if exists "Trainers can create own leads" on public.trainer_crm_leads;
create policy "Trainers can create own leads"
  on public.trainer_crm_leads for insert
  to authenticated
  with check (public.is_entrenador() and trainer_id = auth.uid());

drop policy if exists "Trainers can update own leads" on public.trainer_crm_leads;
create policy "Trainers can update own leads"
  on public.trainer_crm_leads for update
  to authenticated
  using (public.is_entrenador() and trainer_id = auth.uid())
  with check (public.is_entrenador() and trainer_id = auth.uid());

drop policy if exists "Trainers can delete own leads" on public.trainer_crm_leads;
create policy "Trainers can delete own leads"
  on public.trainer_crm_leads for delete
  to authenticated
  using (public.is_entrenador() and trainer_id = auth.uid());
