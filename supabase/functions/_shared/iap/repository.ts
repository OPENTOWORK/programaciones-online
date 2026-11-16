import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { entitlementStatusFor, type ProductType, type PurchaseState, type PurchaseStatus } from './state.ts';

export type Store = 'google_play' | 'app_store';
export type Platform = 'android' | 'ios';
export type PurchaseEnvironment = 'production' | 'sandbox';

export interface StoreProductRow {
  id: string;
  product_key: string;
  title: string;
  product_type: ProductType;
  google_product_id: string | null;
  google_base_plan_id: string | null;
  apple_product_id: string | null;
  active: boolean;
}

export interface StorePurchaseRow {
  id: string;
  user_id: string;
  store_product_id: string | null;
  platform: Platform;
  store: Store;
  product_id: string;
  purchase_key: string;
  transaction_id: string | null;
  original_transaction_id: string | null;
  linked_purchase_token: string | null;
  status: PurchaseStatus;
  auto_renew: boolean | null;
  environment: PurchaseEnvironment;
  purchased_at: string | null;
  expires_at: string | null;
  cancelled_at: string | null;
  refunded_at: string | null;
  acknowledged: boolean;
  last_verified_at: string | null;
  last_event: string | null;
}

export interface PurchaseRecordInput {
  userId: string;
  product: StoreProductRow;
  store: Store;
  platform: Platform;
  productId: string;
  purchaseKey: string;
  transactionId: string | null;
  originalTransactionId: string | null;
  linkedPurchaseToken: string | null;
  environment: PurchaseEnvironment;
  acknowledged: boolean;
  state: PurchaseState;
  event: string;
}

export type SaveResult =
  | { kind: 'saved'; purchase: StorePurchaseRow; previous: StorePurchaseRow | null }
  | { kind: 'conflict'; owner: StorePurchaseRow };

const PRODUCT_COLUMNS =
  'id, product_key, title, product_type, google_product_id, google_base_plan_id, apple_product_id, active';

const UNIQUE_VIOLATION = '23505';

export async function findProductByStoreId(
  admin: SupabaseClient,
  store: Store,
  storeProductId: string,
): Promise<StoreProductRow | null> {
  const column = store === 'google_play' ? 'google_product_id' : 'apple_product_id';
  const { data, error } = await admin.from('store_products').select(PRODUCT_COLUMNS).eq(column, storeProductId).maybeSingle();
  if (error) throw error;
  return (data as StoreProductRow | null) ?? null;
}

export async function findProductById(admin: SupabaseClient, id: string): Promise<StoreProductRow | null> {
  const { data, error } = await admin.from('store_products').select(PRODUCT_COLUMNS).eq('id', id).maybeSingle();
  if (error) throw error;
  return (data as StoreProductRow | null) ?? null;
}

export async function findPurchase(
  admin: SupabaseClient,
  store: Store,
  purchaseKey: string,
): Promise<StorePurchaseRow | null> {
  const { data, error } = await admin
    .from('store_purchases')
    .select('*')
    .eq('store', store)
    .eq('purchase_key', purchaseKey)
    .maybeSingle();
  if (error) throw error;
  return (data as StorePurchaseRow | null) ?? null;
}

export async function userExists(admin: SupabaseClient, userId: string): Promise<boolean> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) return false;
  const { data, error } = await admin.auth.admin.getUserById(userId);
  return !error && Boolean(data?.user);
}

function purchaseColumns(input: PurchaseRecordInput, now: string) {
  return {
    store_product_id: input.product.id,
    product_id: input.productId,
    transaction_id: input.transactionId,
    original_transaction_id: input.originalTransactionId,
    linked_purchase_token: input.linkedPurchaseToken,
    status: input.state.status,
    auto_renew: input.state.autoRenew,
    environment: input.environment,
    purchased_at: input.state.purchasedAt,
    expires_at: input.state.expiresAt,
    cancelled_at: input.state.cancelledAt,
    refunded_at: input.state.refundedAt,
    acknowledged: input.acknowledged,
    last_verified_at: now,
    last_event: input.event,
  };
}

/**
 * Guarda la compra sin cambiar nunca de dueño: una compra (token de Google o
 * transacción original de Apple) pertenece a la primera cuenta que la registra.
 */
