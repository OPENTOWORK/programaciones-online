import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { loadIapConfig } from '../_shared/iap/config.ts';
import { adminClient, authenticatedUserId, corsHeaders, json, serverEnv } from '../_shared/iap/http.ts';
import { purchasesToRefresh, userSnapshot } from '../_shared/iap/repository.ts';
import { confirmPurchase, revalidatePurchase, type ConfirmRequest } from '../_shared/iap/verify.ts';

/**
 * Compras integradas (Google Play Billing y StoreKit 2).
 * - confirm: verifica una compra con la tienda y concede el acceso.
 * - sync: revalida las compras que lo necesitan y devuelve el estado de la cuenta.
 */

const MAX_TOKEN_LENGTH = 16_384;
const MAX_PRODUCT_ID_LENGTH = 150;
const SYNC_LIMIT = 10;

interface RequestBody {
  action?: string;
  store?: string;
  productId?: string;
  purchaseToken?: string;
}

function parseConfirm(body: RequestBody): ConfirmRequest | null {
  const store = body.store === 'google' || body.store === 'apple' ? body.store : null;
  const productId = typeof body.productId === 'string' ? body.productId.trim() : '';
  const purchaseToken = typeof body.purchaseToken === 'string' ? body.purchaseToken.trim() : '';
  if (!store || !productId || productId.length > MAX_PRODUCT_ID_LENGTH) return null;
  if (!purchaseToken || purchaseToken.length > MAX_TOKEN_LENGTH) return null;
  return { store, productId, purchaseToken };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Método no permitido.' }, 405);

  const env = serverEnv();
  if (!env) return json({ error: 'Configuración del servidor incompleta.' }, 500);

  const userId = await authenticatedUserId(env.supabaseUrl, env.anonKey, req.headers.get('Authorization'));
  if (!userId) return json({ error: 'No autorizado.' }, 401);

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Cuerpo de la petición inválido.' }, 400);
  }

  const ctx = { admin: adminClient(env.supabaseUrl, env.serviceKey), config: loadIapConfig() };

  try {
    if (body.action === 'confirm') {
      const request = parseConfirm(body);
      if (!request) return json({ error: 'Datos de compra incompletos.' }, 400);
      const { confirmation } = await confirmPurchase(ctx, userId, request);
      return json({ confirmation, ...(await userSnapshot(ctx.admin, userId)) });
    }

    if (body.action === 'sync') {
      for (const purchase of await purchasesToRefresh(ctx.admin, userId, SYNC_LIMIT)) {
        try {
          await revalidatePurchase(ctx, purchase);
        } catch (error) {
          console.error('No se pudo revalidar la compra', purchase.id, (error as Error).message);
        }
      }
      return json(await userSnapshot(ctx.admin, userId));
    }

    return json({ error: 'Acción desconocida.' }, 400);
  } catch (error) {
    console.error('iap-verify', (error as Error).message);
    // Un fallo interno nunca da la compra por buena ni por perdida: la app reintenta.
    if (body.action === 'confirm') {
      return json({ confirmation: { status: 'verification_delayed', retryAfterMs: 30_000 } });
    }
    return json({ error: 'No se pudieron comprobar tus compras.' }, 500);
  }
});
