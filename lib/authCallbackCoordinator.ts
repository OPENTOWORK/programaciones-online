import type { SupabaseClient } from '@supabase/supabase-js';

import { runAuthCallbackSession, type CompleteAuthCallbackResult } from '@/lib/authCallbackSession';
import type { AuthCallbackType } from '@/lib/supabaseAuthCallbackUrl';

export type AuthCallbackFlowStatus = 'idle' | 'processing' | 'success' | 'error';

export interface AuthCallbackFlowSnapshot {
  status: AuthCallbackFlowStatus;
  urlKey: string | null;
  callbackType: AuthCallbackType | string | null;
  errorCode: string | null;
  sanitizedMessage: string | null;
}

export type EnsuredAuthCallbackResult = CompleteAuthCallbackResult & {
  flowStatus: AuthCallbackFlowStatus;
  sanitizedMessage: string | null;
};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const coreModule = require('../scripts/lib/authCallbackCoordinatorCore.mjs') as {
  createAuthCallbackCoordinator: (
    completeSession: (
      supabase: SupabaseClient,
      url: string,
      urlKey: string,
      timeoutMs: number,
    ) => Promise<CompleteAuthCallbackResult>,
  ) => {
    getSnapshot: (url?: string | null) => AuthCallbackFlowSnapshot;
    ensureProcessed: (
      supabase: SupabaseClient,
      url?: string | null,
      timeoutMs?: number,
    ) => Promise<EnsuredAuthCallbackResult>;
    reset: () => void;
    normalizeAuthCallbackUrlKey: (url: string) => string | null;
  };
};

const coordinator = coreModule.createAuthCallbackCoordinator(
  async (supabase, url, _urlKey, timeoutMs) => runAuthCallbackSession(supabase, url, timeoutMs),
);

export const normalizeAuthCallbackUrlKey = coordinator.normalizeAuthCallbackUrlKey;

export function getAuthCallbackFlowSnapshot(url?: string | null): AuthCallbackFlowSnapshot {
  return coordinator.getSnapshot(url ?? null);
}

export function resetAuthCallbackCoordinator() {
  coordinator.reset();
}

export async function ensureAuthCallbackProcessed(
  supabase: SupabaseClient,
  callbackUrl?: string | null,
  timeoutMs = 10000,
): Promise<EnsuredAuthCallbackResult> {
  return coordinator.ensureProcessed(supabase, callbackUrl ?? null, timeoutMs);
}

/** @deprecated Usar ensureAuthCallbackProcessed (deduplicado). */
export async function completeAuthCallbackSession(
  supabase: SupabaseClient,
  callbackUrl?: string | null,
  timeoutMs = 10000,
): Promise<CompleteAuthCallbackResult> {
  const result = await ensureAuthCallbackProcessed(supabase, callbackUrl, timeoutMs);
  return {
    ok: result.ok,
    error: result.error,
    errorCode: result.errorCode,
    callbackType: result.callbackType,
    status: result.status,
  };
}
