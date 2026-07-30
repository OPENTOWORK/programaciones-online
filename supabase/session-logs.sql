-- Registro detallado de sesiones (checks, sensaciones, fecha programada)

alter table public.workout_logs
  add column if not exists scheduled_date date,
  add column if not exists feelings text,
  add column if not exists completed_items jsonb not null default '[]'::jsonb,
  add column if not exists athlete_plan_id uuid references public.athlete_plans(id) on delete set null,
  add column if not exists program_id uuid,
  add column if not exists updated_at timestamptz default now();

create unique index if not exists workout_logs_user_entreno_date_idx
  on public.workout_logs (user_id, entreno_id, scheduled_date)
  where entreno_id is not null and scheduled_date is not null;

create unique index if not exists workout_logs_user_plan_date_idx
  on public.workout_logs (user_id, athlete_plan_id, scheduled_date)
  where athlete_plan_id is not null and scheduled_date is not null;

drop policy if exists "Users can update own workout logs" on public.workout_logs;
create policy "Users can update own workout logs"
  on public.workout_logs for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Trainers can view athlete workout logs" on public.workout_logs;
create policy "Trainers can view athlete workout logs"
  on public.workout_logs for select
  to authenticated
  using (
    public.is_entrenador()
    and exists (
      select 1
      from public."Perfil" p
      join public.roles r on r.id = p.id_roles
      where p.id = workout_logs.user_id
        and r.slug = 'atleta'
    )
  );
