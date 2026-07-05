import { StyleSheet, Text, View } from 'react-native';

import { borderRadius, colors, spacing, typography } from '@/constants/theme';

interface AdherenceChartProps {
  adherence: number;
}

const weeks = ['S1', 'S2', 'S3', 'S4'];
const weekValues = [85, 72, 90, 78];

export function AdherenceChart({ adherence }: AdherenceChartProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Adherencia mensual</Text>
        <Text style={styles.percent}>{adherence}%</Text>
      </View>
      <View style={styles.bars}>
        {weeks.map((week, i) => (
          <View key={week} style={styles.barGroup}>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { height: `${weekValues[i]}%` }]} />
            </View>
            <Text style={styles.barLabel}>{week}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  percent: {
    ...typography.h3,
    color: colors.accent,
  },
  bars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  barGroup: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    width: 32,
    height: 100,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: colors.accent,
    borderRadius: borderRadius.sm,
  },
  barLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});
