-- Permite editar y eliminar movimientos de tienda (ventas vinculadas a miembros, etc.).
-- Las funciones RPC ajustan el stock con security definer (el trigger solo corre al insertar).

drop policy if exists "Gym update gym_product_movements" on public.gym_product_movements;
create policy "Gym update gym_product_movements"
  on public.gym_product_movements for update
  to authenticated
  using (public.can_operate_gym(gym_id))
  with check (public.can_operate_gym(gym_id));

drop policy if exists "Gym delete gym_product_movements" on public.gym_product_movements;
create policy "Gym delete gym_product_movements"
  on public.gym_product_movements for delete
  to authenticated
  using (public.can_operate_gym(gym_id));

grant update, delete on public.gym_product_movements to authenticated;

create or replace function public.delete_gym_product_movement(target_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  rec public.gym_product_movements%rowtype;
  current_stock integer;
  tracks_stock boolean;
begin
  select * into rec
  from public.gym_product_movements
  where id = target_id;

  if not found then
    raise exception 'Movimiento no encontrado.';
  end if;

  if not public.can_operate_gym(rec.gym_id) then
    raise exception 'No tienes permiso para eliminar este movimiento.';
  end if;

  select
    public.gym_product_tracks_physical_stock(p.name, p.sku),
    p.stock
  into tracks_stock, current_stock
  from public.gym_products p
  where p.id = rec.product_id
    and p.gym_id = rec.gym_id;

  if current_stock is null then
    raise exception 'Producto no encontrado.';
  end if;

  if tracks_stock is false then
    delete from public.gym_product_movements
    where id = target_id;
    return;
  end if;

  if rec.kind = 'sale' then
    update public.gym_products
      set stock = current_stock + rec.quantity
      where id = rec.product_id
        and gym_id = rec.gym_id;
  elsif rec.kind = 'restock' then
    if current_stock < rec.quantity then
      raise exception 'No se puede eliminar: el stock actual es menor que la entrada registrada.';
    end if;

    update public.gym_products
      set stock = current_stock - rec.quantity
      where id = rec.product_id
        and gym_id = rec.gym_id;
  else
    raise exception 'Los ajustes de stock solo se pueden corregir desde la tienda.';
  end if;

  delete from public.gym_product_movements
  where id = target_id;
end;
$$;

grant execute on function public.delete_gym_product_movement(uuid) to authenticated;

create or replace function public.update_gym_product_movement_sale(
  target_id uuid,
  new_quantity integer,
  new_unit_price numeric,
  new_note text default null
)
returns public.gym_product_movements
language plpgsql
security definer
set search_path = public
as $$
declare
  rec public.gym_product_movements%rowtype;
  current_stock integer;
  quantity_delta integer;
  tracks_stock boolean;
begin
  if new_quantity < 1 then
    raise exception 'La cantidad debe ser al menos 1.';
  end if;

  if new_unit_price < 0 then
    raise exception 'Indica un precio válido.';
  end if;

  select * into rec
  from public.gym_product_movements
  where id = target_id;

  if not found then
    raise exception 'Movimiento no encontrado.';
  end if;

  if rec.kind <> 'sale' then
    raise exception 'Solo se pueden editar ventas.';
  end if;

  if not public.can_operate_gym(rec.gym_id) then
    raise exception 'No tienes permiso para editar este movimiento.';
  end if;

  quantity_delta := new_quantity - rec.quantity;

  select
    public.gym_product_tracks_physical_stock(p.name, p.sku),
    p.stock
  into tracks_stock, current_stock
  from public.gym_products p
  where p.id = rec.product_id
    and p.gym_id = rec.gym_id;

  if current_stock is null then
    raise exception 'Producto no encontrado.';
  end if;

  if tracks_stock is not false then
    if quantity_delta > 0 and current_stock < quantity_delta then
      raise exception 'No hay stock suficiente para esta cantidad.';
    end if;

    update public.gym_products
      set stock = current_stock - quantity_delta
      where id = rec.product_id
        and gym_id = rec.gym_id;
  end if;

  update public.gym_product_movements
    set
      quantity = new_quantity,
      unit_price = new_unit_price,
      note = new_note
    where id = target_id
    returning * into rec;

  return rec;
end;
$$;

grant execute on function public.update_gym_product_movement_sale(uuid, integer, numeric, text) to authenticated;

notify pgrst, 'reload schema';
