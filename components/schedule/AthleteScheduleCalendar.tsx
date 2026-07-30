import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ProgramSchedulePreview } from '@/components/trainer/ProgramSchedulePreview';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import {
  buildAthleteCalendarItems,
  loadAthleteScheduleSources,
} from '@/lib/athleteSchedule';
import { createEmptySessionDraft } from '@/lib/trainerSessionDraft';
import { createPersonalizedPlanPreviewProgram } from '@/lib/personalizedPlanContent';
import { openCalendarDay, openScheduledSession } from '@/lib/sessionNavigation';
import type { Program } from '@/lib/types';

interface AthleteScheduleCalendarProps {
  program?: Program;
  title?: string;
  subtitle?: string;
}

export function AthleteScheduleCalendar({
  program,
  title = 'Tu calendario',
  subtitle = 'Pulsa un día o una sesión para registrar tu entreno',
}: AthleteScheduleCalendarProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Awaited<ReturnType<typeof loadAthleteScheduleSources>>['plans']>([]);
  const [workouts, setWorkouts] = useState<Awaited<ReturnType<typeof loadAthleteScheduleSources>>['workouts']>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user?.id) {
        setPlans([]);
        setWorkouts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await loadAthleteScheduleSources(user.id, program?.id);
        if (cancelled) return;
        setPlans(data.plans);
        setWorkouts(data.workouts);
      } catch {
        if (!cancelled) {
          setPlans([]);
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
  }, [user?.id, program?.id]);

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
    <View style={styles.wrap}>
      <SectionHeader title={title} subtitle={subtitle} />
      <ProgramSchedulePreview
        program={calendarProgram}
        workouts={workouts}
        draft={emptyDraft}
        isNewSession={false}
        athleteSchedule={calendarItems}
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
  card: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
});
