import { parseExerciseLabelFromBlockItem } from '@/lib/exerciseName';

export interface BlockItemDisplay {
  name: string;
  quantity?: string;
  load?: string;
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
  if (normalized) return unit ?? '';
  return 'kg';
}

export function parseBlockItemForDisplay(line: string): BlockItemDisplay {
  const trimmed = line.trim();
  const name = parseExerciseLabelFromBlockItem(trimmed);
  const colonIndex = trimmed.indexOf(':');
  let prescription = colonIndex > 0 ? trimmed.slice(colonIndex + 1).trim() : '';

  if (!prescription) {
    return { name };
  }

  let load: string | undefined;
  const loadMatch = prescription.match(/(?:@|·)\s*(\d+[\d.,]*)\s*(kg|cal|m|km|ft|mi)?/i);
  if (loadMatch) {
    const value = loadMatch[1];
    const unit = normalizeLoadUnit(loadMatch[2]);
    load = unit ? `${value} ${unit}` : value;
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
    normalizedLabel.includes('técnica') ||
    normalizedLabel.includes('tecnica');

  return timing
    .split('·')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      if (/\d+\s*rondas?/i.test(part)) {
        const rounds = formatRoundsValue(part);
        return { icon: 'rounds' as const, ...rounds };
      }

      if (/\d+\s*(?:min|minutos?|'|m\b)/i.test(part)) {
        const duration = formatDurationValue(part);
        return { icon: 'time' as const, ...duration };
      }

      if (/^\d+$/.test(part)) {
        if (isDurationBlock) {
          return { icon: 'time' as const, value: part, unit: 'min' };
        }

        const rounds = formatRoundsValue(part);
        return { icon: 'rounds' as const, ...rounds };
      }

      return { icon: 'info' as const, value: part, unit: '' };
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
