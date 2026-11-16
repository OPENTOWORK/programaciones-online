import { toArrayBuffer } from './encoding.ts';

/**
 * Lector DER mínimo para los certificados ECDSA de Apple. Solo extrae lo necesario
 * para verificar la cadena; las firmas se comprueban con WebCrypto sobre los bytes
 * exactos del certificado, así que un error de lectura hace fallar la verificación,
 * nunca la aprueba.
 */

const TAG_INTEGER = 0x02;
const TAG_BIT_STRING = 0x03;
const TAG_OCTET_STRING = 0x04;
const TAG_OID = 0x06;
const TAG_UTC_TIME = 0x17;
const TAG_GENERALIZED_TIME = 0x18;
const TAG_SEQUENCE = 0x30;
const TAG_VERSION = 0xa0;
const TAG_EXTENSIONS = 0xa3;

const OID_EC_PUBLIC_KEY = '1.2.840.10045.2.1';

const CURVES: Record<string, { name: 'P-256' | 'P-384' | 'P-521'; size: number }> = {
  '1.2.840.10045.3.1.7': { name: 'P-256', size: 32 },
  '1.3.132.0.34': { name: 'P-384', size: 48 },
  '1.3.132.0.35': { name: 'P-521', size: 66 },
};

const ECDSA_HASHES: Record<string, 'SHA-256' | 'SHA-384' | 'SHA-512'> = {
  '1.2.840.10045.4.3.2': 'SHA-256',
  '1.2.840.10045.4.3.3': 'SHA-384',
  '1.2.840.10045.4.3.4': 'SHA-512',
};

interface DerNode {
  tag: number;
  start: number;
  contentStart: number;
  end: number;
}

function readNode(bytes: Uint8Array, offset: number): DerNode {
  if (offset + 2 > bytes.length) throw new Error('DER truncado');
  const tag = bytes[offset];
  if ((tag & 0x1f) === 0x1f) throw new Error('Etiqueta DER no soportada');

  const first = bytes[offset + 1];
  let length = 0;
  let contentStart = offset + 2;

  if (first < 0x80) {
    length = first;
  } else {
    const count = first & 0x7f;
    if (count === 0 || count > 4) throw new Error('Longitud DER no soportada');
    if (offset + 2 + count > bytes.length) throw new Error('DER truncado');
    for (let index = 0; index < count; index += 1) {
      length = length * 256 + bytes[offset + 2 + index];
    }
    contentStart += count;
  }

  const end = contentStart + length;
  if (end > bytes.length) throw new Error('DER truncado');
  return { tag, start: offset, contentStart, end };
}

function childrenOf(bytes: Uint8Array, node: DerNode): DerNode[] {
  const children: DerNode[] = [];
  let cursor = node.contentStart;
  while (cursor < node.end) {
    const child = readNode(bytes, cursor);
    children.push(child);
    cursor = child.end;
  }
  if (cursor !== node.end) throw new Error('Estructura DER inválida');
  return children;
}

function expectTag(node: DerNode | undefined, tag: number, label: string): DerNode {
  if (!node || node.tag !== tag) throw new Error(`Certificado inválido: falta ${label}`);
  return node;
}

function contentOf(bytes: Uint8Array, node: DerNode) {
  return bytes.subarray(node.contentStart, node.end);
}

function decodeOid(bytes: Uint8Array): string {
  if (bytes.length === 0) throw new Error('OID vacío');
  const parts: number[] = [];
  const first = bytes[0];
  parts.push(first < 80 ? Math.floor(first / 40) : 2, first < 80 ? first % 40 : first - 80);
  let value = 0;
  for (let index = 1; index < bytes.length; index += 1) {
    value = value * 128 + (bytes[index] & 0x7f);
    if ((bytes[index] & 0x80) === 0) {
      parts.push(value);
      value = 0;
    }
  }
  return parts.join('.');
}

function decodeTime(bytes: Uint8Array, node: DerNode): Date {
  const text = String.fromCharCode(...contentOf(bytes, node));
  let match: RegExpMatchArray | null;
  let year: number;

  if (node.tag === TAG_UTC_TIME) {
    match = text.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z$/);
    if (!match) throw new Error('Fecha UTCTime inválida');
    const shortYear = Number(match[1]);
    year = shortYear >= 50 ? 1900 + shortYear : 2000 + shortYear;
  } else if (node.tag === TAG_GENERALIZED_TIME) {
    match = text.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z$/);
    if (!match) throw new Error('Fecha GeneralizedTime inválida');
    year = Number(match[1]);
  } else {
    throw new Error('Tipo de fecha no soportado');
  }

  return new Date(
    Date.UTC(year, Number(match[2]) - 1, Number(match[3]), Number(match[4]), Number(match[5]), Number(match[6])),
  );
}

export interface ParsedCertificate {
  der: Uint8Array;
  tbs: Uint8Array;
  signatureHash: 'SHA-256' | 'SHA-384' | 'SHA-512';
  signature: Uint8Array;
  spki: Uint8Array;
  curve: { name: 'P-256' | 'P-384' | 'P-521'; size: number };
  notBefore: Date;
  notAfter: Date;
  extensionOids: Set<string>;
}

