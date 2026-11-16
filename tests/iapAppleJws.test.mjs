import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

import { AppleSignatureError, verifyAppleJws } from '../supabase/functions/_shared/iap/appleJws.ts';
import { APPLE_ROOT_CA_G3_BASE64 } from '../supabase/functions/_shared/iap/appleRootCa.ts';
import { base64ToBytes } from '../supabase/functions/_shared/iap/encoding.ts';
import { isSignedBy, parseCertificate } from '../supabase/functions/_shared/iap/x509.ts';
import { createAppleLikeChain, generateEcKey, signJws } from './helpers/iapFakes.mjs';

const payload = () => ({
  transactionId: '2000000123',
  originalTransactionId: '2000000123',
  bundleId: 'com.trainingprogline.app',
  productId: 'program',
  signedDate: Date.now(),
});

async function rejects(promise, pattern) {
  await assert.rejects(promise, (error) => {
    assert.ok(error instanceof AppleSignatureError, `se esperaba AppleSignatureError y llegó ${error}`);
    if (pattern) assert.match(error.message, pattern);
    return true;
  });
}

describe('Apple Root CA - G3', () => {
  it('es el certificado oficial (huella SHA-256) y está autofirmado', async () => {
    const der = base64ToBytes(APPLE_ROOT_CA_G3_BASE64);
    const fingerprint = createHash('sha256').update(der).digest('hex').toUpperCase();
    assert.equal(fingerprint, '63343ABFB89A6A03EBB57E9B3F5FA7BE7C4F5C756F3017B3A8C488C3653E9179');

    const root = parseCertificate(der);
    assert.equal(root.curve.name, 'P-384');
    assert.equal(root.notAfter.toISOString(), '2039-04-30T18:19:06.000Z');
    assert.equal(await isSignedBy(root, root), true);
  });
});

describe('verifyAppleJws', () => {
  it('acepta un JWS firmado por una cadena válida', async () => {
    const chain = await createAppleLikeChain();
    const content = payload();
    const result = await verifyAppleJws(await signJws(chain, content), { trustedRoots: [chain.root] });
    assert.deepEqual(result, content);
  });

  it('rechaza cadenas que no terminan en la raíz de Apple', async () => {
    const chain = await createAppleLikeChain();
    await rejects(verifyAppleJws(await signJws(chain, payload())), /raíz de Apple/);
  });

  it('rechaza contenido manipulado', async () => {
    const chain = await createAppleLikeChain();
    const [header, , signature] = (await signJws(chain, payload())).split('.');
    const forged = Buffer.from(JSON.stringify({ ...payload(), productId: 'otro' })).toString('base64url');
    await rejects(verifyAppleJws(`${header}.${forged}.${signature}`, { trustedRoots: [chain.root] }), /Firma/);
  });

  it('rechaza una hoja que no firma el intermedio', async () => {
    const chain = await createAppleLikeChain({ leafIssuerKey: await generateEcKey('P-384') });
    await rejects(verifyAppleJws(await signJws(chain, payload()), { trustedRoots: [chain.root] }), /intermedio/);
  });

  it('exige los marcadores de Apple en la hoja y en el intermedio', async () => {
    const withoutLeafOid = await createAppleLikeChain({ leafOids: [] });
    await rejects(
      verifyAppleJws(await signJws(withoutLeafOid, payload()), { trustedRoots: [withoutLeafOid.root] }),
      /App Store/,
    );
    const withoutIntermediateOid = await createAppleLikeChain({ intermediateOids: [] });
    await rejects(
      verifyAppleJws(await signJws(withoutIntermediateOid, payload()), { trustedRoots: [withoutIntermediateOid.root] }),
      /App Store/,
    );
  });

  it('valida la vigencia en la fecha de firma', async () => {
    const chain = await createAppleLikeChain({ leafNotAfter: new Date(Date.now() - 24 * 60 * 60 * 1000) });
    await rejects(verifyAppleJws(await signJws(chain, payload()), { trustedRoots: [chain.root] }), /vigencia/);

    const signedWhileValid = { ...payload(), signedDate: Date.now() - 2 * 24 * 60 * 60 * 1000 };
    const result = await verifyAppleJws(await signJws(chain, signedWhileValid), { trustedRoots: [chain.root] });
    assert.equal(result.signedDate, signedWhileValid.signedDate);
  });

  it('exige ES256 y una cadena de tres certificados', async () => {
    const chain = await createAppleLikeChain();
    await rejects(verifyAppleJws(await signJws(chain, payload(), { alg: 'HS256' }), { trustedRoots: [chain.root] }), /Algoritmo/);
    await rejects(
      verifyAppleJws(await signJws(chain, payload(), { x5c: [] }), { trustedRoots: [chain.root] }),
      /incompleta/,
    );
    await rejects(verifyAppleJws('no-es-un-jws', { trustedRoots: [chain.root] }), /tres partes/);
  });
});
