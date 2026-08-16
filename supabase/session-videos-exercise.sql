-- Vincula videos de sesión a un ejercicio concreto (clave + nombre visibles)

alter table public.session_log_videos
  add column if not exists exercise_key text;

alter table public.session_log_videos
  add column if not exists exercise_name text;

create index if not exists session_log_videos_exercise_idx
  on public.session_log_videos (workout_log_id, exercise_key)
  where exercise_key is not null;
