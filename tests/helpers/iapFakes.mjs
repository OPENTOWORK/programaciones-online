/**
 * Utilidades de prueba para las compras integradas: certificados y JWS firmados
 * como los de Apple (con raíz propia), un Supabase en memoria y un fetch simulado.
 */

const encoder = new TextEncoder();

// ---------------------------------------------------------------------------
// DER mínimo
// ---------------------------------------------------------------------------

function concat(parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function encodeLength(length) {
  if (length < 0x80) return Uint8Array.of(length);
  if (length < 0x100) return Uint8Array.of(0x81, length);
  return Uint8Array.of(0x82, length >> 8, length & 0xff);
}

function der(tag, ...contents) {
  const body = concat(contents);
  return concat([Uint8Array.of(tag), encodeLength(body.length), body]);
}

function oid(dotted) {
  const [first, second, ...rest] = dotted.split('.').map(Number);
  const bytes = [first * 40 + second];
  for (const value of rest) {
    const chunk = [value & 0x7f];
    let remaining = Math.floor(value / 128);
    while (remaining > 0) {
      chunk.unshift((remaining & 0x7f) | 0x80);
      remaining = Math.floor(remaining / 128);
    }
    bytes.push(...chunk);
  }
  return der(0x06, Uint8Array.from(bytes));
}

function utcTime(date) {
  const pad = (value) => String(value).padStart(2, '0');
  const text =
    pad(date.getUTCFullYear() % 100) +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z';
  return der(0x17, encoder.encode(text));
}

function commonName(name) {
  return der(0x30, der(0x31, der(0x30, oid('2.5.4.3'), der(0x0c, encoder.encode(name)))));
}

function derInteger(bytes) {
  let value = bytes;
  while (value.length > 1 && value[0] === 0 && value[1] < 0x80) value = value.subarray(1);
  if (value[0] & 0x80) value = concat([Uint8Array.of(0), value]);
  return der(0x02, value);
}

function rawSignatureToDer(raw) {
  const half = raw.length / 2;
  return der(0x30, derInteger(raw.subarray(0, half)), derInteger(raw.subarray(half)));
}

const SIGNATURE_OIDS = { 'SHA-256': '1.2.840.10045.4.3.2', 'SHA-384': '1.2.840.10045.4.3.3' };
const DAY = 24 * 60 * 60 * 1000;

export const APPLE_LEAF_OID = '1.2.840.113635.100.6.11.1';
export const APPLE_INTERMEDIATE_OID = '1.2.840.113635.100.6.2.1';

export function generateEcKey(curve) {
  return crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: curve }, true, ['sign', 'verify']);
}

export async function makeCertificate({
  subjectKey,
  issuerKey,
  hash = 'SHA-384',
  subject,
  issuer,
  serial = 1,
  notBefore = new Date(Date.now() - 365 * DAY),
  notAfter = new Date(Date.now() + 365 * DAY),
  extensionOids = [],
}) {
  const spki = new Uint8Array(await crypto.subtle.exportKey('spki', subjectKey.publicKey));
  const extensions = extensionOids.length
    ? [der(0xa3, der(0x30, ...extensionOids.map((value) => der(0x30, oid(value), der(0x04, Uint8Array.of(0x05, 0x00))))))]
    : [];
  const tbs = der(
    0x30,
    der(0xa0, der(0x02, Uint8Array.of(2))),
    der(0x02, Uint8Array.of(serial)),
    der(0x30, oid(SIGNATURE_OIDS[hash])),
    commonName(issuer),
    der(0x30, utcTime(notBefore), utcTime(notAfter)),
    commonName(subject),
    spki,
    ...extensions,
  );
  const raw = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash }, issuerKey.privateKey, tbs));
  return der(0x30, tbs, der(0x30, oid(SIGNATURE_OIDS[hash])), der(0x03, Uint8Array.of(0), rawSignatureToDer(raw)));
}

