-- Columnas del CRM que cambian el rol del lead al moverlo dentro de ellas.

alter table public.trainer_crm_stages
  add column if not exists role_slug text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'trainer_crm_stages_role_slug_check'
      and conrelid = 'public.trainer_crm_stages'::regclass
  ) then
    alter table public.trainer_crm_stages
      add constraint trainer_crm_stages_role_slug_check
      check (role_slug is null or role_slug in ('atleta', 'entrenador'));
  end if;
end $$;

-- Los tableros ya existentes reciben la columna "Rol entrenador" al final.
insert into public.trainer_crm_stages (trainer_id, name, position, role_slug)
select s.trainer_id, 'Rol entrenador', max(s.position) + 1, 'entrenador'
from public.trainer_crm_stages s
where not exists (
  select 1
  from public.trainer_crm_stages existing
  where existing.trainer_id = s.trainer_id
    and existing.role_slug = 'entrenador'
)
group by s.trainer_id;

-- El perfil promocionado deja de tener rol atleta, así que el entrenador necesita
-- poder seguir viéndolo mientras siga en su tablero.
create or replace function public.is_own_crm_lead(target_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.trainer_crm_leads l
    where l.trainer_id = auth.uid()
      and l.athlete_id = target_id
  );
$$;

grant execute on function public.is_own_crm_lead(uuid) to authenticated;

drop policy if exists "Trainers can view own CRM lead profiles" on public."Perfil";
create policy "Trainers can view own CRM lead profiles"
  on public."Perfil" for select
  to authenticated
  using (public.is_entrenador() and public.is_own_crm_lead("Perfil".id));

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

  if new_role not in ('atleta', 'entrenador') then
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
