-- Compras integradas: Google Play Billing (Android) y App Store / StoreKit 2 (iOS).
--
-- Una compra pertenece a la cuenta de Training ProgLine, no al dispositivo: lo
-- comprado en Android sirve en iOS y en la web con la misma cuenta.
--
-- Solo el backend (Edge Functions con service role) escribe compras y derechos,
-- después de verificarlos con Google o Apple. La app nunca concede acceso.
--
-- No es destructiva y se puede aplicar varias veces. Sin filas en
-- `store_products` (o con `active = false`) la app se comporta exactamente
-- igual que antes: es también el interruptor para apagar las ventas.
--
-- Activación controlada: un producto con `active = false` solo lo ven los
-- administradores y las cuentas de `store_testers`, que pueden comprarlo en
-- Sandbox / pruebas de licencia. `npm run iap:activate` lo pone a la venta
-- solo si las comprobaciones de extremo a extremo han pasado.
--
-- Aplicar con `npm run supabase:store-purchases`.

-- 1. Catálogo de productos de tienda -----------------------------------------

create table if not exists public.store_products (
  id uuid primary key default gen_random_uuid(),
  product_key text not null unique check (product_key ~ '^[a-z0-9][a-z0-9._-]{2,63}$'),
  title text not null,
  description text not null default '',
  benefits text[] not null default '{}',
  product_type text not null check (product_type in ('non_consumable', 'subscription')),
  -- Id del producto en Play Console y, en suscripciones, el plan base (mensual, anual...).
  google_product_id text,
  google_base_plan_id text,
  -- Product ID de App Store Connect.
  apple_product_id text unique,
  sort_order integer not null default 0,
  active boolean not null default false,
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint store_products_store_id_required
    check (google_product_id is not null or apple_product_id is not null),
  constraint store_products_base_plan_only_subscriptions
    check (google_base_plan_id is null or product_type = 'subscription')
);

alter table public.store_products add column if not exists activated_at timestamptz;

create unique index if not exists store_products_google_plan_key
  on public.store_products (google_product_id, coalesce(google_base_plan_id, ''))
  where google_product_id is not null;

comment on table public.store_products is
  'Productos digitales vendidos con Google Play Billing / App Store. El precio lo da siempre la tienda.';
comment on column public.store_products.active is
  'true: a la venta para todos. false: solo lo ven administradores y store_testers (pruebas).';

-- Cuentas que ven y pueden comprar los productos que aún no están a la venta.
create table if not exists public.store_testers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  note text,
  created_at timestamptz not null default now()
);

-- Programaciones que desbloquea cada producto (una suscripción puede abrir varias).
create table if not exists public.store_product_programs (
  store_product_id uuid not null references public.store_products(id) on delete cascade,
  program_id uuid not null references public.programas(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (store_product_id, program_id)
);

create index if not exists store_product_programs_program_idx
  on public.store_product_programs (program_id);

-- 2. Compras verificadas -------------------------------------------------------

create table if not exists public.store_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  store_product_id uuid references public.store_products(id) on delete set null,
  platform text not null check (platform in ('android', 'ios', 'web')),
  store text not null check (store in ('google_play', 'app_store', 'stripe')),
  product_id text not null,
  -- Google: purchaseToken. Apple: originalTransactionId. Nunca sale hacia la app.
  purchase_key text not null,
  transaction_id text,
  original_transaction_id text,
  linked_purchase_token text,
  status text not null check (
    status in ('pending', 'active', 'grace_period', 'on_hold', 'paused', 'expired', 'cancelled', 'refunded', 'revoked')
  ),
  auto_renew boolean,
  environment text not null default 'production' check (environment in ('production', 'sandbox')),
  purchased_at timestamptz,
  expires_at timestamptz,
  cancelled_at timestamptz,
  refunded_at timestamptz,
  acknowledged boolean not null default false,
  last_verified_at timestamptz,
  last_event text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Una compra solo puede pertenecer a una cuenta (evita reutilizar tokens).
  constraint store_purchases_purchase_key unique (store, purchase_key)
);

