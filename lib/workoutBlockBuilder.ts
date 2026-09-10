import { freeTextBlockBody } from '@/lib/freeTextBlockVideos';
import {
  formatWorkoutItemVideoSuffix,
  parseWorkoutItemVideoId,
  stripWorkoutItemVideoMarker,
} from '@/lib/workoutItemVideo';
import {
  hasBulletList,
  isKnownBlockLabel,
  isStructuredWorkoutContent,
  parseWorkoutContent,
  type WorkoutContentBlock,
} from '@/lib/workoutContentParser';
import { isStructuredTimingPart, dedupeTimingTokens } from '@/lib/workoutDisplayFormat';

export type WorkoutBlockType =
  | 'activation'
  | 'strength'
  | 'free_training'
  | 'for_time'
  | 'rounds_for_time'
  | 'emom'
  | 'time_stations'
  | 'technique'
  | 'mobility'
  | 'reps_ladder'
  | 'amrap'
  | 'tabata'
  | 'unbroken'
  | 'free_text';

export interface WorkoutBlockItemDraft {
  id: string;
  text: string;
  aimharderEjerId?: number;
  sets?: string;
  reps?: string;
  weightKg?: string;
  calories?: string;
  distance?: string;
  /** Trabajo por tiempo: minutos y segundos van aparte para no tener que escribir la unidad. */
  minutes?: string;
  seconds?: string;
  /** Repeticiones en reserva. */
  rir?: string;
  /** Porcentaje del máximo del atleta. */
  percent?: string;
  /** Repeticiones máximas: un 3 aquí es un 3RM. */
  rm?: string;
  loadMetric?: MovementLoadMetric;
  youtubeVideoId?: string;
}

export type MovementLoadMetric =
  | 'none'
  | 'kg'
  | 'cal'
  | 'distance'
  | 'min'
  | 'sec'
  | 'rir'
  | 'percent'
  | 'rm';

export const MOVEMENT_LOAD_METRICS: MovementLoadMetric[] = [
  'none',
  'kg',
  'cal',
  'distance',
  'min',
  'sec',
  'rir',
  'percent',
  'rm',
];

export const MOVEMENT_PRIMARY_LOAD_METRICS: MovementLoadMetric[] = [
  'none',
  'kg',
  'cal',
  'distance',
  'min',
  'sec',
  'rir',
  'percent',
];

export function isPercentRmLoadMetric(metric: MovementLoadMetric) {
  return metric === 'percent' || metric === 'rm';
}

export function getMovementLoadMetricLabel(metric: MovementLoadMetric) {
  if (metric === 'kg') return 'Kg';
  if (metric === 'cal') return 'Cal';
  if (metric === 'distance') return 'Distancia';
  if (metric === 'min') return 'Min';
  if (metric === 'sec') return 'Seg';
  if (metric === 'rir') return 'RIR';
  if (metric === 'percent' || metric === 'rm') return '%RM';
  return 'Sin carga';
}

export function getMovementLoadMetric(item: WorkoutBlockItemDraft): MovementLoadMetric {
  if (item.loadMetric && item.loadMetric !== 'none') {
    return item.loadMetric === 'rm' ? 'percent' : item.loadMetric;
  }
  if (item.weightKg?.trim()) return 'kg';
  if (item.calories?.trim()) return 'cal';
  if (item.distance?.trim()) return 'distance';
  if (item.minutes?.trim()) return 'min';
  if (item.seconds?.trim()) return 'sec';
  if (item.rir?.trim()) return 'rir';
  if (item.percent?.trim() || item.rm?.trim()) return 'percent';
  return 'none';
}

export function getMovementLoadValue(item: WorkoutBlockItemDraft): string {
  const metric = getMovementLoadMetric(item);
  if (metric === 'kg') return item.weightKg ?? '';
  if (metric === 'cal') return item.calories ?? '';
  if (metric === 'distance') return item.distance ?? '';
  if (metric === 'min') return item.minutes ?? '';
  if (metric === 'sec') return item.seconds ?? '';
  if (metric === 'rir') return item.rir ?? '';
  if (metric === 'percent') return item.percent?.trim() || item.rm?.trim() || '';
  return '';
}

