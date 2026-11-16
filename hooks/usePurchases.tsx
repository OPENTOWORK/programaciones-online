import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';
import type { PurchaseConfirmationRequest } from 'expo-iap';

import { useAuth } from '@/hooks/useAuth';
import { fetchStoreCatalog } from '@/lib/iap/catalogService';
import { readCachedSnapshot, writeCachedSnapshot } from '@/lib/iap/entitlementCache';
import {
  entitledProgramIds,
  productOwnership,
  productsForProgram as productsUnlocking,
  storeForPlatform,
} from '@/lib/iap/entitlements';
import {
  ALREADY_HAS_ACCESS_MESSAGE,
  messageForConfirmation,
  messageForStoreError,
  PURCHASE_PENDING_MESSAGE,
  REFUND_FAILED_MESSAGE,
  REFUND_REQUESTED_MESSAGE,
  RESTORE_DONE_MESSAGE,
  RESTORE_FAILED_MESSAGE,
} from '@/lib/iap/messages';
import { confirmPurchaseWithServer, fetchEntitlementSnapshot, syncPurchasesWithServer } from '@/lib/iap/purchaseApi';
import {
  connectStore,
  createStoreFlow,
  disconnectStore,
  loadStoreOffers,
  openSubscriptionManagement,
  requestStoreRefund,
  startStorePurchase,
  storeErrorCode,
  storeProductId,
  syncStoreTransactions,
  STORE_PLATFORM,
  type StoreFlow,
  type StoreFlowOutcome,
} from '@/lib/iap/storeClient';
import type {
  EntitlementSnapshot,
  ProductOwnership,
  PurchaseProgress,
  StoreCatalogProduct,
  StoreName,
  StoreOffer,
  UserMessage,
} from '@/lib/iap/types';

interface PurchasesContextValue {
  /** Productos visibles. Vacío = tienda apagada: la app se comporta como siempre. */
  catalog: StoreCatalogProduct[];
  /** Precio de la tienda por `productKey`. Solo en Android/iOS con la tienda conectada. */
  offers: Map<string, StoreOffer>;
  storeReady: boolean;
  /** Tienda que cobra en este dispositivo (null en la web). */
  currentStore: StoreName | null;
  snapshot: EntitlementSnapshot | null;
  isLoading: boolean;
  isRestoring: boolean;
  progress: Record<string, PurchaseProgress>;
  hasProgramEntitlement: (programId: string) => boolean;
  productsForProgram: (programId: string) => StoreCatalogProduct[];
  ownershipOf: (product: StoreCatalogProduct) => ProductOwnership;
  isProductOwned: (product: StoreCatalogProduct) => boolean;
  purchase: (product: StoreCatalogProduct) => Promise<void>;
  restore: () => Promise<UserMessage>;
  refresh: () => Promise<void>;
  /** Vuelve a conectar con la tienda cuando no respondió. */
  retryStore: () => void;
  manageSubscriptions: (product?: StoreCatalogProduct) => Promise<void>;
  /** iOS: hoja de reembolso de Apple. Null si el usuario la cierra sin enviarla. */
  requestRefund: (product: StoreCatalogProduct) => Promise<UserMessage | null>;
  clearProgress: (productKey: string) => void;
}

const PurchasesContext = createContext<PurchasesContextValue | null>(null);

const FOREGROUND_REFRESH_MS = 2 * 60 * 1000;
const MIN_RETRY_MS = 5_000;
const MAX_RETRY_MS = 5 * 60 * 1000;
const CURRENT_STORE = STORE_PLATFORM ? storeForPlatform(STORE_PLATFORM) : null;

