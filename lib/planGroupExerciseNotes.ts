import { collectExerciseNamesFromSessionDraft } from '@/lib/exerciseTextParser';
import { normalizeExerciseName } from '@/lib/exerciseName';
import {
  getSessionLabel,
  getSessionNumber,
  type PersonalizedPlanGroup,
} from '@/lib/personalizedPlanGroups';
import { parsePersonalizedPlanContent } from '@/lib/personalizedPlanContent';
import type { SessionLogRecord } from '@/lib/sessionLogService';
import {
  SESSION_LOG_VIDEO_NOTE_LABEL,
  type TrainerExerciseNote,
} from '@/lib/trainerExerciseNoteService';

export interface PlanGroupExerciseNoteScope {
  sessionLogIds?: Set<string>;
  /** Nombre del ejercicio por id de vídeo de sesión (registro de entreno). */
  sessionVideoExerciseNames?: Map<string, string>;
  /** Clave de ejercicio del plan asociada a cada vídeo de sesión. */
  sessionVideoExerciseKeys?: Map<string, string>;
}

export interface PlanGroupExerciseNotesSection {
  exerciseKey: string;
  exerciseName: string;
  sessionLabels: string[];
  notes: TrainerExerciseNote[];
}

function looksLikeVideoFileName(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (/\.(mp4|mov|webm|m4v|avi)$/i.test(trimmed)) return true;
  return /^\d{6,}(\.\w+)?$/i.test(trimmed);
}

function linkedExerciseNameFromVideo(
  videoId: string,
  planMeta: Map<string, { exerciseName: string; sessionLabels: string[] }>,
  scope?: PlanGroupExerciseNoteScope,
): string | undefined {
  const linkedKey = scope?.sessionVideoExerciseKeys?.get(videoId);
  if (linkedKey && planMeta.has(linkedKey)) {
    return planMeta.get(linkedKey)!.exerciseName;
  }

  const fromVideo = scope?.sessionVideoExerciseNames?.get(videoId)?.trim();
  if (fromVideo && fromVideo !== SESSION_LOG_VIDEO_NOTE_LABEL && !looksLikeVideoFileName(fromVideo)) {
    return fromVideo;
  }

  return undefined;
}

function isSessionVideoNoteSection(exerciseKey: string, notes: TrainerExerciseNote[]) {
  return exerciseKey.startsWith('session-video:') || notes.some((note) => Boolean(note.sessionVideoId));
}

function formatPlanGroupSectionTitle(
  exerciseKey: string,
  notes: TrainerExerciseNote[],
  exerciseName: string,
): string {
  if (!isSessionVideoNoteSection(exerciseKey, notes)) {
    return exerciseName;
  }

  const clean =
    exerciseName !== SESSION_LOG_VIDEO_NOTE_LABEL && !looksLikeVideoFileName(exerciseName)
      ? exerciseName
      : '';

  return clean ? `${clean} · Vídeo` : 'Vídeo';
}

export function sessionLogIdsForPlanGroup(
  group: PersonalizedPlanGroup,
  logs: Pick<SessionLogRecord, 'id' | 'athletePlanId'>[],
): Set<string> {
  const sessionIds = new Set(group.sessions.map((session) => session.id));
  return new Set(
    logs
      .filter((log) => log.athletePlanId && sessionIds.has(log.athletePlanId))
      .map((log) => log.id),
  );
}

/** Apuntes del plan y de registros de sesión vinculados a sus sesiones. */
export function filterNotesForPlanGroup(
  group: PersonalizedPlanGroup,
  notes: TrainerExerciseNote[],
  scope?: PlanGroupExerciseNoteScope,
): TrainerExerciseNote[] {
  const sessionIds = new Set(group.sessions.map((session) => session.id));
  const sessionLogIds = scope?.sessionLogIds;
  return notes.filter((note) => {
    if (note.athletePlanId != null && sessionIds.has(note.athletePlanId)) return true;
    if (sessionLogIds && note.sessionLogId && sessionLogIds.has(note.sessionLogId)) return true;
    return false;
  });
}

function resolveNoteExerciseDisplayName(
  note: TrainerExerciseNote,
  planMeta: Map<string, { exerciseName: string; sessionLabels: string[] }>,
  scope?: PlanGroupExerciseNoteScope,
): string {
  if (note.sessionVideoId) {
    const linked = linkedExerciseNameFromVideo(note.sessionVideoId, planMeta, scope);
    if (linked) return linked;
  }

  if (note.exerciseKey.startsWith('session-video:')) {
    const videoId = note.exerciseKey.slice('session-video:'.length);
    const linked = linkedExerciseNameFromVideo(videoId, planMeta, scope);
    if (linked) return linked;
  }

  if (planMeta.has(note.exerciseKey)) {
    const fromPlan = planMeta.get(note.exerciseKey)!.exerciseName.trim();
    if (fromPlan && fromPlan !== SESSION_LOG_VIDEO_NOTE_LABEL) return fromPlan;
  }

  const trimmed = note.exerciseName?.trim() ?? '';
  if (
    trimmed &&
    trimmed !== SESSION_LOG_VIDEO_NOTE_LABEL &&
    !looksLikeVideoFileName(trimmed)
  ) {
    return trimmed;
  }
  return SESSION_LOG_VIDEO_NOTE_LABEL;
}