export function movementLoadPlaceholder(metric: MovementLoadMetric) {
  if (metric === 'kg') return '60';
  if (metric === 'cal') return '15';
  if (metric === 'distance') return '400 m';
  if (metric === 'min') return '1';
  if (metric === 'sec') return '30';
  if (metric === 'rir') return '2';
  if (metric === 'percent' || metric === 'rm') return '80';
  return '';
}

/** Cómo se escribe la carga dentro de la línea del ejercicio. */
export function formatMovementLoad(metric: MovementLoadMetric, value: string) {
  const trimmed = value.trim();
  if (!trimmed || metric === 'none') return '';

  if (metric === 'kg') return `${trimmed} kg`;
  if (metric === 'cal') return `${trimmed} cal`;
  if (metric === 'min') return `${trimmed} min`;
  if (metric === 'sec') return `${trimmed} s`;
  if (metric === 'rir') return `RIR ${trimmed}`;
  if (metric === 'percent' || metric === 'rm') return `${trimmed}% RM`;
  return trimmed;
}

export interface WorkoutBlockDraft {
  id: string;
  type: WorkoutBlockType;
  title?: string;
  timing: string;
  subtitle?: string;
  notes?: string;
  items: WorkoutBlockItemDraft[];
}

const STRENGTH_BLOCK_TYPES = new Set<WorkoutBlockType>(['free_training', 'technique', 'strength']);

export function blockUsesSeries(type: WorkoutBlockType) {
  return STRENGTH_BLOCK_TYPES.has(type);
}

export const WORKOUT_BLOCK_TYPES: Array<{
  type: WorkoutBlockType;
  label: string;
  timingLabel: string;
  timingPlaceholder: string;
  /** El tiempo del bloque se edita con selector de minutos/segundos en vez de texto libre. */
  timingIsDuration?: boolean;
  subtitleLabel?: string;
  subtitlePlaceholder?: string;
}> = [
  {
    type: 'activation',
    label: 'Activación',
    timingLabel: 'Duración',
    timingPlaceholder: '10',
    timingIsDuration: true,
  },
  {
    type: 'strength',
    label: 'Fuerza',
    timingLabel: 'Duración',
    timingPlaceholder: 'Opcional',
    timingIsDuration: true,
  },
  {
    type: 'free_training',
    label: 'Entrenamiento libre',
    timingLabel: 'Duración',
    timingPlaceholder: 'Opcional',
    timingIsDuration: true,
  },
  { type: 'for_time', label: 'For Time', timingLabel: 'Cap / tiempo', timingPlaceholder: 'Cap 15 min' },
  { type: 'rounds_for_time', label: 'Rounds For Time', timingLabel: 'Rondas', timingPlaceholder: '5 rondas' },
  {
    type: 'emom',
    label: 'EMOM',
    timingLabel: 'Duración',
    timingPlaceholder: '20',
    timingIsDuration: true,
    subtitleLabel: 'Rondas',
    subtitlePlaceholder: '5 rondas',
  },
  {
    type: 'time_stations',
    label: 'Estaciones de tiempo',
    timingLabel: 'Duración',
    timingPlaceholder: '20',
    timingIsDuration: true,
    subtitleLabel: 'Estaciones',
    subtitlePlaceholder: '4 estaciones',
  },
  {
    type: 'technique',
    label: 'Técnica/skills',
    timingLabel: 'Duración',
    timingPlaceholder: '15',
    timingIsDuration: true,
  },
  {
    type: 'mobility',
    label: 'Movilidad',
    timingLabel: 'Duración',
    timingPlaceholder: '10',
    timingIsDuration: true,
  },
  { type: 'reps_ladder', label: 'Reps For Time / Ladder', timingLabel: 'Esquema', timingPlaceholder: '10-9-8…' },
  {
    type: 'amrap',
    label: 'AMRAP',
    timingLabel: 'Duración',
    timingPlaceholder: '12',
    timingIsDuration: true,
  },
  { type: 'tabata', label: 'Tabata', timingLabel: 'Rondas', timingPlaceholder: '8 rondas' },
  {
    type: 'unbroken',
    label: 'Unbroken',
    timingLabel: 'Duración',
    timingPlaceholder: '10',
    timingIsDuration: true,
  },
  { type: 'free_text', label: 'Texto libre', timingLabel: 'Detalle', timingPlaceholder: 'Opcional' },
];

