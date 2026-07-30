import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { ProgramSchedulePreview } from '@/components/trainer/ProgramSchedulePreview';
import {
  ScheduleCalendarModal,
  type CalendarSessionSaveInput,
} from '@/components/trainer/ScheduleCalendarModal';
import { SessionEditorForm } from '@/components/trainer/SessionEditorForm';
import { Button } from '@/components/ui/Button';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useProgram, usePrograms } from '@/hooks/usePrograms';
import { isTrainerRole } from '@/lib/athleteService';
import { safeGoBack } from '@/lib/navigation';
import { openTrainerPreviewDay, openTrainerPreviewSession } from '@/lib/sessionNavigation';
import { createWorkoutCatalog, updateWorkoutCatalog } from '@/lib/programEditService';
import { syncExerciseVideosForNames } from '@/lib/exerciseVideoSyncService';
import { isTrainerEditableCategory } from '@/lib/programService';
import { collectExerciseNamesFromSessionDraft } from '@/lib/exerciseTextParser';
import { combineMainPartsForSave, extractExercisesFromSessionDraft, hasSessionBlockContent } from '@/lib/sessionBlockSections';
import { parseSchedulePreviewItemKey, type SchedulePreviewItem } from '@/lib/programSchedulePreview';
import {
  formatScheduleSummary,
  toLocalDateString,
  toWeekdayIndex,
  type SessionSchedule,
} from '@/lib/sessionSchedule';
import {
  createEmptySessionDraft,
  workoutToSessionDraft,
  type SessionDraft,
} from '@/lib/trainerSessionDraft';
import { fetchWorkoutById } from '@/lib/workoutService';

function scheduleDraftForDate(draft: SessionDraft, isoDate?: string): SessionDraft {
  if (!isoDate) return draft;
  const target = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(target.getTime())) return draft;

  const schedule: SessionSchedule = {
    weekdays: [toWeekdayIndex(target)],
    recurrence: 'once',
    startDate: toLocalDateString(target),
  };
  return { ...draft, schedule, dayLabel: formatScheduleSummary(schedule) };
}