function resolveSectionExerciseName(
  exerciseKey: string,
  fallbackName: string,
  notes: TrainerExerciseNote[],
  planMeta: Map<string, { exerciseName: string; sessionLabels: string[] }>,
  scope?: PlanGroupExerciseNoteScope,
): string {
  for (const note of notes) {
    const resolved = resolveNoteExerciseDisplayName(note, planMeta, scope);
    if (resolved !== SESSION_LOG_VIDEO_NOTE_LABEL) {
      return formatPlanGroupSectionTitle(exerciseKey, notes, resolved);
    }
  }

  const trimmed = fallbackName.trim();
  if (trimmed && trimmed !== SESSION_LOG_VIDEO_NOTE_LABEL && !looksLikeVideoFileName(trimmed)) {
    return formatPlanGroupSectionTitle(exerciseKey, notes, trimmed);
  }

  if (planMeta.has(exerciseKey)) {
    const fromPlan = planMeta.get(exerciseKey)!.exerciseName.trim();
    if (fromPlan && fromPlan !== SESSION_LOG_VIDEO_NOTE_LABEL) {
      return formatPlanGroupSectionTitle(exerciseKey, notes, fromPlan);
    }
  }

  if (exerciseKey.startsWith('session-video:')) {
    const videoId = exerciseKey.slice('session-video:'.length);
    const linked = linkedExerciseNameFromVideo(videoId, planMeta, scope);
    if (linked) return formatPlanGroupSectionTitle(exerciseKey, notes, linked);
  }

  return formatPlanGroupSectionTitle(exerciseKey, notes, SESSION_LOG_VIDEO_NOTE_LABEL);
}

export function buildPlanGroupExerciseNoteSections(
  group: PersonalizedPlanGroup,
  notes: TrainerExerciseNote[],
  scope?: PlanGroupExerciseNoteScope,
): PlanGroupExerciseNotesSection[] {
  const scopedNotes = filterNotesForPlanGroup(group, notes, scope);
  const meta = new Map<string, { exerciseName: string; sessionLabels: string[] }>();

  group.sessions.forEach((session, index) => {
    const draft = parsePersonalizedPlanContent(session.content, getSessionNumber(session, index) - 1);
    const label = getSessionLabel(session, index);
    for (const name of collectExerciseNamesFromSessionDraft(draft)) {
      const key = normalizeExerciseName(name);
      if (!key) continue;
      const current = meta.get(key);
      if (!current) {
        meta.set(key, { exerciseName: name, sessionLabels: [label] });
        continue;
      }
      if (!current.sessionLabels.includes(label)) {
        current.sessionLabels.push(label);
      }
    }
  });

  const notesByKey = new Map<string, TrainerExerciseNote[]>();

  for (const note of scopedNotes) {
    if (!meta.has(note.exerciseKey)) {
      meta.set(note.exerciseKey, {
        exerciseName: resolveNoteExerciseDisplayName(note, meta, scope),
        sessionLabels: note.sessionLogId ? ['Registro de entreno'] : [],
      });
    }
    const list = notesByKey.get(note.exerciseKey) ?? [];
    list.push(note);
    notesByKey.set(note.exerciseKey, list);
  }

  const sections: PlanGroupExerciseNotesSection[] = [];

  for (const [exerciseKey, { exerciseName, sessionLabels }] of meta) {
    const exerciseNotes = (notesByKey.get(exerciseKey) ?? []).sort((left, right) => {
      if (left.performedOn !== right.performedOn) {
        return right.performedOn.localeCompare(left.performedOn);
      }
      return (left.setNumber ?? 0) - (right.setNumber ?? 0);
    });
    if (exerciseNotes.length === 0) continue;
    sections.push({
      exerciseKey,
      exerciseName: resolveSectionExerciseName(
        exerciseKey,
        exerciseName,
        exerciseNotes,
        meta,
        scope,
      ),
      sessionLabels,
      notes: exerciseNotes,
    });
  }

  sections.sort((left, right) => {
    const leftLatest = left.notes[0]?.performedOn ?? '';
    const rightLatest = right.notes[0]?.performedOn ?? '';
    if (left.notes.length && right.notes.length && leftLatest !== rightLatest) {
      return rightLatest.localeCompare(leftLatest);
    }
    if (left.notes.length !== right.notes.length) {
      return right.notes.length - left.notes.length;
    }
    return left.exerciseName.localeCompare(right.exerciseName, 'es');
  });

  return sections;
}

export function countPlanGroupExerciseNotes(sections: PlanGroupExerciseNotesSection[]) {
  return sections.reduce((total, section) => total + section.notes.length, 0);
}

/** Solo ejercicios de este plan que ya tienen apuntes (listado de la ficha). */
export function listPlanGroupExerciseNoteSections(
  group: PersonalizedPlanGroup,
  notes: TrainerExerciseNote[],
  scope?: PlanGroupExerciseNoteScope,
): PlanGroupExerciseNotesSection[] {
  return buildPlanGroupExerciseNoteSections(group, notes, scope);
}
