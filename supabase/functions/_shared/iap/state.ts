/**
 * Traducción de las respuestas de Google Play y App Store a un estado común.
 * Sin dependencias ni red: lo usan la verificación, las notificaciones y las pruebas.
 */

export type ProductType = 'non_consumable' | 'subscription';

export type PurchaseStatus =
  | 'pending'
  | 'active'
  | 'grace_period'
  | 'on_hold'
  | 'paused'
  | 'expired'
  | 'cancelled'
  | 'refunded'
  | 'revoked';

export type EntitlementStatus = 'active' | 'pending' | 'expired' | 'refunded' | 'revoked';

export interface PurchaseState {
  status: PurchaseStatus;
  autoRenew: boolean | null;
  purchasedAt: string | null;
  expiresAt: string | null;
  cancelledAt: string | null;
  refundedAt: string | null;
}

/** Respuesta que la app pasa a `createPurchaseFlow` de expo-iap. */
export type PurchaseConfirmation =
  | { status: 'entitled'; alreadyGranted: boolean }
  | { status: 'store_pending' }
  | { status: 'verification_delayed'; retryAfterMs: number }
  | { status: 'ownership_conflict'; alreadyGranted: boolean }
  | { status: 'test_account_restricted' }
  | { status: 'invalid'; reason: string };

function isoFromMillis(value: number | string | null | undefined): string | null {
  const millis = typeof value === 'string' ? Number(value) : value;
  return typeof millis === 'number' && Number.isFinite(millis) && millis > 0 ? new Date(millis).toISOString() : null;
}

function isoFromRfc3339(value: string | null | undefined): string | null {
  if (!value) return null;
  const millis = Date.parse(value);
  return Number.isFinite(millis) ? new Date(millis).toISOString() : null;
}

function isFuture(iso: string | null, now: Date) {
  return iso !== null && Date.parse(iso) > now.getTime();
}

/** Solo da acceso una compra activa o en periodo de gracia que no haya caducado. */
export function grantsAccess(status: PurchaseStatus, expiresAt: string | null, now = new Date()): boolean {
  if (status !== 'active' && status !== 'grace_period') return false;
  return expiresAt === null || isFuture(expiresAt, now);
}

export function entitlementStatusFor(status: PurchaseStatus): EntitlementStatus {
  switch (status) {
    case 'active':
    case 'grace_period':
      return 'active';
    case 'pending':
      return 'pending';
    case 'refunded':
      return 'refunded';
    case 'revoked':
      return 'revoked';
    default:
      return 'expired';
  }
}

export function confirmationForState(
  state: PurchaseState,
  alreadyGranted: boolean,
  now = new Date(),
): PurchaseConfirmation {
  if (state.status === 'pending') return { status: 'store_pending' };
  if (grantsAccess(state.status, state.expiresAt, now)) return { status: 'entitled', alreadyGranted };
  return { status: 'invalid', reason: state.status };
}

/** La cuenta que figura en la compra (obfuscatedAccountId / appAccountToken) no es la que la presenta. */
export function belongsToAnotherAccount(claimedAccountId: string | null | undefined, userId: string): boolean {
  if (!claimedAccountId) return false;
  return claimedAccountId.trim().toLowerCase() !== userId.trim().toLowerCase();
}

// ---------------------------------------------------------------------------
// Google Play
// ---------------------------------------------------------------------------

/** purchases.products.get (compra única). */
export interface GoogleProductPurchase {
  purchaseState?: number;
  purchaseTimeMillis?: string;
  orderId?: string;
  acknowledgementState?: number;
  consumptionState?: number;
  purchaseType?: number;
  obfuscatedExternalAccountId?: string;
  productId?: string;
  quantity?: number;
}

/** purchases.subscriptionsv2.get */
export interface GoogleSubscriptionPurchase {
  subscriptionState?: string;
  startTime?: string;
  latestOrderId?: string;
  linkedPurchaseToken?: string;
  acknowledgementState?: string;
  testPurchase?: Record<string, unknown>;
  externalAccountIdentifiers?: { obfuscatedExternalAccountId?: string };
  canceledStateContext?: {
    userInitiatedCancellation?: { cancelTime?: string };
    systemInitiatedCancellation?: Record<string, unknown>;
    developerInitiatedCancellation?: Record<string, unknown>;
    replacementCancellation?: Record<string, unknown>;
  };
  lineItems?: Array<{
    productId?: string;
    expiryTime?: string;
    autoRenewingPlan?: { autoRenewEnabled?: boolean };
    prepaidPlan?: Record<string, unknown>;
    offerDetails?: { basePlanId?: string; offerId?: string };
    latestSuccessfulOrderId?: string;
  }>;
}

