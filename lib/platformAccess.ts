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

export const TRAINER_DESKTOP_MIN_WIDTH = 960;

export function isTrainerRoleOnWeb(role?: UserRole) {
  return isWebPlatform() && isTrainerRole(role);
}

/** Panel lateral de escritorio: entrenador en web con viewport amplio. */
export function isTrainerDesktopWeb(role?: UserRole, viewportWidth?: number) {
  if (!isTrainerRoleOnWeb(role)) return false;
  if (viewportWidth === undefined) return true;
  return viewportWidth >= TRAINER_DESKTOP_MIN_WIDTH;
}

export function isTrainerMobileLayout(
  role?: UserRole,
  viewportWidth?: number,
  platformOs: typeof Platform.OS = Platform.OS,
) {
  if (!isTrainerRole(role)) return false;
  if (platformOs !== 'web') return true;
  if (viewportWidth === undefined) return false;
  return viewportWidth < TRAINER_DESKTOP_MIN_WIDTH;
}

/** Destinos raíz del entrenador en móvil: mantienen la barra inferior visible. */
const TRAINER_MOBILE_ROOT_ROUTES = [
  '/trainer/chats',
  '/trainer/template',
  '/trainer/support',
  '/trainer/gyms',
  '/library',
];

export function shouldShowTrainerMobileTabBar(pathname: string) {
  if (pathname.startsWith('/auth') || pathname === '/' || pathname === '/index') return false;
  if (pathname.startsWith('/timer')) return false;
  if (pathname.startsWith('/trainer/mobile-preview')) return false;

  if (pathname.startsWith('/tabs/')) return true;

  return TRAINER_MOBILE_ROOT_ROUTES.includes(pathname);
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
