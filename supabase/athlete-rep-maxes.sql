-- Marcas de RM (repetición máxima) del atleta.
-- El atleta gestiona las suyas; el entrenador puede verlas y registrarlas desde la ficha.

create table if not exists public.athlete_rep_maxes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_name text not null check (char_length(trim(exercise_name)) between 1 and 80),
  weight_kg numeric not null check (weight_kg > 0 and weight_kg <= 3600),
  unit text not null default 'kg' check (unit in ('kg', 'sec', 'percent_rm')),
  reps integer not null default 1 check (reps between 1 and 30),
  recorded_at date not null default (timezone('utc', now()))::date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists athlete_rep_maxes_user_idx
  on public.athlete_rep_maxes (user_id, recorded_at desc);

create index if not exists athlete_rep_maxes_user_exercise_idx
  on public.athlete_rep_maxes (user_id, exercise_name, recorded_at desc);

alter table public.athlete_rep_maxes enable row level security;

drop policy if exists "Users manage own rep maxes" on public.athlete_rep_maxes;
create policy "Users manage own rep maxes"
  on public.athlete_rep_maxes for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Trainers can view athlete rep maxes" on public.athlete_rep_maxes;
create policy "Trainers can view athlete rep maxes"
  on public.athlete_rep_maxes for select
  to authenticated
  using (
    public.is_entrenador()
    and exists (
      select 1
      from public."Perfil" p
      join public.roles r on r.id = p.id_roles
      where p.id = athlete_rep_maxes.user_id
        and r.slug = 'atleta'
    )
  );

drop policy if exists "Trainers can create athlete rep maxes" on public.athlete_rep_maxes;
create policy "Trainers can create athlete rep maxes"
  on public.athlete_rep_maxes for insert
  to authenticated
  with check (
    public.is_entrenador()
    and exists (
      select 1
      from public."Perfil" p
      join public.roles r on r.id = p.id_roles
      where p.id = athlete_rep_maxes.user_id
        and r.slug = 'atleta'
    )
  );

drop policy if exists "Trainers can update athlete rep maxes" on public.athlete_rep_maxes;
create policy "Trainers can update athlete rep maxes"
  on public.athlete_rep_maxes for update
  to authenticated
  using (
    public.is_entrenador()
    and exists (
      select 1
      from public."Perfil" p
      join public.roles r on r.id = p.id_roles
      where p.id = athlete_rep_maxes.user_id
        and r.slug = 'atleta'
    )
  )
  with check (
    public.is_entrenador()
    and exists (
      select 1
      from public."Perfil" p
      join public.roles r on r.id = p.id_roles
      where p.id = athlete_rep_maxes.user_id
        and r.slug = 'atleta'
    )
  );

drop policy if exists "Trainers can delete athlete rep maxes" on public.athlete_rep_maxes;
create policy "Trainers can delete athlete rep maxes"
  on public.athlete_rep_maxes for delete
  to authenticated
  using (
    public.is_entrenador()
    and exists (
      select 1
      from public."Perfil" p
      join public.roles r on r.id = p.id_roles
      where p.id = athlete_rep_maxes.user_id
        and r.slug = 'atleta'
    )
  );

-- Unidad de la marca: kg, segundos o %RM. El valor numérico sigue en weight_kg.
alter table public.athlete_rep_maxes
  add column if not exists unit text not null default 'kg';

alter table public.athlete_rep_maxes
  drop constraint if exists athlete_rep_maxes_unit_check;

alter table public.athlete_rep_maxes
  add constraint athlete_rep_maxes_unit_check
  check (unit in ('kg', 'sec', 'percent_rm'));

alter table public.athlete_rep_maxes
  drop constraint if exists athlete_rep_maxes_weight_kg_check;

alter table public.athlete_rep_maxes
  add constraint athlete_rep_maxes_weight_kg_check
  check (weight_kg > 0 and weight_kg <= 3600);
