-- Apuntes privados del entrenador sobre cada ejercicio de un entreno del atleta.
-- El atleta no tiene ninguna política de lectura: estas notas son solo del entrenador.

create table if not exists public.trainer_exercise_notes (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references auth.users(id) on delete cascade,
  athlete_id uuid not null references auth.users(id) on delete cascade,
  session_log_id uuid references public.workout_logs(id) on delete set null,
  /* Nombre normalizado del ejercicio: es lo que une las notas de semanas distintas. */
  exercise_key text not null check (char_length(trim(exercise_key)) > 0),
  exercise_name text not null,
  /* Vídeo concreto del atleta, cuando la nota nace revisando una grabación. */
  session_video_id uuid references public.session_log_videos(id) on delete set null,
  /* Fecha del entreno, no la de la nota: es el eje del seguimiento. */
  performed_on date not null default current_date,
  /* Serie a la que se refiere la nota. Null = nota general del ejercicio. */
  set_number integer check (set_number is null or set_number between 1 and 99),
  reps text check (reps is null or char_length(reps) <= 60),
  seconds text check (seconds is null or char_length(seconds) <= 60),
  level text check (level is null or char_length(level) <= 80),
  execution text check (execution is null or execution in ('correct', 'partial', 'incorrect')),
  technique text check (technique is null or char_length(technique) <= 1000),
  notes text check (notes is null or char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

/* Notas de este ejercicio para este atleta, de la más reciente a la más antigua. */
create index if not exists trainer_exercise_notes_history_idx
  on public.trainer_exercise_notes (trainer_id, athlete_id, exercise_key, performed_on desc, set_number);

/* Notas de la sesión que el entrenador tiene abierta. */
create index if not exists trainer_exercise_notes_log_idx
  on public.trainer_exercise_notes (session_log_id, exercise_key, set_number);

alter table public.trainer_exercise_notes enable row level security;

drop policy if exists "Trainers can view own exercise notes" on public.trainer_exercise_notes;
create policy "Trainers can view own exercise notes"
  on public.trainer_exercise_notes for select
  to authenticated
  using (public.is_entrenador() and trainer_id = auth.uid());

drop policy if exists "Trainers can create own exercise notes" on public.trainer_exercise_notes;
create policy "Trainers can create own exercise notes"
  on public.trainer_exercise_notes for insert
  to authenticated
  with check (public.is_entrenador() and trainer_id = auth.uid());

drop policy if exists "Trainers can update own exercise notes" on public.trainer_exercise_notes;
create policy "Trainers can update own exercise notes"
  on public.trainer_exercise_notes for update
  to authenticated
  using (public.is_entrenador() and trainer_id = auth.uid())
  with check (public.is_entrenador() and trainer_id = auth.uid());

drop policy if exists "Trainers can delete own exercise notes" on public.trainer_exercise_notes;
create policy "Trainers can delete own exercise notes"
  on public.trainer_exercise_notes for delete
  to authenticated
  using (public.is_entrenador() and trainer_id = auth.uid());

alter table public.trainer_exercise_notes
  add column if not exists seconds text check (seconds is null or char_length(seconds) <= 60);

/* Apuntes escritos desde la sesión del plan, cuando el atleta aún no tiene registro. */
alter table public.trainer_exercise_notes
  add column if not exists athlete_plan_id uuid references public.athlete_plans(id) on delete set null;

create index if not exists trainer_exercise_notes_plan_idx
  on public.trainer_exercise_notes (athlete_plan_id, exercise_key, set_number);
