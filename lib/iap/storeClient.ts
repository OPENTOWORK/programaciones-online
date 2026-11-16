import * as Application from 'expo-application';
import type * as ExpoIap from 'expo-iap';
import type {
  Purchase,
  PurchaseConfirmation,
  PurchaseConfirmationRequest,
  PurchaseFlowStatus,
  SubscriptionOffer,
} from 'expo-iap';
import { Linking, Platform } from 'react-native';

import { parseIsoBillingPeriod } from '@/lib/iap/entitlements';
import type { BillingPeriod, StoreCatalogProduct, StoreOffer } from '@/lib/iap/types';

/**
 * Google Play Billing (Android) y StoreKit 2 (iOS) a través de expo-iap. El módulo
 * nativo se carga al usarlo: en una compilación sin él la app funciona sin tienda.
 */

type ExpoIapModule = typeof ExpoIap;

export interface StoreFlowOutcome {
  productId: string;
  status: PurchaseFlowStatus;
}

export interface StoreFlow {
  subscribe: (listener: (outcome: StoreFlowOutcome) => void) => () => void;
  /** Confirma las compras sin terminar; con `includeFinished`, todas las de la cuenta de la tienda. */
  recover: (includeFinished: boolean) => Promise<void>;
  dispose: () => void;
}

const DEFAULT_PACKAGE = 'com.trainingprogline.app';
const IOS_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';

export const STORE_PLATFORM: 'android' | 'ios' | null =
  Platform.OS === 'android' || Platform.OS === 'ios' ? Platform.OS : null;

let loadedModule: ExpoIapModule | null | undefined;

function iap(): ExpoIapModule | null {
  if (loadedModule !== undefined) return loadedModule;
  try {
    loadedModule = require('expo-iap') as ExpoIapModule;
  } catch (error) {
    console.warn('Compras integradas no disponibles en esta compilación', error);
    loadedModule = null;
  }
  return loadedModule;
}

function androidPackage() {
  return Application.applicationId ?? DEFAULT_PACKAGE;
}

export function storeProductId(product: StoreCatalogProduct): string | null {
  if (STORE_PLATFORM === 'ios') return product.appleProductId;
  if (STORE_PLATFORM === 'android') return product.googleProductId;
  return null;
}

export function storeErrorCode(error: unknown): string | undefined {
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === 'string' ? code : undefined;
}

export async function connectStore(): Promise<boolean> {
  const module = iap();
  if (!module || !STORE_PLATFORM) return false;
  try {
    return await module.initConnection();
  } catch (error) {
    console.warn('No se pudo conectar con la tienda', error);
    return false;
  }
}

export async function disconnectStore(): Promise<void> {
  try {
    await iap()?.endConnection();
  } catch {
    // La conexión ya estaba cerrada.
  }
}

function iosPeriod(unit?: string | null, count?: string | null): BillingPeriod | null {
  if (unit !== 'day' && unit !== 'week' && unit !== 'month' && unit !== 'year') return null;
  const value = Number(count ?? 1);
  return { unit, value: Number.isFinite(value) && value > 0 ? value : 1 };
}

/** El plan base de Google Play (sin ofertas promocionales): su precio es el de la renovación. */
function androidBasePlan(offers: SubscriptionOffer[], basePlanId: string | null) {
  const candidates = basePlanId ? offers.filter((offer) => offer.basePlanIdAndroid === basePlanId) : offers;
  return (
    candidates.find((offer) => (offer.pricingPhasesAndroid?.pricingPhaseList.length ?? 0) === 1) ??
    candidates[0] ??
    null
  );
}

function offerFor(product: StoreCatalogProduct, storeProduct: Record<string, unknown>): StoreOffer | null {
  const storeId = String(storeProduct.id);
  if (storeProduct.productStatusAndroid && storeProduct.productStatusAndroid !== 'ok') return null;

  if (product.productType === 'non_consumable') {
    return {
      productKey: product.productKey,
      storeProductId: storeId,
      displayPrice: String(storeProduct.displayPrice ?? ''),
      period: null,
      offerToken: null,
    };
  }

  if (STORE_PLATFORM === 'ios') {
    return {
      productKey: product.productKey,
      storeProductId: storeId,
      displayPrice: String(storeProduct.displayPrice ?? ''),
      period: iosPeriod(
        storeProduct.subscriptionPeriodUnitIOS as string | null,
        storeProduct.subscriptionPeriodNumberIOS as string | null,
      ),
      offerToken: null,
    };
  }

  const basePlan = androidBasePlan((storeProduct.subscriptionOffers as SubscriptionOffer[] | null) ?? [], product.googleBasePlanId);
  if (!basePlan?.offerTokenAndroid) return null;
  const phases = basePlan.pricingPhasesAndroid?.pricingPhaseList ?? [];
  const recurring = phases[phases.length - 1];
  return {
    productKey: product.productKey,
    storeProductId: storeId,
    displayPrice: recurring?.formattedPrice ?? basePlan.displayPrice,
    period:
      parseIsoBillingPeriod(recurring?.billingPeriod) ??
      (basePlan.period && basePlan.period.unit !== 'unknown'
        ? { unit: basePlan.period.unit, value: basePlan.period.value }
        : null),
    offerToken: basePlan.offerTokenAndroid,
  };
}

