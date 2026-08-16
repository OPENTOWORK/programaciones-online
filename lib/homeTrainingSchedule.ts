import { APPOINTMENT_DURATION_OPTIONS, buildTimeSlots, combineDateAndTime, formatTime, isSameCalendarDay } from '@/lib/appointmentSchedule';
import { formatDayLabel } from '@/lib/programSchedulePreview';
import type { HomeTrainingSlot, HomeTrainingSlotStatus } from '@/lib/types';

export { APPOINTMENT_DURATION_OPTIONS as HOME_TRAINING_DURATION_OPTIONS, buildTimeSlots, combineDateAndTime, formatTime };

export const HOME_TRAINING_SLOT_STATUS_LABELS: Record<HomeTrainingSlotStatus, string> = {
  open: 'Disponible',
  booked: 'Reservado',
  cancelled: 'Cancelado',
};

export function slotStart(slot: HomeTrainingSlot) {
  return new Date(slot.startsAt);
}

export function slotEnd(slot: HomeTrainingSlot) {
  return new Date(new Date(slot.startsAt).getTime() + slot.durationMinutes * 60_000);
}

export function slotTimeRange(slot: HomeTrainingSlot) {
  return `${formatTime(slotStart(slot))} – ${formatTime(slotEnd(slot))}`;
}

export function slotDayLabel(slot: HomeTrainingSlot) {
  return formatDayLabel(slotStart(slot));
}

export function slotsForDate(slots: readonly HomeTrainingSlot[], date: Date) {
  return slots
    .filter((slot) => isSameCalendarDay(slotStart(slot), date))
    .sort((left, right) => slotStart(left).getTime() - slotStart(right).getTime());
}

export function splitSlotsByTime(slots: readonly HomeTrainingSlot[]) {
  const now = Date.now();
  const upcoming: HomeTrainingSlot[] = [];
  const past: HomeTrainingSlot[] = [];

  for (const slot of slots) {
    if (slotEnd(slot).getTime() >= now && slot.status !== 'cancelled') {
      upcoming.push(slot);
    } else {
      past.push(slot);
    }
  }

  upcoming.sort((left, right) => slotStart(left).getTime() - slotStart(right).getTime());
  past.sort((left, right) => slotStart(right).getTime() - slotStart(left).getTime());

  return { upcoming, past };
}

export function canBookSlot(slot: HomeTrainingSlot, isTrainer: boolean) {
  return !isTrainer && slot.status === 'open' && slotEnd(slot).getTime() > Date.now();
}

export function canCancelSlot(slot: HomeTrainingSlot, viewerId: string, isTrainer: boolean) {
  if (slot.status === 'cancelled') return false;
  if (slotEnd(slot).getTime() < Date.now()) return false;
  if (isTrainer) return true;
  return slot.status === 'booked' && slot.athleteId === viewerId;
}
