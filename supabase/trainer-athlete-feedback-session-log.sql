-- Vincula feedback del entrenador a un registro concreto de sesión (workout_logs).

alter table public.trainer_athlete_feedback
  add column if not exists session_log_id uuid references public.workout_logs(id) on delete set null;

create index if not exists trainer_athlete_feedback_session_log_idx
  on public.trainer_athlete_feedback (session_log_id, created_at desc)
  where session_log_id is not null;
