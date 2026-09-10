import { StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import type { AppIconName } from '@/constants/icons';
import type { TrainerActivityItem, TrainerActivityKind } from '@/lib/trainerOverview';

const KIND_ICONS: Record<TrainerActivityKind, AppIconName> = {
  plan_created: 'add',
  plan_updated: 'edit',
  workout_logged: 'check',
};

const KIND_COLORS: Record<TrainerActivityKind, string> = {
  plan_created: colors.accentBlue,
  plan_updated: colors.activation,
  workout_logged: colors.metcon,
};

function formatWhen(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const startOfDay = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const dayDiff = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86_400_000);

  if (dayDiff === 0) return `Hoy, ${time}`;
  if (dayDiff === 1) return `Ayer, ${time}`;
  if (dayDiff < 7) return `Hace ${dayDiff} días, ${time}`;

  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function TrainerActivityFeed({
  items,
  loading = false,
}: {
  items: readonly TrainerActivityItem[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <View style={styles.list}>
        {[0, 1, 2].map((index) => (
          <View key={index} style={styles.row}>
            <SkeletonBlock height={26} width={26} radius={borderRadius.full} />
            <View style={styles.copy}>
              <SkeletonBlock height={13} width="55%" />
              <SkeletonBlock height={11} width="30%" style={styles.skeletonSpacer} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <Text style={styles.empty}>
        Todavía no hay actividad registrada para este entrenador.
      </Text>
    );
  }

  return (
    <View style={styles.list}>
      {items.map((item) => {
        const color = KIND_COLORS[item.kind];

        return (
          <View key={item.id} style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: withAlpha(color, '1F') }]}>
              <AppIcon name={KIND_ICONS[item.kind]} size={14} color={color} outlined />
            </View>
            <View style={styles.copy}>
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
                {item.athleteName ? (
                  <Text style={styles.athlete}> · {item.athleteName}</Text>
                ) : null}
              </Text>
              <Text style={styles.when}>{formatWhen(item.at)}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  description: {
    ...typography.bodySmall,
    color: colors.text,
    lineHeight: 19,
  },
  athlete: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  when: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  skeletonSpacer: {
    marginTop: 6,
  },
  empty: {
    ...typography.bodySmall,
    color: colors.textMuted,
    lineHeight: 20,
  },
});
