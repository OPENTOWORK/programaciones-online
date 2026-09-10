import type {
  SupportCategory,
  SupportTicket,
  SupportTicketPriority,
  SupportTicketStatus,
} from '@/lib/supportService';
import type { UserRole } from '@/lib/types';

/** Un ticket resuelto o cerrado nunca debe tapar uno pendiente. */
const LIFECYCLE_RANK: Record<SupportTicketStatus, number> = {
  open: 0,
  in_progress: 0,
  waiting_user: 0,
  resolved: 1,
  closed: 2,
};

const PRIORITY_RANK: Record<SupportTicketPriority, number> = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3,
};

/**
 * Orden de la bandeja del administrador:
 * 1. pendientes antes que resueltos/cerrados
 * 2. con mensajes nuevos del usuario
 * 3. prioridad urgente, luego alta
 * 4. tickets abiertos
 * 5. actividad más reciente
 */
export function compareAdminSupportTickets(left: SupportTicket, right: SupportTicket): number {
  const byLifecycle = LIFECYCLE_RANK[left.status] - LIFECYCLE_RANK[right.status];
  if (byLifecycle !== 0) return byLifecycle;

  const byUnread = (right.unreadForAdmin > 0 ? 1 : 0) - (left.unreadForAdmin > 0 ? 1 : 0);
  if (byUnread !== 0) return byUnread;

  const byPriority = PRIORITY_RANK[left.priority] - PRIORITY_RANK[right.priority];
  if (byPriority !== 0) return byPriority;

  const byOpen = (left.status === 'open' ? 0 : 1) - (right.status === 'open' ? 0 : 1);
  if (byOpen !== 0) return byOpen;

  return right.lastMessageAt.localeCompare(left.lastMessageAt);
}

export function sortAdminSupportTickets(tickets: readonly SupportTicket[]): SupportTicket[] {
  return [...tickets].sort(compareAdminSupportTickets);
}

export type SupportRoleFilter = 'all' | 'atleta' | 'entrenador';

export interface SupportTicketFilters {
  status: SupportTicketStatus | 'all';
  role: SupportRoleFilter;
  category: SupportCategory | 'all';
  priority: SupportTicketPriority | 'all';
  assignedAdminId: string | 'all' | 'unassigned';
  query: string;
}

export const EMPTY_SUPPORT_FILTERS: SupportTicketFilters = {
  status: 'all',
  role: 'all',
  category: 'all',
  priority: 'all',
  assignedAdminId: 'all',
  query: '',
};

function matchesQuery(ticket: SupportTicket, normalizedQuery: string) {
  if (!normalizedQuery) return true;

  return (
    ticket.subject.toLowerCase().includes(normalizedQuery) ||
    ticket.requesterName.toLowerCase().includes(normalizedQuery) ||
    ticket.requesterEmail.toLowerCase().includes(normalizedQuery) ||
    String(ticket.ticketNumber).includes(normalizedQuery.replace(/\D/g, ''))
  );
}

function matchesRole(role: UserRole, filter: SupportRoleFilter) {
  if (filter === 'all') return true;
  return role === filter;
}

export function filterSupportTickets(
  tickets: readonly SupportTicket[],
  filters: SupportTicketFilters,
): SupportTicket[] {
  const normalizedQuery = filters.query.trim().toLowerCase();
  const digitsOnly = normalizedQuery.replace(/\D/g, '');

  return tickets.filter((ticket) => {
    if (filters.status !== 'all' && ticket.status !== filters.status) return false;
    if (filters.category !== 'all' && ticket.category !== filters.category) return false;
    if (filters.priority !== 'all' && ticket.priority !== filters.priority) return false;
    if (!matchesRole(ticket.requesterRole, filters.role)) return false;

    if (filters.assignedAdminId === 'unassigned' && ticket.assignedAdminId) return false;
    if (
      filters.assignedAdminId !== 'all' &&
      filters.assignedAdminId !== 'unassigned' &&
      ticket.assignedAdminId !== filters.assignedAdminId
    ) {
      return false;
    }

    if (!normalizedQuery) return true;
    if (digitsOnly && String(ticket.ticketNumber).includes(digitsOnly)) return true;
    return matchesQuery(ticket, normalizedQuery);
  });
}

export interface SupportKpis {
  open: number;
  inProgress: number;
  waitingUser: number;
  resolvedToday: number;
}

function isToday(iso: string | undefined, now: Date) {
  if (!iso) return false;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function computeSupportKpis(
  tickets: readonly SupportTicket[],
  now = new Date(),
): SupportKpis {
  return {
    open: tickets.filter((ticket) => ticket.status === 'open').length,
    inProgress: tickets.filter((ticket) => ticket.status === 'in_progress').length,
    waitingUser: tickets.filter((ticket) => ticket.status === 'waiting_user').length,
    resolvedToday: tickets.filter((ticket) => isToday(ticket.resolvedAt, now)).length,
  };
}

/** Etiqueta relativa corta para la columna de última actividad. */
export function formatRelativeTime(iso: string, now = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = now.getTime() - date.getTime();
  const minutes = Math.round(diffMs / 60_000);

  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes} min`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;

  const days = Math.round(hours / 24);
  if (days < 30) return `Hace ${days} día${days === 1 ? '' : 's'}`;

  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}
