import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import type { AppIconName } from '@/constants/icons';

export interface TrainerKpi {
  key: string;
  label: string;
  value: number;
  icon: AppIconName;
  tone: 'neutral' | 'positive' | 'warning' | 'danger';
  hint?: string;
  onPress?: () => void;
}

const OK_GREEN = '#4ADE80';

function toneColor(tone: TrainerKpi['tone']) {
  if (tone === 'positive') return OK_GREEN;
  if (tone === 'warning') return colors.warning;
  if (tone === 'danger') return colors.danger;
  return colors.accentBlue;
}

export function TrainerOverviewKpis({
  kpis,
  loading = false,
  columns,
}: {
  kpis: TrainerKpi[];
  loading?: boolean;
  columns: 2 | 4 | 5;
}) {
  const basis = columns === 5 ? '18%' : columns === 4 ? '23%' : '47%';

  return (
    <View style={styles.grid}>
      {kpis.map((kpi) => {
        const color = toneColor(kpi.tone);
        const interactive = Boolean(kpi.onPress) && !loading;

        return (
          <Pressable
            key={kpi.key}
            onPress={interactive ? kpi.onPress : undefined}
            disabled={!interactive}
            accessibilityRole={interactive ? 'button' : undefined}
            accessibilityLabel={interactive ? `Ver ${kpi.label}` : undefined}
            style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
              styles.tile,
              { flexBasis: basis },
              interactive && hovered && styles.tileHovered,
              pressed && interactive && styles.tilePressed,
            ]}
          >
            <View style={styles.tileHeader}>
              <View style={[styles.iconWrap, { backgroundColor: withAlpha(color, '1F') }]}>
                <AppIcon name={kpi.icon} size={15} color={color} outlined />
              </View>
              {interactive ? (
                <AppIcon name="chevronRight" size={14} color={colors.textMuted} />
              ) : null}
            </View>

            {loading ? (
              <SkeletonBlock height={26} width="45%" style={styles.valueSkeleton} />
            ) : (
              <Text style={[styles.value, kpi.value > 0 && kpi.tone !== 'neutral' && { color }]}>
                {kpi.value}
              </Text>
            )}

            <Text style={styles.label} numberOfLines={1}>
              {kpi.label}
            </Text>
            {kpi.hint ? (
              <Text style={styles.hint} numberOfLines={1}>
                {kpi.hint}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tile: {
    flexGrow: 1,
    minWidth: 150,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: 2,
    ...(Platform.OS === 'web' ? ({ transition: 'border-color 120ms ease' } as object) : null),
  },
  tileHovered: {
    borderColor: colors.textMuted,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  tilePressed: {
    opacity: 0.85,
  },
  tileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    ...typography.h1,
    fontSize: 26,
    lineHeight: 30,
    color: colors.text,
  },
  valueSkeleton: {
    marginVertical: 4,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
