import { SUPPORT_MESSAGE_MAX_LENGTH, SUPPORT_SUBJECT_MAX_LENGTH } from '@/constants/support';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { UserRole } from '@/lib/types';

const TICKETS_TABLE = 'support_tickets';
const MESSAGES_TABLE = 'support_messages';
const UNREAD_VIEW = 'support_ticket_unread';

const TICKET_SELECT =
  'id, ticket_number, requester_id, requester_name, requester_email, requester_role, category, subject, status, priority, assigned_admin_id, created_at, updated_at, last_message_at, resolved_at, closed_at';
const MESSAGE_SELECT =
  'id, ticket_id, sender_id, sender_role, message, is_internal, created_at, read_by_admin_at, read_by_user_at';

export type SupportTicketStatus = 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';
export type SupportTicketPriority = 'low' | 'normal' | 'high' | 'urgent';
export type SupportCategory =
  | 'technical'
  | 'account'
  | 'programs'
  | 'workouts'
  | 'billing'
  | 'suggestion'
  | 'other';

export const SUPPORT_STATUS_LABELS: Record<SupportTicketStatus, string> = {
  open: 'Abierto',
  in_progress: 'En curso',
  waiting_user: 'Esperando respuesta',
  resolved: 'Resuelto',
  closed: 'Cerrado',
};

export const SUPPORT_PRIORITY_LABELS: Record<SupportTicketPriority, string> = {
  low: 'Baja',
  normal: 'Normal',
  high: 'Alta',
  urgent: 'Urgente',
};

export const SUPPORT_CATEGORY_LABELS: Record<SupportCategory, string> = {
  technical: 'Problema técnico',
  account: 'Cuenta y acceso',
  programs: 'Programaciones',
  workouts: 'Entrenamientos',
  billing: 'Facturación',
  suggestion: 'Sugerencia',
  other: 'Otro',
};

export const SUPPORT_STATUS_ORDER: SupportTicketStatus[] = [
  'open',
  'in_progress',
  'waiting_user',
  'resolved',
  'closed',
];

export const SUPPORT_PRIORITY_ORDER: SupportTicketPriority[] = ['low', 'normal', 'high', 'urgent'];

export const SUPPORT_CATEGORY_ORDER: SupportCategory[] = [
  'technical',
  'account',
  'programs',
  'workouts',
  'billing',
  'suggestion',
  'other',
];

export interface SupportTicket {
  id: string;
  ticketNumber: number;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  requesterRole: UserRole;
  category: SupportCategory;
  subject: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  assignedAdminId?: string;
  assignedAdminName?: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  resolvedAt?: string;
  closedAt?: string;
  /** Mensajes del usuario que el equipo aún no ha leído. */
  unreadForAdmin: number;
  /** Respuestas del equipo que el usuario aún no ha leído. */
  unreadForUser: number;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId?: string;
  senderRole: UserRole;
  message: string;
  isInternal: boolean;
  createdAt: string;
  readByAdminAt?: string;
  readByUserAt?: string;
}

export interface SupportResult<T> {
  data?: T;
  error?: string;
}

/** `TP-000123` a partir del correlativo de Postgres. */
export function formatTicketNumber(ticketNumber: number) {
  return `TP-${String(ticketNumber).padStart(6, '0')}`;
}

export function isSupportTicketOpenForReplies(ticket: Pick<SupportTicket, 'status'>) {
  return ticket.status !== 'closed';
}

function asStatus(value: unknown): SupportTicketStatus {
  return SUPPORT_STATUS_ORDER.includes(value as SupportTicketStatus)
    ? (value as SupportTicketStatus)
    : 'open';
}

function asPriority(value: unknown): SupportTicketPriority {
  return SUPPORT_PRIORITY_ORDER.includes(value as SupportTicketPriority)
    ? (value as SupportTicketPriority)
    : 'normal';
}

function asCategory(value: unknown): SupportCategory {
  return SUPPORT_CATEGORY_ORDER.includes(value as SupportCategory)
    ? (value as SupportCategory)
    : 'other';
}

function asRole(value: unknown): UserRole {
  return value === 'entrenador' || value === 'administrador' || value === 'gimnasio'
    ? value
    : 'atleta';
}

function mapTicket(row: Record<string, unknown>): SupportTicket {
  return {
    id: row.id as string,
    ticketNumber: Number(row.ticket_number ?? 0),
    requesterId: row.requester_id as string,
    requesterName: ((row.requester_name as string | null) ?? '').trim() || 'Usuario',
    requesterEmail: (row.requester_email as string | null) ?? '',
    requesterRole: asRole(row.requester_role),
    category: asCategory(row.category),
    subject: (row.subject as string | null) ?? '',
    status: asStatus(row.status),
    priority: asPriority(row.priority),
    assignedAdminId: (row.assigned_admin_id as string | null) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: (row.updated_at as string | null) ?? (row.created_at as string),
    lastMessageAt: (row.last_message_at as string | null) ?? (row.created_at as string),
    resolvedAt: (row.resolved_at as string | null) ?? undefined,
    closedAt: (row.closed_at as string | null) ?? undefined,
    unreadForAdmin: 0,
    unreadForUser: 0,
  };
}

