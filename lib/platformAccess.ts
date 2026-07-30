import { Platform } from 'react-native';

import { isTrainerRole } from '@/lib/athleteService';
import type { UserRole } from '@/lib/types';

export function isWebPlatform() {
  return Platform.OS === 'web';
}

export function getWebLocation(): Location | null {
  if (!isWebPlatform() || typeof window === 'undefined') {
    return null;
  }

  return window.location ?? null;
}

export function getWebLocationHref(): string | null {
  return getWebLocation()?.href ?? null;
}

export function isTrainerDesktopWeb(role?: UserRole) {
  return isWebPlatform() && isTrainerRole(role);
}
