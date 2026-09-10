import type { BodyMeasurement, BodyMetricChartKey } from '@/lib/bodyMetrics';

export interface BodyMetricChartPoint {
  id: string;
  label: string;
  value: number;
  measuredAt: string;
}

export interface BodyMetricTrend {
  delta: number;
  percent?: number;
  direction: 'up' | 'down' | 'flat';
}

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

/** Una medición por día: si guardas varias veces el mismo día, se usa la más reciente. */
export function prepareBodyMetricSeries(
  entries: BodyMeasurement[],
  metric: BodyMetricChartKey,
  maxPoints = 12,
): BodyMetricChartPoint[] {
  const byDay = new Map<string, BodyMetricChartPoint>();

  for (const entry of entries) {
    const value = entry[metric];
    if (typeof value !== 'number' || !Number.isFinite(value)) continue;

    const dayKey = entry.measuredAt.slice(0, 10);
    byDay.set(dayKey, {
      id: entry.id,
      label: formatDay(entry.measuredAt),
      value,
      measuredAt: entry.measuredAt,
    });
  }

  return [...byDay.values()]
    .sort((left, right) => left.measuredAt.localeCompare(right.measuredAt))
    .slice(-maxPoints);
}

export function computeBodyMetricTrend(points: BodyMetricChartPoint[]): BodyMetricTrend | null {
  if (points.length < 2) return null;

  const first = points[0].value;
  const last = points[points.length - 1].value;
  const delta = last - first;

  return {
    delta,
    percent: first !== 0 ? (delta / first) * 100 : undefined,
    direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat',
  };
}

export function buildBodyMetricScale(points: BodyMetricChartPoint[]) {
  if (points.length === 0) {
    return { min: 0, max: 1, ticks: [0, 0.5, 1] };
  }

  const values = points.map((point) => point.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const padding = Math.max((rawMax - rawMin) * 0.15, rawMax * 0.05, 0.5);
  const min = rawMin - padding;
  const max = rawMax + padding;
  const mid = (min + max) / 2;

  return { min, max, ticks: [max, mid, min] };
}

export function plotBodyMetricPoints(
  points: BodyMetricChartPoint[],
  width: number,
  height: number,
  min: number,
  max: number,
) {
  const range = Math.max(max - min, 0.001);

  return points.map((point, index) => {
    const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width;
    const y = height - ((point.value - min) / range) * height;
    return { ...point, x, y };
  });
}
