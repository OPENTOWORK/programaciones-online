import type { ProgressData, WorkoutLog } from '@/lib/types';
import { collectScheduledRestDayKeysForUser } from '@/lib/athleteSchedule';
import { toLocalDateString } from '@/lib/sessionSchedule';

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

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addLocalDays(date: Date, delta: number) {
  const next = startOfLocalDay(date);
  next.setDate(next.getDate() + delta);
  return next;
}

/** Racha de días con entreno; los descansos programados no rompen la racha ni la incrementan. */
function calculateStreak(logDates: Date[], restDayKeys: ReadonlySet<string>) {
  if (logDates.length === 0) return 0;

  const workoutKeys = new Set(logDates.map((date) => toLocalDateString(startOfLocalDay(date))));

  const today = startOfLocalDay(new Date());
  const oldestLog = logDates.reduce(
    (earliest, date) => (startOfLocalDay(date) < earliest ? startOfLocalDay(date) : earliest),
    startOfLocalDay(logDates[0]),
  );
  const maxLookback =
    Math.ceil((today.getTime() - oldestLog.getTime()) / 86400000) + 2;

  let streak = 0;
  let day = today;

  for (let index = 0; index <= maxLookback; index += 1) {
    const key = toLocalDateString(day);

    if (workoutKeys.has(key)) {
      streak += 1;
    } else if (restDayKeys.has(key)) {
      // Día de descanso planificado: no suma, pero tampoco corta la racha.
    } else if (streak > 0) {
      break;
    } else if (index === 0) {
      // Hoy aún no hay registro: seguimos mirando ayer.
    } else {
      break;
    }

    day = addLocalDays(day, -1);
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

  const streakRestRangeStart =
    parsedLogs.length > 0
      ? parsedLogs.reduce(
          (earliest, log) =>
            log.completedDate < earliest ? log.completedDate : earliest,
          parsedLogs[0].completedDate,
        )
      : now;
  const restDayKeys = await collectScheduledRestDayKeysForUser(userId, streakRestRangeStart, now);
  const streak = calculateStreak(
    parsedLogs.map((log) => log.completedDate),
    restDayKeys,
  );

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