export async function savePurchase(admin: SupabaseClient, input: PurchaseRecordInput): Promise<SaveResult> {
  const now = new Date().toISOString();
  const previous = await findPurchase(admin, input.store, input.purchaseKey);

  if (previous && previous.user_id !== input.userId) return { kind: 'conflict', owner: previous };

  if (previous) {
    const { data, error } = await admin
      .from('store_purchases')
      .update(purchaseColumns(input, now))
      .eq('id', previous.id)
      .eq('user_id', input.userId)
      .select('*')
      .single();
    if (error) throw error;
    return { kind: 'saved', purchase: data as StorePurchaseRow, previous };
  }

  const { data, error } = await admin
    .from('store_purchases')
    .insert({
      ...purchaseColumns(input, now),
      user_id: input.userId,
      platform: input.platform,
      store: input.store,
      purchase_key: input.purchaseKey,
    })
    .select('*')
    .single();

  if (error?.code === UNIQUE_VIOLATION) {
    // Otra petición la registró a la vez: se decide con la fila ganadora.
    const winner = await findPurchase(admin, input.store, input.purchaseKey);
    if (!winner) throw error;
    if (winner.user_id !== input.userId) return { kind: 'conflict', owner: winner };
    return savePurchase(admin, input);
  }
  if (error) throw error;
  return { kind: 'saved', purchase: data as StorePurchaseRow, previous: null };
}

/** Actualiza el estado de una compra ya registrada (renovaciones, reembolsos, caducidad). */
export async function updatePurchaseState(
  admin: SupabaseClient,
  purchase: StorePurchaseRow,
  state: PurchaseState,
  event: string,
  extra: Partial<Pick<StorePurchaseRow, 'transaction_id' | 'linked_purchase_token' | 'acknowledged'>> = {},
): Promise<StorePurchaseRow> {
  const { data, error } = await admin
    .from('store_purchases')
    .update({
      status: state.status,
      auto_renew: state.autoRenew,
      purchased_at: state.purchasedAt ?? purchase.purchased_at,
      expires_at: state.expiresAt,
      cancelled_at: state.cancelledAt ?? purchase.cancelled_at,
      refunded_at: state.refundedAt ?? purchase.refunded_at,
      last_verified_at: new Date().toISOString(),
      last_event: event,
      ...extra,
    })
    .eq('id', purchase.id)
    .select('*')
    .single();
  if (error) throw error;
  return data as StorePurchaseRow;
}

export async function markAcknowledged(admin: SupabaseClient, purchaseId: string): Promise<void> {
  const { error } = await admin.from('store_purchases').update({ acknowledged: true }).eq('id', purchaseId);
  if (error) throw error;
}

/** Refleja la compra en el derecho de acceso (una fila por compra). */
export async function syncEntitlement(admin: SupabaseClient, purchase: StorePurchaseRow): Promise<void> {
  if (!purchase.store_product_id) return;
  const { error } = await admin.from('user_entitlements').upsert(
    {
      user_id: purchase.user_id,
      store_product_id: purchase.store_product_id,
      source: purchase.store,
      store_purchase_id: purchase.id,
      status: entitlementStatusFor(purchase.status),
      starts_at: purchase.purchased_at ?? new Date().toISOString(),
      expires_at: purchase.expires_at,
    },
    { onConflict: 'store_purchase_id' },
  );
  if (error) throw error;
}

