-- Visibilidad de la biblioteca de ejercicios para los atletas de cada entrenador.

alter table public.trainer_professional_profile
  add column if not exists athletes_can_see_page_library boolean not null default true;

create or replace function public.get_my_exercise_library_access()
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  owner_id uuid;
  page_visible boolean;
begin
  if public.is_entrenador() or public.is_administrador() then
    select coalesce(p.athletes_can_see_page_library, true)
    into page_visible
    from public.trainer_professional_profile p
    where p.user_id = auth.uid();

    return jsonb_build_object(
      'trainer_id', auth.uid(),
      'athletes_can_see_page_library', coalesce(page_visible, true)
    );
  end if;

  select coalesce(l.assigned_trainer_id, l.trainer_id)
  into owner_id
  from public.trainer_crm_leads l
  where l.athlete_id = auth.uid()
    and l.archived_at is null
  limit 1;

  if owner_id is null then
    return jsonb_build_object(
      'trainer_id', null,
      'athletes_can_see_page_library', true
    );
  end if;

  select coalesce(p.athletes_can_see_page_library, true)
  into page_visible
  from public.trainer_professional_profile p
  where p.user_id = owner_id;

  return jsonb_build_object(
    'trainer_id', owner_id,
    'athletes_can_see_page_library', coalesce(page_visible, true)
  );
end;
$$;

revoke all on function public.get_my_exercise_library_access() from public;
grant execute on function public.get_my_exercise_library_access() to authenticated;
