-- Permisos diferenciados: administrador ve todo; entrenador solo sus atletas asignados.

create or replace function public.is_administrador()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role_slug() = 'administrador', false);
$$;

grant execute on function public.is_administrador() to authenticated;

create or replace function public.is_trainer_only()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role_slug() = 'entrenador', false);
$$;

grant execute on function public.is_trainer_only() to authenticated;

alter table public.trainer_crm_leads
  add column if not exists assigned_trainer_id uuid references auth.users(id) on delete set null;

update public.trainer_crm_leads
set assigned_trainer_id = trainer_id
where assigned_trainer_id is null
  and trainer_id is not null;

create index if not exists trainer_crm_leads_assigned_trainer_idx
  on public.trainer_crm_leads (assigned_trainer_id);

create or replace function public.is_assigned_athlete(target_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.trainer_crm_leads l
    where l.athlete_id = target_id
      and coalesce(l.assigned_trainer_id, l.trainer_id) = auth.uid()
  );
$$;

grant execute on function public.is_assigned_athlete(uuid) to authenticated;

-- Atletas: administrador ve todos; entrenador solo los asignados.
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
    and (
      public.is_administrador()
      or public.is_assigned_athlete("Perfil".id)
    )
  );

-- Staff: solo el administrador ve perfiles de entrenadores y administradores.
drop policy if exists "Trainers can view team trainer profiles" on public."Perfil";
create policy "Trainers can view team trainer profiles"
  on public."Perfil" for select
  to authenticated
  using (
    public.is_administrador()
    and exists (
      select 1
      from public.roles r
      where r.id = "Perfil".id_roles
        and r.slug in ('entrenador', 'administrador')
    )
  );

-- Fichas del CRM: administrador ve todas; entrenador solo las suyas.
drop policy if exists "Trainers can view team leads" on public.trainer_crm_leads;
create policy "Trainers can view team leads"
  on public.trainer_crm_leads for select
  to authenticated
  using (
    public.is_administrador()
    or (
      public.is_trainer_only()
      and coalesce(assigned_trainer_id, trainer_id) = auth.uid()
    )
  );

drop policy if exists "Trainers can update team leads" on public.trainer_crm_leads;
create policy "Trainers can update team leads"
  on public.trainer_crm_leads for update
  to authenticated
  using (
    public.is_administrador()
    or (
      public.is_trainer_only()
      and coalesce(assigned_trainer_id, trainer_id) = auth.uid()
    )
  )
  with check (
    public.is_administrador()
    or (
      public.is_trainer_only()
      and coalesce(assigned_trainer_id, trainer_id) = auth.uid()
    )
  );

-- Solo el administrador puede cambiar roles desde el CRM.
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