const BLOCK_LABELS: Record<WorkoutBlockType, string> = {
  activation: 'Activación',
  strength: 'Fuerza',
  free_training: 'Entrenamiento libre',
  for_time: 'For Time',
  rounds_for_time: 'Rounds For Time',
  emom: 'EMOM',
  time_stations: 'Estaciones de tiempo',
  technique: 'Técnica/skills',
  mobility: 'Movilidad',
  reps_ladder: 'Reps For Time / Ladder',
  amrap: 'AMRAP',
  tabata: 'Tabata',
  unbroken: 'Unbroken',
  free_text: 'Texto libre',
};

export type TimingUnit = 'min' | 'sec';

/**
 * Lee la duración de un bloque cuando es solo número + unidad. Devuelve null con textos libres
 * ("Cap 15 min", "10-9-8…") para que el editor los siga tratando como texto.
 */
export function parseTimingDuration(timing: string | undefined): { value: string; unit: TimingUnit } | null {
  const trimmed = timing?.trim() ?? '';
  if (!trimmed) return null;

  const match = trimmed.match(
    /^(\d+(?:[.,]\d+)?)\s*(minutos|mins|min|m|'|\u2032|segundos|segs|seg|s|"|\u2033)?$/i,
  );
  if (!match) return null;

  const unit = match[2]?.toLowerCase();
  const isSeconds = unit === 's' || unit === 'seg' || unit === 'segs' || unit === 'segundos' || unit === '"' || unit === '\u2033';

  return { value: match[1], unit: isSeconds ? 'sec' : 'min' };
}

export function formatTimingDuration(value: string, unit: TimingUnit) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return unit === 'sec' ? `${trimmed} s` : `${trimmed} min`;
}

/** Un campo vacío también admite el selector: es el punto de partida de un bloque nuevo. */
export function usesTimingDurationPicker(timing: string | undefined) {
  return !timing?.trim() || parseTimingDuration(timing) != null;
}

let uniqueIdCounter = 0;

function createId(prefix: string) {
  uniqueIdCounter += 1;
  return `${prefix}-${Date.now()}-${uniqueIdCounter}`;
}

/** Garantiza ids únicos al cargar bloques (p. ej. tras parsear varias secciones a la vez). */
export function ensureUniqueWorkoutBlockIds<T extends WorkoutBlockDraft>(blocks: T[]): T[] {
  const seen = new Set<string>();

  return blocks.map((block) => {
    if (!seen.has(block.id)) {
      seen.add(block.id);
      return block;
    }

    const next = {
      ...block,
      id: createId('block'),
      items: block.items.map((item) => ({ ...item, id: createId('block-item') })),
    };
    seen.add(next.id);
    return next;
  });
}

export function createEmptyBlockItem(): WorkoutBlockItemDraft {
  return {
    id: createId('block-item'),
    text: '',
    sets: '',
    reps: '',
    weightKg: '',
    calories: '',
    distance: '',
    minutes: '',
    seconds: '',
    rir: '',
    percent: '',
    rm: '',
    loadMetric: 'none',
  };
}

function formatLoadSuffix(item: WorkoutBlockItemDraft) {
  const load = formatMovementLoad(getMovementLoadMetric(item), getMovementLoadValue(item));
  return load ? ` · ${load}` : '';
}

