import { importPrivateKey, signJwt } from './jwt.ts';

const PRODUCTION_URL = 'https://api.storekit.itunes.apple.com';
const SANDBOX_URL = 'https://api.storekit-sandbox.itunes.apple.com';

export interface AppleApiCredentials {
  issuerId: string;
  keyId: string;
  privateKey: string;
}

export class AppleApiError extends Error {
  readonly kind: 'invalid' | 'retry';
  readonly httpStatus?: number;

  constructor(message: string, kind: 'invalid' | 'retry', httpStatus?: number) {
    super(message);
    this.name = 'AppleApiError';
    this.kind = kind;
    this.httpStatus = httpStatus;
  }
}

export interface AppleSubscriptionStatuses {
  environment?: string;
  bundleId?: string;
  data?: Array<{
    subscriptionGroupIdentifier?: string;
    lastTransactions?: Array<{
      originalTransactionId?: string;
      status?: number;
      signedTransactionInfo?: string;
      signedRenewalInfo?: string;
    }>;
  }>;
}

async function bearer(credentials: AppleApiCredentials, bundleId: string) {
  const key = await importPrivateKey(credentials.privateKey, 'ES256');
  const now = Math.floor(Date.now() / 1000);
  return signJwt(
    { kid: credentials.keyId, typ: 'JWT' },
    { iss: credentials.issuerId, iat: now, exp: now + 15 * 60, aud: 'appstoreconnect-v1', bid: bundleId },
    key,
    'ES256',
  );
}

async function get<T>(
  credentials: AppleApiCredentials,
  bundleId: string,
  environment: 'production' | 'sandbox',
  path: string,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${environment === 'production' ? PRODUCTION_URL : SANDBOX_URL}${path}`, {
      headers: { Authorization: `Bearer ${await bearer(credentials, bundleId)}` },
    });
  } catch {
    throw new AppleApiError('Sin conexión con el App Store', 'retry');
  }

  if (response.ok) return (await response.json()) as T;

  const detail = await response.text().catch(() => '');
  console.error(`App Store Server API ${response.status}: ${detail.slice(0, 300)}`);
  const kind = response.status === 400 || response.status === 404 ? 'invalid' : 'retry';
  throw new AppleApiError(`App Store respondió ${response.status}`, kind, response.status);
}

/** Estado actual de las suscripciones de la transacción (renovaciones, gracia, revocaciones). */
export function getAllSubscriptionStatuses(
  credentials: AppleApiCredentials,
  bundleId: string,
  environment: 'production' | 'sandbox',
  transactionId: string,
): Promise<AppleSubscriptionStatuses> {
  return get(credentials, bundleId, environment, `/inApps/v1/subscriptions/${encodeURIComponent(transactionId)}`);
}

/** Versión actual firmada de una transacción (refleja reembolsos de compras únicas). */
export async function getTransactionInfo(
  credentials: AppleApiCredentials,
  bundleId: string,
  environment: 'production' | 'sandbox',
  transactionId: string,
): Promise<string | null> {
  const body = await get<{ signedTransactionInfo?: string }>(
    credentials,
    bundleId,
    environment,
    `/inApps/v1/transactions/${encodeURIComponent(transactionId)}`,
  );
  return body.signedTransactionInfo ?? null;
}
