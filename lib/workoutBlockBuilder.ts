import {
  isStructuredWorkoutContent,
  parseWorkoutContent,
  type WorkoutContentBlock,
} from '@/lib/workoutContentParser';

export type WorkoutBlockType =
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
  loadMetric?: MovementLoadMetric;
}

export type MovementLoadMetric = 'none' | 'kg' | 'cal' | 'distance';

export const MOVEMENT_LOAD_METRICS: MovementLoadMetric[] = ['none', 'kg', 'cal', 'distance'];

export function getMovementLoadMetricLabel(metric: MovementLoadMetric) {
  if (metric === 'kg') return 'Kg';
  if (metric === 'cal') return 'Cal';
  if (metric === 'distance') return 'Distancia';
  return 'Sin carga';
}

export function getMovementLoadMetric(item: WorkoutBlockItemDraft): MovementLoadMetric {
  if (item.loadMetric && item.loadMetric !== 'none') return item.loadMetric;
  if (item.weightKg?.trim()) return 'kg';
  if (item.calories?.trim()) return 'cal';
  if (item.distance?.trim()) return 'distance';
  return 'none';
}

export function getMovementLoadValue(item: WorkoutBlockItemDraft): string {
  const metric = getMovementLoadMetric(item);
  if (metric === 'kg') return item.weightKg ?? '';
  if (metric === 'cal') return item.calories ?? '';
  if (metric === 'distance') return item.distance ?? '';
  return '';
}

export function movementLoadPlaceholder(metric: MovementLoadMetric) {
  if (metric === 'kg') return '60';
  if (metric === 'cal') return '15';
  if (metric === 'distance') return '400 m';
  return '';
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

const STRENGTH_BLOCK_TYPES = new Set<WorkoutBlockType>(['free_training', 'technique']);

export function blockUsesSeries(type: WorkoutBlockType) {
  return STRENGTH_BLOCK_TYPES.has(type);
}

export const WORKOUT_BLOCK_TYPES: Array<{
  type: WorkoutBlockType;
  label: string;
  timingLabel: string;
  timingPlaceholder: string;
  subtitleLabel?: string;
  subtitlePlaceholder?: string;
}> = [
  { type: 'free_training', label: 'Entrenamiento libre', timingLabel: 'Duración', timingPlaceholder: 'Opcional' },
  { type: 'for_time', label: 'For Time', timingLabel: 'Cap / tiempo', timingPlaceholder: 'Cap 15 min' },
  { type: 'rounds_for_time', label: 'Rounds For Time', timingLabel: 'Rondas', timingPlaceholder: '5 rondas' },
  {
    type: 'emom',
    label: 'EMOM',
    timingLabel: 'Duración',
    timingPlaceholder: '20 min',
    subtitleLabel: 'Rondas',
    subtitlePlaceholder: '5 rondas',
  },
  {
    type: 'time_stations',
    label: 'Estaciones de tiempo',
    timingLabel: 'Duración',
    timingPlaceholder: '20 min',
    subtitleLabel: 'Estaciones',
    subtitlePlaceholder: '4 estaciones',
  },
  { type: 'technique', label: 'Entrenamiento de Técnica', timingLabel: 'Duración', timingPlaceholder: '15 min' },
  { type: 'mobility', label: 'Movilidad', timingLabel: 'Duración', timingPlaceholder: '10 min' },
  { type: 'reps_ladder', label: 'Reps For Time / Ladder', timingLabel: 'Esquema', timingPlaceholder: '10-9-8…' },
  { type: 'amrap', label: 'AMRAP', timingLabel: 'Duración', timingPlaceholder: '12 min' },
  { type: 'tabata', label: 'Tabata', timingLabel: 'Rondas', timingPlaceholder: '8 rondas' },
  { type: 'unbroken', label: 'Unbroken', timingLabel: 'Duración', timingPlaceholder: '10 min' },
  { type: 'free_text', label: 'Texto libre', timingLabel: 'Detalle', timingPlaceholder: 'Opcional' },
];

const BLOCK_LABELS: Record<WorkoutBlockType, string> = {
  free_training: 'Entrenamiento libre',
  for_time: 'For Time',
  rounds_for_time: 'Rounds For Time',
  emom: 'EMOM',
  time_stations: 'Estaciones de tiempo',
  technique: 'Entrenamiento de Técnica',
  mobility: 'Movilidad',
  reps_ladder: 'Reps For Time / Ladder',
  amrap: 'AMRAP',
  tabata: 'Tabata',
  unbroken: 'Unbroken',
  free_text: 'Texto libre',
};

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
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
    loadMetric: 'none',
  };
}

function formatLoadSuffix(item: WorkoutBlockItemDraft) {
  const metric = getMovementLoadMetric(item);
  const value = getMovementLoadValue(item).trim();
  if (!value || metric === 'none') return '';

  if (metric === 'kg') return ` · ${value} kg`;
  if (metric === 'cal') return ` · ${value} cal`;
  return ` · ${value}`;
}

