-- Registro de entrenamientos completados
create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  workout_id uuid,
  entreno_id uuid references public.entrenos_diarios(id) on delete set null,
  workout_name text not null,
  duration text,
  completed_at timestamptz default now()
);

alter table public.workout_logs enable row level security;

drop policy if exists "Users can view own workout logs" on public.workout_logs;
create policy "Users can view own workout logs"
  on public.workout_logs for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own workout logs" on public.workout_logs;
create policy "Users can insert own workout logs"
  on public.workout_logs for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Compatibilidad si la tabla ya existía sin entreno_id
alter table public.workout_logs
  add column if not exists entreno_id uuid references public.entrenos_diarios(id) on delete set null;
