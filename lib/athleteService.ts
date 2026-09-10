import type { AthleteSummary, FitnessLevel, ProgramGoal, UserRole } from '@/lib/types';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { fetchTrainerAthleteAlerts } from '@/lib/trainerAthleteAlerts';

const PERFIL_TABLE = 'Perfil';
const STAFF_ROLE_SLUGS: UserRole[] = ['entrenador', 'administrador'];

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

function leadOwnerId(row: Record<string, unknown>) {
  return ((row.assigned_trainer_id as string | null) ?? (row.trainer_id as string | null)) || null;
}

async function fetchCrmLeadOwnerRows() {
  const empty: Array<Record<string, unknown>> = [];
  if (!isSupabaseConfigured) return empty;

  const supabase = getSupabase();
  if (!supabase) return empty;

  let result = await supabase
    .from('trainer_crm_leads')
    .select('athlete_id, assigned_trainer_id, trainer_id, archived_at');

  if (result.error && (result.error.message ?? '').toLowerCase().includes('archived_at')) {
    result = await supabase
      .from('trainer_crm_leads')
      .select('athlete_id, assigned_trainer_id, trainer_id');
  }

  if (result.error || !result.data) return empty;
  return result.data as Array<Record<string, unknown>>;
}

/** Atletas asignados al entrenador que los creó o tiene en su tablero. */
export async function fetchAssignedAthleteIds(trainerId: string): Promise<Set<string>> {
  const data = await fetchCrmLeadOwnerRows();

  return new Set(
    data
      .filter((row) => {
        if (row.archived_at) return false;
        return leadOwnerId(row) === trainerId;
      })
      .map((row) => row.athlete_id as string),
  );
}

/** Mapa atleta → entrenador dueño de la ficha en el CRM. */
export async function fetchLeadOwnerMap(): Promise<Map<string, string>> {
  const data = await fetchCrmLeadOwnerRows();
  const map = new Map<string, string>();

  for (const row of data) {
    if (row.archived_at) continue;
    const athleteId = row.athlete_id as string;
    const ownerId = leadOwnerId(row);
    if (athleteId && ownerId) map.set(athleteId, ownerId);
  }

  return map;
}

/** Atletas cuya ficha pertenece a otro entrenador (columna Cliente cedido del admin). */
export async function fetchAthleteIdsAssignedToOtherTrainers(viewerId: string): Promise<Set<string>> {
  const owners = await fetchLeadOwnerMap();
  return new Set(
    [...owners.entries()]
      .filter(([, ownerId]) => ownerId !== viewerId)
      .map(([athleteId]) => athleteId),
  );
}

export async function fetchLeadOwnerId(athleteId: string): Promise<string | null> {
  const data = await fetchCrmLeadOwnerRows();
  const row = data.find((item) => item.athlete_id === athleteId && !item.archived_at);
  return row ? leadOwnerId(row) : null;
}

export async function fetchProfileNamesByIds(ids: readonly string[]): Promise<Map<string, string>> {
  const unique = [...new Set(ids.filter(Boolean))];
  const names = new Map<string, string>();
  if (unique.length === 0 || !isSupabaseConfigured) return names;

  const supabase = getSupabase();
  if (!supabase) return names;

  const { data, error } = await supabase.from(PERFIL_TABLE).select('id, name').in('id', unique);
  if (error || !data) return names;

  for (const row of data) {
    const id = row.id as string;
    const name = typeof row.name === 'string' ? row.name.trim() : '';
    if (id && name) names.set(id, name);
  }

  return names;
}

export async function fetchAthletes(options?: {
  role?: UserRole;
  trainerId?: string;
}): Promise<AthleteSummary[]> {
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

  let athletes = data.map((row) => {
    const athlete = mapAthleteRow(row, programNames.get(row.id as string));
    const alerts = alertsByAthlete[row.id as string];
    return {
      ...athlete,
      alerts,
      unansweredCount: alerts?.total ?? 0,
    };
  });

  if (isTrainerOnlyRole(options?.role) && options?.trainerId) {
    const assignedIds = await fetchAssignedAthleteIds(options.trainerId);
    athletes = athletes.filter((athlete) => assignedIds.has(athlete.id));
  } else if (isAdminRole(options?.role) && options?.trainerId) {
    const assignedToOthers = await fetchAthleteIdsAssignedToOtherTrainers(options.trainerId);
    athletes = athletes.filter((athlete) => !assignedToOthers.has(athlete.id));
  }

  return athletes;
}

