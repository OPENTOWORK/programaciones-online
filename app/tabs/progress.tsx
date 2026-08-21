import { StyleSheet, Text, View } from 'react-native';

import { BodyMetricsChart } from '@/components/progress/BodyMetricsChart';
import { MotivationBanner } from '@/components/progress/MotivationBanner';
import { ProgressOverview } from '@/components/progress/ProgressOverview';
import { ProgressPhotos } from '@/components/progress/ProgressPhotos';
import { TrainerFeedbackCard } from '@/components/progress/TrainerFeedbackCard';
import { Card } from '@/components/ui/Card';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, spacing, typography } from '@/constants/theme';
import { usePhysicalProfile } from '@/hooks/usePhysicalProfile';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { useProgress } from '@/hooks/useProgress';

export default function ProgressScreen() {
  const { progress, refresh } = useProgress();
  const { history, refresh: refreshMetrics } = usePhysicalProfile();
  useFocusRefresh(() => {
    refresh();
    void refreshMetrics();
  });

  const weeklyValue =
    progress.weeklyTarget > 0
      ? `${progress.weeklyCompleted}/${progress.weeklyTarget}`
      : `${progress.weeklyCompleted}`;

  const monthlyValue =
    progress.monthlyTarget > 0
      ? `${progress.monthlyCompleted}/${progress.monthlyTarget}`
      : `${progress.monthlyCompleted}`;

  return (
    <ScreenWrapper style={styles.screen}>
      <View style={styles.layout}>
        <Text style={styles.title}>Mi Progreso</Text>

        <MotivationBanner dense message={progress.motivationalStatus} />

        <ProgressOverview
          dense
          stats={[
            {
              icon: 'calendar',
              value: weeklyValue,
              label: 'Esta semana',
              hint: 'entrenamientos',
            },
            {
              icon: 'calendar',
              value: monthlyValue,
              label: 'Este mes',
              hint: 'entrenamientos',
            },
            {
              icon: 'streak',
              value: `${progress.streak}`,
              label: 'Racha',
              hint: progress.streak === 1 ? 'día' : 'días',
              accent: colors.accent,
            },
          ]}
        />

        <View style={styles.block}>
          <Text style={styles.sectionTitle}>Historial reciente</Text>
          {progress.history.length === 0 ? (
            <Card style={styles.denseCard}>
              <Text style={styles.emptyText}>Cuando completes entrenamientos, aparecerán aquí.</Text>
            </Card>
          ) : (
            <View style={styles.historyGrid}>
              {progress.history.map((log) => (
                <Card key={log.id} style={styles.historyCard}>
                  <Text style={styles.historyName} numberOfLines={1}>
                    {log.workoutName}
                  </Text>
                  <Text style={styles.historyMeta} numberOfLines={1}>
                    {log.completedAt} · {log.duration}
                  </Text>
                </Card>
              ))}
            </View>
          )}
        </View>

        <BodyMetricsChart entries={history} />

        <ProgressPhotos dense />
        <TrainerFeedbackCard dense />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  layout: {
    flex: 1,
    gap: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 2,
  },
  block: {
    gap: spacing.xs,
    flexShrink: 1,
  },
  sectionTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  denseCard: {
    padding: spacing.sm + 2,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  historyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  historyCard: {
    width: '48%',
    flexGrow: 1,
    padding: spacing.sm + 2,
    marginBottom: 0,
  },
  historyName: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  historyMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
});
