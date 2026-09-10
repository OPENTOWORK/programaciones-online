-- Integración Wellhub: origen del miembro y webhook de altas.

alter table public.gym_members
  add column if not exists signup_source text not null default 'manual'
    check (signup_source in ('manual', 'wellhub', 'import'));

alter table public.gym_members
  add column if not exists wellhub_user_id text;

alter table public.gym_members
  add column if not exists wellhub_synced_at timestamptz;

create unique index if not exists gym_members_wellhub_user_idx
  on public.gym_members (gym_id, wellhub_user_id)
  where wellhub_user_id is not null;

create index if not exists gym_members_signup_source_idx
  on public.gym_members (gym_id, signup_source);

alter table public.gyms
  add column if not exists wellhub_webhook_secret text;

create or replace function public.rotate_wellhub_webhook_secret(target_gym uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  next_secret text;
begin
  if not public.can_manage_gym(target_gym) then
    raise exception 'FORBIDDEN';
  end if;

  next_secret := encode(gen_random_bytes(24), 'hex');

  update public.gyms
  set wellhub_webhook_secret = next_secret,
      updated_at = now()
  where id = target_gym;

  return next_secret;
end;
$$;

grant execute on function public.rotate_wellhub_webhook_secret(uuid) to authenticated;

create or replace function public.get_wellhub_webhook_config(target_gym uuid)
returns table (webhook_secret text)
language sql
stable
security definer
set search_path = public
as $$
  select g.wellhub_webhook_secret
  from public.gyms g
  where g.id = target_gym
    and public.can_manage_gym(target_gym);
$$;

grant execute on function public.get_wellhub_webhook_config(uuid) to authenticated;

create or replace function public.upsert_wellhub_gym_member(
  target_gym uuid,
  webhook_secret text,
  wellhub_user text,
  first_name text,
  last_name text default '',
  member_email text default null,
  member_phone text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  stored_secret text;
  member_id uuid;
  wellhub_plan_id uuid;
begin
  if wellhub_user is null or trim(wellhub_user) = '' then
    raise exception 'WELLHUB_USER_REQUIRED';
  end if;

  select g.wellhub_webhook_secret
  into stored_secret
  from public.gyms g
  where g.id = target_gym;

  if stored_secret is null or stored_secret <> webhook_secret then
    raise exception 'INVALID_WEBHOOK_SECRET';
  end if;

  select gm.id
  into member_id
  from public.gym_members gm
  where gm.gym_id = target_gym
    and gm.wellhub_user_id = trim(wellhub_user)
  limit 1;

  if member_id is null and member_email is not null and trim(member_email) <> '' then
    select gm.id
    into member_id
    from public.gym_members gm
    where gm.gym_id = target_gym
      and lower(trim(gm.email)) = lower(trim(member_email))
    order by gm.created_at desc
    limit 1;
  end if;

  if member_id is null then
    insert into public.gym_members (
      gym_id,
      first_name,
      last_name,
      email,
      phone,
      status,
      pipeline_stage,
      signup_source,
      wellhub_user_id,
      wellhub_synced_at
    )
    values (
      target_gym,
      coalesce(nullif(trim(first_name), ''), 'Wellhub'),
      coalesce(trim(last_name), ''),
      nullif(trim(member_email), ''),
      nullif(trim(member_phone), ''),
      'active',
      'activo',
      'wellhub',
      trim(wellhub_user),
      now()
    )
    returning id into member_id;
  else
    update public.gym_members
    set
      first_name = coalesce(nullif(trim(first_name), ''), first_name),
      last_name = coalesce(trim(last_name), last_name),
      email = coalesce(nullif(trim(member_email), ''), email),
      phone = coalesce(nullif(trim(member_phone), ''), phone),
      signup_source = 'wellhub',
      wellhub_user_id = trim(wellhub_user),
      wellhub_synced_at = now(),
      status = case when status = 'lead' then 'active' else status end,
      pipeline_stage = case when pipeline_stage = 'potencial' then 'activo' else pipeline_stage end,
      updated_at = now()
    where id = member_id;
  end if;

  select p.id
  into wellhub_plan_id
  from public.gym_membership_plans p
  where p.gym_id = target_gym
    and p.active = true
    and p.name ilike '%wellhub%'
  order by p.created_at asc
  limit 1;

  if wellhub_plan_id is not null and not exists (
    select 1
    from public.gym_member_memberships mm
    where mm.member_id = member_id
      and mm.plan_id = wellhub_plan_id
      and mm.status = 'active'
  ) then
    insert into public.gym_member_memberships (
      gym_id,
      member_id,
      plan_id,
      starts_at,
      status
    )
    values (
      target_gym,
      member_id,
      wellhub_plan_id,
      current_date,
      'active'
    );
  end if;

  return member_id;
end;
$$;

grant execute on function public.upsert_wellhub_gym_member(uuid, text, text, text, text, text, text) to service_role;
