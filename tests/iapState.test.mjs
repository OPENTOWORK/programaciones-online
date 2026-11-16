import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  appleEnvironment,
  appleTransactionState,
  applyAppleNotification,
  belongsToAnotherAccount,
  confirmationForState,
  entitlementStatusFor,
  googleProductState,
  googleSubscriptionState,
  grantsAccess,
  isGoogleAcknowledged,
  isGoogleTestPurchase,
} from '../supabase/functions/_shared/iap/state.ts';
import { pickGoogleProduct } from '../supabase/functions/_shared/iap/verify.ts';

const NOW = new Date('2026-11-16T12:00:00Z');
const HOUR = 60 * 60 * 1000;
const future = (hours) => new Date(NOW.getTime() + hours * HOUR);
const past = (hours) => new Date(NOW.getTime() - hours * HOUR);

describe('grantsAccess', () => {
  it('concede acceso a compras activas sin caducidad o con caducidad futura', () => {
    assert.equal(grantsAccess('active', null, NOW), true);
    assert.equal(grantsAccess('active', future(1).toISOString(), NOW), true);
    assert.equal(grantsAccess('grace_period', future(1).toISOString(), NOW), true);
  });

  it('no concede acceso a compras caducadas, pendientes, suspendidas o reembolsadas', () => {
    assert.equal(grantsAccess('active', past(1).toISOString(), NOW), false);
    for (const status of ['pending', 'on_hold', 'paused', 'expired', 'cancelled', 'refunded', 'revoked']) {
      assert.equal(grantsAccess(status, null, NOW), false, status);
    }
  });

  it('traduce cada estado de compra a un estado de derecho', () => {
    assert.equal(entitlementStatusFor('active'), 'active');
    assert.equal(entitlementStatusFor('grace_period'), 'active');
    assert.equal(entitlementStatusFor('pending'), 'pending');
    assert.equal(entitlementStatusFor('refunded'), 'refunded');
    assert.equal(entitlementStatusFor('revoked'), 'revoked');
    assert.equal(entitlementStatusFor('on_hold'), 'expired');
    assert.equal(entitlementStatusFor('cancelled'), 'expired');
  });
});

describe('confirmationForState', () => {
  const base = { autoRenew: null, purchasedAt: null, expiresAt: null, cancelledAt: null, refundedAt: null };

  it('responde entitled solo con acceso vigente', () => {
    assert.deepEqual(confirmationForState({ ...base, status: 'active' }, false, NOW), {
      status: 'entitled',
      alreadyGranted: false,
    });
    assert.deepEqual(confirmationForState({ ...base, status: 'active' }, true, NOW), {
      status: 'entitled',
      alreadyGranted: true,
    });
  });

  it('distingue pagos pendientes de compras sin acceso', () => {
    assert.deepEqual(confirmationForState({ ...base, status: 'pending' }, false, NOW), { status: 'store_pending' });
    assert.deepEqual(confirmationForState({ ...base, status: 'refunded' }, false, NOW), {
      status: 'invalid',
      reason: 'refunded',
    });
    assert.deepEqual(
      confirmationForState({ ...base, status: 'active', expiresAt: past(2).toISOString() }, false, NOW),
      { status: 'invalid', reason: 'active' },
    );
  });
});

describe('belongsToAnotherAccount', () => {
  const user = '6f1c2b0e-1a2b-4c3d-8e9f-0a1b2c3d4e5f';

  it('acepta compras sin cuenta asociada o de la misma cuenta (sin importar mayúsculas)', () => {
    assert.equal(belongsToAnotherAccount(null, user), false);
    assert.equal(belongsToAnotherAccount('', user), false);
    assert.equal(belongsToAnotherAccount(user.toUpperCase(), user), false);
  });

  it('detecta compras hechas desde otra cuenta', () => {
    assert.equal(belongsToAnotherAccount('11111111-1111-4111-8111-111111111111', user), true);
  });
});

