-- Tienda del gimnasio: catálogo, precios, stock y movimientos (ventas/entradas).

create table if not exists public.gym_products (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  name text not null,
  description text,
  sku text,
  price numeric(10, 2) not null default 0 check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  low_stock_alert integer not null default 3 check (low_stock_alert >= 0),
  unit text not null default 'ud',
  active boolean not null default true,
  image_path text,
  image_themes text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gym_product_movements (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  product_id uuid not null references public.gym_products(id) on delete cascade,
  kind text not null check (kind in ('sale', 'restock', 'adjustment')),
  quantity integer not null check (quantity > 0),
  unit_price numeric(10, 2),
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists gym_products_gym_idx on public.gym_products (gym_id, active, name);
create unique index if not exists gym_products_gym_sku_idx
  on public.gym_products (gym_id, sku)
  where sku is not null and btrim(sku) <> '';
create index if not exists gym_product_movements_gym_idx
  on public.gym_product_movements (gym_id, created_at desc);
create index if not exists gym_product_movements_product_idx
  on public.gym_product_movements (product_id, created_at desc);

drop trigger if exists gym_products_touch_trg on public.gym_products;
create trigger gym_products_touch_trg
  before update on public.gym_products
  for each row execute function public.gym_touch_updated_at();

create or replace function public.gym_product_tracks_physical_stock(
  p_name text,
  p_sku text
)
returns boolean
language sql
immutable
as $$
  select not (
    lower(coalesce(p_name, '')) like '%bono%'
    or lower(coalesce(p_name, '')) like '%drop in%'
    or lower(coalesce(p_name, '')) like '%drop-in%'
    or lower(coalesce(p_name, '')) like '%staff%'
    or lower(trim(coalesce(p_sku, ''))) in ('drop-in', 'dropin')
    or lower(coalesce(p_sku, '')) like '%bono%'
  );
$$;

create or replace function public.gym_apply_product_movement()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  tracks_stock boolean;
begin
  select public.gym_product_tracks_physical_stock(name, sku)
  into tracks_stock
  from public.gym_products
  where id = new.product_id
    and gym_id = new.gym_id;

  if tracks_stock is false then
    return new;
  end if;

  if new.kind = 'sale' then
    update public.gym_products
      set stock = stock - new.quantity
      where id = new.product_id
        and gym_id = new.gym_id
        and stock >= new.quantity;
    if not found then
      raise exception 'No hay stock suficiente para esta venta.';
    end if;
  elsif new.kind = 'restock' then
    update public.gym_products
      set stock = stock + new.quantity
      where id = new.product_id and gym_id = new.gym_id;
  elsif new.kind = 'adjustment' then
    -- Cantidad = stock resultante (no un delta).
    update public.gym_products
      set stock = new.quantity
      where id = new.product_id and gym_id = new.gym_id;
  end if;

  return new;
end;
$$;

drop trigger if exists gym_product_movements_apply_trg on public.gym_product_movements;
create trigger gym_product_movements_apply_trg
  before insert on public.gym_product_movements
  for each row execute function public.gym_apply_product_movement();

alter table public.gym_products enable row level security;
alter table public.gym_product_movements enable row level security;

drop policy if exists "Gym read gym_products" on public.gym_products;
create policy "Gym read gym_products"
  on public.gym_products for select
  to authenticated
  using (public.has_gym_access(gym_id));

drop policy if exists "Gym manage gym_products" on public.gym_products;
create policy "Gym manage gym_products"
  on public.gym_products for all
  to authenticated
  using (public.can_manage_gym(gym_id))
  with check (public.can_manage_gym(gym_id));

drop policy if exists "Gym read gym_product_movements" on public.gym_product_movements;
create policy "Gym read gym_product_movements"
  on public.gym_product_movements for select
  to authenticated
  using (public.has_gym_access(gym_id));

drop policy if exists "Gym operate gym_product_movements" on public.gym_product_movements;
create policy "Gym operate gym_product_movements"
  on public.gym_product_movements for insert
  to authenticated
  with check (public.can_operate_gym(gym_id));

grant select, insert, update, delete on public.gym_products to authenticated;
grant select, insert on public.gym_product_movements to authenticated;

alter table public.gym_products add column if not exists image_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gym-product-images',
  'gym-product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Gym read gym-product-images" on storage.objects;
create policy "Gym read gym-product-images"
  on storage.objects for select
  to public
  using (bucket_id = 'gym-product-images');

drop policy if exists "Gym manage gym-product-images" on storage.objects;
create policy "Gym manage gym-product-images"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'gym-product-images'
    and public.can_manage_gym(((storage.foldername(name))[1])::uuid)
  )
  with check (
    bucket_id = 'gym-product-images'
    and public.can_manage_gym(((storage.foldername(name))[1])::uuid)
  );

notify pgrst, 'reload schema';
