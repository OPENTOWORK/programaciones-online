/**
 * Estado compartido de procesamiento de callbacks auth (deduplicación).
 * No persiste tokens, códigos ni URLs completas.
 */

import { parseSupabaseAuthCallbackUrl } from './supabaseAuthCallbackUrl.mjs';

/** @typedef {'idle' | 'processing' | 'success' | 'error'} AuthCallbackFlowStatus */

/**
 * @typedef {object} AuthCallbackFlowSnapshot
 * @property {AuthCallbackFlowStatus} status
 * @property {string | null} urlKey
 * @property {string | null} callbackType
 * @property {string | null} errorCode
 * @property {string | null} sanitizedMessage
 */

/**
 * @param {string} url
 * @returns {string | null}
 */
export function normalizeAuthCallbackUrlKey(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  let scheme = '';
  let remainder = trimmed;

  const schemeMatch = trimmed.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):\/+/);
  if (schemeMatch) {
    scheme = schemeMatch[1].toLowerCase();
    remainder = trimmed.slice(schemeMatch[0].length);
  }

  remainder = remainder.replace(/^\/+/, '');
  const hashIndex = remainder.indexOf('#');
  const withoutHash = hashIndex >= 0 ? remainder.slice(0, hashIndex) : remainder;
  const hashPart = hashIndex >= 0 ? remainder.slice(hashIndex + 1) : '';

  const queryIndex = withoutHash.indexOf('?');
  const pathname = (queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash).replace(/\/+/g, '/');
  const queryPart = queryIndex >= 0 ? withoutHash.slice(queryIndex + 1) : '';

  const params = new URLSearchParams(queryPart);
  const hashParams = new URLSearchParams(hashPart);
  hashParams.forEach((value, key) => params.set(key, value));

  const sorted = [...params.keys()].sort();
  const paramSig = sorted.map((key) => `${key}=${params.get(key) ?? ''}`).join('&');
  const pathKey = pathname.startsWith('/') ? pathname : `/${pathname}`;

  return `${scheme}://${pathKey}${paramSig ? `?${paramSig}` : ''}`;
}

/**
 * @param {string | null | undefined} url
 * @returns {AuthCallbackFlowSnapshot}
 */
export function buildIdleSnapshot(url) {
  const urlKey = url ? normalizeAuthCallbackUrlKey(url) : null;
  const parsed = url ? parseSupabaseAuthCallbackUrl(url) : null;

  return {
    status: 'idle',
    urlKey,
    callbackType: parsed?.callbackType ?? null,
    errorCode: null,
    sanitizedMessage: null,
  };
}

/**
 * @param {(url: string, urlKey: string) => Promise<{ ok: boolean; error?: string; errorCode?: string | null; callbackType?: string | null; status?: string }>} completeSession
 */
export function createAuthCallbackCoordinator(completeSession) {
  /** @type {Map<string, AuthCallbackFlowSnapshot & { promise?: Promise<any> }>} */
  const entries = new Map();

  /**
   * @param {string | null | undefined} url
   * @returns {AuthCallbackFlowSnapshot}
   */
  function getSnapshot(url) {
    if (!url) {
      return buildIdleSnapshot(null);
    }

    const urlKey = normalizeAuthCallbackUrlKey(url);
    if (!urlKey) {
      return buildIdleSnapshot(url);
    }

    const entry = entries.get(urlKey);
    if (!entry) {
      return buildIdleSnapshot(url);
    }

    return {
      status: entry.status,
      urlKey: entry.urlKey,
      callbackType: entry.callbackType,
      errorCode: entry.errorCode,
      sanitizedMessage: entry.sanitizedMessage,
    };
  }

  function reset() {
    entries.clear();
  }

  /**
   * @param {unknown} supabase
   * @param {string | null | undefined} url
   * @param {number} [timeoutMs]
   */
  async function ensureProcessed(supabase, url, timeoutMs = 10000) {
    if (!url?.trim()) {
      return {
        ok: false,
        error: 'Enlace de autenticación no válido.',
        status: 'error',
        flowStatus: 'idle',
        callbackType: null,
        errorCode: null,
        sanitizedMessage: 'Enlace de autenticación no válido.',
      };
    }

    const trimmed = url.trim();
    const urlKey = normalizeAuthCallbackUrlKey(trimmed);
    if (!urlKey) {
      return {
        ok: false,
        error: 'Enlace de autenticación no válido.',
        status: 'error',
        flowStatus: 'idle',
        callbackType: null,
        errorCode: null,
        sanitizedMessage: 'Enlace de autenticación no válido.',
      };
    }

    const parsed = parseSupabaseAuthCallbackUrl(trimmed);

    if (parsed.status === 'error') {
      const snapshot = {
        status: 'error',
        urlKey,
        callbackType: parsed.callbackType,
        errorCode: parsed.errorCode,
        sanitizedMessage: parsed.message,
      };
      entries.set(urlKey, snapshot);
      return {
        ok: false,
        error: parsed.message,
        errorCode: parsed.errorCode,
        callbackType: parsed.callbackType,
        status: 'error',
        flowStatus: 'error',
        sanitizedMessage: parsed.message,
      };
    }

    const existing = entries.get(urlKey);
    if (existing?.status === 'success') {
      return {
        ok: true,
        callbackType: existing.callbackType,
        status: 'success',
        flowStatus: 'success',
        errorCode: null,
        sanitizedMessage: null,
      };
    }

    if (existing?.status === 'error') {
      return {
        ok: false,
        error: existing.sanitizedMessage ?? 'No se pudo completar la autenticación.',
        errorCode: existing.errorCode,
        callbackType: existing.callbackType,
        status: 'error',
        flowStatus: 'error',
        sanitizedMessage: existing.sanitizedMessage,
      };
    }

    if (existing?.status === 'processing' && existing.promise) {
      return existing.promise;
    }

    const processingSnapshot = {
      status: 'processing',
      urlKey,
      callbackType: parsed.callbackType,
      errorCode: null,
      sanitizedMessage: null,
    };
    entries.set(urlKey, processingSnapshot);

    const promise = (async () => {
      try {
        const result = await completeSession(supabase, trimmed, urlKey, timeoutMs);
        const flowStatus = result.ok ? 'success' : 'error';
        const finalized = {
          status: flowStatus,
          urlKey,
          callbackType: result.callbackType ?? parsed.callbackType ?? null,
          errorCode: result.errorCode ?? null,
          sanitizedMessage: result.ok ? null : (result.error ?? 'No se pudo completar la autenticación.'),
        };
        entries.set(urlKey, finalized);
        return {
          ...result,
          flowStatus,
          sanitizedMessage: finalized.sanitizedMessage,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudo completar la autenticación.';
        entries.set(urlKey, {
          status: 'error',
          urlKey,
          callbackType: parsed.callbackType,
          errorCode: 'unknown',
          sanitizedMessage: message,
        });
        return {
          ok: false,
          error: message,
          errorCode: 'unknown',
          callbackType: parsed.callbackType,
          status: 'error',
          flowStatus: 'error',
          sanitizedMessage: message,
        };
      }
    })();

    entries.set(urlKey, { ...processingSnapshot, promise });
    return promise;
  }

  return {
    normalizeAuthCallbackUrlKey,
    getSnapshot,
    ensureProcessed,
    reset,
  };
}
