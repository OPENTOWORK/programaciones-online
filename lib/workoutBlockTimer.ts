import {
  DEFAULT_WORKOUT_TIMER_SETTINGS,
  formatWorkoutTimer,
  type WorkoutTimerSettings,
} from '@/lib/athleteWorkoutTimer';
import type { WorkoutContentBlock } from '@/lib/workoutContentParser';
import { splitBlockTimingMetadata } from '@/lib/workoutDisplayFormat';

export interface WorkoutBlockTimerPlan {
  settings: WorkoutTimerSettings;
  /** Texto del botón dentro del bloque: «AMRAP 12 min», «Tabata 8 rondas»… */
  buttonLabel: string;
  /** Cabecera del crono a pantalla completa, con el nombre del bloque. */
  title: string;
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Duración declarada en la cabecera del bloque. Acepta «12 min», «Cap 15'», «45 s» y
 * también el número suelto que escribe el editor cuando la unidad es implícita.
 */
function parseTimingSeconds(timing: string | undefined): number | null {
  const text = normalize(timing ?? '');
  if (!text) return null;

  const minutes = text.match(/(\d+(?:[.,]\d+)?)\s*(?:minutos?|mins?|min|'|\u2032)(?![a-z])/);
  if (minutes) return Math.round(Number(minutes[1].replace(',', '.')) * 60);

  const seconds = text.match(/(\d+)\s*(?:segundos?|segs?|s|"|\u2033)(?![a-z])/);
  if (seconds) return Number(seconds[1]);

  const bare = text.match(/(?:^|·|\bcap)\s*(\d+(?:[.,]\d+)?)\s*(?=$|·)/);
  if (bare) return Math.round(Number(bare[1].replace(',', '.')) * 60);

  return null;
}

function parseTimingRounds(timing: string | undefined): number | null {
  const match = normalize(timing ?? '').match(/(\d+)\s*rondas?/);
  return match ? Number(match[1]) : null;
}

function formatDuration(seconds: number) {
  return seconds % 60 === 0 ? `${seconds / 60} min` : formatWorkoutTimer(seconds);
}

function formatRounds(rounds: number) {
  return rounds === 1 ? '1 ronda' : `${rounds} rondas`;
}

function timerSettings(overrides: Partial<WorkoutTimerSettings>): WorkoutTimerSettings {
  return { ...DEFAULT_WORKOUT_TIMER_SETTINGS, ...overrides };
}

/** Bloques que se cronometran aunque el entrenador no haya puesto un formato competitivo. */
const CRONO_LABELS = [
  'unbroken',
  'estaciones',
  'movilidad',
  'activacion',
  'fuerza',
  'tecnica',
  'entrenamiento libre',
];

/**
 * Elige el crono que le toca al bloque: AMRAP, For time, EMOM y Tabata se deducen de la
 * etiqueta, y el resto del trabajo con duración declarada se resuelve con un crono simple.
 * Devuelve null para notas y texto libre, donde un crono solo estorbaría.
 */
export function resolveWorkoutBlockTimer(block: WorkoutContentBlock): WorkoutBlockTimerPlan | null {
  if (block.text !== undefined) return null;

  const label = normalize(block.label);
  if (!label) return null;

  const { blockTitle, pillTiming } = splitBlockTimingMetadata(block.timing);
  const seconds = parseTimingSeconds(pillTiming) ?? parseTimingSeconds(block.timing);
  const rounds = parseTimingRounds(pillTiming) ?? parseTimingRounds(block.timing);

  const withTitle = (plan: Omit<WorkoutBlockTimerPlan, 'title'>): WorkoutBlockTimerPlan => ({
    ...plan,
    title: [block.label.trim(), blockTitle].filter(Boolean).join(' · '),
  });

  if (label.includes('tabata')) {
    const totalRounds = rounds ?? DEFAULT_WORKOUT_TIMER_SETTINGS.tabataRounds;
    return withTitle({
      settings: timerSettings({ mode: 'tabata', direction: 'down', tabataRounds: totalRounds }),
      buttonLabel: `Tabata ${formatRounds(totalRounds)}`,
    });
  }

  if (label.includes('amrap')) {
    const duration = seconds ?? DEFAULT_WORKOUT_TIMER_SETTINGS.durationSeconds;
    return withTitle({
      settings: timerSettings({ mode: 'amrap', direction: 'down', durationSeconds: duration }),
      buttonLabel: `AMRAP ${formatDuration(duration)}`,
    });
  }

  if (label.includes('emom')) {
    const duration = seconds ?? 20 * 60;
    return withTitle({
      settings: timerSettings({ mode: 'emom', direction: 'down', durationSeconds: duration }),
      buttonLabel: `EMOM ${formatDuration(duration)}`,
    });
  }

  if (label.includes('for time') || label.includes('ladder') || label.includes('chipper')) {
    // Con cap el crono va a la contra; sin cap se mide lo que tarda el atleta.
    if (seconds) {
      return withTitle({
        settings: timerSettings({ mode: 'for_time', direction: 'down', durationSeconds: seconds }),
        buttonLabel: `For time · cap ${formatDuration(seconds)}`,
      });
    }

    return withTitle({
      settings: timerSettings({ mode: 'for_time', direction: 'up' }),
      buttonLabel: 'For time',
    });
  }

  if (CRONO_LABELS.some((known) => label.includes(known))) {
    if (!seconds) return null;

    return withTitle({
      settings: timerSettings({ mode: 'crono', direction: 'down', durationSeconds: seconds }),
      buttonLabel: `Crono ${formatDuration(seconds)}`,
    });
  }

  return null;
}
