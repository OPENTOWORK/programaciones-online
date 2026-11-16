import {
  DEFAULT_WORKOUT_TIMER_SETTINGS,
  formatWorkoutTimer,
  workoutTimerRouteParams,
  type WorkoutTimerSettings,
} from '@/lib/athleteWorkoutTimer';
import type { WorkoutContentBlock } from '@/lib/workoutContentParser';
import { isStructuredTimingPart, splitBlockTimingMetadata } from '@/lib/workoutDisplayFormat';
import { buildWorkoutSequence, sequenceWorkCount, type WorkoutSequence } from '@/lib/workoutSequence';

export interface WorkoutBlockTimerPlan {
  settings: WorkoutTimerSettings;
  /** Texto del botón dentro del bloque: «AMRAP 12 min», «Tabata 8 rondas»… */
  buttonLabel: string;
  /** Cabecera del crono a pantalla completa, con el nombre del bloque. */
  title: string;
  /** Series del bloque paso a paso: trabajo, «Continuar» y descanso. */
  sequence?: WorkoutSequence;
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

/**
 * Duración del bloque sacada solo de las partes de la cabecera que son un tiempo («14 min»):
 * en las notas, «cada 2'30"» o «descansa 90 s» no son lo que dura el bloque.
 */
function parseBlockDurationSeconds(timing: string | undefined): number | null {
  for (const part of (timing ?? '').split('·')) {
    if (!isStructuredTimingPart(part) || parseTimingRounds(part)) continue;
    const seconds = parseTimingSeconds(part);
    if (seconds) return seconds;
  }
  return null;
}

function formatDuration(seconds: number) {
  return seconds % 60 === 0 ? `${seconds / 60} min` : formatWorkoutTimer(seconds);
}

function formatInterval(seconds: number) {
  if (seconds % 60 === 0) return `${seconds / 60} min`;
  if (seconds < 60) return `${seconds} s`;
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function formatRounds(rounds: number) {
  return rounds === 1 ? '1 ronda' : `${rounds} rondas`;
}

function sequenceButtonLabel(sequence: WorkoutSequence, durationSeconds: number | null) {
  const count = sequence.rounds.length;
  const prefix = durationSeconds ? `Crono ${formatDuration(durationSeconds)}` : 'Crono';

  if (count === 1) {
    const exercises = sequenceWorkCount(sequence);
    return `${prefix} · ${exercises === 1 ? '1 ejercicio' : `${exercises} ejercicios`}`;
  }

  const rounds = sequence.circuit ? formatRounds(count) : `${count} series`;
  if (!durationSeconds && sequence.intervalSeconds) {
    return `${prefix} · ${rounds} cada ${formatInterval(sequence.intervalSeconds)}`;
  }
  return `${prefix} · ${rounds}`;
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
 * etiqueta. El resto del trabajo va serie a serie si hay series, tiempos o descansos que
 * guiar, y si no, con un crono simple de la duración declarada.
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
    const duration = parseBlockDurationSeconds(block.timing);
    const sequence = buildWorkoutSequence(block, { durationSeconds: duration, rounds });

    if (sequence) {
      return withTitle({
        settings: duration
          ? timerSettings({ mode: 'crono', direction: 'down', durationSeconds: duration })
          : timerSettings({ mode: 'crono', direction: 'up' }),
        buttonLabel: sequenceButtonLabel(sequence, duration),
        sequence,
      });
    }

    if (!duration) return null;

    return withTitle({
      settings: timerSettings({ mode: 'crono', direction: 'down', durationSeconds: duration }),
      buttonLabel: `Crono ${formatDuration(duration)}`,
    });
  }

  return null;
}

/** El bloque viaja entero hasta `/timer` para rehacer allí las series del crono guiado. */
export function workoutBlockTimerRouteParams(plan: WorkoutBlockTimerPlan, block: WorkoutContentBlock) {
  const params = workoutTimerRouteParams(plan.settings, plan.title);
  if (!plan.sequence) return params;

  return {
    ...params,
    block: JSON.stringify({ label: block.label, timing: block.timing, items: block.items }),
  };
}

export function workoutBlockTimerFromRouteParam(value: string | undefined): WorkoutBlockTimerPlan | null {
  if (!value) return null;

  try {
    const raw: unknown = JSON.parse(value);
    if (!raw || typeof raw !== 'object') return null;

    const { label, timing, items } = raw as Record<string, unknown>;
    if (typeof label !== 'string' || !Array.isArray(items)) return null;

    return resolveWorkoutBlockTimer({
      label,
      timing: typeof timing === 'string' ? timing : undefined,
      items: items.filter((item): item is string => typeof item === 'string'),
    });
  } catch {
    return null;
  }
}
