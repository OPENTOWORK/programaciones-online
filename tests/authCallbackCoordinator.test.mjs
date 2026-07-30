import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { createAuthCallbackCoordinator } from '../scripts/lib/authCallbackCoordinatorCore.mjs';

describe('authCallbackCoordinator deduplication', () => {
  it('completa la sesión una sola vez ante recepciones repetidas de la misma URL', async () => {
    let exchangeCalls = 0;
    let setSessionCalls = 0;

    const coordinator = createAuthCallbackCoordinator(async () => {
      exchangeCalls += 1;
      return {
        ok: true,
        status: 'success',
        callbackType: 'signup',
      };
    });

    const url =
      'programaciones-online:///auth/confirm-email?code=test-code-once&type=signup';

    const [first, second, third] = await Promise.all([
      coordinator.ensureProcessed({}, url),
      coordinator.ensureProcessed({}, url),
      coordinator.ensureProcessed(
        {},
        'programaciones-online://auth/confirm-email?code=test-code-once&type=signup',
      ),
    ]);

    assert.equal(exchangeCalls, 1);
    assert.equal(first.ok, true);
    assert.equal(second.ok, true);
    assert.equal(third.ok, true);
    assert.equal(first.flowStatus, 'success');
    assert.equal(coordinator.getSnapshot(url).status, 'success');
  });

  it('propaga error parseado sin invocar completeSession', async () => {
    let completeCalls = 0;
    const coordinator = createAuthCallbackCoordinator(async () => {
      completeCalls += 1;
      return { ok: true, status: 'success' };
    });

    const url =
      'programaciones-online:///auth/confirm-email?error=access_denied&error_code=otp_expired';

    const result = await coordinator.ensureProcessed({}, url);
    assert.equal(completeCalls, 0);
    assert.equal(result.ok, false);
    assert.equal(result.flowStatus, 'error');
    assert.equal(result.errorCode, 'otp_expired');
    assert.match(result.sanitizedMessage ?? '', /caducado/i);
  });

  it('reutiliza tokens mediante setSession solo una vez', async () => {
    let setSessionCalls = 0;
    const coordinator = createAuthCallbackCoordinator(async () => {
      setSessionCalls += 1;
      return {
        ok: true,
        status: 'success',
        callbackType: 'recovery',
      };
    });

    const url =
      'programaciones-online:///auth/update-password#access_token=at&refresh_token=rt&type=recovery';

    await coordinator.ensureProcessed({}, url);
    await coordinator.ensureProcessed({}, url);

    assert.equal(setSessionCalls, 1);
  });
});
