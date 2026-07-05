-- Acceso de entrenadores a fichas y chats de atletas

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

alter table public.roles enable row level security;

drop policy if exists "Roles are viewable by authenticated users" on public.roles;
create policy "Roles are viewable by authenticated users"
  on public.roles for select
  to authenticated
  using (true);

alter table public."Perfil" add column if not exists id_roles uuid;

-- Corregir id_roles huérfanos antes de crear la FK
update public."Perfil" p
set id_roles = r.id
from public.roles r
where r.slug = 'atleta'
  and p.id_roles is not null
  and not exists (select 1 from public.roles rr where rr.id = p.id_roles);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'Perfil_id_roles_fkey'
      and conrelid = 'public."Perfil"'::regclass
  ) then
    alter table public."Perfil"
      add constraint "Perfil_id_roles_fkey"
      foreign key (id_roles) references public.roles(id);
  end if;
end $$;

create or replace function public.current_user_role_slug()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select r.slug
  from public."Perfil" p
  left join public.roles r on r.id = p.id_roles
  where p.id = auth.uid();
$$;

create or replace function public.is_entrenador()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role_slug() = 'entrenador', false);
$$;

grant execute on function public.current_user_role_slug() to authenticated;
grant execute on function public.is_entrenador() to authenticated;

-- Perfil: rol por defecto atleta en registros existentes
update public."Perfil" p
set id_roles = r.id
from public.roles r
where r.slug = 'atleta'
  and p.id_roles is null;

-- Perfil: entrenadores pueden ver atletas
drop policy if exists "Trainers can view athlete profiles" on public."Perfil";
create policy "Trainers can view athlete profiles"
  on public."Perfil" for select
  to authenticated
  using (
    public.is_entrenador()
    and exists (
      select 1
      from public.roles r
      where r.id = "Perfil".id_roles
        and r.slug = 'atleta'
    )
  );

-- Mensajes con entrenador (si aún no existe)
create table if not exists public.trainer_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  sender text check (sender in ('user', 'trainer')) not null,
  text text not null,
  created_at timestamptz default now()
);

alter table public.trainer_messages enable row level security;

drop policy if exists "Users can view own messages" on public.trainer_messages;
create policy "Users can view own messages"
  on public.trainer_messages for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can send own messages" on public.trainer_messages;
create policy "Users can send own messages"
  on public.trainer_messages for insert
  to authenticated
  with check (auth.uid() = user_id and sender = 'user');

-- Mensajes: entrenadores (solo si existe la tabla)
do $$
begin
  if to_regclass('public.trainer_messages') is not null then
    execute 'drop policy if exists "Trainers can view athlete messages" on public.trainer_messages';
    execute $policy$
      create policy "Trainers can view athlete messages"
      on public.trainer_messages for select
      to authenticated
      using (
        public.is_entrenador()
        and exists (
          select 1
          from public."Perfil" p
          join public.roles r on r.id = p.id_roles
          where p.id = trainer_messages.user_id
            and r.slug = 'atleta'
        )
      )
    $policy$;

    execute 'drop policy if exists "Trainers can send messages to athletes" on public.trainer_messages';
    execute $policy$
      create policy "Trainers can send messages to athletes"
      on public.trainer_messages for insert
      to authenticated
      with check (
        public.is_entrenador()
        and sender = 'trainer'
        and exists (
          select 1
          from public."Perfil" p
          join public.roles r on r.id = p.id_roles
          where p.id = user_id
            and r.slug = 'atleta'
        )
      )
    $policy$;
  end if;
end $$;

-- user_programs: entrenadores (solo si existe la tabla)
do $$
begin
  if to_regclass('public.user_programs') is not null then
    execute 'drop policy if exists "Trainers can view athlete programs" on public.user_programs';
    execute $policy$
      create policy "Trainers can view athlete programs"
      on public.user_programs for select
      to authenticated
      using (
        public.is_entrenador()
        and exists (
          select 1
          from public."Perfil" p
          join public.roles r on r.id = p.id_roles
          where p.id = user_programs.user_id
            and r.slug = 'atleta'
        )
      )
    $policy$;
  end if;
end $$;

-- programas: lectura para entrenadores
do $$
begin
  if to_regclass('public.programas') is not null then
    execute 'drop policy if exists "Trainers can view programs catalog" on public.programas';
    execute $policy$
      create policy "Trainers can view programs catalog"
      on public.programas for select
      to authenticated
      using (public.is_entrenador())
    $policy$;
  end if;
end $$;

-- Trigger: nuevo usuario con rol atleta por defecto
create or replace function public.handle_new_user()
returns trigger as $$
declare
  atleta_role_id uuid;
begin
  select id into atleta_role_id
  from public.roles
  where slug = 'atleta'
  limit 1;

  insert into public."Perfil" (id, name, email, id_roles)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Usuario'),
    new.email,
    atleta_role_id
  )
  on conflict (id) do nothing;

  return new;
end;
$$ language plpgsql security definer;
