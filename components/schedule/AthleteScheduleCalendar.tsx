import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAppNavigation } from '@/hooks/useAppNavigation';

import { ProgramSchedulePreview } from '@/components/trainer/ProgramSchedulePreview';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, spacing } from '@/constants/theme';
import { useAthletePreviewEffectiveUser } from '@/hooks/useAthletePreviewMode';
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
  /** Sin tarjeta propia, para incrustarlo en la home. */
  plain?: boolean;
}

export function AthleteScheduleCalendar({
  program,
  assignedPlans,
  title = 'Tu calendario',
  subtitle,
  hideHeader = false,
  plain = false,
}: AthleteScheduleCalendarProps) {
  const router = useAppNavigation();
  const { user: authUser } = useAuth();
  const previewUser = useAthletePreviewEffectiveUser();
  const scheduleUserId = previewUser?.id ?? authUser?.id;
  const [loading, setLoading] = useState(true);
  const [loadedPlans, setLoadedPlans] = useState<AthletePlan[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  const useAssignedOverride = assignedPlans !== undefined;
  const plans = useAssignedOverride ? (assignedPlans ?? []) : loadedPlans;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!scheduleUserId) {
        setLoadedPlans([]);
        setWorkouts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await loadAthleteScheduleSources(scheduleUserId, program?.id, {
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
  }, [program?.id, scheduleUserId, useAssignedOverride]);

  const calendarProgram = program ?? createPersonalizedPlanPreviewProgram('Mis entrenos');
  const emptyDraft = useMemo(() => createEmptySessionDraft(0), []);
  const calendarItems = useMemo(
    () => ({ plans, workouts, program }),
    [plans, workouts, program],
  );

  if (loading && plans.length === 0) {
    return (
      <View style={plain ? styles.plainLoading : styles.card}>
        <ActivityIndicator color={colors.accent} />
      </View>
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
        flush={plain}
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
    flex: 1,
    minHeight: 0,
    marginTop: 0,
  },
  card: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  plainLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
