/**
 * Parser puro de URLs de callback Supabase (web + deep links nativos).
 * Fuente compartida: tests + bundler vía lib/supabaseAuthCallbackUrl.ts
 */

const AUTH_PARAM_KEYS = new Set([
  'code',
  'type',
  'error',
  'error_code',
  'error_description',
  'access_token',
  'refresh_token',
  'expires_in',
  'token_type',
]);

function decodeParam(value) {
  if (!value) return value;
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch {
    return value;
  }
}

function mergeParams(searchParams, hashParams) {
  const merged = new URLSearchParams();
  searchParams.forEach((value, key) => merged.set(key, value));
  hashParams.forEach((value, key) => merged.set(key, value));
  return merged;
}

function splitUrlParts(rawUrl) {
  const hashIndex = rawUrl.indexOf('#');
  const withoutHash = hashIndex >= 0 ? rawUrl.slice(0, hashIndex) : rawUrl;
  const hashPart = hashIndex >= 0 ? rawUrl.slice(hashIndex + 1) : '';

  const queryIndex = withoutHash.indexOf('?');
  const base = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
  const queryPart = queryIndex >= 0 ? withoutHash.slice(queryIndex + 1) : '';

  return {
    base,
    queryPart,
    hashPart,
  };
}

function parseUrlMeta(base) {
  try {
    const normalized = base.includes('://') ? base : `https://${base}`;
    const parsed = new URL(normalized);
    return {
      scheme: parsed.protocol.replace(':', ''),
      pathname: parsed.pathname || '/',
      host: parsed.host,
    };
  } catch {
    const schemeMatch = base.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):\/+/);
    const scheme = schemeMatch?.[1] ?? '';
    const pathMatch = base.match(/^[^?#]+:\/\/([^?#]*)/);
    const pathname = pathMatch?.[1] ? `/${pathMatch[1].replace(/^\/+/, '')}` : '/';
    return { scheme, pathname, host: '' };
  }
}

function inferCallbackType(type, pathname) {
  if (type === 'recovery' || pathname.includes('update-password')) {
    return 'recovery';
  }
  if (type === 'signup' || type === 'email' || pathname.includes('confirm-email')) {
    return 'signup';
  }
  if (type) return 'unknown';
  if (pathname.includes('confirm-email')) return 'signup';
  if (pathname.includes('update-password')) return 'recovery';
  return null;
}

export function mapAuthCallbackErrorMessage(errorCode, errorDescription) {
  if (errorCode === 'otp_expired') {
    return 'El enlace ha caducado. Solicita uno nuevo.';
  }
  if (errorCode === 'access_denied') {
    return 'Acceso denegado. El enlace puede haber caducado o ya haber sido utilizado.';
  }
  if (errorCode === 'email_not_confirmed') {
    return 'Tu email aún no está confirmado. Solicita un nuevo enlace de confirmación.';
  }
  if (errorCode === 'invalid_grant') {
    return 'El enlace ya no es válido o ha sido utilizado. Solicita uno nuevo.';
  }
  if (errorCode === 'flow_state_not_found') {
    return 'El enlace ha caducado o no es válido. Solicita uno nuevo.';
  }
  if (errorDescription) {
    return decodeParam(errorDescription);
  }
  return 'No se pudo completar la autenticación con este enlace.';
}

/**
 * @param {string} url
 */
export function parseSupabaseAuthCallbackUrl(url) {
  if (!url || typeof url !== 'string') {
    return {
      status: 'idle',
      callbackType: null,
      scheme: '',
      pathname: '',
      hasCode: false,
      hasAccessToken: false,
      hasRefreshToken: false,
      errorCode: null,
      message: null,
    };
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return {
      status: 'idle',
      callbackType: null,
      scheme: '',
      pathname: '',
      hasCode: false,
      hasAccessToken: false,
      hasRefreshToken: false,
      errorCode: null,
      message: null,
    };
  }

  let parts;
  try {
    parts = splitUrlParts(trimmed);
  } catch {
    return {
      status: 'idle',
      callbackType: null,
      scheme: '',
      pathname: '',
      hasCode: false,
      hasAccessToken: false,
      hasRefreshToken: false,
      errorCode: null,
      message: 'URL malformada.',
    };
  }

  const searchParams = new URLSearchParams(parts.queryPart);
  const hashParams = new URLSearchParams(parts.hashPart);
  const params = mergeParams(searchParams, hashParams);

  const meta = parseUrlMeta(parts.base);
  const error = params.get('error');
  const errorCode = params.get('error_code');
  const errorDescription = params.get('error_description');
  const code = params.get('code');
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  const type = params.get('type');
  const callbackType = inferCallbackType(type, meta.pathname);

  const diagnostics = {
    callbackType,
    scheme: meta.scheme,
    pathname: meta.pathname,
    hasCode: Boolean(code),
    hasAccessToken: Boolean(accessToken),
    hasRefreshToken: Boolean(refreshToken),
    errorCode: errorCode ?? null,
  };

  if (error) {
    return {
      status: 'error',
      ...diagnostics,
      message: mapAuthCallbackErrorMessage(errorCode, errorDescription ?? error),
    };
  }

  const hasSessionParams =
    Boolean(code) ||
    (Boolean(accessToken) && Boolean(refreshToken)) ||
    type === 'signup' ||
    type === 'email' ||
    type === 'recovery';

  if (!hasSessionParams) {
    const hasAnyAuthKey = [...params.keys()].some((key) => AUTH_PARAM_KEYS.has(key));
    if (!hasAnyAuthKey) {
      return {
        status: 'idle',
        ...diagnostics,
        message: null,
      };
    }
  }

  return {
    status: 'pending',
    ...diagnostics,
    message: null,
    code: code ?? undefined,
    accessToken: accessToken ?? undefined,
    refreshToken: refreshToken ?? undefined,
    expiresIn: params.get('expires_in') ?? undefined,
    tokenType: params.get('token_type') ?? undefined,
    type: type ?? undefined,
  };
}

export function isAuthDeepLinkUrl(url, expectedScheme = 'programaciones-online') {
  if (!url) return false;
  const trimmed = url.trim();
  return (
    trimmed.startsWith(`${expectedScheme}://`) ||
    trimmed.startsWith(`${expectedScheme}:`) ||
    trimmed.includes('/auth/confirm-email') ||
    trimmed.includes('/auth/update-password')
  );
}
