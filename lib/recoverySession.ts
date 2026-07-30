import type { SupabaseClient } from '@supabase/supabase-js';

import { ensureAuthCallbackProcessed, parseAuthCallbackFromUrl } from '@/lib/authCallback';
import { getWebLocation, getWebLocationHref, isWebPlatform } from '@/lib/platformAccess';
import { isAuthDeepLinkUrl, parseSupabaseAuthCallbackUrl } from '@/lib/supabaseAuthCallbackUrl';

let activeRecoveryUrl: string | null = null;

export function setActiveRecoveryUrl(url: string | null) {
  activeRecoveryUrl = url?.trim() || null;
}

export function clearActiveRecoveryUrl() {
  activeRecoveryUrl = null;
}

export function hasRecoveryUrlParams(callbackUrl?: string | null) {
  const url = callbackUrl ?? activeRecoveryUrl;
  if (!url) {
    const location = getWebLocation();
    if (!location) {
      return false;
    }
    const { hash, search, pathname } = location;
    return (
      pathname.includes('update-password') ||
      hash.includes('type=recovery') ||
      search.includes('type=recovery') ||
      search.includes('code=')
    );
  }

  const parsed = parseSupabaseAuthCallbackUrl(url);
  return parsed.callbackType === 'recovery' || url.includes('update-password') || parsed.hasCode;
}

export async function waitForRecoverySession(
  supabase: SupabaseClient,
  callbackUrl?: string | null,
  timeoutMs = 8000,
): Promise<boolean> {
  const url = callbackUrl ?? activeRecoveryUrl;

  if (url && isAuthDeepLinkUrl(url)) {
    const result = await ensureAuthCallbackProcessed(supabase, url, timeoutMs);
    if (result.ok) {
      return true;
    }
  }

  const { data: initial } = await supabase.auth.getSession();
  if (initial.session) {
    return true;
  }

  if (!hasRecoveryUrlParams(url)) {
    return false;
  }

  if (isWebPlatform()) {
    const href = getWebLocationHref();
    if (href) {
      const webResult = await ensureAuthCallbackProcessed(supabase, href, timeoutMs);
      return webResult.ok;
    }
  }

  return new Promise((resolve) => {
    let settled = false;

    const finish = (value: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      subscription.unsubscribe();
      resolve(value);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        session &&
        (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || event === 'INITIAL_SESSION')
      ) {
        finish(true);
      }
    });

    const poll = async () => {
      for (let attempt = 0; attempt < 20; attempt += 1) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          finish(true);
          return;
        }

        await new Promise((r) => setTimeout(r, 250));
      }

      finish(false);
    };

    void poll();

    const timer = setTimeout(() => finish(false), timeoutMs);
  });
}

export function parseRecoveryCallbackResult(callbackUrl?: string | null) {
  const url = callbackUrl ?? activeRecoveryUrl ?? getWebLocationHref();
  if (!url) {
    return { status: 'idle' as const };
  }
  return parseAuthCallbackFromUrl(url);
}
