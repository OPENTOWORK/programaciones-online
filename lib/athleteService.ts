import type { AthleteSummary, FitnessLevel, ProgramGoal, UserRole } from '@/lib/types';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { fetchTrainerAthleteAlerts } from '@/lib/trainerAthleteAlerts';

const PERFIL_TABLE = 'Perfil';

function parseOptionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function buildInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function mapAthleteRow(row: Record<string, unknown>, currentProgramName?: string): AthleteSummary {
  const name = (row.name as string) ?? 'Atleta';

  return {
    id: row.id as string,
    name,
    email: (row.email as string) ?? '',
    fitnessLevel: (row.nivel as FitnessLevel | null) ?? undefined,
    mainGoal: (row.objetivo as ProgramGoal | null) ?? undefined,
    height: parseOptionalNumber(row.altura),
    weight: parseOptionalNumber(row.peso),
    injuries: (row.lesiones as string | null) ?? undefined,
    avatarInitials: buildInitials(name),
    currentProgramName,
  };
}

async function fetchAtletaRoleId(supabase: NonNullable<ReturnType<typeof getSupabase>>) {
  const { data, error } = await supabase.from('roles').select('id').eq('slug', 'atleta').maybeSingle();
  if (error) {
    throw new Error(error.message);
  }

  return data?.id as string | undefined;
}

export async function fetchAthletes(): Promise<AthleteSummary[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = getSupabase();
  if (!supabase) return [];

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) return [];

  const atletaRoleId = await fetchAtletaRoleId(supabase);
  if (!atletaRoleId) return [];

  const { data, error } = await supabase
    .from(PERFIL_TABLE)
    .select('id, name, email, nivel, objetivo, altura, peso, lesiones')
    .eq('id_roles', atletaRoleId)
    .order('name');

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return [];

  const athleteIds = data.map((row) => row.id as string);
  const programNames = new Map<string, string>();

  if (athleteIds.length > 0) {
    const { data: activePrograms } = await supabase
      .from('user_programs')
      .select('user_id, programas(name)')
      .in('user_id', athleteIds)
      .eq('status', 'activa');

    for (const row of activePrograms ?? []) {
      const program = Array.isArray(row.programas) ? row.programas[0] : row.programas;
      if (program?.name) {
        programNames.set(row.user_id, String(program.name));
      }
    }
  }

  const alertsByAthlete = await fetchTrainerAthleteAlerts(athleteIds);

  return data.map((row) => {
    const athlete = mapAthleteRow(row, programNames.get(row.id as string));
    const alerts = alertsByAthlete[row.id as string];
    return {
      ...athlete,
      alerts,
      unansweredCount: alerts?.total ?? 0,
    };
  });
}

export async function fetchAthleteById(athleteId: string): Promise<AthleteSummary | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = getSupabase();
  if (!supabase) return null;

  const atletaRoleId = await fetchAtletaRoleId(supabase);
  if (!atletaRoleId) return null;

  const [{ data: profile, error }, { data: activeProgram }] = await Promise.all([
    supabase
      .from(PERFIL_TABLE)
      .select('id, name, email, nivel, objetivo, altura, peso, lesiones')
      .eq('id', athleteId)
      .eq('id_roles', atletaRoleId)
      .maybeSingle(),
    supabase
      .from('user_programs')
      .select('programas(name)')
      .eq('user_id', athleteId)
      .eq('status', 'activa')
      .maybeSingle(),
  ]);

  if (error) return null;

  if (!profile) {
    // Puede ser un lead promocionado a entrenador: sigue siendo visible en el tablero.
    const [promoted] = await fetchNonAthleteProfiles([athleteId]);
    return promoted ?? null;
  }

  const program = Array.isArray(activeProgram?.programas)
    ? activeProgram?.programas[0]
    : activeProgram?.programas;

  const athlete = mapAthleteRow(profile, program?.name ? String(program.name) : undefined);
  const alertsByAthlete = await fetchTrainerAthleteAlerts([athleteId]);
  const alerts = alertsByAthlete[athleteId];

  return {
    ...athlete,
    alerts,
    unansweredCount: alerts?.total ?? 0,
  };
}

/** Busca un atleta por email para añadirlo al tablero sin duplicar cuentas. */
export async function findAthleteProfileByEmail(email: string): Promise<AthleteSummary | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !isSupabaseConfigured) return null;

  const supabase = getSupabase();
  if (!supabase) return null;

  const atletaRoleId = await fetchAtletaRoleId(supabase);
  if (!atletaRoleId) return null;

  const { data, error } = await supabase
    .from(PERFIL_TABLE)
    .select('id, name, email, nivel, objetivo, altura, peso, lesiones')
    .eq('id_roles', atletaRoleId)
    .ilike('email', normalized)
    .maybeSingle();

  if (error || !data) return null;
  return mapAthleteRow(data);
}

/**
 * Perfiles de los leads del CRM que ya no tienen rol atleta (promocionados a entrenador),
 * porque `fetchAthletes` los deja fuera por definición.
 */
export async function fetchNonAthleteProfiles(profileIds: string[]): Promise<AthleteSummary[]> {
  if (profileIds.length === 0 || !isSupabaseConfigured) return [];

  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(PERFIL_TABLE)
    .select('id, name, email, nivel, objetivo, altura, peso, lesiones, roles(slug)')
    .in('id', profileIds);

  if (error || !data) return [];

  return data
    .map((row) => {
      const roles = row.roles as { slug?: string } | { slug?: string }[] | null | undefined;
      const roleData = Array.isArray(roles) ? roles[0] : roles;
      return { row, slug: roleData?.slug };
    })
    .filter((entry) => entry.slug === 'entrenador')
    .map((entry) => ({ ...mapAthleteRow(entry.row), role: 'entrenador' as UserRole }));
}

export function isTrainerRole(role?: UserRole) {
  return role === 'entrenador';
}
