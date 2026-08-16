import { StyleSheet, Text, View } from 'react-native';

import { PersonalizedPlanContent } from '@/components/program/PersonalizedPlanContent';
import { AthleteScheduleCalendar } from '@/components/schedule/AthleteScheduleCalendar';
import { IconBadge } from '@/components/ui/AppIcon';
import { colors, spacing, typography } from '@/constants/theme';
import type { PersonalizedPlanGroup } from '@/lib/personalizedPlanGroups';

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

interface PersonalizedPlanGroupCardProps {
  group: PersonalizedPlanGroup;
}

export function PersonalizedPlanGroupCard({ group }: PersonalizedPlanGroupCardProps) {
  const firstSession = group.sessions[0];

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <IconBadge name="personal" containerSize={44} size={22} />
        <View style={styles.headerText}>
          <Text style={styles.title}>{group.title}</Text>
          <Text style={styles.date}>
            {group.sessions.length} sesión{group.sessions.length === 1 ? '' : 'es'} · Asignado el{' '}
            {formatDate(firstSession.createdAt)}
          </Text>
        </View>
      </View>

      <AthleteScheduleCalendar assignedPlans={group.sessions} hideHeader />

      {group.sessions.length === 1 ? (
        <View style={styles.preview}>
          <PersonalizedPlanContent
            content={firstSession.content}
            sessionNumber={firstSession.sessionNumber ?? undefined}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  date: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  preview: {
    marginTop: spacing.sm,
  },
});
