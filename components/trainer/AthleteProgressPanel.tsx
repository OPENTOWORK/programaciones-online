import { ActivityIndicator, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { BodyMetricsChart } from '@/components/progress/BodyMetricsChart';
import { ProgressOverview } from '@/components/progress/ProgressOverview';
import { ProgressPhotos } from '@/components/progress/ProgressPhotos';
import { RepMaxCard } from '@/components/progress/RepMaxCard';
import { Card } from '@/components/ui/Card';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { colors, spacing, typography } from '@/constants/theme';
import { useProgress } from '@/hooks/useProgress';
import type { BodyMeasurement } from '@/lib/bodyMetrics';

interface AthleteProgressPanelProps {
  athleteId: string;
  metricHistory: BodyMeasurement[];
  style?: ViewStyle;
}

/** Vista de solo lectura del progreso del atleta en su ficha. */
export function AthleteProgressPanel({ athleteId, metricHistory, style }: AthleteProgressPanelProps) {
  const { progress, isLoading } = useProgress(athleteId);

  const weeklyValue =
    progress.weeklyTarget > 0
      ? `${progress.weeklyCompleted}/${progress.weeklyTarget}`
      : `${progress.weeklyCompleted}`;

  const monthlyValue =
    progress.monthlyTarget > 0
      ? `${progress.monthlyCompleted}/${progress.monthlyTarget}`
      : `${progress.monthlyCompleted}`;

  return (
    <CollapsibleSection
      style={style}
      title="Progreso del atleta"
      subtitle="Entrenos, racha, medidas, fotos y RM"
    >
      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : (
        <View style={styles.content}>
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

          <Text style={styles.sectionTitle}>Historial reciente</Text>
          {progress.history.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>Todavía no hay entrenamientos registrados.</Text>
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

          <BodyMetricsChart entries={metricHistory} />

          <ProgressPhotos dense userId={athleteId} readOnly />

          <RepMaxCard dense userId={athleteId} />
        </View>
      )}
    </CollapsibleSection>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginVertical: spacing.md,
  },
  content: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  emptyCard: {
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
