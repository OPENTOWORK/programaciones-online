import { formatDayLabel } from '@/lib/programSchedulePreview';
import type { Appointment, AppointmentStatus } from '@/lib/types';

export const APPOINTMENT_DURATION_OPTIONS = [15, 30, 45, 60, 90] as const;

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
};

const SLOT_STEP_MINUTES = 30;
const SLOT_FIRST_HOUR = 6;
const SLOT_LAST_HOUR = 22;

function pad(value: number) {
  return value.toString().padStart(2, '0');
}

/** Horas seleccionables al crear una cita, de 06:00 a 22:00 en tramos de media hora. */
export function buildTimeSlots() {
  const slots: string[] = [];
  for (let hour = SLOT_FIRST_HOUR; hour <= SLOT_LAST_HOUR; hour += 1) {
    for (let minute = 0; minute < 60; minute += SLOT_STEP_MINUTES) {
      if (hour === SLOT_LAST_HOUR && minute > 0) break;
      slots.push(`${pad(hour)}:${pad(minute)}`);
    }
  }
  return slots;
}

export function parseTimeValue(value: string) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;

  return { hours, minutes };
}

export function combineDateAndTime(date: Date, time: string) {
  const parsed = parseTimeValue(time);
  if (!parsed) return null;

  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), parsed.hours, parsed.minutes, 0, 0);
}

export function formatTime(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function appointmentStart(appointment: Appointment) {
  return new Date(appointment.startsAt);
}

export function appointmentEnd(appointment: Appointment) {
  return new Date(new Date(appointment.startsAt).getTime() + appointment.durationMinutes * 60_000);
}

export function appointmentTimeRange(appointment: Appointment) {
  return `${formatTime(appointmentStart(appointment))} – ${formatTime(appointmentEnd(appointment))}`;
}

export function appointmentDayLabel(appointment: Appointment) {
  return formatDayLabel(appointmentStart(appointment));
}

export function isSameCalendarDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  );
}

export function appointmentsForDate(appointments: readonly Appointment[], date: Date) {
  return appointments
    .filter((appointment) => isSameCalendarDay(appointmentStart(appointment), date))
    .sort((left, right) => appointmentStart(left).getTime() - appointmentStart(right).getTime());
}

/**
 * Separa la agenda en lo que queda por delante y lo ya pasado. Una cita sigue contando como próxima
 * hasta que termina, para que no desaparezca justo cuando la estás teniendo.
 */
export function splitAppointmentsByTime(appointments: readonly Appointment[], now = new Date()) {
  const upcoming: Appointment[] = [];
  const past: Appointment[] = [];

  for (const appointment of appointments) {
    if (appointment.status !== 'cancelled' && appointmentEnd(appointment).getTime() >= now.getTime()) {
      upcoming.push(appointment);
    } else {
      past.push(appointment);
    }
  }

  upcoming.sort((left, right) => appointmentStart(left).getTime() - appointmentStart(right).getTime());
  past.sort((left, right) => appointmentStart(right).getTime() - appointmentStart(left).getTime());

  return { upcoming, past };
}

/** Lado que tiene que confirmar: siempre el que no propuso la cita. */
export function awaitingConfirmationFrom(appointment: Appointment): 'athlete' | 'trainer' {
  return appointment.createdBy === appointment.athleteId ? 'trainer' : 'athlete';
}

export function canConfirmAppointment(appointment: Appointment, viewerId: string, isTrainer: boolean) {
  if (appointment.status !== 'pending') return false;
  if (appointment.createdBy === viewerId) return false;

  return awaitingConfirmationFrom(appointment) === (isTrainer ? 'trainer' : 'athlete');
}

/** Una cita ya empezada no se confirma ni se cancela: solo queda como historial. */
export function isAppointmentEditable(appointment: Appointment, now = new Date()) {
  return appointment.status !== 'cancelled' && appointmentEnd(appointment).getTime() >= now.getTime();
}

/** El enlace se ofrece desde diez minutos antes y hasta que termina la cita. */
export function isMeetingOpen(appointment: Appointment, now = new Date()) {
  if (appointment.status !== 'confirmed' || !appointment.meetingUrl) return false;

  const opensAt = appointmentStart(appointment).getTime() - 10 * 60_000;
  return now.getTime() >= opensAt && now.getTime() <= appointmentEnd(appointment).getTime();
}
