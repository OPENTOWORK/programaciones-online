-- CRM de Gimnasios: multi-tenant sobre la misma base de Training ProgLine.
--
-- Rol global nuevo: `gimnasio`. Identifica al usuario que entra al CRM.
-- El permiso real DENTRO de cada gimnasio lo define `gym_users.role`
-- (owner | manager | coach | reception).
--
-- Aislamiento: toda tabla del CRM lleva `gym_id` y su RLS obliga a pertenecer
-- a ese gimnasio. El administrador global de Training ProgLine ve todos.
--
-- Nada de esto toca las tablas existentes salvo para AMPLIAR constraints de rol.

-- ============================================================
-- 1. Rol global `gimnasio`
-- ============================================================

alter table public.roles drop constraint if exists roles_slug_check;
alter table public.roles
  add constraint roles_slug_check
  check (slug in ('atleta', 'entrenador', 'administrador', 'gimnasio'));

insert into public.roles (slug, name)
values ('gimnasio', 'Gimnasio')
on conflict (slug) do nothing;

-- El tablero CRM puede tener una columna que promueva a rol gimnasio.
alter table public.trainer_crm_stages drop constraint if exists trainer_crm_stages_role_slug_check;
alter table public.trainer_crm_stages
  add constraint trainer_crm_stages_role_slug_check
  check (role_slug is null or role_slug in ('atleta', 'entrenador', 'administrador', 'gimnasio'));

create or replace function public.is_gimnasio()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role_slug() = 'gimnasio', false);
$$;

grant execute on function public.is_gimnasio() to authenticated;

-- ============================================================
-- 2. Tablas
-- ============================================================

create table if not exists public.gyms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  logo_url text,
  email text,
  phone text,
  address text,
  city text,
  postal_code text,
  country text,
  timezone text not null default 'Europe/Madrid',
  status text not null default 'trial' check (status in ('active', 'trial', 'suspended', 'cancelled')),
  owner_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gym_users (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'coach' check (role in ('owner', 'manager', 'coach', 'reception')),
  created_at timestamptz not null default now(),
  unique (gym_id, user_id)
);

