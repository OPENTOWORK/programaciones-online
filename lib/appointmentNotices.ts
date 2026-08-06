import { appointmentDayLabel, appointmentTimeRange } from '@/lib/appointmentSchedule';
import { sendAthleteMessage, sendTrainerReply } from '@/lib/trainerService';
import type { Appointment } from '@/lib/types';

/* No hay notificaciones push, así que los avisos de cita van por el chat entrenador-atleta, que es
 * donde las dos partes ya miran. */

function when(appointment: Appointment) {
  return `${appointmentDayLabel(appointment)} · ${appointmentTimeRange(appointment)}`;
}

export function buildAppointmentProposedMessage(appointment: Appointment, byTrainer: boolean) {
  const intro = byTrainer
    ? `Te propongo una cita: ${appointment.title}`
    : `He pedido una cita: ${appointment.title}`;

  return `${intro}\n${when(appointment)}\nConfírmala o cámbiala en Perfil › Citas.`;
}

export function buildAppointmentConfirmedMessage(appointment: Appointment) {
  const link = appointment.meetingUrl ? `\nEnlace: ${appointment.meetingUrl}` : '';
  return `Cita confirmada: ${appointment.title}\n${when(appointment)}${link}`;
}

export function buildAppointmentCancelledMessage(appointment: Appointment) {
  return `Cita cancelada: ${appointment.title}\n${when(appointment)}`;
}

/** Avisa a la otra parte por el chat. Nunca bloquea la operación: si el chat falla, la cita ya está guardada. */
export async function notifyAppointment(appointment: Appointment, text: string, byTrainer: boolean) {
  try {
    if (byTrainer) {
      await sendTrainerReply(appointment.athleteId, text);
      return;
    }

    await sendAthleteMessage(appointment.athleteId, text);
  } catch {
    // El aviso es un extra: no tiene sentido dar error de cita por no poder escribir en el chat.
  }
}