describe('Google Play', () => {
  it('compra única: comprada, pendiente y cancelada', () => {
    const purchased = googleProductState({ purchaseState: 0, purchaseTimeMillis: String(past(1).getTime()) });
    assert.equal(purchased.status, 'active');
    assert.equal(purchased.expiresAt, null);
    assert.equal(purchased.purchasedAt, past(1).toISOString());
    assert.equal(googleProductState({ purchaseState: 2 }).status, 'pending');
    assert.equal(googleProductState({ purchaseState: 1 }).status, 'cancelled');
  });

  it('suscripción activa con renovación automática', () => {
    const state = googleSubscriptionState(
      {
        subscriptionState: 'SUBSCRIPTION_STATE_ACTIVE',
        startTime: past(24).toISOString(),
        lineItems: [{ productId: 'plan', expiryTime: future(24 * 29).toISOString(), autoRenewingPlan: { autoRenewEnabled: true } }],
      },
      'plan',
      NOW,
    );
    assert.equal(state.status, 'active');
    assert.equal(state.autoRenew, true);
    assert.equal(grantsAccess(state.status, state.expiresAt, NOW), true);
  });

  it('suscripción cancelada conserva el acceso hasta fin de periodo y después caduca', () => {
    const subscription = (expiryTime) => ({
      subscriptionState: 'SUBSCRIPTION_STATE_CANCELED',
      canceledStateContext: { userInitiatedCancellation: { cancelTime: past(2).toISOString() } },
      lineItems: [{ productId: 'plan', expiryTime, autoRenewingPlan: { autoRenewEnabled: false } }],
    });

    const stillPaid = googleSubscriptionState(subscription(future(48).toISOString()), 'plan', NOW);
    assert.equal(stillPaid.status, 'active');
    assert.equal(stillPaid.autoRenew, false);
    assert.equal(stillPaid.cancelledAt, past(2).toISOString());
    assert.equal(grantsAccess(stillPaid.status, stillPaid.expiresAt, NOW), true);

    const ended = googleSubscriptionState(subscription(past(1).toISOString()), 'plan', NOW);
    assert.equal(ended.status, 'expired');
  });

  it('periodo de gracia, suspensión, pausa, caducidad y pago pendiente', () => {
    const map = (subscriptionState) =>
      googleSubscriptionState(
        { subscriptionState, lineItems: [{ productId: 'plan', expiryTime: future(72).toISOString() }] },
        'plan',
        NOW,
      ).status;
    assert.equal(map('SUBSCRIPTION_STATE_IN_GRACE_PERIOD'), 'grace_period');
    assert.equal(map('SUBSCRIPTION_STATE_ON_HOLD'), 'on_hold');
    assert.equal(map('SUBSCRIPTION_STATE_PAUSED'), 'paused');
    assert.equal(map('SUBSCRIPTION_STATE_EXPIRED'), 'expired');
    assert.equal(map('SUBSCRIPTION_STATE_PENDING'), 'pending');
    assert.equal(map('SUBSCRIPTION_STATE_PENDING_PURCHASE_CANCELED'), 'cancelled');
  });

  it('detecta compras de prueba y reconocimiento', () => {
    assert.equal(isGoogleTestPurchase({ purchaseType: 0 }, 'non_consumable'), true);
    assert.equal(isGoogleTestPurchase({}, 'non_consumable'), false);
    assert.equal(isGoogleTestPurchase({ testPurchase: {} }, 'subscription'), true);
    assert.equal(isGoogleAcknowledged({ acknowledgementState: 1 }, 'non_consumable'), true);
    assert.equal(
      isGoogleAcknowledged({ acknowledgementState: 'ACKNOWLEDGEMENT_STATE_PENDING' }, 'subscription'),
      false,
    );
  });

  it('elige el producto por plan base de la suscripción', () => {
    const monthly = { id: 'm', google_base_plan_id: 'monthly' };
    const annual = { id: 'a', google_base_plan_id: 'annual' };
    const generic = { id: 'g', google_base_plan_id: null };
    assert.equal(pickGoogleProduct([monthly, annual], 'annual').id, 'a');
    assert.equal(pickGoogleProduct([monthly, generic], 'other').id, 'g');
    assert.equal(pickGoogleProduct([monthly], null).id, 'm');
    assert.equal(pickGoogleProduct([], null), null);
  });
});