export async function purchasesToRefresh(
  admin: SupabaseClient,
  userId: string,
  limit: number,
): Promise<StorePurchaseRow[]> {
  const staleBefore = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
  const soon = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await admin
    .from('store_purchases')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['active', 'grace_period', 'on_hold', 'paused', 'pending'])
    .or(`last_verified_at.is.null,last_verified_at.lt.${staleBefore},expires_at.lt.${soon}`)
    .order('expires_at', { ascending: true, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return (data as StorePurchaseRow[] | null) ?? [];
}

/** Una fila por programación desbloqueada, igual que la función `my_program_entitlements()`. */
export interface EntitlementSnapshot {
  programId: string;
  storeProductId: string;
  productKey: string | null;
  source: string;
  expiresAt: string | null;
}

export interface PurchaseSummary {
  id: string;
  productKey: string | null;
  title: string | null;
  productType: ProductType | null;
  platform: Platform;
  store: Store;
  productId: string;
  status: PurchaseStatus;
  autoRenew: boolean | null;
  environment: PurchaseEnvironment;
  purchasedAt: string | null;
  expiresAt: string | null;
  cancelledAt: string | null;
  refundedAt: string | null;
}

/** Lo que la app puede ver de sus compras: nunca los tokens. */
export async function userSnapshot(admin: SupabaseClient, userId: string) {
  const [entitlementsResult, purchasesResult] = await Promise.all([
    admin
      .from('user_entitlements')
      .select('store_product_id, source, status, expires_at, store_products(product_key, store_product_programs(program_id))')
      .eq('user_id', userId)
      .eq('status', 'active'),
    admin
      .from('store_purchases')
      .select(
        'id, platform, store, product_id, status, auto_renew, environment, purchased_at, expires_at, cancelled_at, refunded_at, store_products(product_key, title, product_type)',
      )
      .eq('user_id', userId)
      .order('purchased_at', { ascending: false }),
  ]);
  if (entitlementsResult.error) throw entitlementsResult.error;
  if (purchasesResult.error) throw purchasesResult.error;

  const now = Date.now();
  type ProductJoin = { product_key: string; store_product_programs?: Array<{ program_id: string }> } | null;
  const entitlements: EntitlementSnapshot[] = (entitlementsResult.data ?? [])
    .filter((row) => !row.expires_at || Date.parse(row.expires_at) > now)
    .flatMap((row) => {
      const product = row.store_products as unknown as ProductJoin;
      return (product?.store_product_programs ?? []).map((link) => ({
        programId: link.program_id,
        storeProductId: row.store_product_id as string,
        productKey: product?.product_key ?? null,
        source: row.source as string,
        expiresAt: (row.expires_at as string | null) ?? null,
      }));
    });

  type PurchaseProductJoin = { product_key: string; title: string; product_type: ProductType } | null;
  const purchases: PurchaseSummary[] = (purchasesResult.data ?? []).map((row) => {
    const product = row.store_products as unknown as PurchaseProductJoin;
    return {
      id: row.id as string,
      productKey: product?.product_key ?? null,
      title: product?.title ?? null,
      productType: product?.product_type ?? null,
      platform: row.platform as Platform,
      store: row.store as Store,
      productId: row.product_id as string,
      status: row.status as PurchaseStatus,
      autoRenew: (row.auto_renew as boolean | null) ?? null,
      environment: row.environment as PurchaseEnvironment,
      purchasedAt: (row.purchased_at as string | null) ?? null,
      expiresAt: (row.expires_at as string | null) ?? null,
      cancelledAt: (row.cancelled_at as string | null) ?? null,
      refundedAt: (row.refunded_at as string | null) ?? null,
    };
  });

  return { entitlements, purchases };
}

// ---------------------------------------------------------------------------
// Registro de notificaciones (idempotencia de webhooks)
// ---------------------------------------------------------------------------

export interface NotificationMeta {
  store: Store;
  notificationId: string;
  notificationType: string;
  subtype?: string | null;
  environment?: string | null;
  purchaseKey?: string | null;
  payload: unknown;
}

/** Devuelve el id del registro, o null si ya se procesó (reintento del proveedor). */
export async function beginNotification(admin: SupabaseClient, meta: NotificationMeta): Promise<string | null> {
  const { data, error } = await admin
    .from('store_notifications')
    .insert({
      store: meta.store,
      notification_id: meta.notificationId,
      notification_type: meta.notificationType,
      subtype: meta.subtype ?? null,
      environment: meta.environment ?? null,
      purchase_key: meta.purchaseKey ?? null,
      payload: meta.payload,
      status: 'received',
    })
    .select('id')
    .single();

  if (!error) return (data as { id: string }).id;
  if (error.code !== UNIQUE_VIOLATION) throw error;

  const { data: existing, error: readError } = await admin
    .from('store_notifications')
    .select('id, status')
    .eq('store', meta.store)
    .eq('notification_id', meta.notificationId)
    .single();
  if (readError) throw readError;
  const row = existing as { id: string; status: string };
  return row.status === 'processed' || row.status === 'ignored' ? null : row.id;
}

export async function finishNotification(
  admin: SupabaseClient,
  id: string,
  status: 'processed' | 'ignored' | 'failed',
  errorMessage: string | null = null,
): Promise<void> {
  const { error } = await admin
    .from('store_notifications')
    .update({ status, error: errorMessage, processed_at: new Date().toISOString() })
    .eq('id', id);
  if (error) console.error('No se pudo cerrar la notificación', error.message);
}
