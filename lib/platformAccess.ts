import { Platform } from 'react-native';

import { isGymRole, isTrainerRole } from '@/lib/athleteService';
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

/** El CRM de gimnasios tiene su propio panel, también en la app. */
export function usesGymPanel(role?: UserRole) {
  return isGymRole(role);
}

/** Rutas de atleta que el rol gimnasio sí puede abrir (programaciones de servicio y contacto). */
export function isGymRoleAthleteRouteAllowed(pathname: string) {
  return (
    pathname.startsWith('/tabs/programs') ||
    pathname.startsWith('/plan/') ||
    pathname.startsWith('/trainer/plan') ||
    pathname.startsWith('/support')
  );
}

/** Pantalla a TV: ocupa todo el viewport, sin el menú del gimnasio. */
export function isGymTvDisplayRoute(segments: string[]) {
  return segments[0] === 'gym' && segments[1] === 'tv' && segments.length > 2;
}
