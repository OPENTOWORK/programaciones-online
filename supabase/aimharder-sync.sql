-- Sincronización de entrenos diarios desde AimHarder

create table if not exists public.entrenos_diarios (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references public.programas(id) on delete cascade,
  workout_date date not null,
  aimharder_rate_id bigint not null,
  name text not null,
  day_label text,
  estimated_duration text,
  warmup text default '',
  main_part text default '',
  core_part text default '',
  cooldown text default '',
  synced_at timestamptz default now(),
  unique (workout_date, aimharder_rate_id)
);

create table if not exists public.entrenos_ejercicios (
  id uuid primary key default gen_random_uuid(),
  entreno_id uuid references public.entrenos_diarios(id) on delete cascade not null,
  sort_order integer not null default 0,
  name text not null,
  sets integer not null default 1,
  reps text not null default '—',
  rest text default '—',
  notes text
);

create index if not exists entrenos_diarios_program_date_idx
  on public.entrenos_diarios (program_id, workout_date desc);

alter table public.entrenos_diarios enable row level security;
alter table public.entrenos_ejercicios enable row level security;

drop policy if exists "Authenticated can read entrenos_diarios" on public.entrenos_diarios;
create policy "Authenticated can read entrenos_diarios"
  on public.entrenos_diarios for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can read entrenos_ejercicios" on public.entrenos_ejercicios;
create policy "Authenticated can read entrenos_ejercicios"
  on public.entrenos_ejercicios for select
  to authenticated
  using (true);
