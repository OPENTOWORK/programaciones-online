import { addDays } from '@/hooks/useGymData';
import { enrichStructuredWorkoutContent, resolveExerciseVideoCatalog } from '@/lib/attachExerciseVideos';
import { pinCatalogSessionToDate } from '@/lib/catalogProgramCalendar';
import { boardLinesToSessionDraft, isHyroxProgram } from '@/lib/hypeBoardSessionDraft';
import { hypeBoardDateRange } from '@/lib/hypeGymTrainingBoard';
import type { GymClassType, GymProgramLink } from '@/lib/gymTypes';
import {
  gymDateKey,
  gymSessionBoardText,
  HYPE_PROGRAM_COLORS,
  programForGymClassType,
  type GymTrainingSession,
} from '@/lib/gymTraining';
import { createEmptySessionDraft, type SessionDraft } from '@/lib/trainerSessionDraft';
import { isStructuredWorkoutContent } from '@/lib/workoutContentParser';
import {
  formatBlockItemLineForDisplay,
  getBlockTypeConfig,
  parseWorkoutBlocksFromText,
} from '@/lib/workoutBlockBuilder';
import type { Program } from '@/lib/types';

export const HIDDEN_TRAINING_LABEL_PREFIX = '__hidden__:';

export type GymTrainingManageSource = 'link' | 'board' | 'catalog';

export interface GymTrainingManageItem {
  id: string;
  source: GymTrainingManageSource;
  sourceSessionId?: string;
  programId: string;
  programName: string;
  classTypeId?: string;
  classTypeName?: string;
  classTypeColor?: string;
  name: string;
  body?: string;
  dateKey: string;
  publishedDate?: string;
  publishedTime?: string;
  color: string;
  link?: GymProgramLink;
}

export function trainingManageRange(hypeOnly: boolean) {
  const boardRange = hypeBoardDateRange();
  if (hypeOnly && boardRange) return boardRange;

  const today = new Date();
  return {
    from: gymDateKey(addDays(today, -14)),
    to: gymDateKey(addDays(today, 56)),
  };
}

export function isHiddenProgramLink(link: Pick<GymProgramLink, 'label'>) {
  return link.label?.startsWith(HIDDEN_TRAINING_LABEL_PREFIX) ?? false;
}

export function hiddenTrainingSessionKey(link: Pick<GymProgramLink, 'label'>) {
  if (!isHiddenProgramLink(link) || !link.label) return undefined;
  return link.label.slice(HIDDEN_TRAINING_LABEL_PREFIX.length);
}

function normalizeProgramName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase();
}

function sessionMergeKey(dateKey: string, programName: string) {
  return `${dateKey}:${normalizeProgramName(programName)}`;
}

function resolveClassType(
  programName: string,
  programId: string,
  classTypes: readonly GymClassType[],
  programs: readonly Program[],
) {
  const byProgram = classTypes.find((type) => {
    const program = programForGymClassType(type.name, programs);
    return program?.id === programId || normalizeProgramName(type.name) === normalizeProgramName(programName);
  });
  if (byProgram) return byProgram;

  return classTypes.find(
    (type) => normalizeProgramName(type.name) === normalizeProgramName(programName),
  );
}

function sessionDraftFromTrainingContent(
  name: string,
  body?: string,
  dateKey?: string,
  options?: { programName?: string; source?: GymTrainingManageSource },
): SessionDraft {
  const trimmed = body?.trim() ?? '';
  if (options?.source === 'board' && trimmed && !isStructuredWorkoutContent(trimmed) && options.programName) {
    const rawLines = trimmed.split(/\r?\n/);
    return boardLinesToSessionDraft(name, rawLines, options.programName, dateKey);
  }

  const draft = createEmptySessionDraft(0);
  draft.name = name;
  draft.main = options?.programName && !isHyroxProgram(options.programName)
    ? enrichStructuredWorkoutContent(trimmed)
    : trimmed;
  if (dateKey) {
    const date = new Date(`${dateKey}T12:00:00`);
    if (!Number.isNaN(date.getTime())) {
      return pinCatalogSessionToDate(draft, date);
    }
  }
  return draft;
}

function enrichSessionDraft(draft: SessionDraft, programName?: string) {
  if (programName && isHyroxProgram(programName)) return draft;

  const catalog = resolveExerciseVideoCatalog();
  const enrichPart = (value: string) => enrichStructuredWorkoutContent(value, catalog);

  return {
    ...draft,
    warmup: enrichPart(draft.warmup),
    main: enrichPart(draft.main),
    metcon: enrichPart(draft.metcon),
    core: enrichPart(draft.core),
    cooldown: enrichPart(draft.cooldown),
  };
}

