/**
 * Crea en App Store Connect las suscripciones de data/store-products.json.
 *
 *   node scripts/iap-app-store-products.mjs           # solo lee y muestra el plan
 *   node scripts/iap-app-store-products.mjs --apply   # crea grupos, suscripciones, textos, disponibilidad y precio
 *
 * Credencial: clave de equipo de la App Store Connect API con rol App Manager, Admin o Account Holder
 * (Usuarios y acceso → Integraciones → App Store Connect API). La clave de compras dentro de la app
 * (APPLE_IAP_*) no sirve para esto.
 *   APP_STORE_CONNECT_ISSUER_ID, APP_STORE_CONNECT_KEY_ID, APP_STORE_CONNECT_PRIVATE_KEY (contenido o ruta del .p8)
 *   (también acepta EXPO_ASC_ISSUER_ID, EXPO_ASC_KEY_ID, EXPO_ASC_API_KEY_PATH, los de EAS Submit)
 *
 * Es idempotente y nunca modifica ni borra lo que ya existe. Apple exige además, desde la web, una captura
 * para la revisión de cada suscripción y enviarlas junto con una versión de la app.
 * Solo crea suscripciones: los productos de otro tipo del manifiesto se listan y se crean desde App Store Connect.
 */
import 'dotenv/config';

import { appStoreConnectToken, readPrivateKey } from './lib/storeApiAuth.mjs';
import { BILLING_PERIODS, loadStoreProducts, validateStoreProducts } from './lib/storeProducts.mjs';

const API = 'https://api.appstoreconnect.apple.com';
const PLAN_TYPE = 'UPFRONT';
const APPLY = process.argv.includes('--apply');

const manifest = loadStoreProducts();
const errors = validateStoreProducts(manifest);
if (errors.length) {
  console.error(`data/store-products.json no es válido:\n  - ${errors.join('\n  - ')}`);
  process.exit(1);
}
const { appAppleId, bundleId, locale, launchTerritory } = manifest.ios;
const products = manifest.products.filter((product) => product.apple && product.type === 'subscription');
const notSubscriptions = manifest.products.filter((product) => product.apple && product.type !== 'subscription');
if (notSubscriptions.length) {
  console.log(`No son suscripciones y este script no los crea: ${notSubscriptions.map((product) => product.apple.productId).join(', ')}\n`);
}

const credentials = {
  issuerId: (process.env.APP_STORE_CONNECT_ISSUER_ID ?? process.env.EXPO_ASC_ISSUER_ID)?.trim(),
  keyId: (process.env.APP_STORE_CONNECT_KEY_ID ?? process.env.EXPO_ASC_KEY_ID)?.trim(),
  privateKey: readPrivateKey(process.env.APP_STORE_CONNECT_PRIVATE_KEY ?? process.env.EXPO_ASC_API_KEY_PATH),
};
const missing = Object.entries({
  APP_STORE_CONNECT_ISSUER_ID: credentials.issuerId,
  APP_STORE_CONNECT_KEY_ID: credentials.keyId,
  APP_STORE_CONNECT_PRIVATE_KEY: credentials.privateKey,
})
  .filter(([, value]) => !value)
  .map(([name]) => name);

function describe(product) {
  return `${product.apple.productId} · ${product.apple.displayName} · ${product.price.amount} ${product.price.currency} en ${launchTerritory} · grupo «${product.apple.group.referenceName}»`;
}

if (missing.length) {
  console.log(`App Store Connect (app ${appAppleId}, ${bundleId}) · BLOQUEADO`);
  console.log(`Falta en .env: ${missing.join(', ')}.`);
  console.log('Es una clave de equipo de la App Store Connect API con rol App Manager (no la clave de compras APPLE_IAP_*).\n');
  console.log('Se crearían estas suscripciones (una por grupo, para poder tener varias a la vez):');
  for (const product of products) console.log(`  · ${describe(product)}`);
  process.exit(2);
}

