/**
 * Despliega las Edge Functions de compras y sube sus secretos desde .env.
 *
 *   node scripts/deploy-iap-functions.mjs                # despliega y sube los secretos presentes
 *   node scripts/deploy-iap-functions.mjs --secrets-only # solo sube los secretos
 *   node scripts/deploy-iap-functions.mjs --dry-run      # muestra qué haría (solo nombres, nunca valores)
 *
 * Requiere SUPABASE_ACCESS_TOKEN (https://supabase.com/dashboard/account/tokens).
 */
import 'dotenv/config';
import { spawnSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { IAP_FUNCTIONS } from './lib/iapReadiness.mjs';
import { readPrivateKey, readSecret } from './lib/storeApiAuth.mjs';
import { loadStoreProducts } from './lib/storeProducts.mjs';
import { FUNCTIONS_URL, PROJECT_REF } from './lib/supabaseDb.mjs';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const MANAGEMENT_API = `https://api.supabase.com/v1/projects/${PROJECT_REF}`;
const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has('--dry-run');
const SECRETS_ONLY = args.has('--secrets-only');

const env = (name) => process.env[name]?.trim() || null;

// Lo que leen las funciones (supabase/functions/_shared/iap/config.ts).
function functionSecrets() {
  const { android, ios } = loadStoreProducts();
  return {
    GOOGLE_PLAY_PACKAGE_NAME: android.packageName,
    APPLE_BUNDLE_ID: ios.bundleId,
    APPLE_APP_APPLE_ID: env('APPLE_APP_APPLE_ID') ?? ios.appAppleId,
    GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: readSecret(env('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON'))?.trim() ?? null,
    GOOGLE_RTDN_AUDIENCE: env('GOOGLE_RTDN_AUDIENCE'),
    GOOGLE_RTDN_SERVICE_ACCOUNT_EMAIL: env('GOOGLE_RTDN_SERVICE_ACCOUNT_EMAIL'),
    GOOGLE_RTDN_TOKEN: env('GOOGLE_RTDN_TOKEN'),
    APPLE_IAP_ISSUER_ID: env('APPLE_IAP_ISSUER_ID'),
    APPLE_IAP_KEY_ID: env('APPLE_IAP_KEY_ID'),
    APPLE_IAP_PRIVATE_KEY: readPrivateKey(env('APPLE_IAP_PRIVATE_KEY'))?.trim() ?? null,
  };
}

function missingCapabilities(secrets) {
  const missing = [];
  if (!secrets.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON) {
    missing.push('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: sin ella las compras de Google Play quedan «pendientes de verificar»');
  }
  if (!secrets.GOOGLE_RTDN_AUDIENCE && !secrets.GOOGLE_RTDN_TOKEN) {
    missing.push('GOOGLE_RTDN_AUDIENCE (o GOOGLE_RTDN_TOKEN): sin ella se rechazan las notificaciones de Google (renovaciones, cancelaciones, reembolsos)');
  }
  const apple = ['APPLE_IAP_ISSUER_ID', 'APPLE_IAP_KEY_ID', 'APPLE_IAP_PRIVATE_KEY'].filter((name) => !secrets[name]);
  if (apple.length) {
    missing.push(
      `${apple.join(', ')}: las compras de Apple se verifican igualmente por su firma, pero sin consultar la App Store Server API (renovación automática, periodo de gracia y sincronización periódica)`,
    );
  }
  return missing;
}

async function setSecrets(token, secrets) {
  const body = Object.entries(secrets)
    .filter(([, value]) => value)
    .map(([name, value]) => ({ name, value }));
  const response = await fetch(`${MANAGEMENT_API}/secrets`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`No se han podido guardar los secretos (${response.status}): ${(await response.text()).slice(0, 200)}`);
  }
  return body.map((secret) => secret.name);
}

function deploy(fn, token) {
  // --yes: la CLI de Supabase no pregunta en un despliegue no interactivo. Ejecutar este script es la confirmación.
  const cliArgs = ['supabase@latest', 'functions', 'deploy', fn.name, '--project-ref', PROJECT_REF, '--use-api', '--yes'];
  if (!fn.verifyJwt) cliArgs.push('--no-verify-jwt');
  const result = spawnSync('npx', cliArgs, {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, SUPABASE_ACCESS_TOKEN: token },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
  console.log(`✓ ${fn.name} desplegada (verify_jwt ${fn.verifyJwt}): ${FUNCTIONS_URL}/${fn.name}`);
}

async function main() {
  const secrets = functionSecrets();
  const present = Object.keys(secrets).filter((name) => secrets[name]);
  const missing = missingCapabilities(secrets);
  const token = env('SUPABASE_ACCESS_TOKEN');

  if (DRY_RUN || !token) {
    console.log(`Proyecto ${PROJECT_REF}`);
    if (!SECRETS_ONLY) console.log(`Funciones: ${IAP_FUNCTIONS.map((fn) => `${fn.name} (verify_jwt ${fn.verifyJwt})`).join(', ')}`);
    console.log(`Secretos que se subirían: ${present.join(', ')}`);
    if (missing.length) console.log(`Faltan en .env:\n  - ${missing.join('\n  - ')}`);
    if (!token) {
      console.error('\nBLOQUEADO: falta SUPABASE_ACCESS_TOKEN en .env (https://supabase.com/dashboard/account/tokens).');
      process.exit(2);
    }
    return;
  }

  if (!SECRETS_ONLY) for (const fn of IAP_FUNCTIONS) deploy(fn, token);

  const saved = await setSecrets(token, secrets);
  console.log(`✓ Secretos guardados en Supabase: ${saved.join(', ')}`);
  if (missing.length) console.log(`Aún faltan:\n  - ${missing.join('\n  - ')}`);

  console.log('\nURLs para las tiendas:');
  console.log(`  Google Play (Pub/Sub, suscripción push): ${FUNCTIONS_URL}/iap-google-rtdn`);
  console.log(`  App Store Server Notifications V2 (producción y sandbox): ${FUNCTIONS_URL}/iap-apple-notifications`);
  console.log('Comprueba el estado con: node scripts/iap-admin.mjs status');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
