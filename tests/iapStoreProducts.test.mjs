import assert from 'node:assert/strict';
import { generateKeyPairSync, verify } from 'node:crypto';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { evaluateReadiness, IAP_FUNCTIONS, LIFECYCLE_EVENTS } from '../scripts/lib/iapReadiness.mjs';
import { appStoreConnectToken, parseServiceAccount } from '../scripts/lib/storeApiAuth.mjs';
import {
  catalogRow,
  googleMoney,
  googleSubscriptionPayload,
  loadStoreProducts,
  validateStoreProducts,
} from '../scripts/lib/storeProducts.mjs';

const manifest = loadStoreProducts();
const clone = () => structuredClone(manifest);

test('el manifiesto de productos cumple las reglas de Google Play y App Store Connect', () => {
  assert.deepEqual(validateStoreProducts(manifest), []);
});

test('seis suscripciones mensuales independientes con los precios iniciales acordados', () => {
  const expected = {
    basico: '9.99',
    calistenia: '15.99',
    athx: '15.99',
    crosstraining: '15.99',
    hype: '15.99',
    hyrox: '15.99',
  };
  assert.equal(manifest.products.length, 6);
  for (const product of manifest.products) {
    const slug = product.productKey.split('.')[1];
    assert.equal(product.type, 'subscription');
    assert.equal(product.billingPeriod, 'P1M');
    assert.equal(product.price.currency, 'EUR');
    assert.equal(product.price.amount, expected[slug], slug);
    assert.equal(product.productKey, `sub.${slug}.monthly`);
    assert.equal(product.google.productId, `sub_${slug}`);
    assert.equal(product.google.basePlanId, 'monthly');
    assert.equal(product.apple.productId, `com.trainingprogline.app.sub.${slug}.monthly`);
    assert.equal(product.programs.length, 1);
  }
  const groups = new Set(manifest.products.map((product) => product.apple.group.referenceName));
  assert.equal(groups.size, 6, 'un grupo de Apple por suscripción para que puedan coexistir');
});

test('detecta identificadores y textos que las tiendas rechazarían', () => {
  const broken = clone();
  broken.products[0].google.productId = 'Sub-Básico';
  broken.products[1].google.basePlanId = 'Monthly_plan';
  broken.products[2].google.listing.benefits = ['Un beneficio con muchísimo más texto de lo permitido'];
  broken.products[3].apple.description = 'Una descripción para Apple claramente demasiado larga';
  broken.products[4].apple.group.referenceName = broken.products[5].apple.group.referenceName;
  broken.products[5].price.amount = '15,99';

  const errors = validateStoreProducts(broken).join('\n');
  assert.match(errors, /google\.productId no cumple/);
  assert.match(errors, /google\.basePlanId no cumple/);
  assert.match(errors, /benefits .*máximo 40/);
  assert.match(errors, /apple\.description: \d+ caracteres \(máximo 45\)/);
  assert.match(errors, /apple\.group repetido/);
  assert.match(errors, /price\.amount/);
});

test('una compra única no admite plan base y los ids no se repiten', () => {
  const broken = clone();
  broken.products[0].type = 'non_consumable';
  broken.products[1].google.productId = broken.products[2].google.productId;
  const errors = validateStoreProducts(broken).join('\n');
  assert.match(errors, /basePlanId solo existe en suscripciones/);
  assert.match(errors, /google\.productId repetido/);
});

test('convierte el precio al formato Money de Google Play', () => {
  assert.deepEqual(googleMoney('15.99', 'EUR'), { currencyCode: 'EUR', units: '15', nanos: 990_000_000 });
  assert.deepEqual(googleMoney('9.99', 'EUR'), { currencyCode: 'EUR', units: '9', nanos: 990_000_000 });
  assert.deepEqual(googleMoney('10.50', 'EUR'), { currencyCode: 'EUR', units: '10', nanos: 500_000_000 });
});

test('la suscripción de Google Play se crea mensual, renovable y solo con precio en España', () => {
  const hyrox = manifest.products.find((product) => product.productKey === 'sub.hyrox.monthly');
  const payload = googleSubscriptionPayload(manifest, hyrox);
  assert.equal(payload.packageName, 'com.trainingprogline.app');
  assert.equal(payload.productId, 'sub_hyrox');
  assert.equal(payload.listings[0].languageCode, 'es-ES');
  assert.ok(payload.listings[0].benefits.length <= 4);
  const [plan] = payload.basePlans;
  assert.equal(plan.basePlanId, 'monthly');
  assert.deepEqual(plan.autoRenewingBasePlanType, {
    billingPeriodDuration: 'P1M',
    resubscribeState: 'RESUBSCRIBE_STATE_ACTIVE',
  });
  assert.deepEqual(plan.regionalConfigs, [
    {
      regionCode: 'ES',
      newSubscriberAvailability: true,
      price: { currencyCode: 'EUR', units: '15', nanos: 990_000_000 },
    },
  ]);
});

test('la fila del catálogo nunca incluye el precio ni el estado de venta', () => {
  const row = catalogRow(manifest.products[0]);
  assert.equal(row.product_key, 'sub.basico.monthly');
  assert.equal(row.google_base_plan_id, 'monthly');
  assert.equal('active' in row || 'price' in row, false);
});

