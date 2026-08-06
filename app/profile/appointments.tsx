import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import { AppointmentFormModal } from '@/components/appointments/AppointmentFormModal';
import { AppointmentMonthCalendar } from '@/components/appointments/AppointmentMonthCalendar';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { useAppointments } from '@/hooks/useAppointments';
import { useAthletes } from '@/hooks/useAthletes';
import { appointmentsForDate } from '@/lib/appointmentSchedule';
import type { AppointmentDraft } from '@/lib/appointmentService';
import { formatDayLabel } from '@/lib/programSchedulePreview';
import type { Appointment } from '@/lib/types';

export default function AppointmentsScreen() {
  const {
    appointments,
    upcoming,
    isLoading,
    error,
    persistent,
    isTrainer,
    viewerId,
    create,
    confirm,
    cancel,
  } = useAppointments();
  const { athletes } = useAthletes();

  const [focusDate, setFocusDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [formVisible, setFormVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [toCancel, setToCancel] = useState<Appointment | null>(null);

  const dayAppointments = appointmentsForDate(appointments, selectedDate);

  const handleCreate = async (draft: AppointmentDraft) => {
    setSaving(true);
    const result = await create(isTrainer ? draft : { ...draft, athleteId: viewerId ?? draft.athleteId });
    setSaving(false);

    if (!result.appointment) {
      setNotice(result.error ?? 'No se pudo crear la cita.');
      return;
    }

    setNotice(result.error ?? null);
    setSelectedDate(new Date(result.appointment.startsAt));
    setFocusDate(new Date(result.appointment.startsAt));
    setFormVisible(false);
  };

  const handleConfirm = async (appointment: Appointment) => {
    setBusyId(appointment.id);
    const { error: confirmError } = await confirm(appointment);
    setBusyId(null);
    setNotice(confirmError ?? null);
  };

  const handleCancel = async (appointment: Appointment) => {
    setBusyId(appointment.id);
    const { error: cancelError } = await cancel(appointment);
    setBusyId(null);
    setToCancel(null);
    setNotice(cancelError ?? null);
  };

  return (
    <ScreenWrapper>
      <SectionHeader
        title="Citas"
        subtitle={
          isTrainer
            ? 'Propón videollamadas a tus atletas. La cita queda confirmada cuando el atleta la acepta.'
            : 'Pide una videollamada a tu entrenador o confirma las que te propone.'
        }
      />

      {!persistent ? (
        <View style={styles.banner}>
          <AppIcon name="info" size={14} color={colors.warning} />
          <Text style={styles.bannerText}>
            Las citas se guardan solo en esta sesión. Ejecuta la migración de Supabase
            (npm run supabase:appointments) para que queden guardadas de forma permanente.
          </Text>
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}

      <Card>
        <AppointmentMonthCalendar
          appointments={appointments}
          focusDate={focusDate}
          onFocusDateChange={setFocusDate}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </Card>

      <Card style={styles.card}>
        <SectionHeader title={formatDayLabel(selectedDate)} />
        {isLoading ? (
          <ActivityIndicator color={colors.accent} />
        ) : dayAppointments.length === 0 ? (
          <Text style={styles.empty}>Sin citas este día.</Text>
        ) : (
          <View style={styles.list}>
            {dayAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                viewerId={viewerId ?? ''}
                isTrainer={isTrainer}
                busy={busyId === appointment.id}
                showDay={false}
                onConfirm={handleConfirm}
                onCancel={setToCancel}
              />
            ))}
          </View>
        )}

        <Button
          title={isTrainer ? 'Proponer cita' : 'Pedir cita'}
          onPress={() => setFormVisible(true)}
          style={styles.newButton}
        />
      </Card>

      <Card style={styles.card}>
        <SectionHeader title="Próximas citas" />
        {upcoming.length === 0 ? (
          <Text style={styles.empty}>No tienes ninguna cita prevista.</Text>
        ) : (
          <View style={styles.list}>
            {upcoming.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                viewerId={viewerId ?? ''}
                isTrainer={isTrainer}
                busy={busyId === appointment.id}
                onConfirm={handleConfirm}
                onCancel={setToCancel}
              />
            ))}
          </View>
        )}
      </Card>

      <AppointmentFormModal
        visible={formVisible}
        isTrainer={isTrainer}
        athletes={athletes}
        initialDate={selectedDate}
        saving={saving}
        onClose={() => setFormVisible(false)}
        onSubmit={(draft) => void handleCreate(draft)}
      />

      <ConfirmModal
        visible={toCancel !== null}
        title="Cancelar la cita"
        message={
          toCancel
            ? `Se avisará por el chat de que "${toCancel.title}" queda cancelada.`
            : undefined
        }
        confirmLabel="Cancelar cita"
        cancelLabel="Volver"
        destructive
        onCancel={() => setToCancel(null)}
        onConfirm={() => {
          if (toCancel) void handleCancel(toCancel);
        }}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.md,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: `${colors.warning}18`,
    borderWidth: 1,
    borderColor: `${colors.warning}44`,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  bannerText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  error: {
    ...typography.bodySmall,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  notice: {
    ...typography.bodySmall,
    color: colors.warning,
    marginBottom: spacing.sm,
  },
  list: {
    gap: spacing.sm,
  },
  empty: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  newButton: {
    marginTop: spacing.md,
  },
});
