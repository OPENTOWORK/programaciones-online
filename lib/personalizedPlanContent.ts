import { combineMainPartsForSave, hasSessionBlockContent } from '@/lib/sessionBlockSections';
import {
  defaultScheduleForSession,
  formatScheduleSummary,
  normalizeSessionSchedule,
  parseScheduleFromSummaryLabel,
} from '@/lib/sessionSchedule';
import {
  ACTIVATION_SESSION_NAME,
  METCON_SESSION_NAME,
  REST_DAY_SESSION_NAME,
  createEmptySessionDraft,
  type SessionDraft,
  type SessionKind,
} from '@/lib/trainerSessionDraft';
import { isStructuredWorkoutContent } from '@/lib/workoutContentParser';
import type { AthletePlan, Program } from '@/lib/types';

const META_START = '@@plan-meta:v1';
const META_END = '@@/plan-meta';

const SECTION_KEYS = ['warmup', 'main', 'core', 'cooldown'] as const;
const SECTION_MARKERS: Record<(typeof SECTION_KEYS)[number], string> = {
  warmup: '@@WARMUP@@',
  main: '@@MAIN@@',
  core: '@@CORE@@',
  cooldown: '@@COOLDOWN@@',
};

const ALL_MARKERS = Object.values(SECTION_MARKERS);

function extractSection(content: string, marker: string) {
  const start = content.indexOf(marker);
  if (start === -1) return '';

  const contentStart = start + marker.length;
  const otherStarts = ALL_MARKERS.filter((entry) => entry !== marker)
    .map((entry) => content.indexOf(entry, contentStart))
    .filter((index) => index !== -1);

  const end = otherStarts.length > 0 ? Math.min(...otherStarts) : content.length;
  return content.slice(contentStart, end).trim();
}

export function isStructuredPersonalizedPlanContent(content: string) {
  const trimmed = content.trim();
  if (!trimmed) return false;
  return trimmed.includes(META_START) || isStructuredWorkoutContent(trimmed);
}

export function serializePersonalizedPlanContent(draft: SessionDraft, sessionNumber?: number): string {
  const metaLines = [
    `duration=${draft.estimatedDuration.trim() || '60 min'}`,
    `session=${sessionNumber ?? draft.name.match(/(\d+)/)?.[1] ?? '1'}`,
    `sessionName=${draft.name.trim() || 'Sesión 1'}`,
    `schedule=${formatScheduleSummary(draft.schedule)}`,
  ];

  if (draft.kind === 'activation') {
    metaLines.push('kind=activation');
  }

  if (draft.kind === 'metcon') {
    metaLines.push('kind=metcon');
  }

  if (draft.kind === 'rest') {
    metaLines.push('kind=rest');
  }

  if (draft.kind === 'pdf') {
    metaLines.push('kind=pdf');
  }

  if (typeof draft.dayOrder === 'number') {
    metaLines.push(`dayOrder=${draft.dayOrder}`);
  }

  if (draft.schedule.startDate) {
    metaLines.push(`scheduleStart=${draft.schedule.startDate}`);
  }

  const meta = [META_START, ...metaLines, META_END].join('\n');

  const chunks = [meta];
  for (const key of SECTION_KEYS) {
    const value = draft[key].trim();
    if (value) {
      chunks.push(SECTION_MARKERS[key], value);
    }
  }

  return chunks.join('\n\n');
}