/** Precios y datos de compra de la tienda. Un producto que la tienda no devuelve no se puede comprar. */
export async function loadStoreOffers(products: StoreCatalogProduct[]): Promise<Map<string, StoreOffer>> {
  const offers = new Map<string, StoreOffer>();
  const module = iap();
  if (!module) return offers;

  for (const type of ['in-app', 'subs'] as const) {
    const wanted = products.filter(
      (product) => (product.productType === 'subscription') === (type === 'subs') && storeProductId(product),
    );
    if (!wanted.length) continue;

    try {
      const skus = [...new Set(wanted.map((product) => storeProductId(product)!))];
      const results = ((await module.fetchProducts({ skus, type })) ?? []) as unknown as Record<string, unknown>[];
      for (const product of wanted) {
        const storeProduct = results.find((item) => item.id === storeProductId(product));
        const offer = storeProduct ? offerFor(product, storeProduct) : null;
        if (offer?.displayPrice) offers.set(product.productKey, offer);
      }
    } catch (error) {
      console.warn('No se pudieron cargar los productos de la tienda', error);
    }
  }
  return offers;
}

/** Abre la hoja de pago de la tienda. La compra llega después por el flujo de compras. */
export async function startStorePurchase(product: StoreCatalogProduct, offer: StoreOffer, userId: string) {
  const module = iap();
  const sku = storeProductId(product);
  if (!module || !sku) throw Object.assign(new Error('Tienda no disponible'), { code: 'iap-not-available' });

  if (product.productType === 'subscription') {
    await module.requestPurchase({
      type: 'subs',
      request: {
        apple: { sku, appAccountToken: userId },
        google: {
          skus: [sku],
          obfuscatedAccountId: userId,
          subscriptionOffers: offer.offerToken ? [{ sku, offerToken: offer.offerToken }] : [],
        },
      },
    });
    return;
  }

  await module.requestPurchase({
    type: 'in-app',
    request: {
      apple: { sku, appAccountToken: userId },
      google: { skus: [sku], obfuscatedAccountId: userId },
    },
  });
}

/**
 * Flujo de compras de expo-iap: cada compra se confirma en el servidor y solo se
 * termina (acknowledge / finishTransaction) cuando el servidor ha concedido el acceso.
 */
export function createStoreFlow(
  confirm: (request: PurchaseConfirmationRequest) => Promise<PurchaseConfirmation>,
): StoreFlow | null {
  const module = iap();
  if (!module) return null;

  try {
    const flow = module.createPurchaseFlow({
      confirmWithBackend: (purchase: Purchase) => confirm(module.toPurchaseConfirmationRequest(purchase)),
      // Solo se venden programaciones (no consumibles) y suscripciones.
      isConsumable: () => false,
      confirmTimeoutMs: 45_000,
    });
    return {
      subscribe: (listener) =>
        flow.subscribe((outcome) => listener({ productId: outcome.purchase.productId, status: outcome.status })),
      recover: async (includeFinished) => {
        await flow.recoverPurchases({ includeFinished });
      },
      dispose: () => flow.dispose(),
    };
  } catch (error) {
    console.warn('No se pudo iniciar el flujo de compras', error);
    return null;
  }
}

/** iOS: sincroniza con el App Store (puede pedir el Apple ID). Android consulta Google Play directamente. */
export async function syncStoreTransactions(): Promise<void> {
  const module = iap();
  if (!module || STORE_PLATFORM !== 'ios') return;
  await module.restorePurchases();
}

/** iOS 15+: hoja de Apple para pedir un reembolso. Si Apple lo concede, llega por App Store Server Notifications. */
export async function requestStoreRefund(product: StoreCatalogProduct): Promise<'success' | 'userCancelled' | null> {
  const module = iap();
  if (!module || STORE_PLATFORM !== 'ios' || !product.appleProductId) return null;
  const status = await module.beginRefundRequestIOS(product.appleProductId);
  return status === 'success' || status === 'userCancelled' ? status : null;
}

export async function openSubscriptionManagement(product?: StoreCatalogProduct): Promise<void> {
  const module = iap();
  const packageName = androidPackage();
  try {
    if (module && (STORE_PLATFORM === 'ios' || product?.googleProductId)) {
      await module.deepLinkToSubscriptions({
        skuAndroid: product?.googleProductId ?? null,
        packageNameAndroid: packageName,
      });
      return;
    }
  } catch {
    // Se abre la página de suscripciones de la tienda.
  }
  await Linking.openURL(
    STORE_PLATFORM === 'ios'
      ? IOS_SUBSCRIPTIONS_URL
      : `https://play.google.com/store/account/subscriptions?package=${encodeURIComponent(packageName)}`,
  );
}
