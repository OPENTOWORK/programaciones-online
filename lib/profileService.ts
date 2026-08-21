import { calculateBmi } from '@/lib/bodyMetrics';
import type { FitnessLevel, ProgramGoal, UserProfile, UserRole } from '@/lib/types';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { fetchActiveProgramsForUser } from '@/lib/userProgramService';
import type { UserActiveProgram } from '@/lib/types';
import {
  isValidRole,
  type ProfileFetchResult,
} from '@/lib/profileFetchResult';
import { logReleaseDiagnostic } from '@/lib/releaseDiagnostics';
import { TimeoutError } from '@/lib/withTimeout';

const PERFIL_TABLE = 'Perfil';

/**
 * Solo se escriben las claves presentes en el objeto: pasar una clave con `undefined`
 * borra el valor, y omitirla deja intacta la columna.
 */
export interface ProfileUpdates {
  name: string;
  fitnessLevel?: FitnessLevel;
  mainGoal?: ProgramGoal;
  height?: number;
  weight?: number;
  injuries?: string;
}

function parseOptionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function mapRole(value: unknown): UserRole | undefined {
  if (value === 'atleta' || value === 'entrenador') return value;
  return undefined;
}

function mapProfileRow(
  data: Record<string, unknown>,
  activePrograms: UserActiveProgram[] = [],
  roleSlug?: string,
): UserProfile {
  const name = (data.name as string) ?? 'Usuario';
  const roles = data.roles as { slug?: string } | { slug?: string }[] | null | undefined;
  const roleData = Array.isArray(roles) ? roles[0] : roles;
  const resolvedRole = roleSlug ?? roleData?.slug;
  const primaryProgram = activePrograms[0];

  return {
    id: data.id as string,
    name,
    email: (data.email as string) ?? '',
    role: mapRole(resolvedRole),
    fitnessLevel: (data.nivel as FitnessLevel | null) ?? undefined,
    mainGoal: (data.objetivo as ProgramGoal | null) ?? undefined,
    height: parseOptionalNumber(data.altura),
    weight: parseOptionalNumber(data.peso),
    injuries: (data.lesiones as string | null) ?? undefined,
    bmi: calculateBmi(parseOptionalNumber(data.altura), parseOptionalNumber(data.peso)),
    currentPrograms: activePrograms,
    currentProgramId: primaryProgram?.id,
    currentProgram: primaryProgram,
    avatarInitials: name
      .split(' ')
      .map((part: string) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  };
}

function classifyProfileError(error: { message?: string; code?: string; status?: number }): ProfileFetchResult {
  const message = error.message ?? 'Error desconocido';
  const code = error.code;
  const httpStatus = typeof error.status === 'number' ? error.status : undefined;
  const normalized = message.toLowerCase();

  if (code === 'PGRST301' || httpStatus === 401 || httpStatus === 403 || normalized.includes('permission')) {
    logReleaseDiagnostic('profile_fetch_failed', { errorCode: code, httpStatus, hasProfile: false, hasRole: false }, 'warn');
    return { status: 'permission_denied', code, message, httpStatus };
  }

  if (normalized.includes('fetch') || normalized.includes('network') || normalized.includes('failed')) {
    logReleaseDiagnostic('profile_fetch_failed', { errorCode: code, httpStatus, hasProfile: false, hasRole: false }, 'warn');
    return { status: 'network', message };
  }

  logReleaseDiagnostic('profile_fetch_failed', { errorCode: code, httpStatus, hasProfile: false, hasRole: false }, 'warn');
  return { status: 'unknown', message, code };
}

export async function fetchUserProfileResult(userId: string): Promise<ProfileFetchResult> {
  if (!isSupabaseConfigured) {
    return { status: 'unknown', message: 'Supabase no está configurado.' };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { status: 'unknown', message: 'Supabase no está disponible.' };
  }

  try {
    const [{ data: profileRow, error: profileError }, activePrograms] = await Promise.all([
      supabase.from(PERFIL_TABLE).select('*, roles(slug)').eq('id', userId).maybeSingle(),
      fetchActiveProgramsForUser(userId),
    ]);

    if (profileError) {
      return classifyProfileError(profileError);
    }

    if (!profileRow) {
      logReleaseDiagnostic('profile_not_found', { hasProfile: false, hasRole: false });
      return { status: 'not_found' };
    }

    const roles = profileRow.roles as { slug?: string } | { slug?: string }[] | null | undefined;
    const roleData = Array.isArray(roles) ? roles[0] : roles;
    const roleSlug = roleData?.slug;

    if (!roleSlug) {
      const profile = mapProfileRow(profileRow, activePrograms);
      logReleaseDiagnostic('profile_role_missing', { hasProfile: true, hasRole: false });
      return { status: 'role_missing', profile };
    }

    if (!isValidRole(roleSlug)) {
      const profile = mapProfileRow(profileRow, activePrograms, roleSlug);
      logReleaseDiagnostic('profile_fetch_failed', {
        hasProfile: true,
        hasRole: false,
        roleSlug,
      }, 'warn');
      return { status: 'invalid_role', profile, roleSlug };
    }

    const profile = mapProfileRow(profileRow, activePrograms, roleSlug);
    logReleaseDiagnostic('profile_fetch_success', { hasProfile: true, hasRole: true, roleSlug });
    return { status: 'success', profile, roleSlug };
  } catch (error) {
    if (error instanceof TimeoutError) {
      logReleaseDiagnostic('profile_fetch_failed', { hasProfile: false, hasRole: false, errorCode: 'timeout' }, 'warn');
      return { status: 'timeout', message: error.message };
    }

    const message = error instanceof Error ? error.message : 'Error al cargar el perfil';
    return { status: 'network', message };
  }
}

/** @deprecated Usar fetchUserProfileResult para manejo explícito de errores. */
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const result = await fetchUserProfileResult(userId);
  if (result.status === 'success') {
    return result.profile;
  }
  return null;
}

export async function updateUserProfile(
  userId: string,
  email: string,
  updates: ProfileUpdates,
): Promise<{ error?: string; profile?: UserProfile }> {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase no está configurado' };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { error: 'Supabase no está disponible' };
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: { name: updates.name.trim() },
  });

  if (authError) {
    return { error: authError.message };
  }

  const profilePayload: Record<string, unknown> = {
    id: userId,
    email: email.trim(),
    name: updates.name.trim(),
  };

  if ('fitnessLevel' in updates) profilePayload.nivel = updates.fitnessLevel ?? null;
  if ('mainGoal' in updates) profilePayload.objetivo = updates.mainGoal ?? null;
  if ('height' in updates) profilePayload.altura = updates.height ?? null;
  if ('weight' in updates) profilePayload.peso = updates.weight ?? null;
  if ('injuries' in updates) profilePayload.lesiones = updates.injuries?.trim() || null;

  const [{ data, error }, activePrograms] = await Promise.all([
    supabase
      .from(PERFIL_TABLE)
      .upsert(profilePayload, { onConflict: 'id' })
      .select('*, roles(slug)')
      .single(),
    fetchActiveProgramsForUser(userId),
  ]);

  if (error) {
    const message = error.message.toLowerCase().includes('perfil')
      ? 'La tabla Perfil no está disponible en Supabase. Ejecuta: npm run supabase:perfil'
      : error.message;
    return { error: message };
  }

  if (!data) {
    return { error: 'No se pudo guardar el perfil en Supabase.' };
  }

  const roles = data.roles as { slug?: string } | { slug?: string }[] | null | undefined;
  const roleData = Array.isArray(roles) ? roles[0] : roles;

  return { profile: mapProfileRow(data, activePrograms, roleData?.slug) };
}