create index if not exists store_purchases_user_idx on public.store_purchases (user_id);
create index if not exists store_purchases_original_transaction_idx
  on public.store_purchases (store, original_transaction_id);

-- 3. Derechos de acceso (independientes de la plataforma) ------------------

create table if not exists public.user_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  store_product_id uuid references public.store_products(id) on delete restrict,
  program_id uuid references public.programas(id) on delete cascade,
  source text not null check (source in ('google_play', 'app_store', 'stripe', 'manual')),
  store_purchase_id uuid unique references public.store_purchases(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'pending', 'expired', 'refunded', 'revoked')),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_entitlements_target_required check (store_product_id is not null or program_id is not null)
);

create index if not exists user_entitlements_user_idx on public.user_entitlements (user_id, status);

-- 4. Registro de notificaciones de las tiendas (idempotencia de webhooks) -----

create table if not exists public.store_notifications (
  id uuid primary key default gen_random_uuid(),
  store text not null check (store in ('google_play', 'app_store')),
  notification_id text not null,
  notification_type text not null,
  subtype text,
  environment text,
  purchase_key text,
  status text not null default 'received' check (status in ('received', 'processed', 'ignored', 'failed')),
  error text,
  payload jsonb,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  constraint store_notifications_unique unique (store, notification_id)
);

-- 5. updated_at ---------------------------------------------------------------

create or replace function public.store_touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists store_products_touch on public.store_products;
create trigger store_products_touch before update on public.store_products
  for each row execute function public.store_touch_updated_at();

drop trigger if exists store_purchases_touch on public.store_purchases;
create trigger store_purchases_touch before update on public.store_purchases
  for each row execute function public.store_touch_updated_at();

drop trigger if exists user_entitlements_touch on public.user_entitlements;
create trigger user_entitlements_touch before update on public.user_entitlements
  for each row execute function public.store_touch_updated_at();

-- 6. Funciones de acceso ------------------------------------------------------

create or replace function public.is_store_tester()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.store_testers t where t.user_id = auth.uid());
$$;

create or replace function public.program_requires_purchase(target_program uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.store_product_programs spp
    join public.store_products sp on sp.id = spp.store_product_id
    where spp.program_id = target_program
      and sp.active
  );
$$;

-- Interna: recibe un usuario, así que no se expone a la app.
create or replace function public.user_has_program_entitlement(target_user uuid, target_program uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_entitlements ue
    where ue.user_id = target_user
      and ue.status = 'active'
      and (ue.expires_at is null or ue.expires_at > now())
      and (
        ue.program_id = target_program
        or exists (
          select 1
          from public.store_product_programs spp
          where spp.store_product_id = ue.store_product_id
            and spp.program_id = target_program
        )
      )
  );
$$;

