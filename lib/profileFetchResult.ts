import type { UserProfile, UserRole } from '@/lib/types';

export type ProfileFetchResult =
  | { status: 'success'; profile: UserProfile; roleSlug: UserRole }
  | { status: 'not_found' }
  | { status: 'role_missing'; profile: UserProfile }
  | { status: 'invalid_role'; profile: UserProfile; roleSlug: string }
  | { status: 'permission_denied'; code?: string; message: string; httpStatus?: number }
  | { status: 'network'; message: string }
  | { status: 'timeout'; message: string }
  | { status: 'unknown'; message: string; code?: string };

export function isValidRole(value: unknown): value is UserRole {
  return value === 'atleta' || value === 'entrenador';
}

export function profileResultToUserMessage(result: ProfileFetchResult): string {
  switch (result.status) {
    case 'not_found':
      return 'Tu cuenta está autenticada, pero todavía no tiene un perfil asociado.';
    case 'role_missing':
    case 'invalid_role':
      return 'No hemos podido cargar tu perfil de Training ProgLine. Comprueba tu conexión y vuelve a intentarlo.';
    case 'permission_denied':
      return 'No tienes permiso para leer tu perfil. Comprueba tu conexión y vuelve a intentarlo.';
    case 'network':
      return 'Error de conexión al cargar tu perfil. Comprueba tu red e inténtalo de nuevo.';
    case 'timeout':
      return 'La carga del perfil tardó demasiado. Comprueba tu conexión e inténtalo de nuevo.';
    case 'unknown':
      return result.message || 'No hemos podido cargar tu perfil de Training ProgLine.';
    default:
      return '';
  }
}

export function isProfileReadyForNavigation(result: ProfileFetchResult): result is {
  status: 'success';
  profile: UserProfile;
  roleSlug: UserRole;
} {
  return result.status === 'success';
}
