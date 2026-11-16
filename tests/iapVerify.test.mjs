import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  applyAppleTransactionUpdate,
  confirmPurchase,
  markGooglePurchaseVoided,
  refreshGooglePurchase,
} from '../supabase/functions/_shared/iap/verify.ts';
import { appleTransactionState, applyAppleNotification } from '../supabase/functions/_shared/iap/state.ts';
import { verifyGoogleOidcToken } from '../supabase/functions/_shared/iap/googleOidc.ts';
import { createAppleLikeChain, createFakeSupabase, mockFetch, rsaServiceAccount, signJws } from './helpers/iapFakes.mjs';

const USER_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const USER_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const PACKAGE = 'com.trainingprogline.app';
const DAY = 24 * 60 * 60 * 1000;

const PROGRAM_PRODUCT = {
  id: 'prod-program',
  product_key: 'program.test',
  title: 'Programación de prueba',
  product_type: 'non_consumable',
  google_product_id: 'program_test',
  google_base_plan_id: null,
  apple_product_id: 'com.trainingprogline.app.program.test',
  active: true,
};
const PLAN_PRODUCT = {
  id: 'prod-plan',
  product_key: 'plan.test.monthly',
  title: 'Plan de prueba',
  product_type: 'subscription',
  google_product_id: 'plan_test',
  google_base_plan_id: 'monthly',
  apple_product_id: 'com.trainingprogline.app.plan.test.monthly',
  active: true,
};

function config(overrides = {}) {
  return {
    androidPackageName: PACKAGE,
    iosBundleId: PACKAGE,
    googleServiceAccount: null,
    apple: null,
    allowTestPurchases: true,
    allowXcodeTransactions: false,
    rtdnAudience: null,
    rtdnServiceAccountEmail: null,
    rtdnToken: null,
    ...overrides,
  };
}

/** Google Play simulado: compras por token y registro de reconocimientos. */
function googlePlay(purchases) {
  const acknowledged = [];
  const mock = mockFetch([
    [/oauth2\.googleapis\.com\/token/, () => ({ body: { access_token: 'test-token', expires_in: 3600 } })],
    [
      /:acknowledge$/,
      (url) => {
        acknowledged.push(url);
        return { body: {} };
      },
    ],
    [
      /purchases\/(products\/[^/]+|subscriptionsv2)\/tokens\/([^/:]+)$/,
      (url) => {
        const token = decodeURIComponent(url.split('/tokens/')[1]);
        const purchase = purchases[token];
        if (typeof purchase === 'number') return { status: purchase, body: { error: { code: purchase } } };
        return purchase ? { body: purchase } : { status: 404, body: { error: { code: 404 } } };
      },
    ],
  ]);
  return { ...mock, acknowledged };
}

