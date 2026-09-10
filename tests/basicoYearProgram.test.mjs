import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_YEAR,
  GENERATED_RATE_ID_RANGE,
  MESOCYCLE_WEEKS,
  PHASES,
  REST_WEEKDAYS,
  TRAINING_WEEKDAYS,
  WEEK_ROLES,
  buildBasicoYear,
  describeWeek,
  generatedRateId,
  toWorkoutRows,
} from '../scripts/lib/basicoYearProgram.mjs';
import { buildBasicoWeek, WEEK_MONDAY } from '../scripts/lib/basicoProgram.mjs';

const KNOWN_BLOCK_LABELS = [
  'amrap',
  'emom',
  'for time',
  'movilidad',
  'activacion',
  'fuerza',
  'tecnica',
];

function normalizeLabel(label) {
  return label
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function isKnownBlockLabel(label) {
  return KNOWN_BLOCK_LABELS.some((known) => normalizeLabel(label).startsWith(known));
}

function blocksOf(content) {
  return content
    .split(/\n\n+/)
    .map((section) => section.trim())
    .filter(Boolean)
    .map((section) => {
      const lines = section.split('\n');
      const [label] = lines[0].split('·').map((part) => part.trim());
      return {
        label,
        items: lines.filter((line) => line.startsWith('• ')).map((line) => line.slice(2)),
      };
    });
}

const days = buildBasicoYear();
const rows = toWorkoutRows(days);

describe('año natural de Básico', () => {
  it('cubre del 1 de enero al 31 de diciembre', () => {
    const dates = [...new Set(rows.map((row) => row.workoutDate))].sort();
    assert.equal(dates[0], `${DEFAULT_YEAR}-01-01`);
    assert.equal(dates.at(-1), `${DEFAULT_YEAR}-12-31`);
    assert.equal(dates.length, 365);
  });

  it('entrena lunes, martes, jueves y viernes', () => {
    for (const day of days) {
      if (day.isRest) {
        assert.ok(REST_WEEKDAYS.includes(day.weekdayIndex), `${day.date} debería ser descanso`);
      } else {
        assert.ok(TRAINING_WEEKDAYS.includes(day.weekdayIndex), `${day.date} debería entrenar`);
        assert.deepEqual(
          day.sessions.map((session) => session.kind),
          ['activation', 'session', 'metcon'],
        );
      }
    }
  });

  it('organiza 13 mesociclos de 4 semanas', () => {
    for (let week = 1; week <= MESOCYCLE_WEEKS; week += 1) {
      const info = describeWeek(week);
      assert.ok(info.mesocycle >= 1 && info.mesocycle <= 13);
      assert.ok(WEEK_ROLES.includes(info.role));
      assert.ok(PHASES.some((phase) => phase.key === info.phase.key));
    }
  });

  it('sube la exigencia en semana pico frente a intro del mismo mesociclo', () => {
    const week1Intro = days.find((day) => day.week === 1 && day.role === 'intro' && !day.isRest);
    const week1Pico = days.find((day) => day.week === 3 && day.role === 'pico' && !day.isRest);
    assert.ok(week1Intro && week1Pico);
    assert.match(week1Pico.sessions[1].main, /RPE 7-8|4 × 10/);
    assert.match(week1Intro.sessions[1].main, /RPE 6/);
  });
});

describe('bloques del año de Básico', () => {
  it('usa cabeceras que el parser reconoce', () => {
    const blocks = days.flatMap((day) =>
      day.sessions.flatMap((session) => blocksOf(session.main)),
    );
    for (const block of blocks) {
      assert.ok(isKnownBlockLabel(block.label), `cabecera desconocida: ${block.label}`);
      assert.ok(block.items.length > 0, `bloque sin ejercicios: ${block.label}`);
    }
  });

  it('genera rate ids en el rango propio', () => {
    for (const row of rows) {
      assert.ok(row.aimharderRateId <= GENERATED_RATE_ID_RANGE.to);
      assert.ok(row.aimharderRateId >= GENERATED_RATE_ID_RANGE.from);
      assert.equal(row.scheduleConfig.recurrence, 'once');
    }
    assert.equal(generatedRateId('2026-08-31', 0), generatedRateId('2026-08-31', 0));
  });
});

describe('semana extraída del año', () => {
  it('la semana del 31 de agosto coincide con buildBasicoWeek', () => {
    const week = buildBasicoWeek(WEEK_MONDAY);
    assert.equal(week.days.length, 7);
    assert.equal(week.days[0].date, WEEK_MONDAY);
    assert.equal(week.days.filter((day) => day.isRest).length, 3);
    assert.match(week.days[0].sessions[1].main, /Back squat/);
    assert.match(week.days[0].sessions[1].main, /Deadlift/);
  });
});
