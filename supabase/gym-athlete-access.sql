-- Acceso de atletas a sus gimnasios: lectura del CRM, reservas y vinculación de cuenta.

/** El atleta tiene ficha de miembro activa en el gimnasio. */
create or replace function public.is_linked_gym_athlete(target_gym uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.gym_members gm
    where gm.gym_id = target_gym
      and gm.user_id = auth.uid()
      and gm.status in ('active', 'inactive')
  );
$$;

grant execute on function public.is_linked_gym_athlete(uuid) to authenticated;

/** Ficha de miembro del usuario actual en un gimnasio. */
create or replace function public.gym_athlete_member_id(target_gym uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select gm.id
  from public.gym_members gm
  where gm.gym_id = target_gym
    and gm.user_id = auth.uid()
    and gm.status in ('active', 'inactive')
  order by gm.created_at desc
  limit 1;
$$;

grant execute on function public.gym_athlete_member_id(uuid) to authenticated;

/** Comparte gimnasio con otro usuario de la app (misma ficha CRM). */
create or replace function public.shares_gym_with(target_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.gym_members self_member
    join public.gym_members teammate
      on teammate.gym_id = self_member.gym_id
    where self_member.user_id = auth.uid()
      and teammate.user_id = target_user
      and self_member.status in ('active', 'inactive')
      and teammate.status in ('active', 'inactive')
  );
$$;

grant execute on function public.shares_gym_with(uuid) to authenticated;

-- Lectura de la propia ficha de miembro.
drop policy if exists "Athletes read own gym member profile" on public.gym_members;
create policy "Athletes read own gym member profile"
  on public.gym_members for select
  to authenticated
  using (user_id = auth.uid());

-- Compañeros del mismo gimnasio (para ver quién va a cada clase).
drop policy if exists "Athletes read gym teammates" on public.gym_members;
create policy "Athletes read gym teammates"
  on public.gym_members for select
  to authenticated
  using (public.is_linked_gym_athlete(gym_id));

-- Gimnasios vinculados al atleta.
drop policy if exists "Athletes read linked gyms" on public.gyms;
create policy "Athletes read linked gyms"
  on public.gyms for select
  to authenticated
  using (public.is_linked_gym_athlete(id));

-- Horario y tipos de clase visibles para atletas vinculados.
drop policy if exists "Athletes read gym classes" on public.gym_classes;
create policy "Athletes read gym classes"
  on public.gym_classes for select
  to authenticated
  using (public.is_linked_gym_athlete(gym_id));

drop policy if exists "Athletes read gym class types" on public.gym_class_types;
create policy "Athletes read gym class types"
  on public.gym_class_types for select
  to authenticated
  using (public.is_linked_gym_athlete(gym_id));

-- Tarifas publicadas del gimnasio.
drop policy if exists "Athletes read gym membership plans" on public.gym_membership_plans;
create policy "Athletes read gym membership plans"
  on public.gym_membership_plans for select
  to authenticated
  using (public.is_linked_gym_athlete(gym_id) and active = true);

-- Productos de la tienda del gimnasio.
drop policy if exists "Athletes read gym shop products" on public.gym_products;
create policy "Athletes read gym shop products"
  on public.gym_products for select
  to authenticated
  using (public.is_linked_gym_athlete(gym_id) and active = true);

-- Membresía propia del atleta.
drop policy if exists "Athletes read own memberships" on public.gym_member_memberships;
create policy "Athletes read own memberships"
  on public.gym_member_memberships for select
  to authenticated
  using (
    member_id in (
      select gm.id
      from public.gym_members gm
      where gm.user_id = auth.uid()
    )
  );

-- Reservas propias: crear, ver y cancelar.
drop policy if exists "Athletes manage own bookings" on public.gym_bookings;
create policy "Athletes manage own bookings"
  on public.gym_bookings for all
  to authenticated
  using (
    member_id in (
      select gm.id
      from public.gym_members gm
      where gm.user_id = auth.uid()
        and gm.gym_id = gym_bookings.gym_id
    )
  )
  with check (
    member_id in (
      select gm.id
      from public.gym_members gm
      where gm.user_id = auth.uid()
        and gm.gym_id = gym_bookings.gym_id
        and gm.status = 'active'
    )
  );

-- Ver quién está apuntado en cada clase del gimnasio.
drop policy if exists "Athletes read gym class rosters" on public.gym_bookings;
create policy "Athletes read gym class rosters"
  on public.gym_bookings for select
  to authenticated
  using (
    public.is_linked_gym_athlete(gym_id)
    and status in ('confirmed', 'waiting', 'attended')
  );

/**
 * Vincula la ficha de un miembro del gimnasio con la cuenta de la app (por email).
 * Lo usa el CRM al dar de alta o editar un miembro.
 */
create or replace function public.link_gym_member_account(
  target_gym uuid,
  target_member uuid,
  target_email text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
  v_email text;
  v_member_gym uuid;
begin
  if not public.can_operate_gym(target_gym) then
    raise exception 'No tienes permiso para vincular miembros en este gimnasio';
  end if;

  select gm.gym_id, coalesce(nullif(trim(target_email), ''), gm.email)
    into v_member_gym, v_email
  from public.gym_members gm
  where gm.id = target_member
  limit 1;

  if v_member_gym is null or v_member_gym <> target_gym then
    raise exception 'Este miembro no pertenece al gimnasio';
  end if;

  if v_email is null or char_length(v_email) = 0 then
    raise exception 'El email es obligatorio para vincular la cuenta';
  end if;

  select p.id
    into v_user
  from public."Perfil" p
  where lower(p.email) = lower(trim(v_email))
  limit 1;

  if v_user is null then
    raise exception 'USER_NOT_FOUND';
  end if;

  update public.gym_members
  set
    user_id = v_user,
    email = lower(trim(v_email)),
    updated_at = now()
  where id = target_member
    and gym_id = target_gym;

  begin
    insert into public.gym_admin_activity (gym_id, actor_user_id, action, detail)
    values (target_gym, auth.uid(), 'member_linked', lower(trim(v_email)));
  exception
    when others then
      null;
  end;

  return v_user;
end;
$$;

grant execute on function public.link_gym_member_account(uuid, uuid, text) to authenticated;

-- Foto "antes" de compañeros del gimnasio (avatar en reservas).
drop policy if exists "Gym members can view teammate antes photos" on public.fotos;
create policy "Gym members can view teammate antes photos"
  on public.fotos for select
  to authenticated
  using (tipo = 'antes' and public.shares_gym_with(user_id));

drop policy if exists "Gym members can view teammate photos in storage" on storage.objects;
create policy "Gym members can view teammate photos in storage"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'fotos'
    and public.shares_gym_with(((storage.foldername(name))[1])::uuid)
  );

-- Catálogo de la tienda del gimnasio para atletas vinculados.
drop policy if exists "Athletes read gym shop products" on public.gym_products;
create policy "Athletes read gym shop products"
  on public.gym_products for select
  to authenticated
  using (public.is_linked_gym_athlete(gym_id) and active = true);
