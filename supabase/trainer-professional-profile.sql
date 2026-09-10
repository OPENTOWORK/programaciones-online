-- Ficha profesional del entrenador y notas internas del administrador.
--
-- Van en tablas propias, como user_physical_profile / user_training_profile, para no ampliar
-- "Perfil" (que es común a atletas) y para poder dar a las notas internas su propia RLS:
-- la ficha profesional la ve todo el staff, las notas internas solo el administrador.
--
-- Campos que ya existen y no se duplican aquí:
--   * nombre y email -> "Perfil".name / "Perfil".email
--   * rol            -> "Perfil".id_roles -> roles.slug

create table if not exists public.trainer_professional_profile (
  user_id uuid primary key references auth.users(id) on delete cascade,
  specialty text,
  education text,
  certifications text,
  experience_years integer check (
    experience_years is null or (experience_years between 0 and 70)
  ),
  modality text check (
    modality is null or modality in ('online', 'presencial', 'mixta')
  ),
  center_name text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trainer_internal_notes (
  trainer_id uuid primary key references auth.users(id) on delete cascade,
  note text not null default '',
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.trainer_professional_profile enable row level security;
alter table public.trainer_internal_notes enable row level security;

-- ---- Ficha profesional ----

-- Visible para todo el staff (entrenador y administrador): es información profesional.
drop policy if exists "Staff can view trainer professional profile" on public.trainer_professional_profile;
create policy "Staff can view trainer professional profile"
  on public.trainer_professional_profile for select
  to authenticated
  using (public.is_entrenador());

-- Cada miembro del staff mantiene su propia ficha.
drop policy if exists "Owners manage own professional profile" on public.trainer_professional_profile;
create policy "Owners manage own professional profile"
  on public.trainer_professional_profile for all
  to authenticated
  using (public.is_entrenador() and auth.uid() = user_id)
  with check (public.is_entrenador() and auth.uid() = user_id);

-- El administrador puede completarla desde la ficha del entrenador.
drop policy if exists "Admins manage trainer professional profile" on public.trainer_professional_profile;
create policy "Admins manage trainer professional profile"
  on public.trainer_professional_profile for all
  to authenticated
  using (public.is_administrador())
  with check (public.is_administrador());

-- ---- Notas internas ----

-- Solo administradores: ni el propio entrenador ve lo que se anota sobre él.
drop policy if exists "Admins manage trainer internal notes" on public.trainer_internal_notes;
create policy "Admins manage trainer internal notes"
  on public.trainer_internal_notes for all
  to authenticated
  using (public.is_administrador())
  with check (public.is_administrador());