export function parsePersonalizedPlanContent(content: string, sessionIndex = 0): SessionDraft {
  const base = createEmptySessionDraft(sessionIndex);
  const trimmed = content.trim();
  if (!trimmed) return base;

  if (!trimmed.includes(META_START)) {
    return {
      ...base,
      main: trimmed,
    };
  }

  const metaEndIndex = trimmed.indexOf(META_END);
  const metaBlock = trimmed.slice(0, metaEndIndex + META_END.length);
  const body = trimmed.slice(metaEndIndex + META_END.length).trim();

  let estimatedDuration = base.estimatedDuration;
  let schedule = base.schedule;
  let sessionName = base.name;
  let kind = base.kind;
  let dayOrder = base.dayOrder;
  let scheduleStart = base.schedule.startDate;

  for (const line of metaBlock.split('\n')) {
    if (line.startsWith('duration=')) {
      estimatedDuration = line.slice('duration='.length).trim() || estimatedDuration;
    }
    if (line.startsWith('sessionName=')) {
      sessionName = line.slice('sessionName='.length).trim() || sessionName;
    }
    if (line.startsWith('kind=')) {
      const value = line.slice('kind='.length).trim();
      if (value === 'activation') kind = 'activation';
      if (value === 'metcon') kind = 'metcon';
      if (value === 'rest') kind = 'rest';
      if (value === 'pdf') kind = 'pdf';
    }
    if (line.startsWith('dayOrder=')) {
      const parsed = Number.parseInt(line.slice('dayOrder='.length).trim(), 10);
      dayOrder = Number.isFinite(parsed) ? parsed : dayOrder;
    }
    if (line.startsWith('schedule=')) {
      const summary = line.slice('schedule='.length).trim();
      schedule = parseScheduleFromSummaryLabel(summary) ?? schedule;
    }
    if (line.startsWith('scheduleStart=')) {
      const value = line.slice('scheduleStart='.length).trim();
      if (value) scheduleStart = value;
    }
  }

  const normalizedSchedule = normalizeSessionSchedule(
    scheduleStart ? { ...schedule, startDate: scheduleStart } : schedule,
    defaultScheduleForSession(sessionIndex),
  );

  const draft: SessionDraft = {
    ...base,
    name: sessionName,
    kind,
    dayOrder,
    estimatedDuration,
    schedule: normalizedSchedule,
    dayLabel: formatScheduleSummary(normalizedSchedule),
    warmup: '',
    main: '',
    metcon: '',
    core: '',
    cooldown: '',
  };

  for (const key of SECTION_KEYS) {
    draft[key] = extractSection(body, SECTION_MARKERS[key]);
  }

  if (!SECTION_KEYS.some((key) => draft[key].trim()) && body.trim()) {
    draft.main = body.trim();
  }

  return draft;
}

/**
 * Sesión cuyo único contenido es el PDF adjunto: en el calendario se muestra como entreno en PDF
 * y el atleta lo consulta abriendo el documento. Si el entrenador le añade bloques deja de serlo.
 */
export function isPdfOnlyPlanSession(
  plan: Pick<AthletePlan, 'pdfFileName'>,
  draft: SessionDraft,
): boolean {
  if (hasSessionBlockContent(draft)) return false;
  return draft.kind === 'pdf' || Boolean(plan.pdfFileName);
}

export function validatePersonalizedPlanDraft(draft: SessionDraft): string | null {
  if (draft.schedule.weekdays.length === 0) {
    return 'Selecciona al menos un día para el plan.';
  }

  return null;
}

export function validatePersonalizedPlanDraftForPublish(draft: SessionDraft): string | null {
  const scheduleError = validatePersonalizedPlanDraft(draft);
  if (scheduleError) return scheduleError;

  if (!hasSessionBlockContent(draft)) {
    return 'Añade al menos un bloque de entrenamiento.';
  }

  return null;
}

export function createPersonalizedPlanPreviewProgram(title: string): Program {
  return {
    id: 'preview-personalized-plan',
    name: title.trim() || 'Plan personalizado',
    category: 'personalized',
    level: 'intermedio',
    duration: 'Por definir',
    goal: 'fuerza',
    sessionsPerWeek: 1,
    status: 'disponible',
    icon: 'personal',
    description: '',
    equipment: [],
    trainingDays: [],
    weeks: [],
  };
}

export function getPersonalizedPlanMainContent(content: string) {
  const draft = parsePersonalizedPlanContent(content);
  return combineMainPartsForSave(draft.main, draft.metcon);
}

export function parseSessionNumberFromPlanContent(content: string, fallback = 1) {
  const match = content.match(/session=(\d+)/);
  if (match) return Number(match[1]);

  const draft = parsePersonalizedPlanContent(content);
  const nameMatch = draft.name.match(/(\d+)/);
  return nameMatch ? Number(nameMatch[1]) : fallback;
}

export function formatSessionSectionTitle(
  sessionNumber?: number,
  sessionName?: string,
  kind?: SessionKind,
) {
  // La activación comparte número con su sesión, así que se distingue por el tipo.
  if (kind === 'activation') return ACTIVATION_SESSION_NAME;
  if (kind === 'metcon') return METCON_SESSION_NAME;
  if (kind === 'rest') return REST_DAY_SESSION_NAME;

  if (sessionNumber && sessionNumber > 0) return `Sesión ${sessionNumber}`;

  const nameMatch = sessionName?.match(/sesi[oó]n\s*(\d+)/i) ?? sessionName?.match(/(\d+)/);
  if (nameMatch) return `Sesión ${nameMatch[1]}`;

  return 'Sesión 1';
}
