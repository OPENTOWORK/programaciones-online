-- Marcas de lectura por entrenador y atleta para alertas del CRM.

create table if not exists public.trainer_athlete_alert_reads (
  trainer_id uuid not null references auth.users(id) on delete cascade,
  athlete_id uuid not null references auth.users(id) on delete cascade,
  chat_read_at timestamptz,
  sessions_read_at timestamptz,
  intake_read_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (trainer_id, athlete_id)
);

create index if not exists trainer_athlete_alert_reads_athlete_idx
  on public.trainer_athlete_alert_reads (athlete_id);

alter table public.trainer_athlete_alert_reads enable row level security;

drop policy if exists "Trainers can view own athlete alert reads"
  on public.trainer_athlete_alert_reads;
create policy "Trainers can view own athlete alert reads"
  on public.trainer_athlete_alert_reads for select
  to authenticated
  using (trainer_id = auth.uid() and public.is_entrenador());

drop policy if exists "Trainers can insert own athlete alert reads"
  on public.trainer_athlete_alert_reads;
create policy "Trainers can insert own athlete alert reads"
  on public.trainer_athlete_alert_reads for insert
  to authenticated
  with check (trainer_id = auth.uid() and public.is_entrenador());

drop policy if exists "Trainers can update own athlete alert reads"
  on public.trainer_athlete_alert_reads;
create policy "Trainers can update own athlete alert reads"
  on public.trainer_athlete_alert_reads for update
  to authenticated
  using (trainer_id = auth.uid() and public.is_entrenador())
  with check (trainer_id = auth.uid() and public.is_entrenador());
