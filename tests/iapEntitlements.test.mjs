import assert from 'node:assert/strict';
import test from 'node:test';

import {
  OFFLINE_GRACE_MS,
  accessiblePrograms,
  billingPeriodLabel,
  currentSubscriptions,
  entitledProgramIds,
  entitlementSourceLabel,
  formatPurchaseDate,
  hasAutoRenewingSubscription,
  isEntitlementCurrent,
  latestPurchaseFor,
  normalizeEntitlementRows,
  normalizePurchaseRows,
  parseIsoBillingPeriod,
  priceWithPeriod,
  productOwnership,
  productsForProgram,
  purchaseStatusLabel,
  purchaseStoreLabel,
  renewalInfo,
  snapshotFrom,
  storeForPlatform,
} from '../lib/iap/entitlements.ts';
import {
  PURCHASE_PENDING_MESSAGE,
  PURCHASE_VERIFYING_MESSAGE,
  messageForConfirmation,
  messageForStoreError,
} from '../lib/iap/messages.ts';

const NOW = Date.parse('2026-11-16T12:00:00Z');
const HOUR = 60 * 60 * 1000;

const entitlement = (programId, expiresAt) => ({
  programId,
  storeProductId: 'product-1',
  productKey: 'program.basico',
  source: 'google_play',
  expiresAt,
});

const purchase = (overrides = {}) => ({
  id: 'purchase-1',
  productKey: 'plan.mensual',
  title: 'Plan mensual',
  productType: 'subscription',
  platform: 'android',
  store: 'google_play',
  productId: 'plan_mensual',
  status: 'active',
  autoRenew: true,
  environment: 'production',
  purchasedAt: '2026-11-12T12:00:00Z',
  expiresAt: '2026-12-12T12:00:00Z',
  cancelledAt: null,
  refundedAt: null,
  ...overrides,
});

const product = (overrides = {}) => ({
  id: 'product-1',
  productKey: 'program.basico',
  title: 'Básico',
  description: '',
  benefits: [],
  productType: 'non_consumable',
  googleProductId: 'program_basico',
  googleBasePlanId: null,
  appleProductId: 'com.example.program.basico',
  sortOrder: 0,
  programIds: ['program-a'],
  testOnly: false,
  ...overrides,
});

const subscription = (slug, programId) =>
  product({
    id: `product-${slug}`,
    productKey: `sub.${slug}.monthly`,
    title: slug,
    productType: 'subscription',
    googleProductId: `sub_${slug}`,
    googleBasePlanId: 'monthly',
    appleProductId: `com.trainingprogline.app.sub.${slug}.monthly`,
    programIds: [programId],
  });

const storeEntitlement = (productId, programId, source, expiresAt = '2026-12-12T12:00:00Z') => ({
  programId,
  storeProductId: productId,
  productKey: null,
  source,
  expiresAt,
});

test('una compra sin caducidad da acceso indefinido', () => {
  assert.equal(isEntitlementCurrent(entitlement('program-a', null), NOW), true);
});

test('una suscripción da acceso hasta que caduca', () => {
  assert.equal(isEntitlementCurrent(entitlement('program-a', '2026-11-16T13:00:00Z'), NOW), true);
  assert.equal(isEntitlementCurrent(entitlement('program-a', '2026-11-16T11:00:00Z'), NOW), false);
  assert.equal(isEntitlementCurrent(entitlement('program-a', 'no es una fecha'), NOW), false);
});

test('sin conexión se respeta la última respuesta del servidor durante 72 horas', () => {
  const expiredRecently = entitlement('program-a', new Date(NOW - 10 * HOUR).toISOString());
  const expiredLongAgo = entitlement('program-b', new Date(NOW - OFFLINE_GRACE_MS - HOUR).toISOString());

  assert.deepEqual([...entitledProgramIds([expiredRecently, expiredLongAgo], { now: NOW })], []);
  assert.deepEqual([...entitledProgramIds([expiredRecently, expiredLongAgo], { now: NOW, offline: true })], [
    'program-a',
  ]);
});

