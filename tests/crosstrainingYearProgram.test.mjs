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
  buildCrosstrainingYear,
  describeWeek,
  toWorkoutRows,
} from '../scripts/lib/crosstrainingYearProgram.mjs';

const KNOWN_BLOCK_LABELS = [
  'amrap',
  'emom',
  'for time',
  'rounds for time',
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
      const [label, ...headerRest] = lines[0].split('·').map((part) => part.trim());
      const body = lines.slice(1);
      return {
        label,
        headerParts: headerRest,
        notes: body.filter((line) => !line.startsWith('• ')),
        items: body.filter((line) => line.startsWith('• ')).map((line) => line.slice(2)),
      };
    });
}

const days = buildCrosstrainingYear();
const rows = toWorkoutRows(days);

describe('año Crosstraining', () => {
  it('cubre del 1 de enero al 31 de diciembre', () => {
    const dates = [...new Set(rows.map((row) => row.workoutDate))].sort();
    assert.equal(dates[0], `${DEFAULT_YEAR}-01-01`);
    assert.equal(dates.at(-1), `${DEFAULT_YEAR}-12-31`);
    assert.equal(dates.length, 365);
  });

  it('entrena lun, mar, mié, vie y sáb', () => {
    for (const day of days) {
      if (day.isRest) {
        assert.ok(REST_WEEKDAYS.includes(day.weekdayIndex), `${day.date} debería ser descanso`);
        assert.equal(day.sessions[0].kind, 'rest');
        continue;
      }
      assert.ok(TRAINING_WEEKDAYS.includes(day.weekdayIndex), `${day.date} debería entrenar`);
      assert.equal(day.sessions.length, 1);
      assert.equal(day.sessions[0].kind, 'session');
      assert.match(day.sessions[0].name, /BEAST MODE/);
    }
  });

  it('tiene 13 mesociclos con roles de semana', () => {
    for (let week = 1; week <= MESOCYCLE_WEEKS; week += 1) {
      const info = describeWeek(week);
      assert.ok(WEEK_ROLES.includes(info.role));
      assert.ok(PHASES.some((phase) => phase.key === info.phase.key));
    }
  });
});

describe('semana del 7 al 13 de septiembre', () => {
  it('mantiene el formato BEAST MODE con descanso jueves y domingo vacío', () => {
    const weekDays = days.filter((day) => day.date >= '2026-09-07' && day.date <= '2026-09-13');
    assert.equal(weekDays.length, 7);
    assert.equal(weekDays[0].weekdayLabel, 'Lunes');
    assert.equal(weekDays.filter((day) => day.isRest).length, 2);
    assert.equal(weekDays[3].weekdayLabel, 'Jueves');
    assert.ok(weekDays[3].isRest);
    assert.equal(weekDays[6].weekdayLabel, 'Domingo');
    assert.ok(weekDays[6].isRest);
    assert.equal(weekDays[6].sessions[0].name, 'Día de descanso');
    assert.equal(weekDays[6].sessions[0].main, '');

    const monday = weekDays[0].sessions[0].main;
    assert.match(monday, /A\) ACTIVACIÓN/);
    assert.match(monday, /B\) HALTERO-HIPERTRO BACK SQUAT/);
    assert.match(monday, /F\) WODCITO PIEZA 1/);
    assert.match(monday, /G\) WODCITO PIEZA 2/);
  });
});

describe('bloques Crosstraining', () => {
  const blocks = days.flatMap((day) =>
    day.sessions.flatMap((session) => blocksOf(session.main)),
  );

  it('usa cabeceras que el parser reconoce', () => {
    for (const block of blocks) {
      assert.ok(
        isKnownBlockLabel(block.label),
        `cabecera desconocida "${block.label}"`,
      );
    }
  });

  it('lista ejercicios en todos los bloques', () => {
    for (const block of blocks) {
      assert.ok(block.items.length > 0, `bloque sin ejercicios "${block.label}"`);
    }
  });

  it('escribe cada ejercicio como «Nombre: prescripción»', () => {
    for (const block of blocks) {
      for (const item of block.items) {
        if (item === 'Descanso') continue;
        assert.match(item, /^[^:]+: .+$/, `ejercicio sin prescripción "${item}"`);
      }
    }
  });

  it('deja las instrucciones en una sola línea sin ·', () => {
    for (const block of blocks) {
      assert.ok(block.notes.length <= 1);
      for (const note of block.notes) {
        assert.doesNotMatch(note, /·/);
      }
    }
  });

  it('rate ids en rango propio', () => {
    for (const row of rows) {
      assert.ok(row.aimharderRateId >= GENERATED_RATE_ID_RANGE.from);
      assert.ok(row.aimharderRateId <= GENERATED_RATE_ID_RANGE.to);
      assert.equal(row.scheduleConfig.recurrence, 'once');
    }
  });
});

describe('variedad Crosstraining', () => {
  const trainingDays = days.filter((day) => !day.isRest);

  it('no clona el entreno semana tras semana', () => {
    for (const weekday of TRAINING_WEEKDAYS) {
      const mains = trainingDays
        .filter((day) => day.weekdayIndex === weekday)
        .map((day) => day.sessions[0].main);
      const unique = new Set(mains);
      assert.ok(unique.size >= 20, `weekday ${weekday} solo tiene ${unique.size} sesiones distintas`);
      for (let index = 1; index < mains.length; index += 1) {
        assert.notEqual(mains[index], mains[index - 1]);
      }
    }
  });
});