describe('Google Play: confirmación de compras', () => {
  let serviceAccount;
  let fetchMock;

  beforeEach(async () => {
    serviceAccount ??= (await rsaServiceAccount()).account;
  });
  afterEach(() => fetchMock?.restore());

  const ctx = (admin, overrides) => ({ admin, config: config({ googleServiceAccount: serviceAccount, ...overrides }) });
  const confirm = (context, userId, purchaseToken, productId = 'program_test') =>
    confirmPurchase(context, userId, { store: 'google', productId, purchaseToken });

  it('concede la compra aprobada, es idempotente y no la reconoce antes que el dispositivo', async () => {
    const admin = createFakeSupabase({ users: [USER_A], products: [PROGRAM_PRODUCT] });
    fetchMock = googlePlay({
      'token-1': {
        purchaseState: 0,
        acknowledgementState: 0,
        orderId: 'GPA.1111-2222-3333-44444',
        purchaseTimeMillis: String(Date.now()),
        obfuscatedExternalAccountId: USER_A,
      },
    });

    const first = await confirm(ctx(admin), USER_A, 'token-1');
    assert.deepEqual(first.confirmation, { status: 'entitled', alreadyGranted: false });
    assert.equal(admin.tables.store_purchases.length, 1);
    assert.equal(admin.tables.store_purchases[0].user_id, USER_A);
    assert.equal(admin.tables.store_purchases[0].environment, 'production');
    assert.equal(admin.tables.user_entitlements[0].status, 'active');

    const again = await confirm(ctx(admin), USER_A, 'token-1');
    assert.deepEqual(again.confirmation, { status: 'entitled', alreadyGranted: true });
    assert.equal(admin.tables.store_purchases.length, 1);
    assert.equal(admin.tables.user_entitlements.length, 1);
    assert.equal(fetchMock.acknowledged.length, 0);
  });

  it('impide reutilizar la compra desde otra cuenta', async () => {
    const admin = createFakeSupabase({ users: [USER_A, USER_B], products: [PROGRAM_PRODUCT] });
    fetchMock = googlePlay({ 'token-1': { purchaseState: 0, obfuscatedExternalAccountId: USER_A } });

    await confirm(ctx(admin), USER_A, 'token-1');
    const other = await confirm(ctx(admin), USER_B, 'token-1');
    assert.deepEqual(other.confirmation, { status: 'ownership_conflict', alreadyGranted: true });
    assert.equal(admin.tables.user_entitlements.length, 1);
    assert.equal(admin.tables.user_entitlements[0].user_id, USER_A);
  });

  it('asigna la compra a la cuenta que pagó aunque la presente otra', async () => {
    const admin = createFakeSupabase({ users: [USER_A, USER_B], products: [PROGRAM_PRODUCT] });
    fetchMock = googlePlay({ 'token-1': { purchaseState: 0, obfuscatedExternalAccountId: USER_A } });

    const result = await confirm(ctx(admin), USER_B, 'token-1');
    assert.deepEqual(result.confirmation, { status: 'ownership_conflict', alreadyGranted: true });
    assert.equal(admin.tables.store_purchases[0].user_id, USER_A);
    assert.equal(admin.tables.user_entitlements[0].user_id, USER_A);
  });

  it('rechaza compras vinculadas a una cuenta que no existe', async () => {
    const admin = createFakeSupabase({ users: [USER_A], products: [PROGRAM_PRODUCT] });
    fetchMock = googlePlay({ 'token-1': { purchaseState: 0, obfuscatedExternalAccountId: USER_B } });
    const result = await confirm(ctx(admin), USER_A, 'token-1');
    assert.deepEqual(result.confirmation, { status: 'invalid', reason: 'account_mismatch' });
    assert.equal(admin.tables.store_purchases.length, 0);
  });

  it('pago pendiente: no concede acceso', async () => {
    const admin = createFakeSupabase({ users: [USER_A], products: [PROGRAM_PRODUCT] });
    fetchMock = googlePlay({ 'token-1': { purchaseState: 2 } });
    const result = await confirm(ctx(admin), USER_A, 'token-1');
    assert.deepEqual(result.confirmation, { status: 'store_pending' });
    assert.equal(admin.tables.user_entitlements[0].status, 'pending');
  });

  it('compras de prueba solo si se permiten', async () => {
    const admin = createFakeSupabase({ users: [USER_A], products: [PROGRAM_PRODUCT] });
    fetchMock = googlePlay({ 'token-1': { purchaseState: 0, purchaseType: 0 } });

    const blocked = await confirm(ctx(admin, { allowTestPurchases: false }), USER_A, 'token-1');
    assert.deepEqual(blocked.confirmation, { status: 'test_account_restricted' });
    assert.equal(admin.tables.store_purchases.length, 0);

    const allowed = await confirm(ctx(admin), USER_A, 'token-1');
    assert.equal(allowed.confirmation.status, 'entitled');
    assert.equal(admin.tables.store_purchases[0].environment, 'sandbox');
  });

  it('token inexistente, fallo temporal, producto desconocido y servidor sin configurar', async () => {
    const admin = createFakeSupabase({ users: [USER_A], products: [PROGRAM_PRODUCT] });
    fetchMock = googlePlay({ 'token-down': 503 });

    assert.deepEqual((await confirm(ctx(admin), USER_A, 'token-missing')).confirmation, {
      status: 'invalid',
      reason: 'not_found',
    });
    assert.deepEqual((await confirm(ctx(admin), USER_A, 'token-down')).confirmation, {
      status: 'verification_delayed',
      retryAfterMs: 30_000,
    });
    assert.deepEqual((await confirm(ctx(admin), USER_A, 'token-1', 'otro_producto')).confirmation, {
      status: 'invalid',
      reason: 'unknown_product',
    });
    const unconfigured = { admin, config: config() };
    assert.equal((await confirm(unconfigured, USER_A, 'token-1')).confirmation.status, 'verification_delayed');
    assert.equal(admin.tables.store_purchases.length, 0);
  });

  it('suscripción: renovación, cancelación con acceso vigente, caducidad y reembolso', async () => {
    const admin = createFakeSupabase({ users: [USER_A], products: [PLAN_PRODUCT] });
    const subscription = (subscriptionState, expiryOffset, autoRenewEnabled) => ({
      subscriptionState,
      startTime: new Date(Date.now() - DAY).toISOString(),
      acknowledgementState: 'ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED',
      externalAccountIdentifiers: { obfuscatedExternalAccountId: USER_A },
      lineItems: [
        {
          productId: 'plan_test',
          expiryTime: new Date(Date.now() + expiryOffset).toISOString(),
          autoRenewingPlan: { autoRenewEnabled },
          offerDetails: { basePlanId: 'monthly' },
        },
      ],
    });
    const purchases = { 'sub-1': subscription('SUBSCRIPTION_STATE_ACTIVE', 30 * DAY, true) };
    fetchMock = googlePlay(purchases);
    const context = ctx(admin);

    const first = await confirm(context, USER_A, 'sub-1', 'plan_test');
    assert.deepEqual(first.confirmation, { status: 'entitled', alreadyGranted: false });
    assert.equal(admin.tables.store_purchases[0].auto_renew, true);

    const refresh = () =>
      refreshGooglePurchase(context, {
        purchaseToken: 'sub-1',
        productId: 'plan_test',
        productType: 'subscription',
        event: 'test',
      });

    purchases['sub-1'] = subscription('SUBSCRIPTION_STATE_CANCELED', 10 * DAY, false);
    await refresh();
    assert.equal(admin.tables.store_purchases[0].status, 'active');
    assert.equal(admin.tables.store_purchases[0].auto_renew, false);
    assert.equal(admin.tables.user_entitlements[0].status, 'active');

    purchases['sub-1'] = subscription('SUBSCRIPTION_STATE_EXPIRED', -DAY, false);
    await refresh();
    assert.equal(admin.tables.store_purchases[0].status, 'expired');
    assert.equal(admin.tables.user_entitlements[0].status, 'expired');

    await markGooglePurchaseVoided(context, 'sub-1', 'test_voided');
    assert.equal(admin.tables.store_purchases[0].status, 'refunded');
    assert.equal(admin.tables.user_entitlements[0].status, 'refunded');
  });

  it('un cambio de plan retira la suscripción anterior', async () => {
    const admin = createFakeSupabase({ users: [USER_A], products: [PLAN_PRODUCT] });
    const active = (extra = {}) => ({
      subscriptionState: 'SUBSCRIPTION_STATE_ACTIVE',
      lineItems: [{ productId: 'plan_test', expiryTime: new Date(Date.now() + 30 * DAY).toISOString() }],
      ...extra,
    });
    fetchMock = googlePlay({ 'sub-old': active(), 'sub-new': active({ linkedPurchaseToken: 'sub-old' }) });

    await confirm(ctx(admin), USER_A, 'sub-old', 'plan_test');
    await confirm(ctx(admin), USER_A, 'sub-new', 'plan_test');
    const byKey = Object.fromEntries(admin.tables.store_purchases.map((row) => [row.purchase_key, row]));
    assert.equal(byKey['sub-old'].status, 'expired');
    assert.equal(byKey['sub-new'].status, 'active');
  });

  it('las notificaciones vinculan compras no confirmadas y reconocen las olvidadas', async () => {
    const admin = createFakeSupabase({ users: [USER_A], products: [PROGRAM_PRODUCT] });
    fetchMock = googlePlay({
      'token-1': {
        purchaseState: 0,
        acknowledgementState: 0,
        purchaseTimeMillis: String(Date.now() - 60 * 60 * 1000),
        obfuscatedExternalAccountId: USER_A,
      },
      'token-anon': { purchaseState: 0 },
    });
    const context = ctx(admin);

    const linked = await refreshGooglePurchase(context, {
      purchaseToken: 'token-1',
      productId: 'program_test',
      productType: 'non_consumable',
      event: 'google_one_time_1',
    });
    assert.equal(linked.user_id, USER_A);
    assert.equal(admin.tables.user_entitlements[0].status, 'active');
    assert.equal(fetchMock.acknowledged.length, 1);
    assert.equal(admin.tables.store_purchases[0].acknowledged, true);

    const anonymous = await refreshGooglePurchase(context, {
      purchaseToken: 'token-anon',
      productId: 'program_test',
      productType: 'non_consumable',
      event: 'google_one_time_1',
    });
    assert.equal(anonymous, null);
    assert.equal(admin.tables.store_purchases.length, 1);
  });
});