test('primero se ofrece la compra única y después las suscripciones', () => {
  const products = [
    product({ id: 'sub-2', productType: 'subscription', sortOrder: 2 }),
    product({ id: 'other', programIds: ['program-b'] }),
    product({ id: 'sub-1', productType: 'subscription', sortOrder: 1 }),
    product({ id: 'one-time', sortOrder: 9 }),
  ];

  assert.deepEqual(
    productsForProgram(products, 'program-a').map((item) => item.id),
    ['one-time', 'sub-1', 'sub-2'],
  );
  assert.deepEqual(productsForProgram(products, 'program-z'), []);
});

test('normaliza los derechos de la RPC (snake_case) y de la Edge Function (camelCase)', () => {
  const rows = normalizeEntitlementRows([
    { program_id: 'program-a', store_product_id: 'p1', product_key: 'k1', source: 'app_store', expires_at: null },
    { programId: 'program-b', storeProductId: 'p2', productKey: 'k2', source: 'google_play', expiresAt: '2027-01-01T00:00:00Z' },
    { source: 'manual' },
  ]);

  assert.deepEqual(rows, [
    { programId: 'program-a', storeProductId: 'p1', productKey: 'k1', source: 'app_store', expiresAt: null },
    { programId: 'program-b', storeProductId: 'p2', productKey: 'k2', source: 'google_play', expiresAt: '2027-01-01T00:00:00Z' },
  ]);
  assert.deepEqual(normalizeEntitlementRows(null), []);
});

test('normaliza el historial de compras sin exponer tokens', () => {
  const [row] = normalizePurchaseRows([
    {
      id: 'purchase-1',
      product_key: 'plan.mensual',
      title: 'Plan mensual',
      product_type: 'subscription',
      platform: 'ios',
      store: 'app_store',
      product_id: 'com.example.plan.mensual',
      status: 'grace_period',
      auto_renew: false,
      environment: 'sandbox',
      purchased_at: '2026-11-01T12:00:00Z',
      expires_at: '2026-12-01T12:00:00Z',
      purchase_token: 'no-debe-aparecer',
    },
  ]);

  assert.equal(row.productType, 'subscription');
  assert.equal(row.store, 'app_store');
  assert.equal(row.autoRenew, false);
  assert.equal(row.environment, 'sandbox');
  assert.equal(row.expiresAt, '2026-12-01T12:00:00Z');
  assert.equal('purchaseToken' in row || 'purchase_token' in row, false);
  assert.deepEqual(normalizePurchaseRows([{ id: 'sin-estado' }]), []);
});

test('el snapshot combina derechos y compras con la hora de consulta', () => {
  const snapshot = snapshotFrom([{ program_id: 'program-a' }], [], new Date(NOW));
  assert.equal(snapshot.entitlements.length, 1);
  assert.equal(snapshot.fetchedAt, '2026-11-16T12:00:00.000Z');
});

test('detecta suscripciones que se siguen renovando', () => {
  assert.equal(hasAutoRenewingSubscription([purchase()]), true);
  assert.equal(hasAutoRenewingSubscription([purchase({ status: 'on_hold' })]), true);
  assert.equal(hasAutoRenewingSubscription([purchase({ autoRenew: false })]), false);
  assert.equal(hasAutoRenewingSubscription([purchase({ status: 'expired' })]), false);
  assert.equal(hasAutoRenewingSubscription([purchase({ productType: 'non_consumable', autoRenew: null })]), false);
});

test('interpreta los periodos ISO de Google Play', () => {
  assert.deepEqual(parseIsoBillingPeriod('P1M'), { unit: 'month', value: 1 });
  assert.deepEqual(parseIsoBillingPeriod('P3M'), { unit: 'month', value: 3 });
  assert.deepEqual(parseIsoBillingPeriod('P1Y'), { unit: 'year', value: 1 });
  assert.deepEqual(parseIsoBillingPeriod('P1W'), { unit: 'week', value: 1 });
  assert.equal(parseIsoBillingPeriod('P1M2D'), null);
  assert.equal(parseIsoBillingPeriod(undefined), null);
});

