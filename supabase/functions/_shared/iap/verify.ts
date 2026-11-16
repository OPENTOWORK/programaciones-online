import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { AppleSignatureError, peekJwsPayload, verifyAppleJws } from './appleJws.ts';
import { AppleApiError, getAllSubscriptionStatuses, getTransactionInfo } from './appleServerApi.ts';
import type { IapConfig } from './config.ts';
import { acknowledgePurchase, getProductPurchase, getSubscriptionPurchase, GooglePlayError } from './googlePlay.ts';
import {
  findPurchase,
  markAcknowledged,
  savePurchase,
  syncEntitlement,
  updatePurchaseState,
  userExists,
  type PurchaseEnvironment,
  type StoreProductRow,
  type StorePurchaseRow,
} from './repository.ts';
import {
  appleEnvironment,
  appleProductType,
  appleTransactionState,
  belongsToAnotherAccount,
  confirmationForState,
  googleProductState,
  googleSubscriptionLineItem,
  googleSubscriptionState,
  grantsAccess,
  isGoogleAcknowledged,
  isGoogleTestPurchase,
  type AppleRenewalInfo,
  type AppleTransaction,
  type ProductType,
  type PurchaseConfirmation,
  type PurchaseState,
} from './state.ts';

export interface VerifyContext {
  admin: SupabaseClient;
  config: IapConfig;
}

export interface ConfirmRequest {
  store: 'google' | 'apple';
  productId: string;
  /** Google: purchaseToken. Apple: JWS de la transacción (StoreKit 2). */
  purchaseToken: string;
}

export interface ConfirmResult {
  confirmation: PurchaseConfirmation;
  purchase: StorePurchaseRow | null;
}

const RETRY_NETWORK_MS = 30_000;
/** Falta configurar credenciales en el servidor: la app reintenta más tarde sin perder la compra. */
const RETRY_CONFIGURATION_MS = 10 * 60_000;
/** El dispositivo reconoce la compra al confirmarla; el servidor solo lo hace si no ocurrió. */
const SERVER_ACK_AFTER_MS = 10 * 60_000;

const delayed = (retryAfterMs: number): ConfirmResult => ({
  confirmation: { status: 'verification_delayed', retryAfterMs },
  purchase: null,
});
const invalid = (reason: string): ConfirmResult => ({ confirmation: { status: 'invalid', reason }, purchase: null });
const conflict = (alreadyGranted: boolean, purchase: StorePurchaseRow | null = null): ConfirmResult => ({
  confirmation: { status: 'ownership_conflict', alreadyGranted },
  purchase,
});
const testRestricted = (): ConfirmResult => ({ confirmation: { status: 'test_account_restricted' }, purchase: null });

/**
 * Dueño de la compra: la cuenta que figura en ella (la app la envía al comprar) o,
 * si no figura ninguna, la que la presenta. Null si figura una cuenta inexistente.
 */
async function resolveOwner(admin: SupabaseClient, claimedAccountId: string | null, userId: string) {
  if (!belongsToAnotherAccount(claimedAccountId, userId)) return userId;
  return (await userExists(admin, claimedAccountId!)) ? claimedAccountId!.toLowerCase() : null;
}

async function findProducts(admin: SupabaseClient, column: 'google_product_id' | 'apple_product_id', id: string) {
  const { data, error } = await admin
    .from('store_products')
    .select('id, product_key, title, product_type, google_product_id, google_base_plan_id, apple_product_id, active')
    .eq(column, id);
  if (error) throw error;
  return (data as StoreProductRow[] | null) ?? [];
}

/** Un producto de suscripción de Google puede tener varios planes base (mensual, anual...). */
export function pickGoogleProduct(candidates: StoreProductRow[], basePlanId: string | null): StoreProductRow | null {
  if (!candidates.length) return null;
  return (
    candidates.find((product) => basePlanId && product.google_base_plan_id === basePlanId) ??
    candidates.find((product) => !product.google_base_plan_id) ??
    candidates[0]
  );
}

// ---------------------------------------------------------------------------
// Google Play
// ---------------------------------------------------------------------------

interface GoogleVerified {
  state: PurchaseState;
  claimedAccountId: string | null;
  orderId: string | null;
  basePlanId: string | null;
  linkedPurchaseToken: string | null;
  acknowledged: boolean;
  test: boolean;
}

