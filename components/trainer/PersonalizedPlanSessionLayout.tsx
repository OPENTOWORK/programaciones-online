import { useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ProgramSchedulePreview } from '@/components/trainer/ProgramSchedulePreview';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  ScheduleCalendarModal,
  type CalendarSessionSaveInput,
} from '@/components/trainer/ScheduleCalendarModal';
import { SessionEditorForm } from '@/components/trainer/SessionEditorForm';
import { colors, spacing, typography } from '@/constants/theme';
import { useTrainerDesktopWebLayout, useTrainerMobileLayout } from '@/hooks/useTrainerMobileLayout';
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
  /** Borrador de día de descanso para la fecha elegida. */
  onBuildRestDayDraftForDate?: (date: Date) => SessionDraft;
  /** Borrador de una sesión del calendario para editarla sin salir de él. */
  onLoadCalendarSessionDraft?: (item: SchedulePreviewItem) => SessionDraft | null;
  /** Guarda el entreno creado o editado desde el calendario ampliado. */
  onSaveCalendarSession?: (input: CalendarSessionSaveInput) => Promise<string | null> | string | null;
  onSessionCopy?: (
    item: SchedulePreviewItem,
    targetDate: Date,
  ) => Promise<string | null> | string | null;
  onSessionDelete?: (item: SchedulePreviewItem) => Promise<string | null> | string | null;
  onSessionMoveToDate?: (
    item: SchedulePreviewItem,
    date: Date,
    dayItems?: SchedulePreviewItem[],
  ) => Promise<string | null> | string | null;
  onSessionReorderDay?: (
    date: Date,
    orderedItems: SchedulePreviewItem[],
  ) => Promise<string | null> | string | null;
  onSessionEdit?: (item: SchedulePreviewItem) => void;
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
  onBuildRestDayDraftForDate,
  onLoadCalendarSessionDraft,
  onSaveCalendarSession,
  onSessionCopy,
  onSessionDelete,
  onSessionMoveToDate,
  onSessionReorderDay,
  onSessionEdit,
}: PersonalizedPlanSessionLayoutProps) {
  const router = useRouter();
  const isMobileLayout = useTrainerMobileLayout();
  const isDesktopTrainer = useTrainerDesktopWebLayout();
  const isSplitLayout = isDesktopTrainer && !isMobileLayout;
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

      <View style={[styles.splitLayout, isSplitLayout ? styles.splitLayoutWide : styles.splitLayoutStacked]}>
        <View style={[styles.editorColumn, isSplitLayout && styles.editorColumnWide]}>
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
          {isMobileLayout ? (
            <Card style={styles.mobileCalendarCard}>
              <Text style={styles.mobileCalendarTitle}>Calendario del plan</Text>
              <Text style={styles.mobileCalendarSubtitle}>
                Coloca sesiones en fechas, copia entrenos y revisa la programación en pantalla completa.
              </Text>
              <Button title="Abrir calendario" onPress={() => setCalendarOpen(true)} />
            </Card>
          ) : (
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
          )}
        </View>
      </View>

      <ScheduleCalendarModal
        visible={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        title={planTitle.trim() || 'Calendario de la programación'}
        subtitle="Mismo calendario que en Programaciones: edita, visualiza, escribe, usa plantillas, copia o elimina varias sesiones."
        source={calendarSource}
        onSessionPreview={(item) => {
          setCalendarOpen(false);
          openTrainerPreviewSession(router, item, previewState);
        }}
        onSessionEdit={onSessionEdit}
        buildSessionDraft={onBuildSessionDraftForDate}
        buildRestDayDraft={onBuildRestDayDraftForDate}
        loadSessionDraft={onLoadCalendarSessionDraft}
        saveSession={onSaveCalendarSession}
        onSessionCopy={onSessionCopy}
        onSessionDelete={onSessionDelete}
        onSessionMoveToDate={onSessionMoveToDate}
        onSessionReorderDay={onSessionReorderDay}
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
    width: '100%',
  },
  splitLayoutStacked: {
    flexDirection: 'column',
  },
  splitLayoutWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  editorColumn: {
    width: '100%',
    minWidth: 0,
    gap: spacing.md,
    flexShrink: 0,
  },
  editorColumnWide: {
    flex: 1,
  },
  previewColumn: {
    width: '100%',
    minWidth: 0,
    flexShrink: 0,
  },
  previewColumnWide: {
    flex: 1,
    alignSelf: 'flex-start',
  },
  mobileCalendarCard: {
    padding: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
  mobileCalendarTitle: {
    ...typography.h3,
    color: colors.text,
  },
  mobileCalendarSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
});