/** Perfiles de atleta por id, con programa activo y alertas. */
export async function fetchAthleteSummariesByIds(ids: string[]): Promise<AthleteSummary[]> {
  if (ids.length === 0 || !isSupabaseConfigured) return [];

  const supabase = getSupabase();
  if (!supabase) return [];

  const atletaRoleId = await fetchAtletaRoleId(supabase);
  if (!atletaRoleId) return [];

  const { data, error } = await supabase
    .from(PERFIL_TABLE)
    .select('id, name, email, nivel, objetivo, altura, peso, lesiones')
    .eq('id_roles', atletaRoleId)
    .in('id', ids)
    .order('name');

  if (error || !data) return [];

  const programNames = new Map<string, string>();
  const { data: activePrograms } = await supabase
    .from('user_programs')
    .select('user_id, programas(name)')
    .in('user_id', ids)
    .eq('status', 'activa');

  for (const row of activePrograms ?? []) {
    const program = Array.isArray(row.programas) ? row.programas[0] : row.programas;
    if (program?.name) {
      programNames.set(row.user_id, String(program.name));
    }
  }

  const alertsByAthlete = await fetchTrainerAthleteAlerts(ids);

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

/** Atletas asignados a un entrenador concreto en el CRM (vista de ficha de staff). */
export async function fetchAssignedAthletesForTrainer(trainerId: string): Promise<AthleteSummary[]> {
  if (!trainerId || !isSupabaseConfigured) return [];

  const assignedIds = await fetchAssignedAthleteIds(trainerId);
  return fetchAthleteSummariesByIds([...assignedIds]);
}

export async function fetchAthletesForStaffMember(
  memberId: string,
  memberRole?: UserRole,
): Promise<AthleteSummary[]> {
  if (!memberId) return [];

  if (memberRole === 'administrador') {
    return fetchAthletes({ role: 'administrador', trainerId: memberId });
  }

  return fetchAssignedAthletesForTrainer(memberId);
}

export async function fetchAthleteById(
  athleteId: string,
  options?: { role?: UserRole; trainerId?: string },
): Promise<AthleteSummary | null> {
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

  if (isTrainerOnlyRole(options?.role) && options?.trainerId) {
    const assignedIds = await fetchAssignedAthleteIds(options.trainerId);
    if (!assignedIds.has(athleteId)) return null;
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
    .filter((entry) => entry.slug === 'entrenador' || entry.slug === 'administrador')
    .map((entry) => ({
      ...mapAthleteRow(entry.row),
      role: entry.slug as UserRole,
    }));
}

/** Entrenador y administrador comparten el panel de staff (de momento). */
export function isTrainerRole(role?: UserRole) {
  return role === 'entrenador' || role === 'administrador';
}

export function isAdminRole(role?: UserRole) {
  return role === 'administrador';
}

export function isTrainerOnlyRole(role?: UserRole) {
  return role === 'entrenador';
}

/** Usuario del CRM de gimnasios. No es staff de Training ProgLine. */
export function isGymRole(role?: UserRole) {
  return role === 'gimnasio';
}

/** Roles con panel propio en escritorio: staff de Training ProgLine y gimnasios. */
export function isBackofficeRole(role?: UserRole) {
  return isTrainerRole(role) || isGymRole(role);
}

/** El chat 1:1 lo gestiona el entrenador dueño de la ficha. El admin no habla con clientes cedidos. */
export async function canManageAthleteChat(
  athleteId: string,
  options?: { role?: UserRole; trainerId?: string },
): Promise<boolean> {
  if (!athleteId || !options?.trainerId || !isTrainerRole(options.role)) return false;

  if (isTrainerOnlyRole(options.role)) {
    const assignedIds = await fetchAssignedAthleteIds(options.trainerId);
    return assignedIds.has(athleteId);
  }

  const assignedToOthers = await fetchAthleteIdsAssignedToOtherTrainers(options.trainerId);
  return !assignedToOthers.has(athleteId);
}

/** Cuentas del equipo de staff que deben verse en el tablero CRM. */
export async function fetchTeamStaffProfiles(): Promise<AthleteSummary[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = getSupabase();
  if (!supabase) return [];

  const { data: roleRows, error: roleError } = await supabase
    .from('roles')
    .select('id, slug')
    .in('slug', STAFF_ROLE_SLUGS);

  if (roleError || !roleRows?.length) return [];

  const roleIdBySlug = new Map(
    roleRows.map((row) => [row.slug as UserRole, row.id as string]),
  );
  const staffRoleIds = [...roleIdBySlug.values()];

  const { data, error } = await supabase
    .from(PERFIL_TABLE)
    .select('id, name, email, nivel, objetivo, altura, peso, lesiones, id_roles')
    .in('id_roles', staffRoleIds)
    .order('name');

  if (error || !data) return [];

  return data.map((row) => {
    const roleSlug = [...roleIdBySlug.entries()].find(([, id]) => id === row.id_roles)?.[0];
    return {
      ...mapAthleteRow(row),
      role: roleSlug,
    };
  });
}