export function googleProductState(purchase: GoogleProductPurchase): PurchaseState {
  const status: PurchaseStatus =
    purchase.purchaseState === 0 ? 'active' : purchase.purchaseState === 1 ? 'cancelled' : 'pending';
  return {
    status,
    autoRenew: null,
    purchasedAt: isoFromMillis(purchase.purchaseTimeMillis),
    expiresAt: null,
    cancelledAt: null,
    refundedAt: null,
  };
}

export function googleSubscriptionLineItem(purchase: GoogleSubscriptionPurchase, productId: string) {
  return purchase.lineItems?.find((item) => item.productId === productId) ?? purchase.lineItems?.[0];
}

export function googleSubscriptionState(
  purchase: GoogleSubscriptionPurchase,
  productId: string,
  now = new Date(),
): PurchaseState {
  const item = googleSubscriptionLineItem(purchase, productId);
  const expiresAt = isoFromRfc3339(item?.expiryTime);
  const autoRenew = item?.autoRenewingPlan ? item.autoRenewingPlan.autoRenewEnabled === true : null;
  const stillPaid = expiresAt === null || isFuture(expiresAt, now);

  let status: PurchaseStatus;
  switch (purchase.subscriptionState) {
    case 'SUBSCRIPTION_STATE_ACTIVE':
      status = 'active';
      break;
    case 'SUBSCRIPTION_STATE_IN_GRACE_PERIOD':
      status = 'grace_period';
      break;
    case 'SUBSCRIPTION_STATE_ON_HOLD':
      status = 'on_hold';
      break;
    case 'SUBSCRIPTION_STATE_PAUSED':
      status = 'paused';
      break;
    case 'SUBSCRIPTION_STATE_CANCELED':
      // Cancelada por el usuario: conserva el acceso hasta el final del periodo pagado.
      status = stillPaid ? 'active' : 'expired';
      break;
    case 'SUBSCRIPTION_STATE_EXPIRED':
      status = 'expired';
      break;
    case 'SUBSCRIPTION_STATE_PENDING_PURCHASE_CANCELED':
      status = 'cancelled';
      break;
    default:
      status = 'pending';
  }

  const cancelled = purchase.subscriptionState === 'SUBSCRIPTION_STATE_CANCELED';
  return {
    status,
    autoRenew: cancelled ? false : autoRenew,
    purchasedAt: isoFromRfc3339(purchase.startTime),
    expiresAt,
    cancelledAt: isoFromRfc3339(purchase.canceledStateContext?.userInitiatedCancellation?.cancelTime) ??
      (cancelled ? now.toISOString() : null),
    refundedAt: null,
  };
}

export function isGoogleTestPurchase(
  purchase: GoogleProductPurchase | GoogleSubscriptionPurchase,
  productType: ProductType,
): boolean {
  if (productType === 'subscription') return Boolean((purchase as GoogleSubscriptionPurchase).testPurchase);
  return (purchase as GoogleProductPurchase).purchaseType === 0;
}

export function isGoogleAcknowledged(
  purchase: GoogleProductPurchase | GoogleSubscriptionPurchase,
  productType: ProductType,
): boolean {
  if (productType === 'subscription') {
    return (purchase as GoogleSubscriptionPurchase).acknowledgementState === 'ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED';
  }
  return (purchase as GoogleProductPurchase).acknowledgementState === 1;
}

// ---------------------------------------------------------------------------
// App Store
// ---------------------------------------------------------------------------

export interface AppleTransaction {
  transactionId: string;
  originalTransactionId: string;
  bundleId: string;
  productId: string;
  type?: string;
  purchaseDate?: number;
  originalPurchaseDate?: number;
  expiresDate?: number;
  appAccountToken?: string;
  environment?: string;
  revocationDate?: number;
  revocationReason?: number;
  inAppOwnershipType?: string;
  isUpgraded?: boolean;
  signedDate?: number;
}

