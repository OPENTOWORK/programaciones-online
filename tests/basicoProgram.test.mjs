import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  WEEK_MONDAY,
  buildBasicoWeek,
  toWorkoutRows,
} from '../scripts/lib/basicoProgram.mjs';

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
  'tecnica',
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

const week = buildBasicoWeek(WEEK_MONDAY);
const rows = toWorkoutRows(week);
const blocks = week.days.flatMap((day) =>
  day.sessions.flatMap((session) =>
    blocksOf(session.main).map((block) => ({
      ...block,
      date: day.date,
      session: session.name,
      kind: session.kind,
    })),
  ),
);

describe('semana de Básico', () => {
  it('cubre lunes a domingo empezando el 31 de agosto', () => {
    assert.equal(week.days.length, 7);
    assert.equal(week.days[0].date, '2026-08-31');
    assert.equal(week.sunday, '2026-09-06');
    assert.equal(week.days.filter((day) => day.isRest).length, 3);
  });

  it('rechaza fechas que no son lunes', () => {
    assert.throws(() => buildBasicoWeek('2026-09-01'), /lunes/);
  });

  it('crea activación, sesión y extra en cada día de entreno', () => {
    for (const day of week.days) {
      if (day.isRest) {
        assert.equal(day.sessions.length, 1);
        assert.equal(day.sessions[0].kind, 'rest');
        continue;
      }

      assert.deepEqual(
        day.sessions.map((session) => session.kind),
        ['activation', 'session', 'metcon'],
        `${day.date} no tiene activación + sesión + extra`,
      );
      assert.equal(day.sessions[0].name, 'Activación');
    }
  });
});

describe('bloques estructurados', () => {
  it('usa siempre una cabecera que el parser reconoce', () => {
    for (const block of blocks) {
      assert.ok(
        isKnownBlockLabel(block.label),
        `cabecera desconocida "${block.label}" en ${block.date} (${block.session})`,
      );
    }
  });

  it('no deja nada como texto libre', () => {
    for (const block of blocks) {
      assert.notEqual(
        normalizeLabel(block.label),
        'texto libre',
        `bloque de texto libre en ${block.date} (${block.session})`,
      );
    }
  });

  it('lista ejercicios en todos los bloques para poder colgarles vídeo', () => {
    for (const block of blocks) {
      assert.ok(
        block.items.length > 0,
        `bloque sin ejercicios "${block.label}" en ${block.date} (${block.session})`,
      );
    }
  });

  it('escribe cada ejercicio como «Nombre: prescripción»', () => {
    for (const block of blocks) {
      for (const item of block.items) {
        assert.match(
          item,
          /^[^:]+: .+$/,
          `ejercicio sin prescripción "${item}" en ${block.date} (${block.session})`,
        );
      }
    }
  });

  it('deja las instrucciones en una sola línea sin separadores de cabecera', () => {
    for (const block of blocks) {
      assert.ok(
        block.notes.length <= 1,
        `más de una línea de instrucciones en ${block.date} (${block.session})`,
      );
      for (const note of block.notes) {
        assert.doesNotMatch(
          note,
          /·/,
          `las instrucciones no pueden llevar «·»: "${note}" en ${block.date}`,
        );
      }
    }
  });

  it('genera filas con recurrencia puntual y rate ids propios', () => {
    assert.ok(rows.length >= 15);
    for (const row of rows) {
      assert.equal(row.scheduleConfig.recurrence, 'once');
      assert.ok(row.aimharderRateId < 0);
    }
  });
});
