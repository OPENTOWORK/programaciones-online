-- Datos físicos del usuario.
--
-- Reparto de responsabilidades:
--   * "Perfil"                -> datos que ya existían: nombre, rol, altura, peso actual, lesiones, nivel.
--   * user_physical_profile   -> datos estables nuevos (nacimiento, sexo, actividad, objetivo, peso objetivo).
--   * body_measurements       -> histórico de mediciones (peso, composición, cintura, FC en reposo).
--
-- Los valores derivados (IMC, masa grasa, masa libre de grasa, metabolismo basal y gasto diario)
-- se calculan en la app y NO se guardan: se pueden reconstruir desde estas tablas.

-- Altura y peso pasan a numeric para admitir decimales (80.5 kg) sin redondeos.
alter table public."Perfil" alter column altura type numeric;
alter table public."Perfil" alter column peso type numeric;

create table if not exists public.user_physical_profile (
  user_id uuid primary key references auth.users(id) on delete cascade,
  birth_date date,
  biological_sex text check (biological_sex is null or biological_sex in ('male', 'female', 'not_specified')),
  activity_level text check (
    activity_level is null
    or activity_level in ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')
  ),
  primary_goal text check (
    primary_goal is null
    or primary_goal in ('lose_fat', 'maintain_weight', 'gain_muscle', 'improve_performance', 'improve_health')
  ),
  target_weight_kg numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.body_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  measured_at timestamptz not null default now(),
  weight_kg numeric,
  body_fat_percentage numeric,
  muscle_mass_kg numeric,
  body_water_percentage numeric,
  visceral_fat numeric,
  bone_mass_kg numeric,
  waist_cm numeric,
  resting_heart_rate integer,
  -- Solo si lo aporta un dispositivo: la app nunca calcula la edad metabólica.
  metabolic_age numeric,
  source text not null default 'manual'
    check (source in ('manual', 'smart_scale', 'wearable', 'professional')),
  created_at timestamptz not null default now()
);

create index if not exists body_measurements_user_date_idx
  on public.body_measurements (user_id, measured_at desc);

alter table public.user_physical_profile enable row level security;
alter table public.body_measurements enable row level security;

drop policy if exists "Users manage own physical profile" on public.user_physical_profile;
create policy "Users manage own physical profile"
  on public.user_physical_profile for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Trainers can view athlete physical profile" on public.user_physical_profile;
create policy "Trainers can view athlete physical profile"
  on public.user_physical_profile for select
  to authenticated
  using (
    public.is_entrenador()
    and exists (
      select 1
      from public."Perfil" p
      join public.roles r on r.id = p.id_roles
      where p.id = user_physical_profile.user_id
        and r.slug = 'atleta'
    )
  );

drop policy if exists "Users manage own body measurements" on public.body_measurements;
create policy "Users manage own body measurements"
  on public.body_measurements for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Trainers can view athlete body measurements" on public.body_measurements;
create policy "Trainers can view athlete body measurements"
  on public.body_measurements for select
  to authenticated
  using (
    public.is_entrenador()
    and exists (
      select 1
      from public."Perfil" p
      join public.roles r on r.id = p.id_roles
      where p.id = body_measurements.user_id
        and r.slug = 'atleta'
    )
  );

-- Migración del histórico antiguo: progress_entries guardaba las métricas extra
-- como JSON dentro de `notes`, así que hay que leerlas de forma tolerante a errores.
create or replace function public.body_measurements_parse_notes(raw text)
returns jsonb
language plpgsql
immutable
as $$
begin
  if raw is null or btrim(raw) = '' then
    return null;
  end if;
  return raw::jsonb;
exception
  when others then
    return null;
end;
$$;

create or replace function public.body_measurements_numeric(payload jsonb, key text)
returns numeric
language sql
immutable
as $$
  select case
    when payload is null then null
    when payload ->> key ~ '^-?[0-9]+(\.[0-9]+)?$' then (payload ->> key)::numeric
    else null
  end;
$$;

insert into public.body_measurements (
  user_id,
  measured_at,
  weight_kg,
  body_fat_percentage,
  muscle_mass_kg,
  body_water_percentage,
  visceral_fat,
  bone_mass_kg,
  waist_cm,
  resting_heart_rate,
  metabolic_age,
  source,
  created_at
)
select
  entry.user_id,
  entry.recorded_at,
  entry.weight,
  public.body_measurements_numeric(notes.payload, 'bodyFat'),
  public.body_measurements_numeric(notes.payload, 'muscleMass'),
  public.body_measurements_numeric(notes.payload, 'bodyWater'),
  public.body_measurements_numeric(notes.payload, 'visceralFat'),
  public.body_measurements_numeric(notes.payload, 'boneMass'),
  coalesce(entry.waist, public.body_measurements_numeric(notes.payload, 'waist')),
  public.body_measurements_numeric(notes.payload, 'restingHr')::integer,
  public.body_measurements_numeric(notes.payload, 'metabolicAge'),
  'manual',
  entry.recorded_at
from public.progress_entries entry
cross join lateral (
  select public.body_measurements_parse_notes(entry.notes) as payload
) notes
where not exists (
  select 1
  from public.body_measurements existing
  where existing.user_id = entry.user_id
    and existing.measured_at = entry.recorded_at
);
