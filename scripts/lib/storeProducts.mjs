import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const STORE_PRODUCTS_PATH = join(__dirname, '..', '..', 'data', 'store-products.json');

// Mismas reglas que el check de public.store_products.product_key.
const PRODUCT_KEY = /^[a-z0-9][a-z0-9._-]{2,63}$/;
// Google Play: minúsculas, números, «_» y «.»; empieza por letra o número; 1-40 caracteres.
const GOOGLE_PRODUCT_ID = /^[a-z0-9][a-z0-9_.]{0,39}$/;
// Google Play: plan base RFC-1034 (minúsculas, números y «-»), máximo 63 caracteres.
const GOOGLE_BASE_PLAN_ID = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
// App Store Connect: letras, números, «_» y «.».
const APPLE_PRODUCT_ID = /^[A-Za-z0-9._]{1,100}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const PRICE = /^\d{1,4}\.\d{2}$/;

export const PRODUCT_TYPES = ['subscription', 'non_consumable'];
export const BILLING_PERIODS = {
  P1W: 'ONE_WEEK',
  P1M: 'ONE_MONTH',
  P2M: 'TWO_MONTHS',
  P3M: 'THREE_MONTHS',
  P6M: 'SIX_MONTHS',
  P1Y: 'ONE_YEAR',
};

const LIMITS = {
  googleTitle: 55,
  googleDescription: 200,
  googleBenefits: 4,
  googleBenefit: 40,
  appleReferenceName: 64,
  appleDisplayName: 30,
  appleDescription: 45,
  appleGroupDisplayName: 75,
};

export function loadStoreProducts(path = STORE_PRODUCTS_PATH) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function checkLength(errors, label, value, max) {
  if (!text(value)) errors.push(`${label}: falta`);
  else if (value.length > max) errors.push(`${label}: ${value.length} caracteres (máximo ${max})`);
}

