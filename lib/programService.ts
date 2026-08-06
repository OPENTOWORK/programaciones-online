import type { AppIconName } from '@/constants/icons';
import type { Program, ProgramCategory, ProgramGoal } from '@/lib/types';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export interface Plan {
  id: string;
  label: string;
  category: ProgramCategory;
}

export const APP_SERVICE_PLANS: Plan[] = [
  { id: 'plan-nutrition', label: 'Nutrición', category: 'nutrition' },
  { id: 'plan-home-training', label: 'Entrenamiento personal en tu domicilio', category: 'home_training' },
  { id: 'plan-gym-training', label: 'Programación para tu gimnasio', category: 'gym_training' },
];

export const PLAN_DISPLAY_LABELS: Record<ProgramCategory, string> = {
  personalized: 'Entrenamiento personalizado',
  standard: 'Estándar',
  hype: 'Hype / Intensivas',
  nutrition: 'Nutrición',
  home_training: 'Entrenamiento personal en tu domicilio',
  gym_training: 'Programación para tu gimnasio',
};

export function isTrainerEditableCategory(category?: ProgramCategory) {
  return category === 'standard' || category === 'hype';
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

/** Catálogos de sesiones sueltas ("¿Cuánto tiempo tienes?"): no son un ciclo semanal con objetivo. */
function isLooseSessionCatalog(name: string) {
  const normalized = name.toLowerCase();
  return normalized.includes('cuánto tiempo') || normalized.includes('cuanto tiempo');
}

function inferIcon(name: string): AppIconName {
  const normalized = name.toLowerCase();

  if (isLooseSessionCatalog(name)) return 'time';
  if (normalized.includes('core')) return 'core';
  if (normalized.includes('athx') || normalized.includes('hype')) return 'intense';
  if (normalized.includes('hyrox')) return 'power';
  if (normalized.includes('calisten')) return 'strength';
  if (normalized.includes('cross')) return 'programs';
  if (normalized.includes('styrkur')) return 'strength';
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

  return {
    id: row.id,
    name: row.name,
    planId: row.id_planes,
    category,
    level: inferLevel(category),
    duration: 'Por definir' as Program['duration'],
    goal: inferGoal(row.name),
    sessionsPerWeek: looseSessions ? 0 : 3,
    status: 'disponible',
    icon: inferIcon(row.name),
    description: row.descripcion?.trim() || `Programación del plan ${planLabel}.`,
    equipment: [],
    trainingDays: [],
    weeks: [],
  };
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

  const [{ data: planes, error: planesError }, { data: programas, error: programasError }] =
    await Promise.all([
      supabase.from('planes').select('id, descripcion').order('descripcion'),
      supabase.from('programas').select('id, name, id_planes, descripcion').order('name'),
    ]);

  if (planesError) {
    throw new Error(planesError.message);
  }

  if (programasError) {
    throw new Error(programasError.message);
  }

  const planLabels = new Map((planes ?? []).map((plan) => [plan.id, plan.descripcion]));

  const plans: Plan[] = (planes ?? []).map((plan) => ({
    id: plan.id,
    label: plan.descripcion,
    category: mapPlanCategory(plan.descripcion),
  }));

  const programs: Program[] = (programas ?? [])
    .map((programa) => mapPrograma(programa, planLabels.get(programa.id_planes) ?? ''))
    .sort(compareCatalogPrograms);

  return { plans, programs };
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

  return mapPrograma(
    {
      id: data.id,
      name: data.name,
      id_planes: data.id_planes,
      descripcion: data.descripcion,
    },
    planLabel,
  );
}
