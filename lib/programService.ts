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
  { id: 'plan-home-training', label: 'Entrenamiento personal', category: 'home_training' },
];

export const PLAN_DISPLAY_LABELS: Record<ProgramCategory, string> = {
  personalized: 'Personalizado',
  standard: 'Estándar',
  hype: 'Hype / Intensivas',
  nutrition: 'Nutrición',
  home_training: 'Entrenamiento personal',
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

  if (normalized.includes('hype') || normalized.includes('intensiv')) {
    return 'hype';
  }

  if (normalized.includes('personaliz')) {
    return 'personalized';
  }

  return 'standard';
}

function inferIcon(name: string): AppIconName {
  const normalized = name.toLowerCase();

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

function inferGoal(name: string): ProgramGoal {
  const normalized = name.toLowerCase();

  if (normalized.includes('fuerza')) return 'fuerza';
  if (normalized.includes('movil')) return 'movilidad';
  if (normalized.includes('pliomet')) return 'rendimiento';
  if (normalized.includes('grasa') || normalized.includes('shred')) return 'pérdida de grasa';
  if (normalized.includes('rendimiento') || normalized.includes('engine')) return 'rendimiento';

  return 'hipertrofia';
}

function inferLevel(category: ProgramCategory): Program['level'] {
  if (category === 'standard') return 'principiante';
  if (category === 'hype') return 'intermedio';
  return 'intermedio';
}

function mapPrograma(
  row: { id: string; name: string; id_planes: string },
  planLabel: string,
): Program {
  const category = mapPlanCategory(planLabel);

  return {
    id: row.id,
    name: row.name,
    planId: row.id_planes,
    category,
    level: inferLevel(category),
    duration: 'Por definir' as Program['duration'],
    goal: inferGoal(row.name),
    sessionsPerWeek: 3,
    status: 'disponible',
    icon: inferIcon(row.name),
    description: `Programación del plan ${planLabel}.`,
    equipment: [],
    trainingDays: [],
    weeks: [],
  };
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
      supabase.from('programas').select('id, name, id_planes').order('name'),
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

  const programs: Program[] = (programas ?? []).map((programa) =>
    mapPrograma(programa, planLabels.get(programa.id_planes) ?? ''),
  );

  return { plans, programs };
}

export async function fetchProgramById(programId: string): Promise<Program | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('programas')
    .select('id, name, id_planes, planes(descripcion)')
    .eq('id', programId)
    .maybeSingle();

  if (error || !data) return null;

  const plan = Array.isArray(data.planes) ? data.planes[0] : data.planes;
  const planLabel = (plan as { descripcion?: string } | null)?.descripcion ?? '';

  return mapPrograma(
    { id: data.id, name: data.name, id_planes: data.id_planes },
    planLabel,
  );
}