export interface AppleRenewalInfo {
  originalTransactionId?: string;
  productId?: string;
  autoRenewProductId?: string;
  autoRenewStatus?: number;
  isInBillingRetryPeriod?: boolean;
  gracePeriodExpiresDate?: number;
  expirationIntent?: number;
  renewalDate?: number;
  signedDate?: number;
}

export const APPLE_TYPE_NON_CONSUMABLE = 'Non-Consumable';
export const APPLE_TYPE_AUTO_RENEWABLE = 'Auto-Renewable Subscription';

export function appleProductType(transaction: AppleTransaction): ProductType | null {
  if (transaction.type === APPLE_TYPE_NON_CONSUMABLE) return 'non_consumable';
  if (transaction.type === APPLE_TYPE_AUTO_RENEWABLE) return 'subscription';
  return null;
}

/**
 * `subscriptionStatus` es el campo `status` de la API de suscripciones o de la
 * notificación V2 (1 activa, 2 caducada, 3 reintento de cobro, 4 periodo de gracia,
 * 5 revocada). Sin él, el estado sale de las fechas de la propia transacción.
 */
export function appleTransactionState(
  transaction: AppleTransaction,
  renewal: AppleRenewalInfo | null,
  subscriptionStatus: number | null,
  now = new Date(),
): PurchaseState {
  const purchasedAt = isoFromMillis(transaction.originalPurchaseDate ?? transaction.purchaseDate);
  const base: PurchaseState = {
    status: 'active',
    autoRenew: null,
    purchasedAt,
    expiresAt: null,
    cancelledAt: null,
    refundedAt: null,
  };

  if (transaction.revocationDate) {
    return { ...base, status: 'refunded', refundedAt: isoFromMillis(transaction.revocationDate) };
  }

  if (appleProductType(transaction) !== 'subscription') return base;

  const transactionExpiry = isoFromMillis(transaction.expiresDate);
  const graceExpiry = isoFromMillis(renewal?.gracePeriodExpiresDate);
  const autoRenew = renewal ? renewal.autoRenewStatus === 1 : null;
  const withRenewal = { ...base, autoRenew, expiresAt: transactionExpiry };

  if (transaction.isUpgraded) return { ...withRenewal, status: 'expired', autoRenew: false };

  switch (subscriptionStatus) {
    case 1:
      return { ...withRenewal, status: 'active' };
    case 2:
      return { ...withRenewal, status: 'expired' };
    case 3:
      return { ...withRenewal, status: 'on_hold' };
    case 4:
      return { ...withRenewal, status: 'grace_period', expiresAt: graceExpiry ?? transactionExpiry };
    case 5:
      return { ...withRenewal, status: 'revoked' };
    default:
      break;
  }

  if (isFuture(transactionExpiry, now)) return { ...withRenewal, status: 'active' };
  if (isFuture(graceExpiry, now)) return { ...withRenewal, status: 'grace_period', expiresAt: graceExpiry };
  if (renewal?.isInBillingRetryPeriod) return { ...withRenewal, status: 'on_hold' };
  return { ...withRenewal, status: 'expired' };
}

export function appleEnvironment(transaction: { environment?: string }): 'production' | 'sandbox' | 'xcode' {
  if (transaction.environment === 'Production') return 'production';
  if (transaction.environment === 'Xcode' || transaction.environment === 'LocalTesting') return 'xcode';
  return 'sandbox';
}

// ---------------------------------------------------------------------------
// Notificaciones
// ---------------------------------------------------------------------------

/** Google RTDN: tipos de subscriptionNotification que no se resuelven solo consultando la API. */
export const GOOGLE_SUBSCRIPTION_REVOKED = 12;

/** Ajusta el estado consultado con lo que la notificación de Apple deja claro. */
export function applyAppleNotification(
  state: PurchaseState,
  notificationType: string,
  now = new Date(),
): PurchaseState {
  switch (notificationType) {
    case 'REFUND':
      return { ...state, status: 'refunded', refundedAt: state.refundedAt ?? now.toISOString() };
    case 'REVOKE':
      return { ...state, status: 'revoked', refundedAt: state.refundedAt ?? now.toISOString() };
    default:
      return state;
  }
}
