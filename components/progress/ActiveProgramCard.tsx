import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { IconBadge } from '@/components/ui/AppIcon';
import { colors, spacing, typography } from '@/constants/theme';
import type { ActiveProgramSummary } from '@/lib/types';

interface ActiveProgramCardProps {
  active: ActiveProgramSummary;
}

export function ActiveProgramCard({ active }: ActiveProgramCardProps) {
  return (
    <LinearGradient colors={[colors.surface, `${colors.accent}18`]} style={styles.card}>
      <Text style={styles.label}>Programación activa</Text>
      <View style={styles.titleRow}>
        <IconBadge name={active.program.icon} containerSize={36} size={18} />
        <Text style={styles.name}>{active.program.name}</Text>
      </View>
      <View style={styles.nextWorkout}>
        <Text style={styles.nextLabel}>Próximo entrenamiento</Text>
        <Text style={styles.nextName}>{active.nextWorkout.name}</Text>
        <Text style={styles.nextMeta}>
          {active.nextWorkout.dayLabel} · {active.nextWorkout.estimatedDuration}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.accent}44`,
  },
  label: { ...typography.caption, color: colors.accent, fontWeight: '700', textTransform: 'uppercase' },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  name: { ...typography.h3, color: colors.text, flex: 1 },
  nextWorkout: { marginTop: spacing.sm },
  nextLabel: { ...typography.caption, color: colors.textMuted },
  nextName: { ...typography.body, color: colors.text, fontWeight: '600', marginTop: 4 },
  nextMeta: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
});
