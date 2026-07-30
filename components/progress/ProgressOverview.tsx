import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Card } from '@/components/ui/Card';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import type { AppIconName } from '@/constants/icons';

interface ProgressStat {
  icon: AppIconName;
  value: string;
  label: string;
  hint?: string;
  accent?: string;
}

interface ProgressOverviewProps {
  stats: ProgressStat[];
  dense?: boolean;
}

export function ProgressOverview({ stats, dense = false }: ProgressOverviewProps) {
  return (
    <Card style={[styles.container, dense && styles.containerDense]}>
      <View style={styles.row}>
        {stats.map((stat, index) => {
          const accent = stat.accent ?? colors.accentBlue;

          return (
            <Fragment key={stat.label}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <View style={styles.item}>
                <View
                  style={[
                    styles.iconBadge,
                    dense && styles.iconBadgeDense,
                    { backgroundColor: `${accent}18` },
                  ]}
                >
                  <AppIcon name={stat.icon} size={dense ? 16 : 18} color={accent} outlined />
                </View>
                <Text style={[styles.value, dense && styles.valueDense, { color: accent }]}>
                  {stat.value}
                </Text>
                <Text style={[styles.label, dense && styles.labelDense]}>{stat.label}</Text>
                {stat.hint ? (
                  <Text style={[styles.hint, dense && styles.hintDense]}>{stat.hint}</Text>
                ) : null}
              </View>
            </Fragment>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  containerDense: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  iconBadgeDense: {
    width: 30,
    height: 30,
    marginBottom: spacing.xs,
  },
  value: {
    ...typography.h2,
    fontSize: 24,
    lineHeight: 30,
  },
  valueDense: {
    fontSize: 20,
    lineHeight: 24,
  },
  label: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  labelDense: {
    fontSize: 11,
    lineHeight: 13,
  },
  hintDense: {
    fontSize: 10,
    lineHeight: 12,
  },
});
