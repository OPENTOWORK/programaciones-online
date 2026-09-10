/**
 * API de una semana de Básico. La programación completa vive en basicoYearProgram.mjs.
 */

import {
  DEFAULT_YEAR,
  GENERATED_RATE_ID_RANGE,
  LEGACY_PROGRAM_NAME,
  PROGRAM_NAME,
  WEEKDAY_LABELS,
  buildBasicoYear,
  extractWeek,
  generatedRateId,
  toWorkoutRows as toYearWorkoutRows,
} from './basicoYearProgram.mjs';

export const WEEK_MONDAY = '2026-08-31';
export { DEFAULT_YEAR, GENERATED_RATE_ID_RANGE, LEGACY_PROGRAM_NAME, PROGRAM_NAME, WEEKDAY_LABELS, generatedRateId };

export function isMonday(dateStr) {
  return new Date(`${dateStr}T12:00:00Z`).getUTCDay() === 1;
}

export function buildBasicoWeek(monday = WEEK_MONDAY) {
  if (!isMonday(monday)) {
    throw new Error(`La semana debe empezar en lunes; ${monday} no lo es.`);
  }
  const year = Number(monday.slice(0, 4));
  return extractWeek(buildBasicoYear({ year }), monday);
}

export function toWorkoutRows({ monday, days }) {
  return toYearWorkoutRows(
    days.map((day) => ({
      ...day,
      week: day.week ?? 0,
      mesocycle: day.mesocycle ?? 0,
      phaseName: day.phaseName ?? 'Básico',
      role: day.role ?? 'intro',
    })),
  );
}
