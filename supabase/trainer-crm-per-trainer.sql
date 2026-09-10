-- Cada entrenador vuelve a tener su propio tablero CRM.
-- Los atletas asignados a un entrenador solo los gestiona ese entrenador.
-- El administrador los ve en la columna "Cliente cedido", sin poder organizarlos.

alter table public.trainer_crm_stages
  add column if not exists system_key text;

create unique index if not exists trainer_crm_stages_trainer_system_key_idx
  on public.trainer_crm_stages (trainer_id, system_key)
  where system_key is not null;

-- ---------------------------------------------------------------------------
-- 1. Un tablero por entrenador: clonar el tablero compartido si aún no tiene columnas
-- ---------------------------------------------------------------------------

do $$
declare
  template_trainer uuid;
begin
  select trainer_id into template_trainer
  from public.trainer_crm_stages
  group by trainer_id
  order by count(*) desc, trainer_id
  limit 1;

  if template_trainer is null then
    return;
  end if;

  insert into public.trainer_crm_stages (trainer_id, name, position, role_slug)
  select p.id, s.name, s.position, s.role_slug
  from public."Perfil" p
  join public.roles r on r.id = p.id_roles
  join public.trainer_crm_stages s on s.trainer_id = template_trainer
  where r.slug in ('entrenador', 'administrador')
    and p.id <> template_trainer
    and not exists (
      select 1 from public.trainer_crm_stages existing where existing.trainer_id = p.id
    )
    and (
      r.slug = 'administrador'
      or s.role_slug is null
    );
end $$;

-- Llevar cada ficha a la columna homónima del tablero de su entrenador asignado.
update public.trainer_crm_leads l
set stage_id = (
  select matched.id
  from public.trainer_crm_stages old
  join public.trainer_crm_stages matched
    on matched.trainer_id = coalesce(l.assigned_trainer_id, l.trainer_id)
   and lower(trim(matched.name)) = lower(trim(old.name))
  where old.id = l.stage_id
    and old.trainer_id is distinct from coalesce(l.assigned_trainer_id, l.trainer_id)
  limit 1
)
where l.archived_at is null
  and exists (
    select 1
    from public.trainer_crm_stages old
    join public.trainer_crm_stages matched
      on matched.trainer_id = coalesce(l.assigned_trainer_id, l.trainer_id)
     and lower(trim(matched.name)) = lower(trim(old.name))
    where old.id = l.stage_id
      and old.trainer_id is distinct from coalesce(l.assigned_trainer_id, l.trainer_id)
  );

-- Si no había columna homónima, cae en la primera columna gestionable del dueño.
update public.trainer_crm_leads l
set stage_id = (
  select s.id
  from public.trainer_crm_stages s
  where s.trainer_id = coalesce(l.assigned_trainer_id, l.trainer_id)
    and s.role_slug is null
    and coalesce(s.system_key, '') is distinct from 'ceded_client'
    and lower(trim(s.name)) is distinct from 'cliente cedido'
  order by s.position
  limit 1
)
where l.archived_at is null
  and l.stage_id is not null
  and not exists (
    select 1
    from public.trainer_crm_stages s
    where s.id = l.stage_id
      and s.trainer_id = coalesce(l.assigned_trainer_id, l.trainer_id)
  )
  and exists (
    select 1
    from public.trainer_crm_stages s
    where s.trainer_id = coalesce(l.assigned_trainer_id, l.trainer_id)
      and s.role_slug is null
      and coalesce(s.system_key, '') is distinct from 'ceded_client'
      and lower(trim(s.name)) is distinct from 'cliente cedido'
  );

-- ---------------------------------------------------------------------------
-- 2. Columna de solo lectura para el administrador
-- ---------------------------------------------------------------------------

insert into public.trainer_crm_stages (trainer_id, name, position, system_key)
select
  p.id,
  'Cliente cedido',
  coalesce((select max(s.position) from public.trainer_crm_stages s where s.trainer_id = p.id), -1) + 1,
  'ceded_client'