test('escribe el periodo de facturación en español', () => {
  assert.equal(billingPeriodLabel({ unit: 'month', value: 1 }), 'al mes');
  assert.equal(billingPeriodLabel({ unit: 'year', value: 1 }), 'al año');
  assert.equal(billingPeriodLabel({ unit: 'day', value: 7 }), 'a la semana');
  assert.equal(billingPeriodLabel({ unit: 'month', value: 12 }), 'al año');
  assert.equal(billingPeriodLabel({ unit: 'month', value: 3 }), 'cada 3 meses');
  assert.equal(billingPeriodLabel({ unit: 'week', value: 2 }), 'cada 2 semanas');
  assert.equal(billingPeriodLabel(null), '');
});

test('muestra el precio de la tienda tal cual, con el periodo si es suscripción', () => {
  assert.equal(priceWithPeriod('9,99 €', { unit: 'month', value: 1 }), '9,99 € al mes');
  assert.equal(priceWithPeriod('24,99 €', null), '24,99 €');
});

test('formatea fechas de compra', () => {
  assert.equal(formatPurchaseDate('2026-12-12T12:00:00Z'), '12 dic 2026');
  assert.equal(formatPurchaseDate('2026-09-03T12:00:00Z'), '3 sept 2026');
  assert.equal(formatPurchaseDate(null), '');
  assert.equal(formatPurchaseDate('nunca'), '');
});

test('etiqueta cada estado de compra', () => {
  assert.deepEqual(purchaseStatusLabel(purchase({ productType: 'non_consumable', expiresAt: null }), NOW), {
    label: 'Adquirida',
    tone: 'success',
  });
  assert.deepEqual(purchaseStatusLabel(purchase(), NOW), {
    label: 'Activa · se renueva el 12 dic 2026',
    tone: 'success',
  });
  assert.deepEqual(purchaseStatusLabel(purchase({ autoRenew: false }), NOW), {
    label: 'Cancelada · acceso hasta el 12 dic 2026',
    tone: 'warning',
  });
  assert.equal(purchaseStatusLabel(purchase({ expiresAt: '2026-11-01T12:00:00Z' }), NOW).label, 'Caducada');
  assert.equal(purchaseStatusLabel(purchase({ status: 'grace_period' }), NOW).tone, 'warning');
  assert.equal(purchaseStatusLabel(purchase({ status: 'on_hold' }), NOW).tone, 'danger');
  assert.equal(purchaseStatusLabel(purchase({ status: 'pending' }), NOW).label, 'Pago pendiente de confirmar');
  assert.equal(
    purchaseStatusLabel(purchase({ status: 'expired', expiresAt: '2026-11-12T12:00:00Z' }), NOW).label,
    'Caducó el 12 nov 2026',
  );
  assert.deepEqual(purchaseStatusLabel(purchase({ status: 'refunded' }), NOW), { label: 'Reembolsada', tone: 'danger' });
  assert.equal(purchaseStatusLabel(purchase({ status: 'revoked' }), NOW).label, 'Revocada');
  assert.equal(purchaseStatusLabel(purchase({ status: 'desconocido' }), NOW).label, 'Estado desconocido');
});

test('nombra la tienda de cada compra', () => {
  assert.equal(purchaseStoreLabel({ store: 'google_play' }), 'Google Play');
  assert.equal(purchaseStoreLabel({ store: 'app_store' }), 'App Store');
  assert.equal(purchaseStoreLabel({ store: 'stripe' }), 'Web');
});

test('cada plataforma cobra con su tienda y la web con ninguna', () => {
  assert.equal(storeForPlatform('android'), 'google_play');
  assert.equal(storeForPlatform('ios'), 'app_store');
  assert.equal(storeForPlatform('web'), null);
});

