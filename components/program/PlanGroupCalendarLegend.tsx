import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography, withAlpha } from '@/constants/theme';
import { isPlanGroupActiveForSchedulePeriod } from '@/lib/planValidity';
import type { PersonalizedPlanGroup } from '@/lib/personalizedPlanGroups';
import type { ScheduleViewMode } from '@/lib/programSchedulePreview';

function PlanStatusBadge({ active }: { active: boolean }) {
  return (
    <View style={[styles.badge, active ? styles.badgeActive : styles.badgeExpired]}>
      <Text style={[styles.badgeText, active ? styles.badgeTextActive : styles.badgeTextExpired]}>
        {active ? 'Activo' : 'Caducado'}
      </Text>
    </View>
  );
}

export function PlanGroupCalendarLegend({
  group,
  focusDate,
  viewMode,
}: {
  group: PersonalizedPlanGroup;
  focusDate: Date;
  viewMode: ScheduleViewMode;
}) {
  const active = isPlanGroupActiveForSchedulePeriod(group, focusDate, viewMode);

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.title} numberOfLines={1}>
          {group.title}
        </Text>
        <PlanStatusBadge active={active} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  title: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
    maxWidth: '100%',
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeActive: {
    backgroundColor: withAlpha(colors.success, '1A'),
    borderColor: withAlpha(colors.success, '66'),
  },
  badgeExpired: {
    backgroundColor: withAlpha(colors.danger, '14'),
    borderColor: withAlpha(colors.danger, '55'),
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 11,
  },
  badgeTextActive: {
    color: colors.success,
  },
  badgeTextExpired: {
    color: colors.danger,
  },
});
