import { base64UrlDecodeJson, base64UrlToBytes, toArrayBuffer, utf8Encode } from './encoding.ts';

const GOOGLE_CERTS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const GOOGLE_ISSUERS = new Set(['https://accounts.google.com', 'accounts.google.com']);
const CLOCK_SKEW_SECONDS = 300;

interface Jwk {
  kid: string;
  kty: string;
  n: string;
  e: string;
  alg?: string;
}

let jwksCache: { keys: Map<string, Jwk>; expiresAt: number } | null = null;

async function googleKeys(forceRefresh = false): Promise<Map<string, Jwk>> {
  if (!forceRefresh && jwksCache && jwksCache.expiresAt > Date.now()) return jwksCache.keys;
  const response = await fetch(GOOGLE_CERTS_URL);
  if (!response.ok) throw new Error(`No se pudieron obtener las claves de Google (${response.status})`);
  const body = (await response.json()) as { keys?: Jwk[] };
  const maxAge = Number(/max-age=(\d+)/.exec(response.headers.get('cache-control') ?? '')?.[1] ?? 3600);
  jwksCache = {
    keys: new Map((body.keys ?? []).map((key) => [key.kid, key])),
    expiresAt: Date.now() + Math.min(maxAge, 6 * 3600) * 1000,
  };
  return jwksCache.keys;
}

export interface GoogleOidcExpectations {
  audience: string;
  /** Cuenta de servicio configurada en la suscripción push de Pub/Sub. */
  email: string | null;
}

/** Verifica el token OIDC que Pub/Sub adjunta a las notificaciones push autenticadas. */
export async function verifyGoogleOidcToken(token: string, expected: GoogleOidcExpectations): Promise<boolean> {
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  try {
    const header = base64UrlDecodeJson<{ alg?: string; kid?: string }>(parts[0]);
    const claims = base64UrlDecodeJson<{
      iss?: string;
      aud?: string;
      exp?: number;
      iat?: number;
      email?: string;
      email_verified?: boolean;
    }>(parts[1]);
    if (header.alg !== 'RS256' || !header.kid) return false;

    let jwk = (await googleKeys()).get(header.kid);
    if (!jwk) jwk = (await googleKeys(true)).get(header.kid);
    if (!jwk || jwk.kty !== 'RSA') return false;

    const key = await crypto.subtle.importKey(
      'jwk',
      { kty: 'RSA', n: jwk.n, e: jwk.e, alg: 'RS256', ext: true },
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    const valid = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      key,
      toArrayBuffer(base64UrlToBytes(parts[2])),
      toArrayBuffer(utf8Encode(`${parts[0]}.${parts[1]}`)),
    );
    if (!valid) return false;

    const now = Math.floor(Date.now() / 1000);
    if (!claims.iss || !GOOGLE_ISSUERS.has(claims.iss)) return false;
    if (claims.aud !== expected.audience) return false;
    if (typeof claims.exp !== 'number' || claims.exp + CLOCK_SKEW_SECONDS < now) return false;
    if (typeof claims.iat === 'number' && claims.iat - CLOCK_SKEW_SECONDS > now) return false;
    if (expected.email && (claims.email !== expected.email || claims.email_verified !== true)) return false;
    return true;
  } catch (error) {
    console.error('Token OIDC de Pub/Sub no válido', (error as Error).message);
    return false;
  }
}
