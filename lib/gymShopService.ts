import type { AppThemeId } from '@/constants/appThemes';
import type { GymResult } from '@/lib/gymService';
import {
  getShopProductImageUrl,
  normalizeShopProductImageBase,
  parseShopProductImageThemes,
  shopProductHasThemeImage,
  shopProductImageBaseKey,
  shopProductThemeStoragePath,
} from '@/lib/gymShopImagePaths';
import { isPlaceholderShopImagePath } from '@/lib/gymShopImagePrompt';
import {
  findShopCatalogMatch,
  HYPE_GYM_SHOP_PRODUCTS,
  skuFromShopProductName,
  type HypeGymShopCatalogItem,
} from '@/lib/hypeGymShopCatalog';
import {
  isGymProductService,
  placeholderPathForProduct,
  resolveShopProductImageUrl,
} from '@/lib/gymShopProductArt';
import type {
  GymProduct,
  GymProductInput,
  GymProductMovement,
  GymProductMovementKind,
} from '@/lib/gymTypes';
import { getSupabase, isSupabaseConfigured, supabaseUrl } from '@/lib/supabase';

const PRODUCTS = 'gym_products';
const MOVEMENTS = 'gym_product_movements';
const IMAGE_BUCKET = 'gym-product-images';
const MIGRATION_HINT = 'Falta aplicar la tienda del gimnasio: ejecuta npm run supabase:gym-shop';
const IMAGE_FUNCTION_HINT =
  'Falta desplegar la generación de imágenes: ejecuta npm run supabase:gym-product-image';

const PRODUCT_SELECT =
  'id, gym_id, name, description, sku, price, stock, low_stock_alert, unit, active, image_path, image_themes, created_at, updated_at';
const MOVEMENT_SELECT =
  'id, gym_id, product_id, kind, quantity, unit_price, note, created_at';

type Row = Record<string, unknown>;
type PgError = { message?: string; code?: string } | null | undefined;

const demoProducts = new Map<string, GymProduct[]>();
const demoMovements = new Map<string, GymProductMovement[]>();

function isMissingRpcError(error: PgError, ...functionNames: string[]) {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? '';
  const mentionsFunction =
    message.includes('function') || message.includes('could not find the function');
  if (!mentionsFunction) return false;
  return functionNames.some((name) => message.includes(name.toLowerCase()));
}

function isMissingSchemaError(error: PgError) {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? '';
  if (message.includes('function') || message.includes('could not find the function')) {
    return false;
  }
  return (
    message.includes(PRODUCTS) ||
    message.includes(MOVEMENTS) ||
    message.includes('schema cache') ||
    message.includes('does not exist') ||
    message.includes('could not find the table') ||
    error.code === 'PGRST202' ||
    error.code === 'PGRST205' ||
    error.code === '42P01'
  );
}

function friendlyError(error: PgError, fallback: string) {
  if (!error) return fallback;
  if (
    isMissingRpcError(error, 'delete_gym_product_movement', 'update_gym_product_movement_sale')
  ) {
    return __DEV__
      ? `${MIGRATION_HINT} (incluye edición de movimientos)`
      : 'No se pudo completar la operación. Inténtalo de nuevo en unos minutos.';
  }
  if (isMissingSchemaError(error)) {
    return __DEV__ ? MIGRATION_HINT : 'La tienda del gimnasio no está disponible todavía.';
  }
  const message = error.message ?? '';
  if (/stock suficiente/i.test(message)) return 'No hay stock suficiente para esta venta.';
  if (/row-level security|permission denied|violates/i.test(message)) {
    return 'No tienes permiso para hacer eso en este gimnasio.';
  }
  if (/duplicate key/i.test(message)) return 'Ya existe un producto con esa referencia.';
  return fallback;
}

function text(value: unknown): string | undefined {
  const result = value as string | null;
  return result ?? undefined;
}

