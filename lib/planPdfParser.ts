import { Platform } from 'react-native';

import { extractPdfDocument } from '@/lib/pdfjsDocument';
import type { WeekdayIndex } from '@/lib/sessionSchedule';

export interface ParsedPdfDay {
  weekday: WeekdayIndex;
  label: string;
  text: string;
}

const WEEKDAY_ENTRIES: Array<{ names: string[]; weekday: WeekdayIndex }> = [
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

function normalizePdfText(text: string) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\f/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function weekdayFromName(name: string): WeekdayIndex | null {
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

function capitalizeDay(label: string) {
  const trimmed = label.trim();
  if (!trimmed) return 'Sesión';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

function splitByPattern(normalized: string, pattern: RegExp) {
  const matches = [...normalized.matchAll(pattern)];
  if (matches.length === 0) return [];

  const days: Array<{ header: string; body: string }> = [];

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

export function assignParsedDaysToWeekdays(
  days: ParsedPdfDay[],
  targetWeekdays: WeekdayIndex[] = [],
): ParsedPdfDay[] {
  if (targetWeekdays.length === 0) return days;

  return days.slice(0, targetWeekdays.length).map((day, index) => {
    const weekday = targetWeekdays[index];
    return {
      ...day,
      weekday,
      label: WEEKDAY_LABELS[weekday] ?? day.label,
    };
  });
}

/** Parte el texto extraído de un PDF semanal en bloques por día de la semana. */
export function parseWeeklyPdfText(
  text: string,
  options: { pageTexts?: string[]; targetWeekdays?: WeekdayIndex[] } = {},
): ParsedPdfDay[] {
  const normalized = normalizePdfText(text);
  const { pageTexts = [], targetWeekdays = [] } = options;
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
    weekday: targetWeekdays[index] ?? (index as WeekdayIndex),
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
      weekday: targetWeekdays[index] ?? (index as WeekdayIndex),
      label: `Día ${index + 1}`,
      text: pageText,
    }));

  return assignParsedDaysToWeekdays(pageDays, targetWeekdays);
}

export async function extractPdfTextFromBuffer(buffer: ArrayBuffer) {
  return extractPdfDocument(buffer);
}

/** Lee el texto de un PDF seleccionado en el dispositivo. */
export async function extractPdfTextFromUri(uri: string) {
  if (Platform.OS !== 'web') {
    throw new Error('La importación automática del PDF solo está disponible en la versión web del panel.');
  }

  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error('No se pudo leer el PDF seleccionado');
  }

  const buffer = await response.arrayBuffer();
  return extractPdfDocument(buffer);
}
