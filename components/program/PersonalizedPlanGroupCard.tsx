import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PersonalizedPlanContent } from '@/components/program/PersonalizedPlanContent';
import { IconBadge } from '@/components/ui/AppIcon';
import { Card } from '@/components/ui/Card';
import { colors, spacing, typography } from '@/constants/theme';
import { getSessionLabel, type PersonalizedPlanGroup } from '@/lib/personalizedPlanGroups';

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
  const router = useRouter();
  const firstSession = group.sessions[0];

  return (
    <Card style={styles.card}>
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

      <View style={styles.sessions}>
        {group.sessions.map((session, index) => (
          <Pressable
            key={session.id}
            onPress={() =>
              router.push({ pathname: '/athlete/plan/[id]/session', params: { id: session.id } })
            }
            style={({ pressed }) => [styles.sessionRow, pressed && styles.sessionRowPressed]}
          >
            <Text style={styles.sessionName}>{getSessionLabel(session, index)}</Text>
            <Text style={styles.sessionChevron}>›</Text>
          </Pressable>
        ))}
      </View>

      {group.sessions.length === 1 ? (
        <View style={styles.preview}>
          <PersonalizedPlanContent
            content={firstSession.content}
            sessionNumber={firstSession.sessionNumber ?? undefined}
          />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
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
  sessions: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.background,
  },
  sessionRowPressed: {
    opacity: 0.8,
  },
  sessionName: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  sessionChevron: {
    ...typography.h3,
    color: colors.textMuted,
  },
  preview: {
    marginTop: spacing.sm,
  },
});
