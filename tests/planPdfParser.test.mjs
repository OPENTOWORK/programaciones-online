import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const WEEKDAY_ENTRIES = [
  { names: ['lunes'], weekday: 0 },
  { names: ['martes'], weekday: 1 },
  { names: ['miércoles', 'miercoles'], weekday: 2 },
  { names: ['jueves'], weekday: 3 },
  { names: ['viernes'], weekday: 4 },
  { names: ['sábado', 'sabado'], weekday: 5 },
  { names: ['domingo'], weekday: 6 },
];

const DAY_HEADER_PATTERN = new RegExp(
  `(?:^|[\\n\\r]|\\s)(${WEEKDAY_ENTRIES.flatMap((entry) => entry.names).join('|')})(?=\\s|:|$)`,
  'gi',
);

function weekdayFromName(name) {
  const normalized = name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

  for (const entry of WEEKDAY_ENTRIES) {
    if (entry.names.some((candidate) => candidate.normalize('NFD').replace(/\p{Diacritic}/gu, '') === normalized)) {
      return entry.weekday;
    }
  }
  return null;
}

function parseWeeklyPdfText(text, { pageTexts = [], targetWeekdays = [] } = {}) {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\f/g, '\n\n').trim();
  const matches = [...normalized.matchAll(DAY_HEADER_PATTERN)];
  if (matches.length > 0) {
    const days = [];
    for (let index = 0; index < matches.length; index += 1) {
      const match = matches[index];
      const weekday = weekdayFromName(match[1]);
      if (weekday == null) continue;
      const contentStart = (match.index ?? 0) + match[0].length;
      const contentEnd = index + 1 < matches.length ? (matches[index + 1].index ?? normalized.length) : normalized.length;
      const body = normalized.slice(contentStart, contentEnd).trim();
      if (!body) continue;
      days.push({ weekday, text: body });
    }
    return days.sort((left, right) => left.weekday - right.weekday);
  }

  const pageDays = pageTexts
    .map((pageText) => pageText.trim())
    .filter(Boolean)
    .map((pageText, index) => ({
      weekday: targetWeekdays[index] ?? index,
      text: pageText,
    }));

  return pageDays.slice(0, targetWeekdays.length || pageDays.length);
}

describe('parseWeeklyPdfText', () => {
  it('splits Spanish weekday sections', () => {
    const text = `
LUNES
Calentamiento
Back squat 5x5

MARTES
Row 500m

MIÉRCOLES
Caminata 30 min
`;

    const days = parseWeeklyPdfText(text);
    assert.equal(days.length, 3);
    assert.equal(days[0].weekday, 0);
    assert.match(days[0].text, /Back squat/i);
    assert.equal(days[1].weekday, 1);
    assert.equal(days[2].weekday, 2);
  });

  it('splits inline weekday headers from pdf.js text', () => {
    const text = 'LUNES Calentamiento Back squat 5x5 MARTES Row 500m MIÉRCOLES Caminata 30 min';
    const days = parseWeeklyPdfText(text);
    assert.equal(days.length, 3);
    assert.match(days[0].text, /Back squat/i);
    assert.match(days[1].text, /Row 500m/i);
    assert.match(days[2].text, /Caminata/i);
  });

  it('maps bloques por página a lunes, martes, jueves y viernes', () => {
    const days = parseWeeklyPdfText('', {
      pageTexts: ['Bloque lunes', 'Bloque martes', 'Bloque jueves', 'Bloque viernes'],
      targetWeekdays: [0, 1, 3, 4],
    });
    assert.equal(days.length, 4);
    assert.deepEqual(
      days.map((day) => day.weekday),
      [0, 1, 3, 4],
    );
    assert.match(days[3].text, /viernes/i);
  });
});
