-- El entrenador marca entrenos importantes del atleta con una estrella.

create table if not exists public.workout_log_favorites (
  workout_log_id uuid not null references public.workout_logs(id) on delete cascade,
  trainer_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (workout_log_id, trainer_id)
);

create index if not exists workout_log_favorites_trainer_idx
  on public.workout_log_favorites (trainer_id);

alter table public.workout_log_favorites enable row level security;

drop policy if exists "Trainers can view own session log favorites" on public.workout_log_favorites;
create policy "Trainers can view own session log favorites"
  on public.workout_log_favorites for select
  to authenticated
  using (public.is_entrenador() and trainer_id = auth.uid());

drop policy if exists "Trainers can add session log favorites" on public.workout_log_favorites;
create policy "Trainers can add session log favorites"
  on public.workout_log_favorites for insert
  to authenticated
  with check (public.is_entrenador() and trainer_id = auth.uid());

drop policy if exists "Trainers can remove session log favorites" on public.workout_log_favorites;
create policy "Trainers can remove session log favorites"
  on public.workout_log_favorites for delete
  to authenticated
  using (public.is_entrenador() and trainer_id = auth.uid());
