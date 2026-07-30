import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { FeedbackAttachmentList } from '@/components/feedback/FeedbackAttachmentList';
import { AppIcon } from '@/components/ui/AppIcon';
import { Card } from '@/components/ui/Card';
import { colors, spacing, typography } from '@/constants/theme';
import { useTrainerAthleteFeedback } from '@/hooks/useTrainerAthleteFeedback';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function TrainerFeedbackCard({ dense = false }: { dense?: boolean }) {
  const { latest, isLoading } = useTrainerAthleteFeedback();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Feedback del entrenador</Text>
      <Card style={dense ? styles.cardDense : styles.card}>
        {isLoading ? (
          <ActivityIndicator color={colors.accent} />
        ) : latest ? (
          <View style={styles.row}>
            <View style={styles.icon}>
              <AppIcon name="trainer" size={18} color={colors.accent} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.meta}>Último feedback · {formatDate(latest.createdAt)}</Text>
              {latest.message ? <Text style={styles.message}>{latest.message}</Text> : null}
              <FeedbackAttachmentList attachments={latest.attachments} />
            </View>
          </View>
        ) : (
          <View style={styles.row}>
            <View style={styles.icon}>
              <AppIcon name="trainer" size={18} color={colors.textMuted} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.emptyTitle}>Sin feedback todavía</Text>
              <Text style={styles.emptyText}>
                Cuando tu entrenador revise tu progreso, su comentario aparecerá aquí.
              </Text>
            </View>
          </View>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  card: {
    padding: spacing.md,
  },
  cardDense: {
    padding: spacing.sm + 2,
    marginBottom: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.accent}18`,
  },
  copy: {
    flex: 1,
  },
  meta: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
    marginBottom: 3,
  },
  message: {
    ...typography.bodySmall,
    color: colors.text,
    lineHeight: 19,
  },
  emptyTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  emptyText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 17,
    marginTop: 2,
  },
});