function mapMessage(row: Record<string, unknown>): SupportMessage {
  return {
    id: row.id as string,
    ticketId: row.ticket_id as string,
    senderId: (row.sender_id as string | null) ?? undefined,
    senderRole: asRole(row.sender_role),
    message: (row.message as string | null) ?? '',
    isInternal: Boolean(row.is_internal),
    createdAt: row.created_at as string,
    readByAdminAt: (row.read_by_admin_at as string | null) ?? undefined,
    readByUserAt: (row.read_by_user_at as string | null) ?? undefined,
  };
}

function isMissingSupportSchemaError(error: { message?: string; code?: string } | null | undefined) {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? '';
  return (
    message.includes('support_tickets') ||
    message.includes('support_messages') ||
    message.includes('support_ticket_unread') ||
    message.includes('create_support_ticket') ||
    message.includes('schema cache') ||
    message.includes('does not exist') ||
    message.includes('could not find the table') ||
    error.code === 'PGRST202' ||
    error.code === 'PGRST205' ||
    error.code === '42P01'
  );
}

const MIGRATION_HINT = 'Falta aplicar el soporte en Supabase: ejecuta npm run supabase:support';

function friendlyError(error: { message?: string; code?: string } | null | undefined, fallback: string) {
  if (!error) return fallback;
  if (isMissingSupportSchemaError(error)) return MIGRATION_HINT;

  const message = error.message ?? '';
  // Mensajes de `raise exception` de nuestras funciones: son legibles para el usuario.
  if (/obligatorio|iniciar sesión|permiso|administrador/i.test(message)) return message;

  // No exponemos errores internos de Postgres.
  if (/row-level security|violates|permission denied/i.test(message)) {
    return 'No tienes permiso para hacer eso.';
  }

  return fallback;
}

async function attachUnread(tickets: SupportTicket[]): Promise<SupportTicket[]> {
  if (tickets.length === 0) return tickets;

  const supabase = getSupabase();
  if (!supabase) return tickets;

  const { data, error } = await supabase
    .from(UNREAD_VIEW)
    .select('ticket_id, unread_for_admin, unread_for_user')
    .in('ticket_id', tickets.map((ticket) => ticket.id));

  if (error || !data) return tickets;

  const byTicket = new Map(
    (data as Array<Record<string, unknown>>).map((row) => [
      row.ticket_id as string,
      {
        admin: Number(row.unread_for_admin ?? 0),
        user: Number(row.unread_for_user ?? 0),
      },
    ]),
  );

  return tickets.map((ticket) => {
    const unread = byTicket.get(ticket.id);
    return unread
      ? { ...ticket, unreadForAdmin: unread.admin, unreadForUser: unread.user }
      : ticket;
  });
}

/** Tickets del usuario autenticado. La RLS ya limita el resultado a los suyos. */
export async function fetchMySupportTickets(): Promise<SupportResult<SupportTicket[]>> {
  if (!isSupabaseConfigured) return { data: [] };

  const supabase = getSupabase();
  if (!supabase) return { data: [] };

  const { data, error } = await supabase
    .from(TICKETS_TABLE)
    .select(TICKET_SELECT)
    .order('last_message_at', { ascending: false });

  if (error) {
    return { error: friendlyError(error, 'No se pudieron cargar tus solicitudes.') };
  }

  const tickets = (data as Array<Record<string, unknown>>).map(mapTicket);
  return { data: await attachUnread(tickets) };
}

/** Bandeja completa del administrador. La RLS exige `is_administrador()`. */
export async function fetchAllSupportTickets(): Promise<SupportResult<SupportTicket[]>> {
  if (!isSupabaseConfigured) return { data: [] };

  const supabase = getSupabase();
  if (!supabase) return { data: [] };

  const { data, error } = await supabase
    .from(TICKETS_TABLE)
    .select(TICKET_SELECT)
    .order('last_message_at', { ascending: false });

  if (error) {
    return { error: friendlyError(error, 'No se pudieron cargar las solicitudes.') };
  }

  const tickets = (data as Array<Record<string, unknown>>).map(mapTicket);
  return { data: await attachUnread(tickets) };
}

export async function fetchSupportTicket(ticketId: string): Promise<SupportResult<SupportTicket>> {
  if (!ticketId) return { error: 'Solicitud no encontrada.' };

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data, error } = await supabase
    .from(TICKETS_TABLE)
    .select(TICKET_SELECT)
    .eq('id', ticketId)
    .maybeSingle();

  if (error) {
    return { error: friendlyError(error, 'No se pudo cargar la solicitud.') };
  }

  if (!data) return { error: 'Esta solicitud no existe o no tienes acceso a ella.' };

  const [ticket] = await attachUnread([mapTicket(data as Record<string, unknown>)]);
  return { data: ticket };
}

