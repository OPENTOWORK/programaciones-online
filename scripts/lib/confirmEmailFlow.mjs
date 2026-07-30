/**
 * Clasificación y mensajes del flujo de confirmación de email (web + Android).
 */

/** @typedef {'expired' | 'already_used' | 'invalid_link' | 'generic'} ConfirmEmailErrorKind */

/**
 * @param {string | null | undefined} url
 */
export function isEmailConfirmationDeepLink(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return trimmed.includes('confirm-email') || trimmed.includes('/auth/confirm-email');
}

/**
 * @param {string | null | undefined} errorCode
 * @returns {ConfirmEmailErrorKind}
 */
export function classifyConfirmEmailCallbackError(errorCode) {
  if (errorCode === 'otp_expired' || errorCode === 'flow_state_not_found') {
    return 'expired';
  }
  if (errorCode === 'invalid_grant') {
    return 'already_used';
  }
  if (errorCode === 'access_denied') {
    return 'expired';
  }
  return 'generic';
}

/**
 * @param {ConfirmEmailErrorKind} kind
 */
export function getConfirmEmailErrorUi(kind) {
  switch (kind) {
    case 'expired':
      return {
        title: 'Enlace caducado',
        message: 'El enlace ha caducado. Solicita uno nuevo para confirmar tu email.',
        showResend: true,
        showLogin: true,
      };
    case 'already_used':
      return {
        title: 'Enlace ya utilizado',
        message: 'Este enlace ya ha sido utilizado. Tu email puede estar confirmado: inicia sesión.',
        showResend: false,
        showLogin: true,
      };
    case 'invalid_link':
      return {
        title: 'Enlace no válido',
        message: 'El enlace no contiene datos de confirmación. Abre el enlace completo desde tu email.',
        showResend: false,
        showLogin: true,
      };
    default:
      return {
        title: 'No se pudo confirmar',
        message: 'No se pudo confirmar el email con este enlace.',
        showResend: true,
        showLogin: true,
      };
  }
}

/**
 * @param {string | null | undefined} errorCode
 * @param {string | null | undefined} [fallbackMessage]
 */
export function resolveConfirmEmailErrorUi(errorCode, fallbackMessage) {
  const kind = classifyConfirmEmailCallbackError(errorCode);
  const ui = getConfirmEmailErrorUi(kind);
  if (kind === 'generic' && fallbackMessage) {
    return { ...ui, message: fallbackMessage };
  }
  return ui;
}

/**
 * @param {{ status: string; errorCode?: string | null; sanitizedMessage?: string | null; message?: string | null }} parsedOrResult
 */
export function resolveConfirmEmailErrorFromCallback(parsedOrResult) {
  if (parsedOrResult.status === 'idle') {
    return getConfirmEmailErrorUi('invalid_link');
  }
  return resolveConfirmEmailErrorUi(
    parsedOrResult.errorCode ?? null,
    parsedOrResult.sanitizedMessage ?? parsedOrResult.message ?? null,
  );
}
