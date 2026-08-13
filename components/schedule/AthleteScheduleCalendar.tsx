import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ProgramSchedulePreview } from '@/components/trainer/ProgramSchedulePreview';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { loadAthleteScheduleSources } from '@/lib/athleteSchedule';
import { createEmptySessionDraft } from '@/lib/trainerSessionDraft';
import { createPersonalizedPlanPreviewProgram } from '@/lib/personalizedPlanContent';
import { openCalendarDay, openScheduledSession } from '@/lib/sessionNavigation';
import type { AthletePlan, Program, Workout } from '@/lib/types';

interface AthleteScheduleCalendarProps {
  program?: Program;
  /** Si se indica, el calendario solo muestra estos planes asignados. */
  assignedPlans?: AthletePlan[];
  title?: string;
  subtitle?: string;
  /** Oculta el título interno (p. ej. cuando va dentro de un CollapsibleSection). */
  hideHeader?: boolean;
}

export function AthleteScheduleCalendar({
  program,
  assignedPlans,
  title = 'Tu calendario',
  subtitle,
  hideHeader = false,
}: AthleteScheduleCalendarProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadedPlans, setLoadedPlans] = useState<AthletePlan[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  const useAssignedOverride = assignedPlans !== undefined;
  const plans = useAssignedOverride ? (assignedPlans ?? []) : loadedPlans;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user?.id) {
        setLoadedPlans([]);
        setWorkouts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await loadAthleteScheduleSources(user.id, program?.id, {
          skipPlans: useAssignedOverride,
        });
        if (cancelled) return;
        if (!useAssignedOverride) {
          setLoadedPlans(data.plans);
        }
        setWorkouts(data.workouts);
      } catch {
        if (!cancelled) {
          if (!useAssignedOverride) {
            setLoadedPlans([]);
          }
          setWorkouts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [program?.id, useAssignedOverride, user?.id]);

  const calendarProgram = program ?? createPersonalizedPlanPreviewProgram('Mis entrenos');
  const emptyDraft = useMemo(() => createEmptySessionDraft(0), []);
  const calendarItems = useMemo(
    () => ({ plans, workouts, program }),
    [plans, workouts, program],
  );

  if (loading) {
    return (
      <Card style={styles.card}>
        <ActivityIndicator color={colors.accent} />
      </Card>
    );
  }

  if (plans.length === 0 && workouts.length === 0) {
    return null;
  }

  return (
    <View style={[styles.wrap, hideHeader && styles.wrapEmbedded]}>
      {hideHeader ? null : <SectionHeader title={title} subtitle={subtitle} />}
      <ProgramSchedulePreview
        program={calendarProgram}
        workouts={workouts}
        draft={emptyDraft}
        isNewSession={false}
        athleteSchedule={calendarItems}
        variant="athlete"
        onDayPress={(date) => openCalendarDay(router, date)}
        onSessionPress={(item) => openScheduledSession(router, item)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  wrapEmbedded: {
    marginTop: 0,
  },
  card: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
});
