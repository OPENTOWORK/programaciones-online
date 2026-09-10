import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  PROGRAM_START_MONDAY,
  TOTAL_WEEKS,
  buildCrosstrainingWeek,
  mondayForWeekNumber,
} from '../scripts/lib/crosstrainingProgram.mjs';

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

function allBlocks() {
  const blocks = [];

  for (let week = 1; week <= TOTAL_WEEKS; week += 1) {
    const built = buildCrosstrainingWeek(mondayForWeekNumber(week));
    for (const day of built.days) {
      for (const session of day.sessions) {
        for (const block of blocksOf(session.main)) {
          blocks.push({ ...block, week, date: day.date, session: session.name });
        }
      }
    }
  }

  return blocks;
}

const blocks = allBlocks();

describe('semana de Crosstraining', () => {
  it('cubre lunes a domingo con descanso jueves y domingo vacío', () => {
    const { days } = buildCrosstrainingWeek(PROGRAM_START_MONDAY);
    assert.equal(days.length, 7);
    assert.equal(days[0].date, PROGRAM_START_MONDAY);
    assert.equal(days.filter((day) => day.isRest).length, 2);
    const sunday = days.find((day) => day.weekdayIndex === 6);
    assert.ok(sunday?.isRest);
    assert.equal(sunday?.sessions[0].name, 'Día de descanso');
    assert.equal(sunday?.sessions[0].main, '');
  });

  it('rechaza fechas que no son lunes', () => {
    assert.throws(() => buildCrosstrainingWeek('2026-09-08'), /lunes/);
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
        if (item === 'Descanso') continue;
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

  it('no mete separadores dentro del título ni del tiempo', () => {
    for (const block of blocks) {
      assert.ok(
        block.headerParts.length <= 3,
        `cabecera con demasiadas partes "${block.label}" en ${block.date} (${block.session})`,
      );
    }
  });
});
