import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  ScheduleCalendarModal,
  type CalendarSessionSaveInput,
} from '@/components/trainer/ScheduleCalendarModal';
import { ProgramSchedulePreview } from '@/components/trainer/ProgramSchedulePreview';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import {
  buildCatalogRestDayDraftForDate,
  buildCatalogSessionDraftForDate,
  copyCatalogDaySessions,
  copyCatalogSession,
  deleteCatalogSession,
  loadCatalogSessionDraft,
  moveCatalogSessionToDate,
  persistCatalogSessionDraft,
  reorderCatalogWorkoutsDay,
  applyDateToSessionDraft,
  workoutIdFromCalendarItem,
} from '@/lib/catalogProgramCalendar';
import type { SchedulePreviewItem } from '@/lib/programSchedulePreview';
import {
  formatDateParam,
  openCalendarDay,
  openScheduledSession,
  openTrainerPreviewSession,
} from '@/lib/sessionNavigation';
import { createEmptySessionDraft } from '@/lib/trainerSessionDraft';
import { isProgramActiveForUser, startUserProgram } from '@/lib/userProgramService';
import type { Program, Workout } from '@/lib/types';

interface ProgramSessionsCalendarProps {
  program: Program;
  workouts: Workout[];
  isLoading?: boolean;
  canManage?: boolean;
  onWorkoutsChange?: () => Promise<void> | void;
}

