-- Metcons guardados por el atleta en su perfil (solo sesiones Metcon del catálogo).

create table if not exists public.athlete_saved_metcons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_id uuid not null,
  program_id uuid not null,
  workout_name text not null,
  program_name text,
  saved_at timestamptz not null default now(),
  unique (user_id, workout_id)
);

create index if not exists athlete_saved_metcons_user_idx
  on public.athlete_saved_metcons (user_id, saved_at desc);

alter table public.athlete_saved_metcons enable row level security;

drop policy if exists "Athletes manage own saved metcons" on public.athlete_saved_metcons;
create policy "Athletes manage own saved metcons"
  on public.athlete_saved_metcons for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Trainers can view athlete saved metcons" on public.athlete_saved_metcons;
create policy "Trainers can view athlete saved metcons"
  on public.athlete_saved_metcons for select
  to authenticated
  using (
    public.is_entrenador()
    and exists (
      select 1
      from public."Perfil" p
      join public.roles r on r.id = p.id_roles
      where p.id = athlete_saved_metcons.user_id
        and r.slug = 'atleta'
    )
  );