export function PurchasesProvider({ children }: { children: ReactNode }) {
  const { user, isDemoMode } = useAuth();
  const userId = !isDemoMode ? user?.id : undefined;

  const [catalog, setCatalog] = useState<StoreCatalogProduct[]>([]);
  const [offers, setOffers] = useState<Map<string, StoreOffer>>(new Map());
  const [storeReady, setStoreReady] = useState(false);
  const [snapshot, setSnapshot] = useState<EntitlementSnapshot | null>(null);
  const [snapshotIsCached, setSnapshotIsCached] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [progress, setProgress] = useState<Record<string, PurchaseProgress>>({});
  const [connectAttempt, setConnectAttempt] = useState(0);

  const flowRef = useRef<StoreFlow | null>(null);
  const catalogRef = useRef<StoreCatalogProduct[]>([]);
  const requestedRef = useRef(new Set<string>());
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRefreshRef = useRef(0);
  const activeUserRef = useRef<string | undefined>(undefined);

  const applySnapshot = useCallback((next: EntitlementSnapshot, owner: string) => {
    if (activeUserRef.current !== owner) return;
    setSnapshot(next);
    setSnapshotIsCached(false);
    void writeCachedSnapshot(owner, next);
  }, []);

  const setProductProgress = useCallback((productKey: string, next: PurchaseProgress | null) => {
    setProgress((current) => {
      if (!next) {
        if (!(productKey in current)) return current;
        const { [productKey]: _removed, ...rest } = current;
        return rest;
      }
      return { ...current, [productKey]: next };
    });
  }, []);

  const scheduleRetry = useCallback((retryAfterMs: number) => {
    if (retryTimerRef.current) return;
    const delay = Math.min(Math.max(retryAfterMs, MIN_RETRY_MS), MAX_RETRY_MS);
    retryTimerRef.current = setTimeout(() => {
      retryTimerRef.current = null;
      void flowRef.current?.recover(false).catch(() => undefined);
    }, delay);
  }, []);

  const handleOutcome = useCallback(
    ({ productId, status }: StoreFlowOutcome) => {
      const product = catalogRef.current.find((item) => storeProductId(item) === productId);
      const key = product?.productKey ?? productId;
      const requested = requestedRef.current.has(key);

      switch (status.status) {
        case 'entitled':
          requestedRef.current.delete(key);
          setProductProgress(key, null);
          return;
        case 'store_pending':
          if (requested) setProductProgress(key, { kind: 'pending' });
          return;
        case 'verification_delayed':
        case 'verified':
        case 'linked':
          if (requested) setProductProgress(key, { kind: 'verifying' });
          scheduleRetry(status.retryAfterMs ?? 60_000);
          return;
        case 'failed':
          if (requested) setProductProgress(key, { kind: 'verifying' });
          scheduleRetry(30_000);
          return;
        case 'invalid':
          if (status.recovered) return;
          break;
        default:
          break;
      }

      requestedRef.current.delete(key);
      const message = messageForConfirmation(status.status, status.status === 'invalid' ? status.reason : undefined);
      if (requested && message) setProductProgress(key, { kind: 'error', ...message });
    },
    [scheduleRetry, setProductProgress],
  );

  const confirm = useCallback(
    async (request: PurchaseConfirmationRequest, owner: string) => {
      const { confirmation, snapshot: next } = await confirmPurchaseWithServer(request);
      if (next) applySnapshot(next, owner);
      return confirmation;
    },
    [applySnapshot],
  );

  const refresh = useCallback(async () => {
    const owner = activeUserRef.current;
    if (!owner) return;
    lastRefreshRef.current = Date.now();

    const [products, fromDatabase] = await Promise.all([fetchStoreCatalog(), fetchEntitlementSnapshot()]);
    if (activeUserRef.current !== owner) return;
    catalogRef.current = products;
    setCatalog(products);
    if (fromDatabase) applySnapshot(fromDatabase, owner);

    const flow = flowRef.current;
    if (!flow) return;
    const [loadedOffers] = await Promise.all([loadStoreOffers(products), flow.recover(false).catch(() => undefined)]);
    if (activeUserRef.current !== owner) return;
    setOffers(loadedOffers);
    if (fromDatabase?.purchases.length) {
      const synced = await syncPurchasesWithServer();
      if (synced) applySnapshot(synced, owner);
    }
  }, [applySnapshot]);

  useEffect(() => {
    activeUserRef.current = userId;
    requestedRef.current.clear();
    setProgress({});
    setOffers(new Map());
    setStoreReady(false);
    setSnapshot(null);
    setCatalog([]);
    catalogRef.current = [];
    if (!userId) return;

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    setIsLoading(true);

    void (async () => {
      const cached = await readCachedSnapshot(userId);
      if (!cancelled && cached) {
        setSnapshot((current) => current ?? cached);
        setSnapshotIsCached(true);
      }

      const [products, fromDatabase] = await Promise.all([fetchStoreCatalog(), fetchEntitlementSnapshot()]);
      if (cancelled) return;
      catalogRef.current = products;
      setCatalog(products);
      if (fromDatabase) applySnapshot(fromDatabase, userId);
      lastRefreshRef.current = Date.now();

      const hasPurchases = Boolean(fromDatabase?.purchases.length || cached?.purchases.length);
      if (!STORE_PLATFORM || (!products.length && !hasPurchases)) {
        setIsLoading(false);
        return;
      }

      const connected = await connectStore();
      if (cancelled || !connected) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      const flow = createStoreFlow((request) => confirm(request, userId));
      flowRef.current = flow;
      unsubscribe = flow?.subscribe(handleOutcome);
      setStoreReady(Boolean(flow));

      const [loadedOffers] = await Promise.all([
        loadStoreOffers(products),
        flow?.recover(false).catch(() => undefined),
      ]);
      if (cancelled) return;
      setOffers(loadedOffers);

      if (hasPurchases) {
        const synced = await syncPurchasesWithServer();
        if (synced && !cancelled) applySnapshot(synced, userId);
      }
      if (!cancelled) setIsLoading(false);
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
      flowRef.current?.dispose();
      flowRef.current = null;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
      setIsLoading(false);
      void disconnectStore();
    };
  }, [applySnapshot, confirm, connectAttempt, handleOutcome, userId]);

  const retryStore = useCallback(() => setConnectAttempt((attempt) => attempt + 1), []);

  useEffect(() => {
    if (!userId) return;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && Date.now() - lastRefreshRef.current > FOREGROUND_REFRESH_MS) {
        void refresh();
      }
    });
    return () => subscription.remove();
  }, [refresh, userId]);

  const entitled = useMemo(
    () => entitledProgramIds(snapshot?.entitlements ?? [], { offline: snapshotIsCached }),
    [snapshot, snapshotIsCached],
  );

  const hasProgramEntitlement = useCallback((programId: string) => entitled.has(programId), [entitled]);

  const productsForProgram = useCallback(
    (programId: string) => productsUnlocking(catalog, programId),
    [catalog],
  );

  const ownershipOf = useCallback(
    (product: StoreCatalogProduct) =>
      productOwnership(product, {
        entitlements: snapshot?.entitlements ?? [],
        purchases: snapshot?.purchases ?? [],
        currentStore: CURRENT_STORE,
        offline: snapshotIsCached,
      }),
    [snapshot, snapshotIsCached],
  );

  // Una programación a la que ya se tiene acceso (por esta u otra vía) no se vuelve a vender.
  const isProductOwned = useCallback((product: StoreCatalogProduct) => ownershipOf(product).kind !== 'none', [ownershipOf]);

  const purchase = useCallback(
    async (product: StoreCatalogProduct) => {
      const owner = activeUserRef.current;
      const offer = offers.get(product.productKey);
      const key = product.productKey;
      if (isProductOwned(product)) {
        setProductProgress(key, { kind: 'error', ...ALREADY_HAS_ACCESS_MESSAGE });
        return;
      }
      if (!owner || !storeReady || !offer) {
        setProductProgress(key, { kind: 'error', ...messageForStoreError('item-unavailable')! });
        return;
      }

      requestedRef.current.add(key);
      setProductProgress(key, { kind: 'purchasing' });
      try {
        await startStorePurchase(product, offer, owner);
        // La compra la confirma el flujo; si aún no ha respondido, se queda verificando.
        setProgress((current) =>
          current[key]?.kind === 'purchasing' ? { ...current, [key]: { kind: 'verifying' } } : current,
        );
      } catch (error) {
        const code = storeErrorCode(error);
        const message = messageForStoreError(code);
        if (code === 'already-owned' || code === 'duplicate-purchase') {
          setProductProgress(key, { kind: 'verifying' });
          await flowRef.current?.recover(true).catch(() => undefined);
          setProgress((current) =>
            current[key]?.kind === 'verifying' && message ? { ...current, [key]: { kind: 'error', ...message } } : current,
          );
          return;
        }
        if (message === PURCHASE_PENDING_MESSAGE) {
          setProductProgress(key, { kind: 'pending' });
          return;
        }
        requestedRef.current.delete(key);
        setProductProgress(key, message ? { kind: 'error', ...message } : null);
      }
    },
    [isProductOwned, offers, setProductProgress, storeReady],
  );

  const restore = useCallback(async (): Promise<UserMessage> => {
    const owner = activeUserRef.current;
    if (!owner) return RESTORE_FAILED_MESSAGE;
    setIsRestoring(true);
    try {
      if (flowRef.current) {
        await syncStoreTransactions().catch(() => undefined);
        await flowRef.current.recover(true).catch(() => undefined);
      }
      const latest = (await syncPurchasesWithServer()) ?? (await fetchEntitlementSnapshot());
      if (!latest) return RESTORE_FAILED_MESSAGE;
      applySnapshot(latest, owner);
      return RESTORE_DONE_MESSAGE;
    } finally {
      setIsRestoring(false);
    }
  }, [applySnapshot]);

  const manageSubscriptions = useCallback(async (product?: StoreCatalogProduct) => {
    await openSubscriptionManagement(product);
  }, []);

  const requestRefund = useCallback(async (product: StoreCatalogProduct): Promise<UserMessage | null> => {
    try {
      return (await requestStoreRefund(product)) === 'success' ? REFUND_REQUESTED_MESSAGE : null;
    } catch {
      return REFUND_FAILED_MESSAGE;
    }
  }, []);

  const clearProgress = useCallback(
    (productKey: string) => {
      requestedRef.current.delete(productKey);
      setProductProgress(productKey, null);
    },
    [setProductProgress],
  );

  const value = useMemo<PurchasesContextValue>(
    () => ({
      catalog,
      offers,
      storeReady,
      currentStore: CURRENT_STORE,
      snapshot,
      isLoading,
      isRestoring,
      progress,
      hasProgramEntitlement,
      productsForProgram,
      ownershipOf,
      isProductOwned,
      purchase,
      restore,
      refresh,
      retryStore,
      manageSubscriptions,
      requestRefund,
      clearProgress,
    }),
    [
      catalog,
      clearProgress,
      hasProgramEntitlement,
      isLoading,
      isProductOwned,
      isRestoring,
      manageSubscriptions,
      offers,
      ownershipOf,
      productsForProgram,
      progress,
      purchase,
      refresh,
      requestRefund,
      restore,
      retryStore,
      snapshot,
      storeReady,
    ],
  );

  return <PurchasesContext.Provider value={value}>{children}</PurchasesContext.Provider>;
}

export function usePurchases(): PurchasesContextValue {
  const context = useContext(PurchasesContext);
  if (!context) throw new Error('usePurchases debe usarse dentro de PurchasesProvider');
  return context;
}

/** ¿Tiene el usuario acceso comprado a esta programación? Seguro fuera del proveedor. */
export function useProgramEntitlement(): (programId: string) => boolean {
  const context = useContext(PurchasesContext);
  return context?.hasProgramEntitlement ?? noEntitlement;
}

function noEntitlement() {
  return false;
}