export async function fetchSupportMessages(
  ticketId: string,
): Promise<SupportResult<SupportMessage[]>> {
  if (!ticketId) return { data: [] };

  const supabase = getSupabase();
  if (!supabase) return { data: [] };

  const { data, error } = await supabase
    .from(MESSAGES_TABLE)
    .select(MESSAGE_SELECT)
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  if (error) {
    return { error: friendlyError(error, 'No se pudo cargar la conversación.') };
  }

  return { data: (data as Array<Record<string, unknown>>).map(mapMessage) };
}

/** Alta atómica: la función de Postgres crea el ticket y su primer mensaje. */
export async function createSupportTicket(input: {
  category: SupportCategory;
  subject: string;
  message: string;
}): Promise<SupportResult<SupportTicket>> {
  const subject = input.subject.trim();
  const message = input.message.trim();

  if (!subject) return { error: 'El asunto es obligatorio.' };
  if (!message) return { error: 'Cuéntanos qué ocurre antes de enviar la solicitud.' };
  if (subject.length > SUPPORT_SUBJECT_MAX_LENGTH) {
    return { error: `El asunto no puede pasar de ${SUPPORT_SUBJECT_MAX_LENGTH} caracteres.` };
  }
  if (message.length > SUPPORT_MESSAGE_MAX_LENGTH) {
    return { error: `El mensaje no puede pasar de ${SUPPORT_MESSAGE_MAX_LENGTH} caracteres.` };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data, error } = await supabase.rpc('create_support_ticket', {
    p_category: input.category,
    p_subject: subject,
    p_message: message,
  });

  if (error || !data) {
    return { error: friendlyError(error, 'No se pudo enviar la solicitud. Inténtalo de nuevo.') };
  }

  return { data: mapTicket(data as Record<string, unknown>) };
}

export async function replySupportTicket(input: {
  ticketId: string;
  message: string;
  senderRole: UserRole;
  isInternal?: boolean;
}): Promise<SupportResult<SupportMessage>> {
  const message = input.message.trim();
  if (!message) return { error: 'Escribe un mensaje antes de enviarlo.' };
  if (message.length > SUPPORT_MESSAGE_MAX_LENGTH) {
    return { error: `El mensaje no puede pasar de ${SUPPORT_MESSAGE_MAX_LENGTH} caracteres.` };
  }

  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const { data: sessionData } = await supabase.auth.getSession();
  const senderId = sessionData.session?.user.id;
  if (!senderId) return { error: 'Tu sesión ha caducado. Vuelve a entrar.' };

  const { data, error } = await supabase
    .from(MESSAGES_TABLE)
    .insert({
      ticket_id: input.ticketId,
      sender_id: senderId,
      sender_role: input.senderRole,
      message,
      is_internal: input.isInternal ?? false,
    })
    .select(MESSAGE_SELECT)
    .single();

  if (error || !data) {
    return { error: friendlyError(error, 'No se pudo enviar el mensaje.') };
  }

  return { data: mapMessage(data as Record<string, unknown>) };
}

/** Solo el administrador: la RLS rechaza el update para cualquier otro rol. */
export async function updateSupportTicket(
  ticketId: string,
  changes: {
    status?: SupportTicketStatus;
    priority?: SupportTicketPriority;
    assignedAdminId?: string | null;
  },
): Promise<SupportResult<SupportTicket>> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase no está disponible.' };

  const payload: Record<string, unknown> = {};
  if (changes.status) payload.status = changes.status;
  if (changes.priority) payload.priority = changes.priority;
  if (changes.assignedAdminId !== undefined) payload.assigned_admin_id = changes.assignedAdminId;

  if (Object.keys(payload).length === 0) return { error: 'No hay cambios que guardar.' };

  const { data, error } = await supabase
    .from(TICKETS_TABLE)
    .update(payload)
    .eq('id', ticketId)
    .select(TICKET_SELECT)
    .single();

  if (error || !data) {
    return { error: friendlyError(error, 'No se pudo actualizar la solicitud.') };
  }

  return { data: mapTicket(data as Record<string, unknown>) };
}

/** Marca como leídos los mensajes que le corresponden a quien consulta. */
export async function markSupportTicketRead(ticketId: string): Promise<void> {
  if (!ticketId) return;

  const supabase = getSupabase();
  if (!supabase) return;

  await supabase.rpc('mark_support_messages_read', { p_ticket_id: ticketId });
}

/** Tickets con mensajes del usuario sin leer, para el badge del CRM. */
export async function fetchAdminSupportUnreadCount(): Promise<number> {
  if (!isSupabaseConfigured) return 0;

  const supabase = getSupabase();
  if (!supabase) return 0;

  const { data, error } = await supabase
    .from(UNREAD_VIEW)
    .select('ticket_id')
    .gt('unread_for_admin', 0);

  if (error || !data) return 0;
  return data.length;
}