test('el token de App Store Connect es un ES256 válido de 15 minutos', () => {
  const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const pem = privateKey.export({ type: 'pkcs8', format: 'pem' });
  const token = appStoreConnectToken({ issuerId: 'issuer-1', keyId: 'KEY123', privateKey: pem });
  const [header, claims, signature] = token.split('.');

  assert.deepEqual(JSON.parse(Buffer.from(header, 'base64url')), { alg: 'ES256', kid: 'KEY123', typ: 'JWT' });
  const payload = JSON.parse(Buffer.from(claims, 'base64url'));
  assert.equal(payload.iss, 'issuer-1');
  assert.equal(payload.aud, 'appstoreconnect-v1');
  assert.equal(payload.exp - payload.iat, 900);
  assert.equal(
    verify('sha256', Buffer.from(`${header}.${claims}`), { key: publicKey, dsaEncoding: 'ieee-p1363' }, Buffer.from(signature, 'base64url')),
    true,
  );
});

test('la cuenta de servicio de Google se lee como JSON, ruta o base64', () => {
  const account = {
    client_email: 'iap@proyecto.iam.gserviceaccount.com',
    private_key: '-----BEGIN PRIVATE KEY-----\nMIIE\n-----END PRIVATE KEY-----\n',
  };
  const json = JSON.stringify(account);
  assert.deepEqual(parseServiceAccount(json), account);
  assert.deepEqual(parseServiceAccount(Buffer.from(json).toString('base64')), account);

  const dir = mkdtempSync(join(tmpdir(), 'iap-'));
  try {
    const file = join(dir, 'service-account.json');
    writeFileSync(file, json);
    assert.deepEqual(parseServiceAccount(file), account);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  assert.equal(parseServiceAccount(''), null);
  assert.throws(() => parseServiceAccount('{"client_email":"x"}'), /private_key/);
});

// --- Activación controlada -------------------------------------------------------

function fullEvidence() {
  const catalog = manifest.products.map((product) => ({ ...catalogRow(product), id: product.productKey, active: false }));
  const links = manifest.products.flatMap((product) =>
    product.programs.map((program) => ({ product_key: product.productKey, program_id: program.id })),
  );
  const purchases = manifest.products.flatMap((product) => [
    { product_key: product.productKey, store: 'google_play', verified: 1, acknowledged: 1 },
    { product_key: product.productKey, store: 'app_store', verified: 1, acknowledged: 0 },
  ]);
  const notifications = Object.entries(LIFECYCLE_EVENTS).flatMap(([store, events]) =>
    Object.values(events).map((types) => ({ store, notification_type: types[0], processed: 1 })),
  );
  const functions = IAP_FUNCTIONS.map((fn) => ({ name: fn.name, deployed: true }));
  return { catalog, links, purchases, notifications, functions };
}

test('sin pruebas reales no se puede poner nada a la venta', () => {
  const { ready, checks } = evaluateReadiness({ manifest });
  assert.equal(ready, false);
  assert.ok(checks.some((check) => !check.ok && check.label.includes('compra real verificada')));
});

test('con todas las pruebas reales y la confirmación manual, sí', () => {
  assert.equal(evaluateReadiness({ manifest, ...fullEvidence(), manualConfirmed: true }).ready, true);
  assert.equal(evaluateReadiness({ manifest, ...fullEvidence(), manualConfirmed: false }).ready, false);
});

test('en Google Play la compra debe estar reconocida (acknowledge), no solo registrada', () => {
  const evidence = fullEvidence();
  evidence.purchases = evidence.purchases.map((row) => (row.store === 'google_play' ? { ...row, acknowledged: 0 } : row));
  const { ready, checks } = evaluateReadiness({ manifest, ...evidence, manualConfirmed: true });
  assert.equal(ready, false);
  assert.ok(checks.some((check) => check.detail === 'verificada pero sin acknowledge'));
});

test('falta una notificación de reembolso o una función sin desplegar: no se activa', () => {
  const withoutRefund = fullEvidence();
  withoutRefund.notifications = withoutRefund.notifications.filter((row) => row.notification_type !== 'REFUND');
  assert.equal(evaluateReadiness({ manifest, ...withoutRefund, manualConfirmed: true }).ready, false);

  const withoutFunction = fullEvidence();
  withoutFunction.functions[1].deployed = false;
  assert.equal(evaluateReadiness({ manifest, ...withoutFunction, manualConfirmed: true }).ready, false);
});

test('se puede evaluar un solo producto sin exigir las compras de los demás', () => {
  const evidence = fullEvidence();
  evidence.purchases = evidence.purchases.filter((row) => row.product_key === 'sub.hyrox.monthly');
  assert.equal(
    evaluateReadiness({ manifest, ...evidence, productKeys: ['sub.hyrox.monthly'], manualConfirmed: true }).ready,
    true,
  );
  assert.equal(evaluateReadiness({ manifest, ...evidence, manualConfirmed: true }).ready, false);
});

test('ids distintos en Supabase y en el manifiesto bloquean la activación', () => {
  const evidence = fullEvidence();
  evidence.catalog[0] = { ...evidence.catalog[0], apple_product_id: 'com.trainingprogline.app.otro' };
  const { ready, checks } = evaluateReadiness({ manifest, ...evidence, manualConfirmed: true });
  assert.equal(ready, false);
  assert.ok(checks.some((check) => check.detail.includes('no coinciden')));
});
