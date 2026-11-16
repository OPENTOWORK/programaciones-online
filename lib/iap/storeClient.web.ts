import type { PurchaseConfirmation, PurchaseConfirmationRequest, PurchaseFlowStatus } from 'expo-iap';

import type { StoreCatalogProduct, StoreOffer } from '@/lib/iap/types';

/** En la web no hay tienda: lo comprado en Android o iOS se ve con la misma cuenta. */

export interface StoreFlowOutcome {
  productId: string;
  status: PurchaseFlowStatus;
}

export interface StoreFlow {
  subscribe: (listener: (outcome: StoreFlowOutcome) => void) => () => void;
  recover: (includeFinished: boolean) => Promise<void>;
  dispose: () => void;
}

export const STORE_PLATFORM: 'android' | 'ios' | null = null;

export function storeProductId(_product: StoreCatalogProduct): string | null {
  return null;
}

export function storeErrorCode(_error: unknown): string | undefined {
  return undefined;
}

export async function connectStore(): Promise<boolean> {
  return false;
}

export async function disconnectStore(): Promise<void> {}

export async function loadStoreOffers(_products: StoreCatalogProduct[]): Promise<Map<string, StoreOffer>> {
  return new Map();
}

export async function startStorePurchase(
  _product: StoreCatalogProduct,
  _offer: StoreOffer,
  _userId: string,
): Promise<void> {
  throw Object.assign(new Error('Compras no disponibles en la web'), { code: 'iap-not-available' });
}

export function createStoreFlow(
  _confirm: (request: PurchaseConfirmationRequest) => Promise<PurchaseConfirmation>,
): StoreFlow | null {
  return null;
}

export async function syncStoreTransactions(): Promise<void> {}

export async function requestStoreRefund(_product: StoreCatalogProduct): Promise<'success' | 'userCancelled' | null> {
  return null;
}

export async function openSubscriptionManagement(_product?: StoreCatalogProduct): Promise<void> {}
