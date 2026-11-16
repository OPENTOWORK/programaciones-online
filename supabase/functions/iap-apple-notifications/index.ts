import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { AppleSignatureError, verifyAppleJws } from '../_shared/iap/appleJws.ts';
import { loadIapConfig } from '../_shared/iap/config.ts';
import { adminClient, json, serverEnv } from '../_shared/iap/http.ts';
import { beginNotification, finishNotification } from '../_shared/iap/repository.ts';
import {
  applyAppleNotification,
  appleTransactionState,
  type AppleRenewalInfo,
  type AppleTransaction,
} from '../_shared/iap/state.ts';
import { applyAppleTransactionUpdate } from '../_shared/iap/verify.ts';

/**
 * App Store Server Notifications V2: renovaciones, caducidades, reembolsos y revocaciones.
 * Todo el contenido llega firmado por Apple y se verifica antes de usarlo.
 */

interface AppleNotification {
  notificationType?: string;
  subtype?: string;
  notificationUUID?: string;
  signedDate?: number;
  data?: {
    appAppleId?: number;
    bundleId?: string;
    environment?: string;
    status?: number;
    signedTransactionInfo?: string;
    signedRenewalInfo?: string;
  };
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Método no permitido.' }, 405);

  const env = serverEnv();
  if (!env) return json({ error: 'Configuración del servidor incompleta.' }, 500);
  const config = loadIapConfig();

  let signedPayload: string | undefined;
  try {
    signedPayload = ((await req.json()) as { signedPayload?: string }).signedPayload;
  } catch {
    return json({ error: 'Cuerpo de la petición inválido.' }, 400);
  }
  if (!signedPayload) return json({ error: 'Falta signedPayload.' }, 400);

  const trust = { trustedRoots: config.appleRootCertificates };
  let notification: AppleNotification;
  try {
    notification = await verifyAppleJws<AppleNotification>(signedPayload, trust);
  } catch (error) {
    if (error instanceof AppleSignatureError) return json({ error: 'Firma no válida.' }, 401);
    throw error;
  }

  const data = notification.data ?? {};
  const type = notification.notificationType ?? 'UNKNOWN';
  if (data.bundleId && data.bundleId !== config.iosBundleId) return json({ ignored: 'other_bundle' });
  // Apple solo incluye appAppleId en producción.
  const expectedAppId = config.apple?.appAppleId;
  if (expectedAppId && data.appAppleId !== undefined && String(data.appAppleId) !== expectedAppId) {
    return json({ ignored: 'other_app' });
  }
  if (!notification.notificationUUID) return json({ ignored: 'missing_uuid' });

  const admin = adminClient(env.supabaseUrl, env.serviceKey);
  const logId = await beginNotification(admin, {
    store: 'app_store',
    notificationId: notification.notificationUUID,
    notificationType: type,
    subtype: notification.subtype ?? null,
    environment: data.environment ?? null,
    payload: {
      notificationType: type,
      subtype: notification.subtype ?? null,
      signedDate: notification.signedDate ?? null,
      environment: data.environment ?? null,
      status: data.status ?? null,
    },
  });
  if (!logId) return json({ duplicate: true });

  try {
    if (type === 'TEST' || !data.signedTransactionInfo) {
      await finishNotification(admin, logId, type === 'TEST' ? 'processed' : 'ignored');
      return json({ ok: true });
    }

    const transaction = await verifyAppleJws<AppleTransaction>(data.signedTransactionInfo, trust);
    const renewal = data.signedRenewalInfo
      ? await verifyAppleJws<AppleRenewalInfo>(data.signedRenewalInfo, trust)
      : null;
    if (transaction.bundleId !== config.iosBundleId) {
      await finishNotification(admin, logId, 'ignored', 'bundle_mismatch');
      return json({ ok: true });
    }

    const state = applyAppleNotification(appleTransactionState(transaction, renewal, data.status ?? null), type);
    const purchase = await applyAppleTransactionUpdate(
      { admin, config },
      {
        transaction,
        renewal,
        subscriptionStatus: data.status ?? null,
        state,
        event: `apple_${type.toLowerCase()}${notification.subtype ? `_${notification.subtype.toLowerCase()}` : ''}`,
      },
    );

    await finishNotification(admin, logId, purchase ? 'processed' : 'ignored');
    return json({ ok: true });
  } catch (error) {
    const message = (error as Error).message;
    console.error('iap-apple-notifications', message);
    await finishNotification(admin, logId, 'failed', message);
    // Apple reintenta las notificaciones que no reciben 200.
    return json({ error: 'Reintentar más tarde.' }, 500);
  }
});
