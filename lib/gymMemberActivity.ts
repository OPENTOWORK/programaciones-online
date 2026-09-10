import {
  GYM_BOOKING_STATUS_LABELS,
  GYM_MEMBERSHIP_STATUS_LABELS,
  GYM_MEMBER_PIPELINE_LABELS,
  GYM_MEMBER_STATUS_LABELS,
  type GymBooking,
  type GymMember,
  type GymMemberMembership,
} from '@/lib/gymTypes';

export type GymMemberActivityTone = 'default' | 'success' | 'warning' | 'muted';

export interface GymMemberActivityEntry {
  id: string;
  at: string;
  label: string;
  detail?: string;
  tone?: GymMemberActivityTone;
}

function formatActivityWhen(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T12:00:00`).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatGymMemberActivityWhen(value: string) {
  return formatActivityWhen(value);
}

/** Cronología de movimientos del miembro a partir de datos ya cargados en el CRM. */
export function buildGymMemberActivityTimeline(
  member: GymMember,
  bookings: readonly GymBooking[],
  memberships: readonly GymMemberMembership[],
): GymMemberActivityEntry[] {
  const entries: GymMemberActivityEntry[] = [];

  entries.push({
    id: `joined-${member.id}`,
    at: `${member.joinedAt}T12:00:00`,
    label: 'Alta en el gimnasio',
    detail: `${GYM_MEMBER_STATUS_LABELS[member.status]} · ${GYM_MEMBER_PIPELINE_LABELS[member.pipelineStage]}`,
  });

  if (member.createdAt && member.createdAt.slice(0, 10) !== member.joinedAt) {
    entries.push({
      id: `created-${member.id}`,
      at: member.createdAt,
      label: 'Ficha creada en el CRM',
      tone: 'muted',
    });
  }

  if (member.updatedAt && member.updatedAt !== member.createdAt) {
    entries.push({
      id: `updated-${member.id}-${member.updatedAt}`,
      at: member.updatedAt,
      label: 'Ficha actualizada',
      detail: `${GYM_MEMBER_STATUS_LABELS[member.status]} · ${GYM_MEMBER_PIPELINE_LABELS[member.pipelineStage]}`,
      tone: 'muted',
    });
  }

  for (const membership of memberships) {
    entries.push({
      id: `membership-${membership.id}`,
      at: `${membership.startsAt}T12:00:00`,
      label: `Tarifa: ${membership.planName ?? 'Membresía'}`,
      detail: `${GYM_MEMBERSHIP_STATUS_LABELS[membership.status]}${
        membership.endsAt ? ` · hasta ${formatActivityWhen(membership.endsAt)}` : ''
      }`,
    });
  }

  for (const booking of bookings) {
    const classLabel = booking.classTitle ?? 'Clase';
    const classWhen = booking.classStartAt ? formatActivityWhen(booking.classStartAt) : undefined;

    entries.push({
      id: `booking-${booking.id}`,
      at: booking.bookedAt,
      label: `Reserva: ${classLabel}`,
      detail: classWhen
        ? `${GYM_BOOKING_STATUS_LABELS[booking.status]} · ${classWhen}`
        : GYM_BOOKING_STATUS_LABELS[booking.status],
    });

    if (booking.checkedInAt) {
      entries.push({
        id: `checkin-${booking.id}`,
        at: booking.checkedInAt,
        label: `Asistencia: ${classLabel}`,
        detail: classWhen,
        tone: 'success',
      });
    }

    if (booking.cancelledAt) {
      entries.push({
        id: `cancel-${booking.id}`,
        at: booking.cancelledAt,
        label: `Reserva cancelada: ${classLabel}`,
        detail: classWhen,
        tone: 'warning',
      });
    }
  }

  return entries.sort((left, right) => new Date(right.at).getTime() - new Date(left.at).getTime());
}
