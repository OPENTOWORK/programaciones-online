-- Plantillas de sesión reutilizables del entrenador.
-- El contenido usa el mismo formato serializado que athlete_plans.content
-- (@@plan-meta:v1 + secciones @@MAIN@@ ...), así que se puede aplicar tal cual
-- al editor de sesiones tanto de planes personalizados como del catálogo.

create table if not exists public.trainer_session_templates (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120),
  content text not null,
  tag text check (
    tag is null
    or tag in ('All', 'Tren inferior', 'Tren superior', 'Core', 'Metcon', 'Descanso')
  ),
  format_tag text check (
    format_tag is null
    or format_tag in (
      'Activación',
      'EMOM',
      'For Time',
      'Rounds For Time',
      'AMRAP',
      'Tabata',
      'Reps For Time / Ladder',
      'Estaciones de tiempo',
      'Fuerza',
      'Técnica',
      'Movilidad',
      'Unbroken'
    )
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trainer_session_templates_trainer_idx
  on public.trainer_session_templates (trainer_id, name);

create unique index if not exists trainer_session_templates_unique_name_idx
  on public.trainer_session_templates (trainer_id, lower(trim(name)));

alter table public.trainer_session_templates enable row level security;

drop policy if exists "Trainers can view own session templates"
  on public.trainer_session_templates;
create policy "Trainers can view own session templates"
  on public.trainer_session_templates for select
  to authenticated
  using (public.is_entrenador() and trainer_id = auth.uid());

drop policy if exists "Trainers can create own session templates"
  on public.trainer_session_templates;
create policy "Trainers can create own session templates"
  on public.trainer_session_templates for insert
  to authenticated
  with check (public.is_entrenador() and trainer_id = auth.uid());

drop policy if exists "Trainers can update own session templates"
  on public.trainer_session_templates;
create policy "Trainers can update own session templates"
  on public.trainer_session_templates for update
  to authenticated
  using (public.is_entrenador() and trainer_id = auth.uid())
  with check (public.is_entrenador() and trainer_id = auth.uid());

drop policy if exists "Trainers can delete own session templates"
  on public.trainer_session_templates;
create policy "Trainers can delete own session templates"
  on public.trainer_session_templates for delete
  to authenticated
  using (public.is_entrenador() and trainer_id = auth.uid());
