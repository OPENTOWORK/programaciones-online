-- Huecos de entrenamiento a domicilio: el entrenador publica y el atleta se apunta.

create table if not exists public.home_training_slots (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references auth.users(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Entrenamiento a domicilio'
    check (char_length(trim(title)) between 1 and 120),
  notes text check (char_length(notes) <= 1000),
  starts_at timestamptz not null,
  duration_minutes integer not null default 60 check (duration_minutes between 10 and 240),
  -- Vacío mientras el hueco está libre; se rellena al reservar.
  athlete_id uuid references auth.users(id) on delete set null,
  status text not null default 'open' check (status in ('open', 'booked', 'cancelled')),
  cancelled_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (status = 'open' and athlete_id is null)
    or (status = 'booked' and athlete_id is not null)
    or (status = 'cancelled')
  )
);

create index if not exists home_training_slots_starts_at_idx
  on public.home_training_slots (starts_at desc);

create index if not exists home_training_slots_athlete_idx
  on public.home_training_slots (athlete_id, starts_at desc)
  where athlete_id is not null;

create index if not exists home_training_slots_open_idx
  on public.home_training_slots (starts_at)
  where status = 'open';

alter table public.home_training_slots enable row level security;

drop policy if exists "Athletes can view open or own home slots" on public.home_training_slots;
create policy "Athletes can view open or own home slots"
  on public.home_training_slots for select
  to authenticated
  using (
    status = 'open'
    or athlete_id = auth.uid()
    or public.is_entrenador()
  );

drop policy if exists "Trainers can create home slots" on public.home_training_slots;
create policy "Trainers can create home slots"
  on public.home_training_slots for insert
  to authenticated
  with check (public.is_entrenador() and created_by = auth.uid() and trainer_id = auth.uid());

drop policy if exists "Athletes can book open home slots" on public.home_training_slots;
create policy "Athletes can book open home slots"
  on public.home_training_slots for update
  to authenticated
  using (
    public.is_entrenador()
    or status = 'open'
    or athlete_id = auth.uid()
  )
  with check (
    public.is_entrenador()
    or (
      athlete_id = auth.uid()
      and status in ('booked', 'cancelled')
    )
  );

drop policy if exists "Trainers can delete home slots" on public.home_training_slots;
create policy "Trainers can delete home slots"
  on public.home_training_slots for delete
  to authenticated
  using (public.is_entrenador());