function num(value: unknown, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function gymProductImageUrl(path?: string, cacheKey?: string, productName?: string, themeId: AppThemeId = 'night') {
  if (!path) return undefined;
  const resolved = resolveShopProductImageUrl(path, productName ?? '', cacheKey);
  if (resolved) return resolved;
  return getShopProductImageUrl(
    { imagePath: path, name: productName ?? '', updatedAt: cacheKey },
    themeId,
    supabaseUrl,
    IMAGE_BUCKET,
  );
}

export function resolveGymProductImageUrl(
  product: Pick<GymProduct, 'imagePath' | 'imageThemes' | 'name' | 'updatedAt'>,
  themeId: AppThemeId,
) {
  if (isPlaceholderShopImagePath(product.imagePath)) {
    return resolveShopProductImageUrl(product.imagePath, product.name, product.updatedAt);
  }

  const themeToUse = shopProductHasThemeImage(product.imagePath, product.imageThemes, themeId)
    ? themeId
    : shopProductHasThemeImage(product.imagePath, product.imageThemes, 'night')
      ? 'night'
      : themeId;

  return getShopProductImageUrl(product, themeToUse, supabaseUrl, IMAGE_BUCKET);
}

function mapProduct(row: Row): GymProduct {
  const name = row.name as string;
  const imagePath = text(row.image_path) ?? placeholderPathForProduct(name);
  const imageThemes = parseShopProductImageThemes(row.image_themes);
  const updatedAt = (row.updated_at as string) ?? (row.created_at as string);
  return {
    id: row.id as string,
    gymId: row.gym_id as string,
    name,
    description: text(row.description),
    sku: text(row.sku),
    price: num(row.price),
    stock: num(row.stock),
    lowStockAlert: num(row.low_stock_alert, 3),
    unit: text(row.unit) || 'ud',
    active: Boolean(row.active),
    imagePath,
    imageThemes,
    imageUrl: gymProductImageUrl(imagePath, updatedAt, name, 'night'),
    createdAt: row.created_at as string,
    updatedAt,
  };
}

function mapMovement(row: Row, productName?: string): GymProductMovement {
  return {
    id: row.id as string,
    gymId: row.gym_id as string,
    productId: row.product_id as string,
    productName,
    kind: row.kind as GymProductMovementKind,
    quantity: num(row.quantity, 1),
    unitPrice: row.unit_price == null ? undefined : num(row.unit_price),
    note: text(row.note),
    createdAt: row.created_at as string,
  };
}

export function formatGymMoney(amount: number) {
  return `${amount.toFixed(2).replace('.', ',')} €`;
}

export type GymShopPaymentStatus = 'paid' | 'pending';
export type GymShopPaymentMethod = 'cash' | 'card';

export interface GymShopSalePayment {
  status: GymShopPaymentStatus;
  method?: GymShopPaymentMethod;
}

export const GYM_SHOP_PAYMENT_STATUS_LABELS: Record<GymShopPaymentStatus, string> = {
  paid: 'Pagado',
  pending: 'Pendiente',
};

export const GYM_SHOP_PAYMENT_METHOD_LABELS: Record<GymShopPaymentMethod, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
};

const PAYMENT_STATUS_TOKENS: Record<string, GymShopPaymentStatus> = {
  pagado: 'paid',
  pendiente: 'pending',
};

const PAYMENT_METHOD_TOKENS: Record<string, GymShopPaymentMethod> = {
  efectivo: 'cash',
  tarjeta: 'card',
};

function splitShopNoteSegments(value: string) {
  return value
    .split('·')
    .map((segment) => segment.trim())
    .filter(Boolean);
}

export function formatShopSalePaymentNote(payment: GymShopSalePayment, extraNote?: string) {
  const parts: string[] = [GYM_SHOP_PAYMENT_STATUS_LABELS[payment.status]];
  if (payment.status === 'paid' && payment.method) {
    parts.push(GYM_SHOP_PAYMENT_METHOD_LABELS[payment.method]);
  }
  const extra = extraNote?.trim();
  if (extra) parts.push(extra);
  return parts.join(' · ');
}

export function parseShopSalePaymentNote(extraNote?: string): {
  payment: GymShopSalePayment;
  freeNote: string;
} {
  const segments = splitShopNoteSegments(extraNote ?? '');
  if (segments.length === 0) {
    return { payment: { status: 'pending' }, freeNote: '' };
  }

  let status: GymShopPaymentStatus = 'pending';
  let method: GymShopPaymentMethod | undefined;
  const freeParts: string[] = [];

  for (const segment of segments) {
    const normalized = segment.toLowerCase();
    if (normalized in PAYMENT_STATUS_TOKENS) {
      status = PAYMENT_STATUS_TOKENS[normalized];
      continue;
    }
    if (normalized in PAYMENT_METHOD_TOKENS) {
      method = PAYMENT_METHOD_TOKENS[normalized];
      continue;
    }
    freeParts.push(segment);
  }

  return {
    payment: {
      status,
      method: status === 'paid' ? method ?? 'cash' : undefined,
    },
    freeNote: freeParts.join(' · '),
  };
}

export function formatShopSalePaymentLabel(payment: GymShopSalePayment) {
  if (payment.status === 'pending') return GYM_SHOP_PAYMENT_STATUS_LABELS.pending;
  if (!payment.method) return GYM_SHOP_PAYMENT_STATUS_LABELS.paid;
  return `${GYM_SHOP_PAYMENT_STATUS_LABELS.paid} · ${GYM_SHOP_PAYMENT_METHOD_LABELS[payment.method]}`;
}