export default function EditSessionScreen() {
  const { id, workoutId, date } = useLocalSearchParams<{ id: string; workoutId: string; date?: string }>();
  const { width } = useWindowDimensions();
  const isSplitLayout = width >= 1080;
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { program, workouts, isLoading, reloadWorkouts } = useProgram(id ?? '', { refetchOnFocus: false });
  const { refresh: refreshPrograms } = usePrograms();

  const isNewSession = workoutId === 'new';
  const [draft, setDraft] = useState<SessionDraft | null>(null);
  const [loadingSession, setLoadingSession] = useState(!isNewSession);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const canEdit = isTrainerRole(user?.role) && isTrainerEditableCategory(program?.category);

  useEffect(() => {
    if (!program || !canEdit) return;

    if (isNewSession) {
      setDraft(scheduleDraftForDate(createEmptySessionDraft(workouts.length), date));
      setLoadingSession(false);
      return;
    }

    let cancelled = false;

    async function loadSession() {
      setLoadingSession(true);
      const cached = workouts.find((workout) => workout.id === workoutId);
      const workout = cached ?? (await fetchWorkoutById(workoutId ?? ''));
      if (cancelled) return;

      if (!workout || workout.programId !== program.id) {
        setDraft(null);
        setLoadingSession(false);
        return;
      }

      const sessionIndex = workouts.findIndex((entry) => entry.id === workoutId);
      setDraft(workoutToSessionDraft(workout, sessionIndex >= 0 ? sessionIndex : 0));
      setLoadingSession(false);
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, [program, canEdit, isNewSession, workoutId, workouts, date]);

  const persistSessionDraft = async (
    draftToSave: SessionDraft,
    targetWorkoutId?: string,
  ): Promise<{ error?: string; syncedVideos?: number }> => {
    if (!program) return { error: 'No se pudo cargar la programación.' };

    const trimmedName = draftToSave.name.trim();
    if (!trimmedName) return { error: 'El nombre de la sesión es obligatorio.' };

    const validExercises = extractExercisesFromSessionDraft(draftToSave).filter((exercise) =>
      exercise.name.trim(),
    );

    if (validExercises.length === 0 && !hasSessionBlockContent(draftToSave)) {
      return { error: 'Añade al menos un bloque de entrenamiento.' };
    }

    if (draftToSave.schedule.weekdays.length === 0) {
      return { error: 'Selecciona al menos un día para la sesión.' };
    }

    const payload = {
      name: trimmedName,
      dayLabel: formatScheduleSummary(draftToSave.schedule),
      estimatedDuration: draftToSave.estimatedDuration,
      warmup: draftToSave.warmup,
      main: combineMainPartsForSave(draftToSave.main, draftToSave.metcon),
      core: draftToSave.core || undefined,
      cooldown: draftToSave.cooldown,
      exercises: validExercises,
      schedule: draftToSave.schedule,
    };

    const workoutResult = targetWorkoutId
      ? await updateWorkoutCatalog(targetWorkoutId, payload)
      : await createWorkoutCatalog({
          programId: program.id,
          sortIndex: workouts.length,
          ...payload,
        });

    if (workoutResult.error) return { error: workoutResult.error };

    const videoSync = await syncExerciseVideosForNames(collectExerciseNamesFromSessionDraft(draftToSave));
    if (videoSync.error) return { error: videoSync.error };

    await refreshPrograms();
    await reloadWorkouts();

    return { syncedVideos: videoSync.synced };
  };

  const handleSave = async () => {
    if (!program || !draft || !canEdit) return;

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await persistSessionDraft(draft, isNewSession ? undefined : workoutId);
      if (result.error) {
        setError(result.error);
        return;
      }

      const synced = result.syncedVideos ?? 0;
      const videoMessage =
        synced > 0
          ? ` ${synced} vídeo${synced === 1 ? '' : 's'} de YouTube añadido${synced === 1 ? '' : 's'}.`
          : '';

      if (Platform.OS === 'web') {
        safeGoBack(router, `/program/${program.id}`);
        return;
      }

      Alert.alert(
        isNewSession ? 'Sesión creada' : 'Sesión guardada',
        `Los cambios se han guardado correctamente.${videoMessage}`,
        [{ text: 'Continuar', onPress: () => safeGoBack(router, `/program/${program.id}`) }],
      );
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar la sesión.');
    } finally {
      setSubmitting(false);
    }
  };

  const previewState = useMemo(() => {
    if (!program || !draft) return null;
    return {
      program,
      workouts,
      draft,
      editingWorkoutId: isNewSession ? null : workoutId,
      isNewSession,
    };
  }, [program, workouts, draft, isNewSession, workoutId]);

  const resolveWorkoutId = (item: SchedulePreviewItem) => {
    const { sourceId } = parseSchedulePreviewItemKey(item.id);
    return workouts.find((workout) => workout.id === sourceId)?.id;
  };

  const buildCalendarSessionDraft = (targetDate: Date) =>
    scheduleDraftForDate(createEmptySessionDraft(workouts.length), toLocalDateString(targetDate));

  const loadCalendarSessionDraft = (item: SchedulePreviewItem) => {
    const targetWorkoutId = resolveWorkoutId(item);
    if (!targetWorkoutId) return item.isCurrent ? draft : null;
    if (targetWorkoutId === workoutId) return draft;

    const index = workouts.findIndex((workout) => workout.id === targetWorkoutId);
    const workout = index >= 0 ? workouts[index] : undefined;
    return workout ? workoutToSessionDraft(workout, index) : null;
  };

  const handleCalendarSave = async ({ draft: calendarDraft, item }: CalendarSessionSaveInput) => {
    const targetWorkoutId = item ? resolveWorkoutId(item) : undefined;

    if (item && !targetWorkoutId) {
      setDraft(calendarDraft);
      setSuccessMessage('Sesión actualizada en el formulario. Pulsa «Crear sesión» para guardarla.');
      return null;
    }

    const result = await persistSessionDraft(calendarDraft, targetWorkoutId);
    if (result.error) return result.error;

    if (targetWorkoutId && targetWorkoutId === workoutId) setDraft(calendarDraft);
    setSuccessMessage(
      targetWorkoutId ? 'Sesión actualizada desde el calendario.' : 'Sesión creada desde el calendario.',
    );
    return null;
  };

  if (isLoading || authLoading || loadingSession) {
    return (
      <ScreenWrapper scrollable={false}>
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      </ScreenWrapper>
    );
  }

  if (!program || !canEdit || !draft) {
    return (
      <ScreenWrapper>
        <Text style={styles.error}>No se pudo cargar la sesión.</Text>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper padded={false}>
      <View style={styles.page}>
        <View style={[styles.pageHeader, isSplitLayout && styles.pageHeaderWide]}>
          <Text style={styles.title}>{isNewSession ? 'Nueva sesión' : 'Editar sesión'}</Text>
          <SectionHeader title={program.name} subtitle={draft.dayLabel} />
        </View>

        <View style={[styles.splitLayout, isSplitLayout && styles.splitLayoutWide]}>
          <View style={styles.editorColumn}>
            <SessionEditorForm draft={draft} onChange={setDraft} />

            <View style={styles.footer}>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

              <Button
                title={isNewSession ? 'Crear sesión' : 'Guardar sesión'}
                onPress={() => void handleSave()}
                loading={submitting}
                style={styles.saveBtn}
              />
            </View>
          </View>

          <View style={[styles.previewColumn, isSplitLayout && styles.previewColumnWide]}>
            <ProgramSchedulePreview
              program={program}
              workouts={workouts}
              draft={draft}
              editingWorkoutId={isNewSession ? null : workoutId}
              isNewSession={isNewSession}
              onDayPress={(date) => {
                if (previewState) openTrainerPreviewDay(router, date, previewState);
              }}
              onSessionPress={(item) => {
                if (previewState) openTrainerPreviewSession(router, item, previewState);
              }}
              onExpand={() => setCalendarOpen(true)}
            />
          </View>
        </View>
      </View>

      {previewState ? (
        <ScheduleCalendarModal
          visible={calendarOpen}
          onClose={() => setCalendarOpen(false)}
          title={program.name}
          subtitle="Pulsa un día para ver sus entrenamientos, modificarlos o crear uno nuevo."
          source={previewState}
          onSessionPreview={(item) => {
            setCalendarOpen(false);
            openTrainerPreviewSession(router, item, previewState);
          }}
          buildSessionDraft={buildCalendarSessionDraft}
          loadSessionDraft={loadCalendarSessionDraft}
          saveSession={handleCalendarSave}
        />
      ) : null}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: spacing.xl },
  page: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  pageHeader: {
    marginBottom: spacing.lg,
  },
  pageHeaderWide: {
    paddingHorizontal: spacing.xs,
  },
  title: { ...typography.h1, color: colors.text, marginBottom: 4 },
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
    position: 'sticky' as const,
    top: spacing.md,
    alignSelf: 'flex-start',
  },
  footer: {
    marginTop: spacing.md,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  error: { ...typography.bodySmall, color: colors.danger },
  success: { ...typography.bodySmall, color: colors.success },
  saveBtn: { marginTop: spacing.xs },
});
