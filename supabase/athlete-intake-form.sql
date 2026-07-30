-- Formulario de bienvenida del atleta (obligatorio antes de contactar para entrenamiento online)

create table if not exists public.athlete_intake_forms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,

  -- Objetivos de entrenamiento
  goals text[] not null default '{}',
  goals_other text,

  -- Experiencia y entrenamiento
  experience text,
  training_place text check (training_place is null or training_place in ('gimnasio', 'casa', 'ambas')),
  equipment text,
  availability text,
  pushups_reps integer,
  squats_reps integer,
  pullups_reps integer,

  -- Historial de salud y lesiones
  has_injuries boolean,
  injuries_detail text,
  takes_medication boolean,
  had_surgery boolean,
  has_medical_condition boolean,

  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists athlete_intake_forms_user_idx on public.athlete_intake_forms (user_id);

alter table public.athlete_intake_forms enable row level security;

drop policy if exists "Athletes can view own intake form" on public.athlete_intake_forms;
create policy "Athletes can view own intake form"
  on public.athlete_intake_forms for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Athletes can insert own intake form" on public.athlete_intake_forms;
create policy "Athletes can insert own intake form"
  on public.athlete_intake_forms for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Athletes can update own intake form" on public.athlete_intake_forms;
create policy "Athletes can update own intake form"
  on public.athlete_intake_forms for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Trainers can view athlete intake forms" on public.athlete_intake_forms;
create policy "Trainers can view athlete intake forms"
  on public.athlete_intake_forms for select
  to authenticated
  using (
    public.is_entrenador()
    and exists (
      select 1
      from public."Perfil" p
      join public.roles r on r.id = p.id_roles
      where p.id = athlete_intake_forms.user_id
        and r.slug = 'atleta'
    )
  );
