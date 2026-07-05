import type { ProgressData, WorkoutLog } from '@/lib/types';

const RECENT_HISTORY_LIMIT = 6;

export const emptyProgress: ProgressData = {
  weeklyCompleted: 0,
  weeklyTarget: 0,
  monthlyCompleted: 0,
  monthlyTarget: 0,
  streak: 0,
  totalSessions: 0,
  history: [],
  motivationalStatus: 'Aún no hay entrenamientos registrados. ¡Empieza hoy!',
};

function startOfWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function calculateStreak(logDates: Date[]) {
  if (logDates.length === 0) return 0;

  const uniqueDays = [...new Set(logDates.map((d) => d.toDateString()))]
    .map((value) => new Date(value))
    .sort((a, b) => b.getTime() - a.getTime());

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (const day of uniqueDays) {
    const normalized = new Date(day);
    normalized.setHours(0, 0, 0, 0);
    const diffDays = Math.round((cursor.getTime() - normalized.getTime()) / 86400000);

    if (diffDays === 0 || (streak > 0 && diffDays === 1)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else if (streak === 0 && diffDays === 1) {
      streak = 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export async function fetchProgressData(userId: string): Promise<ProgressData> {
  const { getSupabase } = await import('@/lib/supabase');
  const supabase = getSupabase();
  if (!supabase) return emptyProgress;

  const now = new Date();
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);

  const [{ data: logs }, { data: activeProgram }] = await Promise.all([
    supabase
      .from('workout_logs')
      .select('id, workout_id, workout_name, duration, completed_at')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false }),
    supabase
      .from('user_programs')
      .select('program_id')
      .eq('user_id', userId)
      .eq('status', 'activa')
      .maybeSingle(),
  ]);

  const parsedLogs = (logs ?? []).map((log) => ({
    ...log,
    completedDate: new Date(log.completed_at),
  }));

  const weeklyCompleted = parsedLogs.filter((log) => log.completedDate >= weekStart).length;
  const monthlyCompleted = parsedLogs.filter((log) => log.completedDate >= monthStart).length;
  const weeklyTarget = activeProgram ? 3 : 0;
  const monthlyTarget = weeklyTarget > 0 ? weeklyTarget * 4 : 0;
  const totalSessions = parsedLogs.length;
  const adherence =
    weeklyTarget > 0 ? Math.min(100, Math.round((weeklyCompleted / weeklyTarget) * 100)) : 0;

  const history: WorkoutLog[] = parsedLogs.slice(0, RECENT_HISTORY_LIMIT).map((log) => ({
    id: log.id,
    workoutId: log.workout_id ?? '',
    workoutName: log.workout_name,
    completedAt: log.completedDate.toISOString().slice(0, 10),
    duration: log.duration ?? '—',
  }));

  const streak = calculateStreak(parsedLogs.map((log) => log.completedDate));

  let motivationalStatus = emptyProgress.motivationalStatus;
  if (weeklyCompleted > 0 && adherence >= 80) {
    motivationalStatus = 'Vas muy bien — mantén el ritmo esta semana';
  } else if (weeklyCompleted > 0) {
    motivationalStatus = 'Buen comienzo — intenta completar más sesiones esta semana';
  }

  return {
    weeklyCompleted,
    weeklyTarget,
    monthlyCompleted,
    monthlyTarget,
    streak,
    totalSessions,
    history,
    motivationalStatus,
  };
}
