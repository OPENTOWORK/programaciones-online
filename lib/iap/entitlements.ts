import type {
  BillingPeriod,
  BillingPeriodUnit,
  EntitlementSnapshot,
  ProductOwnership,
  ProgramEntitlement,
  PurchaseRecord,
  StoreCatalogProduct,
  StoreName,
} from './types';

/**
 * Lógica pura de derechos de acceso (sin React ni red): la comparten el proveedor
 * de compras y las pruebas.
 */

/** Sin conexión se respeta la última respuesta del servidor hasta 72 h después de caducar. */
export const OFFLINE_GRACE_MS = 72 * 60 * 60 * 1000;

export function isEntitlementCurrent(entitlement: ProgramEntitlement, now = Date.now(), graceMs = 0): boolean {
  if (!entitlement.expiresAt) return true;
  const expiresAt = Date.parse(entitlement.expiresAt);
  return Number.isFinite(expiresAt) && expiresAt + graceMs > now;
}

export function entitledProgramIds(
  entitlements: ProgramEntitlement[],
  options: { now?: number; offline?: boolean } = {},
): Set<string> {
  const now = options.now ?? Date.now();
  const graceMs = options.offline ? OFFLINE_GRACE_MS : 0;
  return new Set(
    entitlements
      .filter((entitlement) => isEntitlementCurrent(entitlement, now, graceMs))
      .map((entitlement) => entitlement.programId),
  );
}

/** Productos que desbloquean una programación: primero la compra única, después las suscripciones. */
export function productsForProgram(products: StoreCatalogProduct[], programId: string): StoreCatalogProduct[] {
  return products
    .filter((product) => product.programIds.includes(programId))
    .sort((left, right) => {
      if (left.productType !== right.productType) return left.productType === 'non_consumable' ? -1 : 1;
      return left.sortOrder - right.sortOrder;
    });
}

/** Tienda que cobra en cada plataforma. En la web no se vende: se gestiona en la tienda de origen. */
export function storeForPlatform(os: string): StoreName | null {
  if (os === 'android') return 'google_play';
  if (os === 'ios') return 'app_store';
  return null;
}

const OPEN_SUBSCRIPTION_STATUSES = new Set<PurchaseRecord['status']>([
  'active',
  'grace_period',
  'on_hold',
  'paused',
  'pending',
]);

function isOpenSubscription(purchase: PurchaseRecord, now: number): boolean {
  if (purchase.productType !== 'subscription' || !OPEN_SUBSCRIPTION_STATUSES.has(purchase.status)) return false;
  if (purchase.status === 'active' && purchase.expiresAt) return Date.parse(purchase.expiresAt) > now;
  return true;
}

