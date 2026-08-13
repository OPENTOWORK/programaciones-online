import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ScheduleCalendarGrid } from '@/components/trainer/ScheduleCalendarGrid';
import { Card } from '@/components/ui/Card';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { buildScheduleCalendarItems } from '@/lib/scheduleCalendarItems';
import type { SchedulePreviewItem, ScheduleViewMode } from '@/lib/programSchedulePreview';
import type { Program, Workout, AthletePlan } from '@/lib/types';
import type { SessionDraft } from '@/lib/trainerSessionDraft';

interface ProgramSchedulePreviewProps {
  program: Program;
  workouts: Workout[];
  draft: SessionDraft;
  editingWorkoutId?: string | null;
  isNewSession: boolean;
  additionalDrafts?: Array<{ id: string; draft: SessionDraft; isCurrent?: boolean; isDraft?: boolean }>;
  currentSessionSaved?: boolean;
  overrideItems?: SchedulePreviewItem[];
  athleteSchedule?: {
    plans: AthletePlan[];
    workouts: Workout[];
    program?: Program;
  };
  onDayPress?: (date: Date, dayItems: SchedulePreviewItem[]) => void;
  onSessionPress?: (item: SchedulePreviewItem) => void;
  /** Al pasarlo se muestra el botón para abrir el calendario a pantalla completa. */
  onExpand?: () => void;
  /** Vista compacta para el atleta: semana entera visible de un vistazo. */
  variant?: 'trainer' | 'athlete';
}

export function ProgramSchedulePreview({
  program,
  workouts,
  draft,
  editingWorkoutId,
  isNewSession,
  additionalDrafts,
  currentSessionSaved,
  overrideItems,
  athleteSchedule,
  onDayPress,
  onSessionPress,
  onExpand,
  variant = 'trainer',
}: ProgramSchedulePreviewProps) {
  const isAthlete = variant === 'athlete';
  const [viewMode, setViewMode] = useState<ScheduleViewMode>(isAthlete ? 'day' : 'week');
  const [focusDate, setFocusDate] = useState(() => new Date());

  const items = useMemo(
    () =>
      buildScheduleCalendarItems(
        {
          program,
          workouts,
          draft,
          editingWorkoutId,
          isNewSession,
          additionalDrafts,
          currentSessionSaved,
          overrideItems,
          athleteSchedule,
        },
        focusDate,
        viewMode,
      ),
    [
      program,
      workouts,
      draft,
      editingWorkoutId,
      isNewSession,
      additionalDrafts,
      currentSessionSaved,
      overrideItems,
      athleteSchedule,
      focusDate,
      viewMode,
    ],
  );

  return (
    <Card style={[styles.panel, isAthlete && styles.panelAthlete]}>
      {!isAthlete ? (
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Vista de programación</Text>
            <Text style={styles.subtitle}>
              {onSessionPress
                ? 'Pulsa un día o una sesión para abrir la vista previa'
                : 'Previsualiza cómo verá el atleta el calendario'}
            </Text>
          </View>
          {onExpand ? (
            <Pressable
              onPress={onExpand}
              accessibilityLabel="Abrir calendario ampliado"
              style={({ pressed }) => [styles.expandBtn, pressed && styles.expandBtnPressed]}
            >
              <Ionicons name="expand-outline" size={16} color={colors.accent} />
              <Text style={styles.expandBtnText}>Vista ampliada</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {isAthlete ? (
        <ScheduleCalendarGrid
          items={items}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          focusDate={focusDate}
          onFocusDateChange={setFocusDate}
          onDayPress={onDayPress}
          onSessionPress={onSessionPress}
          size="athlete"
        />
      ) : (
        <ScrollView style={styles.body} nestedScrollEnabled showsVerticalScrollIndicator={false}>
          <ScheduleCalendarGrid
            items={items}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            focusDate={focusDate}
            onFocusDateChange={setFocusDate}
            onDayPress={onDayPress}
            onSessionPress={onSessionPress}
          />
        </ScrollView>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  panel: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    flex: 1,
    minHeight: 520,
  },
  panelAthlete: {
    padding: spacing.md,
    minHeight: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}14`,
  },
  expandBtnPressed: {
    opacity: 0.8,
  },
  expandBtnText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  body: {
    flex: 1,
  },
});
