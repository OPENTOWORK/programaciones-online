import type { PurchaseConfirmation, PurchaseConfirmationRequest } from 'expo-iap';

import { snapshotFrom } from '@/lib/iap/entitlements';
import type { EntitlementSnapshot } from '@/lib/iap/types';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

const FUNCTION_NAME = 'iap-verify';
/** Sin respuesta del servidor la compra queda sin terminar y se reintenta: nunca se da por buena ni por perdida. */
const OFFLINE_RETRY_MS = 60_000;

type VerifyResponse = {
  confirmation?: PurchaseConfirmation;
  entitlements?: unknown;
  purchases?: unknown;
};

export async function confirmPurchaseWithServer(
  request: PurchaseConfirmationRequest,
): Promise<{ confirmation: PurchaseConfirmation; snapshot: EntitlementSnapshot | null }> {
  const supabase = isSupabaseConfigured ? getSupabase() : null;
  if (!supabase) {
    return { confirmation: { status: 'verification_delayed', retryAfterMs: OFFLINE_RETRY_MS }, snapshot: null };
  }

  const { data, error } = await supabase.functions.invoke<VerifyResponse>(FUNCTION_NAME, {
    body: { action: 'confirm', ...request },
  });
  if (error || !data?.confirmation) {
    console.warn('No se pudo verificar la compra en el servidor', error?.message);
    return { confirmation: { status: 'verification_delayed', retryAfterMs: OFFLINE_RETRY_MS }, snapshot: null };
  }

  return {
    confirmation: data.confirmation,
    snapshot: snapshotFrom(data.entitlements, data.purchases),
  };
}

/** Revalida en el servidor las compras que lo necesitan (renovaciones, reembolsos) y devuelve el estado. */
export async function syncPurchasesWithServer(): Promise<EntitlementSnapshot | null> {
  const supabase = isSupabaseConfigured ? getSupabase() : null;
  if (!supabase) return null;

  const { data, error } = await supabase.functions.invoke<VerifyResponse>(FUNCTION_NAME, {
    body: { action: 'sync' },
  });
  if (error || !data) return null;
  return snapshotFrom(data.entitlements, data.purchases);
}

/** Derechos y compras leídos directamente de la base de datos (funciona también en la web). */
export async function fetchEntitlementSnapshot(): Promise<EntitlementSnapshot | null> {
  const supabase = isSupabaseConfigured ? getSupabase() : null;
  if (!supabase) return null;

  const [entitlements, purchases] = await Promise.all([
    supabase.rpc('my_program_entitlements'),
    supabase.rpc('my_store_purchases'),
  ]);
  if (entitlements.error || purchases.error) return null;
  return snapshotFrom(entitlements.data, purchases.data);
}
