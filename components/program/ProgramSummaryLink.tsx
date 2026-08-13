import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon, IconBadge } from '@/components/ui/AppIcon';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { goalLabels, levelColors, colors, spacing, typography } from '@/constants/theme';
import type { Program } from '@/lib/types';

interface ProgramSummaryLinkProps {
  program: Program;
}

export function ProgramSummaryLink({ program }: ProgramSummaryLinkProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: '/program/[id]/info',
          params: { id: program.id },
        })
      }
      style={({ pressed }) => [pressed && styles.pressed]}
      accessibilityRole="link"
      accessibilityLabel={`Ver ficha de ${program.name}`}
    >
      <Card style={styles.card}>
        <View style={styles.row}>
          <IconBadge name={program.icon} containerSize={48} size={24} />
          <View style={styles.copy}>
            <Text style={styles.name}>{program.name}</Text>
            <View style={styles.meta}>
              <Badge label={program.level} color={levelColors[program.level]} />
              {program.goal ? (
                <Text style={styles.metaText}>{goalLabels[program.goal]}</Text>
              ) : null}
              {program.sessionsPerWeek > 0 ? (
                <Text style={styles.metaText}>{program.sessionsPerWeek}x/semana</Text>
              ) : null}
            </View>
          </View>
          <View style={styles.linkHint}>
            <Text style={styles.linkText}>Ver ficha</Text>
            <AppIcon name="chevronRight" size={16} color={colors.accent} />
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.92,
  },
  card: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    ...typography.h3,
    color: colors.text,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  linkHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  linkText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
});
