import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  mapAuthCallbackErrorMessage,
  parseSupabaseAuthCallbackUrl,
} from '../scripts/lib/supabaseAuthCallbackUrl.mjs';

describe('parseSupabaseAuthCallbackUrl', () => {
  it('1. URL web con code PKCE', () => {
    const url =
      'https://example.com/auth/confirm-email?code=abc123&type=signup';
    const parsed = parseSupabaseAuthCallbackUrl(url);

    assert.equal(parsed.status, 'pending');
    assert.equal(parsed.hasCode, true);
    assert.equal(parsed.code, 'abc123');
    assert.equal(parsed.callbackType, 'signup');
    assert.equal(parsed.scheme, 'https');
    assert.equal(parsed.pathname, '/auth/confirm-email');
  });

  it('2. URL Android con dos barras', () => {
    const url = 'programaciones-online://auth/confirm-email?code=pkce-two';
    const parsed = parseSupabaseAuthCallbackUrl(url);

    assert.equal(parsed.status, 'pending');
    assert.equal(parsed.hasCode, true);
    assert.equal(parsed.code, 'pkce-two');
    assert.equal(parsed.scheme, 'programaciones-online');
  });

  it('3. URL Android con tres barras', () => {
    const url = 'programaciones-online:///auth/confirm-email?code=pkce-three';
    const parsed = parseSupabaseAuthCallbackUrl(url);

    assert.equal(parsed.status, 'pending');
    assert.equal(parsed.hasCode, true);
    assert.equal(parsed.code, 'pkce-three');
    assert.equal(parsed.pathname, '/auth/confirm-email');
  });

  it('4. URL con access_token y refresh_token en hash', () => {
    const url =
      'programaciones-online://auth/confirm-email#access_token=at123&refresh_token=rt456&expires_in=3600&token_type=bearer';
    const parsed = parseSupabaseAuthCallbackUrl(url);

    assert.equal(parsed.status, 'pending');
    assert.equal(parsed.hasAccessToken, true);
    assert.equal(parsed.hasRefreshToken, true);
    assert.equal(parsed.accessToken, 'at123');
    assert.equal(parsed.refreshToken, 'rt456');
    assert.equal(parsed.expiresIn, '3600');
    assert.equal(parsed.tokenType, 'bearer');
  });

  it('5. URL de recovery', () => {
    const url =
      'programaciones-online:///auth/update-password#access_token=at789&refresh_token=rt012&type=recovery';
    const parsed = parseSupabaseAuthCallbackUrl(url);

    assert.equal(parsed.status, 'pending');
    assert.equal(parsed.callbackType, 'recovery');
    assert.equal(parsed.type, 'recovery');
    assert.equal(parsed.hasAccessToken, true);
    assert.equal(parsed.hasRefreshToken, true);
  });

  it('6. URL con otp_expired', () => {
    const url =
      'https://example.com/auth/confirm-email?error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired';
    const parsed = parseSupabaseAuthCallbackUrl(url);

    assert.equal(parsed.status, 'error');
    assert.equal(parsed.errorCode, 'otp_expired');
    assert.equal(
      parsed.message,
      mapAuthCallbackErrorMessage('otp_expired', 'Email link is invalid or has expired'),
    );
  });

  it('7. URL sin parámetros auth', () => {
    const url = 'programaciones-online:///auth/confirm-email';
    const parsed = parseSupabaseAuthCallbackUrl(url);

    assert.equal(parsed.status, 'idle');
    assert.equal(parsed.hasCode, false);
    assert.equal(parsed.hasAccessToken, false);
    assert.equal(parsed.hasRefreshToken, false);
  });

  it('8. URL malformada o vacía', () => {
    assert.equal(parseSupabaseAuthCallbackUrl('').status, 'idle');
    assert.equal(parseSupabaseAuthCallbackUrl(null).status, 'idle');
    assert.equal(parseSupabaseAuthCallbackUrl(undefined).status, 'idle');
  });
});
