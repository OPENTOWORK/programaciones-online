/**
 * Crea en Google Play las suscripciones de data/store-products.json.
 *
 *   node scripts/iap-google-play-products.mjs             # solo lee y muestra el plan
 *   node scripts/iap-google-play-products.mjs --apply     # crea lo que falte (planes base en borrador)
 *   node scripts/iap-google-play-products.mjs --apply --activate   # además activa los planes base
 *
 * Credencial: GOOGLE_PLAY_SERVICE_ACCOUNT_JSON (contenido, ruta o base64), la misma que usa iap-verify.
 * Para crear productos, la cuenta de servicio necesita en Play Console el permiso «Gestionar la presencia en
 * Play Store» (Manage store presence); sin él, la API responde 403. La app debe tener subida (al menos en
 * prueba interna) una versión con el permiso com.android.vending.BILLING.
 * Solo crea suscripciones: los productos de otro tipo del manifiesto se listan y se crean desde Play Console.
 *
 * Nunca modifica ni borra suscripciones existentes: solo crea las que faltan y activa planes base.
 * Activar un plan base no pone nada a la venta en la app: eso lo decide `iap-admin.mjs activate`.
 */
import 'dotenv/config';

import { googleAccessToken, parseServiceAccount } from './lib/storeApiAuth.mjs';
import { googleSubscriptionPayload, loadStoreProducts, validateStoreProducts } from './lib/storeProducts.mjs';

const API = 'https://androidpublisher.googleapis.com/androidpublisher/v3/applications';
const SCOPE = 'https://www.googleapis.com/auth/androidpublisher';

const args = new Set(process.argv.slice(2));
const APPLY = args.has('--apply');
const ACTIVATE = args.has('--activate');

const manifest = loadStoreProducts();
const errors = validateStoreProducts(manifest);
if (errors.length) {
  console.error(`data/store-products.json no es válido:\n  - ${errors.join('\n  - ')}`);
  process.exit(1);
}
const products = manifest.products.filter((product) => product.google && product.type === 'subscription');
const notSubscriptions = manifest.products.filter((product) => product.google && product.type !== 'subscription');
const packageName = manifest.android.packageName;
if (notSubscriptions.length) {
  console.log(`No son suscripciones y este script no los crea: ${notSubscriptions.map((product) => product.google.productId).join(', ')}\n`);
}

function describe(product) {
  const plan = product.google.basePlanId ? ` / ${product.google.basePlanId} (${product.billingPeriod})` : '';
  return `${product.google.productId}${plan} · ${product.price.amount} ${product.price.currency} en ${manifest.android.launchRegion}`;
}

let account;
try {
  account = parseServiceAccount(process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON);
} catch (error) {
  console.error(`GOOGLE_PLAY_SERVICE_ACCOUNT_JSON no es válido: ${error.message}`);
  process.exit(1);
}
if (!account) {
  console.log(`Google Play (${packageName}) · BLOQUEADO`);
  console.log('Falta GOOGLE_PLAY_SERVICE_ACCOUNT_JSON en .env: JSON de una cuenta de servicio de Google Cloud con la');
  console.log('Google Play Android Developer API activada e invitada en Play Console → Usuarios y permisos con');
  console.log('«Gestionar la presencia en Play Store» (para crear productos).\n');
  console.log('Se crearían estas suscripciones:');
  for (const product of products) console.log(`  · ${describe(product)}`);
  process.exit(2);
}

const token = await googleAccessToken(account, SCOPE);

async function api(path, init = {}) {
  const response = await fetch(`${API}/${encodeURIComponent(packageName)}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...init.headers },
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : {};
  if (!response.ok) {
    const message = body.error?.message ?? text.slice(0, 300);
    throw new Error(`${init.method ?? 'GET'} ${path} → ${response.status}: ${message}`);
  }
  return body;
}

async function listSubscriptions() {
  const all = [];
  let pageToken = '';
  do {
    const query = new URLSearchParams({ pageSize: '100', ...(pageToken ? { pageToken } : {}) });
    const page = await api(`/subscriptions?${query}`);
    all.push(...(page.subscriptions ?? []));
    pageToken = page.nextPageToken ?? '';
  } while (pageToken);
  return all;
}

console.log(`Google Play (${packageName}) · cuenta de servicio ${account.client_email}`);
console.log(APPLY ? (ACTIVATE ? 'Modo: crear y activar planes base\n' : 'Modo: crear (planes base en borrador)\n') : 'Modo: solo lectura\n');

const existing = new Map((await listSubscriptions()).map((subscription) => [subscription.productId, subscription]));
const known = new Set(products.map((product) => product.google.productId));
const others = [...existing.keys()].filter((productId) => !known.has(productId));
if (others.length) console.log(`Otras suscripciones en Play Console (no se tocan): ${others.join(', ')}\n`);

let pending = 0;
for (const product of products) {
  const { productId, basePlanId } = product.google;
  let subscription = existing.get(productId);

  if (!subscription) {
    if (!APPLY) {
      console.log(`  + ${describe(product)} → se creará`);
      pending += 1;
      continue;
    }
    const query = new URLSearchParams({ productId, 'regionsVersion.version': manifest.android.regionsVersion });
    subscription = await api(`/subscriptions?${query}`, {
      method: 'POST',
      body: JSON.stringify(googleSubscriptionPayload(manifest, product)),
    });
    console.log(`  ✓ ${describe(product)} → creada`);
  }

  const basePlan = subscription.basePlans?.find((plan) => plan.basePlanId === basePlanId);
  if (!basePlan) {
    console.log(`  ! ${productId}: existe pero no tiene el plan base «${basePlanId}». Revísalo en Play Console.`);
    pending += 1;
    continue;
  }
  if (basePlan.state === 'ACTIVE') {
    console.log(`  = ${productId}/${basePlanId}: activo`);
    continue;
  }
  if (APPLY && ACTIVATE) {
    await api(`/subscriptions/${productId}/basePlans/${basePlanId}:activate`, {
      method: 'POST',
      body: JSON.stringify({ packageName, productId, basePlanId }),
    });
    console.log(`  ✓ ${productId}/${basePlanId}: activado`);
  } else {
    console.log(`  · ${productId}/${basePlanId}: ${basePlan.state ?? 'DRAFT'} (se activa con --apply --activate)`);
    pending += 1;
  }
}

console.log(
  pending
    ? `\nPendiente: ${pending}. Los productos de Play no se venden en la app hasta ejecutar iap-admin.mjs activate.`
    : '\nTodas las suscripciones existen en Google Play con su plan base activo.',
);
