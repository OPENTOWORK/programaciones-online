import { Platform } from 'react-native';

import {
  completeAuthCallbackSession,
} from '@/lib/authCallbackCoordinator';
import { type CompleteAuthCallbackResult } from '@/lib/authCallbackSession';
import { getWebLocationHref } from '@/lib/platformAccess';
import {
  parseSupabaseAuthCallbackUrl,
  type ParsedSupabaseAuthCallback,
} from '@/lib/supabaseAuthCallbackUrl';

export type { CompleteAuthCallbackResult };

export type AuthCallbackResult =
  | { status: 'idle' }
  | { status: 'error'; message: string; errorCode?: string | null; callbackType?: string | null }
  | { status: 'success' }
  | { status: 'pending'; callbackType?: string | null };

export {
  ensureAuthCallbackProcessed,
  getAuthCallbackFlowSnapshot,
  resetAuthCallbackCoordinator,
} from '@/lib/authCallbackCoordinator';

function getWebCallbackUrl(): string | null {
  return getWebLocationHref();
}

export function getCurrentAuthCallbackUrl(explicitUrl?: string | null): string | null {
  if (explicitUrl?.trim()) {
    return explicitUrl.trim();
  }
  if (Platform.OS === 'web') {
    return getWebCallbackUrl();
  }
  return null;
}

export function parseAuthCallbackFromUrl(url: string | null | undefined): AuthCallbackResult {
  if (!url) {
    return { status: 'idle' };
  }

  const parsed = parseSupabaseAuthCallbackUrl(url);
  return mapParsedToAuthCallbackResult(parsed);
}

function mapParsedToAuthCallbackResult(parsed: ParsedSupabaseAuthCallback): AuthCallbackResult {
  if (parsed.status === 'error') {
    return {
      status: 'error',
      message: parsed.message,
      errorCode: parsed.errorCode,
      callbackType: parsed.callbackType,
    };
  }

  if (parsed.status === 'pending') {
    return { status: 'pending', callbackType: parsed.callbackType };
  }

  return { status: 'idle' };
}

export function hasWebAuthCallback() {
  const parsed = parseAuthCallbackFromUrl(getWebCallbackUrl());
  return parsed.status === 'pending' || parsed.status === 'error';
}

export function parseAuthCallbackResult(callbackUrl?: string | null): AuthCallbackResult {
  if (Platform.OS === 'web') {
    return parseAuthCallbackFromUrl(getCurrentAuthCallbackUrl(callbackUrl));
  }
  return parseAuthCallbackFromUrl(callbackUrl ?? null);
}

export { completeAuthCallbackSession };

export function clearAuthCallbackParams() {
  const href = getWebLocationHref();
  if (!href) {
    return;
  }

  const url = new URL(href);
  url.hash = '';
  url.search = '';
  window.history.replaceState({}, document.title, `${url.pathname}${url.search}`);
}
