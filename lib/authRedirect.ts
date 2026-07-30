import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

import { getWebLocationHref } from '@/lib/platformAccess';

/** Debe coincidir con Supabase Site URL y `npm run dev` (puerto 3000). */
export const LOCAL_WEB_AUTH_ORIGIN = 'http://localhost:3000';

/** Dominio web de producción. Debe coincidir con Supabase Site URL. */
export const PRODUCTION_WEB_AUTH_ORIGIN = 'https://trainingprogline.es';

export const NATIVE_AUTH_SCHEME = 'programaciones-online';

function normalizeNativeAuthPath(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${NATIVE_AUTH_SCHEME}://${normalizedPath}`;
}

export function buildAuthRedirectUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (Platform.OS === 'web') {
    const origin = getWebLocationHref();
    if (origin) {
      return `${new URL(origin).origin}${normalizedPath}`;
    }
  }

  return normalizeNativeAuthPath(normalizedPath);
}

export function getPasswordResetRedirectUrl() {
  return buildAuthRedirectUrl('/auth/update-password');
}

export function getEmailConfirmationRedirectUrl() {
  return buildAuthRedirectUrl('/auth/confirm-email');
}

export function isNativeAuthDeepLink(url: string | null | undefined) {
  if (!url) return false;
  const trimmed = url.trim();
  return trimmed.startsWith(`${NATIVE_AUTH_SCHEME}://`) || trimmed.startsWith(`${NATIVE_AUTH_SCHEME}:`);
}

export function isAuthCallbackDeepLink(url: string | null | undefined) {
  if (!url) return false;
  const trimmed = url.trim();
  if (!isNativeAuthDeepLink(trimmed)) return false;
  if (trimmed.includes('confirm-email') || trimmed.includes('update-password')) {
    return true;
  }
  return trimmed.includes('code=') || trimmed.includes('access_token=') || trimmed.includes('error=');
}

export async function getInitialNativeAuthUrl() {
  if (Platform.OS === 'web') {
    return null;
  }
  return Linking.getInitialURL();
}

export function subscribeNativeAuthUrls(onUrl: (url: string) => void) {
  if (Platform.OS === 'web') {
    return { remove: () => undefined };
  }

  const subscription = Linking.addEventListener('url', ({ url }) => {
    if (url) {
      onUrl(url);
    }
  });

  return subscription;
}