-- Programaciones a las que da acceso lo comprado por el usuario actual.
-- Incluye productos ya retirados de la venta: quien compró conserva el acceso.
create or replace function public.my_program_entitlements()
returns table (
  program_id uuid,
  store_product_id uuid,
  product_key text,
  source text,
  expires_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(ue.program_id, spp.program_id) as program_id,
    ue.store_product_id,
    sp.product_key,
    ue.source,
    ue.expires_at
  from public.user_entitlements ue
  left join public.store_products sp on sp.id = ue.store_product_id
  left join public.store_product_programs spp
    on ue.program_id is null and spp.store_product_id = ue.store_product_id
  where ue.user_id = auth.uid()
    and ue.status = 'active'
    and (ue.expires_at is null or ue.expires_at > now())
    and coalesce(ue.program_id, spp.program_id) is not null;
$$;

-- Historial de compras del usuario actual, sin tokens ni identificadores de la tienda.
create or replace function public.my_store_purchases()
returns table (
  id uuid,
  product_key text,
  title text,
  product_type text,
  platform text,
  store text,
  product_id text,
  status text,
  auto_renew boolean,
  environment text,
  purchased_at timestamptz,
  expires_at timestamptz,
  cancelled_at timestamptz,
  refunded_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    sp.product_key,
    sp.title,
    sp.product_type,
    p.platform,
    p.store,
    p.product_id,
    p.status,
    p.auto_renew,
    p.environment,
    p.purchased_at,
    p.expires_at,
    p.cancelled_at,
    p.refunded_at
  from public.store_purchases p
  left join public.store_products sp on sp.id = p.store_product_id
  where p.user_id = auth.uid()
  order by p.purchased_at desc nulls last;
$$;

-- 7. Activar una programación de pago exige haberla comprado --------------------
-- Solo actúa cuando el propio usuario se activa una programación vinculada a un
-- producto activo. Administradores, entrenadores (asignan a sus atletas) y el
-- service role no se ven afectados.

create or replace function public.guard_paid_program_activation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_uid uuid := auth.uid();
begin
  if new.status is distinct from 'activa' then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.status = 'activa' and old.program_id = new.program_id then
    return new;
  end if;
  if current_uid is null or current_uid <> new.user_id then
    return new;
  end if;
  if not public.program_requires_purchase(new.program_id) then
    return new;
  end if;
  if public.is_administrador() then
    return new;
  end if;
  if public.user_has_program_entitlement(new.user_id, new.program_id) then
    return new;
  end if;

  raise exception 'PURCHASE_REQUIRED'
    using errcode = 'P0001', hint = 'Esta programación requiere una compra verificada.';
end;
$$;

drop trigger if exists user_programs_paid_guard on public.user_programs;
create trigger user_programs_paid_guard
  before insert or update of status, program_id on public.user_programs
  for each row execute function public.guard_paid_program_activation();

-- 8. Seguridad ----------------------------------------------------------------

alter table public.store_products enable row level security;
alter table public.store_product_programs enable row level security;
alter table public.store_purchases enable row level security;
alter table public.user_entitlements enable row level security;
alter table public.store_notifications enable row level security;
alter table public.store_testers enable row level security;

drop policy if exists "Store products are visible when on sale" on public.store_products;
create policy "Store products are visible when on sale"
  on public.store_products for select
  to authenticated
  using (active or public.is_administrador() or public.is_store_tester());

drop policy if exists "Store product programs are visible when on sale" on public.store_product_programs;
create policy "Store product programs are visible when on sale"
  on public.store_product_programs for select
  to authenticated
  using (
    public.is_administrador()
    or public.is_store_tester()
    or exists (
      select 1 from public.store_products sp
      where sp.id = store_product_id and sp.active
    )
  );

-- Compras, derechos, notificaciones y testers: solo el backend. La app usa las funciones de arriba.
revoke all on public.store_purchases from anon, authenticated;
revoke all on public.user_entitlements from anon, authenticated;
revoke all on public.store_notifications from anon, authenticated;
revoke all on public.store_testers from anon, authenticated;
revoke insert, update, delete, truncate on public.store_products from anon, authenticated;
revoke insert, update, delete, truncate on public.store_product_programs from anon, authenticated;
revoke all on public.store_products from anon;
revoke all on public.store_product_programs from anon;

revoke execute on function public.user_has_program_entitlement(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.is_store_tester() from public, anon;
grant execute on function public.is_store_tester() to authenticated;
revoke execute on function public.program_requires_purchase(uuid) from public, anon;
revoke execute on function public.my_program_entitlements() from public, anon;
revoke execute on function public.my_store_purchases() from public, anon;
grant execute on function public.program_requires_purchase(uuid) to authenticated;
grant execute on function public.my_program_entitlements() to authenticated;
grant execute on function public.my_store_purchases() to authenticated;
