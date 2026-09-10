import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import type { AdminGymRow } from '@/lib/gymAdminService';
import { GYM_STATUS_LABELS, type GymStatus } from '@/lib/gymTypes';

const STATUS_COLORS: Record<GymStatus, string> = {
  active: '#4ADE80',
  trial: colors.accentBlue,
  suspended: colors.warning,
  cancelled: colors.danger,
};

interface CrmGymCardProps {
  row: AdminGymRow;
  onPress: () => void;
}

export function CrmGymCard({ row, onPress }: CrmGymCardProps) {
  const statusColor = STATUS_COLORS[row.gym.status];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Abrir ficha de ${row.gym.name}`}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.logo}>
        <Text style={styles.logoText}>{row.gym.name.slice(0, 2).toUpperCase()}</Text>
      </View>

      <View style={styles.copy}>
        <Text style={styles.name} numberOfLines={1}>{row.gym.name}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {row.gym.city ?? row.gym.email ?? 'Sin ubicación'}
        </Text>
        <Text style={styles.stats} numberOfLines={1}>
          {row.stats?.totalMembers ?? 0} miembros · {row.stats?.bookingsLast30Days ?? 0} reservas 30d
        </Text>
      </View>

      <View style={styles.trailing}>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: withAlpha(statusColor, '1F'),
              borderColor: withAlpha(statusColor, '4D'),
            },
          ]}
        >
          <Text style={[styles.badgeText, { color: statusColor }]}>
            {GYM_STATUS_LABELS[row.gym.status]}
          </Text>
        </View>
        <AppIcon name="chevronRight" size={14} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardPressed: {
    opacity: 0.9,
    backgroundColor: colors.surfaceLight,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: withAlpha(colors.accentBlue, '22'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    ...typography.caption,
    color: colors.accentBlue,
    fontWeight: '800',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  name: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  stats: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  trailing: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 10,
  },
});
