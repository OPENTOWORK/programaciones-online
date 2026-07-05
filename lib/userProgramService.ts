import { fetchProgramById } from '@/lib/programService';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { ActiveProgramSummary, UserActiveProgram } from '@/lib/types';
import { fetchWorkoutsByProgram } from '@/lib/workoutService';

const USER_PROGRAMS_TABLE = 'user_programs';
export const MAX_ACTIVE_PROGRAMS = 3;

async function mapProgramRow(programId: string, nameFromJoin?: string | null): Promise<UserActiveProgram> {
  const fullProgram = await fetchProgramById(programId);

  return {
    id: programId,
    name: String(nameFromJoin ?? fullProgram?.name ?? 'Programación'),
    duration: fullProgram?.duration ?? 'Por definir',
    sessionsPerWeek: fullProgram?.sessionsPerWeek ?? 3,
    icon: fullProgram?.icon,
  };
}

export async function fetchActiveProgramsForUser(userId: string): Promise<UserActiveProgram[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(USER_PROGRAMS_TABLE)
    .select('program_id, started_at, programas(name)')
    .eq('user_id', userId)
    .eq('status', 'activa')
    .order('started_at', { ascending: true })
    .limit(MAX_ACTIVE_PROGRAMS);

  if (error || !data) return [];

  return Promise.all(
    data.map((row) => {
      const programRow = Array.isArray(row.programas) ? row.programas[0] : row.programas;
      return mapProgramRow(row.program_id, programRow?.name as string | null);
    }),
  );
}

export async function fetchActiveProgramForUser(userId: string): Promise<UserActiveProgram | undefined> {
  const programs = await fetchActiveProgramsForUser(userId);
  return programs[0];
}

async function buildActiveProgramSummary(
  activeProgram: UserActiveProgram,
  completedEntrenoIds: Set<string>,
): Promise<ActiveProgramSummary | null> {
  const program = await fetchProgramById(activeProgram.id);
  if (!program) return null;

  const workouts = await fetchWorkoutsByProgram(activeProgram.id);
  if (workouts.length === 0) return null;

  const programWorkoutIds = new Set(workouts.map((workout) => workout.id));
  const completedSessions = [...completedEntrenoIds].filter((id) => programWorkoutIds.has(id)).length;
  const nextWorkout = workouts.find((workout) => !completedEntrenoIds.has(workout.id)) ?? workouts[0];

  return {
    program: { ...program, status: 'activa' },
    nextWorkout,
    completedSessions,
    totalSessions: Math.max(workouts.length, 1),
  };
}

export async function fetchActiveProgramSummaries(userId: string): Promise<ActiveProgramSummary[]> {
  const activePrograms = await fetchActiveProgramsForUser(userId);
  if (activePrograms.length === 0) return [];

  const supabase = getSupabase();
  const completedEntrenoIds = new Set<string>();

  if (supabase) {
    const { data: logs } = await supabase
      .from('workout_logs')
      .select('entreno_id')
      .eq('user_id', userId);

    for (const log of logs ?? []) {
      if (log.entreno_id) {
        completedEntrenoIds.add(log.entreno_id);
      }
    }
  }

  const summaries = await Promise.all(
    activePrograms.map((activeProgram) => buildActiveProgramSummary(activeProgram, completedEntrenoIds)),
  );

  return summaries.filter((summary): summary is ActiveProgramSummary => summary !== null);
}

export async function fetchActiveProgramSummary(userId: string): Promise<ActiveProgramSummary | null> {
  const summaries = await fetchActiveProgramSummaries(userId);
  return summaries[0] ?? null;
}

export async function startUserProgram(
  userId: string,
  programId: string,
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase no está configurado' };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { error: 'Supabase no está disponible' };
  }

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    return { error: 'No hay sesión activa' };
  }

  const { data: existing } = await supabase
    .from(USER_PROGRAMS_TABLE)
    .select('status')
    .eq('user_id', userId)
    .eq('program_id', programId)
    .maybeSingle();

  if (existing?.status !== 'activa') {
    const { count, error: countError } = await supabase
      .from(USER_PROGRAMS_TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'activa');

    if (countError) {
      return { error: countError.message };
    }

    if ((count ?? 0) >= MAX_ACTIVE_PROGRAMS) {
      return {
        error: `Ya tienes ${MAX_ACTIVE_PROGRAMS} programaciones activas. Finaliza una antes de empezar otra.`,
      };
    }
  }

  const { error } = await supabase.from(USER_PROGRAMS_TABLE).upsert(
    {
      user_id: userId,
      program_id: programId,
      status: 'activa',
      started_at: new Date().toISOString(),
      completed_at: null,
    },
    { onConflict: 'user_id,program_id' },
  );

  if (error) {
    return { error: error.message };
  }

  return {};
}

export async function finishUserProgram(
  userId: string,
  programId: string,
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase no está configurado' };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { error: 'Supabase no está disponible' };
  }

  const { error } = await supabase
    .from(USER_PROGRAMS_TABLE)
    .update({
      status: 'completada',
      completed_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('program_id', programId)
    .eq('status', 'activa');

  if (error) {
    return { error: error.message };
  }

  return {};
}

export async function isUserProgramActive(userId: string, programId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const supabase = getSupabase();
  if (!supabase) return false;

  const { data } = await supabase
    .from(USER_PROGRAMS_TABLE)
    .select('id')
    .eq('user_id', userId)
    .eq('program_id', programId)
    .eq('status', 'activa')
    .maybeSingle();

  return Boolean(data);
}

export function isProgramActiveForUser(
  programId: string,
  programs?: UserActiveProgram[],
  fallbackProgramId?: string,
): boolean {
  if (programs?.some((program) => program.id === programId)) {
    return true;
  }

  return fallbackProgramId === programId;
}
