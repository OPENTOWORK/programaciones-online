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
  buildAthxYear,
  describeWeek,
  toWorkoutRows,
} from '../scripts/lib/athxYearProgram.mjs';

const KNOWN_BLOCK_LABELS = ['amrap', 'emom', 'for time', 'movilidad', 'activacion', 'fuerza', 'tecnica'];

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
      const [label] = section.split('\n')[0].split('·').map((part) => part.trim());
      return {
        label,
        items: section.split('\n').filter((line) => line.startsWith('• ')).map((line) => line.slice(2)),
      };
    });
}

const days = buildAthxYear();
const rows = toWorkoutRows(days);

describe('año ATHX', () => {
  it('cubre todo el año natural', () => {
    const dates = [...new Set(rows.map((row) => row.workoutDate))].sort();
    assert.equal(dates[0], `${DEFAULT_YEAR}-01-01`);
    assert.equal(dates.at(-1), `${DEFAULT_YEAR}-12-31`);
    assert.equal(dates.length, 365);
  });

  it('entrena lun, mié, jue y sáb con descansos repartidos', () => {
    for (const day of days) {
      if (day.isRest) {
        assert.ok(REST_WEEKDAYS.includes(day.weekdayIndex));
        assert.equal(day.sessions[0].kind, 'rest');
        continue;
      }
      assert.ok(TRAINING_WEEKDAYS.includes(day.weekdayIndex));
      assert.deepEqual(
        day.sessions.map((session) => session.kind),
        ['activation', 'session'],
      );
    }
  });

  it('no agrupa tres descansos seguidos en ninguna semana', () => {
    for (let week = 1; week <= MESOCYCLE_WEEKS; week += 1) {
      const weekDays = days.filter((day) => day.week === week).sort((a, b) => a.weekdayIndex - b.weekdayIndex);
      let streak = 0;
      for (const day of weekDays) {
        if (day.isRest) {
          streak += 1;
          assert.ok(streak < 3, `semana ${week} tiene 3 descansos seguidos`);
        } else {
          streak = 0;
        }
      }
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

describe('bloques ATHX', () => {
  it('parser reconoce todas las cabeceras', () => {
    const blocks = days.flatMap((day) =>
      day.sessions.flatMap((session) => blocksOf(`${session.main}\n\n${session.core}`)),
    );
    for (const block of blocks) {
      assert.ok(isKnownBlockLabel(block.label), block.label);
      assert.ok(block.items.length > 0, block.label);
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

describe('variedad ATHX', () => {
  const trainingDays = days.filter((day) => !day.isRest);

  it('rota las activaciones de cada día de entreno', () => {
    for (const weekday of TRAINING_WEEKDAYS) {
      const activations = trainingDays
        .filter((day) => day.weekdayIndex === weekday)
        .map((day) => day.sessions[0].main);
      const unique = new Set(activations);
      assert.ok(
        unique.size >= 6,
        `weekday ${weekday} solo tiene ${unique.size} activaciones distintas`,
      );
      for (let index = 1; index < activations.length; index += 1) {
        assert.notEqual(
          activations[index],
          activations[index - 1],
          `weekday ${weekday} repite activación en semanas consecutivas`,
        );
      }
    }
  });

  it('no clona el entreno principal semana tras semana', () => {
    for (const weekday of TRAINING_WEEKDAYS) {
      const mains = trainingDays
        .filter((day) => day.weekdayIndex === weekday)
        .map((day) => day.sessions[1].main);
      const unique = new Set(mains);
      assert.ok(unique.size >= 20, `weekday ${weekday} solo tiene ${unique.size} sesiones distintas`);
    }
  });
});

describe('semana del 31 de agosto', () => {
  it('ca en mesociclo de engine con entreno los 4 días', () => {
    const weekDays = days.filter((day) => day.date >= '2026-08-31' && day.date <= '2026-09-06');
    assert.equal(weekDays.length, 7);
    assert.equal(weekDays.filter((day) => day.isRest).length, 3);
    const training = weekDays.filter((day) => !day.isRest);
    assert.equal(training.length, 4);
    assert.ok(training.some((day) => day.weekdayLabel === 'Lunes' && day.sessions[1].main.includes('Shoulder press')));
    assert.ok(training.some((day) => day.weekdayLabel === 'Miércoles' && day.sessions[1].main.includes('Back squat')));
  });
});
