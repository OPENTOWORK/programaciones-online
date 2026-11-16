import type { WorkoutContentBlock } from '@/lib/workoutContentParser';
import { parseBlockItemForDisplay } from '@/lib/workoutDisplayFormat';
import { stripWorkoutItemVideoMarker } from '@/lib/workoutItemVideo';

/** Un paso del crono guiado: una serie de un ejercicio o un descanso escrito en la lista. */
export interface WorkoutSequenceStep {
  kind: 'work' | 'rest';
  name: string;
  /** Con segundos el paso va a la contra y avanza solo; sin ellos espera a «Continuar». */
  seconds?: number;
  /** Lo que hay que completar cuando no va por tiempo: «2 reps», «8 intentos», «400 m». */
  target?: string;
  load?: string;
  /** Matiz del entrenador para la serie: «RPE 6», «banda si hace falta». */
  note?: string;
  set: number;
  sets: number;
}

export interface WorkoutSequence {
  /** Cada ronda lleva una serie de cada ejercicio que aún tenga series pendientes. */
  rounds: WorkoutSequenceStep[][];
  /** Las rondas salen cada tantos segundos: se descansa lo que sobre del intervalo. */
  intervalSeconds?: number;
  /** Descanso fijo entre rondas. */
  restSeconds?: number;
  /** Las rondas vienen del bloque («4 rondas», estaciones) y no de las series de cada ejercicio. */
  circuit: boolean;
}

export type WorkoutSequenceCursor =
  | { kind: 'step'; round: number; step: number }
  | { kind: 'rest'; round: number }
  | { kind: 'done' };

/** Tiempos en milisegundos del reloj activo, que no avanza mientras el crono está en pausa. */
export interface WorkoutSequenceState {
  cursor: WorkoutSequenceCursor;
  startedAt: number;
  roundStartedAt: number;
  phaseStartedAt: number;
  /** Duración del paso actual cuando va a la contra. */
  phaseSeconds?: number;
  finishedAt?: number;
}

export interface WorkoutSequenceView {
  phase: 'work' | 'rest' | 'done';
  title: string;
  progress?: string;
  target?: string;
  load?: string;
  note?: string;
  remainingSeconds?: number;
  elapsedSeconds: number;
  totalSeconds: number;
  next?: string;
}

/** Aunque la serie se alargue, entre rondas siempre queda un respiro antes de volver a entrar. */
const MIN_INTERVAL_REST_SECONDS = 15;

const TIME_TOKEN =
  `\\d+(?:[.,]\\d+)?(?:\\s*[-–]\\s*\\d+(?:[.,]\\d+)?)?\\s*` +
  `(?:'\\s*(?:\\d+\\s*"?)?|:\\d{2}|"|(?:minutos?|mins?|min|segundos?|segs?|seg|s)\\b` +
  `(?:\\s*\\d+\\s*(?:"|segundos?|segs?|seg|s)\\b)?)`;

const INTERVAL_PATTERN = new RegExp(`\\bcada\\s+(${TIME_TOKEN})`);
const REST_NOTE_PATTERNS = [
  new RegExp(`\\b(?:descanso|descansa|descansar|descansando|rest|recuperacion)\\s*(?:de\\s+|:\\s*)?(${TIME_TOKEN})`),
  new RegExp(`(${TIME_TOKEN})\\s+de\\s+(?:descanso|recuperacion)\\b`),
  new RegExp(
    `(${TIME_TOKEN})\\s+(?:al\\s+(?:cerrar|terminar|acabar|completar)\\s+(?:la\\s+|cada\\s+)?` +
      `(?:ronda|vuelta|serie|biserie|superserie|triserie|circuito)|entre\\s+(?:rondas|series|vueltas))`,
  ),
];
const REST_ITEM_PATTERN = /^(?:descanso|descansa|rest|recuperacion|pausa)\b/;
const PER_SIDE_PATTERN = /\s*(?:(?:por|cada)\s+lado|\/\s*lado)\b/i;
const LOAD_PATTERN =
  /^(?:\d+(?:[.,]\d+)?(?:\s*\/\s*\d+(?:[.,]\d+)?)?\s*(?:kg|lbs?)|\d+(?:[.,]\d+)?\s*%(?:\s*rm)?)$/i;

