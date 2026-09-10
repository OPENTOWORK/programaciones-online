import { AuthApiError, type SupabaseClient } from '@supabase/supabase-js';

import { TimeoutError } from '@/lib/withTimeout';
import { isJwtClockSkewError, jwtClockSkewUserMessage } from '@/lib/authSessionRecovery';

export function mapSignInErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (isJwtClockSkewError(message)) {
    return jwtClockSkewUserMessage();
  }

  if (normalized.includes('email not confirmed')) {
    return 'Tu email aún no está confirmado. Revisa tu bandeja de entrada (y spam) y haz clic en el enlace de confirmación.';
  }

  if (normalized.includes('invalid login credentials') || normalized.includes('invalid_credentials')) {
    return 'Email o contraseña incorrectos.';
  }

  return message;
}

export function mapAuthException(error: unknown) {
  if (error instanceof TimeoutError) {
    return 'La conexión tardó demasiado. Comprueba tu red e inténtalo de nuevo.';
  }

  if (error instanceof AuthApiError) {
    return mapSignInErrorMessage(error.message);
  }

  const message = error instanceof Error ? error.message : '';
  if (message) {
    const signInMapped = mapSignInErrorMessage(message);
    if (signInMapped !== message) {
      return signInMapped;
    }

    const normalized = message.toLowerCase();
    if (
      normalized.includes('network') ||
      normalized.includes('fetch') ||
      normalized.includes('failed') ||
      normalized.includes('resolve host') ||
      normalized.includes('connection') ||
      normalized.includes('socket') ||
      normalized.includes('ssl') ||
      normalized.includes('certificate') ||
      normalized.includes('unreachable') ||
      normalized.includes('timed out') ||
      normalized.includes('abort')
    ) {
      return 'Error de conexión. Comprueba tu red e inténtalo de nuevo.';
    }

    if (normalized.includes('supabase no está')) {
      return message;
    }

    if (message.length <= 160) {
      return message;
    }
  }

  return 'No se pudo completar la operación. Inténtalo de nuevo.';
}

export async function signInWithPasswordSafe(
  client: SupabaseClient,
  credentials: { email: string; password: string },
) {
  try {
    return await client.auth.signInWithPassword(credentials);
  } catch (error) {
    if (error instanceof AuthApiError) {
      return { data: { user: null, session: null }, error };
    }
    throw error;
  }
}