function buildBlockItemLine(item: WorkoutBlockItemDraft, blockType?: WorkoutBlockType): string {
  const name = item.text.trim();
  if (!name) return '';

  const load = formatLoadSuffix(item);
  const sets = item.sets?.trim();
  const reps = item.reps?.trim();
  const metric = getMovementLoadMetric(item);
  const quantity = getMovementLoadValue(item).trim();

  // Sin repeticiones la carga pasa a ser la propia prescripción, así que no se repite como sufijo.
  const loadOnly = formatMovementLoad(metric, quantity);

  if (blockType && blockUsesSeries(blockType)) {
    if (sets && reps) return `${name}: ${sets} × ${reps}${load}`;
    if (sets) return `${name}: ${sets} series${load}`;
    if (reps) return `${name}: ${reps} reps${load}`;
    return loadOnly ? `${name}: ${loadOnly}` : name;
  }

  if (reps) return `${name}: ${reps} reps${load}`;
  return loadOnly ? `${name}: ${loadOnly}` : name;
}

/** Línea completa para guardar o editar, con el marcador @video si el vídeo viene del selector. */
export function formatBlockItemLine(item: WorkoutBlockItemDraft, blockType?: WorkoutBlockType): string {
  const line = buildBlockItemLine(item, blockType);
  if (!line) return '';
  return `${line}${formatWorkoutItemVideoSuffix(item.youtubeVideoId)}`;
}

/** Vista de solo lectura: oculta el marcador @video añadido por el selector, pero conserva el texto pegado a mano. */
export function formatBlockItemLineForDisplay(
  item: WorkoutBlockItemDraft,
  blockType?: WorkoutBlockType,
): string {
  return buildBlockItemLine(item, blockType);
}

export function parseBlockItemFromText(line: string): Omit<WorkoutBlockItemDraft, 'id'> {
  const empty = {
    text: '',
    sets: '',
    reps: '',
    weightKg: '',
    calories: '',
    distance: '',
    minutes: '',
    seconds: '',
    rir: '',
    percent: '',
    rm: '',
    loadMetric: 'none' as MovementLoadMetric,
  };
  const trimmed = line.trim();
  if (!trimmed) return empty;

  const youtubeVideoId = parseWorkoutItemVideoId(trimmed);
  const withoutVideo = stripWorkoutItemVideoMarker(trimmed);
  const colonIndex = withoutVideo.indexOf(':');
  const name = colonIndex > 0 ? withoutVideo.slice(0, colonIndex).trim() : withoutVideo;
  const prescription = colonIndex > 0 ? withoutVideo.slice(colonIndex + 1).trim() : '';
  const result = { ...empty, text: name, youtubeVideoId };

  if (!prescription) return result;

  /* El RIR, el porcentaje y el RM se buscan antes que la carga genérica: «80%» o «3RM» sin más se
   * leerían como kilos. Todos admiten ir solos en la prescripción o detrás de las repeticiones.
   * El porcentaje va antes que el RM para que «80% del 1RM» se guarde como porcentaje. */
  const rirMatch = prescription.match(/(?:^|@|·)\s*rir\s*(\d+[\d.,]*)/i);
  const percentMatch = prescription.match(/(?:^|@|·)\s*(\d+[\d.,]*)\s*%/);
  const rmMatch = prescription.match(/(?:^|@|·)\s*(\d+[\d.,]*)\s*rm\b/i);
  /* Los minutos no admiten una «m» suelta porque ahí son metros, y los segundos necesitan el corte de
   * palabra para no comerse la «s» de «series». */
  const minMatch = prescription.match(/(?:^|@|·)\s*(\d+[\d.,]*)\s*(?:minutos|mins|min)\b/i);
  const secMatch = prescription.match(/(?:^|@|·)\s*(\d+[\d.,]*)\s*(?:segundos|segs|seg|s)\b/i);
  const loadMatch = prescription.match(/(?:@|·)\s*(\d+[\d.,]*)\s*(kg|cal)?/i);

  if (rirMatch) {
    result.rir = rirMatch[1];
    result.loadMetric = 'rir';
  } else if (percentMatch) {
    result.percent = percentMatch[1];
    result.loadMetric = 'percent';
  } else if (rmMatch) {
    result.percent = rmMatch[1];
    result.loadMetric = 'percent';
  } else if (minMatch) {
    result.minutes = minMatch[1];
    result.loadMetric = 'min';
  } else if (secMatch) {
    result.seconds = secMatch[1];
    result.loadMetric = 'sec';
  } else if (loadMatch) {
    const value = loadMatch[1];
    const unit = (loadMatch[2] ?? 'kg').toLowerCase();
    if (unit === 'cal') {
      result.calories = value;
      result.loadMetric = 'cal';
    } else {
      result.weightKg = value;
      result.loadMetric = 'kg';
    }
  }

  const matched = rirMatch ?? percentMatch ?? rmMatch ?? minMatch ?? secMatch ?? loadMatch;
  const withoutLoad = (matched ? prescription.replace(matched[0], ' ') : prescription)
    .replace(/[·@]/g, ' ')
    .trim();
  const setsRepsMatch = withoutLoad.match(/^(\d+)\s*[×x]\s*(\d+[\d\-]*)/i);
  if (setsRepsMatch) {
    result.sets = setsRepsMatch[1];
    result.reps = setsRepsMatch[2];
    return result;
  }

  const repsMatch = withoutLoad.match(/^(\d+[\d\-×x]*)\s*reps?/i);
  if (repsMatch) {
    result.reps = repsMatch[1].replace(/×/g, 'x');
    return result;
  }

  const kgMatch = withoutLoad.match(/^(\d+[\d.,]*)\s*kg/i);
  if (kgMatch) {
    result.weightKg = kgMatch[1];
    result.loadMetric = 'kg';
    return result;
  }

  const calMatch = withoutLoad.match(/^(\d+[\d.,]*)\s*cal/i);
  if (calMatch) {
    result.calories = calMatch[1];
    result.loadMetric = 'cal';
    return result;
  }

  const distMatch = withoutLoad.match(/^(\d+[\d.,]*\s*(?:m|km|ft|mi))/i);
  if (distMatch) {
    result.distance = distMatch[1];
    result.loadMetric = 'distance';
    return result;
  }

  const seriesMatch = withoutLoad.match(/^(\d+)\s*series?/i);
  if (seriesMatch) {
    result.sets = seriesMatch[1];
    return result;
  }

  if (/^\d+/.test(withoutLoad)) {
    result.reps = withoutLoad;
  }

  return result;
}

