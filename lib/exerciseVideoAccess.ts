import { fetchLeadOwnerId } from '@/lib/athleteService';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

/** Entrenador cuyos atletas no ven vídeos de ejemplo en las sesiones. */
export const CHARLY_TRAINER_EMAIL = 'charly-7-8@hotmail.com';

export function isCharlyTrainer(input?: {
  trainerId?: string | null;
  trainerEmail?: string | null;
}) {
  const email = input?.trainerEmail?.trim().toLowerCase();
  return email === CHARLY_TRAINER_EMAIL;
}

/** Vídeos de demostración en la sesión (no confundir con el envío de feedback al entrenador). */
export function allowsSessionExerciseVideos(input?: {
  trainerId?: string | null;
  trainerEmail?: string | null;
}) {
  return !isCharlyTrainer(input);
}

export async function fetchTrainerEmail(trainerId: string): Promise<string | null> {
  if (!trainerId || !isSupabaseConfigured) return null;

  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase.from('Perfil').select('email').eq('id', trainerId).maybeSingle();
  if (error || !data) return null;

  return (data.email as string | null)?.trim().toLowerCase() ?? null;
}

export async function resolveAthleteTrainerAccess(athleteId?: string | null, trainerId?: string | null) {
  let resolvedTrainerId = trainerId?.trim() || null;

  if (!resolvedTrainerId && athleteId) {
    resolvedTrainerId = await fetchLeadOwnerId(athleteId);
  }

  if (!resolvedTrainerId) {
    return { trainerId: null as string | null, trainerEmail: null as string | null };
  }

  const trainerEmail = await fetchTrainerEmail(resolvedTrainerId);
  return { trainerId: resolvedTrainerId, trainerEmail };
}