describe('App Store', () => {
  const nonConsumable = {
    transactionId: '2000000001',
    originalTransactionId: '2000000001',
    bundleId: 'com.trainingprogline.app',
    productId: 'program',
    type: 'Non-Consumable',
    purchaseDate: past(1).getTime(),
    environment: 'Sandbox',
  };
  const subscription = {
    ...nonConsumable,
    productId: 'plan',
    type: 'Auto-Renewable Subscription',
    expiresDate: future(24).getTime(),
  };

  it('compra única activa y reembolsada', () => {
    assert.equal(appleTransactionState(nonConsumable, null, null, NOW).status, 'active');
    const refunded = appleTransactionState({ ...nonConsumable, revocationDate: past(0.5).getTime() }, null, null, NOW);
    assert.equal(refunded.status, 'refunded');
    assert.equal(refunded.refundedAt, past(0.5).toISOString());
  });

  it('suscripción según el estado de la API', () => {
    const renewal = { autoRenewStatus: 1, gracePeriodExpiresDate: future(48).getTime() };
    assert.equal(appleTransactionState(subscription, renewal, 1, NOW).status, 'active');
    assert.equal(appleTransactionState(subscription, renewal, 1, NOW).autoRenew, true);
    assert.equal(appleTransactionState(subscription, renewal, 2, NOW).status, 'expired');
    assert.equal(appleTransactionState(subscription, renewal, 3, NOW).status, 'on_hold');
    const grace = appleTransactionState(subscription, renewal, 4, NOW);
    assert.equal(grace.status, 'grace_period');
    assert.equal(grace.expiresAt, future(48).toISOString());
    assert.equal(appleTransactionState(subscription, renewal, 5, NOW).status, 'revoked');
  });

  it('suscripción sin estado de la API: por fechas', () => {
    assert.equal(appleTransactionState(subscription, null, null, NOW).status, 'active');
    const lapsed = { ...subscription, expiresDate: past(1).getTime() };
    assert.equal(appleTransactionState(lapsed, null, null, NOW).status, 'expired');
    assert.equal(
      appleTransactionState(lapsed, { gracePeriodExpiresDate: future(24).getTime() }, null, NOW).status,
      'grace_period',
    );
    assert.equal(appleTransactionState(lapsed, { isInBillingRetryPeriod: true }, null, NOW).status, 'on_hold');
  });

  it('cancelada pero vigente: activa sin renovación automática', () => {
    const state = appleTransactionState(subscription, { autoRenewStatus: 0 }, 1, NOW);
    assert.equal(state.status, 'active');
    assert.equal(state.autoRenew, false);
  });

  it('una suscripción mejorada deja de dar acceso', () => {
    assert.equal(appleTransactionState({ ...subscription, isUpgraded: true }, null, 1, NOW).status, 'expired');
  });

  it('notificaciones de reembolso y revocación', () => {
    const active = appleTransactionState(nonConsumable, null, null, NOW);
    assert.equal(applyAppleNotification(active, 'REFUND', NOW).status, 'refunded');
    assert.equal(applyAppleNotification(active, 'REVOKE', NOW).status, 'revoked');
    assert.equal(applyAppleNotification(active, 'DID_RENEW', NOW).status, 'active');
  });

  it('entornos', () => {
    assert.equal(appleEnvironment({ environment: 'Production' }), 'production');
    assert.equal(appleEnvironment({ environment: 'Sandbox' }), 'sandbox');
    assert.equal(appleEnvironment({ environment: 'Xcode' }), 'xcode');
  });
});
