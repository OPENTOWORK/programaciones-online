/**
 * Configuración de compras integradas. Todo lo secreto vive en los secretos de
 * Supabase Edge Functions, nunca en la app.
 */

export interface GoogleServiceAccount {
  client_email: string;
  private_key: string;
  token_uri?: string;
}

export interface IapConfig {
  androidPackageName: string;
  iosBundleId: string;
  googleServiceAccount: GoogleServiceAccount | null;
  apple: {
    issuerId: string;
    keyId: string;
    privateKey: string;
    appAppleId: string | null;
  } | null;
  /** Compras de prueba (testers de Play, Sandbox y TestFlight). App Review compra en Sandbox. */
  allowTestPurchases: boolean;
  /** Transacciones de StoreKit Testing en Xcode: no las firma Apple. Solo para desarrollo. */
  allowXcodeTransactions: boolean;
  /** Raíces de confianza para las firmas de Apple (DER). Sin valor, Apple Root CA - G3. */
  appleRootCertificates?: Uint8Array[];
  rtdnAudience: string | null;
  rtdnServiceAccountEmail: string | null;
  rtdnToken: string | null;
}

const DEFAULT_PACKAGE = 'com.trainingprogline.app';

function env(name: string): string | null {
  const value = Deno.env.get(name)?.trim();
  return value ? value : null;
}

function flag(name: string, fallback: boolean): boolean {
  const value = env(name)?.toLowerCase();
  if (value === undefined || value === null) return fallback;
  return value === 'true' || value === '1' || value === 'yes';
}

function parseServiceAccount(raw: string | null): GoogleServiceAccount | null {
  if (!raw) return null;
  try {
    const decoded = raw.startsWith('{') ? raw : atob(raw);
    const parsed = JSON.parse(decoded) as Partial<GoogleServiceAccount>;
    if (!parsed.client_email || !parsed.private_key) return null;
    return { client_email: parsed.client_email, private_key: parsed.private_key, token_uri: parsed.token_uri };
  } catch {
    console.error('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON no es un JSON válido');
    return null;
  }
}

export function loadIapConfig(): IapConfig {
  const issuerId = env('APPLE_IAP_ISSUER_ID');
  const keyId = env('APPLE_IAP_KEY_ID');
  const privateKey = env('APPLE_IAP_PRIVATE_KEY');

  return {
    androidPackageName: env('GOOGLE_PLAY_PACKAGE_NAME') ?? DEFAULT_PACKAGE,
    iosBundleId: env('APPLE_BUNDLE_ID') ?? DEFAULT_PACKAGE,
    googleServiceAccount: parseServiceAccount(env('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON')),
    apple: issuerId && keyId && privateKey
      ? { issuerId, keyId, privateKey, appAppleId: env('APPLE_APP_APPLE_ID') }
      : null,
    allowTestPurchases: flag('IAP_ALLOW_TEST_PURCHASES', true),
    allowXcodeTransactions: flag('IAP_ALLOW_XCODE_TRANSACTIONS', false),
    rtdnAudience: env('GOOGLE_RTDN_AUDIENCE'),
    rtdnServiceAccountEmail: env('GOOGLE_RTDN_SERVICE_ACCOUNT_EMAIL'),
    rtdnToken: env('GOOGLE_RTDN_TOKEN'),
  };
}
