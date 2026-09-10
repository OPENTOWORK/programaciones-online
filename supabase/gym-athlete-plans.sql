-- Planes personalizados/nutricionales gestionados por el CRM del gimnasio
-- para miembros con cuenta vinculada (gym_members.user_id).

create or replace function public.can_gym_manage_athlete(target_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.gym_members gm
    where gm.user_id = target_id
      and gm.user_id is not null
      and gm.status in ('active', 'inactive')
      and public.can_operate_gym(gm.gym_id)
  );
$$;

grant execute on function public.can_gym_manage_athlete(uuid) to authenticated;

create or replace function public.can_manage_athlete(target_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_administrador()
    or public.is_assigned_athlete(target_id)
    or public.can_gym_manage_athlete(target_id);
$$;

grant execute on function public.can_manage_athlete(uuid) to authenticated;