describe('App Store: confirmación de compras', () => {
  let chain;
  beforeEach(async () => {
    chain ??= await createAppleLikeChain();
  });

  const ctx = (admin, overrides) => ({
    admin,
    config: config({ appleRootCertificates: [chain.root], ...overrides }),
  });
  const transaction = (overrides = {}) => ({
    transactionId: '2000000001',
    originalTransactionId: '2000000001',
    bundleId: PACKAGE,
    productId: PROGRAM_PRODUCT.apple_product_id,
    type: 'Non-Consumable',
    purchaseDate: Date.now() - 60_000,
    environment: 'Sandbox',
    appAccountToken: USER_A,
    signedDate: Date.now(),
    ...overrides,
  });
  const confirm = async (context, userId, payload) =>
    confirmPurchase(context, userId, {
      store: 'apple',
      productId: payload.productId,
      purchaseToken: await signJws(chain, payload),
    });

  it('concede una compra firmada por Apple y la restaura en otro dispositivo', async () => {
    const admin = createFakeSupabase({ users: [USER_A], products: [PROGRAM_PRODUCT] });
    const first = await confirm(ctx(admin), USER_A, transaction());
    assert.deepEqual(first.confirmation, { status: 'entitled', alreadyGranted: false });
    assert.equal(admin.tables.store_purchases[0].purchase_key, '2000000001');
    assert.equal(admin.tables.store_purchases[0].environment, 'sandbox');

    const restored = await confirm(ctx(admin), USER_A, transaction());
    assert.deepEqual(restored.confirmation, { status: 'entitled', alreadyGranted: true });
    assert.equal(admin.tables.store_purchases.length, 1);
  });

  it('impide reutilizar la transacción desde otra cuenta', async () => {
    const admin = createFakeSupabase({ users: [USER_A, USER_B], products: [PROGRAM_PRODUCT] });
    await confirm(ctx(admin), USER_A, transaction());
    const other = await confirm(ctx(admin), USER_B, transaction({ appAccountToken: undefined }));
    assert.deepEqual(other.confirmation, { status: 'ownership_conflict', alreadyGranted: true });
    assert.equal(admin.tables.user_entitlements.length, 1);
  });

  it('rechaza firmas ajenas, otra app y productos cambiados', async () => {
    const admin = createFakeSupabase({ users: [USER_A], products: [PROGRAM_PRODUCT] });
    const untrusted = { admin, config: config() };
    assert.deepEqual((await confirm(untrusted, USER_A, transaction())).confirmation, {
      status: 'invalid',
      reason: 'signature',
    });
    assert.deepEqual((await confirm(ctx(admin), USER_A, transaction({ bundleId: 'com.otra.app' }))).confirmation, {
      status: 'invalid',
      reason: 'bundle_mismatch',
    });
    const mismatch = await confirmPurchase(ctx(admin), USER_A, {
      store: 'apple',
      productId: 'otro',
      purchaseToken: await signJws(chain, transaction()),
    });
    assert.deepEqual(mismatch.confirmation, { status: 'invalid', reason: 'product_mismatch' });
    assert.equal(admin.tables.store_purchases.length, 0);
  });

  it('Sandbox y TestFlight solo si se permiten compras de prueba', async () => {
    const admin = createFakeSupabase({ users: [USER_A], products: [PROGRAM_PRODUCT] });
    const result = await confirm(ctx(admin, { allowTestPurchases: false }), USER_A, transaction());
    assert.deepEqual(result.confirmation, { status: 'test_account_restricted' });
  });

  it('suscripción caducada: no concede acceso', async () => {
    const admin = createFakeSupabase({ users: [USER_A], products: [PLAN_PRODUCT] });
    const result = await confirm(
      ctx(admin),
      USER_A,
      transaction({
        productId: PLAN_PRODUCT.apple_product_id,
        type: 'Auto-Renewable Subscription',
        expiresDate: Date.now() - 60_000,
      }),
    );
    assert.deepEqual(result.confirmation, { status: 'invalid', reason: 'expired' });
    assert.equal(admin.tables.user_entitlements[0].status, 'expired');
  });

  it('las notificaciones aplican renovaciones y reembolsos', async () => {
    const admin = createFakeSupabase({ users: [USER_A], products: [PLAN_PRODUCT] });
    const context = ctx(admin);
    const renewed = transaction({
      transactionId: '2000000002',
      productId: PLAN_PRODUCT.apple_product_id,
      type: 'Auto-Renewable Subscription',
      expiresDate: Date.now() + 30 * DAY,
    });

    const apply = (tx, status, type) =>
      applyAppleTransactionUpdate(context, {
        transaction: tx,
        renewal: { autoRenewStatus: 1 },
        subscriptionStatus: status,
        state: applyAppleNotification(appleTransactionState(tx, { autoRenewStatus: 1 }, status), type),
        event: type,
      });

    const purchase = await apply(renewed, 1, 'DID_RENEW');
    assert.equal(purchase.user_id, USER_A);
    assert.equal(admin.tables.user_entitlements[0].status, 'active');

    await apply({ ...renewed, revocationDate: Date.now() }, 1, 'REFUND');
    assert.equal(admin.tables.store_purchases[0].status, 'refunded');
    assert.equal(admin.tables.user_entitlements[0].status, 'refunded');
  });
});