let token = '';
let tokenIssuedAt = 0;
function bearer() {
  if (Date.now() - tokenIssuedAt > 10 * 60 * 1000) {
    token = appStoreConnectToken(credentials);
    tokenIssuedAt = Date.now();
  }
  return token;
}

async function api(path, init = {}) {
  const response = await fetch(path.startsWith('http') ? path : `${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${bearer()}`, 'Content-Type': 'application/json', ...init.headers },
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : {};
  if (!response.ok) {
    const detail = (body.errors ?? []).map((error) => error.detail ?? error.title).join(' · ') || text.slice(0, 300);
    const failure = new Error(`${init.method ?? 'GET'} ${path} → ${response.status}: ${detail}`);
    failure.status = response.status;
    throw failure;
  }
  return body;
}

async function listAll(path) {
  const data = [];
  const included = [];
  let next = path;
  while (next) {
    const page = await api(next);
    data.push(...(page.data ?? []));
    included.push(...(page.included ?? []));
    next = page.links?.next ?? null;
  }
  return { data, included };
}

const create = (type, attributes, relationships) =>
  api(`/v1/${type}`, { method: 'POST', body: JSON.stringify({ data: { type, attributes, relationships } }) }).then(
    (body) => body.data,
  );
const ref = (type, id) => ({ data: { type, id } });

async function localizeGroup(group, product) {
  const attributes = { name: product.apple.group.displayName, locale };
  try {
    const version = await create('subscriptionGroupVersions', {}, { subscriptionGroup: ref('subscriptionGroups', group.id) });
    await api('/v2/subscriptionGroupLocalizations', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'subscriptionGroupLocalizations',
          attributes,
          relationships: { subscriptionGroupVersion: ref('subscriptionGroupVersions', version.id) },
        },
      }),
    });
  } catch (error) {
    if (error.status !== 404 && error.status !== 405) throw error;
    await create('subscriptionGroupLocalizations', attributes, { subscriptionGroup: ref('subscriptionGroups', group.id) });
  }
}

async function findPricePoint(subscriptionId, amount) {
  const query = new URLSearchParams({ 'filter[territory]': launchTerritory, limit: '200' });
  const { data } = await listAll(`/v1/subscriptions/${subscriptionId}/pricePoints?${query}`);
  return data.find((point) => Number(point.attributes?.customerPrice) === Number(amount)) ?? null;
}

const app = (await api(`/v1/apps/${appAppleId}`)).data;
if (app.attributes?.bundleId !== bundleId) {
  console.error(`La app ${appAppleId} es ${app.attributes?.bundleId}, no ${bundleId}. No se toca nada.`);
  process.exit(1);
}
console.log(`App Store Connect · ${app.attributes.name} (${bundleId})`);
console.log(APPLY ? 'Modo: crear lo que falte\n' : 'Modo: solo lectura\n');

const groupsResponse = await listAll(
  `/v1/apps/${appAppleId}/subscriptionGroups?include=subscriptions&limit=200&limit[subscriptions]=50`,
);
const groups = new Map(groupsResponse.data.map((group) => [group.attributes.referenceName, group]));
const subscriptionsByProductId = new Map(
  groupsResponse.included
    .filter((item) => item.type === 'subscriptions')
    .map((subscription) => [subscription.attributes.productId, subscription]),
);
const groupOfSubscription = new Map(
  groupsResponse.data.flatMap((group) =>
    (group.relationships?.subscriptions?.data ?? []).map((item) => [item.id, group.attributes.referenceName]),
  ),
);