/** Suscripciones que siguen en marcha (una por producto, la más reciente). */
export function currentSubscriptions(purchases: PurchaseRecord[], now = Date.now()): PurchaseRecord[] {
  const seen = new Set<string>();
  return purchases.filter((purchase) => {
    if (!isOpenSubscription(purchase, now)) return false;
    const key = purchase.productKey ?? purchase.productId;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Compra que describe el estado actual de un producto: la vigente o, si no hay, la más reciente. */
export function latestPurchaseFor(purchases: PurchaseRecord[], productKey: string, now = Date.now()): PurchaseRecord | null {
  const own = purchases.filter((purchase) => purchase.productKey === productKey);
  return own.find((purchase) => isOpenSubscription(purchase, now)) ?? own[0] ?? null;
}

/** Próxima renovación o fin del acceso de una suscripción en marcha. */
export function renewalInfo(purchase: PurchaseRecord, now = Date.now()): { label: string; date: string } | null {
  if (purchase.productType !== 'subscription' || !purchase.expiresAt) return null;
  if (Date.parse(purchase.expiresAt) <= now) return null;
  const date = formatPurchaseDate(purchase.expiresAt);
  if (!date) return null;
  if (purchase.status === 'active') {
    return purchase.autoRenew === false ? { label: 'Acceso hasta el', date } : { label: 'Próxima renovación', date };
  }
  if (purchase.status === 'grace_period') return { label: 'Acceso hasta el', date };
  return null;
}

function currentEntitlements(entitlements: ProgramEntitlement[], now: number, offline: boolean) {
  const graceMs = offline ? OFFLINE_GRACE_MS : 0;
  return entitlements.filter((entitlement) => isEntitlementCurrent(entitlement, now, graceMs));
}

export function productOwnership(
  product: StoreCatalogProduct,
  context: {
    entitlements: ProgramEntitlement[];
    purchases: PurchaseRecord[];
    currentStore: StoreName | null;
    now?: number;
    offline?: boolean;
  },
): ProductOwnership {
  const now = context.now ?? Date.now();
  const current = currentEntitlements(context.entitlements, now, context.offline ?? false);
  const direct = current.find((entitlement) => entitlement.storeProductId === product.id);
  if (direct) {
    return {
      kind: 'owned',
      source: direct.source,
      purchase: latestPurchaseFor(context.purchases, product.productKey, now),
      manageable: product.productType === 'subscription' && context.currentStore !== null && direct.source === context.currentStore,
    };
  }
  const programs = new Set(current.map((entitlement) => entitlement.programId));
  if (product.programIds.length > 0 && product.programIds.every((programId) => programs.has(programId))) {
    return { kind: 'covered' };
  }
  return { kind: 'none' };
}

export interface ProgramAccess {
  programId: string;
  source: string;
  expiresAt: string | null;
  productKey: string | null;
}

/** Programaciones abiertas para la cuenta; si hay varias vías, la que dura más. */
export function accessiblePrograms(
  entitlements: ProgramEntitlement[],
  options: { now?: number; offline?: boolean } = {},
): ProgramAccess[] {
  const byProgram = new Map<string, ProgramAccess>();
  for (const entitlement of currentEntitlements(entitlements, options.now ?? Date.now(), options.offline ?? false)) {
    const existing = byProgram.get(entitlement.programId);
    const lasts = (value: string | null) => (value ? Date.parse(value) : Number.POSITIVE_INFINITY);
    if (existing && lasts(existing.expiresAt) >= lasts(entitlement.expiresAt)) continue;
    byProgram.set(entitlement.programId, {
      programId: entitlement.programId,
      source: entitlement.source,
      expiresAt: entitlement.expiresAt,
      productKey: entitlement.productKey,
    });
  }
  return [...byProgram.values()];
}

export function entitlementSourceLabel(source: string): string {
  if (source === 'google_play') return 'Google Play';
  if (source === 'app_store') return 'App Store';
  if (source === 'stripe') return 'Web';
  if (source === 'manual') return 'Acceso concedido por Training ProgLine';
  return 'Tienda';
}

// ---------------------------------------------------------------------------
// Normalización de respuestas (RPC en snake_case, Edge Function en camelCase)
// ---------------------------------------------------------------------------

type Row = Record<string, unknown>;

const text = (value: unknown): string | null => (typeof value === 'string' && value ? value : null);

function pick(row: Row, camel: string, snake: string): unknown {
  return row[camel] ?? row[snake];
}

export function normalizeEntitlementRows(rows: unknown): ProgramEntitlement[] {
  if (!Array.isArray(rows)) return [];
  return rows.flatMap((raw) => {
    const row = (raw ?? {}) as Row;
    const programId = text(pick(row, 'programId', 'program_id'));
    if (!programId) return [];
    return [
      {
        programId,
        storeProductId: text(pick(row, 'storeProductId', 'store_product_id')),
        productKey: text(pick(row, 'productKey', 'product_key')),
        source: text(row.source) ?? 'unknown',
        expiresAt: text(pick(row, 'expiresAt', 'expires_at')),
      },
    ];
  });
}

export function normalizePurchaseRows(rows: unknown): PurchaseRecord[] {
  if (!Array.isArray(rows)) return [];
  return rows.flatMap((raw) => {
    const row = (raw ?? {}) as Row;
    const id = text(row.id);
    const status = text(row.status);
    if (!id || !status) return [];
    const autoRenew = pick(row, 'autoRenew', 'auto_renew');
    return [
      {
        id,
        productKey: text(pick(row, 'productKey', 'product_key')),
        title: text(row.title),
        productType: (text(pick(row, 'productType', 'product_type')) as PurchaseRecord['productType']) ?? null,
        platform: (text(row.platform) ?? 'web') as PurchaseRecord['platform'],
        store: (text(row.store) ?? 'stripe') as PurchaseRecord['store'],
        productId: text(pick(row, 'productId', 'product_id')) ?? '',
        status: status as PurchaseRecord['status'],
        autoRenew: typeof autoRenew === 'boolean' ? autoRenew : null,
        environment: text(row.environment) === 'sandbox' ? 'sandbox' : 'production',
        purchasedAt: text(pick(row, 'purchasedAt', 'purchased_at')),
        expiresAt: text(pick(row, 'expiresAt', 'expires_at')),
        cancelledAt: text(pick(row, 'cancelledAt', 'cancelled_at')),
        refundedAt: text(pick(row, 'refundedAt', 'refunded_at')),
      },
    ];
  });
}

export function snapshotFrom(entitlements: unknown, purchases: unknown, fetchedAt = new Date()): EntitlementSnapshot {
  return {
    entitlements: normalizeEntitlementRows(entitlements),
    purchases: normalizePurchaseRows(purchases),
    fetchedAt: fetchedAt.toISOString(),
  };
}

export function hasAutoRenewingSubscription(purchases: PurchaseRecord[]): boolean {
  return purchases.some(
    (purchase) =>
      purchase.productType === 'subscription' &&
      purchase.autoRenew === true &&
      (purchase.status === 'active' || purchase.status === 'grace_period' || purchase.status === 'on_hold'),
  );
}

// ---------------------------------------------------------------------------
// Textos de precio y estado
// ---------------------------------------------------------------------------

const ISO_UNITS: Record<string, BillingPeriodUnit> = { D: 'day', W: 'week', M: 'month', Y: 'year' };

/** Periodo ISO 8601 de Google Play (P1M, P1Y, P3M, P1W...). */
export function parseIsoBillingPeriod(value: string | null | undefined): BillingPeriod | null {
  const match = value ? /^P(\d+)([DWMY])$/.exec(value) : null;
  if (!match) return null;
  return { unit: ISO_UNITS[match[2]], value: Number(match[1]) };
}

const PERIOD_SINGULAR: Record<BillingPeriodUnit, string> = {
  day: 'al día',
  week: 'a la semana',
  month: 'al mes',
  year: 'al año',
};

const PERIOD_PLURAL: Record<BillingPeriodUnit, string> = {
  day: 'días',
  week: 'semanas',
  month: 'meses',
  year: 'años',
};

export function billingPeriodLabel(period: BillingPeriod | null): string {
  if (!period || period.value <= 0) return '';
  if (period.unit === 'day' && period.value === 7) return PERIOD_SINGULAR.week;
  if (period.unit === 'month' && period.value === 12) return PERIOD_SINGULAR.year;
  return period.value === 1 ? PERIOD_SINGULAR[period.unit] : `cada ${period.value} ${PERIOD_PLURAL[period.unit]}`;
}

export function priceWithPeriod(displayPrice: string, period: BillingPeriod | null): string {
  const label = billingPeriodLabel(period);
  return label ? `${displayPrice} ${label}` : displayPrice;
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];

export function formatPurchaseDate(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export type StatusTone = 'success' | 'warning' | 'danger' | 'muted';

export function purchaseStatusLabel(purchase: PurchaseRecord, now = Date.now()): { label: string; tone: StatusTone } {
  const until = formatPurchaseDate(purchase.expiresAt);
  const expired = purchase.expiresAt ? Date.parse(purchase.expiresAt) <= now : false;

  switch (purchase.status) {
    case 'active':
      if (purchase.productType !== 'subscription' || !purchase.expiresAt) return { label: 'Adquirida', tone: 'success' };
      if (expired) return { label: 'Caducada', tone: 'muted' };
      return purchase.autoRenew === false
        ? { label: `Cancelada · acceso hasta el ${until}`, tone: 'warning' }
        : { label: `Activa · se renueva el ${until}`, tone: 'success' };
    case 'grace_period':
      return {
        label: until ? `Problema con el pago · acceso hasta el ${until}` : 'Problema con el pago',
        tone: 'warning',
      };
    case 'on_hold':
      return { label: 'Suspendida por un problema con el pago', tone: 'danger' };
    case 'paused':
      return { label: 'En pausa', tone: 'muted' };
    case 'pending':
      return { label: 'Pago pendiente de confirmar', tone: 'warning' };
    case 'expired':
      return { label: until ? `Caducó el ${until}` : 'Caducada', tone: 'muted' };
    case 'cancelled':
      return { label: 'Cancelada', tone: 'muted' };
    case 'refunded':
      return { label: 'Reembolsada', tone: 'danger' };
    case 'revoked':
      return { label: 'Revocada', tone: 'danger' };
  }
  return { label: 'Estado desconocido', tone: 'muted' };
}

export function purchaseStoreLabel(purchase: Pick<PurchaseRecord, 'store'>): string {
  if (purchase.store === 'google_play') return 'Google Play';
  if (purchase.store === 'app_store') return 'App Store';
  return 'Web';
}