/** Nota de venta en tienda: vincula la compra al balance del miembro. */
export function buildShopSaleNote(
  memberName?: string,
  payment?: GymShopSalePayment,
  extraNote?: string,
) {
  const paymentNote = payment ? formatShopSalePaymentNote(payment, extraNote) : extraNote?.trim();
  const name = memberName?.trim() ?? '';
  if (!name) return paymentNote || undefined;
  if (!paymentNote) return name;
  return `${name} · ${paymentNote}`;
}

function normalizeShopNote(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Extrae la nota libre de una venta vinculada a un miembro. */
export function extractShopSaleExtraNote(note?: string, memberName?: string) {
  const raw = note?.trim() ?? '';
  const name = memberName?.trim() ?? '';
  if (!raw || !name) return raw;

  const normalizedRaw = normalizeShopNote(raw);
  const normalizedName = normalizeShopNote(name);
  if (!normalizedRaw.startsWith(normalizedName)) return raw;

  const remainder = raw.slice(name.length).replace(/^\s*[·\-–—]\s*/, '').trim();
  return remainder;
}

async function fetchMovementRow(
  movementId: string,
): Promise<GymResult<{ movement: GymProductMovement; productName?: string }>> {
  if (!isSupabaseConfigured) {
    for (const gymId of demoMovements.keys()) {
      const movement = (demoMovements.get(gymId) ?? []).find((item) => item.id === movementId);
      if (!movement) continue;
      const product = (demoProducts.get(gymId) ?? []).find((item) => item.id === movement.productId);
      return { data: { movement, productName: product?.name ?? movement.productName } };
    }
    return { error: 'Movimiento no encontrado.' };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data, error } = await supabase
    .from(MOVEMENTS)
    .select(MOVEMENT_SELECT)
    .eq('id', movementId)
    .maybeSingle();

  if (error || !data) return { error: friendlyError(error, 'Movimiento no encontrado.') };

  const productId = data.product_id as string;
  const { data: product } = await supabase.from(PRODUCTS).select('name').eq('id', productId).maybeSingle();

  return {
    data: {
      movement: mapMovement(data as Row, text(product?.name)),
      productName: text(product?.name),
    },
  };
}

async function setProductStock(gymId: string, productId: string, stock: number) {
  if (!isSupabaseConfigured) {
    const products = demoProducts.get(gymId) ?? [];
    demoProducts.set(
      gymId,
      products.map((product) =>
        product.id === productId ? { ...product, stock, updatedAt: new Date().toISOString() } : product,
      ),
    );
    return { error: undefined as string | undefined };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { error } = await supabase
    .from(PRODUCTS)
    .update({ stock })
    .eq('id', productId)
    .eq('gym_id', gymId);

  return { error: error ? friendlyError(error, 'No se pudo actualizar el stock.') : undefined };
}

async function getProductStock(gymId: string, productId: string) {
  if (!isSupabaseConfigured) {
    const product = (demoProducts.get(gymId) ?? []).find((item) => item.id === productId);
    return product?.stock ?? null;
  }

  const supabase = getSupabase();
  if (!supabase) return null;

  const { data } = await supabase
    .from(PRODUCTS)
    .select('stock')
    .eq('id', productId)
    .eq('gym_id', gymId)
    .maybeSingle();

  return typeof data?.stock === 'number' ? data.stock : null;
}

async function deleteGymProductMovementDirect(movementId: string): Promise<GymResult<true>> {
  const loaded = await fetchMovementRow(movementId);
  if (loaded.error || !loaded.data) return { error: loaded.error ?? 'Movimiento no encontrado.' };

  const { movement } = loaded.data;
  const stock = await getProductStock(movement.gymId, movement.productId);
  if (stock === null) return { error: 'Producto no encontrado.' };

  let nextStock = stock;
  if (movement.kind === 'sale') {
    nextStock = stock + movement.quantity;
  } else if (movement.kind === 'restock') {
    if (stock < movement.quantity) {
      return { error: 'No se puede eliminar: el stock actual es menor que la entrada registrada.' };
    }
    nextStock = stock - movement.quantity;
  } else {
    return { error: 'Los ajustes de stock solo se pueden corregir desde la tienda.' };
  }

  const stockResult = await setProductStock(movement.gymId, movement.productId, nextStock);
  if (stockResult.error) return { error: stockResult.error };

  if (!isSupabaseConfigured) {
    demoMovements.set(
      movement.gymId,
      (demoMovements.get(movement.gymId) ?? []).filter((item) => item.id !== movementId),
    );
    return { data: true };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { error } = await supabase.from(MOVEMENTS).delete().eq('id', movementId);
  if (error) return { error: friendlyError(error, 'No se pudo eliminar la compra.') };
  return { data: true };
}

export async function deleteGymProductMovement(movementId: string): Promise<GymResult<true>> {
  if (!isSupabaseConfigured) {
    return deleteGymProductMovementDirect(movementId);
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { error } = await supabase.rpc('delete_gym_product_movement', { target_id: movementId });
  if (!error) return { data: true };

  if (isMissingRpcError(error, 'delete_gym_product_movement')) {
    return deleteGymProductMovementDirect(movementId);
  }

  return { error: friendlyError(error, 'No se pudo eliminar la compra.') };
}

export async function updateGymProductMovement(
  movementId: string,
  input: {
    quantity?: number;
    unitPrice?: number;
    note?: string;
  },
): Promise<GymResult<GymProductMovement>> {
  const loaded = await fetchMovementRow(movementId);
  if (loaded.error || !loaded.data) return { error: loaded.error ?? 'Movimiento no encontrado.' };

  const { movement } = loaded.data;
  if (movement.kind !== 'sale') {
    return { error: 'Solo se pueden editar ventas desde la ficha del miembro.' };
  }

  const quantity = input.quantity ?? movement.quantity;
  const unitPrice = input.unitPrice ?? movement.unitPrice ?? 0;

  if (!Number.isInteger(quantity) || quantity < 1) {
    return { error: 'La cantidad debe ser al menos 1.' };
  }
  if (!Number.isFinite(unitPrice) || unitPrice < 0) {
    return { error: 'Indica un precio válido.' };
  }

  const note = input.note?.trim() || undefined;

  if (!isSupabaseConfigured) {
    const stock = await getProductStock(movement.gymId, movement.productId);
    if (stock === null) return { error: 'Producto no encontrado.' };

    const quantityDelta = quantity - movement.quantity;
    if (quantityDelta > 0 && stock < quantityDelta) {
      return { error: 'No hay stock suficiente para esta cantidad.' };
    }

    const stockResult = await setProductStock(movement.gymId, movement.productId, stock - quantityDelta);
    if (stockResult.error) return { error: stockResult.error };

    const updated: GymProductMovement = {
      ...movement,
      quantity,
      unitPrice,
      note,
    };
    demoMovements.set(
      movement.gymId,
      (demoMovements.get(movement.gymId) ?? []).map((item) =>
        item.id === movementId ? updated : item,
      ),
    );
    return { data: updated };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data, error } = await supabase.rpc('update_gym_product_movement_sale', {
    target_id: movementId,
    new_quantity: quantity,
    new_unit_price: unitPrice,
    new_note: note ?? null,
  });

  if (!error && data) {
    return { data: mapMovement(data as Row, loaded.data.productName) };
  }

  if (isMissingRpcError(error, 'update_gym_product_movement_sale')) {
    const stock = await getProductStock(movement.gymId, movement.productId);
    if (stock === null) return { error: 'Producto no encontrado.' };

    const quantityDelta = quantity - movement.quantity;
    if (quantityDelta > 0 && stock < quantityDelta) {
      return { error: 'No hay stock suficiente para esta cantidad.' };
    }

    const stockResult = await setProductStock(movement.gymId, movement.productId, stock - quantityDelta);
    if (stockResult.error) return { error: stockResult.error };

    const { data: updatedRow, error: updateError } = await supabase
      .from(MOVEMENTS)
      .update({ quantity, unit_price: unitPrice, note: note ?? null })
      .eq('id', movementId)
      .select(MOVEMENT_SELECT)
      .single();

    if (updateError || !updatedRow) {
      return { error: friendlyError(updateError, 'No se pudo actualizar la compra.') };
    }

    return { data: mapMovement(updatedRow as Row, loaded.data.productName) };
  }

  return { error: friendlyError(error, 'No se pudo actualizar la compra.') };
}

export { isGymProductService } from '@/lib/gymShopProductArt';

export function isGymProductLowStock(product: GymProduct) {
  if (isGymProductService(product)) return false;
  return product.active && product.stock <= product.lowStockAlert;
}

export function gymShopPhysicalStockUnits(products: GymProduct[]) {
  return products.reduce(
    (total, product) => (isGymProductService(product) ? total : total + product.stock),
    0,
  );
}

export function gymShopInventoryValue(products: GymProduct[]) {
  return products.reduce(
    (total, product) =>
      isGymProductService(product) ? total : total + product.price * product.stock,
    0,
  );
}

export function formatGymProductStockLabel(product: GymProduct) {
  if (isGymProductService(product)) return 'Servicio';
  return `${product.stock} ${product.unit}`;
}

export type GymShopSalesPeriod = 'day' | 'month' | 'all';

export function gymShopSaleAmount(movement: GymProductMovement) {
  return (movement.unitPrice ?? 0) * movement.quantity;
}

export function gymShopSaleBuyerLabel(note?: string) {
  const trimmed = note?.trim();
  if (!trimmed) return 'Sin cliente';

  const first = splitShopNoteSegments(trimmed)[0] ?? '';
  const normalized = first.toLowerCase();
  if (normalized in PAYMENT_STATUS_TOKENS) return 'Sin cliente';
  return first || 'Sin cliente';
}

export function gymShopSalePaymentLabel(note?: string, memberName?: string) {
  const extra = extractShopSaleExtraNote(note, memberName);
  return formatShopSalePaymentLabel(parseShopSalePaymentNote(extra).payment);
}

function localDateKey(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isGymShopSaleInPeriod(
  movement: GymProductMovement,
  period: GymShopSalesPeriod,
  referenceDate = new Date(),
) {
  if (movement.kind !== 'sale') return false;
  if (period === 'all') return true;

  const movementDate = localDateKey(movement.createdAt);
  const referenceKey = localDateKey(referenceDate.toISOString());

  if (period === 'day') {
    return movementDate === referenceKey;
  }

  const [movementYear, movementMonth] = movementDate.split('-');
  const [referenceYear, referenceMonth] = referenceKey.split('-');
  return movementYear === referenceYear && movementMonth === referenceMonth;
}

export function summarizeGymShopSales(
  movements: readonly GymProductMovement[],
  period: GymShopSalesPeriod,
  referenceDate = new Date(),
) {
  const sales = movements
    .filter((movement) => isGymShopSaleInPeriod(movement, period, referenceDate))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

  const totalAmount = sales.reduce((total, sale) => total + gymShopSaleAmount(sale), 0);
  const buyers = new Set(
    sales.map((sale) => gymShopSaleBuyerLabel(sale.note).toLocaleLowerCase('es')),
  );

  return {
    sales,
    totalAmount,
    saleCount: sales.length,
    buyerCount: buyers.size,
  };
}

export const GYM_SHOP_SALES_PERIOD_LABELS: Record<GymShopSalesPeriod, string> = {
  day: 'Hoy',
  month: 'Mes',
  all: 'Todo',
};

export async function fetchGymProducts(gymId: string): Promise<GymResult<GymProduct[]>> {
  if (!gymId) return { data: [] };

  if (!isSupabaseConfigured) {
    ensureDemoHypeShopProducts(gymId);
    return { data: [...(demoProducts.get(gymId) ?? [])] };
  }

  const supabase = getSupabase();
  if (!supabase) return { data: [] };

  const { data, error } = await supabase
    .from(PRODUCTS)
    .select(PRODUCT_SELECT)
    .eq('gym_id', gymId)
    .order('name', { ascending: true });

  if (error) return { error: friendlyError(error, 'No se pudieron cargar los productos.') };
  return { data: (data as Row[]).map(mapProduct) };
}

export async function saveGymProduct(
  gymId: string,
  input: GymProductInput & { id?: string },
): Promise<GymResult<GymProduct>> {
  if (!input.name.trim()) return { error: 'El nombre del producto es obligatorio.' };
  if (!Number.isFinite(input.price) || input.price < 0) {
    return { error: 'El precio no puede ser negativo.' };
  }
  if (!input.id && (!Number.isInteger(input.stock) || input.stock < 0)) {
    return { error: 'El stock no puede ser negativo.' };
  }

  const catalog = {
    gym_id: gymId,
    name: input.name.trim(),
    description: input.description?.trim() || null,
    sku: input.sku?.trim() || null,
    price: input.price,
    low_stock_alert: input.lowStockAlert ?? 3,
    unit: input.unit?.trim() || 'ud',
    active: input.active ?? true,
  };

  if (!isSupabaseConfigured) {
    const existing = demoProducts.get(gymId) ?? [];
    const previous = existing.find((item) => item.id === input.id);
    const now = new Date().toISOString();
    const product: GymProduct = {
      id: input.id ?? `demo-product-${Date.now()}`,
      gymId,
      name: catalog.name,
      description: catalog.description ?? undefined,
      sku: catalog.sku ?? undefined,
      price: catalog.price,
      stock: previous?.stock ?? input.stock,
      lowStockAlert: catalog.low_stock_alert,
      unit: catalog.unit,
      active: catalog.active,
      imagePath: previous?.imagePath,
      imageUrl: previous?.imageUrl,
      createdAt: previous?.createdAt ?? now,
      updatedAt: now,
    };
    demoProducts.set(
      gymId,
      input.id
        ? existing.map((item) => (item.id === input.id ? product : item))
        : [product, ...existing],
    );
    return { data: product };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const query = input.id
    ? supabase.from(PRODUCTS).update(catalog).eq('id', input.id).eq('gym_id', gymId)
    : supabase.from(PRODUCTS).insert({ ...catalog, stock: input.stock });

  const { data, error } = await query.select(PRODUCT_SELECT).single();
  if (error || !data) return { error: friendlyError(error, 'No se pudo guardar el producto.') };
  return { data: mapProduct(data as Row) };
}

export async function deleteGymProduct(productId: string): Promise<GymResult<true>> {
  if (!isSupabaseConfigured) {
    for (const [gymId, products] of demoProducts.entries()) {
      demoProducts.set(
        gymId,
        products.filter((product) => product.id !== productId),
      );
      demoMovements.set(
        gymId,
        (demoMovements.get(gymId) ?? []).filter((movement) => movement.productId !== productId),
      );
    }
    return { data: true };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data: existing } = await supabase
    .from(PRODUCTS)
    .select('image_path')
    .eq('id', productId)
    .maybeSingle();
  const imagePath = text(existing?.image_path);
  if (imagePath && !imagePath.startsWith('data:')) {
    await supabase.storage.from(IMAGE_BUCKET).remove([imagePath]);
  }

  const { error } = await supabase.from(PRODUCTS).delete().eq('id', productId);
  if (error) return { error: friendlyError(error, 'No se pudo eliminar el producto.') };
  return { data: true };
}

function extensionFromMime(mimeType?: string) {
  if (mimeType?.includes('png')) return 'png';
  if (mimeType?.includes('webp')) return 'webp';
  return 'jpg';
}

async function uriToArrayBuffer(uri: string) {
  const response = await fetch(uri);
  if (!response.ok) throw new Error('No se pudo leer la imagen.');
  return response.arrayBuffer();
}

export async function uploadGymProductImage(
  gymId: string,
  productId: string,
  imageUri: string,
  mimeType = 'image/jpeg',
  themeId: AppThemeId = 'night',
): Promise<GymResult<GymProduct>> {
  if (!isSupabaseConfigured) {
    const products = demoProducts.get(gymId) ?? [];
    const next = products.map((product) =>
      product.id === productId
        ? { ...product, imagePath: imageUri, imageUrl: imageUri, updatedAt: new Date().toISOString() }
        : product,
    );
    demoProducts.set(gymId, next);
    const product = next.find((item) => item.id === productId);
    if (!product) return { error: 'Producto no encontrado.' };
    return { data: product };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data: existing } = await supabase
    .from(PRODUCTS)
    .select(PRODUCT_SELECT)
    .eq('id', productId)
    .eq('gym_id', gymId)
    .maybeSingle();
  if (!existing) return { error: 'Producto no encontrado.' };

  const previousPath = text((existing as Row).image_path);
  const previousThemes = parseShopProductImageThemes((existing as Row).image_themes);
  const basePath = normalizeShopProductImageBase(previousPath) ?? shopProductImageBaseKey(gymId, productId);
  const storagePath = shopProductThemeStoragePath(basePath, themeId);
  const extension = extensionFromMime(mimeType);
  const resolvedStoragePath = storagePath.replace(/\.png$/, `.${extension}`);

  try {
    const fileData = await uriToArrayBuffer(imageUri);
    const { error: uploadError } = await supabase.storage.from(IMAGE_BUCKET).upload(resolvedStoragePath, fileData, {
      upsert: true,
      contentType: mimeType,
    });
    if (uploadError) return { error: friendlyError(uploadError, 'No se pudo subir la imagen.') };

    if (
      previousPath &&
      previousPath !== basePath &&
      previousPath !== resolvedStoragePath &&
      !previousPath.startsWith('data:') &&
      !previousThemes.length
    ) {
      await supabase.storage.from(IMAGE_BUCKET).remove([previousPath]);
    }

    const nextThemes = Array.from(new Set([...previousThemes, themeId]));
    const { data, error } = await supabase
      .from(PRODUCTS)
      .update({ image_path: basePath, image_themes: nextThemes })
      .eq('id', productId)
      .eq('gym_id', gymId)
      .select(PRODUCT_SELECT)
      .single();
    if (error || !data) return { error: friendlyError(error, 'No se pudo guardar la imagen.') };
    return { data: mapProduct(data as Row) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'No se pudo subir la imagen.' };
  }
}

export async function clearGymProductImage(gymId: string, productId: string): Promise<GymResult<true>> {
  if (!isSupabaseConfigured) {
    demoProducts.set(
      gymId,
      (demoProducts.get(gymId) ?? []).map((product) =>
        product.id === productId ? { ...product, imagePath: undefined, imageUrl: undefined } : product,
      ),
    );
    return { data: true };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data: existing } = await supabase
    .from(PRODUCTS)
    .select('image_path, image_themes')
    .eq('id', productId)
    .eq('gym_id', gymId)
    .maybeSingle();
  const imagePath = text(existing?.image_path);
  const imageThemes = parseShopProductImageThemes((existing as Row | null)?.image_themes);
  const basePath = normalizeShopProductImageBase(imagePath);
  const pathsToRemove = new Set<string>();
  if (imagePath && !imagePath.startsWith('data:') && !imagePath.startsWith('placeholder:')) {
    pathsToRemove.add(imagePath);
  }
  if (basePath) {
    for (const theme of imageThemes) {
      pathsToRemove.add(shopProductThemeStoragePath(basePath, theme));
    }
  }
  if (pathsToRemove.size > 0) {
    await supabase.storage.from(IMAGE_BUCKET).remove([...pathsToRemove]);
  }

  const { error } = await supabase
    .from(PRODUCTS)
    .update({ image_path: null, image_themes: [] })
    .eq('id', productId)
    .eq('gym_id', gymId);
  if (error) return { error: friendlyError(error, 'No se pudo quitar la imagen.') };
  return { data: true };
}

export async function generateGymProductImage(input: {
  gymId: string;
  name: string;
  description?: string;
  themeId?: AppThemeId;
}): Promise<GymResult<{ dataUrl: string; mimeType: string }>> {
  if (!input.name.trim()) {
    return { error: 'Escribe el nombre del producto para generar la imagen.' };
  }

  if (!isSupabaseConfigured) {
    return { error: 'La generación con ChatGPT necesita conexión a Supabase.' };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data, error } = await supabase.functions.invoke<{
    imageBase64?: string;
    mimeType?: string;
    error?: string;
  }>('generate-gym-product-image', {
    body: {
      gymId: input.gymId,
      name: input.name.trim(),
      description: input.description?.trim() || undefined,
      themeId: input.themeId,
    },
  });

  if (error) {
    const message = data?.error ?? error.message;
    const normalized = message.toLowerCase();
    if (
      normalized.includes('function not found') ||
      normalized.includes('404') ||
      normalized.includes('failed to send a request')
    ) {
      return { error: IMAGE_FUNCTION_HINT };
    }
    if (normalized.includes('openai') || normalized.includes('api key')) {
      return { error: 'ChatGPT no está configurado. Falta OPENAI_API_KEY en el servidor.' };
    }
    return { error: message || 'No se pudo generar la imagen.' };
  }

  if (data?.error) return { error: data.error };
  if (!data?.imageBase64) return { error: 'ChatGPT no devolvió ninguna imagen.' };

  const mimeType = data.mimeType || 'image/png';
  return { data: { dataUrl: `data:${mimeType};base64,${data.imageBase64}`, mimeType } };
}

export async function generateAndSaveGymProductImage(input: {
  gymId: string;
  productId: string;
  name: string;
  description?: string;
  themeId?: AppThemeId;
}): Promise<GymResult<GymProduct>> {
  const generated = await generateGymProductImage(input);
  if (generated.error) return { error: generated.error };
  if (!generated.data) return { error: 'ChatGPT no devolvió ninguna imagen.' };
  return uploadGymProductImage(
    input.gymId,
    input.productId,
    generated.data.dataUrl,
    generated.data.mimeType,
    input.themeId ?? 'night',
  );
}

export function gymProductNeedsGeneratedImage(
  product: Pick<GymProduct, 'imagePath' | 'imageThemes'>,
  themeId: AppThemeId = 'night',
) {
  if (isPlaceholderShopImagePath(product.imagePath)) return true;
  return !shopProductHasThemeImage(product.imagePath, product.imageThemes, themeId);
}

export async function fetchGymProductMovements(
  gymId: string,
  limit = 40,
): Promise<GymResult<GymProductMovement[]>> {
  if (!gymId) return { data: [] };

  if (!isSupabaseConfigured) {
    return { data: (demoMovements.get(gymId) ?? []).slice(0, limit) };
  }

  const supabase = getSupabase();
  if (!supabase) return { data: [] };

  const { data, error } = await supabase
    .from(MOVEMENTS)
    .select(MOVEMENT_SELECT)
    .eq('gym_id', gymId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return { error: friendlyError(error, 'No se pudieron cargar los movimientos.') };

  const rows = (data ?? []) as Row[];
  const productIds = [...new Set(rows.map((row) => row.product_id as string))];
  const names = new Map<string, string>();

  if (productIds.length > 0) {
    const { data: products } = await supabase.from(PRODUCTS).select('id, name').in('id', productIds);
    for (const product of products ?? []) {
      names.set(product.id as string, product.name as string);
    }
  }

  return {
    data: rows.map((row) => mapMovement(row, names.get(row.product_id as string))),
  };
}

export async function recordGymProductMovement(input: {
  gymId: string;
  productId: string;
  kind: GymProductMovementKind;
  quantity: number;
  unitPrice?: number;
  note?: string;
  createdBy?: string;
}): Promise<GymResult<GymProductMovement>> {
  if (!Number.isInteger(input.quantity) || input.quantity < 1) {
    return { error: 'La cantidad debe ser al menos 1.' };
  }

  if (!isSupabaseConfigured) {
    const products = demoProducts.get(input.gymId) ?? [];
    const product = products.find((item) => item.id === input.productId);
    if (!product) return { error: 'Producto no encontrado.' };

    const tracksStock = !isGymProductService(product);
    let nextStock = product.stock;
    if (tracksStock) {
      if (input.kind === 'sale') {
        if (product.stock < input.quantity) return { error: 'No hay stock suficiente para esta venta.' };
        nextStock = product.stock - input.quantity;
      } else if (input.kind === 'restock') {
        nextStock = product.stock + input.quantity;
      } else {
        nextStock = input.quantity;
      }
    }

    const movement: GymProductMovement = {
      id: `demo-move-${Date.now()}`,
      gymId: input.gymId,
      productId: input.productId,
      productName: product.name,
      kind: input.kind,
      quantity: input.quantity,
      unitPrice: input.unitPrice,
      note: input.note,
      createdAt: new Date().toISOString(),
    };
    demoProducts.set(
      input.gymId,
      products.map((item) => (item.id === product.id ? { ...item, stock: nextStock } : item)),
    );
    demoMovements.set(input.gymId, [movement, ...(demoMovements.get(input.gymId) ?? [])]);
    return { data: movement };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data, error } = await supabase
    .from(MOVEMENTS)
    .insert({
      gym_id: input.gymId,
      product_id: input.productId,
      kind: input.kind,
      quantity: input.quantity,
      unit_price: input.unitPrice ?? null,
      note: input.note?.trim() || null,
      created_by: input.createdBy ?? null,
    })
    .select(MOVEMENT_SELECT)
    .single();

  if (error || !data) return { error: friendlyError(error, 'No se pudo registrar el movimiento.') };
  return { data: mapMovement(data as Row) };
}

function buildDemoShopProduct(gymId: string, item: HypeGymShopCatalogItem, index: number): GymProduct {
  const now = new Date().toISOString();
  const sku = item.sku ?? skuFromShopProductName(item.name);
  const imagePath = placeholderPathForProduct(item.name);

  return {
    id: `demo-shop-${index}-${sku}`,
    gymId,
    name: item.name,
    sku,
    price: item.price,
    stock: Math.max(0, isGymProductService({ name: item.name, sku }) ? 0 : item.stock),
    lowStockAlert: 3,
    unit: 'ud',
    active: item.active ?? true,
    imagePath,
    imageUrl: gymProductImageUrl(imagePath, now, item.name),
    createdAt: now,
    updatedAt: now,
  };
}

function ensureDemoHypeShopProducts(gymId: string) {
  if ((demoProducts.get(gymId) ?? []).length > 0) return;
  demoProducts.set(
    gymId,
    HYPE_GYM_SHOP_PRODUCTS.map((item, index) => buildDemoShopProduct(gymId, item, index)),
  );
}

export async function seedHypeGymShopProducts(
  gymId: string,
): Promise<GymResult<{ created: number; updated: number }>> {
  if (!gymId) return { error: 'Gimnasio no válido.' };

  if (!isSupabaseConfigured) {
    ensureDemoHypeShopProducts(gymId);
    return { data: { created: HYPE_GYM_SHOP_PRODUCTS.length, updated: 0 } };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const existingResult = await fetchGymProducts(gymId);
  if (existingResult.error) return { error: existingResult.error };

  const existing = existingResult.data ?? [];
  let created = 0;
  let updated = 0;

  for (const item of HYPE_GYM_SHOP_PRODUCTS) {
    const sku = item.sku ?? skuFromShopProductName(item.name);
    const imagePath = placeholderPathForProduct(item.name);
    const match = findShopCatalogMatch(existing, { name: item.name, sku });
    const stock = Math.max(0, item.stock);

    if (match) {
      const saveResult = await saveGymProduct(gymId, {
        id: match.id,
        name: item.name,
        sku,
        price: item.price,
        stock: match.stock,
        active: item.active ?? true,
      });
      if (saveResult.error) return { error: saveResult.error };

      if (stock !== match.stock) {
        const adjustment = await recordGymProductMovement({
          gymId,
          productId: match.id,
          kind: 'adjustment',
          quantity: stock,
          note: 'Catálogo Hype',
        });
        if (adjustment.error) return { error: adjustment.error };
      }

      if (!match.imagePath) {
        await supabase.from(PRODUCTS).update({ image_path: imagePath }).eq('id', match.id);
      }

      updated += 1;
      continue;
    }

    const createResult = await saveGymProduct(gymId, {
      name: item.name,
      sku,
      price: item.price,
      stock,
      active: item.active ?? true,
    });
    if (createResult.error || !createResult.data) {
      return { error: createResult.error ?? 'No se pudo crear el producto.' };
    }

    await supabase.from(PRODUCTS).update({ image_path: imagePath }).eq('id', createResult.data.id);
    created += 1;
  }

  return { data: { created, updated } };
}
