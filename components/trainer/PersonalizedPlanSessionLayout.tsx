import { useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { ProgramSchedulePreview } from '@/components/trainer/ProgramSchedulePreview';
import {
  ScheduleCalendarModal,
  type CalendarSessionSaveInput,
} from '@/components/trainer/ScheduleCalendarModal';
import { SessionEditorForm } from '@/components/trainer/SessionEditorForm';
import { colors, spacing } from '@/constants/theme';
import { createPersonalizedPlanPreviewProgram } from '@/lib/personalizedPlanContent';
import type { SchedulePreviewItem } from '@/lib/programSchedulePreview';
import { openTrainerPreviewDay, openTrainerPreviewSession } from '@/lib/sessionNavigation';
import type { SessionDraft } from '@/lib/trainerSessionDraft';
import { useRouter } from 'expo-router';

export interface QueuedPlanSession {
  id: string;
  sessionNumber: number;
  draft: SessionDraft;
  /** Las sesiones ya guardadas se pintan en el calendario sin la etiqueta de borrador. */
  isSaved?: boolean;
}

interface PersonalizedPlanSessionLayoutProps {
  planTitle: string;
  draft: SessionDraft;
  onDraftChange: (draft: SessionDraft) => void;
  header?: ReactNode;
  footer?: ReactNode;
  showSessionName?: boolean;
  sessionNumber?: number;
  onSessionNumberChange?: (value: number) => void;
  queuedSessions?: QueuedPlanSession[];
  /** La sesión que se edita ya está guardada, así que no es un borrador en el calendario. */
  currentSessionSaved?: boolean;
  onConfirmSession?: () => void;
  canConfirmSession?: boolean;
  onPendingBlocksChange?: (hasPending: boolean) => void;
  /** Borrador inicial para crear un entreno desde el calendario ampliado. */
  onBuildSessionDraftForDate?: (date: Date) => SessionDraft;
  /** Borrador de una sesión del calendario para editarla sin salir de él. */
  onLoadCalendarSessionDraft?: (item: SchedulePreviewItem) => SessionDraft | null;
  /** Guarda el entreno creado o editado desde el calendario ampliado. */
  onSaveCalendarSession?: (input: CalendarSessionSaveInput) => Promise<string | null> | string | null;
}

export function PersonalizedPlanSessionLayout({
  planTitle,
  draft,
  onDraftChange,
  header,
  footer,
  showSessionName = false,
  sessionNumber,
  onSessionNumberChange,
  queuedSessions = [],
  currentSessionSaved = false,
  onConfirmSession,
  canConfirmSession = false,
  onPendingBlocksChange,
  onBuildSessionDraftForDate,
  onLoadCalendarSessionDraft,
  onSaveCalendarSession,
}: PersonalizedPlanSessionLayoutProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSplitLayout = width >= 1080;
  const [calendarOpen, setCalendarOpen] = useState(false);

  const previewProgram = useMemo(
    () => createPersonalizedPlanPreviewProgram(planTitle || draft.name),
    [planTitle, draft.name],
  );

  const previewDraft = useMemo(() => draft, [draft]);

  const additionalDrafts = useMemo(
    () =>
      queuedSessions.map((session) => ({
        id: session.id,
        draft: session.draft,
        isCurrent: false,
        isDraft: !session.isSaved,
      })),
    [queuedSessions],
  );

  const previewState = useMemo(
    () => ({
      program: previewProgram,
      workouts: [],
      draft: previewDraft,
      editingWorkoutId: null,
      isNewSession: true,
      planTitle,
      additionalDrafts: queuedSessions.map((session) => ({
        id: session.id,
        draft: session.draft,
      })),
    }),
    [previewProgram, previewDraft, planTitle, queuedSessions],
  );

  const calendarSource = useMemo(
    () => ({
      program: previewProgram,
      workouts: [],
      draft: previewDraft,
      editingWorkoutId: null,
      isNewSession: true,
      additionalDrafts,
      currentSessionSaved,
    }),
    [previewProgram, previewDraft, additionalDrafts, currentSessionSaved],
  );

  return (
    <View style={styles.wrap}>
      {header}

      <View style={[styles.splitLayout, isSplitLayout && styles.splitLayoutWide]}>
        <View style={styles.editorColumn}>
          <SessionEditorForm
            draft={draft}
            onChange={onDraftChange}
            showSessionName={showSessionName}
            sessionNumber={sessionNumber}
            onSessionNumberChange={onSessionNumberChange}
            onConfirmSession={onConfirmSession}
            canConfirmSession={canConfirmSession}
            onPendingBlocksChange={onPendingBlocksChange}
          />
          {footer}
        </View>

        <View style={[styles.previewColumn, isSplitLayout && styles.previewColumnWide]}>
          <ProgramSchedulePreview
            program={previewProgram}
            workouts={[]}
            draft={previewDraft}
            additionalDrafts={additionalDrafts}
            currentSessionSaved={currentSessionSaved}
            editingWorkoutId={null}
            isNewSession
            onDayPress={(date) => openTrainerPreviewDay(router, date, previewState)}
            onSessionPress={(item) => openTrainerPreviewSession(router, item, previewState)}
            onExpand={() => setCalendarOpen(true)}
          />
        </View>
      </View>

      <ScheduleCalendarModal
        visible={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        title={planTitle.trim() || 'Calendario de la programación'}
        subtitle="Pulsa un día para ver sus entrenamientos, modificarlos o crear uno nuevo."
        source={calendarSource}
        onSessionPreview={(item) => {
          setCalendarOpen(false);
          openTrainerPreviewSession(router, item, previewState);
        }}
        buildSessionDraft={onBuildSessionDraftForDate}
        loadSessionDraft={onLoadCalendarSessionDraft}
        saveSession={onSaveCalendarSession}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  splitLayout: {
    gap: spacing.lg,
  },
  splitLayoutWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  editorColumn: {
    flex: 1,
    minWidth: 0,
    gap: spacing.md,
  },
  previewColumn: {
    width: '100%',
  },
  previewColumnWide: {
    flex: 1,
    minWidth: 0,
    alignSelf: 'flex-start',
  },
});
