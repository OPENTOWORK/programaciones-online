import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { loadIapConfig, type IapConfig } from '../_shared/iap/config.ts';
import { base64ToBytes, bytesEqual, utf8Decode, utf8Encode } from '../_shared/iap/encoding.ts';
import { verifyGoogleOidcToken } from '../_shared/iap/googleOidc.ts';
import { GooglePlayError } from '../_shared/iap/googlePlay.ts';
import { adminClient, json, serverEnv } from '../_shared/iap/http.ts';
import { beginNotification, finishNotification } from '../_shared/iap/repository.ts';
import { GOOGLE_SUBSCRIPTION_REVOKED } from '../_shared/iap/state.ts';
import { markGooglePurchaseVoided, refreshGooglePurchase } from '../_shared/iap/verify.ts';

/**
 * Notificaciones en tiempo real de Google Play (RTDN) vía Pub/Sub push.
 * Nunca se fía del contenido: cada aviso solo provoca una nueva consulta a la API de Google.
 */

interface DeveloperNotification {
  packageName?: string;
  eventTimeMillis?: string;
  subscriptionNotification?: { notificationType?: number; purchaseToken?: string; subscriptionId?: string };
  oneTimeProductNotification?: { notificationType?: number; purchaseToken?: string; sku?: string };
  voidedPurchaseNotification?: { purchaseToken?: string; orderId?: string; productType?: number; refundType?: number };
  testNotification?: { version?: string };
}

interface PubSubEnvelope {
  message?: { data?: string; messageId?: string; message_id?: string };
}

async function isAuthorizedPush(req: Request, config: IapConfig): Promise<boolean> {
  if (config.rtdnToken) {
    const provided = new URL(req.url).searchParams.get('token') ?? '';
    if (bytesEqual(utf8Encode(provided), utf8Encode(config.rtdnToken))) return true;
  }
  if (config.rtdnAudience) {
    const authorization = req.headers.get('Authorization') ?? '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
    if (
      token &&
      (await verifyGoogleOidcToken(token, { audience: config.rtdnAudience, email: config.rtdnServiceAccountEmail }))
    ) {
      return true;
    }
  }
  return false;
}

function describe(notification: DeveloperNotification) {
  if (notification.testNotification) return { type: 'test', token: null };
  if (notification.voidedPurchaseNotification) {
    return { type: 'voided', token: notification.voidedPurchaseNotification.purchaseToken ?? null };
  }
  if (notification.subscriptionNotification) {
    const { notificationType, purchaseToken } = notification.subscriptionNotification;
    return { type: `subscription_${notificationType ?? 'unknown'}`, token: purchaseToken ?? null };
  }
  if (notification.oneTimeProductNotification) {
    const { notificationType, purchaseToken } = notification.oneTimeProductNotification;
    return { type: `one_time_${notificationType ?? 'unknown'}`, token: purchaseToken ?? null };
  }
  return { type: 'unknown', token: null };
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Método no permitido.' }, 405);

  const env = serverEnv();
  if (!env) return json({ error: 'Configuración del servidor incompleta.' }, 500);
  const config = loadIapConfig();
  if (!(await isAuthorizedPush(req, config))) return json({ error: 'No autorizado.' }, 401);

  let envelope: PubSubEnvelope;
  try {
    envelope = await req.json();
  } catch {
    return json({ ignored: 'invalid_body' });
  }

  const messageId = envelope.message?.messageId ?? envelope.message?.message_id;
  let notification: DeveloperNotification;
  try {
    notification = JSON.parse(utf8Decode(base64ToBytes(envelope.message?.data ?? '')));
  } catch {
    // Un mensaje ilegible no mejora reintentándolo: se confirma a Pub/Sub para que no se repita.
    return json({ ignored: 'invalid_message' });
  }
  if (!messageId) return json({ ignored: 'missing_message_id' });
  if (notification.packageName && notification.packageName !== config.androidPackageName) {
    return json({ ignored: 'other_package' });
  }

  const admin = adminClient(env.supabaseUrl, env.serviceKey);
  const ctx = { admin, config };
  const { type, token } = describe(notification);

  const logId = await beginNotification(admin, {
    store: 'google_play',
    notificationId: messageId,
    notificationType: type,
    purchaseKey: token,
    payload: notification,
  });
  if (!logId) return json({ duplicate: true });

  try {
    let handled = false;
    if (type === 'test') {
      handled = true;
    } else if (notification.voidedPurchaseNotification && token) {
      handled = Boolean(await markGooglePurchaseVoided(ctx, token, 'google_voided'));
    } else if (notification.subscriptionNotification && token) {
      const { notificationType, subscriptionId } = notification.subscriptionNotification;
      if (subscriptionId) {
        handled = Boolean(
          await refreshGooglePurchase(ctx, {
            purchaseToken: token,
            productId: subscriptionId,
            productType: 'subscription',
            event: `google_${type}`,
            forcedStatus: notificationType === GOOGLE_SUBSCRIPTION_REVOKED ? 'revoked' : undefined,
          }),
        );
      }
    } else if (notification.oneTimeProductNotification && token) {
      const { sku } = notification.oneTimeProductNotification;
      if (sku) {
        handled = Boolean(
          await refreshGooglePurchase(ctx, {
            purchaseToken: token,
            productId: sku,
            productType: 'non_consumable',
            event: `google_${type}`,
          }),
        );
      }
    }

    await finishNotification(admin, logId, handled ? 'processed' : 'ignored');
    return json({ ok: true });
  } catch (error) {
    const message = (error as Error).message;
    if (error instanceof GooglePlayError && error.kind === 'invalid') {
      await finishNotification(admin, logId, 'ignored', message);
      return json({ ok: true });
    }
    console.error('iap-google-rtdn', message);
    await finishNotification(admin, logId, 'failed', message);
    // Pub/Sub reintenta los mensajes no confirmados con espera progresiva.
    return json({ error: 'Reintentar más tarde.' }, 500);
  }
});
