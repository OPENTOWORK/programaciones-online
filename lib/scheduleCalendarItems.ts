import { buildAthleteCalendarItems } from '@/lib/athleteSchedule';
import {
  buildSchedulePreviewItems,
  schedulePreviewItemKey,
  type SchedulePreviewItem,
  type ScheduleViewMode,
} from '@/lib/programSchedulePreview';
import type { SessionDraft } from '@/lib/trainerSessionDraft';
import type { AthletePlan, Program, Workout } from '@/lib/types';

export interface ScheduleCalendarSource {
  program: Program;
  workouts: Workout[];
  draft: SessionDraft;
  editingWorkoutId?: string | null;
  isNewSession: boolean;
  additionalDrafts?: Array<{ id: string; draft: SessionDraft; isCurrent?: boolean; isDraft?: boolean }>;
  /** La sesión en edición ya existe: no se etiqueta como borrador. */
  currentSessionSaved?: boolean;
  overrideItems?: SchedulePreviewItem[];
  athleteSchedule?: {
    plans: AthletePlan[];
    workouts: Workout[];
    program?: Program;
  };
}

export function buildScheduleCalendarItems(
  source: ScheduleCalendarSource,
  focusDate: Date,
  viewMode: ScheduleViewMode,
): SchedulePreviewItem[] {
  if (source.overrideItems) return source.overrideItems;

  if (source.athleteSchedule) {
    return buildAthleteCalendarItems({ ...source.athleteSchedule, focusDate, viewMode });
  }

  const base = buildSchedulePreviewItems({
    program: source.program,
    workouts: source.workouts,
    draft: source.draft,
    editingWorkoutId: source.editingWorkoutId,
    isNewSession: source.isNewSession,
    focusDate,
    viewMode,
  }).map((item) => (source.currentSessionSaved && item.isDraft ? { ...item, isDraft: false } : item));

  const queued = (source.additionalDrafts ?? []).flatMap((entry) =>
    buildSchedulePreviewItems({
      program: source.program,
      workouts: [],
      draft: entry.draft,
      editingWorkoutId: null,
      isNewSession: true,
      focusDate,
      viewMode,
    }).map((item) => ({
      ...item,
      id: schedulePreviewItemKey(entry.id, item.date),
      name: entry.draft.name.trim() || item.name,
      isCurrent: entry.isCurrent ?? false,
      isDraft: entry.isDraft ?? true,
    })),
  );

  return base.concat(queued);
}
