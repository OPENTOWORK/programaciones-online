-- Rol administrador: mismos permisos que entrenador en la app (de momento).
-- Los usuarios que hoy son entrenadores pasan a administrador.

alter table public.roles drop constraint if exists roles_slug_check;
alter table public.roles
  add constraint roles_slug_check
  check (slug in ('atleta', 'entrenador', 'administrador'));

insert into public.roles (slug, name)
values ('administrador', 'Administrador')
on conflict (slug) do nothing;

-- Quien era entrenador pasa a administrador.
update public."Perfil" p
set id_roles = r_admin.id
from public.roles r_old
join public.roles r_admin on r_admin.slug = 'administrador'
where p.id_roles = r_old.id
  and r_old.slug = 'entrenador';

create or replace function public.is_entrenador()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role_slug() in ('entrenador', 'administrador'), false);
$$;

-- Ver perfiles del equipo: entrenadores y administradores.
drop policy if exists "Trainers can view team trainer profiles" on public."Perfil";
create policy "Trainers can view team trainer profiles"
  on public."Perfil" for select
  to authenticated
  using (
    public.is_entrenador()
    and exists (
      select 1
      from public.roles r
      where r.id = "Perfil".id_roles
        and r.slug in ('entrenador', 'administrador')
    )
  );

-- ---------------------------------------------------------------------------
-- Columna del CRM que promueve a administrador
-- ---------------------------------------------------------------------------

alter table public.trainer_crm_stages
  drop constraint if exists trainer_crm_stages_role_slug_check;

alter table public.trainer_crm_stages
  add constraint trainer_crm_stages_role_slug_check
  check (role_slug is null or role_slug in ('atleta', 'entrenador', 'administrador'));

-- Las columnas creadas desde la app se quedaron sin role_slug porque el CHECK anterior
-- no admitía el rol nuevo: se reconocen por el nombre.
update public.trainer_crm_stages
set role_slug = 'administrador'
where role_slug is null and name = 'Rol administrador';

update public.trainer_crm_stages
set role_slug = 'entrenador'
where role_slug is null and name = 'Rol entrenador';

-- El tablero es común a todo el equipo, así que solo debe existir una columna por rol.
-- Las fichas de las repetidas pasan a la que se queda antes de borrarlas.
with duplicates as (
  select
    id,
    first_value(id) over (partition by role_slug order by position, id) as keep_id,
    row_number() over (partition by role_slug order by position, id) as rn
  from public.trainer_crm_stages
  where role_slug in ('entrenador', 'administrador')
)
update public.trainer_crm_leads l
set stage_id = d.keep_id
from duplicates d
where l.stage_id = d.id
  and d.rn > 1;

with duplicates as (
  select id, row_number() over (partition by role_slug order by position, id) as rn
  from public.trainer_crm_stages
  where role_slug in ('entrenador', 'administrador')
)
delete from public.trainer_crm_stages s
using duplicates d
where s.id = d.id
  and d.rn > 1;

-- Si el tablero no tiene columna de administrador, se añade al final.
insert into public.trainer_crm_stages (trainer_id, name, position, role_slug)
select s.trainer_id, 'Rol administrador', (select max(position) + 1 from public.trainer_crm_stages), 'administrador'
from public.trainer_crm_stages s
where not exists (
  select 1 from public.trainer_crm_stages existing where existing.role_slug = 'administrador'
)
order by s.position
limit 1;

create or replace function public.set_crm_lead_role(target_id uuid, new_role text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  target_role_id uuid;
begin
  if not public.is_entrenador() then
    raise exception 'Solo un entrenador puede cambiar el rol de un usuario';
  end if;

  if new_role not in ('atleta', 'entrenador', 'administrador') then
    raise exception 'Rol no permitido: %', new_role;
  end if;

  if target_id = auth.uid() then
    raise exception 'No puedes cambiar tu propio rol';
  end if;

  if not public.is_own_crm_lead(target_id) then
    raise exception 'Ese usuario no está en tu tablero';
  end if;

  select id into target_role_id
  from public.roles
  where slug = new_role;

  if target_role_id is null then
    raise exception 'No existe el rol %', new_role;
  end if;

  update public."Perfil"
  set id_roles = target_role_id
  where id = target_id;

  return new_role;
end;
$$;

grant execute on function public.set_crm_lead_role(uuid, text) to authenticated;
