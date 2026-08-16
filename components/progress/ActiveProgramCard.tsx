import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { IconBadge } from '@/components/ui/AppIcon';
import { colors, spacing, typography } from '@/constants/theme';
import type { ActiveProgramSummary } from '@/lib/types';

interface ActiveProgramCardProps {
  active: ActiveProgramSummary;
  dense?: boolean;
}

export function ActiveProgramCard({ active, dense = false }: ActiveProgramCardProps) {
  return (
    <LinearGradient
      colors={[colors.surface, `${colors.accent}18`]}
      style={[styles.card, dense && styles.cardDense]}
    >
      <Text style={[styles.label, dense && styles.labelDense]}>Programación activa</Text>
      <View style={[styles.titleRow, dense && styles.titleRowDense]}>
        <IconBadge name={active.program.icon} containerSize={dense ? 30 : 36} size={dense ? 16 : 18} />
        <Text style={[styles.name, dense && styles.nameDense]} numberOfLines={dense ? 1 : undefined}>
          {active.program.name}
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
  cardDense: {
    padding: spacing.sm + 2,
    marginBottom: spacing.sm,
    borderRadius: 12,
  },
  labelDense: {
    fontSize: 10,
  },
  titleRowDense: {
    marginVertical: spacing.xs,
    gap: spacing.xs,
  },
  nameDense: {
    ...typography.body,
    fontWeight: '700',
  },
  label: { ...typography.caption, color: colors.accent, fontWeight: '700', textTransform: 'uppercase' },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  name: { ...typography.h3, color: colors.text, flex: 1 },
});
