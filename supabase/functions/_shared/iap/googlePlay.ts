import type { GoogleServiceAccount } from './config.ts';
import { importPrivateKey, signJwt } from './jwt.ts';
import type { GoogleProductPurchase, GoogleSubscriptionPurchase } from './state.ts';

const ANDROID_PUBLISHER = 'https://androidpublisher.googleapis.com/androidpublisher/v3/applications';
const SCOPE = 'https://www.googleapis.com/auth/androidpublisher';
const DEFAULT_TOKEN_URI = 'https://oauth2.googleapis.com/token';

/** `invalid`: Google no reconoce la compra. `retry`: fallo temporal o de configuración. */
export class GooglePlayError extends Error {
  readonly kind: 'invalid' | 'retry';
  readonly httpStatus?: number;

  constructor(message: string, kind: 'invalid' | 'retry', httpStatus?: number) {
    super(message);
    this.name = 'GooglePlayError';
    this.kind = kind;
    this.httpStatus = httpStatus;
  }
}

let cachedToken: { email: string; token: string; expiresAt: number } | null = null;

async function accessToken(account: GoogleServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.email === account.client_email && cachedToken.expiresAt - 60 > now) {
    return cachedToken.token;
  }

  const tokenUri = account.token_uri ?? DEFAULT_TOKEN_URI;
  const key = await importPrivateKey(account.private_key, 'RS256');
  const assertion = await signJwt(
    { typ: 'JWT' },
    { iss: account.client_email, scope: SCOPE, aud: tokenUri, iat: now, exp: now + 3600 },
    key,
    'RS256',
  );

  const response = await fetch(tokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
  });
  if (!response.ok) {
    throw new GooglePlayError(`No se pudo autenticar con Google (${response.status})`, 'retry', response.status);
  }

  const body = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!body.access_token) throw new GooglePlayError('Google no devolvió token de acceso', 'retry');
  cachedToken = { email: account.client_email, token: body.access_token, expiresAt: now + (body.expires_in ?? 3600) };
  return body.access_token;
}

async function request<T>(account: GoogleServiceAccount, url: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: { Authorization: `Bearer ${await accessToken(account)}`, ...(init.headers ?? {}) },
    });
  } catch (error) {
    if (error instanceof GooglePlayError) throw error;
    throw new GooglePlayError('Sin conexión con Google Play', 'retry');
  }

  if (response.ok) {
    const text = await response.text();
    return (text ? JSON.parse(text) : {}) as T;
  }

  const detail = await response.text().catch(() => '');
  console.error(`Google Play ${response.status}: ${detail.slice(0, 300)}`);
  // 400/404/410: token inexistente, de otra app o caducado hace tiempo.
  const kind = response.status === 400 || response.status === 404 || response.status === 410 ? 'invalid' : 'retry';
  throw new GooglePlayError(`Google Play respondió ${response.status}`, kind, response.status);
}

function path(packageName: string, ...segments: string[]) {
  return [ANDROID_PUBLISHER, encodeURIComponent(packageName), ...segments.map(encodeURIComponent)].join('/');
}

export function getProductPurchase(
  account: GoogleServiceAccount,
  packageName: string,
  productId: string,
  purchaseToken: string,
): Promise<GoogleProductPurchase> {
  return request(account, path(packageName, 'purchases', 'products', productId, 'tokens', purchaseToken));
}

export function getSubscriptionPurchase(
  account: GoogleServiceAccount,
  packageName: string,
  purchaseToken: string,
): Promise<GoogleSubscriptionPurchase> {
  return request(account, path(packageName, 'purchases', 'subscriptionsv2', 'tokens', purchaseToken));
}

/** Reconoce la compra desde el servidor: Google la reembolsa si nadie lo hace en 3 días. */
export async function acknowledgePurchase(
  account: GoogleServiceAccount,
  packageName: string,
  productType: 'non_consumable' | 'subscription',
  productId: string,
  purchaseToken: string,
): Promise<void> {
  const collection = productType === 'subscription' ? 'subscriptions' : 'products';
  await request(account, `${path(packageName, 'purchases', collection, productId, 'tokens', purchaseToken)}:acknowledge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
}
