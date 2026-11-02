-- Permite a los atletas saber si su ficha está cedida a otro entrenador

-- (ficha del administrador con assigned_trainer_id de un entrenador).



create or replace function public.athlete_is_ceded_to_other_trainer(p_athlete_id uuid default auth.uid())

returns boolean

language sql

security definer

set search_path = public

stable

as $$

  select exists (

    select 1

    from public.trainer_crm_leads l

    join public."Perfil" record_owner

      on record_owner.id = l.trainer_id

    join public.roles record_role

      on record_role.id = record_owner.id_roles

    join public."Perfil" assigned_owner

      on assigned_owner.id = l.assigned_trainer_id

    join public.roles assigned_role

      on assigned_role.id = assigned_owner.id_roles

    where l.athlete_id = p_athlete_id

      and l.archived_at is null

      and l.assigned_trainer_id is not null

      and l.assigned_trainer_id is distinct from l.trainer_id

      and record_role.slug = 'administrador'

      and assigned_role.slug = 'entrenador'

      and (

        p_athlete_id = auth.uid()

        or public.is_entrenador()

      )

  );

$$;



revoke all on function public.athlete_is_ceded_to_other_trainer(uuid) from public;

grant execute on function public.athlete_is_ceded_to_other_trainer(uuid) to authenticated;


