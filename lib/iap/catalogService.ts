import type { StoreCatalogProduct, StoreProductType } from '@/lib/iap/types';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

type StoreProductRow = {
  id: string;
  product_key: string;
  title: string;
  description: string | null;
  benefits: string[] | null;
  product_type: StoreProductType;
  google_product_id: string | null;
  google_base_plan_id: string | null;
  apple_product_id: string | null;
  sort_order: number | null;
  active: boolean | null;
  store_product_programs?: Array<{ program_id: string }> | null;
};

/** Tabla aún no creada (migración sin aplicar): la app sigue como antes, sin tienda. */
const MISSING_SCHEMA_CODES = new Set(['42P01', 'PGRST205', 'PGRST200']);

/**
 * Productos visibles para la cuenta. RLS decide: lo que está a la venta para todos y, además,
 * lo que está en pruebas para administradores y testers. Vacío si no hay ninguno.
 */
export async function fetchStoreCatalog(): Promise<StoreCatalogProduct[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('store_products')
    .select(
      'id, product_key, title, description, benefits, product_type, google_product_id, google_base_plan_id, apple_product_id, sort_order, active, store_product_programs(program_id)',
    )
    .order('sort_order', { ascending: true });

  if (error) {
    if (!MISSING_SCHEMA_CODES.has(error.code)) console.warn('No se pudo cargar el catálogo de la tienda', error.message);
    return [];
  }

  return ((data ?? []) as StoreProductRow[]).map((row) => ({
    id: row.id,
    productKey: row.product_key,
    title: row.title,
    description: row.description ?? '',
    benefits: row.benefits ?? [],
    productType: row.product_type,
    googleProductId: row.google_product_id,
    googleBasePlanId: row.google_base_plan_id,
    appleProductId: row.apple_product_id,
    sortOrder: row.sort_order ?? 0,
    programIds: (row.store_product_programs ?? []).map((link) => link.program_id),
    testOnly: row.active !== true,
  }));
}
