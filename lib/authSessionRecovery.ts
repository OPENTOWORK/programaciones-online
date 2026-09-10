import type { SupabaseClient } from '@supabase/supabase-js';

export function isJwtClockSkewError(message?: string | null) {
  if (!message) return false;
  const normalized = message.toLowerCase();
  return (
    normalized.includes('jwt issued at future') ||
    normalized.includes('clock skew') ||
    normalized.includes('token is expired') ||
    normalized.includes('invalid jwt')
  );
}

export function jwtClockSkewUserMessage() {
  return 'La sesión no es válida. Comprueba que la hora de tu dispositivo sea correcta y vuelve a iniciar sesión.';
}

/** Intenta refrescar la sesión; si falla por JWT inválido, limpia la sesión local. */
export async function recoverJwtClockSkew(supabase: SupabaseClient) {
  const { data, error } = await supabase.auth.refreshSession();
  if (!error && data.session) {
    return true;
  }

  if (isJwtClockSkewError(error?.message)) {
    await supabase.auth.signOut({ scope: 'local' });
  }

  return false;
}

export async function withJwtClockSkewRecovery<T>(
  supabase: SupabaseClient,
  run: () => Promise<T>,
): Promise<T> {
  try {
    return await run();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!isJwtClockSkewError(message)) {
      throw error;
    }

    const recovered = await recoverJwtClockSkew(supabase);
    if (!recovered) {
      throw new Error(jwtClockSkewUserMessage());
    }

    return run();
  }
}