function duplicates(values) {
  const seen = new Set();
  const repeated = new Set();
  for (const value of values) {
    if (!value) continue;
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return [...repeated];
}

/** Devuelve la lista de errores del manifiesto (vacía si es válido). */
export function validateStoreProducts(manifest) {
  const errors = [];
  if (!manifest || !Array.isArray(manifest.products)) return ['El manifiesto no tiene «products»'];
  if (!text(manifest.android?.packageName)) errors.push('android.packageName: falta');
  if (!text(manifest.ios?.bundleId)) errors.push('ios.bundleId: falta');
  if (!/^\d+$/.test(text(manifest.ios?.appAppleId))) errors.push('ios.appAppleId: debe ser el Apple ID numérico');

  for (const product of manifest.products) {
    const key = text(product.productKey) || '(sin productKey)';
    const at = (field) => `${key} · ${field}`;

    if (!PRODUCT_KEY.test(text(product.productKey))) errors.push(at('productKey no válido'));
    if (!PRODUCT_TYPES.includes(product.type)) errors.push(at(`type «${product.type}» no admitido`));
    if (!Number.isInteger(product.sortOrder)) errors.push(at('sortOrder debe ser un entero'));

    const programs = Array.isArray(product.programs) ? product.programs : [];
    if (programs.length === 0) errors.push(at('programs: necesita al menos una programación'));
    for (const program of programs) {
      if (!UUID.test(text(program.id))) errors.push(at(`programs: id «${program.id}» no es un uuid`));
    }

    if (!PRICE.test(text(product.price?.amount))) errors.push(at('price.amount: formato 0.00'));
    if (!/^[A-Z]{3}$/.test(text(product.price?.currency))) errors.push(at('price.currency: código ISO 4217'));

    if (!text(product.app?.title)) errors.push(at('app.title: falta'));
    if (!Array.isArray(product.app?.benefits)) errors.push(at('app.benefits: debe ser una lista'));

    const google = product.google;
    if (google) {
      if (!GOOGLE_PRODUCT_ID.test(text(google.productId))) errors.push(at('google.productId no cumple las reglas de Play'));
      checkLength(errors, at('google.listing.title'), google.listing?.title, LIMITS.googleTitle);
      if (text(google.listing?.description).length > LIMITS.googleDescription) {
        errors.push(at(`google.listing.description: máximo ${LIMITS.googleDescription} caracteres`));
      }
      const benefits = google.listing?.benefits ?? [];
      if (benefits.length > LIMITS.googleBenefits) errors.push(at(`google.listing.benefits: máximo ${LIMITS.googleBenefits}`));
      for (const benefit of benefits) {
        if (benefit.length > LIMITS.googleBenefit) {
          errors.push(at(`google.listing.benefits «${benefit}»: máximo ${LIMITS.googleBenefit} caracteres`));
        }
      }
    }

    const apple = product.apple;
    if (apple) {
      if (!APPLE_PRODUCT_ID.test(text(apple.productId))) errors.push(at('apple.productId no cumple las reglas de App Store Connect'));
      checkLength(errors, at('apple.referenceName'), apple.referenceName, LIMITS.appleReferenceName);
      checkLength(errors, at('apple.displayName'), apple.displayName, LIMITS.appleDisplayName);
      checkLength(errors, at('apple.description'), apple.description, LIMITS.appleDescription);
    }

    if (!google && !apple) errors.push(at('necesita un producto de Google Play o de App Store'));

    if (product.type === 'subscription') {
      if (!BILLING_PERIODS[product.billingPeriod]) errors.push(at(`billingPeriod «${product.billingPeriod}» no admitido`));
      if (google && !GOOGLE_BASE_PLAN_ID.test(text(google.basePlanId))) {
        errors.push(at('google.basePlanId no cumple RFC-1034'));
      }
      if (apple) {
        checkLength(errors, at('apple.group.referenceName'), apple.group?.referenceName, LIMITS.appleReferenceName);
        checkLength(errors, at('apple.group.displayName'), apple.group?.displayName, LIMITS.appleGroupDisplayName);
      }
    } else if (google?.basePlanId) {
      errors.push(at('google.basePlanId solo existe en suscripciones'));
    }
  }

  const products = manifest.products;
  for (const value of duplicates(products.map((product) => product.productKey))) {
    errors.push(`productKey repetido: ${value}`);
  }
  for (const value of duplicates(products.map((product) => product.google?.productId))) {
    errors.push(`google.productId repetido: ${value}`);
  }
  for (const value of duplicates(products.map((product) => product.apple?.productId))) {
    errors.push(`apple.productId repetido: ${value}`);
  }
  // Cada suscripción en su propio grupo: Apple solo permite una suscripción activa por grupo.
  for (const value of duplicates(products.map((product) => product.apple?.group?.referenceName))) {
    errors.push(`apple.group repetido (las suscripciones no podrían coexistir): ${value}`);
  }

  return errors;
}

/** «15.99» → Money de la API de Google Play. */
export function googleMoney(amount, currencyCode) {
  const [units, cents = '00'] = String(amount).split('.');
  return { currencyCode, units, nanos: Number(cents.padEnd(2, '0').slice(0, 2)) * 10_000_000 };
}

/** Cuerpo de monetization.subscriptions.create (Google Play Developer API). */
export function googleSubscriptionPayload(manifest, product) {
  const { packageName, listingLanguage, launchRegion } = manifest.android;
  return {
    packageName,
    productId: product.google.productId,
    listings: [
      {
        languageCode: listingLanguage,
        title: product.google.listing.title,
        description: product.google.listing.description ?? '',
        benefits: product.google.listing.benefits ?? [],
      },
    ],
    basePlans: [
      {
        basePlanId: product.google.basePlanId,
        autoRenewingBasePlanType: {
          billingPeriodDuration: product.billingPeriod,
          resubscribeState: 'RESUBSCRIBE_STATE_ACTIVE',
        },
        regionalConfigs: [
          {
            regionCode: launchRegion,
            newSubscriberAvailability: true,
            price: googleMoney(product.price.amount, product.price.currency),
          },
        ],
      },
    ],
  };
}

/** Fila de public.store_products que corresponde a un producto del manifiesto. */
export function catalogRow(product) {
  return {
    product_key: product.productKey,
    title: product.app.title,
    description: product.app.description ?? '',
    benefits: product.app.benefits ?? [],
    product_type: product.type,
    google_product_id: product.google?.productId ?? null,
    google_base_plan_id: product.type === 'subscription' ? product.google?.basePlanId ?? null : null,
    apple_product_id: product.apple?.productId ?? null,
    sort_order: product.sortOrder,
  };
}

export function foldName(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}
