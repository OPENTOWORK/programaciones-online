import { enrichProgramFromHypeCatalog, isHypeWeeklyChallengePlaceholder, isHypeWeeklyChallengeProgram, sortHypePrograms } from '@/lib/hypeCatalog';
import { isJwtClockSkewError, jwtClockSkewUserMessage, recoverJwtClockSkew } from '@/lib/authSessionRecovery';
import { isAdminRole, isGymRole, isTrainerRole } from '@/lib/athleteService';
import { enrichProgramFromVenueCatalog, parseStandardVenueFromDescription } from '@/lib/standardVenueCatalog';
import type { AppIconName } from '@/constants/icons';
import type { Program, ProgramCategory, ProgramGoal, UserRole } from '@/lib/types';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export interface Plan {
  id: string;
  label: string;
  category: ProgramCategory;
}

export const APP_SERVICE_PLANS: Plan[] = [
  { id: 'plan-nutrition', label: 'Nutrition · Plan', category: 'nutrition' },
  { id: 'plan-home-training', label: 'Home · Coaching', category: 'home_training' },
  { id: 'plan-gym-training', label: 'Gym · Programming', category: 'gym_training' },
];

export const PLAN_DISPLAY_LABELS: Record<ProgramCategory, string> = {
  personalized: 'Personal · Coaching',
  standard: 'Base · Training',
  hype: 'Training · Performance',
  nutrition: 'Nutrition · Plan',
  home_training: 'Home · Coaching',
  gym_training: 'Gym · Programming',
};

export const PLAN_DISPLAY_SUBTITLES: Record<ProgramCategory, string> = {
  personalized: 'Programación hecha a tu medida según tu objetivo, nivel y disponibilidad semanal.',
  standard: 'Catálogo de gym y calistenia',
  hype: 'Bloques intensivos de alto rendimiento para subir tu capacidad de trabajo y condición física.',
  nutrition: 'Pauta nutricional personalizada adaptada a tu rutina, preferencias y metas.',
  home_training: 'En Madrid: entrenador en tu domicilio, con sesiones presenciales adaptadas a tu espacio y material.',
  gym_training: 'Programación para tu gimnasio con el equipamiento y horarios que tengas disponibles.',
};

export function getPlanDisplaySubtitle(category: ProgramCategory, role?: UserRole): string {
  if (isGymRole(role) || isTrainerRole(role)) {
    if (category === 'nutrition') {
      return 'Pide un plan nutricional para tus atletas.';
    }
    if (category === 'personalized') {
      return 'Programa para tus atletas.';
    }
    if (category === 'hype') {
      return 'Bloques de alto rendimiento para tus atletas.';
    }
    if (category === 'gym_training') {
      return 'Programación para tu gimnasio.';
    }
  }
  return PLAN_DISPLAY_SUBTITLES[category];
}

export function isTrainerEditableCategory(category?: ProgramCategory) {
  return category === 'hype';
}

export function canManageTrainerProgram(
  role?: UserRole,
  category?: ProgramCategory,
  program?: Pick<Program, 'category' | 'name' | 'id'>,
) {
  const resolvedCategory = category ?? program?.category;
  if (!isTrainerEditableCategory(resolvedCategory)) return false;
  if (isAdminRole(role)) return true;
  if (!isTrainerRole(role) || !program) return false;
  return isHypeWeeklyChallengeProgram(program) || isHypeWeeklyChallengePlaceholder(program);
}

/** Catálogo Base · Training retirado de la app; las plantillas de sesión siguen en Plantillas. */
export function isRemovedPlanCategory(category?: ProgramCategory | null) {
  return category === 'standard';
}

export function filterVisiblePlans(plans: Plan[]) {
  return plans.filter((plan) => !isRemovedPlanCategory(plan.category));
}

