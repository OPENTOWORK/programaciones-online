/** @typedef {'needs_email_confirmation' | 'session_created' | 'already_registered' | 'empty'} SignUpInterpretationType */

/**
 * @param {{ user: { identities?: unknown[] } | null; session: unknown | null }} data
 */
export function interpretSignUpResponse(data) {
  if (!data.user) {
    return { type: 'empty' };
  }

  if (data.session) {
    return { type: 'session_created' };
  }

  const identities = data.user.identities ?? [];
  if (identities.length === 0) {
    return { type: 'already_registered' };
  }

  return { type: 'needs_email_confirmation' };
}

export function mapSignUpErrorMessage(message) {
  const normalized = message.toLowerCase();

  if (normalized.includes('already registered') || normalized.includes('already been registered')) {
    return 'Este email ya está registrado. Inicia sesión o usa "¿Olvidaste tu contraseña?".';
  }

  if (normalized.includes('rate limit') || normalized.includes('too many requests')) {
    return 'Has superado el límite de envíos de correo de Supabase. Espera 15–60 minutos e inténtalo de nuevo.';
  }

  if (normalized.includes('redirect') && normalized.includes('url')) {
    return 'La URL de confirmación no está autorizada en Supabase. Revisa Redirect URLs (programaciones-online://**).';
  }

  if (normalized.includes('invalid email') || normalized.includes('email address')) {
    return 'El email no es válido. Comprueba que esté escrito correctamente.';
  }

  if (normalized.includes('password')) {
    return message;
  }

  return message;
}