async function fetchGooglePurchase(
  config: IapConfig,
  productType: ProductType,
  productId: string,
  purchaseToken: string,
): Promise<GoogleVerified> {
  const account = config.googleServiceAccount!;
  if (productType === 'subscription') {
    const purchase = await getSubscriptionPurchase(account, config.androidPackageName, purchaseToken);
    const item = googleSubscriptionLineItem(purchase, productId);
    if (!item || item.productId !== productId) {
      throw new GooglePlayError('La suscripción no corresponde al producto', 'invalid');
    }
    return {
      state: googleSubscriptionState(purchase, productId),
      claimedAccountId: purchase.externalAccountIdentifiers?.obfuscatedExternalAccountId ?? null,
      orderId: item.latestSuccessfulOrderId ?? purchase.latestOrderId ?? null,
      basePlanId: item.offerDetails?.basePlanId ?? null,
      linkedPurchaseToken: purchase.linkedPurchaseToken ?? null,
      acknowledged: isGoogleAcknowledged(purchase, 'subscription'),
      test: isGoogleTestPurchase(purchase, 'subscription'),
    };
  }

  const purchase = await getProductPurchase(account, config.androidPackageName, productId, purchaseToken);
  return {
    state: googleProductState(purchase),
    claimedAccountId: purchase.obfuscatedExternalAccountId ?? null,
    orderId: purchase.orderId ?? null,
    basePlanId: null,
    linkedPurchaseToken: null,
    acknowledged: isGoogleAcknowledged(purchase, 'non_consumable'),
    test: isGoogleTestPurchase(purchase, 'non_consumable'),
  };
}

/** Una suscripción nueva que sustituye a otra (cambio de plan, resuscripción) deja la anterior sin efecto. */
async function retireLinkedPurchase(ctx: VerifyContext, linkedToken: string, userId: string) {
  const linked = await findPurchase(ctx.admin, 'google_play', linkedToken);
  if (!linked || linked.user_id !== userId || linked.status === 'expired') return;
  const retired = await updatePurchaseState(
    ctx.admin,
    linked,
    {
      status: 'expired',
      autoRenew: false,
      purchasedAt: linked.purchased_at,
      expiresAt: new Date().toISOString(),
      cancelledAt: linked.cancelled_at,
      refundedAt: linked.refunded_at,
    },
    'replaced',
  );
  await syncEntitlement(ctx.admin, retired);
}

/** Red de seguridad: Google reembolsa a los 3 días las compras sin reconocer. */
async function acknowledgeIfForgotten(ctx: VerifyContext, purchase: StorePurchaseRow, productType: ProductType) {
  if (purchase.acknowledged || !grantsAccess(purchase.status, purchase.expires_at)) return;
  const purchasedAt = purchase.purchased_at ? Date.parse(purchase.purchased_at) : Date.now();
  if (Date.now() - purchasedAt < SERVER_ACK_AFTER_MS) return;
  try {
    await acknowledgePurchase(
      ctx.config.googleServiceAccount!,
      ctx.config.androidPackageName,
      productType,
      purchase.product_id,
      purchase.purchase_key,
    );
    await markAcknowledged(ctx.admin, purchase.id);
  } catch (error) {
    console.error('No se pudo reconocer la compra en Google Play', (error as Error).message);
  }
}

async function confirmGoogle(ctx: VerifyContext, userId: string, request: ConfirmRequest): Promise<ConfirmResult> {
  const candidates = await findProducts(ctx.admin, 'google_product_id', request.productId);
  if (!candidates.length) return invalid('unknown_product');
  if (!ctx.config.googleServiceAccount) {
    console.error('Falta GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: la compra queda pendiente de verificar');
    return delayed(RETRY_CONFIGURATION_MS);
  }

  const existing = await findPurchase(ctx.admin, 'google_play', request.purchaseToken);
  if (existing && existing.user_id !== userId) return conflict(true);

  let verified: GoogleVerified;
  try {
    verified = await fetchGooglePurchase(ctx.config, candidates[0].product_type, request.productId, request.purchaseToken);
  } catch (error) {
    if (error instanceof GooglePlayError) {
      return error.kind === 'invalid' ? invalid('not_found') : delayed(RETRY_NETWORK_MS);
    }
    throw error;
  }

  if (verified.test && !ctx.config.allowTestPurchases) return testRestricted();
  const product = pickGoogleProduct(candidates, verified.basePlanId)!;
  const owner = await resolveOwner(ctx.admin, verified.claimedAccountId, userId);
  if (!owner) return invalid('account_mismatch');

  const saved = await savePurchase(ctx.admin, {
    userId: owner,
    product,
    store: 'google_play',
    platform: 'android',
    productId: request.productId,
    purchaseKey: request.purchaseToken,
    transactionId: verified.orderId,
    originalTransactionId: verified.orderId?.replace(/\.\.\d+$/, '') ?? null,
    linkedPurchaseToken: verified.linkedPurchaseToken,
    environment: verified.test ? 'sandbox' : 'production',
    acknowledged: verified.acknowledged,
    state: verified.state,
    event: 'app_confirm',
  });
  if (saved.kind === 'conflict') return conflict(true);

  await syncEntitlement(ctx.admin, saved.purchase);
  if (verified.linkedPurchaseToken) await retireLinkedPurchase(ctx, verified.linkedPurchaseToken, owner);

  // La compra se hizo desde otra cuenta de la app: es suya, no de quien la presenta.
  if (owner !== userId) return conflict(true, saved.purchase);

  const alreadyGranted = Boolean(saved.previous && grantsAccess(saved.previous.status, saved.previous.expires_at));
  return { confirmation: confirmationForState(verified.state, alreadyGranted), purchase: saved.purchase };
}