test('varias suscripciones conviven: cada una se refleja en su producto', () => {
  const hyrox = subscription('hyrox', 'program-hyrox');
  const athx = subscription('athx', 'program-athx');
  const basico = subscription('basico', 'program-basico');
  const context = {
    entitlements: [
      storeEntitlement(hyrox.id, 'program-hyrox', 'google_play'),
      storeEntitlement(athx.id, 'program-athx', 'app_store'),
    ],
    purchases: [
      purchase({ id: 'p-hyrox', productKey: hyrox.productKey, store: 'google_play' }),
      purchase({ id: 'p-athx', productKey: athx.productKey, store: 'app_store', platform: 'ios' }),
    ],
    currentStore: 'google_play',
    now: NOW,
  };

  const ownedHyrox = productOwnership(hyrox, context);
  assert.equal(ownedHyrox.kind, 'owned');
  assert.equal(ownedHyrox.manageable, true);
  assert.equal(ownedHyrox.purchase.id, 'p-hyrox');

  const ownedAthx = productOwnership(athx, context);
  assert.equal(ownedAthx.kind, 'owned');
  assert.equal(ownedAthx.source, 'app_store');
  assert.equal(ownedAthx.manageable, false, 'lo contratado en iPhone no se gestiona desde Google Play');

  assert.deepEqual(productOwnership(basico, context), { kind: 'none' });
});

test('no se vuelve a vender una programación a la que ya se tiene acceso por otra vía', () => {
  const hype = subscription('hype', 'program-hype');
  const manual = { programId: 'program-hype', storeProductId: null, productKey: null, source: 'manual', expiresAt: null };
  assert.deepEqual(
    productOwnership(hype, { entitlements: [manual], purchases: [], currentStore: 'app_store', now: NOW }),
    { kind: 'covered' },
  );
});

test('una suscripción caducada deja de contar, salvo el margen sin conexión', () => {
  const hyrox = subscription('hyrox', 'program-hyrox');
  const expired = storeEntitlement(hyrox.id, 'program-hyrox', 'google_play', new Date(NOW - HOUR).toISOString());
  const base = { entitlements: [expired], purchases: [], currentStore: 'google_play', now: NOW };
  assert.equal(productOwnership(hyrox, base).kind, 'none');
  assert.equal(productOwnership(hyrox, { ...base, offline: true }).kind, 'owned');
});

test('lista las suscripciones en marcha, una por producto', () => {
  const list = currentSubscriptions(
    [
      purchase({ id: 'renewed', productKey: 'sub.hyrox.monthly' }),
      purchase({ id: 'older', productKey: 'sub.hyrox.monthly', purchasedAt: '2026-10-12T12:00:00Z' }),
      purchase({ id: 'cancelled', productKey: 'sub.athx.monthly', autoRenew: false }),
      purchase({ id: 'grace', productKey: 'sub.hype.monthly', status: 'grace_period' }),
      purchase({ id: 'expired', productKey: 'sub.basico.monthly', status: 'expired' }),
      purchase({ id: 'lapsed', productKey: 'sub.calistenia.monthly', expiresAt: '2026-11-01T12:00:00Z' }),
      purchase({ id: 'refunded', productKey: 'sub.crosstraining.monthly', status: 'refunded' }),
      purchase({ id: 'one-time', productKey: 'program.basico', productType: 'non_consumable', expiresAt: null }),
    ],
    NOW,
  );
  assert.deepEqual(
    list.map((item) => item.id),
    ['renewed', 'cancelled', 'grace'],
  );
});

test('la compra que describe un producto es la vigente', () => {
  const purchases = [
    purchase({ id: 'expired', productKey: 'sub.hyrox.monthly', status: 'expired', purchasedAt: '2026-11-15T12:00:00Z' }),
    purchase({ id: 'active', productKey: 'sub.hyrox.monthly' }),
  ];
  assert.equal(latestPurchaseFor(purchases, 'sub.hyrox.monthly', NOW).id, 'active');
  assert.equal(latestPurchaseFor(purchases, 'sub.otro.monthly', NOW), null);
});

