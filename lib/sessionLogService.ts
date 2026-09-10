import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Workout } from '@/lib/types';
import { buildWorkoutChecklist } from '@/lib/sessionChecklist';

export interface SessionLogRecord {
  id: string;
  userId: string;
  entrenoId?: string;
  athletePlanId?: string;
  programId?: string;
  scheduledDate: string;
  workoutName: string;
  feelings?: string;
  completedItems: string[];
  duration?: string;
  completedAt?: string;
  updatedAt?: string;
}

export interface SessionLogLookup {
  entrenoId?: string;
  athletePlanId?: string;
  scheduledDate: string;
}

const demoLogs = new Map<string, SessionLogRecord>();

function demoKey(userId: string, lookup: SessionLogLookup) {
  return `${userId}:${lookup.entrenoId ?? ''}:${lookup.athletePlanId ?? ''}:${lookup.scheduledDate}`;
}

function mapRow(row: Record<string, unknown>): SessionLogRecord {
  const completedItems = row.completed_items;
  return {
    id: row.id as string,
    userId: row.user_id as string,
    entrenoId: (row.entreno_id as string | null) ?? undefined,
    athletePlanId: (row.athlete_plan_id as string | null) ?? undefined,
    programId: (row.program_id as string | null) ?? undefined,
    scheduledDate: (row.scheduled_date as string) ?? '',
    workoutName: row.workout_name as string,
    feelings: (row.feelings as string | null) ?? undefined,
    completedItems: Array.isArray(completedItems) ? (completedItems as string[]) : [],
    duration: (row.duration as string | null) ?? undefined,
    completedAt: (row.completed_at as string | null) ?? undefined,
    updatedAt: (row.updated_at as string | null) ?? undefined,
  };
}

export async function fetchSessionLog(
  userId: string,
  lookup: SessionLogLookup,
): Promise<SessionLogRecord | null> {
  if (!isSupabaseConfigured) {
    return demoLogs.get(demoKey(userId, lookup)) ?? null;
  }

  const supabase = getSupabase();
  if (!supabase) return null;

  let query = supabase
    .from('workout_logs')
    .select(
      'id, user_id, entreno_id, athlete_plan_id, program_id, scheduled_date, workout_name, feelings, completed_items, duration, completed_at, updated_at',
    )
    .eq('user_id', userId)
    .eq('scheduled_date', lookup.scheduledDate);

  if (lookup.entrenoId) query = query.eq('entreno_id', lookup.entrenoId);
  if (lookup.athletePlanId) query = query.eq('athlete_plan_id', lookup.athletePlanId);

  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;
  return mapRow(data as Record<string, unknown>);
}

