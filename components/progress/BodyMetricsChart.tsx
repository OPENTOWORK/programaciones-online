import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { colors, spacing, typography } from '@/constants/theme';
import {
  BODY_METRIC_CHART_OPTIONS,
  type BodyMeasurement,
  type BodyMetricChartKey,
} from '@/lib/bodyMetrics';

interface BodyMetricsChartProps {
  entries: BodyMeasurement[];
}

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export function BodyMetricsChart({ entries }: BodyMetricsChartProps) {
  const [metric, setMetric] = useState<BodyMetricChartKey>('weightKg');
  const option = BODY_METRIC_CHART_OPTIONS.find((item) => item.id === metric) ?? BODY_METRIC_CHART_OPTIONS[0];

  const points = useMemo(() => {
    return entries
      .map((entry) => ({
        id: entry.id,
        label: formatDay(entry.measuredAt),
        value: entry[metric],
      }))
      .filter((point): point is { id: string; label: string; value: number } => typeof point.value === 'number');
  }, [entries, metric]);

  const max = Math.max(...points.map((point) => point.value), 0);
  const min = Math.min(...points.map((point) => point.value), max);
  const span = Math.max(max - min, max * 0.15, 1);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Evolución corporal</Text>
          <Text style={styles.subtitle}>Se actualiza cada vez que registras tus datos físicos</Text>
        </View>
        {points.length > 0 ? (
          <Text style={styles.latest}>
            {points[points.length - 1].value}
            {option.unit ? ` ${option.unit}` : ''}
          </Text>
        ) : null}
      </View>

      <View style={styles.tabs}>
        {BODY_METRIC_CHART_OPTIONS.map((item) => {
          const selected = item.id === metric;
          return (
            <Pressable
              key={item.id}
              onPress={() => setMetric(item.id)}
              style={[styles.tab, selected && styles.tabSelected]}
            >
              <Text style={[styles.tabText, selected && styles.tabTextSelected]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {points.length === 0 ? (
        <Text style={styles.empty}>
          Edita tus datos físicos en el perfil para generar el gráfico de {option.label.toLowerCase()}.
        </Text>
      ) : (
        <View style={styles.chart}>
          {points.map((point) => {
            const height = Math.max(10, ((point.value - min + span * 0.08) / (span + span * 0.08)) * 100);
            return (
              <View key={point.id} style={styles.barGroup}>
                <Text style={styles.barValue}>{point.value}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { height: `${height}%` }]} />
                </View>
                <Text style={styles.barLabel}>{point.label}</Text>
              </View>
            );
          })}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  latest: {
    ...typography.h3,
    color: colors.accent,
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  tab: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: colors.surface,
  },
  tabSelected: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}18`,
  },
  tabText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabTextSelected: {
    color: colors.accent,
  },
  empty: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
    minHeight: 140,
  },
  barGroup: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  barValue: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
    fontSize: 10,
  },
  barTrack: {
    width: '70%',
    maxWidth: 28,
    height: 100,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: colors.accent,
    borderRadius: 8,
  },
  barLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
  },
});