test('muestra la próxima renovación o el fin del acceso', () => {
  assert.deepEqual(renewalInfo(purchase(), NOW), { label: 'Próxima renovación', date: '12 dic 2026' });
  assert.deepEqual(renewalInfo(purchase({ autoRenew: false }), NOW), { label: 'Acceso hasta el', date: '12 dic 2026' });
  assert.deepEqual(renewalInfo(purchase({ status: 'grace_period' }), NOW), { label: 'Acceso hasta el', date: '12 dic 2026' });
  assert.equal(renewalInfo(purchase({ status: 'on_hold' }), NOW), null);
  assert.equal(renewalInfo(purchase({ expiresAt: '2026-11-01T12:00:00Z' }), NOW), null);
  assert.equal(renewalInfo(purchase({ productType: 'non_consumable', expiresAt: null }), NOW), null);
});

test('agrupa el acceso por programación quedándose con el que dura más', () => {
  const access = accessiblePrograms(
    [
      storeEntitlement('p1', 'program-a', 'google_play', '2026-12-01T00:00:00Z'),
      storeEntitlement('p2', 'program-a', 'app_store', '2027-01-01T00:00:00Z'),
      { programId: 'program-b', storeProductId: null, productKey: null, source: 'manual', expiresAt: null },
      storeEntitlement('p3', 'program-c', 'google_play', '2026-11-01T00:00:00Z'),
    ],
    { now: NOW },
  );
  assert.deepEqual(
    access.map((item) => [item.programId, item.source]),
    [
      ['program-a', 'app_store'],
      ['program-b', 'manual'],
    ],
  );
});

test('nombra el origen de cada acceso', () => {
  assert.equal(entitlementSourceLabel('google_play'), 'Google Play');
  assert.equal(entitlementSourceLabel('app_store'), 'App Store');
  assert.equal(entitlementSourceLabel('manual'), 'Acceso concedido por Training ProgLine');
});

test('no muestra aviso cuando el servidor concede el acceso', () => {
  assert.equal(messageForConfirmation('entitled'), null);
});

test('una compra pendiente o en verificación nunca pide volver a comprar', () => {
  assert.equal(messageForConfirmation('store_pending'), PURCHASE_PENDING_MESSAGE);
  assert.equal(messageForConfirmation('verification_delayed'), PURCHASE_VERIFYING_MESSAGE);
  assert.match(PURCHASE_PENDING_MESSAGE.message, /no hace falta que vuelvas a comprar/);
  assert.match(PURCHASE_VERIFYING_MESSAGE.message, /no vuelvas a comprar/);
});

test('explica cada motivo de rechazo del servidor', () => {
  assert.equal(messageForConfirmation('invalid', 'expired').title, 'Suscripción caducada');
  assert.equal(messageForConfirmation('invalid', 'refunded').title, 'Compra reembolsada');
  assert.equal(messageForConfirmation('invalid', 'account_mismatch').title, 'Compra de otra cuenta');
  assert.equal(messageForConfirmation('invalid', 'motivo_nuevo').title, 'Compra no válida');
  assert.equal(messageForConfirmation('ownership_conflict').title, 'Compra vinculada a otra cuenta');
  assert.equal(messageForConfirmation('test_account_restricted').title, 'Compra de prueba');
});

test('traduce los errores de la tienda y calla la cancelación del usuario', () => {
  assert.equal(messageForStoreError('user-cancelled'), null);
  assert.equal(messageForStoreError('deferred-payment'), PURCHASE_PENDING_MESSAGE);
  assert.equal(messageForStoreError('already-owned').title, 'Ya tienes esta compra');
  assert.equal(messageForStoreError('sku-not-found').title, 'Producto no disponible');
  assert.equal(messageForStoreError('network-error').title, 'Sin conexión con la tienda');
  assert.equal(messageForStoreError('billing-unavailable').title, 'Tienda no disponible');
  assert.match(messageForStoreError(undefined).message, /la recuperaremos automáticamente/);
});