/** Programaciones visibles en el panel del gimnasio (rol `gimnasio`). */
export const GYM_ROLE_PLAN_CATEGORIES: ProgramCategory[] = [
  'personalized',
  'hype',
  'nutrition',
  'gym_training',
];

const GYM_ROLE_PLAN_ORDER: ProgramCategory[] = GYM_ROLE_PLAN_CATEGORIES;

const GYM_ROLE_PLAN_STUBS: Plan[] = [
  { id: 'personalized', label: PLAN_DISPLAY_LABELS.personalized, category: 'personalized' },
  { id: 'hype', label: PLAN_DISPLAY_LABELS.hype, category: 'hype' },
];

function sortPlansByCategory(plans: Plan[], order: ProgramCategory[]) {
  return [...plans].sort(
    (left, right) => order.indexOf(left.category) - order.indexOf(right.category),
  );
}

export function filterPlansForUserRole(plans: Plan[], role?: UserRole) {
  if (!isGymRole(role)) return plans;

  const byCategory = new Map<ProgramCategory, Plan>();

  for (const plan of plans) {
    if (!GYM_ROLE_PLAN_CATEGORIES.includes(plan.category)) continue;
    byCategory.set(plan.category, {
      ...plan,
      label: PLAN_DISPLAY_LABELS[plan.category] ?? plan.label,
    });
  }

  for (const servicePlan of APP_SERVICE_PLANS) {
    if (!GYM_ROLE_PLAN_CATEGORIES.includes(servicePlan.category)) continue;
    if (!byCategory.has(servicePlan.category)) {
      byCategory.set(servicePlan.category, servicePlan);
    }
  }

  for (const stub of GYM_ROLE_PLAN_STUBS) {
    if (!byCategory.has(stub.category)) {
      byCategory.set(stub.category, stub);
    }
  }

  return sortPlansByCategory(
    GYM_ROLE_PLAN_CATEGORIES.map((category) => byCategory.get(category)).filter(
      (plan): plan is Plan => Boolean(plan),
    ),
    GYM_ROLE_PLAN_ORDER,
  );
}

export function filterVisiblePrograms(programs: Program[]) {
  return programs.filter((program) => !isRemovedPlanCategory(program.category));
}

export function mergeAppServicePlans(plans: Plan[]) {
  const merged = plans.map((plan) => ({
    ...plan,
    label: PLAN_DISPLAY_LABELS[plan.category] ?? plan.label,
  }));

  for (const servicePlan of APP_SERVICE_PLANS) {
    if (!merged.some((plan) => plan.category === servicePlan.category)) {
      merged.push(servicePlan);
    }
  }

  return merged;
}

function mapPlanCategory(descripcion: string): ProgramCategory {
  const normalized = descripcion.toLowerCase();

  if (normalized.includes('nutrici')) {
    return 'nutrition';
  }

  if (normalized.includes('domicilio') || normalized.includes('casa') || normalized.includes('entrenamiento personal')) {
    return 'home_training';
  }

  if (normalized.includes('gimnasio')) {
    return 'gym_training';
  }

  if (normalized.includes('hype') || normalized.includes('intensiv')) {
    return 'hype';
  }

  if (normalized.includes('personaliz')) {
    return 'personalized';
  }

  return 'standard';
}

/** Catálogos de sesiones sueltas (tiempo libre / metcon): no son un ciclo semanal con objetivo. */
function isLooseSessionCatalog(name: string) {
  const normalized = name.toLowerCase();
  return (
    normalized.includes('cuánto tiempo') ||
    normalized.includes('cuanto tiempo') ||
    normalized.trim() === 'metcon'
  );
}

