import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Badge } from '@/components/ui/Badge';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import {
  APPOINTMENT_STATUS_LABELS,
  appointmentDayLabel,
  appointmentTimeRange,
  awaitingConfirmationFrom,
  canConfirmAppointment,
  isAppointmentEditable,
  isMeetingOpen,
} from '@/lib/appointmentSchedule';
import { meetingProviderLabel, openMeetingUrl } from '@/lib/meetingLinks';
import type { Appointment, AppointmentStatus } from '@/lib/types';

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  pending: colors.warning,
  confirmed: colors.accentBlue,
  cancelled: colors.textMuted,
};

interface AppointmentCardProps {
  appointment: Appointment;
  viewerId: string;
  isTrainer: boolean;
  busy?: boolean;
  showDay?: boolean;
  onConfirm: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
}

export function AppointmentCard({
  appointment,
  viewerId,
  isTrainer,
  busy = false,
  showDay = true,
  onConfirm,
  onCancel,
}: AppointmentCardProps) {
  const canConfirm = canConfirmAppointment(appointment, viewerId, isTrainer);
  const editable = isAppointmentEditable(appointment);
  const waitingFor = awaitingConfirmationFrom(appointment);
  const meetingReady = isMeetingOpen(appointment);

  /* El atleta no puede leer el perfil del entrenador, así que ahí el nombre casi siempre falta y se
   * habla de "tu entrenador". */
  const withLabel = isTrainer
    ? `con ${appointment.athleteName ?? 'tu atleta'}`
    : appointment.trainerName
      ? `con ${appointment.trainerName}`
      : appointment.trainerId
        ? 'con tu entrenador'
        : 'a falta de que un entrenador la acepte';

  return (
    <View style={[styles.card, appointment.status === 'cancelled' && styles.cardCancelled]}>
      <View style={styles.headerRow}>
        <Text style={styles.time}>{appointmentTimeRange(appointment)}</Text>
        <Badge label={APPOINTMENT_STATUS_LABELS[appointment.status]} color={STATUS_COLORS[appointment.status]} />
      </View>

      <Text style={styles.title}>{appointment.title}</Text>
      <Text style={styles.meta}>
        {showDay ? `${appointmentDayLabel(appointment)} · ` : ''}
        {appointment.durationMinutes} min · {withLabel}
      </Text>

      {appointment.notes ? <Text style={styles.notes}>{appointment.notes}</Text> : null}

      {appointment.status === 'pending' && !canConfirm && editable ? (
        <Text style={styles.waiting}>
          Esperando que {waitingFor === 'athlete' ? 'el atleta' : 'el entrenador'} la confirme
        </Text>
      ) : null}

      {appointment.meetingUrl && appointment.status !== 'cancelled' ? (
        <Pressable
          onPress={() => void openMeetingUrl(appointment.meetingUrl ?? '')}
          style={({ pressed }) => [
            styles.meetingRow,
            meetingReady && styles.meetingRowReady,
            pressed && styles.meetingRowPressed,
          ]}
        >
          <AppIcon name="video" size={16} color={meetingReady ? colors.white : colors.accent} />
          <Text style={[styles.meetingText, meetingReady && styles.meetingTextReady]}>
            {meetingReady ? 'Entrar ahora' : `Abrir ${meetingProviderLabel(appointment.meetingUrl)}`}
          </Text>
        </Pressable>
      ) : null}

      {canConfirm || editable ? (
        <View style={styles.actions}>
          {canConfirm ? (
            <Pressable
              onPress={() => onConfirm(appointment)}
              disabled={busy}
              style={({ pressed }) => [
                styles.action,
                styles.confirmAction,
                pressed && !busy && styles.actionPressed,
                busy && styles.actionDisabled,
              ]}
            >
              <Text style={styles.confirmActionText}>Confirmar</Text>
            </Pressable>
          ) : null}
          {editable ? (
            <Pressable
              onPress={() => onCancel(appointment)}
              disabled={busy}
              style={({ pressed }) => [
                styles.action,
                pressed && !busy && styles.actionPressed,
                busy && styles.actionDisabled,
              ]}
            >
              <Text style={styles.cancelActionText}>Cancelar cita</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm + 2,
    gap: spacing.xs,
  },
  cardCancelled: {
    opacity: 0.6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  time: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  title: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  notes: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  waiting: {
    ...typography.caption,
    color: colors.warning,
  },
  meetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  meetingRowReady: {
    backgroundColor: colors.accentDark,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  meetingRowPressed: {
    opacity: 0.85,
  },
  meetingText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  meetingTextReady: {
    color: colors.white,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  action: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.sm,
  },
  confirmAction: {
    backgroundColor: colors.accentDark,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  actionPressed: {
    opacity: 0.85,
  },
  actionDisabled: {
    opacity: 0.5,
  },
  confirmActionText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
  },
  cancelActionText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
