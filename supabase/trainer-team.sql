-- Los entrenadores pasan a trabajar como un equipo: todos ven y editan lo mismo.
--
-- Hasta ahora cada entrenador tenía su propio tablero CRM, sus plantillas y su feedback,
-- acotados por `trainer_id = auth.uid()`. A partir de aquí `trainer_id` solo indica quién
-- creó cada cosa; quien decide el acceso es el rol.
--
-- Este fichero NO abre transacción a propósito: lo envuelve scripts/apply-trainer-team.mjs,
-- que además define el email del entrenador canónico en app.trainer_team_owner_email.

-- ---------------------------------------------------------------------------
-- 1. Copia de seguridad del tablero antes de tocar nada
-- ---------------------------------------------------------------------------

create table if not exists public.trainer_crm_stages_backup as
  table public.trainer_crm_stages;

create table if not exists public.trainer_crm_leads_backup as
  table public.trainer_crm_leads;

-- ---------------------------------------------------------------------------
-- 2. Consolidar los tableros en uno solo
-- ---------------------------------------------------------------------------

do $$
declare
  owner_email text := nullif(trim(current_setting('app.trainer_team_owner_email', true)), '');
  owner_id uuid;
  first_stage_id uuid;
  moved_leads integer;
  dropped_leads integer;
  restored_leads integer;
  dropped_stages integer;
begin
  if owner_email is null then
    raise exception
      'Falta el email del entrenador canónico. Ejecuta: npm run supabase:trainer-team -- --owner-email tu@email.com';
  end if;

  select u.id into owner_id
  from auth.users u
  where lower(u.email) = lower(owner_email);

  if owner_id is null then
    raise exception 'No hay ningún usuario con el email %', owner_email;
  end if;

  select s.id into first_stage_id
  from public.trainer_crm_stages s
  where s.trainer_id = owner_id
  order by s.position, s.created_at
  limit 1;

  if first_stage_id is null then
    raise exception 'El entrenador % no tiene columnas en su tablero, no sirve como referencia', owner_email;
  end if;

  -- Cada ficha de otro tablero se lleva a la columna del mismo nombre. Si ese nombre no
  -- existe en el tablero de referencia, cae en la primera columna.
  update public.trainer_crm_leads l
  set stage_id = coalesce(
    (
      select o.id
      from public.trainer_crm_stages o
      where o.trainer_id = owner_id
        and lower(trim(o.name)) = lower(trim(s.name))
      order by o.position
      limit 1
    ),
    first_stage_id
  )
  from public.trainer_crm_stages s
  where s.id = l.stage_id
    and s.trainer_id <> owner_id;

  get diagnostics moved_leads = row_count;

  -- Un atleta podía tener una ficha por entrenador y ahora solo puede tener una.
  -- Manda la del tablero de referencia; si ahí no estaba, la que siga sin archivar.
  delete from public.trainer_crm_leads l
  using (
    select
      id,
      row_number() over (
        partition by athlete_id
        order by
          (trainer_id = owner_id) desc,
          (archived_at is null) desc,
          updated_at desc nulls last,
          id
      ) as rn
    from public.trainer_crm_leads
  ) ranked
  where ranked.id = l.id
    and ranked.rn > 1;

  get diagnostics dropped_leads = row_count;

  -- Si una ejecución anterior dejó ganar a otro tablero, la copia de seguridad devuelve
  -- al atleta a la columna que tenía en el tablero de referencia.
  update public.trainer_crm_leads l
  set
    stage_id = b.stage_id,
    position = b.position,
    archived_at = b.archived_at,
    trainer_id = b.trainer_id,
    updated_at = now()
  from public.trainer_crm_leads_backup b
  where b.athlete_id = l.athlete_id
    and b.trainer_id = owner_id
    and (
      b.stage_id is null
      or exists (select 1 from public.trainer_crm_stages s where s.id = b.stage_id)
    )
    and (l.stage_id is distinct from b.stage_id or l.archived_at is distinct from b.archived_at);

  get diagnostics restored_leads = row_count;

  delete from public.trainer_crm_stages
  where trainer_id <> owner_id;

  get diagnostics dropped_stages = row_count;

  raise notice 'Tablero consolidado en %: % fichas recolocadas, % duplicadas eliminadas, % devueltas a su columna, % columnas sobrantes eliminadas',
    owner_email, moved_leads, dropped_leads, restored_leads, dropped_stages;
end $$;

-- La ficha deja de ser única por entrenador y pasa a serlo por atleta.
alter table public.trainer_crm_leads
  drop constraint if exists trainer_crm_leads_trainer_id_athlete_id_key;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'trainer_crm_leads_athlete_id_key'
      and conrelid = 'public.trainer_crm_leads'::regclass
  ) then
    alter table public.trainer_crm_leads
      add constraint trainer_crm_leads_athlete_id_key unique (athlete_id);
  end if;
end $$;

-- Los índices dejan de arrancar por trainer_id porque ya nadie consulta por él.
drop index if exists public.trainer_crm_stages_trainer_id_idx;
create index if not exists trainer_crm_stages_position_idx
  on public.trainer_crm_stages (position);

