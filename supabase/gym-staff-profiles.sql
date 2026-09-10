-- Los compañeros de un gimnasio pueden ver nombre y email del equipo.

drop policy if exists "Gym staff can view teammate profiles" on public."Perfil";
create policy "Gym staff can view teammate profiles"
  on public."Perfil" for select
  to authenticated
  using (
    exists (
      select 1
      from public.gym_users teammate
      where teammate.user_id = "Perfil".id
        and public.has_gym_access(teammate.gym_id)
    )
  );

create or replace function public.attach_gym_coach(
  target_gym uuid,
  target_email text,
  target_name text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
  v_slug text;
begin
  if not public.can_manage_gym(target_gym) then
    raise exception 'Solo el propietario o un gerente pueden invitar entrenadores';
  end if;

  if target_email is null or char_length(trim(target_email)) = 0 then
    raise exception 'El email es obligatorio';
  end if;

  select p.id, r.slug
    into v_user, v_slug
  from public."Perfil" p
  left join public.roles r on r.id = p.id_roles
  where lower(p.email) = lower(trim(target_email))
  limit 1;

  if v_user is null then
    raise exception 'USER_NOT_FOUND';
  end if;

  if v_slug in ('entrenador', 'administrador') then
    raise exception 'Esta cuenta ya pertenece al equipo de Training ProgLine. Contacta con nosotros para darle acceso al gimnasio.';
  end if;

  if exists (
    select 1
    from public.gym_users gu
    where gu.gym_id = target_gym
      and gu.user_id = v_user
  ) then
    raise exception 'Esta persona ya está en el equipo del gimnasio.';
  end if;

  update public."Perfil"
  set
    id_roles = (select r.id from public.roles r where r.slug = 'gimnasio' limit 1),
    name = coalesce(nullif(trim(target_name), ''), name)
  where id = v_user;

  insert into public.gym_users (gym_id, user_id, role)
  values (target_gym, v_user, 'coach');

  begin
    insert into public.gym_admin_activity (gym_id, actor_user_id, action, detail)
    values (target_gym, auth.uid(), 'coach_invited', lower(trim(target_email)));
  exception
    when others then
      null;
  end;

  return v_user;
end;
$$;

grant execute on function public.attach_gym_coach(uuid, text, text) to authenticated;