export interface GoogleRefreshInput {
  purchaseToken: string;
  productId: string;
  productType: ProductType;
  event: string;
  /** Estado que impone la notificación (revocada, reembolsada). */
  forcedStatus?: 'revoked' | 'refunded';
}

/** Vuelve a consultar Google y actualiza la compra; si no existe, la vincula a su cuenta. */
export async function refreshGooglePurchase(ctx: VerifyContext, input: GoogleRefreshInput) {
  if (!ctx.config.googleServiceAccount) throw new GooglePlayError('Falta GOOGLE_PLAY_SERVICE_ACCOUNT_JSON', 'retry');

  const existing = await findPurchase(ctx.admin, 'google_play', input.purchaseToken);
  const verified = await fetchGooglePurchase(ctx.config, input.productType, input.productId, input.purchaseToken);
  const state: PurchaseState = input.forcedStatus
    ? {
      ...verified.state,
      status: input.forcedStatus,
      refundedAt: verified.state.refundedAt ?? new Date().toISOString(),
    }
    : verified.state;

  let purchase: StorePurchaseRow;
  if (existing) {
    purchase = await updatePurchaseState(ctx.admin, existing, state, input.event, {
      transaction_id: verified.orderId ?? existing.transaction_id,
      linked_purchase_token: verified.linkedPurchaseToken ?? existing.linked_purchase_token,
      acknowledged: verified.acknowledged || existing.acknowledged,
    });
  } else {
    const candidates = await findProducts(ctx.admin, 'google_product_id', input.productId);
    const product = pickGoogleProduct(candidates, verified.basePlanId);
    const owner = verified.claimedAccountId && (await userExists(ctx.admin, verified.claimedAccountId))
      ? verified.claimedAccountId.toLowerCase()
      : null;
    // Sin cuenta conocida, la app la confirmará al abrirse con la sesión del comprador.
    if (!product || !owner) return null;
    if (verified.test && !ctx.config.allowTestPurchases) return null;
    const saved = await savePurchase(ctx.admin, {
      userId: owner,
      product,
      store: 'google_play',
      platform: 'android',
      productId: input.productId,
      purchaseKey: input.purchaseToken,
      transactionId: verified.orderId,
      originalTransactionId: verified.orderId?.replace(/\.\.\d+$/, '') ?? null,
      linkedPurchaseToken: verified.linkedPurchaseToken,
      environment: verified.test ? 'sandbox' : 'production',
      acknowledged: verified.acknowledged,
      state,
      event: input.event,
    });
    if (saved.kind === 'conflict') return null;
    purchase = saved.purchase;
  }

  await syncEntitlement(ctx.admin, purchase);
  if (verified.linkedPurchaseToken) await retireLinkedPurchase(ctx, verified.linkedPurchaseToken, purchase.user_id);
  await acknowledgeIfForgotten(ctx, purchase, input.productType);
  return purchase;
}

/** Reembolso o anulación notificada por Google (voidedPurchaseNotification). */
export async function markGooglePurchaseVoided(ctx: VerifyContext, purchaseToken: string, event: string) {
  const existing = await findPurchase(ctx.admin, 'google_play', purchaseToken);
  if (!existing) return null;
  const purchase = await updatePurchaseState(
    ctx.admin,
    existing,
    {
      status: 'refunded',
      autoRenew: false,
      purchasedAt: existing.purchased_at,
      expiresAt: existing.expires_at,
      cancelledAt: existing.cancelled_at,
      refundedAt: new Date().toISOString(),
    },
    event,
  );
  await syncEntitlement(ctx.admin, purchase);
  return purchase;
}

// ---------------------------------------------------------------------------
// App Store
// ---------------------------------------------------------------------------

