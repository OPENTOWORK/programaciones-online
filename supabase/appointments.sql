-- Citas por videollamada entre entrenador y atleta. Quien la crea la deja propuesta y la otra parte confirma.
-- El equipo de entrenadores comparte la agenda, igual que el tablero CRM: cualquiera ve y gestiona todas las citas.

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references auth.users(id) on delete cascade,
  -- Sin entrenador asignado cuando la pide el atleta: la reclama el que la confirma.
  trainer_id uuid references auth.users(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 120),
  notes text check (char_length(notes) <= 1000),
  starts_at timestamptz not null,
  duration_minutes integer not null default 30 check (duration_minutes between 10 and 240),
  meeting_url text check (char_length(meeting_url) <= 500),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  -- Quién canceló, para poder avisar a la otra parte con el mensaje correcto.
  cancelled_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists appointments_athlete_idx
  on public.appointments (athlete_id, starts_at desc);

create index if not exists appointments_starts_at_idx
  on public.appointments (starts_at desc);

alter table public.appointments enable row level security;

drop policy if exists "Athletes can view own appointments" on public.appointments;
create policy "Athletes can view own appointments"
  on public.appointments for select
  to authenticated
  using (athlete_id = auth.uid());

drop policy if exists "Trainers can view team appointments" on public.appointments;
create policy "Trainers can view team appointments"
  on public.appointments for select
  to authenticated
  using (public.is_entrenador());

drop policy if exists "Athletes can request own appointments" on public.appointments;
create policy "Athletes can request own appointments"
  on public.appointments for insert
  to authenticated
  with check (created_by = auth.uid() and athlete_id = auth.uid());

drop policy if exists "Trainers can create team appointments" on public.appointments;
create policy "Trainers can create team appointments"
  on public.appointments for insert
  to authenticated
  with check (public.is_entrenador() and created_by = auth.uid());

drop policy if exists "Athletes can answer own appointments" on public.appointments;
create policy "Athletes can answer own appointments"
  on public.appointments for update
  to authenticated
  using (athlete_id = auth.uid())
  with check (athlete_id = auth.uid());

drop policy if exists "Trainers can update team appointments" on public.appointments;
create policy "Trainers can update team appointments"
  on public.appointments for update
  to authenticated
  using (public.is_entrenador())
  with check (public.is_entrenador());

drop policy if exists "Athletes can delete own requests" on public.appointments;
create policy "Athletes can delete own requests"
  on public.appointments for delete
  to authenticated
  using (athlete_id = auth.uid() and created_by = auth.uid());

drop policy if exists "Trainers can delete team appointments" on public.appointments;
create policy "Trainers can delete team appointments"
  on public.appointments for delete
  to authenticated
  using (public.is_entrenador());