/** Cadena raíz → intermedio → hoja con los marcadores de Apple, firmada con claves de prueba. */
export async function createAppleLikeChain(overrides = {}) {
  const rootKey = await generateEcKey('P-384');
  const intermediateKey = await generateEcKey('P-384');
  const leafKey = await generateEcKey('P-256');
  const root = await makeCertificate({ subjectKey: rootKey, issuerKey: rootKey, subject: 'Test Root', issuer: 'Test Root' });
  const intermediate = await makeCertificate({
    subjectKey: intermediateKey,
    issuerKey: rootKey,
    subject: 'Test Intermediate',
    issuer: 'Test Root',
    serial: 2,
    extensionOids: overrides.intermediateOids ?? [APPLE_INTERMEDIATE_OID],
  });
  const leaf = await makeCertificate({
    subjectKey: leafKey,
    issuerKey: overrides.leafIssuerKey ?? intermediateKey,
    subject: 'Test Leaf',
    issuer: 'Test Intermediate',
    serial: 3,
    notAfter: overrides.leafNotAfter,
    extensionOids: overrides.leafOids ?? [APPLE_LEAF_OID],
  });
  return { root, intermediate, leaf, leafKey };
}

export function base64(bytes) {
  return Buffer.from(bytes).toString('base64');
}

export function base64Url(bytes) {
  return Buffer.from(bytes).toString('base64url');
}

export async function signJws(chain, payload, header = {}) {
  const encodedHeader = base64Url(
    encoder.encode(JSON.stringify({ alg: 'ES256', x5c: [chain.leaf, chain.intermediate, chain.root].map(base64), ...header })),
  );
  const encodedPayload = base64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    chain.leafKey.privateKey,
    encoder.encode(`${encodedHeader}.${encodedPayload}`),
  );
  return `${encodedHeader}.${encodedPayload}.${base64Url(new Uint8Array(signature))}`;
}

export async function rsaServiceAccount(email = 'play-verifier@test.iam.gserviceaccount.com') {
  const keys = await crypto.subtle.generateKey(
    { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: Uint8Array.of(1, 0, 1), hash: 'SHA-256' },
    true,
    ['sign', 'verify'],
  );
  const pkcs8 = new Uint8Array(await crypto.subtle.exportKey('pkcs8', keys.privateKey));
  const pem = `-----BEGIN PRIVATE KEY-----\n${base64(pkcs8).match(/.{1,64}/g).join('\n')}\n-----END PRIVATE KEY-----\n`;
  return { account: { client_email: email, private_key: pem }, keys };
}

// ---------------------------------------------------------------------------
// Supabase en memoria (solo lo que usan las funciones de compras)
// ---------------------------------------------------------------------------

const UNIQUE_KEYS = {
  store_products: [['product_key'], ['apple_product_id']],
  store_purchases: [['store', 'purchase_key']],
  user_entitlements: [['store_purchase_id']],
  store_notifications: [['store', 'notification_id']],
};

let idCounter = 0;
const newId = () => `00000000-0000-4000-8000-${String(++idCounter).padStart(12, '0')}`;