from public."Perfil" p
join public.roles r on r.id = p.id_roles
where r.slug = 'administrador'
  and not exists (
    select 1
    from public.trainer_crm_stages existing
    where existing.trainer_id = p.id
      and (
        existing.system_key = 'ceded_client'
        or lower(trim(existing.name)) = 'cliente cedido'
      )
  );

update public.trainer_crm_stages
set system_key = 'ceded_client'
where system_key is null
  and lower(trim(name)) = 'cliente cedido';

drop index if exists public.trainer_crm_stages_position_idx;
create index if not exists trainer_crm_stages_trainer_id_idx
  on public.trainer_crm_stages (trainer_id, position);

-- ---------------------------------------------------------------------------
-- 3. Las columnas vuelven a ser de cada entrenador
-- ---------------------------------------------------------------------------

drop policy if exists "Trainers can view team stages" on public.trainer_crm_stages;
drop policy if exists "Trainers can create team stages" on public.trainer_crm_stages;
drop policy if exists "Trainers can update team stages" on public.trainer_crm_stages;
drop policy if exists "Trainers can delete team stages" on public.trainer_crm_stages;
drop policy if exists "Trainers can view own stages" on public.trainer_crm_stages;
drop policy if exists "Trainers can create own stages" on public.trainer_crm_stages;
drop policy if exists "Trainers can update own stages" on public.trainer_crm_stages;
drop policy if exists "Trainers can delete own stages" on public.trainer_crm_stages;

create policy "Trainers can view own stages"
  on public.trainer_crm_stages for select
  to authenticated
  using (public.is_entrenador() and trainer_id = auth.uid());

create policy "Trainers can create own stages"
  on public.trainer_crm_stages for insert
  to authenticated
  with check (public.is_entrenador() and trainer_id = auth.uid());

create policy "Trainers can update own stages"
  on public.trainer_crm_stages for update
  to authenticated
  using (public.is_entrenador() and trainer_id = auth.uid())
  with check (public.is_entrenador() and trainer_id = auth.uid());

create policy "Trainers can delete own stages"
  on public.trainer_crm_stages for delete
  to authenticated
  using (public.is_entrenador() and trainer_id = auth.uid());

-- Crear fichas solo en el propio tablero (el administrador sigue viendo las cedidas).
drop policy if exists "Trainers can create team leads" on public.trainer_crm_leads;
drop policy if exists "Trainers can create own leads" on public.trainer_crm_leads;

create policy "Trainers can create own leads"
  on public.trainer_crm_leads for insert
  to authenticated
  with check (
    public.is_administrador()
    or (
      public.is_trainer_only()
      and coalesce(assigned_trainer_id, trainer_id) = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 4. Gestionar (planes, chat) solo si el atleta es tuyo
-- ---------------------------------------------------------------------------

create or replace function public.can_manage_athlete(target_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_administrador()
    or public.is_assigned_athlete(target_id);
$$;

grant execute on function public.can_manage_athlete(uuid) to authenticated;

drop policy if exists "Trainers can view athlete plans" on public.athlete_plans;
create policy "Trainers can view athlete plans"
  on public.athlete_plans for select
  to authenticated
  using (public.can_manage_athlete(athlete_id));

drop policy if exists "Trainers can create athlete plans" on public.athlete_plans;
create policy "Trainers can create athlete plans"
  on public.athlete_plans for insert
  to authenticated
  with check (
    public.can_manage_athlete(athlete_id)
    and trainer_id = auth.uid()
  );

drop policy if exists "Trainers can update own athlete plans" on public.athlete_plans;
drop policy if exists "Trainers can update team athlete plans" on public.athlete_plans;
create policy "Trainers can update team athlete plans"
  on public.athlete_plans for update
  to authenticated
  using (public.can_manage_athlete(athlete_id))
  with check (public.can_manage_athlete(athlete_id));

drop policy if exists "Trainers can delete own athlete plans" on public.athlete_plans;
drop policy if exists "Trainers can delete team athlete plans" on public.athlete_plans;
create policy "Trainers can delete team athlete plans"
  on public.athlete_plans for delete
  to authenticated
  using (public.can_manage_athlete(athlete_id));

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
        and public.can_manage_athlete(user_id)
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
        and public.can_manage_athlete(user_id)
      )
    $policy$;
  end if;
end $$;