export async function fetchAthleteSessionLogs(
  athleteId: string,
  limit = 500,
): Promise<SessionLogRecord[]> {
  if (!isSupabaseConfigured) {
    return [...demoLogs.values()]
      .filter((log) => log.userId === athleteId)
      .slice(0, limit);
  }

  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('workout_logs')
    .select(
      'id, user_id, entreno_id, athlete_plan_id, program_id, scheduled_date, workout_name, feelings, completed_items, duration, completed_at, updated_at',
    )
    .eq('user_id', athleteId)
    .not('scheduled_date', 'is', null)
    .order('scheduled_date', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map((row) => mapRow(row as Record<string, unknown>));
}

export async function fetchSessionLogById(logId: string): Promise<SessionLogRecord | null> {
  if (!isSupabaseConfigured) {
    return [...demoLogs.values()].find((log) => log.id === logId) ?? null;
  }

  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('workout_logs')
    .select(
      'id, user_id, entreno_id, athlete_plan_id, program_id, scheduled_date, workout_name, feelings, completed_items, duration, completed_at, updated_at',
    )
    .eq('id', logId)
    .maybeSingle();

  if (error || !data) return null;
  return mapRow(data as Record<string, unknown>);
}

export async function fetchSessionLogsByIds(logIds: string[]): Promise<SessionLogRecord[]> {
  const uniqueIds = [...new Set(logIds.filter(Boolean))];
  if (uniqueIds.length === 0) return [];

  if (!isSupabaseConfigured) {
    return [...demoLogs.values()].filter((log) => uniqueIds.includes(log.id));
  }

  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('workout_logs')
    .select(
      'id, user_id, entreno_id, athlete_plan_id, program_id, scheduled_date, workout_name, feelings, completed_items, duration, completed_at, updated_at',
    )
    .in('id', uniqueIds);

  if (error || !data) return [];
  return data.map((row) => mapRow(row as Record<string, unknown>));
}

export async function saveSessionLog(input: {
  userId: string;
  entrenoId?: string;
  athletePlanId?: string;
  programId?: string;
  scheduledDate: string;
  workoutName: string;
  feelings?: string;
  completedItems: string[];
  workout?: Pick<Workout, 'warmup' | 'main' | 'core' | 'cooldown' | 'exercises' | 'estimatedDuration'>;
  markCompleted?: boolean;
}): Promise<{ error?: string; log?: SessionLogRecord }> {
  const checklist = input.workout ? buildWorkoutChecklist(input.workout) : [];
  const completedCount = input.completedItems.length;
  const duration =
    checklist.length > 0
      ? `${completedCount}/${checklist.length} partes`
      : input.workout?.estimatedDuration ?? '—';

  const payload = {
    user_id: input.userId,
    entreno_id: input.entrenoId ?? null,
    athlete_plan_id: input.athletePlanId ?? null,
    program_id: input.programId ?? null,
    scheduled_date: input.scheduledDate,
    workout_name: input.workoutName,
    feelings: input.feelings?.trim() || null,
    completed_items: input.completedItems,
    duration,
    completed_at: input.markCompleted ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured) {
    const key = demoKey(input.userId, {
      entrenoId: input.entrenoId,
      athletePlanId: input.athletePlanId,
      scheduledDate: input.scheduledDate,
    });
    const existing = demoLogs.get(key);
    const log: SessionLogRecord = {
      id: existing?.id ?? `demo-log-${Date.now()}`,
      userId: input.userId,
      entrenoId: input.entrenoId,
      athletePlanId: input.athletePlanId,
      programId: input.programId,
      scheduledDate: input.scheduledDate,
      workoutName: input.workoutName,
      feelings: input.feelings?.trim() || undefined,
      completedItems: input.completedItems,
      duration,
      completedAt: input.markCompleted ? new Date().toISOString() : existing?.completedAt,
      updatedAt: new Date().toISOString(),
    };
    demoLogs.set(key, log);
    return { log };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible' };

  const existing = await fetchSessionLog(input.userId, {
    entrenoId: input.entrenoId,
    athletePlanId: input.athletePlanId,
    scheduledDate: input.scheduledDate,
  });

  if (existing) {
    const { data, error } = await supabase
      .from('workout_logs')
      .update({
        feelings: payload.feelings,
        completed_items: payload.completed_items,
        duration: payload.duration,
        completed_at: input.markCompleted ? payload.completed_at : existing.completedAt ?? null,
        updated_at: payload.updated_at,
        workout_name: payload.workout_name,
      })
      .eq('id', existing.id)
      .select(
        'id, user_id, entreno_id, athlete_plan_id, program_id, scheduled_date, workout_name, feelings, completed_items, duration, completed_at, updated_at',
      )
      .single();

    if (error) return { error: error.message };
    return { log: mapRow(data as Record<string, unknown>) };
  }

  const { data, error } = await supabase
    .from('workout_logs')
    .insert(payload)
    .select(
      'id, user_id, entreno_id, athlete_plan_id, program_id, scheduled_date, workout_name, feelings, completed_items, duration, completed_at, updated_at',
    )
    .single();

  if (error) {
    const message = error.message.toLowerCase().includes('workout_logs')
      ? 'La tabla workout_logs no está actualizada. Ejecuta: npm run supabase:session-logs'
      : error.message;
    return { error: message };
  }

  return { log: mapRow(data as Record<string, unknown>) };
}
