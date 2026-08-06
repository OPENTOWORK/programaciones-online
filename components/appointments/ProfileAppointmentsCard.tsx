import { useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconBadge } from '@/components/ui/AppIcon';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, spacing, typography } from '@/constants/theme';
import { useAppointments } from '@/hooks/useAppointments';
import {
  appointmentDayLabel,
  appointmentTimeRange,
  canConfirmAppointment,
} from '@/lib/appointmentSchedule';

const MAX_PREVIEW = 2;

/** Resumen de la agenda dentro del perfil: las próximas citas y el acceso al calendario completo. */
export function ProfileAppointmentsCard() {
  const router = useRouter();
  const { upcoming, isLoading, isTrainer, viewerId } = useAppointments();

  const pendingForMe = viewerId
    ? upcoming.filter((appointment) => canConfirmAppointment(appointment, viewerId, isTrainer)).length
    : 0;

  return (
    <Card style={styles.card}>
      <SectionHeader
        title="Citas"
        subtitle={
          isTrainer
            ? 'Videollamadas con tus atletas'
            : 'Videollamadas con tu entrenador'
        }
      />

      {pendingForMe > 0 ? (
        <View style={styles.pendingRow}>
          <Badge
            label={`${pendingForMe} por confirmar`}
            color={colors.warning}
          />
        </View>
      ) : null}

      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : upcoming.length === 0 ? (
        <Text style={styles.empty}>
          No tienes citas previstas.{' '}
          {isTrainer ? 'Propón una a cualquier atleta.' : 'Puedes pedirle una a tu entrenador.'}
        </Text>
      ) : (
        upcoming.slice(0, MAX_PREVIEW).map((appointment) => (
          <View key={appointment.id} style={styles.row}>
            <IconBadge name="calendar" containerSize={32} size={16} />
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle} numberOfLines={1}>
                {appointment.title}
              </Text>
              <Text style={styles.rowMeta}>
                {appointmentDayLabel(appointment)} · {appointmentTimeRange(appointment)}
              </Text>
            </View>
          </View>
        ))
      )}

      <Button
        title={upcoming.length > 0 ? 'Ver mis citas' : 'Abrir calendario de citas'}
        variant="outline"
        onPress={() => router.push('/profile/appointments')}
        style={styles.button}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.md,
  },
  pendingRow: {
    marginBottom: spacing.sm,
  },
  loader: {
    marginVertical: spacing.sm,
  },
  empty: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowCopy: {
    flex: 1,
  },
  rowTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  rowMeta: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  button: {
    marginTop: spacing.md,
  },
});