/** Verifica la firma; las transacciones de StoreKit Testing (Xcode) solo pasan si se permite expresamente. */
async function verifyAppleTransaction(config: IapConfig, jws: string): Promise<AppleTransaction | null> {
  try {
    return await verifyAppleJws<AppleTransaction>(jws, { trustedRoots: config.appleRootCertificates });
  } catch (error) {
    if (!(error instanceof AppleSignatureError)) throw error;
    const unverified = peekJwsPayload<AppleTransaction>(jws);
    if (config.allowXcodeTransactions && unverified && appleEnvironment(unverified) === 'xcode') return unverified;
    console.error('Transacción de Apple rechazada:', error.message);
    return null;
  }
}

function appleApiEnvironment(transaction: AppleTransaction): 'production' | 'sandbox' | null {
  const environment = appleEnvironment(transaction);
  return environment === 'xcode' ? null : environment;
}

/** Estado vigente según la App Store Server API; sin credenciales, según la transacción firmada. */
async function appleCurrentState(
  config: IapConfig,
  transaction: AppleTransaction,
  productType: ProductType,
): Promise<{ latest: AppleTransaction; state: PurchaseState }> {
  const environment = appleApiEnvironment(transaction);
  const trust = { trustedRoots: config.appleRootCertificates };
  if (config.apple && environment) {
    try {
      if (productType === 'subscription') {
        const statuses = await getAllSubscriptionStatuses(
          config.apple,
          config.iosBundleId,
          environment,
          transaction.originalTransactionId,
        );
        for (const group of statuses.data ?? []) {
          for (const last of group.lastTransactions ?? []) {
            if (last.originalTransactionId !== transaction.originalTransactionId || !last.signedTransactionInfo) continue;
            const latest = await verifyAppleJws<AppleTransaction>(last.signedTransactionInfo, trust);
            const renewal = last.signedRenewalInfo
              ? await verifyAppleJws<AppleRenewalInfo>(last.signedRenewalInfo, trust)
              : null;
            return { latest, state: appleTransactionState(latest, renewal, last.status ?? null) };
          }
        }
      } else {
        const signed = await getTransactionInfo(config.apple, config.iosBundleId, environment, transaction.transactionId);
        if (signed) {
          const latest = await verifyAppleJws<AppleTransaction>(signed, trust);
          return { latest, state: appleTransactionState(latest, null, null) };
        }
      }
    } catch (error) {
      if (!(error instanceof AppleApiError) && !(error instanceof AppleSignatureError)) throw error;
      console.error('App Store Server API no disponible; se usa la transacción firmada:', error.message);
    }
  }
  return { latest: transaction, state: appleTransactionState(transaction, null, null) };
}

function appleStoredEnvironment(transaction: AppleTransaction): PurchaseEnvironment {
  return appleEnvironment(transaction) === 'production' ? 'production' : 'sandbox';
}

async function confirmApple(ctx: VerifyContext, userId: string, request: ConfirmRequest): Promise<ConfirmResult> {
  const transaction = await verifyAppleTransaction(ctx.config, request.purchaseToken);
  if (!transaction) return invalid('signature');
  if (transaction.bundleId !== ctx.config.iosBundleId) return invalid('bundle_mismatch');
  if (transaction.productId !== request.productId) return invalid('product_mismatch');

  const [product] = await findProducts(ctx.admin, 'apple_product_id', transaction.productId);
  if (!product) return invalid('unknown_product');
  if (appleProductType(transaction) !== product.product_type) return invalid('type_mismatch');
  if (appleEnvironment(transaction) !== 'production' && !ctx.config.allowTestPurchases) return testRestricted();

  const existing = await findPurchase(ctx.admin, 'app_store', transaction.originalTransactionId);
  if (existing && existing.user_id !== userId) return conflict(true);

  const owner = await resolveOwner(ctx.admin, transaction.appAccountToken ?? null, userId);
  if (!owner) return invalid('account_mismatch');

  const { latest, state } = await appleCurrentState(ctx.config, transaction, product.product_type);
  const saved = await savePurchase(ctx.admin, {
    userId: owner,
    product,
    store: 'app_store',
    platform: 'ios',
    productId: transaction.productId,
    purchaseKey: transaction.originalTransactionId,
    transactionId: latest.transactionId,
    originalTransactionId: transaction.originalTransactionId,
    linkedPurchaseToken: null,
    environment: appleStoredEnvironment(transaction),
    acknowledged: true,
    state,
    event: 'app_confirm',
  });
  if (saved.kind === 'conflict') return conflict(true);

  await syncEntitlement(ctx.admin, saved.purchase);
  if (owner !== userId) return conflict(true, saved.purchase);

  const alreadyGranted = Boolean(saved.previous && grantsAccess(saved.previous.status, saved.previous.expires_at));
  return { confirmation: confirmationForState(state, alreadyGranted), purchase: saved.purchase };
}

