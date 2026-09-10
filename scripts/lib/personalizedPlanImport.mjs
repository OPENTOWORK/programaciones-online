import { BLOCK, block, qtyItem, setsItem } from './workoutBlockHelpers.mjs';

const META_START = '@@plan-meta:v1';
const META_END = '@@/plan-meta';
const SECTION_MARKERS = {
  warmup: '@@WARMUP@@',
  main: '@@MAIN@@',
  core: '@@CORE@@',
  cooldown: '@@COOLDOWN@@',
};

const WEEKDAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export function formatScheduleSummary(schedule) {
  const dayNames = (schedule.weekdays ?? [])
    .map((index) => WEEKDAY_LABELS[index])
    .filter(Boolean)
    .join(', ');
  const recurrence =
    schedule.recurrence === 'once'
      ? 'Una sola vez'
      : schedule.recurrence === 'weekly'
        ? 'Cada semana'
        : 'Cada semana';
  return [dayNames || 'Sin día', recurrence].filter(Boolean).join(' · ');
}

export function toLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function serializePersonalizedPlanContent(draft, sessionNumber) {
  const metaLines = [
    `duration=${draft.estimatedDuration.trim() || '60 min'}`,
    `session=${sessionNumber ?? draft.name.match(/(\d+)/)?.[1] ?? '1'}`,
    `sessionName=${draft.name.trim() || 'Sesión 1'}`,
    `schedule=${formatScheduleSummary(draft.schedule)}`,
  ];

  if (draft.schedule?.startDate) {
    metaLines.push(`scheduleStart=${draft.schedule.startDate}`);
  }

  const meta = [META_START, ...metaLines, META_END].join('\n');
  const chunks = [meta];
  if (draft.main?.trim()) {
    chunks.push(SECTION_MARKERS.main, draft.main.trim());
  }
  return chunks.join('\n\n');
}

export function serializeFreeTextBlock(text) {
  return text.trim();
}

export function createEmptySessionDraft(sessionIndex = 0) {
  return {
    name: `Sesión ${sessionIndex + 1}`,
    estimatedDuration: '60 min',
    dayLabel: '',
    warmup: '',
    main: '',
    metcon: '',
    core: '',
    cooldown: '',
    schedule: { weekdays: [0], recurrence: 'weekly', startDate: toLocalDateString(new Date()) },
  };
}

export { WEEKDAY_LABELS };
