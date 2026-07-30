import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  maskSupabaseAnonKey,
  maskSupabaseHost,
  sanitizeSupabaseConfig,
  TimeoutError,
  validateSupabaseConfig,
  withTimeout,
} from '../scripts/lib/supabaseConfigValidation.mjs';

const PRODUCTION_URL = 'https://nsdurlikkuoxqobabixr.supabase.co';
const PRODUCTION_KEY = 'sb_publishable_GZfJfr6RdAgbu9W9fy1O1Q_8DAgtf0k';

describe('validateSupabaseConfig', () => {
  it('acepta configuración de producción válida', () => {
    const result = validateSupabaseConfig(PRODUCTION_URL, PRODUCTION_KEY);
    assert.equal(result.ok, true);
  });

  it('rechaza URL vacía', () => {
    const result = validateSupabaseConfig('', PRODUCTION_KEY);
    assert.equal(result.ok, false);
  });

  it('rechaza localhost en release', () => {
    const result = validateSupabaseConfig('http://localhost:54321', PRODUCTION_KEY);
    assert.equal(result.ok, false);
  });

  it('rechaza service_role', () => {
    const result = validateSupabaseConfig(PRODUCTION_URL, 'service_role_secret_key');
    assert.equal(result.ok, false);
  });
});

describe('sanitizeSupabaseConfig', () => {
  it('usa producción si el .env apunta a localhost', () => {
    const result = sanitizeSupabaseConfig(
      'http://localhost:54321',
      'bad-key',
      PRODUCTION_URL,
      PRODUCTION_KEY,
    );
    assert.equal(result.url, PRODUCTION_URL);
    assert.equal(result.anonKey, PRODUCTION_KEY);
    assert.equal(result.usedProductionFallback, true);
  });
});

describe('maskSupabaseHost', () => {
  it('enmascara el host', () => {
    const masked = maskSupabaseHost(PRODUCTION_URL);
    assert.match(masked, /nsdu…/);
  });
});

describe('maskSupabaseAnonKey', () => {
  it('enmascara la clave', () => {
    const masked = maskSupabaseAnonKey(PRODUCTION_KEY);
    assert.ok(masked.includes('…'));
  });
});

describe('withTimeout', () => {
  it('resuelve antes del timeout', async () => {
    const value = await withTimeout(Promise.resolve('ok'), 100);
    assert.equal(value, 'ok');
  });

  it('rechaza con TimeoutError', async () => {
    await assert.rejects(
      () => withTimeout(new Promise(() => undefined), 20, 'timeout-test'),
      TimeoutError,
    );
  });
});