export interface AppleNotificationInput {
  transaction: AppleTransaction;
  renewal: AppleRenewalInfo | null;
  subscriptionStatus: number | null;
  state: PurchaseState;
  event: string;
}

/** Aplica una notificación V2 ya verificada. Devuelve null si no corresponde a ninguna cuenta. */
export async function applyAppleTransactionUpdate(ctx: VerifyContext, input: AppleNotificationInput) {
  const { transaction } = input;
  const [product] = await findProducts(ctx.admin, 'apple_product_id', transaction.productId);
  if (!product) return null;

  const existing = await findPurchase(ctx.admin, 'app_store', transaction.originalTransactionId);
  let purchase: StorePurchaseRow;
  if (existing) {
    purchase = await updatePurchaseState(ctx.admin, existing, input.state, input.event, {
      transaction_id: transaction.transactionId,
    });
  } else {
    const owner = transaction.appAccountToken && (await userExists(ctx.admin, transaction.appAccountToken))
      ? transaction.appAccountToken.toLowerCase()
      : null;
    if (!owner) return null;
    if (appleEnvironment(transaction) !== 'production' && !ctx.config.allowTestPurchases) return null;
    const saved = await savePurchase(ctx.admin, {
      userId: owner,
      product,
      store: 'app_store',
      platform: 'ios',
      productId: transaction.productId,
      purchaseKey: transaction.originalTransactionId,
      transactionId: transaction.transactionId,
      originalTransactionId: transaction.originalTransactionId,
      linkedPurchaseToken: null,
      environment: appleStoredEnvironment(transaction),
      acknowledged: true,
      state: input.state,
      event: input.event,
    });
    if (saved.kind === 'conflict') return null;
    purchase = saved.purchase;
  }

  await syncEntitlement(ctx.admin, purchase);
  return purchase;
}

// ---------------------------------------------------------------------------
// Entrada común
// ---------------------------------------------------------------------------

export function confirmPurchase(ctx: VerifyContext, userId: string, request: ConfirmRequest): Promise<ConfirmResult> {
  return request.store === 'google' ? confirmGoogle(ctx, userId, request) : confirmApple(ctx, userId, request);
}

/** Revalida una compra guardada (renovaciones o reembolsos que no llegaron por notificación). */
export async function revalidatePurchase(ctx: VerifyContext, purchase: StorePurchaseRow): Promise<void> {
  if (!purchase.store_product_id) return;
  const { data } = await ctx.admin
    .from('store_products')
    .select('product_type')
    .eq('id', purchase.store_product_id)
    .maybeSingle();
  const productType = (data as { product_type: ProductType } | null)?.product_type;
  if (!productType) return;

  if (purchase.store === 'google_play') {
    if (!ctx.config.googleServiceAccount) return;
    try {
      await refreshGooglePurchase(ctx, {
        purchaseToken: purchase.purchase_key,
        productId: purchase.product_id,
        productType,
        event: 'sync',
      });
    } catch (error) {
      if (!(error instanceof GooglePlayError)) throw error;
      // Un fallo temporal nunca quita el acceso; solo un "no existe" de Google.
      if (error.kind === 'invalid') {
        const revoked = await updatePurchaseState(
          ctx.admin,
          purchase,
          {
            status: 'revoked',
            autoRenew: false,
            purchasedAt: purchase.purchased_at,
            expiresAt: purchase.expires_at,
            cancelledAt: purchase.cancelled_at,
            refundedAt: purchase.refunded_at,
          },
          'sync_not_found',
        );
        await syncEntitlement(ctx.admin, revoked);
      }
    }
    return;
  }

  if (!ctx.config.apple || !purchase.transaction_id) return;
  const environment = purchase.environment === 'production' ? 'production' : 'sandbox';
  const reference: AppleTransaction = {
    transactionId: purchase.transaction_id,
    originalTransactionId: purchase.original_transaction_id ?? purchase.purchase_key,
    bundleId: ctx.config.iosBundleId,
    productId: purchase.product_id,
    environment: environment === 'production' ? 'Production' : 'Sandbox',
  };
  const { latest, state } = await appleCurrentState(ctx.config, reference, productType);
  // Sin respuesta de Apple, `latest` es la referencia local: no hay nada nuevo que guardar.
  if (latest === reference) return;
  const updated = await updatePurchaseState(ctx.admin, purchase, state, 'sync', {
    transaction_id: latest.transactionId,
  });
  await syncEntitlement(ctx.admin, updated);
}
