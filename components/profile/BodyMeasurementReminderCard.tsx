import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import {
  bodyMeasurementReminderMessage,
  BODY_MEASUREMENT_REMINDER_DAYS,
} from '@/lib/bodyMeasurementReminder';

interface BodyMeasurementReminderCardProps {
  lastMeasuredAt?: string;
  onPress: () => void;
}

export function BodyMeasurementReminderCard({
  lastMeasuredAt,
  onPress,
}: BodyMeasurementReminderCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name="analytics-outline" size={22} color={colors.warning} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>Actualiza tus medidas corporales</Text>
        <Text style={styles.message}>{bodyMeasurementReminderMessage(lastMeasuredAt)}</Text>
        <Text style={styles.hint}>
          Te recomendamos volver a medirte cada {BODY_MEASUREMENT_REMINDER_DAYS} días.
        </Text>
        <Button
          title="Actualizar datos físicos"
          variant="outline"
          onPress={onPress}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: `${colors.warning}88`,
    backgroundColor: `${colors.warning}14`,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.warning}22`,
    marginTop: 2,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  message: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
    lineHeight: 16,
  },
  button: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
});
