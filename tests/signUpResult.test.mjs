import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { interpretSignUpResponse, mapSignUpErrorMessage } from '../scripts/lib/signUpResult.mjs';

describe('interpretSignUpResponse', () => {
  it('detecta email ya registrado (identities vacío)', () => {
    const result = interpretSignUpResponse({
      user: { identities: [] } as never,
      session: null,
    });
    assert.equal(result.type, 'already_registered');
  });

  it('detecta confirmación pendiente', () => {
    const result = interpretSignUpResponse({
      user: { identities: [{ id: '1' }] } as never,
      session: null,
    });
    assert.equal(result.type, 'needs_email_confirmation');
  });

  it('detecta sesión directa (confirmación desactivada)', () => {
    const result = interpretSignUpResponse({
      user: { identities: [{ id: '1' }] } as never,
      session: { access_token: 'x' } as never,
    });
    assert.equal(result.type, 'session_created');
  });
});

describe('mapSignUpErrorMessage', () => {
  it('traduce rate limit', () => {
    assert.match(mapSignUpErrorMessage('Email rate limit exceeded'), /límite/i);
  });
});
