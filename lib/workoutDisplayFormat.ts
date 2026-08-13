import { parseExerciseLabelFromBlockItem } from '@/lib/exerciseName';
import { parseWorkoutItemVideoId, stripWorkoutItemVideoMarker } from '@/lib/workoutItemVideo';

export interface BlockItemDisplay {
  name: string;
  quantity?: string;
  load?: string;
  /** "Carga" no encaja cuando la prescripción es por tiempo. */
  loadLabel?: 'Carga' | 'Tiempo';
  youtubeVideoId?: string;
}

export interface TimingDisplayPart {
  icon: 'time' | 'rounds' | 'info';
  value: string;
  unit: string;
}

function normalizeLoadUnit(unit?: string) {
  const normalized = unit?.toLowerCase();
  if (normalized === 'cal') return 'cal';
  if (normalized === 'kg') return 'kg';
  if (normalized === 'min' || normalized === 'mins' || normalized === 'minutos') return 'min';
  if (normalized === 's' || normalized === 'seg' || normalized === 'segs' || normalized === 'segundos') {
    return 's';
  }
  if (normalized) return unit ?? '';
  return 'kg';
}

export function parseBlockItemForDisplay(line: string): BlockItemDisplay {
  const trimmed = line.trim();
  const youtubeVideoId = parseWorkoutItemVideoId(trimmed);
  const working = stripWorkoutItemVideoMarker(trimmed);
  const name = parseExerciseLabelFromBlockItem(working);
  const colonIndex = working.indexOf(':');
  let prescription = colonIndex > 0 ? working.slice(colonIndex + 1).trim() : '';

  if (!prescription) {
    return { name, youtubeVideoId };
  }

  let load: string | undefined;
  let loadLabel: BlockItemDisplay['loadLabel'];
  // Las alternativas largas van primero para que "min" no se quede en "m" ni "mi".
  const loadMatch = prescription.match(
    /(?:@|·)\s*(\d+[\d.,]*)\s*(kg|cal|km|minutos|mins|min|mi|m|ft|segundos|segs|seg|s)?\b/i,
  );
  if (loadMatch) {
    const value = loadMatch[1];
    const unit = normalizeLoadUnit(loadMatch[2]);
    load = unit ? `${value} ${unit}` : value;
    loadLabel = unit === 'min' || unit === 's' ? 'Tiempo' : 'Carga';
    prescription = prescription.replace(loadMatch[0], '').trim();
  }

  const inlineKgMatch = prescription.match(/(\d+[\d.,]*)\s*kg\b/i);
  if (!load && inlineKgMatch) {
    load = `${inlineKgMatch[1]} kg`;
    prescription = prescription.replace(inlineKgMatch[0], '').trim();
  }

  prescription = prescription
    .replace(/^[,·\s-]+|[,·\s-]+$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return {
    name,
    quantity: prescription || undefined,
    load,
    loadLabel: load ? loadLabel ?? 'Carga' : undefined,
    youtubeVideoId,
  };
}

export function formatBlockItemForDisplay(line: string): string {
  const parsed = parseBlockItemForDisplay(line);
  const parts = [parsed.quantity, parsed.load].filter(Boolean);
  if (parts.length === 0) return parsed.name;
  return `${parsed.name} · ${parts.join(' · ')}`;
}

function formatDurationValue(raw: string) {
  const match = raw.match(/(\d+)/);
  if (!match) return { value: raw, unit: '' };

  const value = match[1];
  if (/min|minuto|'/i.test(raw)) return { value, unit: 'min' };
  if (/\bm\b/i.test(raw)) return { value, unit: 'min' };
  return { value, unit: 'min' };
}

function formatRoundsValue(raw: string) {
  const match = raw.match(/(\d+)/);
  if (!match) return { value: raw, unit: '' };

  const count = Number(match[1]);
  return { value: String(count), unit: count === 1 ? 'ronda' : 'rondas' };
}

/** Unifica comillas/primas y espacios de tokens como "15 MIN", "15'" o "15′". */
function normalizeTimingToken(part: string) {
  return part
    .trim()
    .toLowerCase()
    .replace(/[\u2018\u2019\u2032\u00B4`']/g, "'")
    .replace(/\s+/g, ' ');
}

/** Devuelve la duración si el token representa un cap o un tiempo, en minutos o en segundos. */
function parseDuration(part: string): { value: number; unit: 'min' | 's' } | null {
  const normalized = normalizeTimingToken(part);
  if (!normalized) return null;

  const seconds = normalized.match(/^(\d+)\s*(?:segundos?|segs?|s|"|\u2033)$/);
  if (seconds) return { value: Number(seconds[1]), unit: 's' };

  const explicit = normalized.match(/^(\d+)\s*(?:min(?:utos?)?|m)\b/);
  if (explicit) return { value: Number(explicit[1]), unit: 'min' };

  const quoteCap = normalized.match(/^(\d+)\s*'\s*$/);
  if (quoteCap) return { value: Number(quoteCap[1]), unit: 'min' };

  if (/^\d+$/.test(normalized)) return { value: Number(normalized), unit: 'min' };

  return null;
}

function parseRoundsCount(part: string): number | null {
  const normalized = normalizeTimingToken(part);
  const match = normalized.match(/^(\d+)\s*rondas?$/);
  return match ? Number(match[1]) : null;
}

function timingTokenKey(part: string) {
  const duration = parseDuration(part);
  if (duration) return `time:${duration.value}${duration.unit}`;

  const rounds = parseRoundsCount(part);
  if (rounds != null) return `rounds:${rounds}`;

  return `info:${normalizeTimingToken(part)}`;
}

function dedupeTimingTokens(parts: string[]) {
  const seen = new Set<string>();
  return parts.filter((part) => {
    const key = timingTokenKey(part);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export { dedupeTimingTokens, timingTokenKey };

/** Partes de cabecera que representan cap, rondas o duración (no el nombre del bloque). */
export function isStructuredTimingPart(part: string) {
  const trimmed = part.trim();
  if (!trimmed) return false;
  if (parseRoundsCount(trimmed) != null) return true;
  if (parseDuration(trimmed) != null) return true;
  return false;
}

export function splitBlockTimingMetadata(timing: string | undefined) {
  if (!timing?.trim()) return { blockTitle: '', pillTiming: '' };

  const parts = timing
    .split('·')
    .map((part) => part.trim())
    .filter(Boolean);
  const pillParts: string[] = [];
  let blockTitle = '';

  for (const part of parts) {
    if (isStructuredTimingPart(part)) {
      pillParts.push(part);
    } else if (!blockTitle) {
      blockTitle = part;
    } else {
      pillParts.push(part);
    }
  }

  return { blockTitle, pillTiming: dedupeTimingTokens(pillParts).join(' · ') };
}

function parseTimingPart(part: string, isDurationBlock: boolean): TimingDisplayPart {
  const rounds = parseRoundsCount(part);
  if (rounds != null) {
    return { icon: 'rounds', value: String(rounds), unit: rounds === 1 ? 'ronda' : 'rondas' };
  }

  const duration = parseDuration(part);
  if (duration) {
    return { icon: 'time', value: String(duration.value), unit: duration.unit };
  }

  if (/^\d+$/.test(normalizeTimingToken(part)) && isDurationBlock) {
    return { icon: 'time', value: part.trim(), unit: 'min' };
  }

  return { icon: 'info', value: part.trim(), unit: '' };
}

function timingPartKey(part: TimingDisplayPart) {
  if (part.icon === 'time') return `time:${part.value}${part.unit}`;
  if (part.icon === 'rounds') return `rounds:${part.value}`;
  return `info:${part.value.trim().toLowerCase()}`;
}

export function parseTimingForDisplay(timing: string | undefined, blockLabel: string): TimingDisplayPart[] {
  if (!timing?.trim()) return [];

  const normalizedLabel = blockLabel.toLowerCase();
  const isDurationBlock =
    normalizedLabel.includes('emom') ||
    normalizedLabel.includes('amrap') ||
    normalizedLabel.includes('for time') ||
    normalizedLabel.includes('tabata') ||
    normalizedLabel.includes('unbroken') ||
    normalizedLabel.includes('movilidad') ||
    normalizedLabel.includes('activación') ||
    normalizedLabel.includes('activacion') ||
    normalizedLabel.includes('técnica') ||
    normalizedLabel.includes('tecnica');

  const seen = new Set<string>();

  return dedupeTimingTokens(
    timing
      .split('·')
      .map((part) => part.trim())
      .filter(Boolean),
  )
    .map((part) => parseTimingPart(part, isDurationBlock))
    .filter((part) => {
      const key = timingPartKey(part);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function getBlockTimingHint(blockLabel: string): string | null {
  const normalized = blockLabel.toLowerCase();

  if (normalized.includes('emom')) return 'Un movimiento cada minuto';
  if (normalized.includes('amrap')) return 'Tantas rondas como puedas en el tiempo';
  if (normalized.includes('for time')) return 'Completa el trabajo lo antes posible';
  if (normalized.includes('tabata')) return '20 s trabajo · 10 s descanso';
  if (normalized.includes('rounds for time')) return 'Completa todas las rondas lo antes posible';

  return null;
}
