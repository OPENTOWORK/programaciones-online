-- Compra de tarifas por atletas desde la app (portal del gimnasio).

create or replace function public.membership_plan_ends_at(
  billing_period text,
  starts_at date
)
returns date
language sql
immutable
as $$
  select case billing_period
    when 'monthly' then (starts_at + interval '1 month')::date
    when 'quarterly' then (starts_at + interval '3 months')::date
    when 'annual' then (starts_at + interval '1 year')::date
    else null
  end;
$$;

/**
 * Contrata una tarifa del gimnasio para el atleta autenticado.
 * Registra la membresía activa y, si existe el panel financiero, el ingreso.
 */
create or replace function public.purchase_gym_membership_plan(
  target_gym uuid,
  target_plan uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member_id uuid;
  v_plan record;
  v_membership_id uuid;
  v_starts_at date := current_date;
  v_ends_at date;
  v_member_name text;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  v_member_id := public.gym_athlete_member_id(target_gym);
  if v_member_id is null then
    raise exception 'NOT_LINKED';
  end if;

  select
    p.id,
    p.gym_id,
    p.name,
    p.price,
    p.billing_period,
    p.active
  into v_plan
  from public.gym_membership_plans p
  where p.id = target_plan
    and p.gym_id = target_gym
  limit 1;

  if v_plan.id is null then
    raise exception 'PLAN_NOT_FOUND';
  end if;

  if not v_plan.active then
    raise exception 'PLAN_INACTIVE';
  end if;

  if v_plan.price is null or v_plan.price <= 0 then
    raise exception 'PLAN_NOT_PURCHASABLE';
  end if;

  v_ends_at := public.membership_plan_ends_at(v_plan.billing_period, v_starts_at);

  update public.gym_member_memberships
  set
    status = 'cancelled',
    updated_at = now()
  where gym_id = target_gym
    and member_id = v_member_id
    and status = 'active';

  insert into public.gym_member_memberships (
    gym_id,
    member_id,
    plan_id,
    starts_at,
    ends_at,
    status
  )
  values (
    target_gym,
    v_member_id,
    target_plan,
    v_starts_at,
    v_ends_at,
    'active'
  )
  returning id into v_membership_id;

  update public.gym_members
  set
    status = 'active',
    pipeline_stage = 'activo',
    updated_at = now()
  where id = v_member_id
    and gym_id = target_gym;

  select trim(coalesce(gm.first_name, '') || ' ' || coalesce(gm.last_name, ''))
    into v_member_name
  from public.gym_members gm
  where gm.id = v_member_id;

  begin
    insert into public.gym_finance_entries (
      gym_id,
      kind,
      category,
      amount,
      entry_date,
      concept,
      counterparty,
      created_by
    )
    values (
      target_gym,
      'income',
      'memberships',
      v_plan.price,
      v_starts_at,
      'Cuota · ' || v_plan.name,
      coalesce(nullif(v_member_name, ''), 'Atleta app'),
      auth.uid()
    );
  exception
    when undefined_table then
      null;
    when others then
      null;
  end;

  begin
    insert into public.gym_admin_activity (gym_id, actor_user_id, action, detail)
    values (
      target_gym,
      auth.uid(),
      'membership_purchased',
      v_plan.name || ' · ' || v_plan.price::text
    );
  exception
    when others then
      null;
  end;

  return v_membership_id;
end;
$$;

grant execute on function public.purchase_gym_membership_plan(uuid, uuid) to authenticated;

notify pgrst, 'reload schema';
