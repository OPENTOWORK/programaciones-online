-- Mensaje de bienvenida de Carlos al registrarse un atleta

create or replace function public.build_signup_welcome_message(athlete_name text)
returns text
language sql
immutable
as $$
  select format(
    '¡Hola, %s! Te doy la bienvenida a Training Progline 😊 Soy Carlos, tu entrenador. Para empezar, cuéntame cuál es tu objetivo principal: mejorar tu salud, perder grasa, ganar fuerza o masa muscular, preparar alguna prueba o simplemente sentirte mejor. También puedes indicarme si tienes alguna lesión, limitación o preferencia que deba tener en cuenta.',
    coalesce(nullif(trim(athlete_name), ''), 'Usuario')
  );
$$;

create or replace function public.send_signup_welcome_message(
  target_user_id uuid,
  athlete_name text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  display_name text;
  welcome_text text;
begin
  if to_regclass('public.trainer_messages') is null then
    return;
  end if;

  if auth.uid() is not null and auth.uid() <> target_user_id then
    raise exception 'not allowed';
  end if;

  if exists (
    select 1
    from public.trainer_messages tm
    where tm.user_id = target_user_id
      and tm.sender = 'trainer'
  ) then
    return;
  end if;

  select coalesce(nullif(trim(athlete_name), ''), p.name, 'Usuario')
  into display_name
  from public."Perfil" p
  where p.id = target_user_id;

  if display_name is null then
    display_name := coalesce(nullif(trim(athlete_name), ''), 'Usuario');
  end if;

  welcome_text := public.build_signup_welcome_message(display_name);

  insert into public.trainer_messages (user_id, sender, text)
  values (target_user_id, 'trainer', welcome_text);
end;
$$;

grant execute on function public.send_signup_welcome_message(uuid, text) to authenticated;

-- Extiende el trigger de registro para enviar el mensaje de bienvenida
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  atleta_role_id uuid;
  athlete_name text;
begin
  select id
  into atleta_role_id
  from public.roles
  where slug = 'atleta'
  limit 1;

  athlete_name := coalesce(new.raw_user_meta_data->>'name', 'Usuario');

  insert into public."Perfil" (id, name, email, id_roles)
  values (
    new.id,
    athlete_name,
    new.email,
    atleta_role_id
  )
  on conflict (id) do update
  set
    name = excluded.name,
    email = excluded.email,
    id_roles = coalesce(public."Perfil".id_roles, excluded.id_roles);

  -- El mensaje de bienvenida nunca debe impedir que se complete un registro.
  begin
    perform public.send_signup_welcome_message(new.id, athlete_name);
  exception
    when others then
      raise warning 'send_signup_welcome_message failed for %: %', new.id, sqlerrm;
  end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