describe('Pub/Sub: token OIDC de Google', () => {
  let keys;
  let fetchMock;
  afterEach(() => fetchMock?.restore());

  async function token(claims, kid = 'test-kid') {
    keys ??= (await rsaServiceAccount()).keys;
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', kid, typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(claims)).toString('base64url');
    const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', keys.privateKey, new TextEncoder().encode(`${header}.${body}`));
    return `${header}.${body}.${Buffer.from(signature).toString('base64url')}`;
  }

  async function serveKeys() {
    const jwk = await crypto.subtle.exportKey('jwk', keys.publicKey);
    fetchMock = mockFetch([[/oauth2\/v3\/certs/, () => ({ body: { keys: [{ ...jwk, kid: 'test-kid', alg: 'RS256' }] } })]]);
  }

  const claims = (overrides = {}) => ({
    iss: 'https://accounts.google.com',
    aud: 'https://example.supabase.co/functions/v1/iap-google-rtdn',
    email: 'pubsub-push@test.iam.gserviceaccount.com',
    email_verified: true,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...overrides,
  });
  const expected = {
    audience: 'https://example.supabase.co/functions/v1/iap-google-rtdn',
    email: 'pubsub-push@test.iam.gserviceaccount.com',
  };

  it('acepta el token de la suscripción push y rechaza los demás', async () => {
    const valid = await token(claims());
    await serveKeys();
    assert.equal(await verifyGoogleOidcToken(valid, expected), true);
    assert.equal(await verifyGoogleOidcToken(await token(claims({ aud: 'otra' })), expected), false);
    assert.equal(await verifyGoogleOidcToken(await token(claims({ email: 'otro@x.com' })), expected), false);
    assert.equal(
      await verifyGoogleOidcToken(await token(claims({ exp: Math.floor(Date.now() / 1000) - 3600 })), expected),
      false,
    );
    const [header, body] = valid.split('.');
    assert.equal(await verifyGoogleOidcToken(`${header}.${body}.AAAA`, expected), false);
  });
});
