import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AthleteScheduleCalendar } from '@/components/schedule/AthleteScheduleCalendar';
import { Card } from '@/components/ui/Card';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { usePrograms } from '@/hooks/usePrograms';
import {
  buildAthleteCalendarItems,
  loadAthleteScheduleSources,
  sessionsForDate,
} from '@/lib/athleteSchedule';
import { formatDayLabel } from '@/lib/programSchedulePreview';
import { openScheduledSession } from '@/lib/sessionNavigation';

export default function CalendarDayScreen() {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date: string }>();
  const { user } = useAuth();
  const { getById } = usePrograms();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Awaited<ReturnType<typeof loadAthleteScheduleSources>>['plans']>([]);
  const [workouts, setWorkouts] = useState<Awaited<ReturnType<typeof loadAthleteScheduleSources>>['workouts']>([]);

  const activeProgram = user?.currentProgramId ? getById(user.currentProgramId) : undefined;
  const dayDate = useMemo(() => (date ? new Date(`${date}T12:00:00`) : new Date()), [date]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const data = await loadAthleteScheduleSources(user.id, activeProgram?.id);
      if (cancelled) return;
      setPlans(data.plans);
      setWorkouts(data.workouts);
      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [user?.id, activeProgram?.id]);

  const daySessions = useMemo(() => {
    const items = buildAthleteCalendarItems({
      plans,
      workouts,
      program: activeProgram,
      focusDate: dayDate,
      viewMode: 'day',
    });
    return { items, sessions: sessionsForDate(items, dayDate) };
  }, [plans, workouts, activeProgram, dayDate]);

  return (
    <ScreenWrapper>
      <SectionHeader
        title={formatDayLabel(dayDate)}
        subtitle="Sesiones programadas para este día"
      />

      {loading ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : daySessions.sessions.length === 0 ? (
        <Card>
          <Text style={styles.emptyTitle}>Sin sesiones este día</Text>
          <Text style={styles.emptyText}>
            No tienes entrenos programados para esta fecha. Revisa tu calendario para otros días.
          </Text>
        </Card>
      ) : (
        <View style={styles.list}>
          {daySessions.sessions.map((session) => (
            <Pressable
              key={session.id}
              onPress={() => {
                const item = daySessions.items.find((entry) => entry.id === session.id);
                if (item) openScheduledSession(router, item);
              }}
              style={({ pressed }) => [styles.sessionCard, pressed && styles.sessionCardPressed]}
            >
              <Text style={styles.sessionName}>{session.name}</Text>
              <Text style={styles.sessionMeta}>
                {session.dayLabel} · {session.estimatedDuration}
              </Text>
              <Text style={styles.sessionHint}>
                {session.kind === 'pdf'
                  ? 'Pulsa para abrir el PDF del entreno'
                  : 'Pulsa para abrir y registrar tu entreno'}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <AthleteScheduleCalendar program={activeProgram} title="Calendario completo" />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: spacing.xl },
  list: { gap: spacing.sm, marginBottom: spacing.lg },
  sessionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  sessionCardPressed: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '10'),
  },
  sessionName: { ...typography.body, color: colors.text, fontWeight: '700' },
  sessionMeta: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 4 },
  sessionHint: { ...typography.caption, color: colors.accent, marginTop: spacing.sm, fontWeight: '600' },
  emptyTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  emptyText: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 22 },
});