let pending = 0;
for (const product of products) {
  const { productId, referenceName, displayName, description, group: groupSpec } = product.apple;
  const label = `${productId}`;
  let subscription = subscriptionsByProductId.get(productId);

  if (subscription) {
    const currentGroup = groupOfSubscription.get(subscription.id);
    if (currentGroup && currentGroup !== groupSpec.referenceName) {
      console.log(`  ! ${label}: está en el grupo «${currentGroup}», no en «${groupSpec.referenceName}». No se mueve.`);
    }
  }

  if (!subscription && !APPLY) {
    console.log(`  + ${describe(product)} → se creará`);
    pending += 1;
    continue;
  }

  if (!subscription) {
    let group = groups.get(groupSpec.referenceName);
    if (!group) {
      group = await create('subscriptionGroups', { referenceName: groupSpec.referenceName }, { app: ref('apps', appAppleId) });
      groups.set(groupSpec.referenceName, group);
      await localizeGroup(group, product);
      console.log(`  ✓ grupo «${groupSpec.referenceName}» creado`);
    }
    subscription = await create(
      'subscriptions',
      {
        name: referenceName,
        productId,
        subscriptionPeriod: BILLING_PERIODS[product.billingPeriod],
        familySharable: false,
        groupLevel: 1,
        reviewNote: `Da acceso a la programación ${product.programs.map((program) => program.name).join(', ')} dentro de la app.`,
      },
      { group: ref('subscriptionGroups', group.id) },
    );
    console.log(`  ✓ ${label}: creada`);
  }

  const localizations = await listAll(`/v1/subscriptions/${subscription.id}/subscriptionLocalizations?limit=50`);
  if (!localizations.data.some((item) => item.attributes?.locale === locale)) {
    if (APPLY) {
      await create('subscriptionLocalizations', { name: displayName, description, locale }, {
        subscription: ref('subscriptions', subscription.id),
      });
      console.log(`  ✓ ${label}: textos ${locale}`);
    } else {
      console.log(`  · ${label}: faltan los textos ${locale}`);
      pending += 1;
    }
  }

  const availability = await listAll(`/v1/subscriptions/${subscription.id}/planAvailabilities?limit=50`).catch(() => ({ data: [] }));
  if (!availability.data.length) {
    if (APPLY) {
      await create(
        'subscriptionPlanAvailabilities',
        { planType: PLAN_TYPE, availableInNewTerritories: false },
        {
          subscription: ref('subscriptions', subscription.id),
          availableTerritories: { data: [{ type: 'territories', id: launchTerritory }] },
        },
      );
      console.log(`  ✓ ${label}: disponible en ${launchTerritory}`);
    } else {
      console.log(`  · ${label}: sin disponibilidad por territorios`);
      pending += 1;
    }
  }

  const prices = await listAll(
    `/v1/subscriptions/${subscription.id}/prices?${new URLSearchParams({ 'filter[territory]': launchTerritory, limit: '50' })}`,
  );
  if (!prices.data.length) {
    const point = await findPricePoint(subscription.id, product.price.amount);
    if (!point) {
      console.log(`  ! ${label}: Apple no tiene un punto de precio de ${product.price.amount} en ${launchTerritory}.`);
      pending += 1;
    } else if (APPLY) {
      await create(
        'subscriptionPrices',
        { preserveCurrentPrice: false, planType: PLAN_TYPE },
        {
          subscription: ref('subscriptions', subscription.id),
          subscriptionPricePoint: ref('subscriptionPricePoints', point.id),
          territory: ref('territories', launchTerritory),
        },
      );
      console.log(`  ✓ ${label}: precio ${point.attributes.customerPrice} en ${launchTerritory}`);
    } else {
      console.log(`  · ${label}: sin precio (se fijará ${point.attributes.customerPrice} en ${launchTerritory})`);
      pending += 1;
    }
  }

  const state = (await api(`/v1/subscriptions/${subscription.id}`)).data.attributes?.state;
  console.log(`  = ${label}: estado ${state}`);
}

console.log(
  pending
    ? `\nPendiente: ${pending}. Ejecuta con --apply para crearlo.`
    : '\nLas suscripciones existen en App Store Connect con textos, disponibilidad y precio.',
);
console.log(
  'Apple exige además, en App Store Connect, una captura para la revisión de cada suscripción y enviarlas junto con la próxima versión.',
);
