import { base64UrlEncodeJson, bytesToBase64Url, pemToDer, toArrayBuffer, utf8Encode } from './encoding.ts';

type JwtAlgorithm = 'RS256' | 'ES256';

const IMPORT_PARAMS: Record<JwtAlgorithm, RsaHashedImportParams | EcKeyImportParams> = {
  RS256: { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
  ES256: { name: 'ECDSA', namedCurve: 'P-256' },
};

const SIGN_PARAMS: Record<JwtAlgorithm, AlgorithmIdentifier | EcdsaParams> = {
  RS256: { name: 'RSASSA-PKCS1-v1_5' },
  ES256: { name: 'ECDSA', hash: 'SHA-256' },
};

/** Importa una clave privada PKCS#8 en PEM (cuenta de servicio de Google o clave .p8 de Apple). */
export function importPrivateKey(pem: string, algorithm: JwtAlgorithm): Promise<CryptoKey> {
  return crypto.subtle.importKey('pkcs8', toArrayBuffer(pemToDer(pem)), IMPORT_PARAMS[algorithm], false, ['sign']);
}

/** Firma un JWT compacto. ECDSA en WebCrypto ya devuelve r||s, el formato que pide JWS. */
export async function signJwt(
  header: Record<string, unknown>,
  payload: Record<string, unknown>,
  key: CryptoKey,
  algorithm: JwtAlgorithm,
): Promise<string> {
  const signingInput = `${base64UrlEncodeJson({ ...header, alg: algorithm })}.${base64UrlEncodeJson(payload)}`;
  const signature = await crypto.subtle.sign(SIGN_PARAMS[algorithm], key, toArrayBuffer(utf8Encode(signingInput)));
  return `${signingInput}.${bytesToBase64Url(new Uint8Array(signature))}`;
}
