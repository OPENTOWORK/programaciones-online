import { StyleSheet, Text, View } from 'react-native';

import { borderRadius, colors, spacing, typography } from '@/constants/theme';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercent?: boolean;
  color?: string;
}

export function ProgressBar({ value, max = 100, label, showPercent = true, color = colors.accent }: ProgressBarProps) {
  const percent = Math.min(100, Math.round((value / max) * 100));

  return (
    <View style={styles.container}>
      {(label || showPercent) ? (
        <View style={styles.header}>
          {label ? <Text style={styles.label}>{label}</Text> : <View />}
          {showPercent ? <Text style={styles.percent}>{percent}%</Text> : null}
        </View>
      ) : null}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  percent: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '600',
  },
  track: {
    height: 10,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
});
