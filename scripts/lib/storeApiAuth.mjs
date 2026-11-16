import { createSign, sign } from 'crypto';
import { existsSync, readFileSync } from 'fs';

const base64url = (value) => Buffer.from(value).toString('base64url');

/** Un secreto puede venir como contenido o como ruta a un archivo local (nunca se imprime). */
export function readSecret(value) {
  const raw = value?.trim();
  if (!raw) return null;
  return existsSync(raw) ? readFileSync(raw, 'utf8') : raw;
}

/** Clave PEM (.p8): admite el contenido en una sola línea con «\n» escritos literalmente. */
export function readPrivateKey(value) {
  return readSecret(value)?.replace(/\\n/g, '\n') ?? null;
}

/** JSON de la cuenta de servicio de Google: contenido, ruta o base64. */
export function parseServiceAccount(value) {
  const raw = readSecret(value);
  if (!raw) return null;
  const json = raw.trimStart().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
  const account = JSON.parse(json);
  if (!account.client_email || !account.private_key) {
    throw new Error('La cuenta de servicio no tiene client_email y private_key');
  }
  return account;
}

export async function googleAccessToken(account, scope) {
  const tokenUri = account.token_uri ?? 'https://oauth2.googleapis.com/token';
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${base64url(
    JSON.stringify({ iss: account.client_email, scope, aud: tokenUri, iat: now, exp: now + 3600 }),
  )}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  const assertion = `${unsigned}.${signer.sign(account.private_key).toString('base64url')}`;

  const response = await fetch(tokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.access_token) {
    throw new Error(`Google no ha dado acceso a la cuenta de servicio: ${body.error_description ?? body.error ?? response.status}`);
  }
  return body.access_token;
}

/** Token de la App Store Connect API (clave de equipo con rol App Manager o superior). */
export function appStoreConnectToken({ issuerId, keyId, privateKey }) {
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${base64url(JSON.stringify({ alg: 'ES256', kid: keyId, typ: 'JWT' }))}.${base64url(
    JSON.stringify({ iss: issuerId, iat: now, exp: now + 15 * 60, aud: 'appstoreconnect-v1' }),
  )}`;
  const signature = sign('sha256', Buffer.from(unsigned), { key: privateKey, dsaEncoding: 'ieee-p1363' });
  return `${unsigned}.${signature.toString('base64url')}`;
}
