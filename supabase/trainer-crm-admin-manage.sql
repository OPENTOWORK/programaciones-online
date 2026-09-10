-- El administrador puede gestionar cualquier atleta (ficha, chat, planes).
-- El entrenador sigue limitado a los que tiene asignados.

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