drop index if exists public.trainer_crm_leads_trainer_id_idx;
create index if not exists trainer_crm_leads_stage_idx
  on public.trainer_crm_leads (stage_id, position);

drop index if exists public.trainer_crm_leads_archived_idx;
create index if not exists trainer_crm_leads_archived_at_idx
  on public.trainer_crm_leads (archived_at);

drop index if exists public.trainer_crm_activity_lookup_idx;
create index if not exists trainer_crm_activity_athlete_idx
  on public.trainer_crm_activity (athlete_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 3. Políticas de equipo: basta con ser entrenador
-- ---------------------------------------------------------------------------

-- Columnas del tablero
drop policy if exists "Trainers can view own stages" on public.trainer_crm_stages;
drop policy if exists "Trainers can create own stages" on public.trainer_crm_stages;
drop policy if exists "Trainers can update own stages" on public.trainer_crm_stages;
drop policy if exists "Trainers can delete own stages" on public.trainer_crm_stages;
drop policy if exists "Trainers can view team stages" on public.trainer_crm_stages;
drop policy if exists "Trainers can create team stages" on public.trainer_crm_stages;
drop policy if exists "Trainers can update team stages" on public.trainer_crm_stages;
drop policy if exists "Trainers can delete team stages" on public.trainer_crm_stages;

create policy "Trainers can view team stages"
  on public.trainer_crm_stages for select
  to authenticated
  using (public.is_entrenador());

create policy "Trainers can create team stages"
  on public.trainer_crm_stages for insert
  to authenticated
  with check (public.is_entrenador());

create policy "Trainers can update team stages"
  on public.trainer_crm_stages for update
  to authenticated
  using (public.is_entrenador())
  with check (public.is_entrenador());

create policy "Trainers can delete team stages"
  on public.trainer_crm_stages for delete
  to authenticated
  using (public.is_entrenador());

-- Fichas del tablero
drop policy if exists "Trainers can view own leads" on public.trainer_crm_leads;
drop policy if exists "Trainers can create own leads" on public.trainer_crm_leads;
drop policy if exists "Trainers can update own leads" on public.trainer_crm_leads;
drop policy if exists "Trainers can delete own leads" on public.trainer_crm_leads;
drop policy if exists "Trainers can view team leads" on public.trainer_crm_leads;
drop policy if exists "Trainers can create team leads" on public.trainer_crm_leads;
drop policy if exists "Trainers can update team leads" on public.trainer_crm_leads;
drop policy if exists "Trainers can delete team leads" on public.trainer_crm_leads;

create policy "Trainers can view team leads"
  on public.trainer_crm_leads for select
  to authenticated
  using (public.is_entrenador());

create policy "Trainers can create team leads"
  on public.trainer_crm_leads for insert
  to authenticated
  with check (public.is_entrenador());

create policy "Trainers can update team leads"
  on public.trainer_crm_leads for update
  to authenticated
  using (public.is_entrenador())
  with check (public.is_entrenador());

create policy "Trainers can delete team leads"
  on public.trainer_crm_leads for delete
  to authenticated
  using (public.is_entrenador());

-- Historial de seguimiento
drop policy if exists "Trainers can view own activity" on public.trainer_crm_activity;
drop policy if exists "Trainers can create own activity" on public.trainer_crm_activity;
drop policy if exists "Trainers can delete own activity" on public.trainer_crm_activity;
drop policy if exists "Trainers can view team activity" on public.trainer_crm_activity;
drop policy if exists "Trainers can create team activity" on public.trainer_crm_activity;
drop policy if exists "Trainers can update team activity" on public.trainer_crm_activity;
drop policy if exists "Trainers can delete team activity" on public.trainer_crm_activity;

create policy "Trainers can view team activity"
  on public.trainer_crm_activity for select
  to authenticated
  using (public.is_entrenador());

create policy "Trainers can create team activity"
  on public.trainer_crm_activity for insert
  to authenticated
  with check (public.is_entrenador());

create policy "Trainers can update team activity"
  on public.trainer_crm_activity for update
  to authenticated
  using (public.is_entrenador())
  with check (public.is_entrenador());

create policy "Trainers can delete team activity"
  on public.trainer_crm_activity for delete
  to authenticated
  using (public.is_entrenador());

-- Plantillas de sesión
drop policy if exists "Trainers can view own session templates" on public.trainer_session_templates;
drop policy if exists "Trainers can create own session templates" on public.trainer_session_templates;
drop policy if exists "Trainers can update own session templates" on public.trainer_session_templates;
drop policy if exists "Trainers can delete own session templates" on public.trainer_session_templates;
drop policy if exists "Trainers can view team session templates" on public.trainer_session_templates;
drop policy if exists "Trainers can create team session templates" on public.trainer_session_templates;
drop policy if exists "Trainers can update team session templates" on public.trainer_session_templates;
drop policy if exists "Trainers can delete team session templates" on public.trainer_session_templates;

create policy "Trainers can view team session templates"
  on public.trainer_session_templates for select
  to authenticated
  using (public.is_entrenador());

create policy "Trainers can create team session templates"
  on public.trainer_session_templates for insert
  to authenticated
  with check (public.is_entrenador());

create policy "Trainers can update team session templates"
  on public.trainer_session_templates for update
  to authenticated
  using (public.is_entrenador())
  with check (public.is_entrenador());

create policy "Trainers can delete team session templates"
  on public.trainer_session_templates for delete
  to authenticated
  using (public.is_entrenador());

-- El nombre solo era único dentro del tablero de cada entrenador. Compartido, dos
-- entrenadores pueden tener plantillas homónimas, así que la unicidad pasa a ser global.
drop index if exists public.trainer_session_templates_unique_name_idx;

do $$
declare
  duplicated integer;
begin
  select count(*) into duplicated
  from (
    select lower(trim(name))
    from public.trainer_session_templates
    group by lower(trim(name))
    having count(*) > 1
  ) d;

  if duplicated > 0 then
    raise notice 'Hay % nombres de plantilla repetidos entre entrenadores: se deja la unicidad sin aplicar', duplicated;
  else
    create unique index if not exists trainer_session_templates_unique_name_idx
      on public.trainer_session_templates (lower(trim(name)));
  end if;
end $$;

-- Feedback al atleta
drop policy if exists "Trainers can view own feedback" on public.trainer_athlete_feedback;
drop policy if exists "Trainers can create own feedback" on public.trainer_athlete_feedback;
drop policy if exists "Trainers can update own feedback" on public.trainer_athlete_feedback;
drop policy if exists "Trainers can delete own feedback" on public.trainer_athlete_feedback;
drop policy if exists "Trainers can view team feedback" on public.trainer_athlete_feedback;
drop policy if exists "Trainers can create team feedback" on public.trainer_athlete_feedback;
drop policy if exists "Trainers can update team feedback" on public.trainer_athlete_feedback;
drop policy if exists "Trainers can delete team feedback" on public.trainer_athlete_feedback;

create policy "Trainers can view team feedback"
  on public.trainer_athlete_feedback for select
  to authenticated
  using (public.is_entrenador());

create policy "Trainers can create team feedback"
  on public.trainer_athlete_feedback for insert
  to authenticated
  with check (public.is_entrenador());

create policy "Trainers can update team feedback"
  on public.trainer_athlete_feedback for update
  to authenticated
  using (public.is_entrenador())
  with check (public.is_entrenador());

create policy "Trainers can delete team feedback"
  on public.trainer_athlete_feedback for delete
  to authenticated
  using (public.is_entrenador());

-- Adjuntos del feedback
drop policy if exists "Trainers can view own feedback media" on public.trainer_feedback_media;
drop policy if exists "Trainers can create own feedback media" on public.trainer_feedback_media;
drop policy if exists "Trainers can delete own feedback media" on public.trainer_feedback_media;
drop policy if exists "Trainers can view team feedback media" on public.trainer_feedback_media;
drop policy if exists "Trainers can create team feedback media" on public.trainer_feedback_media;
drop policy if exists "Trainers can update team feedback media" on public.trainer_feedback_media;
drop policy if exists "Trainers can delete team feedback media" on public.trainer_feedback_media;

create policy "Trainers can view team feedback media"
  on public.trainer_feedback_media for select
  to authenticated
  using (public.is_entrenador());

create policy "Trainers can create team feedback media"
  on public.trainer_feedback_media for insert
  to authenticated
  with check (
    public.is_entrenador()
    and exists (
      select 1
      from public.trainer_athlete_feedback f
      where f.id = feedback_id
        and f.athlete_id = trainer_feedback_media.athlete_id
    )
  );

create policy "Trainers can update team feedback media"
  on public.trainer_feedback_media for update
  to authenticated
  using (public.is_entrenador())
  with check (public.is_entrenador());

create policy "Trainers can delete team feedback media"
  on public.trainer_feedback_media for delete
  to authenticated
  using (public.is_entrenador());

-- Programaciones de atleta: ver ya estaba abierto, ahora también editar y borrar.
drop policy if exists "Trainers can update own athlete plans" on public.athlete_plans;
drop policy if exists "Trainers can delete own athlete plans" on public.athlete_plans;
drop policy if exists "Trainers can update team athlete plans" on public.athlete_plans;
drop policy if exists "Trainers can delete team athlete plans" on public.athlete_plans;

create policy "Trainers can update team athlete plans"
  on public.athlete_plans for update
  to authenticated
  using (public.is_entrenador())
  with check (public.is_entrenador());

create policy "Trainers can delete team athlete plans"
  on public.athlete_plans for delete
  to authenticated
  using (public.is_entrenador());

-- ---------------------------------------------------------------------------
-- 4. El tablero es común, así que "mi lead" pasa a ser "lead del equipo"
-- ---------------------------------------------------------------------------

-- Para firmar cada nota y cada feedback hay que poder leer el nombre del compañero.
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
        and r.slug = 'entrenador'
    )
  );

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
    where l.athlete_id = target_id
  );
$$;

grant execute on function public.is_own_crm_lead(uuid) to authenticated;

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
    raise exception 'Ese usuario no está en el tablero';
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
