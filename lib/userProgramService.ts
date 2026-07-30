import { fetchProgramsByIds, mapProgramFromJoin } from '@/lib/programService';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { ActiveProgramSummary, Program, UserActiveProgram } from '@/lib/types';
import { fetchWorkoutStubsByPrograms, stubToWorkout } from '@/lib/workoutService';

const USER_PROGRAMS_TABLE = 'user_programs';
export const MAX_ACTIVE_PROGRAMS = 3;

type ProgramJoinRow = {
  id: string;
  name: string;
  id_planes: string;
  descripcion?: string | null;
  planes?: { descripcion?: string } | { descripcion?: string }[] | null;
};

function planLabelFromJoin(row: ProgramJoinRow | null | undefined) {
  if (!row?.planes) return '';
  const plan = Array.isArray(row.planes) ? row.planes[0] : row.planes;
  return plan?.descripcion ?? '';
}

function toUserActiveProgram(program: Program): UserActiveProgram {
  return {
    id: program.id,
    name: program.name,
    duration: program.duration,
    sessionsPerWeek: program.sessionsPerWeek,
    icon: program.icon,
  };
}

export async function fetchActiveProgramsForUser(userId: string): Promise<UserActiveProgram[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(USER_PROGRAMS_TABLE)
    .select('program_id, started_at, programas(id, name, id_planes, descripcion, planes(descripcion))')
    .eq('user_id', userId)
    .eq('status', 'activa')
    .order('started_at', { ascending: true })
    .limit(MAX_ACTIVE_PROGRAMS);

  if (error || !data) return [];

  return data
    .map((row) => {
      const programRow = Array.isArray(row.programas) ? row.programas[0] : row.programas;
      if (!programRow) return null;

      const program = mapProgramFromJoin(
        {
          id: programRow.id,
          name: programRow.name,
          id_planes: programRow.id_planes,
          descripcion: programRow.descripcion,
        },
        planLabelFromJoin(programRow as ProgramJoinRow),
      );

      return toUserActiveProgram(program);
    })
    .filter((program): program is UserActiveProgram => program !== null);
}

export async function fetchActiveProgramForUser(userId: string): Promise<UserActiveProgram | undefined> {
  const programs = await fetchActiveProgramsForUser(userId);
  return programs[0];
}

export async function fetchActiveProgramSummaries(userId: string): Promise<ActiveProgramSummary[]> {
  const activePrograms = await fetchActiveProgramsForUser(userId);
  if (activePrograms.length === 0) return [];

  const programIds = activePrograms.map((program) => program.id);
  const supabase = getSupabase();

  const [{ data: logs }, programsById, workoutsByProgram] = await Promise.all([
    supabase
      ? supabase.from('workout_logs').select('entreno_id').eq('user_id', userId)
      : Promise.resolve({ data: [] as { entreno_id: string | null }[] }),
    fetchProgramsByIds(programIds),
    fetchWorkoutStubsByPrograms(programIds),
  ]);

  const completedEntrenoIds = new Set<string>();
  for (const log of logs ?? []) {
    if (log.entreno_id) {
      completedEntrenoIds.add(log.entreno_id);
    }
  }

  const summaries: ActiveProgramSummary[] = [];

  for (const activeProgram of activePrograms) {
    const program = programsById.get(activeProgram.id);
    const workoutStubs = workoutsByProgram.get(activeProgram.id) ?? [];
    if (!program || workoutStubs.length === 0) continue;

    const programWorkoutIds = new Set(workoutStubs.map((workout) => workout.id));
    const completedSessions = [...completedEntrenoIds].filter((id) => programWorkoutIds.has(id)).length;
    const nextStub =
      workoutStubs.find((workout) => !completedEntrenoIds.has(workout.id)) ?? workoutStubs[0];

    summaries.push({
      program: { ...program, status: 'activa' },
      nextWorkout: stubToWorkout(nextStub),
      completedSessions,
      totalSessions: Math.max(workoutStubs.length, 1),
    });
  }

  return summaries;
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
