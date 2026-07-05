import { StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Card } from '@/components/ui/Card';
import { goalLabels, levelColors, borderRadius, colors, spacing, typography } from '@/constants/theme';
import type { AthleteSummary } from '@/lib/types';

interface AthleteCardProps {
  athlete: AthleteSummary;
  onPress: () => void;
}

export function AthleteCard({ athlete, onPress }: AthleteCardProps) {
  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{athlete.avatarInitials}</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.name}>{athlete.name}</Text>
          <Text style={styles.email}>{athlete.email}</Text>
          <View style={styles.metaRow}>
            {athlete.fitnessLevel ? (
              <Text style={[styles.meta, { color: levelColors[athlete.fitnessLevel] }]}>
                {athlete.fitnessLevel}
              </Text>
            ) : null}
            {athlete.mainGoal ? (
              <Text style={styles.meta}>{goalLabels[athlete.mainGoal]}</Text>
            ) : null}
          </View>
          {athlete.currentProgramName ? (
            <Text style={styles.program}>Programa: {athlete.currentProgramName}</Text>
          ) : null}
        </View>
        <View style={styles.trailing}>
          <AppIcon name="profile" size={18} color={colors.textMuted} outlined />
          {(athlete.unansweredCount ?? 0) > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {(athlete.unansweredCount ?? 0) > 99 ? '99+' : athlete.unansweredCount}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.accentBlue}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.bodySmall, color: colors.accentBlue, fontWeight: '700' },
  content: { flex: 1 },
  name: { ...typography.body, color: colors.text, fontWeight: '600' },
  email: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  meta: { ...typography.caption, color: colors.textSecondary },
  program: { ...typography.caption, color: colors.accent, marginTop: spacing.xs },
  trailing: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 28,
    gap: spacing.xs,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: borderRadius.full,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
    fontSize: 11,
    lineHeight: 14,
  },
});