function normalizeTimeText(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2018\u2019\u2032\u00b4`]/g, "'")
    .replace(/[\u201c\u201d\u2033]|''/g, '"');
}

/** «2-3 min» se lee como el tope del rango: mejor que sobre tiempo a que falte. */
function upperBound(text: string) {
  return text.replace(/(\d+(?:[.,]\d+)?)\s*[-–]\s*(\d+(?:[.,]\d+)?)/, '$2');
}

/** Segundos de «30 s», «45"», «1 min», «2'30"», «1:30» o «1,5 min». Sin unidad no es un tiempo. */
function parseClockSeconds(text: string | undefined): number | null {
  const value = normalizeTimeText(text ?? '')
    .replace(/[.,;\s]+$/, '')
    .trim();
  if (!value) return null;

  const clock = value.match(/^(\d+):(\d{2})$/);
  if (clock) return Number(clock[1]) * 60 + Number(clock[2]);

  const minutes = value.match(
    /^(\d+(?:[.,]\d+)?)\s*(?:'|minutos?|mins?|min)\s*(?:(\d+)\s*(?:"|segundos?|segs?|seg|s)?)?$/,
  );
  if (minutes) {
    return Math.round(Number(minutes[1].replace(',', '.')) * 60) + Number(minutes[2] ?? 0);
  }

  const seconds = value.match(/^(\d+)\s*(?:"|segundos?|segs?|seg|s)$/);
  return seconds ? Number(seconds[1]) : null;
}

/** «Cada 2'30"», «entra cada 2-3 min»: cada cuánto arranca una ronda. */
function parseIntervalSeconds(text: string | undefined): number | null {
  const normalized = normalizeTimeText(text ?? '');
  if (/\bcada\s+minuto\b/.test(normalized)) return 60;

  const match = normalized.match(INTERVAL_PATTERN);
  const seconds = match ? parseClockSeconds(upperBound(match[1])) : null;
  return seconds && seconds >= 10 ? seconds : null;
}

/**
 * «Descansa 90 s», «90 s de descanso», «2 min al cerrar la ronda»: solo cuenta si el
 * entrenador ha puesto la cifra.
 */
function parseRestNoteSeconds(text: string | undefined): number | null {
  const normalized = normalizeTimeText(text ?? '');
  for (const pattern of REST_NOTE_PATTERNS) {
    const match = normalized.match(pattern);
    const seconds = match ? parseClockSeconds(upperBound(match[1])) : null;
    if (seconds && seconds >= 5 && seconds <= 15 * 60) return seconds;
  }
  return null;
}

/** Lo que pide una serie concreta: el tiempo a la contra o lo que hay que completar. */
interface SetSpec {
  seconds?: number;
  target?: string;
  load?: string;
  note?: string;
}

interface SequenceItem {
  name: string;
  /** Una entrada por serie: en las escaleras de carga cada serie lleva su propio peso. */
  specs: SetSpec[];
  explicitSets: boolean;
  perSide: boolean;
  rest: boolean;
}

/**
 * «Russian KB swing: 4 × 12 · 24/16 kg»: la primera parte son las series y lo que se hace en
 * cada una; detrás del «·» van la carga, el tiempo o una nota del entrenador.
 */
function parseSequenceItem(line: string): SequenceItem | null {
  const name = parseBlockItemForDisplay(line).name.trim();
  if (!name) return null;

  const working = stripWorkoutItemVideoMarker(line.trim());
  const colonIndex = working.indexOf(':');
  const prescription = colonIndex > 0 ? working.slice(colonIndex + 1) : '';
  const [main = '', ...extras] = prescription
    .split(/[·@]/)
    .map((part) => part.trim())
    .filter(Boolean);

  let quantity = main;
  let sets = 1;
  let explicitSets = false;

  const setsMatch =
    quantity.match(/^(\d+)\s*[x×]\s*(.+)$/i) ?? quantity.match(/^(\d+)\s*series?\b\s*(?:de\s+)?(.*)$/i);
  if (setsMatch) {
    sets = Math.max(1, Number(setsMatch[1]));
    quantity = setsMatch[2].trim();
    explicitSets = true;
  }

  const perSide = PER_SIDE_PATTERN.test(quantity);
  let seconds = parseClockSeconds(quantity.replace(PER_SIDE_PATTERN, ''));
  let load: string | undefined;
  const notes: string[] = [];

  for (const extra of extras) {
    const extraSeconds = seconds ? null : parseClockSeconds(extra);
    if (extraSeconds) seconds = extraSeconds;
    else if (!load && LOAD_PATTERN.test(extra)) load = extra;
    else notes.push(extra);
  }

  let target: string | undefined;
  if (!seconds && quantity) {
    target = /^\d+(?:\s*[-–]\s*\d+)?$/.test(quantity) ? `${quantity} reps` : quantity;
  }

  const spec: SetSpec = {
    seconds: seconds && seconds > 0 ? seconds : undefined,
    target,
    load,
    note: notes.length > 0 ? notes.join(' · ') : undefined,
  };

  return {
    name,
    specs: Array.from({ length: sets }, () => spec),
    explicitSets,
    perSide,
    rest: REST_ITEM_PATTERN.test(normalizeTimeText(name)),
  };
}

/** «Power clean: 1 × 5 · 55%» seguido de «Power clean: 1 × 5 · 60%» son series de un mismo ejercicio. */
function mergeRepeatedExercises(items: SequenceItem[]) {
  const merged: SequenceItem[] = [];
  for (const item of items) {
    const previous = merged[merged.length - 1];
    if (previous && !item.rest && !previous.rest && normalizeTimeText(previous.name) === normalizeTimeText(item.name)) {
      merged[merged.length - 1] = {
        ...previous,
        specs: [...previous.specs, ...item.specs],
        explicitSets: true,
        perSide: previous.perSide || item.perSide,
      };
    } else {
      merged.push(item);
    }
  }
  return merged;
}

function lapSeconds(items: SequenceItem[]) {
  return items.reduce((total, item) => total + (item.specs[0].seconds ?? 0) * (item.perSide ? 2 : 1), 0);
}

function includesRound(item: SequenceItem, round: number, circuit: boolean) {
  if (circuit) return true;
  if (item.explicitSets) return round <= item.specs.length;
  // Los descansos sin series se repiten en cada vuelta; un ejercicio suelto solo en la primera.
  return item.rest || round === 1;
}

function roundSteps(
  items: SequenceItem[],
  round: number,
  { totalRounds, circuit, restBetween }: { totalRounds: number; circuit: boolean; restBetween?: number },
) {
  const steps: WorkoutSequenceStep[] = [];

  for (const item of items) {
    if (!includesRound(item, round, circuit)) continue;

    const spec = item.specs[Math.min(round, item.specs.length) - 1];
    const set = round;
    const sets = circuit ? totalRounds : item.specs.length;

    if (item.rest) {
      if (spec.seconds) steps.push({ kind: 'rest', name: 'Descanso', seconds: spec.seconds, set, sets });
      continue;
    }

    if (restBetween && steps.some((step) => step.kind === 'work')) {
      steps.push({ kind: 'rest', name: 'Descanso', seconds: restBetween, set, sets });
    }

    const step: WorkoutSequenceStep = { kind: 'work', name: item.name, ...spec, set, sets };
    if (spec.seconds && item.perSide) {
      steps.push({ ...step, name: `${item.name} · lado 1` }, { ...step, name: `${item.name} · lado 2` });
    } else {
      steps.push(step);
    }
  }

  return steps;
}

/**
 * Series del bloque en orden, alternando ejercicios como se hacen en el box. El descanso entre
 * rondas sale del intervalo («cada 2'30"»), de un descanso escrito en las notas o, si solo hay
 * duración, de repartir el bloque entre las series. Null si no hay nada que guiar.
 */
export function buildWorkoutSequence(
  block: WorkoutContentBlock,
  { durationSeconds, rounds: blockRounds }: { durationSeconds: number | null; rounds: number | null },
): WorkoutSequence | null {
  const items = mergeRepeatedExercises(
    block.items.map(parseSequenceItem).filter((item): item is SequenceItem => item !== null),
  );
  const work = items.filter((item) => !item.rest);
  if (work.length === 0) return null;

  const intervalNote = parseIntervalSeconds(block.timing);
  const restNote = intervalNote ? null : parseRestNoteSeconds(block.timing);
  // «Alterna ejercicios con 90 s de descanso»: se descansa también entre un ejercicio y otro.
  const restBetween =
    restNote && /\balterna/.test(normalizeTimeText(block.timing ?? '')) ? restNote : undefined;
  const hasRestItems = items.some((item) => item.rest && item.specs[0].seconds);
  const timedCount = work.filter((item) => item.specs.some((spec) => spec.seconds)).length;

  let totalRounds = Math.max(...work.map((item) => item.specs.length));
  let circuit = false;

  if (totalRounds === 1 && blockRounds && blockRounds > 1) {
    totalRounds = blockRounds;
    circuit = true;
  } else if (totalRounds === 1 && timedCount === work.length && durationSeconds && !intervalNote) {
    // Estaciones por tiempo sin series: la vuelta se repite hasta llenar el bloque.
    const laps = Math.floor(durationSeconds / lapSeconds(items));
    if (laps > 1) {
      totalRounds = laps;
      circuit = true;
    }
  }

  // Con una sola vuelta no hay descanso entre rondas que contar: solo se guía si hay tiempos.
  if (totalRounds === 1 && timedCount === 0 && !hasRestItems && !restBetween) return null;

  let intervalSeconds = totalRounds > 1 ? intervalNote ?? undefined : undefined;
  const restSeconds = totalRounds > 1 ? restNote ?? undefined : undefined;
  if (totalRounds > 1 && !intervalSeconds && !restSeconds && !hasRestItems && !circuit) {
    if (!durationSeconds) return null;
    intervalSeconds = Math.round(durationSeconds / totalRounds);
  }

  const rounds: WorkoutSequenceStep[][] = [];
  for (let round = 1; round <= totalRounds; round += 1) {
    const steps = roundSteps(items, round, { totalRounds, circuit, restBetween });
    if (round === totalRounds) {
      while (steps.length > 0 && steps[steps.length - 1].kind === 'rest') steps.pop();
    }
    if (steps.some((step) => step.kind === 'work')) rounds.push(steps);
  }
  if (rounds.length === 0) return null;

  return { rounds, intervalSeconds, restSeconds, circuit };
}

export function sequenceWorkCount(sequence: WorkoutSequence) {
  return new Set(sequence.rounds.flat().filter((step) => step.kind === 'work').map((step) => step.name)).size;
}

function enterStep(
  sequence: WorkoutSequence,
  state: Omit<WorkoutSequenceState, 'cursor' | 'phaseStartedAt' | 'phaseSeconds'>,
  round: number,
  step: number,
  at: number,
): WorkoutSequenceState {
  return {
    ...state,
    cursor: { kind: 'step', round, step },
    phaseStartedAt: at,
    phaseSeconds: sequence.rounds[round]?.[step]?.seconds,
  };
}

export function startWorkoutSequence(sequence: WorkoutSequence, now: number): WorkoutSequenceState {
  return enterStep(sequence, { startedAt: now, roundStartedAt: now }, 0, 0, now);
}

function roundRestSeconds(sequence: WorkoutSequence, roundStartedAt: number, at: number) {
  if (sequence.intervalSeconds) {
    const used = (at - roundStartedAt) / 1000;
    return Math.max(MIN_INTERVAL_REST_SECONDS, Math.round(sequence.intervalSeconds - used));
  }
  return sequence.restSeconds;
}

/** Pasa al siguiente paso: lo llama «Continuar», «Siguiente» o el fin de un paso a la contra. */
export function advanceWorkoutSequence(
  sequence: WorkoutSequence,
  state: WorkoutSequenceState,
  at: number,
): WorkoutSequenceState {
  const { cursor } = state;
  if (cursor.kind === 'done') return state;

  if (cursor.kind === 'rest') {
    return enterStep(sequence, { ...state, roundStartedAt: at }, cursor.round + 1, 0, at);
  }

  if (cursor.step + 1 < sequence.rounds[cursor.round].length) {
    return enterStep(sequence, state, cursor.round, cursor.step + 1, at);
  }

  if (cursor.round + 1 >= sequence.rounds.length) {
    return { ...state, cursor: { kind: 'done' }, phaseStartedAt: at, phaseSeconds: undefined, finishedAt: at };
  }

  const rest = roundRestSeconds(sequence, state.roundStartedAt, at);
  if (!rest) return enterStep(sequence, { ...state, roundStartedAt: at }, cursor.round + 1, 0, at);

  return { ...state, cursor: { kind: 'rest', round: cursor.round }, phaseStartedAt: at, phaseSeconds: rest };
}

/** Cierra los pasos a la contra ya vencidos, también si la app ha estado en segundo plano. */
export function settleWorkoutSequence(
  sequence: WorkoutSequence,
  state: WorkoutSequenceState,
  now: number,
): WorkoutSequenceState {
  let current = state;
  while (current.cursor.kind !== 'done' && current.phaseSeconds != null) {
    const endsAt = current.phaseStartedAt + current.phaseSeconds * 1000;
    if (now < endsAt) break;
    current = advanceWorkoutSequence(sequence, current, endsAt);
  }
  return current;
}

function formatShortSeconds(seconds: number) {
  if (seconds < 60) return `${seconds} s`;
  if (seconds % 60 === 0) return `${seconds / 60} min`;
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function stepProgress(sequence: WorkoutSequence, round: number, step: WorkoutSequenceStep) {
  if (sequence.circuit) return `Ronda ${round + 1} de ${sequence.rounds.length}`;
  if (step.sets > 1) return `Serie ${step.set} de ${step.sets}`;
  return undefined;
}

function stepSummary(sequence: WorkoutSequence, round: number, step: WorkoutSequenceStep) {
  if (step.kind === 'rest') return step.seconds ? `Descanso ${formatShortSeconds(step.seconds)}` : 'Descanso';
  const amount = step.seconds ? formatShortSeconds(step.seconds) : step.target;
  const progress = stepProgress(sequence, round, step);
  return [step.name, amount, progress?.toLowerCase()].filter(Boolean).join(' · ');
}

function upcomingSummary(sequence: WorkoutSequence, cursor: WorkoutSequenceCursor) {
  if (cursor.kind === 'done') return undefined;

  if (cursor.kind === 'step') {
    const following = sequence.rounds[cursor.round][cursor.step + 1];
    if (following) return stepSummary(sequence, cursor.round, following);
    if (cursor.round + 1 >= sequence.rounds.length) return undefined;
    if (sequence.intervalSeconds || sequence.restSeconds) return 'Descanso';
  }

  const nextRound = cursor.round + 1;
  const first = sequence.rounds[nextRound]?.[0];
  return first ? stepSummary(sequence, nextRound, first) : undefined;
}

export function describeWorkoutSequence(
  sequence: WorkoutSequence,
  state: WorkoutSequenceState,
  now: number,
): WorkoutSequenceView {
  const end = state.finishedAt ?? now;
  const elapsedSeconds = Math.max(0, (end - state.phaseStartedAt) / 1000);
  const totalSeconds = Math.max(0, (end - state.startedAt) / 1000);
  const remainingSeconds =
    state.phaseSeconds != null ? Math.max(0, state.phaseSeconds - elapsedSeconds) : undefined;
  const next = upcomingSummary(sequence, state.cursor);
  const { cursor } = state;

  if (cursor.kind === 'done') {
    return { phase: 'done', title: 'Bloque completado', elapsedSeconds, totalSeconds };
  }

  if (cursor.kind === 'rest') {
    const progress = sequence.circuit
      ? `Ronda ${cursor.round + 1} de ${sequence.rounds.length} hecha`
      : `Serie ${cursor.round + 1} de ${sequence.rounds.length} hecha`;
    return { phase: 'rest', title: 'Descanso', progress, remainingSeconds, elapsedSeconds, totalSeconds, next };
  }

  const step = sequence.rounds[cursor.round][cursor.step];
  return {
    phase: step.kind,
    title: step.kind === 'rest' ? 'Descanso' : step.name,
    progress: stepProgress(sequence, cursor.round, step),
    target: step.target,
    load: step.load,
    note: step.note,
    remainingSeconds,
    elapsedSeconds,
    totalSeconds,
    next,
  };
}
