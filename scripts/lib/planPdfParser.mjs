const WEEKDAY_ENTRIES = [
  { names: ['lunes'], weekday: 0 },
  { names: ['martes'], weekday: 1 },
  { names: ['miércoles', 'miercoles'], weekday: 2 },
  { names: ['jueves'], weekday: 3 },
  { names: ['viernes'], weekday: 4 },
  { names: ['sábado', 'sabado'], weekday: 5 },
  { names: ['domingo'], weekday: 6 },
];

const WEEKDAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const DAY_HEADER_PATTERN = new RegExp(
  `(?:^|[\\n\\r]|\\s)(${WEEKDAY_ENTRIES.flatMap((entry) => entry.names).join('|')})(?=\\s|:|$)`,
  'gi',
);

const NUMBERED_DAY_PATTERN = /(?:^|[\n\r]|\s)((?:D[IÍ]A|DAY)\s*\d+)(?=\s|:|$)/gi;

function normalizePdfText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\f/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

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

function capitalizeDay(label) {
  const trimmed = label.trim();
  if (!trimmed) return 'Sesión';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

function splitByPattern(normalized, pattern) {
  const matches = [...normalized.matchAll(pattern)];
  if (matches.length === 0) return [];

  const days = [];
  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const header = match[1];
    const contentStart = (match.index ?? 0) + match[0].length;
    const contentEnd = index + 1 < matches.length ? (matches[index + 1].index ?? normalized.length) : normalized.length;
    const body = normalized.slice(contentStart, contentEnd).trim();
    if (!body) continue;
    days.push({ header, body });
  }
  return days;
}

export function assignParsedDaysToWeekdays(days, targetWeekdays = []) {
  if (!targetWeekdays.length) return days;
  return days.slice(0, targetWeekdays.length).map((day, index) => {
    const weekday = targetWeekdays[index];
    return {
      ...day,
      weekday,
      label: WEEKDAY_LABELS[weekday] ?? day.label,
    };
  });
}

export function parseWeeklyPdfText(text, { pageTexts = [], targetWeekdays = [] } = {}) {
  const normalized = normalizePdfText(text);
  if (!normalized && pageTexts.length === 0) return [];

  const weekdayDays = splitByPattern(normalized, DAY_HEADER_PATTERN).flatMap(({ header, body }) => {
    const weekday = weekdayFromName(header);
    if (weekday == null) return [];
    return [{ weekday, label: capitalizeDay(header), text: body }];
  });
  if (weekdayDays.length > 0) {
    return assignParsedDaysToWeekdays(
      weekdayDays.sort((left, right) => left.weekday - right.weekday),
      targetWeekdays,
    );
  }

  const numberedDays = splitByPattern(normalized, NUMBERED_DAY_PATTERN).map(({ header, body }, index) => ({
    weekday: targetWeekdays[index] ?? index,
    label: capitalizeDay(header),
    text: body,
  }));
  if (numberedDays.length > 0) {
    return assignParsedDaysToWeekdays(numberedDays, targetWeekdays);
  }

  const pageDays = pageTexts
    .map((pageText) => pageText.trim())
    .filter(Boolean)
    .map((pageText, index) => ({
      weekday: targetWeekdays[index] ?? index,
      label: `Día ${index + 1}`,
      text: pageText,
    }));

  return assignParsedDaysToWeekdays(pageDays, targetWeekdays);
}

export async function extractPdfTextFromBuffer(buffer) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const document = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pageTexts = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (pageText) pageTexts.push(pageText);
  }

  return {
    text: pageTexts.join('\n\n'),
    pageTexts,
  };
}