function bodyFromSessionDraft(draft?: SessionDraft, programName?: string) {
  if (!draft) return undefined;
  const enriched = enrichSessionDraft(draft, programName);
  const parts = [enriched.warmup, enriched.main, enriched.metcon, enriched.core, enriched.cooldown]
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts.join('\n\n') : undefined;
}

export function linkToTrainingSession(link: GymProgramLink): GymTrainingSession {
  const name = link.sessionDraft?.name ?? link.label ?? link.classTypeName ?? link.programName ?? 'Entrenamiento';
  const body = bodyFromSessionDraft(link.sessionDraft, link.programName);
  return {
    id: link.id,
    programId: link.programId,
    programName: link.programName ?? link.label ?? 'Entrenamiento',
    name,
    body,
    dateKey: link.scheduledDate ?? '',
    color: link.classTypeColor ?? HYPE_PROGRAM_COLORS[link.programName ?? ''] ?? '#C4C4C4',
  };
}

function manageItemFromSession(
  session: GymTrainingSession,
  source: GymTrainingManageSource,
  classTypes: readonly GymClassType[],
  programs: readonly Program[],
): GymTrainingManageItem {
  const classType = resolveClassType(session.programName, session.programId, classTypes, programs);
  const body =
    session.body && !isHyroxProgram(session.programName)
      ? enrichStructuredWorkoutContent(session.body)
      : session.body;
  return {
    id: session.id,
    source,
    sourceSessionId: session.id,
    programId: session.programId,
    programName: session.programName,
    classTypeId: classType?.id,
    classTypeName: classType?.name,
    classTypeColor: classType?.color,
    name: session.name,
    body,
    dateKey: session.dateKey,
    color: session.color,
  };
}

function manageItemFromLink(link: GymProgramLink): GymTrainingManageItem {
  const session = linkToTrainingSession(link);
  return {
    id: link.id,
    source: 'link',
    programId: link.programId,
    programName: link.programName ?? session.programName,
    classTypeId: link.classTypeId,
    classTypeName: link.classTypeName,
    classTypeColor: link.classTypeColor,
    name: session.name,
    body: session.body,
    dateKey: link.scheduledDate ?? session.dateKey,
    publishedDate: link.publishedDate,
    publishedTime: link.publishedTime,
    color: session.color,
    link,
  };
}

export function mergeGymTrainingItems(
  sessions: readonly GymTrainingSession[],
  links: readonly GymProgramLink[],
  classTypes: readonly GymClassType[],
  programs: readonly Program[],
): GymTrainingManageItem[] {
  const hidden = new Set(
    links.map((link) => hiddenTrainingSessionKey(link)).filter((value): value is string => Boolean(value)),
  );

  const linkItems = links
    .filter((link) => !isHiddenProgramLink(link) && link.scheduledDate)
    .map((link) => manageItemFromLink(link));

  const overrideKeys = new Set(
    linkItems.map((item) => sessionMergeKey(item.dateKey, item.programName)),
  );

  const sessionItems = sessions
    .filter((session) => !hidden.has(session.id))
    .filter((session) => !overrideKeys.has(sessionMergeKey(session.dateKey, session.programName)))
    .map((session) =>
      manageItemFromSession(
        session,
        session.id.startsWith('hype-board-') ? 'board' : 'catalog',
        classTypes,
        programs,
      ),
    );

  return [...sessionItems, ...linkItems].sort((left, right) => {
    const byDate = left.dateKey.localeCompare(right.dateKey);
    if (byDate !== 0) return byDate;
    return left.programName.localeCompare(right.programName, 'es');
  });
}

function enrichTrainingSession(session: GymTrainingSession): GymTrainingSession {
  if (!session.body || isHyroxProgram(session.programName)) return session;
  const body = enrichStructuredWorkoutContent(session.body);
  if (body === session.body) return session;
  return { ...session, body };
}

export function mergeSessionsWithProgramLinks(
  sessions: readonly GymTrainingSession[],
  links: readonly GymProgramLink[],
): GymTrainingSession[] {
  const hidden = new Set(
    links.map((link) => hiddenTrainingSessionKey(link)).filter((value): value is string => Boolean(value)),
  );

  const linkSessions = links
    .filter((link) => !isHiddenProgramLink(link) && link.scheduledDate)
    .map((link) => linkToTrainingSession(link));

  const overrideKeys = new Set(
    linkSessions.map((session) => sessionMergeKey(session.dateKey, session.programName)),
  );

  const kept = sessions
    .filter(
      (session) =>
        !hidden.has(session.id) &&
        !overrideKeys.has(sessionMergeKey(session.dateKey, session.programName)),
    )
    .map(enrichTrainingSession);

  return [...kept, ...linkSessions.map(enrichTrainingSession)].sort((left, right) => {
    const byDate = left.dateKey.localeCompare(right.dateKey);
    if (byDate !== 0) return byDate;
    return left.programName.localeCompare(right.programName, 'es');
  });
}