export function createFakeSupabase({ users = [], products = [] } = {}) {
  const tables = {
    store_products: products.map((product) => ({ ...product })),
    store_product_programs: [],
    store_purchases: [],
    user_entitlements: [],
    store_notifications: [],
  };
  const userIds = new Set(users);

  function violatesUnique(table, row, ignoreId) {
    return (UNIQUE_KEYS[table] ?? []).some((columns) =>
      tables[table].some(
        (other) =>
          other.id !== ignoreId &&
          columns.every((column) => row[column] !== null && row[column] !== undefined && other[column] === row[column]),
      ),
    );
  }

  class Query {
    constructor(table) {
      this.table = table;
      this.operation = 'select';
      this.filters = [];
      this.returnRows = true;
      this.limitCount = null;
    }

    select() {
      if (this.operation !== 'select') this.returnRows = true;
      return this;
    }

    insert(payload) {
      this.operation = 'insert';
      this.payload = payload;
      this.returnRows = false;
      return this;
    }

    update(payload) {
      this.operation = 'update';
      this.payload = payload;
      this.returnRows = false;
      return this;
    }

    upsert(payload, options = {}) {
      this.operation = 'upsert';
      this.payload = payload;
      this.conflictColumns = (options.onConflict ?? 'id').split(',');
      this.returnRows = false;
      return this;
    }

    eq(column, value) {
      this.filters.push((row) => row[column] === value);
      return this;
    }

    in(column, values) {
      this.filters.push((row) => values.includes(row[column]));
      return this;
    }

    or() {
      return this;
    }

    order() {
      return this;
    }

    limit(count) {
      this.limitCount = count;
      return this;
    }

    maybeSingle() {
      return this.run('maybe');
    }

    single() {
      return this.run('one');
    }

    then(resolve, reject) {
      return this.run('many').then(resolve, reject);
    }

    matching() {
      return tables[this.table].filter((row) => this.filters.every((filter) => filter(row)));
    }

    async run(mode) {
      const now = new Date().toISOString();
      let rows;

      if (this.operation === 'insert') {
        const row = { id: newId(), created_at: now, updated_at: now, ...this.payload };
        if (violatesUnique(this.table, row)) return { data: null, error: { code: '23505', message: 'duplicate key' } };
        tables[this.table].push(row);
        rows = [row];
      } else if (this.operation === 'update') {
        rows = this.matching();
        for (const row of rows) {
          const next = { ...row, ...this.payload, updated_at: now };
          if (violatesUnique(this.table, next, row.id)) return { data: null, error: { code: '23505', message: 'duplicate key' } };
          Object.assign(row, next);
        }
      } else if (this.operation === 'upsert') {
        const existing = tables[this.table].find((row) =>
          this.conflictColumns.every((column) => row[column] === this.payload[column]),
        );
        if (existing) {
          Object.assign(existing, this.payload, { updated_at: now });
          rows = [existing];
        } else {
          const row = { id: newId(), created_at: now, updated_at: now, ...this.payload };
          tables[this.table].push(row);
          rows = [row];
        }
      } else {
        rows = this.matching();
      }

      if (this.limitCount !== null) rows = rows.slice(0, this.limitCount);
      const copies = rows.map((row) => ({ ...row }));
      if (mode === 'many') return { data: this.returnRows ? copies : null, error: null };
      if (copies.length > 1) return { data: null, error: { code: 'PGRST116', message: 'multiple rows' } };
      if (copies.length === 0 && mode === 'one') return { data: null, error: { code: 'PGRST116', message: 'no rows' } };
      return { data: copies[0] ?? null, error: null };
    }
  }

  return {
    tables,
    from: (table) => new Query(table),
    auth: {
      admin: {
        getUserById: async (id) =>
          userIds.has(id)
            ? { data: { user: { id } }, error: null }
            : { data: { user: null }, error: { message: 'User not found' } },
      },
    },
  };
}

// ---------------------------------------------------------------------------
// fetch simulado
// ---------------------------------------------------------------------------

/** Sustituye `fetch` por un enrutador de pruebas. Devuelve las llamadas y una función para restaurarlo. */
export function mockFetch(routes) {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    calls.push({ url, method: init.method ?? 'GET', body: init.body, headers: init.headers });
    for (const [pattern, handler] of routes) {
      if (pattern.test(url)) {
        const result = await handler(url, init);
        if (result instanceof Response) return result;
        const { status = 200, body = {}, headers = {} } = result;
        return new Response(typeof body === 'string' ? body : JSON.stringify(body), { status, headers });
      }
    }
    return new Response('not found', { status: 599 });
  };
  return { calls, restore: () => (globalThis.fetch = original) };
}