export function ProgramSessionsCalendar({
  program,
  workouts,
  isLoading = false,
  canManage = false,
  onWorkoutsChange,
}: ProgramSessionsCalendarProps) {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const emptyDraft = useMemo(() => createEmptySessionDraft(0), []);
  const [starting, setStarting] = useState(false);

  const previewState = useMemo(
    () => ({
      program,
      workouts,
      draft: emptyDraft,
      editingWorkoutId: null,
      isNewSession: false,
    }),
    [program, workouts, emptyDraft],
  );

  const refreshWorkouts = useCallback(async () => {
    await onWorkoutsChange?.();
  }, [onWorkoutsChange]);

  const isLocked = program.status === 'bloqueada';
  const isUserActive = isProgramActiveForUser(
    program.id,
    user?.currentPrograms,
    user?.currentProgramId,
  );
  const canJoin = !canManage && !isLocked && !isUserActive && workouts.length > 0;

  const handleJoin = useCallback(async () => {
    if (!canJoin) return;

    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para apuntarte a una programación.');
      return;
    }

    setStarting(true);
    const { error } = await startUserProgram(user.id, program.id);
    setStarting(false);

    if (error) {
      Alert.alert('Error', error);
      return;
    }

    await refreshUser(true);
    Alert.alert('Listo', `Te has apuntado a "${program.name}". Ya aparece en tu calendario.`);
  }, [canJoin, program.id, program.name, refreshUser, user]);

  const handleSessionPress = useCallback(
    (item: SchedulePreviewItem) => {
      const workoutId = workoutIdFromCalendarItem(item);
      if (!workoutId) return;

      const date = formatDateParam(item.date);

      if (canManage) {
        router.push({
          pathname: '/trainer/program/[id]/session/[workoutId]',
          params: { id: program.id, workoutId, date },
        });
        return;
      }

      openScheduledSession(router, { ...item, id: workoutId });
    },
    [canManage, program.id, router],
  );

  const loadSessionDraft = useCallback(
    (item: SchedulePreviewItem) => loadCatalogSessionDraft(workouts, item),
    [workouts],
  );

  const buildSessionDraft = useCallback(
    (date: Date) => buildCatalogSessionDraftForDate(workouts, date),
    [workouts],
  );

  const buildRestDayDraft = useCallback(
    (date: Date) => buildCatalogRestDayDraftForDate(workouts, date),
    [workouts],
  );

  const saveSession = useCallback(
    async ({ draft, date, item }: CalendarSessionSaveInput) => {
      const targetWorkoutId = item ? workoutIdFromCalendarItem(item) : undefined;
      // Nueva sesión desde un día del calendario: ancla siempre a esa fecha.
      const draftToSave = item ? draft : applyDateToSessionDraft(draft, date);
      const error = await persistCatalogSessionDraft(program, workouts, draftToSave, targetWorkoutId);
      if (error) return error;
      await refreshWorkouts();
      return null;
    },
    [program, refreshWorkouts, workouts],
  );

  const handleSessionCopy = useCallback(
    async (item: SchedulePreviewItem) => {
      const error = await copyCatalogSession(program, workouts, item);
      if (error) return error;
      await refreshWorkouts();
      return null;
    },
    [program, refreshWorkouts, workouts],
  );

  const handleSessionDelete = useCallback(
    async (item: SchedulePreviewItem) => {
      const workoutId = workoutIdFromCalendarItem(item);
      if (!workoutId) return 'No se pudo eliminar la sesión.';

      const error = await deleteCatalogSession(workoutId);
      if (error) return error;
      await refreshWorkouts();
      return null;
    },
    [refreshWorkouts],
  );

  const handleCopyDayToDate = useCallback(
    async (_sourceDate: Date, targetDate: Date, items: SchedulePreviewItem[]) => {
      const error = await copyCatalogDaySessions(program, workouts, targetDate, items);
      if (error) return error;
      await refreshWorkouts();
      return null;
    },
    [program, refreshWorkouts, workouts],
  );

  const handleSessionMoveToDate = useCallback(
    async (item: SchedulePreviewItem, date: Date, dayItems?: SchedulePreviewItem[]) => {
      const orderedIds = dayItems
        ?.map((entry) => workoutIdFromCalendarItem(entry))
        .filter((entry): entry is string => Boolean(entry));

      const error = await moveCatalogSessionToDate(program, workouts, item, date, orderedIds);
      if (error) return error;
      await refreshWorkouts();
      return null;
    },
    [program, refreshWorkouts, workouts],
  );

  const handleSessionReorderDay = useCallback(
    async (_date: Date, orderedItems: SchedulePreviewItem[]) => {
      const orderedIds = orderedItems
        .map((item) => workoutIdFromCalendarItem(item))
        .filter((id): id is string => Boolean(id));

      const error = await reorderCatalogWorkoutsDay(program, workouts, orderedIds);
      if (error) return error;
      await refreshWorkouts();
      return null;
    },
    [program, refreshWorkouts, workouts],
  );

  if (isLoading) {
    return (
      <Card style={styles.loadingCard}>
        <ActivityIndicator color={colors.accent} />
      </Card>
    );
  }

  if (!canManage) {
    return (
      <ScrollView
        style={styles.athleteScroll}
        contentContainerStyle={styles.athleteContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.athleteHeader}>
          <View style={styles.athleteHeaderCopy}>
            <Text style={styles.athleteTitle}>{program.name}</Text>
            <Text style={styles.athleteSubtitle}>
              {isUserActive
                ? 'Ya estás apuntado. Pulsa un día o una sesión para ver tu entreno.'
                : 'Consulta el calendario y apúntate si quieres seguir esta programación.'}
            </Text>
          </View>
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/program/[id]/info',
                params: { id: program.id },
              })
            }
            style={({ pressed }) => [styles.headerLink, pressed && styles.headerLinkPressed]}
            accessibilityRole="link"
          >
            <Text style={styles.headerLinkText}>Ver ficha</Text>
          </Pressable>
        </View>

        {canJoin ? (
          <Button
            title="Apuntarme a esta programación"
            onPress={() => void handleJoin()}
            loading={starting}
            style={styles.joinButton}
          />
        ) : null}

        {isUserActive ? (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>Programación activa</Text>
          </View>
        ) : null}

        {workouts.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Sin sesiones todavía</Text>
            <Text style={styles.emptyText}>Esta programación aún no tiene entrenos publicados.</Text>
          </Card>
        ) : (
          <ProgramSchedulePreview
            program={program}
            workouts={workouts}
            draft={emptyDraft}
            isNewSession={false}
            variant="athlete"
            onDayPress={(date) => openCalendarDay(router, date)}
            onSessionPress={handleSessionPress}
          />
        )}
      </ScrollView>
    );
  }

  return (
    <View style={styles.wrap}>
      <ScheduleCalendarModal
        key={program.id}
        visible
        presentation="inline"
        title={program.name}
        subtitle="Pulsa el marcador de un día para crear, copiar o añadir desde plantilla. Las sesiones salen desplegadas; pulsa la flecha para ocultarlas."
        source={previewState}
        expandSessionsByDefault
        headerAction={
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => router.push('/trainer/template')}
              style={({ pressed }) => [styles.headerLink, pressed && styles.headerLinkPressed]}
              accessibilityRole="link"
            >
              <Text style={styles.headerLinkText}>Plantillas</Text>
            </Pressable>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/program/[id]/info',
                  params: { id: program.id },
                })
              }
              style={({ pressed }) => [styles.headerLink, pressed && styles.headerLinkPressed]}
              accessibilityRole="link"
            >
              <Text style={styles.headerLinkText}>Ver ficha</Text>
            </Pressable>
          </View>
        }
        buildSessionDraft={buildSessionDraft}
        buildRestDayDraft={buildRestDayDraft}
        loadSessionDraft={loadSessionDraft}
        saveSession={saveSession}
        onSessionEdit={handleSessionPress}
        onSessionPreview={(item) => {
          openTrainerPreviewSession(router, item, previewState);
        }}
        onSessionCopy={handleSessionCopy}
        onCopyDayToDate={handleCopyDayToDate}
        onSessionDelete={handleSessionDelete}
        onSessionMoveToDate={handleSessionMoveToDate}
        onSessionReorderDay={handleSessionReorderDay}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  loadingCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  athleteScroll: {
    flex: 1,
  },
  athleteContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  athleteHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  athleteHeaderCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  athleteTitle: {
    ...typography.h2,
    color: colors.text,
  },
  athleteSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  joinButton: {
    marginTop: spacing.xs,
  },
  activeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: `${colors.accent}18`,
    borderWidth: 1,
    borderColor: `${colors.accent}55`,
  },
  activeBadgeText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  emptyCard: {
    padding: spacing.lg,
  },
  emptyTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: spacing.xs,
  },
  headerLink: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}14`,
  },
  headerLinkPressed: {
    opacity: 0.85,
  },
  headerLinkText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
});
