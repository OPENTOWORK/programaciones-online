export type WorkoutTimerMode = 'crono' | 'for_time' | 'amrap' | 'emom' | 'tabata';
export type WorkoutTimerDirection = 'up' | 'down';
export type WorkoutTimerStatus = 'idle' | 'running' | 'paused' | 'finished';
export type TabataPhase = 'work' | 'rest';

export interface WorkoutTimerSettings {
  mode: WorkoutTimerMode;
  direction: WorkoutTimerDirection;
  /** Duración total en segundos (cuenta atrás o EMOM). */
  durationSeconds: number;
  /** Segundos por intervalo EMOM (normalmente 60). */
  emomIntervalSeconds: number;
  tabataWorkSeconds: number;
  tabataRestSeconds: number;
  tabataRounds: number;
}

export interface WorkoutTimerDisplay {
  primarySeconds: number;
  statusLabel: string;
  detailLabel?: string;
  finished: boolean;
  tabataPhase?: TabataPhase;
  round?: number;
  totalRounds?: number;
}

export const DEFAULT_WORKOUT_TIMER_SETTINGS: WorkoutTimerSettings = {
  mode: 'for_time',
  direction: 'up',
  durationSeconds: 12 * 60,
  emomIntervalSeconds: 60,
  tabataWorkSeconds: 20,
  tabataRestSeconds: 10,
  tabataRounds: 8,
};

export const WORKOUT_TIMER_MODE_LABELS: Record<WorkoutTimerMode, string> = {
  crono: 'Crono',
  for_time: 'For time',
  amrap: 'AMRAP',
  emom: 'EMOM',
  tabata: 'Tabata',
};

