import type { SupabaseClient } from '@supabase/supabase-js';

import {
  mapAuthCallbackErrorMessage,
  parseSupabaseAuthCallbackUrl,
} from '@/lib/supabaseAuthCallbackUrl';
import { logAuthEvent } from '@/lib/releaseDiagnostics';

export type CompleteAuthCallbackResult = {
  ok: boolean;
  error?: string;
  errorCode?: string | null;
  callbackType?: string | null;
  status?: 'success' | 'error' | 'idle';
};

export async function runAuthCallbackSession(
  supabase: SupabaseClient,
  url: string,
  timeoutMs = 10000,
): Promise<CompleteAuthCallbackResult> {
  const parsed = parseSupabaseAuthCallbackUrl(url);

  logAuthEvent('deep_link_type', {
    scheme: parsed.scheme || undefined,
    pathname: parsed.pathname || undefined,
    callbackType: parsed.callbackType,
    hasCode: parsed.hasCode,
    hasAccessToken: parsed.hasAccessToken,
    hasRefreshToken: parsed.hasRefreshToken,
    errorCode: parsed.errorCode ?? undefined,
  });

  if (parsed.status === 'error') {
    logAuthEvent('callback_failed', { errorCode: parsed.errorCode ?? undefined }, 'warn');
    return {
      ok: false,
      error: parsed.message,
      errorCode: parsed.errorCode,
      callbackType: parsed.callbackType,
      status: 'error',
    };
  }

  if (parsed.status === 'pending') {
    if (parsed.code) {
      const { error } = await supabase.auth.exchangeCodeForSession(parsed.code);
      if (error) {
        const message = mapAuthCallbackErrorMessage(error.code ?? null, error.message);
        logAuthEvent('callback_failed', { errorCode: error.code }, 'warn');
        return {
          ok: false,
          error: message,
          errorCode: error.code ?? null,
          callbackType: parsed.callbackType,
          status: 'error',
        };
      }
    } else if (parsed.accessToken && parsed.refreshToken) {
      const { error } = await supabase.auth.setSession({
        access_token: parsed.accessToken,
        refresh_token: parsed.refreshToken,
      });
      if (error) {
        const message = mapAuthCallbackErrorMessage(error.code ?? null, error.message);
        logAuthEvent('callback_failed', { errorCode: error.code }, 'warn');
        return {
          ok: false,
          error: message,
          errorCode: error.code ?? null,
          callbackType: parsed.callbackType,
          status: 'error',
        };
      }
    }
  }

  const { data: initial } = await supabase.auth.getSession();
  if (initial.session) {
    logAuthEvent('callback_success', { callbackType: parsed.callbackType ?? undefined });
    return {
      ok: true,
      callbackType: parsed.callbackType,
      status: 'success',
    };
  }

  if (parsed.status !== 'pending') {
    return {
      ok: false,
      error: 'Enlace de autenticación no válido.',
      callbackType: parsed.callbackType,
      status: 'error',
    };
  }

  return new Promise((resolve) => {
    let settled = false;

    const finish = (result: CompleteAuthCallbackResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      subscription.unsubscribe();
      if (result.ok) {
        logAuthEvent('callback_success', { callbackType: parsed.callbackType ?? undefined });
      } else {
        logAuthEvent('callback_failed', { errorCode: result.errorCode ?? undefined }, 'warn');
      }
      resolve(result);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED')) {
        finish({
          ok: true,
          callbackType: parsed.callbackType,
          status: 'success',
        });
      }
    });

    const poll = async () => {
      for (let attempt = 0; attempt < 24; attempt += 1) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          finish({
            ok: true,
            callbackType: parsed.callbackType,
            status: 'success',
          });
          return;
        }

        await new Promise((r) => setTimeout(r, 250));
      }

      finish({
        ok: false,
        error: 'No se pudo validar el enlace. Puede haber caducado o ya haber sido utilizado.',
        callbackType: parsed.callbackType,
        status: 'error',
      });
    };

    void poll();

    const timer = setTimeout(
      () =>
        finish({
          ok: false,
          error: 'Tiempo de espera agotado al procesar el enlace.',
          callbackType: parsed.callbackType,
          status: 'error',
        }),
      timeoutMs,
    );
  });
}