export function groupManageItemsByDate(items: readonly GymTrainingManageItem[]) {
  const keys = [...new Set(items.map((item) => item.dateKey))].sort((left, right) =>
    right.localeCompare(left),
  );
  return keys.map((dateKey) => ({
    key: dateKey,
    items: items.filter((item) => item.dateKey === dateKey),
  }));
}

export function trainingItemTvParams(item: GymTrainingManageItem) {
  return {
    workoutId: item.id,
    programName: item.programName,
    dateKey: item.dateKey,
  };
}

function previewFromStructuredContent(name: string, content: string) {
  const blocks = parseWorkoutBlocksFromText(content);
  const lines: string[] = [name];

  for (const block of blocks) {
    if (block.type === 'free_text') {
      const text = block.timing.trim();
      if (text) lines.push(text);
      continue;
    }

    const config = getBlockTypeConfig(block.type);
    const header = [block.title?.trim(), config.label, block.timing.trim(), block.subtitle?.trim()]
      .filter(Boolean)
      .join(' · ');
    if (header) lines.push(header);

    for (const exercise of block.items) {
      const label = formatBlockItemLineForDisplay(exercise, block.type);
      if (label.trim()) lines.push(label);
    }
  }

  return lines.join('\n');
}

export function manageItemPreview(item: GymTrainingManageItem) {
  const content = item.body?.trim() ?? '';
  if (!content) return item.name;

  if (isHyroxProgram(item.programName)) {
    if (isStructuredWorkoutContent(content)) {
      const blocks = parseWorkoutBlocksFromText(content);
      const freeText = blocks.find((block) => block.type === 'free_text')?.timing.trim();
      if (freeText) return gymSessionBoardText({ name: item.name, body: freeText });
    }
    return gymSessionBoardText({ name: item.name, body: content });
  }

  if (isStructuredWorkoutContent(content) || content.includes('•')) {
    return previewFromStructuredContent(item.name, content);
  }

  return gymSessionBoardText({ name: item.name, body: content });
}

export function manageItemToEditLink(
  item: GymTrainingManageItem,
  gymId: string,
  classTypes: readonly GymClassType[],
  programs: readonly Program[],
): GymProgramLink | null {
  if (item.link) return item.link;

  const classType =
    (item.classTypeId ? classTypes.find((type) => type.id === item.classTypeId) : undefined) ??
    resolveClassType(item.programName, item.programId, classTypes, programs);
  const program =
    programs.find((entry) => entry.id === item.programId) ??
    (classType ? programForGymClassType(classType.name, programs) : undefined);

  if (!classType || !program) return null;

  const scheduledDate = item.dateKey;
  const now = new Date();
  const publishedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return {
    id: '',
    gymId,
    programId: program.id,
    programName: program.name,
    classTypeId: classType.id,
    classTypeName: classType.name,
    classTypeColor: classType.color,
    scheduledDate,
    publishedDate: item.publishedDate ?? scheduledDate,
    publishedTime: item.publishedTime ?? publishedTime,
    sessionDraft: enrichSessionDraft(
      sessionDraftFromTrainingContent(item.name, item.body, scheduledDate, {
        programName: item.programName,
        source: item.source,
      }),
      item.programName,
    ),
    label: item.name,
    createdAt: '',
  };
}

export function hiddenTrainingLinkInput(
  item: GymTrainingManageItem,
  classTypes: readonly GymClassType[],
  programs: readonly Program[],
) {
  const classType =
    (item.classTypeId ? classTypes.find((type) => type.id === item.classTypeId) : undefined) ??
    resolveClassType(item.programName, item.programId, classTypes, programs);
  const program =
    programs.find((entry) => entry.id === item.programId) ??
    (classType ? programForGymClassType(classType.name, programs) : undefined);

  if (!classType || !program) return null;

  const now = new Date();
  const publishedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const sourceSessionId = item.sourceSessionId ?? item.id;

  return {
    programId: program.id,
    classTypeId: classType.id,
    publishedDate: item.dateKey,
    publishedTime,
    scheduledDate: item.dateKey,
    label: `${HIDDEN_TRAINING_LABEL_PREFIX}${sourceSessionId}`,
  };
}
