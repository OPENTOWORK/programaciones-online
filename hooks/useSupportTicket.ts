import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { isAdminRole } from '@/lib/athleteService';
import {
  fetchSupportMessages,
  fetchSupportTicket,
  markSupportTicketRead,
  replySupportTicket,
  updateSupportTicket,
  type SupportMessage,
  type SupportTicket,
  type SupportTicketPriority,
  type SupportTicketStatus,
} from '@/lib/supportService';

/** Detalle de un ticket, compartido por la vista del usuario y la del administrador. */
export function useSupportTicket(ticketId: string) {
  const { user } = useAuth();
  const isAdmin = isAdminRole(user?.role);

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!ticketId) {
        setIsLoading(false);
        return;
      }

      if (!silent) setIsLoading(true);

      const ticketResult = await fetchSupportTicket(ticketId);
      if (ticketResult.error || !ticketResult.data) {
        setTicket(null);
        setMessages([]);
        setError(ticketResult.error ?? 'No se pudo cargar la solicitud.');
        setIsLoading(false);
        return;
      }

      const messagesResult = await fetchSupportMessages(ticketId);

      setTicket(ticketResult.data);
      setMessages(messagesResult.data ?? []);
      setError(messagesResult.error ?? null);
      setIsLoading(false);

      // Al abrir la conversación se marcan como leídos los mensajes de la otra parte.
      await markSupportTicketRead(ticketId);
    },
    [ticketId],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const reply = useCallback(
    async (message: string, options?: { isInternal?: boolean }) => {
      if (!ticket) return { error: 'Solicitud no disponible.' };
      if (!user?.role) return { error: 'Tu sesión ha caducado. Vuelve a entrar.' };
      if (!options?.isInternal && ticket.status === 'closed') {
        return { error: 'No se pueden enviar nuevas respuestas a una solicitud cerrada.' };
      }

      setSending(true);
      const result = await replySupportTicket({
        ticketId: ticket.id,
        message,
        senderRole: user.role,
        isInternal: options?.isInternal,
      });
      setSending(false);

      if (result.error) return { error: result.error };

      await load({ silent: true });
      return {};
    },
    [load, ticket, user?.role],
  );

  const changeTicket = useCallback(
    async (changes: {
      status?: SupportTicketStatus;
      priority?: SupportTicketPriority;
      assignedAdminId?: string | null;
    }) => {
      if (!ticket || !isAdmin) return { error: 'No tienes permiso para hacer eso.' };

      setUpdating(true);
      const result = await updateSupportTicket(ticket.id, changes);
      setUpdating(false);

      if (result.error) return { error: result.error };
      if (result.data) setTicket(result.data);
      return {};
    },
    [isAdmin, ticket],
  );

  return {
    ticket,
    messages,
    isLoading,
    error,
    sending,
    updating,
    isAdmin,
    currentUserId: user?.id,
    reply,
    changeTicket,
    refresh: useCallback(() => load({ silent: true }), [load]),
  };
}
