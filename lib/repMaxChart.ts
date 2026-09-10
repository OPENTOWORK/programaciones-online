import {
  estimateOneRepMax,
  getRepMaxUnitMeta,
  type RepMaxExerciseGroup,
} from '@/lib/repMax';
import {
  type BodyMetricChartPoint,
  buildBodyMetricScale,
  computeBodyMetricTrend,
  plotBodyMetricPoints,
} from '@/lib/bodyMetricsChart';

export type { BodyMetricChartPoint as RepMaxChartPoint };

function formatDay(iso: string) {
  const value = iso.includes('T') ? iso : `${iso}T12:00:00`;
  return new Date(value).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function formatTime(iso: string) {
  const date = new Date(iso.includes('T') ? iso : `${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return formatDay(iso);
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

/** En kg se pinta el 1RM estimado para poder comparar marcas con distintas reps. */
export function repMaxChartValue(value: number, unit: RepMaxExerciseGroup['latest']['unit'], reps: number) {
  if (unit === 'kg') return estimateOneRepMax(value, reps);
  return value;
}

export function prepareRepMaxSeries(
  group: RepMaxExerciseGroup | undefined,
  maxPoints = 12,
): BodyMetricChartPoint[] {
  if (!group) return [];

  const records = [...[group.latest, ...group.history]].sort((left, right) => {
    const byDate = left.recordedAt.localeCompare(right.recordedAt);
    if (byDate !== 0) return byDate;
    return left.createdAt.localeCompare(right.createdAt);
  });
  const series = records.slice(-maxPoints);
  const marksOnDay = new Map<string, number>();
  for (const entry of series) {
    const dayKey = entry.recordedAt.slice(0, 10);
    marksOnDay.set(dayKey, (marksOnDay.get(dayKey) ?? 0) + 1);
  }

  return series.map((entry) => {
    const dayKey = entry.recordedAt.slice(0, 10);
    const sameDay = (marksOnDay.get(dayKey) ?? 0) > 1;
    return {
      id: entry.id,
      label: sameDay ? formatTime(entry.createdAt) : formatDay(entry.recordedAt),
      value: repMaxChartValue(entry.value, entry.unit, entry.reps),
      measuredAt: entry.createdAt,
    };
  });
}

export function chartUnitLabel(group: RepMaxExerciseGroup | undefined) {
  if (!group) return '';
  return getRepMaxUnitMeta(group.latest.unit).label;
}

export function chartExerciseLabel(group: RepMaxExerciseGroup, groups: RepMaxExerciseGroup[]) {
  const nameKey = group.key.split(':')[0];
  const sameName = groups.filter((item) => item.key.split(':')[0] === nameKey);
  if (sameName.length > 1) {
    return `${group.name} · ${getRepMaxUnitMeta(group.latest.unit).label}`;
  }
  return group.name;
}

export { buildBodyMetricScale, computeBodyMetricTrend, plotBodyMetricPoints };
