import { APPLE_ROOT_CA_G3_BASE64 } from './appleRootCa.ts';
import { base64ToBytes, base64UrlDecodeJson, base64UrlToBytes, toArrayBuffer, utf8Encode } from './encoding.ts';
import { importCertificateKey, isSignedBy, isValidAt, parseCertificate, type ParsedCertificate } from './x509.ts';

/** Marcadores que Apple pone en los certificados de firma del App Store. */
const OID_APPLE_LEAF = '1.2.840.113635.100.6.11.1';
const OID_APPLE_INTERMEDIATE = '1.2.840.113635.100.6.2.1';

export class AppleSignatureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppleSignatureError';
  }
}

interface JwsHeader {
  alg?: string;
  x5c?: string[];
}

export interface VerifyAppleJwsOptions {
  /** Raíces de confianza en DER. Por defecto, Apple Root CA - G3. */
  trustedRoots?: Uint8Array[];
  /** Fecha para validar los certificados. Por defecto, `signedDate` del contenido o ahora. */
  effectiveDate?: Date;
}

let defaultRoots: ParsedCertificate[] | null = null;

function loadRoots(roots?: Uint8Array[]): ParsedCertificate[] {
  if (roots) return roots.map((der) => parseCertificate(der));
  defaultRoots ??= [parseCertificate(base64ToBytes(APPLE_ROOT_CA_G3_BASE64))];
  return defaultRoots;
}

/**
 * Verifica un JWS firmado por el App Store (transacciones de StoreKit 2, renovaciones
 * y notificaciones V2): cadena x5c hasta una raíz de Apple, marcadores de Apple en los
 * certificados, vigencia y firma ES256. Devuelve el contenido ya verificado.
 */
export async function verifyAppleJws<T extends { signedDate?: number }>(
  jws: string,
  options: VerifyAppleJwsOptions = {},
): Promise<T> {
  const parts = jws.split('.');
  if (parts.length !== 3) throw new AppleSignatureError('El JWS no tiene tres partes');

  let header: JwsHeader;
  let payload: T;
  try {
    header = base64UrlDecodeJson<JwsHeader>(parts[0]);
    payload = base64UrlDecodeJson<T>(parts[1]);
  } catch {
    throw new AppleSignatureError('El JWS no es JSON válido');
  }

  if (header.alg !== 'ES256') throw new AppleSignatureError('Algoritmo de firma inesperado');
  if (!Array.isArray(header.x5c) || header.x5c.length !== 3) {
    throw new AppleSignatureError('Cadena de certificados incompleta');
  }

  let leaf: ParsedCertificate;
  let intermediate: ParsedCertificate;
  try {
    leaf = parseCertificate(base64ToBytes(header.x5c[0]));
    intermediate = parseCertificate(base64ToBytes(header.x5c[1]));
  } catch {
    throw new AppleSignatureError('Certificados ilegibles');
  }

  const roots = loadRoots(options.trustedRoots);
  let anchoredRoot: ParsedCertificate | undefined;
  for (const root of roots) {
    if (await isSignedBy(intermediate, root)) {
      anchoredRoot = root;
      break;
    }
  }
  if (!anchoredRoot) throw new AppleSignatureError('La cadena no termina en una raíz de Apple');
  if (!(await isSignedBy(leaf, intermediate))) {
    throw new AppleSignatureError('El certificado de firma no lo emite el intermedio');
  }
  if (!leaf.extensionOids.has(OID_APPLE_LEAF) || !intermediate.extensionOids.has(OID_APPLE_INTERMEDIATE)) {
    throw new AppleSignatureError('Los certificados no son de firma del App Store');
  }

  const effectiveDate =
    options.effectiveDate ??
    (typeof payload.signedDate === 'number' && Number.isFinite(payload.signedDate)
      ? new Date(payload.signedDate)
      : new Date());
  if (![leaf, intermediate, anchoredRoot].every((certificate) => isValidAt(certificate, effectiveDate))) {
    throw new AppleSignatureError('Certificado fuera de vigencia');
  }

  const key = await importCertificateKey(leaf);
  let signature: Uint8Array;
  try {
    signature = base64UrlToBytes(parts[2]);
  } catch {
    throw new AppleSignatureError('Firma ilegible');
  }
  const valid = await crypto.subtle.verify(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    toArrayBuffer(signature),
    toArrayBuffer(utf8Encode(`${parts[0]}.${parts[1]}`)),
  );
  if (!valid) throw new AppleSignatureError('Firma del JWS no válida');

  return payload;
}

/** Lee el contenido de un JWS sin verificarlo. Solo para registros, nunca para conceder acceso. */
export function peekJwsPayload<T>(jws: string): T | null {
  try {
    const [, payload] = jws.split('.');
    return payload ? base64UrlDecodeJson<T>(payload) : null;
  } catch {
    return null;
  }
}
