-- Tabla Perfil (fuente única de datos de usuario en la app)
alter table if exists public."Perfil" enable row level security;

drop policy if exists "Users can view own profile" on public."Perfil";
create policy "Users can view own profile"
  on public."Perfil" for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public."Perfil";
create policy "Users can update own profile"
  on public."Perfil" for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public."Perfil";
create policy "Users can insert own profile"
  on public."Perfil" for insert
  to authenticated
  with check (auth.uid() = id);

-- Migrar datos pendientes desde profiles (si aún existe)
do $$
begin
  if to_regclass('public.profiles') is not null then
    update public."Perfil" p
    set
      name = coalesce(nullif(p.name, ''), pr.name),
      email = coalesce(nullif(p.email, ''), pr.email),
      nivel = coalesce(p.nivel, pr.fitness_level),
      objetivo = coalesce(p.objetivo, pr.main_goal),
      altura = coalesce(p.altura, pr.height::bigint),
      peso = coalesce(p.peso, pr.weight::bigint),
      lesiones = coalesce(p.lesiones, pr.injuries)
    from public.profiles pr
    where p.id = pr.id;

    insert into public."Perfil" (id, name, email, nivel, objetivo, altura, peso, lesiones)
    select pr.id, pr.name, pr.email, pr.fitness_level, pr.main_goal, pr.height::bigint, pr.weight::bigint, pr.injuries
    from public.profiles pr
    where not exists (select 1 from public."Perfil" p where p.id = pr.id);
  end if;
end $$;

-- Crear perfil al registrarse
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Sincronizar usuarios auth sin fila en Perfil
insert into public."Perfil" (id, name, email)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'name', 'Usuario'),
  u.email
from auth.users u
left join public."Perfil" p on p.id = u.id
where p.id is null;

-- Eliminar tabla legacy profiles
drop table if exists public.profiles cascade;

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
