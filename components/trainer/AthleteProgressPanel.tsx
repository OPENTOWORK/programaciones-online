import { ActivityIndicator, StyleSheet, View, type ViewStyle } from 'react-native';

import { BodyMetricsChart } from '@/components/progress/BodyMetricsChart';
import { ProgressOverview } from '@/components/progress/ProgressOverview';
import { ProgressPhotos } from '@/components/progress/ProgressPhotos';
import { RepMaxCard } from '@/components/progress/RepMaxCard';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { colors, spacing } from '@/constants/theme';
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
    <CollapsibleSection style={style} title="Progreso del atleta">
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
});