export function createEmptyBlock(type: WorkoutBlockType = 'amrap'): WorkoutBlockDraft {
  return {
    id: createId('block'),
    type,
    title: '',
    timing: '',
    subtitle: '',
    notes: '',
    items: type === 'free_text' ? [] : [createEmptyBlockItem()],
  };
}

function guessBlockType(label: string): WorkoutBlockType {
  const normalized = label.toLowerCase();

  if (normalized.includes('activacion') || normalized.includes('activación')) return 'activation';
  if (normalized.includes('entrenamiento libre')) return 'free_training';
  if (normalized.includes('rounds for time')) return 'rounds_for_time';
  if (normalized.includes('estaciones de tiempo')) return 'time_stations';
  if (normalized.includes('entrenamiento de técnica') || normalized.includes('entrenamiento de tecnica')) {
    return 'technique';
  }
  if (normalized.includes('reps for time') || normalized.includes('ladder')) return 'reps_ladder';
  if (normalized.includes('texto libre')) return 'free_text';
  if (normalized.includes('movilidad')) return 'mobility';
  if (normalized.includes('unbroken')) return 'unbroken';
  if (normalized.includes('amrap')) return 'amrap';
  if (normalized.includes('emom')) return 'emom';
  if (normalized.includes('for time') || normalized.includes('for-time')) return 'for_time';
  if (normalized.includes('tabata')) return 'tabata';
  if (normalized.includes('chipper')) return 'for_time';
  if (normalized.includes('fuerza')) return 'strength';
  if (normalized.includes('técnica') || normalized.includes('tecnica')) return 'technique';
  if (normalized.includes('rondas')) return 'rounds_for_time';
  if (normalized.includes('libre') || normalized.includes('bloque')) return 'free_text';

  return 'free_training';
}

