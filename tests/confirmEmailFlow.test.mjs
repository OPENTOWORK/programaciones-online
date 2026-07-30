import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  classifyConfirmEmailCallbackError,
  getConfirmEmailErrorUi,
  isEmailConfirmationDeepLink,
  resolveConfirmEmailErrorFromCallback,
  resolveConfirmEmailErrorUi,
} from '../scripts/lib/confirmEmailFlow.mjs';
import { parseSupabaseAuthCallbackUrl } from '../scripts/lib/supabaseAuthCallbackUrl.mjs';
import { createAuthCallbackCoordinator } from '../scripts/lib/authCallbackCoordinatorCore.mjs';

describe('confirmEmailFlow', () => {
  it('detecta deep links de confirmación Android (2 y 3 barras)', () => {
    assert.equal(
      isEmailConfirmationDeepLink('programaciones-online://auth/confirm-email?code=abc'),
      true,
    );
    assert.equal(
      isEmailConfirmationDeepLink('programaciones-online:///auth/confirm-email?code=abc'),
      true,
    );
    assert.equal(isEmailConfirmationDeepLink('programaciones-online://tabs/home'), false);
  });

  it('clasifica enlace caducado', () => {
    assert.equal(classifyConfirmEmailCallbackError('otp_expired'), 'expired');
    const ui = resolveConfirmEmailErrorUi('otp_expired');
    assert.equal(ui.title, 'Enlace caducado');
    assert.equal(ui.showResend, true);
  });

  it('clasifica enlace ya utilizado', () => {
    assert.equal(classifyConfirmEmailCallbackError('invalid_grant'), 'already_used');
    const ui = resolveConfirmEmailErrorUi('invalid_grant');
    assert.equal(ui.title, 'Enlace ya utilizado');
    assert.equal(ui.showResend, false);
    assert.equal(ui.showLogin, true);
  });

  it('enlace sin tokens ni code → invalid_link', () => {
    const parsed = parseSupabaseAuthCallbackUrl('programaciones-online:///auth/confirm-email');
    assert.equal(parsed.status, 'idle');
    const ui = resolveConfirmEmailErrorFromCallback(parsed);
    assert.equal(ui.title, 'Enlace no válido');
  });
});

describe('email confirmation Android session flow (automated simulation)', () => {
  it('PKCE: parse → dedupe → sesión una sola vez', async () => {
    let exchangeCalls = 0;
    const coordinator = createAuthCallbackCoordinator(async () => {
      exchangeCalls += 1;
      return { ok: true, status: 'success', callbackType: 'signup' };
    });

    const url = 'programaciones-online:///auth/confirm-email?code=signup-code&type=signup';
    const parsed = parseSupabaseAuthCallbackUrl(url);

    assert.equal(parsed.status, 'pending');
    assert.equal(parsed.hasCode, true);
    assert.equal(parsed.callbackType, 'signup');

    await Promise.all([
      coordinator.ensureProcessed({}, url),
      coordinator.ensureProcessed({}, url),
    ]);

    assert.equal(exchangeCalls, 1);
    assert.equal(coordinator.getSnapshot(url).status, 'success');
  });

  it('tokens en hash: parse correcto para setSession', () => {
    const url =
      'programaciones-online://auth/confirm-email#access_token=at&refresh_token=rt&type=signup';
    const parsed = parseSupabaseAuthCallbackUrl(url);

    assert.equal(parsed.status, 'pending');
    assert.equal(parsed.hasAccessToken, true);
    assert.equal(parsed.hasRefreshToken, true);
  });

  it('error otp_expired no invoca completeSession', async () => {
    let completeCalls = 0;
    const coordinator = createAuthCallbackCoordinator(async () => {
      completeCalls += 1;
      return { ok: true };
    });

    const url =
      'programaciones-online:///auth/confirm-email?error=access_denied&error_code=otp_expired';
    const result = await coordinator.ensureProcessed({}, url);

    assert.equal(completeCalls, 0);
    assert.equal(result.flowStatus, 'error');
    assert.equal(result.errorCode, 'otp_expired');
  });
});