function inferIcon(name: string): AppIconName {
  const normalized = name.toLowerCase();

  if (normalized.trim() === 'metcon') return 'intense';
  if (isLooseSessionCatalog(name)) return 'time';
  if (normalized.includes('core')) return 'core';
  if (normalized.includes('desafio') || normalized.includes('desafío') || normalized.includes('challenge')) {
    return 'catalogChallenge';
  }
  if (normalized.includes('hyrox')) return 'catalogHyrox';
  if (normalized.includes('athx')) return 'catalogAthx';
  if (normalized.includes('calisten')) return 'catalogCalistenia';
  if (normalized.includes('cross')) return 'catalogCrosstraining';
  if (normalized.includes('basico') || normalized.includes('básico') || normalized.includes('styrkur')) {
    return 'catalogBasico';
  }
  if (normalized.includes('hype')) return 'catalogHype';
  if (normalized.includes('fuerza')) return 'strength';
  if (normalized.includes('hypert') || normalized.includes('hipert')) return 'hypertrophy';
  if (normalized.includes('movil')) return 'mobility';
  if (normalized.includes('pliomet')) return 'plyo';
  if (normalized.includes('shred') || normalized.includes('grasa')) return 'shred';
  if (normalized.includes('power') || normalized.includes('engine')) return 'power';

  return 'programs';
}

/** Sin pista en el nombre no se inventa objetivo: la ficha lo oculta. */
function inferGoal(name: string): ProgramGoal | undefined {
  const normalized = name.toLowerCase();

  if (normalized.includes('fuerza') || normalized.includes('core')) return 'fuerza';
  if (normalized.includes('movil')) return 'movilidad';
  if (normalized.includes('pliomet')) return 'rendimiento';
  if (normalized.includes('grasa') || normalized.includes('shred')) return 'pérdida de grasa';
  if (normalized.includes('rendimiento') || normalized.includes('engine')) return 'rendimiento';
  if (normalized.includes('hypert') || normalized.includes('hipert')) return 'hipertrofia';

  return undefined;
}

function inferLevel(category: ProgramCategory): Program['level'] {
  if (category === 'standard') return 'principiante';
  if (category === 'hype') return 'intermedio';
  return 'intermedio';
}

function mapPrograma(
  row: { id: string; name: string; id_planes: string; descripcion?: string | null },
  planLabel: string,
): Program {
  const category = mapPlanCategory(planLabel);
  const looseSessions = isLooseSessionCatalog(row.name);
  const { venue, description } = parseStandardVenueFromDescription(row.descripcion);

  return enrichProgramFromHypeCatalog(
    enrichProgramFromVenueCatalog({
      id: row.id,
      name: row.name,
      planId: row.id_planes,
      category,
      standardVenue: venue ?? (category === 'standard' ? 'gym' : undefined),
      level: inferLevel(category),
      duration: 'Por definir' as Program['duration'],
      goal: inferGoal(row.name),
      sessionsPerWeek: looseSessions ? 0 : 3,
      status: 'disponible',
      icon: inferIcon(row.name),
      description: description || `Programación del plan ${planLabel}.`,
      equipment: [],
      trainingDays: [],
      weeks: [],
    }),
  );
}

/** Los catálogos de sesiones sueltas se listan al final del plan. */
function compareCatalogPrograms(a: Program, b: Program) {
  const aLoose = isLooseSessionCatalog(a.name);
  const bLoose = isLooseSessionCatalog(b.name);

  if (aLoose !== bLoose) return aLoose ? 1 : -1;

  return a.name.localeCompare(b.name, 'es');
}

export function mapProgramFromJoin(
  row: { id: string; name: string; id_planes: string; descripcion?: string | null },
  planLabel: string,
): Program {
  return mapPrograma(row, planLabel);
}

