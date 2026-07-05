import type { FitnessLevel, ProgramGoal, UserProfile, UserRole } from '@/lib/types';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { fetchActiveProgramsForUser } from '@/lib/userProgramService';
import type { UserActiveProgram } from '@/lib/types';

const PERFIL_TABLE = 'Perfil';

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

async function fetchRoleSlug(
  supabase: NonNullable<ReturnType<typeof getSupabase>>,
  idRoles: unknown,
): Promise<string | undefined> {
  if (!idRoles || typeof idRoles !== 'string') return undefined;

  const { data } = await supabase.from('roles').select('slug').eq('id', idRoles).maybeSingle();
  return data?.slug;
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = getSupabase();
  if (!supabase) return null;

  const [{ data: profileRow, error: profileError }, activePrograms] = await Promise.all([
    supabase.from(PERFIL_TABLE).select('*').eq('id', userId).maybeSingle(),
    fetchActiveProgramsForUser(userId),
  ]);

  if (profileError || !profileRow) return null;

  const roleSlug = await fetchRoleSlug(supabase, profileRow.id_roles);
  return mapProfileRow(profileRow, activePrograms, roleSlug);
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

  const profilePayload = {
    id: userId,
    email: email.trim(),
    name: updates.name.trim(),
    nivel: updates.fitnessLevel ?? null,
    objetivo: updates.mainGoal ?? null,
    altura: updates.height ?? null,
    peso: updates.weight ?? null,
    lesiones: updates.injuries?.trim() || null,
  };

  const { data, error } = await supabase
    .from(PERFIL_TABLE)
    .upsert(profilePayload, { onConflict: 'id' })
    .select('*')
    .single();

  if (error) {
    const message = error.message.toLowerCase().includes('perfil')
      ? 'La tabla Perfil no está disponible en Supabase. Ejecuta: npm run supabase:perfil'
      : error.message;
    return { error: message };
  }

  if (!data) {
    return { error: 'No se pudo guardar el perfil en Supabase.' };
  }

  const [activePrograms, roleSlug] = await Promise.all([
    fetchActiveProgramsForUser(userId),
    fetchRoleSlug(supabase, data.id_roles),
  ]);

  return { profile: mapProfileRow(data, activePrograms, roleSlug) };
}
