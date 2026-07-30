import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { SessionLogVideos } from '@/components/workout/SessionLogVideos';
import { colors, spacing, typography } from '@/constants/theme';
import type { SessionLogRecord } from '@/lib/sessionLogService';

function formatLogDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function AthleteSessionLogCard({
  log,
  onPress,
}: {
  log: SessionLogRecord;
  onPress?: () => void;
}) {
  const completedCount = log.completedItems.length;

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={onPress ? `Abrir registro de ${log.workoutName}` : undefined}
        style={({ pressed }) => [onPress && pressed && styles.pressed]}
      >
        <Card style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{log.workoutName}</Text>
            <View style={styles.headerRight}>
              <Text style={styles.date}>{formatLogDate(log.scheduledDate)}</Text>
              {onPress ? <Text style={styles.chevron}>›</Text> : null}
            </View>
          </View>
          <Text style={styles.meta}>
            {completedCount > 0 ? `${completedCount} partes completadas` : 'Sin partes marcadas'}
            {log.duration ? ` · ${log.duration}` : ''}
          </Text>
          {log.feelings ? (
            <View style={styles.feelingsWrap}>
              <Text style={styles.feelingsLabel}>Sensaciones</Text>
              <Text style={styles.feelingsText} numberOfLines={2}>
                {log.feelings}
              </Text>
            </View>
          ) : (
            <Text style={styles.noFeelings}>Sin comentarios de sensaciones</Text>
          )}
          {onPress ? <Text style={styles.openHint}>Ver ejercicios y detalle de la sesión</Text> : null}
        </Card>
      </Pressable>

      <Card style={styles.videoCard}>
        <SessionLogVideos logId={log.id} readOnly compact />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.sm },
  pressed: { opacity: 0.88 },
  card: { marginBottom: spacing.xs },
  videoCard: {
    paddingTop: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: { ...typography.body, color: colors.text, fontWeight: '700', flex: 1 },
  date: { ...typography.caption, color: colors.textMuted, fontWeight: '600' },
  chevron: { ...typography.h3, color: colors.textMuted, lineHeight: 22 },
  meta: { ...typography.bodySmall, color: colors.textSecondary },
  feelingsWrap: { marginTop: spacing.sm },
  feelingsLabel: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  feelingsText: { ...typography.bodySmall, color: colors.text, lineHeight: 20 },
  noFeelings: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm, fontStyle: 'italic' },
  openHint: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
});
