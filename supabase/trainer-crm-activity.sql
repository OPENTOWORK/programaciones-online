-- Historial de seguimiento (CRM) por atleta: notas manuales + cambios de columna automáticos

create table if not exists public.trainer_crm_activity (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references auth.users(id) on delete cascade,
  athlete_id uuid not null references auth.users(id) on delete cascade,
  kind text not null default 'note' check (kind in ('note', 'stage_change', 'plan_assigned', 'message_sent')),
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists trainer_crm_activity_lookup_idx
  on public.trainer_crm_activity (trainer_id, athlete_id, created_at desc);

alter table public.trainer_crm_activity enable row level security;

drop policy if exists "Trainers can view own activity" on public.trainer_crm_activity;
create policy "Trainers can view own activity"
  on public.trainer_crm_activity for select
  to authenticated
  using (public.is_entrenador() and trainer_id = auth.uid());

drop policy if exists "Trainers can create own activity" on public.trainer_crm_activity;
create policy "Trainers can create own activity"
  on public.trainer_crm_activity for insert
  to authenticated
  with check (public.is_entrenador() and trainer_id = auth.uid());

drop policy if exists "Trainers can delete own activity" on public.trainer_crm_activity;
create policy "Trainers can delete own activity"
  on public.trainer_crm_activity for delete
  to authenticated
  using (public.is_entrenador() and trainer_id = auth.uid());

-- Ampliar tipos si la tabla ya existía con la versión anterior
alter table public.trainer_crm_activity drop constraint if exists trainer_crm_activity_kind_check;
alter table public.trainer_crm_activity add constraint trainer_crm_activity_kind_check
  check (kind in ('note', 'stage_change', 'plan_assigned', 'message_sent'));
