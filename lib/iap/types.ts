export type StoreProductType = 'non_consumable' | 'subscription';

/** Producto de `store_products`: qué se vende y qué programaciones desbloquea. El precio lo da la tienda. */
export interface StoreCatalogProduct {
  id: string;
  productKey: string;
  title: string;
  description: string;
  benefits: string[];
  productType: StoreProductType;
  googleProductId: string | null;
  googleBasePlanId: string | null;
  appleProductId: string | null;
  sortOrder: number;
  programIds: string[];
  /** Aún no está a la venta: solo lo ven administradores y cuentas de prueba. */
  testOnly: boolean;
}

export type BillingPeriodUnit = 'day' | 'week' | 'month' | 'year';

export interface BillingPeriod {
  unit: BillingPeriodUnit;
  value: number;
}

/** Lo que devuelve la tienda del dispositivo para un producto: precio localizado y datos para comprarlo. */
export interface StoreOffer {
  productKey: string;
  storeProductId: string;
  displayPrice: string;
  period: BillingPeriod | null;
  /** Google Play: token de la oferta del plan base, obligatorio para suscribirse. */
  offerToken: string | null;
}

/** Programación a la que da acceso una compra verificada en el servidor. */
export interface ProgramEntitlement {
  programId: string;
  storeProductId: string | null;
  productKey: string | null;
  source: string;
  expiresAt: string | null;
}

export type StorePurchaseStatus =
  | 'pending'
  | 'active'
  | 'grace_period'
  | 'on_hold'
  | 'paused'
  | 'expired'
  | 'cancelled'
  | 'refunded'
  | 'revoked';

export interface PurchaseRecord {
  id: string;
  productKey: string | null;
  title: string | null;
  productType: StoreProductType | null;
  platform: 'android' | 'ios' | 'web';
  store: 'google_play' | 'app_store' | 'stripe';
  productId: string;
  status: StorePurchaseStatus;
  autoRenew: boolean | null;
  environment: 'production' | 'sandbox';
  purchasedAt: string | null;
  expiresAt: string | null;
  cancelledAt: string | null;
  refundedAt: string | null;
}

export interface EntitlementSnapshot {
  entitlements: ProgramEntitlement[];
  purchases: PurchaseRecord[];
  fetchedAt: string;
}

export type StoreName = PurchaseRecord['store'];

/** Relación de la cuenta con un producto del catálogo. */
export type ProductOwnership =
  | { kind: 'none' }
  /** Lo tiene contratado. `manageable`: se gestiona desde la tienda de este dispositivo. */
  | { kind: 'owned'; source: string; purchase: PurchaseRecord | null; manageable: boolean }
  /** Ya tiene acceso a sus programaciones por otra vía (otro producto o acceso manual). */
  | { kind: 'covered' };

/** Estado de una compra en curso, por producto. */
export type PurchaseProgress =
  | { kind: 'purchasing' }
  | { kind: 'verifying' }
  | { kind: 'pending' }
  | { kind: 'error'; title: string; message: string };

export interface UserMessage {
  title: string;
  message: string;
}
