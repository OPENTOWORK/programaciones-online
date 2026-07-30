import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { AthleteIntakeForm } from '@/lib/types';

const TABLE = 'athlete_intake_forms';

const demoForms = new Map<string, AthleteIntakeForm>();

function isMissingTableError(error: { message?: string; code?: string } | null | undefined) {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? '';
  return (
    message.includes('athlete_intake_forms') ||
    message.includes('schema cache') ||
    message.includes('does not exist') ||
    message.includes('could not find the table') ||
    error.code === 'PGRST205' ||
    error.code === '42P01'
  );
}

function mapRow(row: Record<string, unknown>): AthleteIntakeForm {
  return {
    goals: Array.isArray(row.goals) ? (row.goals as string[]) : [],
    goalsOther: (row.goals_other as string | null) ?? undefined,
    experience: (row.experience as string | null) ?? undefined,
    trainingPlace: (row.training_place as AthleteIntakeForm['trainingPlace']) ?? undefined,
    equipment: (row.equipment as string | null) ?? undefined,
    availability: (row.availability as string | null) ?? undefined,
    pushupsReps: (row.pushups_reps as number | null) ?? undefined,
    squatsReps: (row.squats_reps as number | null) ?? undefined,
    pullupsReps: (row.pullups_reps as number | null) ?? undefined,
    hasInjuries: (row.has_injuries as boolean | null) ?? undefined,
    injuriesDetail: (row.injuries_detail as string | null) ?? undefined,
    takesMedication: (row.takes_medication as boolean | null) ?? undefined,
    hadSurgery: (row.had_surgery as boolean | null) ?? undefined,
    hasMedicalCondition: (row.has_medical_condition as boolean | null) ?? undefined,
    completedAt: (row.completed_at as string | null) ?? undefined,
    updatedAt: (row.updated_at as string | null) ?? undefined,
  };
}

export function isIntakeFormComplete(form: AthleteIntakeForm | null | undefined): boolean {
  if (!form) return false;

  return (
    form.goals.length > 0 &&
    Boolean(form.experience?.trim()) &&
    Boolean(form.trainingPlace) &&
    Boolean(form.equipment?.trim()) &&
    Boolean(form.availability?.trim()) &&
    typeof form.pushupsReps === 'number' &&
    typeof form.squatsReps === 'number' &&
    typeof form.pullupsReps === 'number' &&
    typeof form.hasInjuries === 'boolean' &&
    typeof form.takesMedication === 'boolean' &&
    typeof form.hadSurgery === 'boolean' &&
    typeof form.hasMedicalCondition === 'boolean'
  );
}

export async function fetchIntakeForm(
  userId: string,
  isDemoMode: boolean,
): Promise<{ form: AthleteIntakeForm | null; persistent: boolean }> {
  if (isDemoMode || !isSupabaseConfigured) {
    return { form: demoForms.get(userId) ?? null, persistent: false };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { form: demoForms.get(userId) ?? null, persistent: false };
  }

  const { data, error } = await supabase.from(TABLE).select('*').eq('user_id', userId).maybeSingle();

  if (isMissingTableError(error)) {
    return { form: demoForms.get(userId) ?? null, persistent: false };
  }

  if (error || !data) {
    return { form: null, persistent: true };
  }

  return { form: mapRow(data as Record<string, unknown>), persistent: true };
}

export async function saveIntakeForm(
  userId: string,
  form: AthleteIntakeForm,
  useLocalStore: boolean,
): Promise<{ error?: string; form?: AthleteIntakeForm }> {
  const complete = isIntakeFormComplete(form);
  const nowIso = new Date().toISOString();

  if (useLocalStore) {
    const saved: AthleteIntakeForm = {
      ...form,
      completedAt: complete ? nowIso : undefined,
      updatedAt: nowIso,
    };
    demoForms.set(userId, saved);
    return { form: saved };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { error: 'Supabase no está disponible' };
  }

  const payload = {
    user_id: userId,
    goals: form.goals,
    goals_other: form.goalsOther?.trim() || null,
    experience: form.experience?.trim() || null,
    training_place: form.trainingPlace ?? null,
    equipment: form.equipment?.trim() || null,
    availability: form.availability?.trim() || null,
    pushups_reps: form.pushupsReps ?? null,
    squats_reps: form.squatsReps ?? null,
    pullups_reps: form.pullupsReps ?? null,
    has_injuries: form.hasInjuries ?? null,
    injuries_detail: form.injuriesDetail?.trim() || null,
    takes_medication: form.takesMedication ?? null,
    had_surgery: form.hadSurgery ?? null,
    has_medical_condition: form.hasMedicalCondition ?? null,
    completed_at: complete ? nowIso : null,
    updated_at: nowIso,
  };

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(payload, { onConflict: 'user_id' })
    .select('*')
    .single();

  if (error) {
    const message = isMissingTableError(error)
      ? 'La tabla de formulario de bienvenida no está disponible. Ejecuta: npm run supabase:athlete-intake-form'
      : error.message;
    return { error: message };
  }

  return { form: mapRow(data as Record<string, unknown>) };
}