export async function fetchProgramsByIds(programIds: string[]): Promise<Map<string, Program>> {
  const uniqueIds = [...new Set(programIds.filter(Boolean))];
  if (!isSupabaseConfigured || uniqueIds.length === 0) {
    return new Map();
  }

  const supabase = getSupabase();
  if (!supabase) return new Map();

  const { data, error } = await supabase
    .from('programas')
    .select('id, name, id_planes, descripcion, planes(descripcion)')
    .in('id', uniqueIds);

  if (error || !data) return new Map();

  const programs = new Map<string, Program>();
  for (const row of data) {
    const plan = Array.isArray(row.planes) ? row.planes[0] : row.planes;
    const planLabel = (plan as { descripcion?: string } | null)?.descripcion ?? '';
    programs.set(
      row.id,
      mapPrograma(
        {
          id: row.id,
          name: row.name,
          id_planes: row.id_planes,
          descripcion: row.descripcion,
        },
        planLabel,
      ),
    );
  }

  return programs;
}

export async function fetchPlansAndPrograms(): Promise<{ plans: Plan[]; programs: Program[] }> {
  if (!isSupabaseConfigured) {
    return { plans: [], programs: [] };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { plans: [], programs: [] };
  }

  const loadCatalog = async () => {
    const [{ data: planes, error: planesError }, { data: programas, error: programasError }, { data: sessionCounts, error: countsError }] =
      await Promise.all([
        supabase.from('planes').select('id, descripcion').order('descripcion'),
        supabase.from('programas').select('id, name, id_planes, descripcion').order('name'),
        supabase.from('entrenos_diarios').select('program_id'),
      ]);

    return { planes, planesError, programas, programasError, sessionCounts, countsError };
  };

  let { planes, planesError, programas, programasError, sessionCounts, countsError } = await loadCatalog();

  const authError = planesError ?? programasError;
  if (authError && isJwtClockSkewError(authError.message)) {
    const recovered = await recoverJwtClockSkew(supabase);
    if (recovered) {
      ({ planes, planesError, programas, programasError, sessionCounts, countsError } = await loadCatalog());
    } else {
      throw new Error(jwtClockSkewUserMessage());
    }
  }

  if (planesError) {
    throw new Error(planesError.message);
  }

  if (programasError) {
    throw new Error(programasError.message);
  }

  if (countsError) {
    // No bloqueamos el listado si falla el conteo; solo afecta el desempate de duplicados.
    console.warn('No se pudieron contar sesiones de catálogo:', countsError.message);
  }

  const sessionsByProgram = new Map<string, number>();
  for (const row of sessionCounts ?? []) {
    const programId = row.program_id as string | null;
    if (!programId) continue;
    sessionsByProgram.set(programId, (sessionsByProgram.get(programId) ?? 0) + 1);
  }

  const planLabels = new Map((planes ?? []).map((plan) => [plan.id, plan.descripcion]));

  const plans: Plan[] = filterVisiblePlans(
    (planes ?? []).map((plan) => ({
      id: plan.id,
      label: plan.descripcion,
      category: mapPlanCategory(plan.descripcion),
    })),
  );

  const mappedPrograms = filterVisiblePrograms(
    (programas ?? []).map((programa) => ({
      ...mapPrograma(programa, planLabels.get(programa.id_planes) ?? ''),
      catalogSessionCount: sessionsByProgram.get(programa.id) ?? 0,
    })),
  );
  const hypePrograms = sortHypePrograms(
    mappedPrograms.filter((program) => program.category === 'hype'),
  );
  const otherPrograms = mappedPrograms
    .filter((program) => program.category !== 'hype')
    .sort(compareCatalogPrograms);

  return { plans, programs: [...otherPrograms, ...hypePrograms] };
}

export async function fetchProgramById(programId: string): Promise<Program | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('programas')
    .select('id, name, id_planes, descripcion, planes(descripcion)')
    .eq('id', programId)
    .maybeSingle();

  if (error || !data) return null;

  const plan = Array.isArray(data.planes) ? data.planes[0] : data.planes;
  const planLabel = (plan as { descripcion?: string } | null)?.descripcion ?? '';

  const program = mapPrograma(
    {
      id: data.id,
      name: data.name,
      id_planes: data.id_planes,
      descripcion: data.descripcion,
    },
    planLabel,
  );

  return isRemovedPlanCategory(program.category) ? null : program;
}
