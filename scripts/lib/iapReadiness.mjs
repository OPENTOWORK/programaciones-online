import { catalogRow } from './storeProducts.mjs';

export const IAP_FUNCTIONS = [
  { name: 'iap-verify', verifyJwt: true },
  { name: 'iap-google-rtdn', verifyJwt: false },
  { name: 'iap-apple-notifications', verifyJwt: false },
];

// Tipos que registran iap-google-rtdn (`subscription_<notificationType>`, `voided`) e
// iap-apple-notifications (notificationType de App Store Server Notifications V2).
export const LIFECYCLE_EVENTS = {
  google_play: {
    purchase: ['subscription_4'],
    renewal: ['subscription_2'],
    cancellation: ['subscription_3'],
    expiry: ['subscription_13'],
    refund: ['voided', 'subscription_12'],
  },
  app_store: {
    purchase: ['SUBSCRIBED'],
    renewal: ['DID_RENEW'],
    cancellation: ['DID_CHANGE_RENEWAL_STATUS'],
    expiry: ['EXPIRED'],
    refund: ['REFUND', 'REVOKE'],
  },
};

const STORE_LABEL = { google_play: 'Google Play', app_store: 'App Store' };
const EVENT_LABEL = {
  purchase: 'alta',
  renewal: 'renovación',
  cancellation: 'cancelación',
  expiry: 'caducidad',
  refund: 'reembolso',
};

export const MANUAL_CHECKS = [
  'Restaurar compras tras reinstalar, en Android y en iPhone',
  'Lo contratado en una plataforma da acceso en la otra y en la web con la misma cuenta',
  'Cancelar mantiene el acceso hasta el final del periodo pagado',
  'La versión publicada anterior de la app sigue funcionando con los productos a la venta',
];

function storesOf(product) {
  return [product.google ? 'google_play' : null, product.apple ? 'app_store' : null].filter(Boolean);
}

function sameCatalog(expected, row) {
  return (
    row.product_type === expected.product_type &&
    row.google_product_id === expected.google_product_id &&
    (row.google_base_plan_id ?? null) === expected.google_base_plan_id &&
    row.apple_product_id === expected.apple_product_id
  );
}

/**
 * Comprueba si los productos pueden ponerse a la venta. Solo usa datos reales de la base de datos
 * (compras verificadas por el backend y notificaciones procesadas), nunca simulaciones.
 */
export function evaluateReadiness({
  manifest,
  catalog = [],
  links = [],
  purchases = [],
  notifications = [],
  functions = [],
  productKeys,
  manualConfirmed = false,
}) {
  const checks = [];
  const add = (scope, label, ok, detail = '', blocking = true) => checks.push({ scope, label, ok, blocking, detail });

  const products = manifest.products.filter((product) => !productKeys || productKeys.includes(product.productKey));
  const stores = [...new Set(products.flatMap(storesOf))];

  for (const fn of IAP_FUNCTIONS) {
    const state = functions.find((item) => item.name === fn.name);
    add('global', `Edge Function ${fn.name} desplegada`, state?.deployed === true, state?.detail ?? 'sin comprobar');
  }

  for (const store of stores) {
    for (const [event, types] of Object.entries(LIFECYCLE_EVENTS[store])) {
      const count = notifications
        .filter((row) => row.store === store && types.includes(row.notification_type))
        .reduce((total, row) => total + Number(row.processed ?? 0), 0);
      add(
        'global',
        `${STORE_LABEL[store]}: notificación de ${EVENT_LABEL[event]} procesada`,
        count > 0,
        count > 0 ? `${count} procesada(s)` : `ninguna (${types.join(' / ')})`,
      );
    }
  }

  for (const product of products) {
    const scope = product.productKey;
    const row = catalog.find((item) => item.product_key === product.productKey);
    const expected = catalogRow(product);
    add(scope, 'En el catálogo de Supabase con los ids del manifiesto', Boolean(row && sameCatalog(expected, row)),
      row ? (sameCatalog(expected, row) ? '' : 'los ids no coinciden con data/store-products.json') : 'no existe: npm run iap:seed');

    const linked = new Set(links.filter((link) => link.product_key === product.productKey).map((link) => link.program_id));
    const missing = product.programs.filter((program) => !linked.has(program.id));
    add(scope, 'Vinculado a sus programaciones', missing.length === 0,
      missing.length ? `faltan: ${missing.map((program) => program.name).join(', ')}` : '');

    for (const store of storesOf(product)) {
      const evidence = purchases.find((item) => item.product_key === product.productKey && item.store === store);
      const verified = Number(evidence?.verified ?? 0);
      const acknowledged = Number(evidence?.acknowledged ?? 0);
      const ok = store === 'google_play' ? acknowledged > 0 : verified > 0;
      add(scope, `${STORE_LABEL[store]}: compra real verificada por el backend`, ok,
        ok ? `${verified} compra(s)` : verified > 0 ? 'verificada pero sin acknowledge' : 'ninguna');
    }
  }

  for (const label of MANUAL_CHECKS) {
    add('manual', label, manualConfirmed, manualConfirmed ? 'confirmado con --confirm-manual-tests' : 'pendiente de confirmar');
  }

  return { checks, ready: checks.every((check) => check.ok || !check.blocking) };
}
