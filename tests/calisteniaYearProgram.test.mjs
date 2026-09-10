import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_YEAR,
  GENERATED_RATE_ID_RANGE,
  MESOCYCLE_WEEKS,
  METCONS,
  PHASES,
  REST_WEEKDAYS,
  TRAINING_WEEKDAYS,
  buildCalisteniaYear,
  describeWeek,
  generatedRateId,
  mondayOf,
  toWorkoutRows,
} from '../scripts/lib/calisteniaYearProgram.mjs';

/** Cabeceras que el parser de la app reconoce como tipo de bloque (lib/workoutContentParser.ts). */
const KNOWN_BLOCK_LABELS = [
  'amrap',
  'emom',
  'for time',
  'rounds for time',
  'tabata',
  'unbroken',
  'ladder',
  'reps for time',
  'movilidad',
  'activacion',
  'fuerza',
  'entrenamiento de tecnica',
  'entrenamiento libre',
  'estaciones de tiempo',
  'estaciones',
  'texto libre',
];

function normalizeLabel(label) {
  return label
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function isKnownBlockLabel(label) {
  const normalized = normalizeLabel(label);
  return KNOWN_BLOCK_LABELS.some((known) => normalized.startsWith(known));
}

function blocksOf(content) {
  return content
    .split(/\n\n+/)
    .map((section) => section.trim())
    .filter(Boolean)
    .map((section) => {
      const lines = section.split('\n');
      const [label, ...headerRest] = lines[0].split('·').map((part) => part.trim());
      return {
        label,
        header: headerRest,
        items: lines.filter((line) => line.startsWith('• ')).map((line) => line.slice(2)),
      };
    });
}

function contentOf(day) {
  return day.sessions
    .map((session) => `${session.main}|${session.core}|${session.cooldown}`)
    .join('||');
}

const days = buildCalisteniaYear();
const rows = toWorkoutRows(days);
const trainingDays = days.filter((day) => !day.isRest);
const restDays = days.filter((day) => day.isRest);

describe('año natural completo', () => {
  it('cubre del 1 de enero al 31 de diciembre sin huecos', () => {
    const dates = [...new Set(rows.map((row) => row.workoutDate))].sort();
    assert.equal(dates[0], `${DEFAULT_YEAR}-01-01`);
    assert.equal(dates.at(-1), `${DEFAULT_YEAR}-12-31`);

    const isLeap =
      (DEFAULT_YEAR % 4 === 0 && DEFAULT_YEAR % 100 !== 0) || DEFAULT_YEAR % 400 === 0;
    assert.equal(dates.length, isLeap ? 366 : 365);

    for (const [index, date] of dates.entries()) {
      const expected = new Date(Date.UTC(DEFAULT_YEAR, 0, 1) + index * 24 * 60 * 60 * 1000);
      assert.equal(date, expected.toISOString().slice(0, 10));
    }
  });

  it('no se sale del año natural', () => {
    for (const row of rows) {
      assert.ok(row.workoutDate.startsWith(`${DEFAULT_YEAR}-`), `fuera del año: ${row.workoutDate}`);
    }
  });

  it('cuenta las semanas de lunes a domingo desde la semana del 1 de enero', () => {
    const firstDay = days[0];
    assert.equal(firstDay.date, `${DEFAULT_YEAR}-01-01`);
    assert.equal(firstDay.week, 1);

    // El 1 de enero de 2026 es jueves, así que la semana 1 arranca incompleta.
    const january1Weekday = (new Date(`${DEFAULT_YEAR}-01-01T12:00:00Z`).getUTCDay() + 6) % 7;
    assert.equal(firstDay.weekdayIndex, january1Weekday);
  });

  it('genera otros años igual de completos', () => {
    for (const year of [2027, 2028]) {
      const other = buildCalisteniaYear({ year });
      const dates = [...new Set(toWorkoutRows(other).map((row) => row.workoutDate))].sort();
      assert.equal(dates[0], `${year}-01-01`);
      assert.equal(dates.at(-1), `${year}-12-31`);
    }
  });
});

describe('mesociclos y fases', () => {
  it('reparte 13 mesociclos entre las cinco fases', () => {
    const mesocycles = new Set(days.map((day) => day.mesocycle));
    assert.equal(mesocycles.size, 13);
    assert.deepEqual(
      PHASES.flatMap((phase) => phase.mesocycles),
      [...mesocycles].sort((left, right) => left - right),
    );
  });

  it('da 4 semanas a cada mesociclo salvo el que cierra el año', () => {
    const lastMesocycle = MESOCYCLE_WEEKS / 4;

    for (const mesocycle of new Set(days.map((day) => day.mesocycle))) {
      const weeks = new Set(days.filter((day) => day.mesocycle === mesocycle).map((day) => day.week));
      if (mesocycle === lastMesocycle) {
        assert.ok(weeks.size >= 4, `el mesociclo ${mesocycle} debe tener 4 semanas o más`);
      } else {
        assert.equal(weeks.size, 4, `el mesociclo ${mesocycle} debe tener 4 semanas`);
      }
    }
  });

  it('cierra cada mesociclo con una semana de descarga', () => {
    for (let week = 1; week <= MESOCYCLE_WEEKS; week += 1) {
      const { weekInMesocycle, role } = describeWeek(week);
      assert.equal(role === 'descarga', weekInMesocycle === 4);
    }
  });

  it('trata las semanas sobrantes del año como descarga extra', () => {
    const extra = describeWeek(MESOCYCLE_WEEKS + 1);
    assert.equal(extra.isExtraWeek, true);
    assert.equal(extra.role, 'descarga');
    assert.equal(extra.mesocycle, MESOCYCLE_WEEKS / 4);

    for (const day of days.filter((entry) => entry.isExtraWeek)) {
      assert.equal(day.role, 'descarga');
    }
  });
});

describe('descansos', () => {
  it('descansa los miércoles y los domingos', () => {
    assert.deepEqual(REST_WEEKDAYS, [2, 6]);
    assert.deepEqual(TRAINING_WEEKDAYS, [0, 1, 3, 4, 5]);

    for (const day of restDays) {
      assert.ok(REST_WEEKDAYS.includes(day.weekdayIndex), `${day.date} no debería descansar`);
    }
    for (const day of trainingDays) {
      assert.ok(TRAINING_WEEKDAYS.includes(day.weekdayIndex), `${day.date} no debería entrenar`);
    }
  });

  it('nunca coloca entrenos en miércoles ni en domingo', () => {
    for (const row of rows) {
      const weekday = (new Date(`${row.workoutDate}T12:00:00Z`).getUTCDay() + 6) % 7;
      if (REST_WEEKDAYS.includes(weekday)) {
        assert.equal(row.scheduleConfig.kind, 'rest', `${row.workoutDate}: ${row.name}`);
      } else {
        assert.notEqual(row.scheduleConfig.kind, 'rest', `${row.workoutDate}: ${row.name}`);
      }
    }
  });

  it('respeta el día de la semana guardado en cada sesión', () => {
    for (const row of rows) {
      const weekday = (new Date(`${row.workoutDate}T12:00:00Z`).getUTCDay() + 6) % 7;
      assert.equal(weekday, row.scheduleConfig.weekdays[0]);
    }
  });

  it('mondayOf retrocede al lunes de la semana', () => {
    assert.equal(mondayOf(new Date('2026-01-01T12:00:00')), '2025-12-29');
    assert.equal(mondayOf(new Date('2026-08-24T12:00:00')), '2026-08-24');
    assert.equal(mondayOf(new Date('2026-08-30T12:00:00')), '2026-08-24');
  });
});

describe('variedad del año', () => {
  it('no repite el contenido de ningún día en todo el año', () => {
    const contents = trainingDays.map(contentOf);
    assert.equal(new Set(contents).size, contents.length);
  });

  it('no repite ninguna semana', () => {
    const byWeek = new Map();
    for (const day of trainingDays) {
      byWeek.set(day.week, [...(byWeek.get(day.week) ?? []), contentOf(day)]);
    }

    const signatures = [...byWeek.values()].map((parts) => parts.join('###'));
    assert.equal(new Set(signatures).size, signatures.length);
  });

  it('cambia el contenido de un mes a otro', () => {
    const byMonth = new Map();
    for (const day of trainingDays) {
      const month = day.date.slice(0, 7);
      byMonth.set(month, [...(byMonth.get(month) ?? []), contentOf(day)]);
    }

    assert.equal(byMonth.size, 12);
    const signatures = [...byMonth.values()].map((parts) => parts.join('###'));
    assert.equal(new Set(signatures).size, signatures.length);
  });

  it('da los cinco patrones de entreno cada semana completa', () => {
    const byWeek = new Map();
    for (const day of trainingDays) {
      byWeek.set(day.week, [...(byWeek.get(day.week) ?? []), day.dayTypeKey]);
    }

    for (const [week, types] of byWeek) {
      assert.equal(new Set(types).size, types.length, `semana ${week} repite patrón`);
      if (types.length === 5) {
        assert.deepEqual(
          [...types].sort(),
          ['legs-core', 'pull-horizontal', 'pull-vertical', 'push-horizontal', 'push-vertical'],
        );
      }
    }
  });
});

describe('sesiones del día', () => {
  it('crea activación, sesión y metcon en cada día de entreno', () => {
    for (const day of trainingDays) {
      assert.deepEqual(
        day.sessions.map((session) => session.kind),
        ['activation', 'session', 'metcon'],
      );
      assert.deepEqual(
        day.sessions.map((session) => session.dayOrder),
        [0, 1, 2],
      );
    }
  });

  it('deja los días de descanso sin contenido', () => {
    for (const day of restDays) {
      assert.equal(day.sessions.length, 1);
      const [session] = day.sessions;
      assert.equal(session.kind, 'rest');
      assert.equal(session.name, 'Día de descanso');
      assert.equal(session.estimatedDuration, 'Descanso');
      assert.equal(`${session.main}${session.core}${session.cooldown}${session.warmup}`, '');
    }
  });

  it('da uno o dos bloques de activación', () => {
    for (const day of trainingDays) {
      const blocks = blocksOf(day.sessions[0].main);
      assert.ok(blocks.length === 1 || blocks.length === 2, `${day.date}: ${blocks.length} bloques`);
      assert.equal(blocks[0].label, 'Movilidad');
      if (blocks.length === 2) assert.equal(blocks[1].label, 'Activación');
      assert.equal(day.role === 'descarga', blocks.length === 1);
    }
  });

  it('separa técnica/skills, fuerza y accesorio en la sesión', () => {
    for (const day of trainingDays) {
      const session = day.sessions[1];
      assert.deepEqual(
        blocksOf(session.main).map((block) => block.label),
        ['Entrenamiento de Técnica', 'Fuerza'],
      );
      assert.deepEqual(
        blocksOf(session.core).map((block) => block.label),
        ['Fuerza'],
      );
      assert.ok(session.cooldown.trim());
    }
  });

  it('deja el metcon en un único bloque con formato conocido', () => {
    for (const day of trainingDays) {
      const blocks = blocksOf(day.sessions[2].main);
      assert.equal(blocks.length, 1);
      assert.ok(isKnownBlockLabel(blocks[0].label), `formato desconocido: ${blocks[0].label}`);
    }
  });

  it('no repite metcon dentro de la misma semana', () => {
    const byWeek = new Map();
    for (const day of trainingDays) {
      byWeek.set(day.week, [...(byWeek.get(day.week) ?? []), day.sessions[2].metconName]);
    }

    for (const [week, names] of byWeek) {
      assert.equal(new Set(names).size, names.length, `semana ${week}: ${names.join(', ')}`);
    }
  });

  it('usa todos los metcons del catálogo a lo largo del año', () => {
    const used = new Set(trainingDays.map((day) => day.sessions[2].metconName));
    assert.equal(used.size, METCONS.length);
  });
});

describe('bloques listos para el parser de la app', () => {
  it('escribe cabeceras conocidas con título y duración', () => {
    for (const row of rows) {
      for (const content of [row.mainPart, row.corePart]) {
        if (!content.trim()) continue;
        for (const block of blocksOf(content)) {
          assert.ok(isKnownBlockLabel(block.label), `cabecera desconocida: ${block.label}`);
          assert.ok(block.header.length > 0, `sin detalle de cabecera: ${block.label}`);
          assert.ok(block.items.length > 0, `bloque vacío: ${block.label}`);
        }
      }
    }
  });

  it('da dosis a cada movimiento y no lo repite dentro del bloque', () => {
    for (const row of rows) {
      for (const content of [row.mainPart, row.corePart]) {
        if (!content.trim()) continue;
        for (const block of blocksOf(content)) {
          const names = block.items.map((item) => item.split(':')[0].trim());
          for (const item of block.items) {
            assert.ok(item.includes(':'), `movimiento sin dosis: ${item}`);
          }
          assert.equal(new Set(names).size, names.length, `movimiento repetido en ${block.label}`);
        }
      }
    }
  });

  it('dosifica isometrías en segundos y repeticiones en series', () => {
    const holdMovements = ['Hollow hold', 'Active hang', 'Tuck front lever', 'Parallette L-sit'];

    for (const row of rows) {
      if (row.name === 'Metcon' || row.name === 'Activación') continue;
      for (const block of blocksOf(`${row.mainPart}\n\n${row.corePart}`)) {
        for (const item of block.items) {
          const [name, dose] = item.split(':').map((part) => part.trim());
          if (holdMovements.includes(name)) {
            assert.match(dose, /^\d+ × \d+ s$/, `${name} debería ir en segundos: ${dose}`);
          }
        }
      }
    }
  });

  it('nombra los ejercicios en inglés y deja las explicaciones en español', () => {
    // Palabras que delatan un nombre de ejercicio sin traducir.
    const spanishInNames = /\b(dominada|fondos|sentadilla|zancada|plancha|remo|elevaci|puente|colgado|rueda|salto|apertura|movilidad|estiramiento|rotaci|c[íi]rculos|deslizamiento|peso muerto|con banda|a una pierna|en anillas)/i;

    for (const row of rows) {
      for (const content of [row.mainPart, row.corePart]) {
        if (!content.trim()) continue;
        for (const block of blocksOf(content)) {
          for (const item of block.items) {
            const name = item.split(':')[0].trim();
            assert.doesNotMatch(name, spanishInNames, `ejercicio sin traducir: ${name}`);
          }
        }
      }
    }
  });

  it('mantiene en español las notas y la vuelta a la calma', () => {
    const sessionRows = rows.filter((row) => row.scheduleConfig.kind === 'session');
    assert.ok(sessionRows.length > 0);

    for (const row of sessionRows) {
      assert.match(row.mainPart, /Trabaja en fresco/);
      assert.match(row.mainPart, /Semana de (introducción|carga|descarga)|Semana pico/);
      assert.match(row.cooldown, /respiración/);
    }
  });
});

describe('persistencia', () => {
  it('genera claves únicas por fecha y hueco del día', () => {
    const keys = rows.map((row) => `${row.workoutDate}|${row.aimharderRateId}`);
    assert.equal(new Set(keys).size, keys.length);
  });

  it('no reutiliza un mismo identificador en dos fechas distintas', () => {
    const byRateId = new Map();
    for (const row of rows) {
      const previous = byRateId.get(row.aimharderRateId);
      assert.ok(
        previous == null || previous === row.workoutDate,
        `${row.aimharderRateId} se repite en ${previous} y ${row.workoutDate}`,
      );
      byRateId.set(row.aimharderRateId, row.workoutDate);
    }
  });

  it('mantiene los identificadores en su propio rango', () => {
    for (const row of rows) {
      assert.ok(
        row.aimharderRateId >= GENERATED_RATE_ID_RANGE.from &&
          row.aimharderRateId <= GENERATED_RATE_ID_RANGE.to,
        `fuera de rango: ${row.aimharderRateId}`,
      );
    }
  });

  it('no choca con los identificadores de la importación de AimHarder', () => {
    assert.ok(GENERATED_RATE_ID_RANGE.to < -1_000_000);
    assert.equal(generatedRateId('2026-01-01', 0), -7_000_101);
    assert.equal(generatedRateId('2026-01-01', 2), -7_200_101);
  });

  it('cabe en el límite de 1.000 filas por consulta de la API de Supabase', () => {
    assert.ok(rows.length < 1000, `${rows.length} filas no caben en una sola consulta`);
  });

  it('guarda el calendario con recurrencia puntual y tipo de sesión', () => {
    for (const row of rows) {
      assert.equal(row.scheduleConfig.recurrence, 'once');
      assert.equal(row.scheduleConfig.startDate, row.workoutDate);
      assert.ok(['activation', 'session', 'metcon', 'rest'].includes(row.scheduleConfig.kind));
      assert.equal(row.scheduleConfig.weekdays.length, 1);
    }
  });
});
