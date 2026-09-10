-- Servicios de tienda (drop in, bonos, staff) sin stock físico.

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

update public.gym_products
set stock = 0
where public.gym_product_tracks_physical_stock(name, sku) is false
  and stock <> 0;

notify pgrst, 'reload schema';
