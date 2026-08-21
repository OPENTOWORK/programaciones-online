-- Preferencias de nutrición y de entrenamiento del usuario.
--
-- Van en tablas propias para no mezclarlas con los datos físicos ni con el histórico de mediciones.
-- Los campos que ya existían en "Perfil" no se duplican aquí:
--   * experiencia de entrenamiento -> "Perfil".nivel
--   * lesiones o limitaciones      -> "Perfil".lesiones

create table if not exists public.user_nutrition_profile (
  user_id uuid primary key references auth.users(id) on delete cascade,
  dietary_preference text check (
    dietary_preference is null
    or dietary_preference in ('omnivora', 'vegetariana', 'vegana', 'pescetariana', 'otra')
  ),
  food_allergies text[] not null default '{}',
  food_intolerances text[] not null default '{}',
  excluded_foods text[] not null default '{}',
  meals_per_day integer check (meals_per_day is null or (meals_per_day between 1 and 10)),
  nutrition_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_training_profile (
  user_id uuid primary key references auth.users(id) on delete cascade,
  training_days_per_week integer check (
    training_days_per_week is null or (training_days_per_week between 0 and 7)
  ),
  preferred_training_days text[] not null default '{}',
  session_duration_minutes integer check (
    session_duration_minutes is null or (session_duration_minutes between 10 and 240)
  ),
  training_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_nutrition_profile enable row level security;
alter table public.user_training_profile enable row level security;

drop policy if exists "Users manage own nutrition profile" on public.user_nutrition_profile;
create policy "Users manage own nutrition profile"
  on public.user_nutrition_profile for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Trainers can view athlete nutrition profile" on public.user_nutrition_profile;
create policy "Trainers can view athlete nutrition profile"
  on public.user_nutrition_profile for select
  to authenticated
  using (
    public.is_entrenador()
    and exists (
      select 1
      from public."Perfil" p
      join public.roles r on r.id = p.id_roles
      where p.id = user_nutrition_profile.user_id
        and r.slug = 'atleta'
    )
  );

drop policy if exists "Users manage own training profile" on public.user_training_profile;
create policy "Users manage own training profile"
  on public.user_training_profile for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Trainers can view athlete training profile" on public.user_training_profile;
create policy "Trainers can view athlete training profile"
  on public.user_training_profile for select
  to authenticated
  using (
    public.is_entrenador()
    and exists (
      select 1
      from public."Perfil" p
      join public.roles r on r.id = p.id_roles
      where p.id = user_training_profile.user_id
        and r.slug = 'atleta'
    )
  );