const FREE_TEXT_LABEL = BLOCK_LABELS.free_text;

function splitSectionHeader(line: string) {
  const [label, ...rest] = line.split('·').map((part) => part.trim());
  return { label: label ?? '', rest: rest.join(' · ') };
}

function isFreeTextHeaderLine(line: string) {
  return splitSectionHeader(line).label.toLowerCase() === FREE_TEXT_LABEL.toLowerCase();
}

function isKnownBlockHeaderLine(line: string) {
  return isKnownBlockLabel(splitSectionHeader(line).label);
}

function sectionLines(section: string) {
  return section
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => line.trim());
}

function freeTextBlockFromLines(lines: string[]): WorkoutBlockDraft {
  return {
    ...createEmptyBlock('free_text'),
    title: splitSectionHeader(lines[0] ?? '').rest,
    timing: lines.slice(1).join('\n').trim(),
    items: [],
  };
}

function rawFreeTextBlock(text: string): WorkoutBlockDraft {
  return { ...createEmptyBlock('free_text'), timing: text.trim(), items: [] };
}

function blockFromParsed(parsed: WorkoutContentBlock): WorkoutBlockDraft {
  const type = guessBlockType(parsed.label);
  const parts = parsed.timing?.split(' · ').map((part) => part.trim()).filter(Boolean) ?? [];

  let title = '';
  const timingParts: string[] = [];
  // Lo que no es cap, rondas ni el nombre del bloque son las instrucciones del entrenador.
  const noteParts: string[] = [];

  for (const part of parts) {
    if (isStructuredTimingPart(part)) {
      timingParts.push(part);
    } else if (!title) {
      title = part;
    } else {
      noteParts.push(part);
    }
  }

  const dedupedTimingParts = dedupeTimingTokens(timingParts);

  return {
    id: createId('block'),
    type,
    title,
    timing: dedupedTimingParts[0] ?? '',
    subtitle: dedupedTimingParts.slice(1).join(' · ') || '',
    notes: noteParts.join(' · '),
    items:
      parsed.items.length > 0
        ? parsed.items.map((text) => ({ id: createId('block-item'), ...parseBlockItemFromText(text) }))
        : [createEmptyBlockItem()],
  };
}

export function parseWorkoutBlocksFromText(content: string): WorkoutBlockDraft[] {
  const trimmed = content.trim();
  if (!trimmed) return [];

  const sections = trimmed
    .split(/\n\n+/)
    .map((section) => section.trim())
    .filter(Boolean);

  if (!isStructuredWorkoutContent(trimmed)) {
    const lines = sectionLines(sections[0] ?? '');
    return [isFreeTextHeaderLine(lines[0] ?? '') ? freeTextBlockFromLines(lines) : rawFreeTextBlock(trimmed)];
  }

  const blocks: WorkoutBlockDraft[] = [];

  for (const section of sections) {
    const lines = sectionLines(section);
    const firstLine = lines[0] ?? '';

    if (isFreeTextHeaderLine(firstLine)) {
      blocks.push(freeTextBlockFromLines(lines));
      continue;
    }

    // Sin cabecera conocida ni lista con viñetas es texto del entrenador: se mantiene
    // entero aunque tenga líneas en blanco, en lugar de partirse en varios bloques.
    if (!isKnownBlockHeaderLine(firstLine) && !hasBulletList(section)) {
      const previous = blocks[blocks.length - 1];
      if (previous?.type === 'free_text') {
        previous.timing = [previous.timing, section].filter(Boolean).join('\n\n');
      } else {
        blocks.push(rawFreeTextBlock(section));
      }
      continue;
    }

    const [parsed] = parseWorkoutContent(section);
    if (parsed) blocks.push(blockFromParsed(parsed));
  }

  return ensureUniqueWorkoutBlockIds(blocks);
}