export function formatBlockItemLine(item: WorkoutBlockItemDraft, blockType?: WorkoutBlockType): string {
  const name = item.text.trim();
  if (!name) return '';

  const load = formatLoadSuffix(item);
  const sets = item.sets?.trim();
  const reps = item.reps?.trim();
  const metric = getMovementLoadMetric(item);
  const quantity = getMovementLoadValue(item).trim();

  if (blockType && blockUsesSeries(blockType)) {
    if (sets && reps) return `${name}: ${sets} × ${reps}${load}`;
    if (sets) return `${name}: ${sets} series${load}`;
    if (reps) return `${name}: ${reps} reps${load}`;
    return load ? `${name}${load}` : name;
  }

  if (reps) return `${name}: ${reps} reps${load}`;

  if (metric === 'cal' && quantity) return `${name}: ${quantity} cal${load}`;
  if (metric === 'distance' && quantity) return `${name}: ${quantity}${load}`;
  if (metric === 'kg' && quantity && !reps) return `${name}: ${quantity} kg${load}`;

  return load ? `${name}${load}` : name;
}

export function parseBlockItemFromText(line: string): Omit<WorkoutBlockItemDraft, 'id'> {
  const empty = {
    text: '',
    sets: '',
    reps: '',
    weightKg: '',
    calories: '',
    distance: '',
    loadMetric: 'none' as MovementLoadMetric,
  };
  const trimmed = line.trim();
  if (!trimmed) return empty;

  const colonIndex = trimmed.indexOf(':');
  const name = colonIndex > 0 ? trimmed.slice(0, colonIndex).trim() : trimmed;
  const prescription = colonIndex > 0 ? trimmed.slice(colonIndex + 1).trim() : '';
  const result = { ...empty, text: name };

  if (!prescription) return result;

  const loadMatch = prescription.match(/(?:@|·)\s*(\d+[\d.,]*)\s*(kg|cal)?/i);
  if (loadMatch) {
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

  const withoutLoad = prescription.replace(/(?:@|·)\s*[^@·]+$/i, '').trim();
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
  if (normalized.includes('fuerza') || normalized.includes('técnica') || normalized.includes('tecnica')) {
    return 'technique';
  }
  if (normalized.includes('rondas')) return 'rounds_for_time';
  if (normalized.includes('libre') || normalized.includes('bloque')) return 'free_text';

  return 'free_training';
}

function blockFromParsed(parsed: WorkoutContentBlock): WorkoutBlockDraft {
  const type = guessBlockType(parsed.label);
  const timingParts = parsed.timing?.split(' · ').map((part) => part.trim()).filter(Boolean) ?? [];

  return {
    id: createId('block'),
    type,
    timing: timingParts[0] ?? '',
    subtitle: timingParts.slice(1).join(' · ') || '',
    items:
      parsed.items.length > 0
        ? parsed.items.map((text) => ({ id: createId('block-item'), ...parseBlockItemFromText(text) }))
        : [createEmptyBlockItem()],
  };
}

export function parseWorkoutBlocksFromText(content: string): WorkoutBlockDraft[] {
  const trimmed = content.trim();
  if (!trimmed) return [];

  if (!isStructuredWorkoutContent(trimmed)) {
    return [
      {
        ...createEmptyBlock('free_text'),
        timing: trimmed,
        items: [],
      },
    ];
  }

  const parsed = parseWorkoutContent(trimmed);
  if (parsed.length === 0) return [];
  return parsed.map(blockFromParsed);
}

export function serializeWorkoutBlocks(blocks: WorkoutBlockDraft[]): string {
  return blocks
    .map((block) => {
      if (block.type === 'free_text') {
        return block.timing.trim();
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
    return Boolean(block.timing.trim());
  }

  const hasTiming = Boolean(block.timing.trim() || block.subtitle?.trim());
  const hasItems = block.items.some((item) => item.text.trim());
  return hasTiming || hasItems;
}

export function sanitizeWorkoutBlock(block: WorkoutBlockDraft): WorkoutBlockDraft {
  if (block.type === 'free_text') {
    return {
      ...block,
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
        loadMetric: getMovementLoadMetric(item),
      }))
      .filter((item) => item.text),
  };
}

export function getWorkoutBlockSummary(block: WorkoutBlockDraft): string {
  const config = getBlockTypeConfig(block.type);

  if (block.type === 'free_text') {
    const text = block.timing.trim();
    if (!text) return config.label;
    const firstLine = text.split('\n').find(Boolean) ?? text;
    return firstLine.length > 72 ? `${firstLine.slice(0, 72)}…` : firstLine;
  }

  const headerParts = [block.title?.trim(), block.timing.trim(), block.subtitle?.trim()].filter(Boolean);
  const header = headerParts.length > 0 ? `${config.label} · ${headerParts.join(' · ')}` : config.label;
  const movementCount = block.items.filter((item) => item.text.trim()).length;
  if (movementCount === 0) return header;
  return `${header} · ${movementCount} movimiento${movementCount === 1 ? '' : 's'}`;
}