export function parseCertificate(der: Uint8Array): ParsedCertificate {
  const root = readNode(der, 0);
  if (root.tag !== TAG_SEQUENCE || root.end !== der.length) throw new Error('Certificado inválido');

  const [tbsNode, algorithmNode, signatureNode] = childrenOf(der, root);
  expectTag(tbsNode, TAG_SEQUENCE, 'tbsCertificate');
  expectTag(algorithmNode, TAG_SEQUENCE, 'signatureAlgorithm');
  expectTag(signatureNode, TAG_BIT_STRING, 'signatureValue');

  const signatureOid = decodeOid(
    contentOf(der, expectTag(childrenOf(der, algorithmNode)[0], TAG_OID, 'algoritmo de firma')),
  );
  const signatureHash = ECDSA_HASHES[signatureOid];
  if (!signatureHash) throw new Error(`Algoritmo de firma no soportado: ${signatureOid}`);

  const signatureBits = contentOf(der, signatureNode);
  if (signatureBits[0] !== 0) throw new Error('Firma con bits sobrantes');

  const fields = childrenOf(der, tbsNode);
  let cursor = fields[0]?.tag === TAG_VERSION ? 1 : 0;
  expectTag(fields[cursor], TAG_INTEGER, 'serialNumber');
  cursor += 1;
  expectTag(fields[cursor], TAG_SEQUENCE, 'signature');
  cursor += 1;
  expectTag(fields[cursor], TAG_SEQUENCE, 'issuer');
  cursor += 1;
  const validityNode = expectTag(fields[cursor], TAG_SEQUENCE, 'validity');
  cursor += 1;
  expectTag(fields[cursor], TAG_SEQUENCE, 'subject');
  cursor += 1;
  const spkiNode = expectTag(fields[cursor], TAG_SEQUENCE, 'subjectPublicKeyInfo');
  cursor += 1;

  const [notBeforeNode, notAfterNode] = childrenOf(der, validityNode);
  if (!notBeforeNode || !notAfterNode) throw new Error('Certificado inválido: validez incompleta');

  const [keyAlgorithmNode] = childrenOf(der, spkiNode);
  const [keyOidNode, curveOidNode] = childrenOf(der, expectTag(keyAlgorithmNode, TAG_SEQUENCE, 'algoritmo de clave'));
  const keyOid = decodeOid(contentOf(der, expectTag(keyOidNode, TAG_OID, 'tipo de clave')));
  if (keyOid !== OID_EC_PUBLIC_KEY) throw new Error('Solo se admiten claves ECDSA');
  const curveOid = decodeOid(contentOf(der, expectTag(curveOidNode, TAG_OID, 'curva')));
  const curve = CURVES[curveOid];
  if (!curve) throw new Error(`Curva no soportada: ${curveOid}`);

  const extensionOids = new Set<string>();
  for (const node of fields.slice(cursor)) {
    if (node.tag !== TAG_EXTENSIONS) continue;
    const [sequence] = childrenOf(der, node);
    for (const extension of childrenOf(der, expectTag(sequence, TAG_SEQUENCE, 'extensiones'))) {
      const [oidNode, ...rest] = childrenOf(der, expectTag(extension, TAG_SEQUENCE, 'extensión'));
      expectTag(rest[rest.length - 1], TAG_OCTET_STRING, 'valor de extensión');
      extensionOids.add(decodeOid(contentOf(der, expectTag(oidNode, TAG_OID, 'OID de extensión'))));
    }
  }

  return {
    der,
    tbs: der.subarray(tbsNode.start, tbsNode.end),
    signatureHash,
    signature: signatureBits.subarray(1),
    spki: der.subarray(spkiNode.start, spkiNode.end),
    curve,
    notBefore: decodeTime(der, notBeforeNode),
    notAfter: decodeTime(der, notAfterNode),
    extensionOids,
  };
}

/** Convierte una firma ECDSA DER (SEQUENCE de dos INTEGER) al formato r||s de WebCrypto. */
export function ecdsaDerToRaw(der: Uint8Array, size: number): Uint8Array {
  const sequence = readNode(der, 0);
  if (sequence.tag !== TAG_SEQUENCE || sequence.end !== der.length) throw new Error('Firma ECDSA inválida');
  const parts = childrenOf(der, sequence);
  if (parts.length !== 2) throw new Error('Firma ECDSA inválida');

  const raw = new Uint8Array(size * 2);
  parts.forEach((part, index) => {
    let value = contentOf(der, expectTag(part, TAG_INTEGER, 'componente de firma'));
    while (value.length > 1 && value[0] === 0) value = value.subarray(1);
    if (value.length > size) throw new Error('Firma ECDSA demasiado larga');
    raw.set(value, index * size + (size - value.length));
  });
  return raw;
}

export function importCertificateKey(certificate: ParsedCertificate): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'spki',
    toArrayBuffer(certificate.spki),
    { name: 'ECDSA', namedCurve: certificate.curve.name },
    false,
    ['verify'],
  );
}

/** Comprueba que `certificate` está firmado por la clave de `issuer`. */
export async function isSignedBy(certificate: ParsedCertificate, issuer: ParsedCertificate): Promise<boolean> {
  try {
    const key = await importCertificateKey(issuer);
    return await crypto.subtle.verify(
      { name: 'ECDSA', hash: certificate.signatureHash },
      key,
      toArrayBuffer(ecdsaDerToRaw(certificate.signature, issuer.curve.size)),
      toArrayBuffer(certificate.tbs),
    );
  } catch {
    return false;
  }
}

export function isValidAt(certificate: ParsedCertificate, date: Date): boolean {
  const time = date.getTime();
  return certificate.notBefore.getTime() <= time && time <= certificate.notAfter.getTime();
}