create table if not exists public.gym_members (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  -- Si el miembro también tiene cuenta en Training ProgLine.
  user_id uuid references auth.users(id) on delete set null,
  first_name text not null default '',
  last_name text not null default '',
  email text,
  phone text,
  birth_date date,
  status text not null default 'active' check (status in ('active', 'inactive', 'blocked', 'lead')),
  pipeline_stage text not null default 'potencial'
    check (pipeline_stage in ('potencial', 'contactado', 'prueba', 'alta', 'activo', 'pausa', 'baja')),
  notes text,
  joined_at date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gym_class_types (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  name text not null,
  description text,
  duration_minutes integer not null default 60 check (duration_minutes between 5 and 480),
  capacity integer not null default 12 check (capacity between 1 and 500),
  color text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gym_classes (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  class_type_id uuid references public.gym_class_types(id) on delete set null,
  coach_user_id uuid references auth.users(id) on delete set null,
  title text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  capacity integer not null default 12 check (capacity between 1 and 500),
  location text,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_at > start_at)
);

create table if not exists public.gym_bookings (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  class_id uuid not null references public.gym_classes(id) on delete cascade,
  member_id uuid not null references public.gym_members(id) on delete cascade,
  status text not null default 'confirmed' check (
    status in ('confirmed', 'waiting', 'cancelled', 'attended', 'no_show')
  ),
  booked_at timestamptz not null default now(),
  checked_in_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  unique (class_id, member_id)
);

create table if not exists public.gym_membership_plans (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10, 2),
  billing_period text not null default 'monthly' check (
    billing_period in ('monthly', 'quarterly', 'annual', 'one_time')
  ),
  max_bookings integer,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gym_member_memberships (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  member_id uuid not null references public.gym_members(id) on delete cascade,
  plan_id uuid references public.gym_membership_plans(id) on delete set null,
  starts_at date not null default current_date,
  ends_at date,
  status text not null default 'active' check (
    status in ('active', 'expired', 'cancelled', 'paused')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gym_appointments (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  member_id uuid references public.gym_members(id) on delete set null,
  staff_user_id uuid references auth.users(id) on delete set null,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'pending' check (
    status in ('pending', 'confirmed', 'completed', 'cancelled')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table if not exists public.gym_tasks (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  title text not null,
  description text,
  assigned_to uuid references auth.users(id) on delete set null,
  due_at timestamptz,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gym_promotions (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  name text not null,
  description text,
  discount_type text not null default 'percentage' check (
    discount_type in ('percentage', 'fixed', 'free_trial')
  ),
  discount_value numeric(10, 2),
  starts_at date,
  ends_at date,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gym_rewards (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  name text not null,
  description text,
  points_cost integer not null default 0 check (points_cost >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gym_loyalty_transactions (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  member_id uuid not null references public.gym_members(id) on delete cascade,
  reward_id uuid references public.gym_rewards(id) on delete set null,
  points integer not null,
  reason text not null default 'manual' check (
    reason in ('attendance', 'booking', 'manual', 'reward_redeemed', 'promotion')
  ),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Aprovechar el motor de programación existente sin duplicarlo:
-- enlaza un gimnasio (y opcionalmente un tipo de clase o un miembro)
-- con una programación de `programas`.
create table if not exists public.gym_program_links (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  program_id uuid not null,
  class_type_id uuid references public.gym_class_types(id) on delete set null,
  member_id uuid references public.gym_members(id) on delete cascade,
  weekday smallint check (weekday is null or weekday between 0 and 6),
  scheduled_date date,
  published_date date,
  published_time time,
  session_draft jsonb,
  label text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 4. Suscripción del GIMNASIO a Training ProgLine (SaaS)
-- ============================================================
-- Distinto de gym_membership_plans, que son las tarifas de los clientes del gimnasio.

create table if not exists public.gym_saas_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  price_monthly numeric(10, 2),
  price_yearly numeric(10, 2),
  max_members integer,
  max_staff integer,
  max_locations integer,
  features jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gym_subscriptions (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  plan_id uuid references public.gym_saas_plans(id) on delete set null,
  status text not null default 'trial' check (
    status in ('trial', 'active', 'past_due', 'cancelled', 'suspended')
  ),
  starts_at timestamptz not null default now(),
  trial_ends_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancelled_at timestamptz,
  -- Hueco para Stripe u otra pasarela cuando se integre.
  external_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (gym_id)
);

-- Registro de acciones administrativas sobre un gimnasio.
create table if not exists public.gym_admin_activity (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  detail text,
  created_at timestamptz not null default now()
);

-- Planes iniciales sin precio: los define el administrador desde la ficha.
insert into public.gym_saas_plans (name, description)
values
  ('Starter', 'Gimnasios que empiezan: reservas, clases y miembros.'),
  ('Professional', 'Añade tarifas, citas y fidelización.'),
  ('Business', 'Varias sedes y límites ampliados.')
on conflict (name) do nothing;

-- ============================================================
-- 4. Helpers de permisos
-- ============================================================
-- security definer a propósito: estas funciones se usan dentro de las políticas
-- de `gym_users`, y sin definer la consulta a esa misma tabla entraría en recursión.

/** Rol interno del usuario actual dentro de un gimnasio, o null si no pertenece. */
create or replace function public.gym_role_in(target_gym uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select gu.role
  from public.gym_users gu
  where gu.gym_id = target_gym
    and gu.user_id = auth.uid()
  limit 1;
$$;

grant execute on function public.gym_role_in(uuid) to authenticated;

/** Lectura: pertenecer al gimnasio (cualquier rol interno) o ser admin global. */
create or replace function public.has_gym_access(target_gym uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_administrador() or public.gym_role_in(target_gym) is not null;
$$;

grant execute on function public.has_gym_access(uuid) to authenticated;

/**
 * Operación diaria: reservas, asistencia, miembros, clases.
 * `coalesce` a propósito: `gym_role_in` devuelve null si no perteneces al gimnasio,
 * y `null in (...)` daría null en lugar de false.
 */
create or replace function public.can_operate_gym(target_gym uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_administrador()
    or coalesce(public.gym_role_in(target_gym), '') in ('owner', 'manager', 'coach', 'reception');
$$;

grant execute on function public.can_operate_gym(uuid) to authenticated;

/** Gestión: ajustes, tarifas, promociones, usuarios del gimnasio. */
create or replace function public.can_manage_gym(target_gym uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_administrador()
    or coalesce(public.gym_role_in(target_gym), '') in ('owner', 'manager');
$$;

grant execute on function public.can_manage_gym(uuid) to authenticated;

-- ============================================================
-- 5. Índices
-- ============================================================

create index if not exists gym_users_gym_idx on public.gym_users (gym_id);
create index if not exists gym_users_user_idx on public.gym_users (user_id);
create index if not exists gym_members_gym_status_idx on public.gym_members (gym_id, status);
create index if not exists gym_members_user_idx on public.gym_members (user_id);
create index if not exists gym_class_types_gym_idx on public.gym_class_types (gym_id, active);
create index if not exists gym_classes_gym_start_idx on public.gym_classes (gym_id, start_at);
create index if not exists gym_classes_type_idx on public.gym_classes (class_type_id);
create index if not exists gym_classes_status_idx on public.gym_classes (gym_id, status);
create index if not exists gym_bookings_class_idx on public.gym_bookings (class_id, status);
create index if not exists gym_bookings_member_idx on public.gym_bookings (member_id, booked_at desc);
create index if not exists gym_bookings_gym_status_idx on public.gym_bookings (gym_id, status);
create index if not exists gym_membership_plans_gym_idx on public.gym_membership_plans (gym_id, active);
create index if not exists gym_member_memberships_member_idx
  on public.gym_member_memberships (member_id, status);
create index if not exists gym_member_memberships_gym_idx
  on public.gym_member_memberships (gym_id, status, ends_at);
create index if not exists gym_appointments_gym_start_idx on public.gym_appointments (gym_id, starts_at);
create index if not exists gym_tasks_gym_status_idx on public.gym_tasks (gym_id, status);
create index if not exists gym_promotions_gym_idx on public.gym_promotions (gym_id, active);
create index if not exists gym_loyalty_gym_member_idx
  on public.gym_loyalty_transactions (gym_id, member_id, created_at desc);
create index if not exists gym_program_links_gym_idx on public.gym_program_links (gym_id);
create index if not exists gym_program_links_weekday_idx on public.gym_program_links (gym_id, weekday);
create index if not exists gym_program_links_date_idx on public.gym_program_links (gym_id, scheduled_date);
create index if not exists gym_program_links_published_idx on public.gym_program_links (gym_id, published_date);
create index if not exists gym_subscriptions_status_idx on public.gym_subscriptions (status);
create index if not exists gym_admin_activity_gym_idx
  on public.gym_admin_activity (gym_id, created_at desc);

-- ============================================================
-- 6. updated_at desde Postgres
-- ============================================================

create or replace function public.gym_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$
declare
  target text;
begin
  foreach target in array array[
    'gyms', 'gym_members', 'gym_class_types', 'gym_classes', 'gym_membership_plans',
    'gym_member_memberships', 'gym_appointments', 'gym_tasks', 'gym_promotions',
    'gym_rewards', 'gym_saas_plans', 'gym_subscriptions'
  ]
  loop
    execute format('drop trigger if exists %I on public.%I', target || '_touch_trg', target);
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.gym_touch_updated_at()',
      target || '_touch_trg',
      target
    );
  end loop;
end $$;

-- ============================================================
-- 7. Aforo y lista de espera
-- ============================================================
-- El aforo se respeta en la base de datos: si la clase está llena, la reserva
-- entra como `waiting` en lugar de superar la capacidad.

create or replace function public.gym_bookings_enforce_capacity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_capacity integer;
  v_taken integer;
begin
  if new.status not in ('confirmed', 'attended') then
    return new;
  end if;

  select capacity into v_capacity
  from public.gym_classes
  where id = new.class_id;

  if v_capacity is null then
    return new;
  end if;

  select count(*) into v_taken
  from public.gym_bookings b
  where b.class_id = new.class_id
    and b.status in ('confirmed', 'attended')
    and (tg_op = 'INSERT' or b.id <> new.id);

  if v_taken >= v_capacity then
    new.status := 'waiting';
  end if;

  return new;
end;
$$;

drop trigger if exists gym_bookings_capacity_trg on public.gym_bookings;
create trigger gym_bookings_capacity_trg
  before insert or update of status on public.gym_bookings
  for each row execute function public.gym_bookings_enforce_capacity();

-- Si alguien cancela (o no asiste), el primero en lista de espera pasa a confirmado.
create or replace function public.gym_bookings_promote_waitlist()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_next_id uuid;
begin
  if tg_op <> 'UPDATE' then
    return new;
  end if;

  if old.status not in ('confirmed', 'attended') then
    return new;
  end if;

  if new.status not in ('cancelled', 'no_show') then
    return new;
  end if;

  select b.id
  into v_next_id
  from public.gym_bookings b
  where b.class_id = old.class_id
    and b.status = 'waiting'
  order by b.booked_at asc
  limit 1;

  if v_next_id is not null then
    update public.gym_bookings
    set status = 'confirmed'
    where id = v_next_id;
  end if;

  return new;
end;
$$;

drop trigger if exists gym_bookings_promote_waitlist_trg on public.gym_bookings;
create trigger gym_bookings_promote_waitlist_trg
  after update of status on public.gym_bookings
  for each row execute function public.gym_bookings_promote_waitlist();

-- ============================================================
-- 8. RLS
-- ============================================================

alter table public.gyms enable row level security;
alter table public.gym_users enable row level security;
alter table public.gym_members enable row level security;
alter table public.gym_class_types enable row level security;
alter table public.gym_classes enable row level security;
alter table public.gym_bookings enable row level security;
alter table public.gym_membership_plans enable row level security;
alter table public.gym_member_memberships enable row level security;
alter table public.gym_appointments enable row level security;
alter table public.gym_tasks enable row level security;
alter table public.gym_promotions enable row level security;
alter table public.gym_rewards enable row level security;
alter table public.gym_loyalty_transactions enable row level security;
alter table public.gym_program_links enable row level security;
alter table public.gym_saas_plans enable row level security;
alter table public.gym_subscriptions enable row level security;
alter table public.gym_admin_activity enable row level security;

-- ---- gyms ----
-- Se lee el propio gimnasio; crear y borrar gimnasios es solo del admin global.

drop policy if exists "Gym members read own gym" on public.gyms;
create policy "Gym members read own gym"
  on public.gyms for select
  to authenticated
  using (public.has_gym_access(id));

drop policy if exists "Gym managers update own gym" on public.gyms;
create policy "Gym managers update own gym"
  on public.gyms for update
  to authenticated
  using (public.can_manage_gym(id))
  with check (public.can_manage_gym(id));

drop policy if exists "Admins manage gyms" on public.gyms;
create policy "Admins manage gyms"
  on public.gyms for all
  to authenticated
  using (public.is_administrador())
  with check (public.is_administrador());

-- ---- gym_users ----

drop policy if exists "Gym members read gym users" on public.gym_users;
create policy "Gym members read gym users"
  on public.gym_users for select
  to authenticated
  using (public.has_gym_access(gym_id));

drop policy if exists "Gym managers write gym users" on public.gym_users;
create policy "Gym managers write gym users"
  on public.gym_users for all
  to authenticated
  using (public.can_manage_gym(gym_id))
  with check (public.can_manage_gym(gym_id));

-- ---- Tablas de operación diaria: leer si perteneces, escribir si operas ----

do $$
declare
  target text;
begin
  foreach target in array array[
    'gym_members', 'gym_classes', 'gym_bookings', 'gym_appointments',
    'gym_tasks', 'gym_loyalty_transactions', 'gym_member_memberships'
  ]
  loop
    execute format('drop policy if exists "Gym read %s" on public.%I', target, target);
    execute format(
      'create policy "Gym read %s" on public.%I for select to authenticated using (public.has_gym_access(gym_id))',
      target,
      target
    );

    execute format('drop policy if exists "Gym operate %s" on public.%I', target, target);
    execute format(
      'create policy "Gym operate %s" on public.%I for all to authenticated using (public.can_operate_gym(gym_id)) with check (public.can_operate_gym(gym_id))',
      target,
      target
    );
  end loop;
end $$;

-- ---- Tablas de configuración: leer si perteneces, escribir solo gestión ----

do $$
declare
  target text;
begin
  foreach target in array array[
    'gym_class_types', 'gym_membership_plans', 'gym_promotions',
    'gym_rewards', 'gym_program_links'
  ]
  loop
    execute format('drop policy if exists "Gym read %s" on public.%I', target, target);
    execute format(
      'create policy "Gym read %s" on public.%I for select to authenticated using (public.has_gym_access(gym_id))',
      target,
      target
    );

    execute format('drop policy if exists "Gym manage %s" on public.%I', target, target);
    execute format(
      'create policy "Gym manage %s" on public.%I for all to authenticated using (public.can_manage_gym(gym_id)) with check (public.can_manage_gym(gym_id))',
      target,
      target
    );
  end loop;
end $$;

-- ---- Planes SaaS: los ve cualquier usuario autenticado, los gestiona el admin ----

drop policy if exists "Staff read saas plans" on public.gym_saas_plans;
create policy "Staff read saas plans"
  on public.gym_saas_plans for select
  to authenticated
  using (true);

drop policy if exists "Admins manage saas plans" on public.gym_saas_plans;
create policy "Admins manage saas plans"
  on public.gym_saas_plans for all
  to authenticated
  using (public.is_administrador())
  with check (public.is_administrador());

-- ---- Suscripción del gimnasio: la ve el gimnasio, la cambia solo el admin ----

drop policy if exists "Gym reads own subscription" on public.gym_subscriptions;
create policy "Gym reads own subscription"
  on public.gym_subscriptions for select
  to authenticated
  using (public.has_gym_access(gym_id));

drop policy if exists "Admins manage subscriptions" on public.gym_subscriptions;
create policy "Admins manage subscriptions"
  on public.gym_subscriptions for all
  to authenticated
  using (public.is_administrador())
  with check (public.is_administrador());

-- ---- Actividad administrativa: solo administradores ----

drop policy if exists "Admins manage gym activity" on public.gym_admin_activity;
create policy "Admins manage gym activity"
  on public.gym_admin_activity for all
  to authenticated
  using (public.is_administrador())
  with check (public.is_administrador());

-- ============================================================
-- 9. El CRM de atletas puede promover a rol gimnasio
-- ============================================================
-- Reemplaza la whitelist de la función existente para admitir el cuarto rol.

create or replace function public.set_crm_lead_role(target_id uuid, new_role text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  target_role_id uuid;
begin
  if not public.is_administrador() then
    raise exception 'Solo un administrador puede cambiar el rol de un usuario';
  end if;

  if new_role not in ('atleta', 'entrenador', 'administrador', 'gimnasio') then
    raise exception 'Rol no permitido: %', new_role;
  end if;

  select id into target_role_id from public.roles where slug = new_role;

  if target_role_id is null then
    raise exception 'El rol % no existe en la tabla roles', new_role;
  end if;

  update public."Perfil"
  set id_roles = target_role_id
  where id = target_id;

  return new_role;
end;
$$;

grant execute on function public.set_crm_lead_role(uuid, text) to authenticated;

-- ============================================================
-- 10. Alta de gimnasio (solo admin global)
-- ============================================================
-- Crea gimnasio + owner + suscripción de prueba en una sola transacción.

create or replace function public.create_gym(
  p_name text,
  p_slug text default null,
  p_owner_email text default null,
  p_plan_name text default 'Starter'
)
returns public.gyms
language plpgsql
security definer
set search_path = public
as $$
declare
  v_gym public.gyms;
  v_owner uuid;
  v_plan uuid;
  v_slug text;
begin
  if not public.is_administrador() then
    raise exception 'Solo un administrador puede crear gimnasios';
  end if;

  if p_name is null or char_length(trim(p_name)) = 0 then
    raise exception 'El nombre del gimnasio es obligatorio';
  end if;

  v_slug := coalesce(nullif(trim(p_slug), ''), lower(regexp_replace(trim(p_name), '[^a-zA-Z0-9]+', '-', 'g')));

  if exists (select 1 from public.gyms g where g.slug = v_slug) then
    v_slug := v_slug || '-' || substr(gen_random_uuid()::text, 1, 4);
  end if;

  if p_owner_email is not null and char_length(trim(p_owner_email)) > 0 then
    select p.id into v_owner
    from public."Perfil" p
    where lower(p.email) = lower(trim(p_owner_email))
    limit 1;

    if v_owner is null then
      raise exception 'No hay ninguna cuenta con el email %', p_owner_email;
    end if;
  end if;

  insert into public.gyms (name, slug, email, owner_user_id, status)
  values (trim(p_name), v_slug, nullif(trim(p_owner_email), ''), v_owner, 'trial')
  returning * into v_gym;

  if v_owner is not null then
    insert into public.gym_users (gym_id, user_id, role)
    values (v_gym.id, v_owner, 'owner')
    on conflict (gym_id, user_id) do update set role = 'owner';

    -- El owner pasa a usar el CRM.
    update public."Perfil"
    set id_roles = (select r.id from public.roles r where r.slug = 'gimnasio')
    where id = v_owner;
  end if;

  select id into v_plan from public.gym_saas_plans where name = p_plan_name limit 1;

  insert into public.gym_subscriptions (gym_id, plan_id, status, trial_ends_at)
  values (v_gym.id, v_plan, 'trial', now() + interval '30 days')
  on conflict (gym_id) do nothing;

  insert into public.gym_admin_activity (gym_id, actor_user_id, action, detail)
  values (v_gym.id, auth.uid(), 'gym_created', 'Gimnasio creado desde el panel de administración');

  return v_gym;
end;
$$;

grant execute on function public.create_gym(text, text, text, text) to authenticated;

-- ============================================================
-- 10. Métricas agregadas
-- ============================================================
-- Vistas con security_invoker: cada consulta respeta la RLS de quien la hace,
-- así que un gimnasio solo obtiene su fila y el admin las de todos.

drop view if exists public.gym_dashboard_stats;
create view public.gym_dashboard_stats
with (security_invoker = true)
as
select
  g.id as gym_id,
  (select count(*) from public.gym_members m
    where m.gym_id = g.id and m.status = 'active') as active_members,
  (select count(*) from public.gym_members m
    where m.gym_id = g.id and m.joined_at >= date_trunc('month', current_date)) as new_members_this_month,
  (select count(*) from public.gym_members m where m.gym_id = g.id) as total_members,
  (select count(*) from public.gym_classes c
    where c.gym_id = g.id
      and c.start_at >= current_date
      and c.start_at < current_date + interval '1 day'
      and c.status <> 'cancelled') as classes_today,
  (select count(*) from public.gym_bookings b
    join public.gym_classes c on c.id = b.class_id
    where b.gym_id = g.id
      and c.start_at >= current_date
      and c.start_at < current_date + interval '1 day'
      and b.status in ('confirmed', 'attended')) as bookings_today,
  (select count(*) from public.gym_bookings b
    where b.gym_id = g.id
      and b.booked_at >= now() - interval '30 days'
      and b.status <> 'cancelled') as bookings_last_30_days,
  (select count(*) from public.gym_member_memberships mm
    where mm.gym_id = g.id
      and mm.status = 'active'
      and mm.ends_at is not null
      and mm.ends_at between current_date and current_date + interval '15 days') as memberships_expiring_soon
from public.gyms g;

grant select on public.gym_dashboard_stats to authenticated;
