import type { Href } from 'expo-router';

import {
  appointmentDayLabel,
  appointmentTimeRange,
} from '@/lib/appointmentSchedule';
import { readPersistedRecord, writePersistedRecord } from '@/lib/localUserDataStorage';
import { getTrainerAthleteProfileHref } from '@/lib/navigation';
import type { AlertSource } from '@/lib/trainerAthleteAlerts';
import type { Appointment, AthleteSummary } from '@/lib/types';

export type TrainerNotificationKind = AlertSource | 'appointment';

export interface TrainerNotification {
  id: string;
  kind: TrainerNotificationKind;
  title: string;
  subtitle: string;
  href: Href;
  athleteId?: string;
  alertSource?: AlertSource;
  done?: boolean;
  doneAt?: string;
  occurredAt?: string;
}

const DONE_STORAGE_KEY = 'trainer-profile-notifications-done';
const MAX_DONE_ITEMS = 40;
const MAX_FEED_ITEMS = 40;
const KINDS: TrainerNotificationKind[] = ['chat', 'sessions', 'intake', 'appointment'];

function formatShortDate(iso?: string) {
  if (!iso) return '';
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return '';
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export function formatNotificationWhen(iso?: string) {
  if (!iso) return null;
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return null;
  return {
    date: date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
  };
}

function sortTrainerNotifications(items: TrainerNotification[]) {
  return [...items].sort((left, right) => {
    if (Boolean(left.done) !== Boolean(right.done)) return left.done ? 1 : -1;
    return (right.occurredAt ?? '').localeCompare(left.occurredAt ?? '');
  });
}

export interface TrainerNotificationDismissal {
  id: string;
  occurredAt?: string;
}

export interface TrainerNotificationMarks {
  done: TrainerNotification[];
  opened: string[];
  dismissed: TrainerNotificationDismissal[];
}

export function notificationDismissalKey(
  item: Pick<TrainerNotification, 'id' | 'occurredAt'>,
) {
  return `${item.id}::${item.occurredAt ?? ''}`;
}

export function isNotificationDismissed(
  item: TrainerNotification,
  dismissed: TrainerNotificationDismissal[],
) {
  const key = notificationDismissalKey(item);
  return dismissed.some((entry) => notificationDismissalKey(entry) === key);
}

export function upsertDismissedNotifications(
  items: Pick<TrainerNotification, 'id' | 'occurredAt'>[],
  dismissed: TrainerNotificationDismissal[],
): TrainerNotificationDismissal[] {
  const next: TrainerNotificationDismissal[] = [
    ...items.map((item) => ({ id: item.id, occurredAt: item.occurredAt })),
    ...dismissed,
  ];
  const seen = new Set<string>();
  const unique: TrainerNotificationDismissal[] = [];
  for (const entry of next) {
    const key = notificationDismissalKey(entry);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(entry);
  }
  return unique.slice(0, MAX_DONE_ITEMS * 2);
}

function pendingCopy(item: TrainerNotification) {
  if (item.kind === 'chat') return 'Mensaje por revisar';
  if (item.kind === 'sessions') return 'Entreno por revisar';
  if (item.kind === 'intake') return 'Formulario por revisar';
  return item.subtitle;
}

function withForcedPending(item: TrainerNotification): TrainerNotification {
  return {
    ...item,
    done: false,
    doneAt: undefined,
    subtitle: pendingCopy(item),
  };
}

function capTrainerNotifications(items: TrainerNotification[]) {
  const sorted = sortTrainerNotifications(items);
  const open = sorted.filter((item) => !item.done);
  const done = sorted.filter((item) => item.done);
  const remaining = Math.max(0, MAX_FEED_ITEMS - open.length);
  return [...open, ...done.slice(0, remaining)];
}

export function buildTrainerNotifications(input: {
  athletes: AthleteSummary[];
  pendingAppointments: Appointment[];
}): TrainerNotification[] {
  const items: TrainerNotification[] = [];

  for (const appointment of input.pendingAppointments) {
    const who = appointment.athleteName?.trim() || 'un atleta';
    items.push({
      id: `appointment-${appointment.id}`,
      kind: 'appointment',
      title: `Cita por confirmar · ${appointment.title}`,
      subtitle: `${who} · ${appointmentDayLabel(appointment)} · ${appointmentTimeRange(appointment)}`,
      href: '/profile/appointments',
      occurredAt: appointment.startsAt,
    });
  }

  for (const athlete of input.athletes) {
    const alerts = athlete.alerts;
    if (!alerts) continue;

    const chatActivity = alerts.chatActivityCount ?? 0;
    if (chatActivity > 0 || alerts.chatCount > 0) {
      const pending = alerts.chatCount > 0;
      const when = formatShortDate(alerts.lastChatAt);
      items.push({
        id: `chat-${athlete.id}`,
        kind: 'chat',
        title: `${athlete.name} te ha escrito`,
        subtitle: pending
          ? `${alerts.chatCount} mensaje${alerts.chatCount === 1 ? '' : 's'} nuevo${alerts.chatCount === 1 ? '' : 's'} en el chat`
          : when
            ? `Mensaje revisado · ${when}`
            : 'Mensaje revisado',
        href: { pathname: '/trainer/chat/[id]', params: { id: athlete.id } },
        athleteId: athlete.id,
        alertSource: 'chat',
        done: !pending,
        occurredAt: alerts.lastChatAt,
      });
    }

    const sessionActivity = alerts.sessionActivityCount ?? 0;
    if (sessionActivity > 0 || alerts.sessionCount > 0) {
      const pending = alerts.sessionCount > 0;
      const when = formatShortDate(alerts.lastSessionAt);
      items.push({
        id: `sessions-${athlete.id}`,
        kind: 'sessions',
        title: `${athlete.name} registró un entreno`,
        subtitle: pending
          ? `${alerts.sessionCount} registro${alerts.sessionCount === 1 ? '' : 's'} nuevo${alerts.sessionCount === 1 ? '' : 's'} para revisar`
          : when
            ? `Entreno revisado · ${when}`
            : 'Entreno revisado',
        href: getTrainerAthleteProfileHref(athlete.id),
        athleteId: athlete.id,
        alertSource: 'sessions',
        done: !pending,
        occurredAt: alerts.lastSessionAt,
      });
    }

    if (alerts.intakeCompleted || alerts.intakeChanged) {
      const pending = alerts.intakeChanged;
      const when = formatShortDate(alerts.lastIntakeAt);
      items.push({
        id: `intake-${athlete.id}`,
        kind: 'intake',
        title: `${athlete.name} actualizó su formulario`,
        subtitle: pending
          ? 'Ha completado o modificado el cuestionario de bienvenida'
          : when
            ? `Formulario revisado · ${when}`
            : 'Formulario revisado',
        href: getTrainerAthleteProfileHref(athlete.id),
        athleteId: athlete.id,
        alertSource: 'intake',
        done: !pending,
        occurredAt: alerts.lastIntakeAt,
      });
    }
  }

  return capTrainerNotifications(items);
}

export function mergeTrainerNotifications(
  feed: TrainerNotification[],
  doneItems: TrainerNotification[],
  openedIds: string[] = [],
  dismissed: TrainerNotificationDismissal[] = [],
): TrainerNotification[] {
  const doneById = new Map(doneItems.map((item) => [item.id, item]));
  const opened = new Set(openedIds);
  const feedIds = new Set(feed.map((item) => item.id));

  const merged = feed.map((item) => {
    if (opened.has(item.id)) {
      return item.done ? withForcedPending(item) : item;
    }
    const local = doneById.get(item.id);
    if (!local) return item;
    if (!item.done && item.kind !== 'appointment') {
      return { ...item, done: true, doneAt: local.doneAt };
    }
    return { ...item, done: true, doneAt: local.doneAt };
  });

  const extra = doneItems
    .filter((item) => !feedIds.has(item.id) && !opened.has(item.id))
    .map((item) => ({ ...item, done: true as const }));

  return capTrainerNotifications(
    [...merged, ...extra].filter((item) => !isNotificationDismissed(item, dismissed)),
  );
}

export function upsertDoneNotification(
  item: TrainerNotification,
  doneItems: TrainerNotification[],
): TrainerNotification[] {
  const marked: TrainerNotification = {
    ...item,
    done: true,
    doneAt: item.doneAt ?? new Date().toISOString(),
  };
  const next = [marked, ...doneItems.filter((current) => current.id !== item.id)];
  return next.slice(0, MAX_DONE_ITEMS);
}

export function dropReopenedDoneNotifications(
  feed: TrainerNotification[],
  doneItems: TrainerNotification[],
): TrainerNotification[] {
  const reopenedIds = new Set(
    feed.filter((item) => !item.done && item.kind !== 'appointment').map((item) => item.id),
  );
  return doneItems.filter((item) => !reopenedIds.has(item.id));
}

function isTrainerNotification(value: unknown): value is TrainerNotification {
  if (!value || typeof value !== 'object') return false;
  const item = value as TrainerNotification;
  return (
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.subtitle === 'string' &&
    KINDS.includes(item.kind) &&
    item.href != null
  );
}

function isNotificationDismissal(value: unknown): value is TrainerNotificationDismissal {
  if (!value || typeof value !== 'object') return false;
  const item = value as TrainerNotificationDismissal;
  return typeof item.id === 'string' && (item.occurredAt === undefined || typeof item.occurredAt === 'string');
}

function parseStoredMarks(stored: unknown): TrainerNotificationMarks {
  if (Array.isArray(stored)) {
    return {
      done: stored.filter(isTrainerNotification).slice(0, MAX_DONE_ITEMS),
      opened: [],
      dismissed: [],
    };
  }
  if (!stored || typeof stored !== 'object') {
    return { done: [], opened: [], dismissed: [] };
  }
  const record = stored as { done?: unknown; opened?: unknown; dismissed?: unknown };
  const done = Array.isArray(record.done)
    ? record.done.filter(isTrainerNotification).slice(0, MAX_DONE_ITEMS)
    : [];
  const opened = Array.isArray(record.opened)
    ? record.opened.filter((id): id is string => typeof id === 'string').slice(0, MAX_DONE_ITEMS)
    : [];
  const dismissed = Array.isArray(record.dismissed)
    ? record.dismissed.filter(isNotificationDismissal).slice(0, MAX_DONE_ITEMS * 2)
    : [];
  return { done, opened, dismissed };
}

export async function loadTrainerNotificationMarks(userId: string): Promise<TrainerNotificationMarks> {
  if (!userId) return { done: [], opened: [], dismissed: [] };
  const all = await readPersistedRecord<unknown>(DONE_STORAGE_KEY);
  return parseStoredMarks(all[userId]);
}

export async function saveTrainerNotificationMarks(
  userId: string,
  marks: TrainerNotificationMarks,
): Promise<void> {
  if (!userId) return;
  const all = await readPersistedRecord<unknown>(DONE_STORAGE_KEY);
  all[userId] = {
    done: marks.done.slice(0, MAX_DONE_ITEMS),
    opened: marks.opened.slice(0, MAX_DONE_ITEMS),
    dismissed: marks.dismissed.slice(0, MAX_DONE_ITEMS * 2),
  };
  await writePersistedRecord(DONE_STORAGE_KEY, all);
}
