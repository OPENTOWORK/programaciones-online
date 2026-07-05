-- Programaciones online — Esquema Supabase
-- Ejecutar en el SQL Editor de Supabase

-- Roles de usuario (atleta, entrenador)
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug in ('atleta', 'entrenador')),
  name text not null,
  created_at timestamptz default now()
);

insert into public.roles (slug, name) values
  ('atleta', 'Atleta'),
  ('entrenador', 'Entrenador')
on conflict (slug) do nothing;

-- Perfil de usuario (extiende auth.users)
create table if not exists public."Perfil" (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  id_roles uuid references public.roles(id),
  altura bigint,
  peso bigint,
  lesiones text,
  nivel text check (nivel in ('principiante', 'intermedio', 'avanzado')),
  objetivo text check (objetivo in ('fuerza', 'hipertrofia', 'pérdida de grasa', 'rendimiento', 'movilidad'))
);

-- Programaciones
create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text check (category in ('standard', 'hype', 'personalized')) not null,
  level text check (level in ('principiante', 'intermedio', 'avanzado')) not null,
  duration text not null,
  goal text not null,
  sessions_per_week integer not null,
  status text check (status in ('disponible', 'activa', 'bloqueada', 'personalizada')) default 'disponible',
  icon text,
  description text,
  equipment text[] default '{}',
  training_days text[] default '{}',
  created_at timestamptz default now()
);

-- Semanas de programación
create table if not exists public.program_weeks (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references public.programs(id) on delete cascade not null,
  number integer not null,
  title text not null,
  created_at timestamptz default now()
);

-- Sesiones / workouts
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references public.programs(id) on delete cascade not null,
  week_id uuid references public.program_weeks(id) on delete cascade,
  week_number integer not null,
  day_label text not null,
  name text not null,
  estimated_duration text,
  warmup text,
  main_part text,
  core_part text,
  cooldown text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Ejercicios
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid references public.workouts(id) on delete cascade not null,
  name text not null,
  sets integer not null,
  reps text not null,
  rest text,
  notes text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Programas asignados a usuarios
create table if not exists public.user_programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  program_id uuid references public.programs(id) on delete cascade not null,
  status text check (status in ('activa', 'completada', 'pausada')) default 'activa',
  started_at timestamptz default now(),
  completed_at timestamptz,
  unique (user_id, program_id)
);

-- Registro de entrenamientos completados
create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  workout_id uuid references public.workouts(id) on delete set null,
  workout_name text not null,
  duration text,
  completed_at timestamptz default now()
);

-- Entradas de progreso (peso, medidas)
create table if not exists public.progress_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  weight numeric,
  chest numeric,
  waist numeric,
  hips numeric,
  notes text,
  recorded_at timestamptz default now()
);

-- Mensajes con entrenador
create table if not exists public.trainer_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  sender text check (sender in ('user', 'trainer')) not null,
  text text not null,
  created_at timestamptz default now()
);

-- RLS
alter table public.roles enable row level security;

alter table public."Perfil" enable row level security;
alter table public.programs enable row level security;
alter table public.program_weeks enable row level security;
alter table public.workouts enable row level security;
alter table public.exercises enable row level security;
alter table public.user_programs enable row level security;
alter table public.workout_logs enable row level security;
alter table public.progress_entries enable row level security;
alter table public.trainer_messages enable row level security;

-- Roles: lectura para usuarios autenticados (catálogo fijo)
create policy "Roles are viewable by authenticated users"
  on public.roles for select
  to authenticated
  using (true);

-- Programas públicos (lectura para todos los autenticados)
create policy "Programs are viewable by authenticated users"
  on public.programs for select
  to authenticated
  using (true);

create policy "Program weeks are viewable by authenticated users"
  on public.program_weeks for select
  to authenticated
  using (true);

create policy "Workouts are viewable by authenticated users"
  on public.workouts for select
  to authenticated
  using (true);

create policy "Exercises are viewable by authenticated users"
  on public.exercises for select
  to authenticated
  using (true);

-- Perfil: solo el propio usuario
create policy "Users can view own profile"
  on public."Perfil" for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public."Perfil" for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert own profile"
  on public."Perfil" for insert
  to authenticated
  with check (auth.uid() = id);

-- User programs: solo el propio usuario
create policy "Users can view own programs"
  on public.user_programs for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can manage own programs"
  on public.user_programs for all
  to authenticated
  using (auth.uid() = user_id);

-- Workout logs: solo el propio usuario
create policy "Users can view own workout logs"
  on public.workout_logs for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own workout logs"
  on public.workout_logs for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Progress entries: solo el propio usuario
create policy "Users can view own progress"
  on public.progress_entries for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can manage own progress"
  on public.progress_entries for all
  to authenticated
  using (auth.uid() = user_id);

-- Trainer messages: solo el propio usuario
create policy "Users can view own messages"
  on public.trainer_messages for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can send own messages"
  on public.trainer_messages for insert
  to authenticated
  with check (auth.uid() = user_id and sender = 'user');

-- Trigger para crear perfil al registrarse
drop trigger if exists on_auth_user_created on auth.users;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public."Perfil" (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Usuario'),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Comprobar si un email está registrado (recuperación de contraseña)
create or replace function public.is_email_registered(check_email text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from auth.users
    where lower(email) = lower(trim(check_email))
  );
$$;

grant execute on function public.is_email_registered(text) to anon, authenticated;