export function formatWorkoutTimer(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function getTabataState(
  elapsedSeconds: number,
  workSeconds: number,
  restSeconds: number,
  rounds: number,
): { finished: boolean; round: number; phase: TabataPhase; phaseRemaining: number } {
  let cursor = elapsedSeconds;

  for (let round = 1; round <= rounds; round += 1) {
    if (cursor < workSeconds) {
      return {
        finished: false,
        round,
        phase: 'work',
        phaseRemaining: workSeconds - cursor,
      };
    }
    cursor -= workSeconds;

    if (round < rounds) {
      if (cursor < restSeconds) {
        return {
          finished: false,
          round,
          phase: 'rest',
          phaseRemaining: restSeconds - cursor,
        };
      }
      cursor -= restSeconds;
    }
  }

  return {
    finished: true,
    round: rounds,
    phase: 'work',
    phaseRemaining: 0,
  };
}

export function getWorkoutTimerDisplay(
  settings: WorkoutTimerSettings,
  elapsedMs: number,
): WorkoutTimerDisplay {
  const elapsedSeconds = elapsedMs / 1000;

  if (settings.mode === 'crono') {
    // El crono de un bloque con duración declarada corre a la contra, como el reloj del box.
    if (settings.direction === 'down') {
      const remaining = settings.durationSeconds - elapsedSeconds;
      return remaining <= 0
        ? { primarySeconds: 0, statusLabel: 'Tiempo completado', finished: true }
        : { primarySeconds: remaining, statusLabel: 'Cuenta atrás', finished: false };
    }

    return {
      primarySeconds: elapsedSeconds,
      statusLabel: 'Crono',
      finished: false,
    };
  }

  if (settings.mode === 'tabata') {
    const state = getTabataState(
      elapsedSeconds,
      settings.tabataWorkSeconds,
      settings.tabataRestSeconds,
      settings.tabataRounds,
    );

    if (state.finished) {
      return {
        primarySeconds: 0,
        statusLabel: 'Tabata completada',
        finished: true,
        tabataPhase: 'work',
        round: settings.tabataRounds,
        totalRounds: settings.tabataRounds,
      };
    }

    return {
      primarySeconds: state.phaseRemaining,
      statusLabel: state.phase === 'work' ? 'Trabajo' : 'Descanso',
      detailLabel: `Ronda ${state.round} / ${settings.tabataRounds}`,
      finished: false,
      tabataPhase: state.phase,
      round: state.round,
      totalRounds: settings.tabataRounds,
    };
  }

  if (settings.mode === 'emom') {
    const interval = Math.max(1, settings.emomIntervalSeconds);
    const totalRounds = Math.max(1, Math.ceil(settings.durationSeconds / interval));
    const round = Math.min(totalRounds, Math.floor(elapsedSeconds / interval) + 1);
    const withinRound = elapsedSeconds % interval;

    if (settings.direction === 'up') {
      const finished = elapsedSeconds >= settings.durationSeconds;
      return {
        primarySeconds: finished ? settings.durationSeconds : withinRound,
        statusLabel: finished ? 'EMOM completado' : `Minuto ${round}`,
        detailLabel: finished ? undefined : `Total ${formatWorkoutTimer(elapsedSeconds)}`,
        finished,
        round,
        totalRounds,
      };
    }

    const remainingTotal = settings.durationSeconds - elapsedSeconds;
    if (remainingTotal <= 0) {
      return {
        primarySeconds: 0,
        statusLabel: 'EMOM completado',
        finished: true,
        round: totalRounds,
        totalRounds,
      };
    }

    const intervalRemaining = interval - withinRound;
    return {
      primarySeconds: intervalRemaining,
      statusLabel: `Minuto ${round}`,
      detailLabel: `Quedan ${formatWorkoutTimer(remainingTotal)}`,
      finished: false,
      round,
      totalRounds,
    };
  }

  if (settings.direction === 'up') {
    return {
      primarySeconds: elapsedSeconds,
      statusLabel: settings.mode === 'amrap' ? 'AMRAP · cuenta arriba' : 'For time · cuenta arriba',
      finished: false,
    };
  }

  const remaining = settings.durationSeconds - elapsedSeconds;
  if (remaining <= 0) {
    return {
      primarySeconds: 0,
      statusLabel: settings.mode === 'amrap' ? 'AMRAP completado' : 'For time completado',
      finished: true,
    };
  }

  return {
    primarySeconds: remaining,
    statusLabel: settings.mode === 'amrap' ? 'AMRAP · cuenta atrás' : 'For time · cuenta atrás',
    finished: false,
  };
}

export function parseDurationMinutes(value: string, fallbackMinutes: number): number {
  const parsed = Number(value.replace(',', '.').trim());
  if (!Number.isFinite(parsed) || parsed <= 0) return fallbackMinutes * 60;
  return Math.round(parsed * 60);
}

export function parsePositiveInt(value: string, fallback: number): number {
  const parsed = Number(value.replace(/[^\d]/g, ''));
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.round(parsed);
}

export function isWorkoutTimerMode(value: unknown): value is WorkoutTimerMode {
  return (
    value === 'crono' ||
    value === 'for_time' ||
    value === 'amrap' ||
    value === 'emom' ||
    value === 'tabata'
  );
}

/** Parámetros de ruta para abrir el crono ya configurado desde una sesión. */
export function workoutTimerRouteParams(settings: WorkoutTimerSettings, title?: string) {
  return {
    mode: settings.mode,
    direction: settings.direction,
    duration: String(settings.durationSeconds),
    work: String(settings.tabataWorkSeconds),
    rest: String(settings.tabataRestSeconds),
    rounds: String(settings.tabataRounds),
    ...(title ? { title } : null),
  };
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function workoutTimerSettingsFromParams(params: {
  mode?: string | string[];
  direction?: string | string[];
  duration?: string | string[];
  work?: string | string[];
  rest?: string | string[];
  rounds?: string | string[];
}): WorkoutTimerSettings | null {
  const mode = firstParam(params.mode);
  if (!isWorkoutTimerMode(mode)) return null;

  const direction = firstParam(params.direction) === 'up' ? 'up' : 'down';
  const duration = Number(firstParam(params.duration));
  const work = Number(firstParam(params.work));
  const rest = Number(firstParam(params.rest));
  const rounds = Number(firstParam(params.rounds));

  return {
    mode,
    direction,
    durationSeconds:
      Number.isFinite(duration) && duration > 0
        ? Math.round(duration)
        : DEFAULT_WORKOUT_TIMER_SETTINGS.durationSeconds,
    emomIntervalSeconds: DEFAULT_WORKOUT_TIMER_SETTINGS.emomIntervalSeconds,
    tabataWorkSeconds:
      Number.isFinite(work) && work > 0
        ? Math.round(work)
        : DEFAULT_WORKOUT_TIMER_SETTINGS.tabataWorkSeconds,
    tabataRestSeconds:
      Number.isFinite(rest) && rest > 0
        ? Math.round(rest)
        : DEFAULT_WORKOUT_TIMER_SETTINGS.tabataRestSeconds,
    tabataRounds:
      Number.isFinite(rounds) && rounds > 0
        ? Math.round(rounds)
        : DEFAULT_WORKOUT_TIMER_SETTINGS.tabataRounds,
  };
}