export function serializeWorkoutBlocks(blocks: WorkoutBlockDraft[]): string {
  return blocks
    .map((block) => {
      if (block.type === 'free_text') {
        const body = block.timing.trim();
        const title = block.title?.trim();
        if (!title) return body;
        return body ? `${FREE_TEXT_LABEL} · ${title}\n${body}` : `${FREE_TEXT_LABEL} · ${title}`;
      }

      const label = BLOCK_LABELS[block.type];
      const headerParts = [block.title?.trim(), block.timing.trim(), block.subtitle?.trim()].filter(Boolean);
      const header = headerParts.length > 0 ? `${label} · ${headerParts.join(' · ')}` : label;
      const notes = block.notes?.trim();
      const items = block.items
        .map((item) => formatBlockItemLine(item, block.type))
        .filter(Boolean)
        .map((text) => `• ${text}`);

      if (items.length === 0 && !block.timing.trim() && !block.subtitle?.trim()) {
        return '';
      }

      const body = items.length > 0 ? items : [];
      if (notes) body.unshift(notes);
      return body.length > 0 ? [header, ...body].join('\n') : header;
    })
    .filter(Boolean)
    .join('\n\n');
}

export function hasWorkoutBlockContent(blocks: WorkoutBlockDraft[]): boolean {
  return Boolean(serializeWorkoutBlocks(blocks).trim());
}

export function getBlockTypeConfig(type: WorkoutBlockType) {
  return WORKOUT_BLOCK_TYPES.find((entry) => entry.type === type) ?? WORKOUT_BLOCK_TYPES[0];
}

export function canConfirmWorkoutBlock(block: WorkoutBlockDraft): boolean {
  if (block.type === 'free_text') {
    return Boolean(block.timing.trim() || block.title?.trim());
  }

  const hasTiming = Boolean(block.timing.trim() || block.subtitle?.trim());
  const hasItems = block.items.some((item) => item.text.trim());
  return hasTiming || hasItems;
}

export function sanitizeWorkoutBlock(block: WorkoutBlockDraft): WorkoutBlockDraft {
  if (block.type === 'free_text') {
    return {
      ...block,
      title: block.title?.trim() ?? '',
      timing: block.timing.trim(),
      subtitle: '',
      items: [],
    };
  }

  return {
    ...block,
    title: block.title?.trim() ?? '',
    notes: block.notes?.trim() ?? '',
    items: block.items
      .map((item) => ({
        ...item,
        text: item.text.trim(),
        sets: item.sets?.trim() ?? '',
        reps: item.reps?.trim() ?? '',
        weightKg: item.weightKg?.trim() ?? '',
        calories: item.calories?.trim() ?? '',
        distance: item.distance?.trim() ?? '',
        minutes: item.minutes?.trim() ?? '',
        seconds: item.seconds?.trim() ?? '',
        rir: item.rir?.trim() ?? '',
        percent: item.percent?.trim() ?? '',
        rm: item.rm?.trim() ?? '',
        loadMetric: getMovementLoadMetric(item),
        youtubeVideoId: item.youtubeVideoId?.trim() || undefined,
      }))
      .filter((item) => item.text),
  };
}

export function getWorkoutBlockSummary(block: WorkoutBlockDraft): string {
  const config = getBlockTypeConfig(block.type);

  if (block.type === 'free_text') {
    const title = block.title?.trim();
    const text = freeTextBlockBody(block.timing).trim();
    if (!text) return title || config.label;
    const firstLine = text.split('\n').find(Boolean) ?? text;
    const summary = firstLine.length > 72 ? `${firstLine.slice(0, 72)}…` : firstLine;
    return title ? `${title} · ${summary}` : summary;
  }

  const headerParts = [block.title?.trim(), block.timing.trim(), block.subtitle?.trim()].filter(Boolean);
  const header = headerParts.length > 0 ? `${config.label} · ${headerParts.join(' · ')}` : config.label;
  const movementCount = block.items.filter((item) => item.text.trim()).length;
  if (movementCount === 0) return header;
  return `${header} · ${movementCount} movimiento${movementCount === 1 ? '' : 's'}`;
}
