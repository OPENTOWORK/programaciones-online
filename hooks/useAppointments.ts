import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import {
  buildAppointmentCancelledMessage,
  buildAppointmentConfirmedMessage,
  buildAppointmentProposedMessage,
  notifyAppointment,
} from '@/lib/appointmentNotices';
import { splitAppointmentsByTime } from '@/lib/appointmentSchedule';
import {
  cancelAppointment,
  confirmAppointment,
  createAppointment,
  fetchAppointments,
  type AppointmentDraft,
} from '@/lib/appointmentService';
import { isTrainerRole } from '@/lib/athleteService';
import { createStaleRefresh } from '@/lib/staleRefresh';
import type { Appointment } from '@/lib/types';

export function useAppointments() {
  const { user, isDemoMode } = useAuth();
  const userId = user?.id;
  const isTrainer = isTrainerRole(user?.role);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [persistent, setPersistent] = useState(true);
  const refreshGate = useRef(createStaleRefresh(45_000));

  const useLocalStore = isDemoMode || !persistent;

  const load = useCallback(
    async ({ silent = false, force = false }: { silent?: boolean; force?: boolean } = {}) => {
      if (!userId) return;
      if (!force && silent && !refreshGate.current.shouldRefresh(false)) return;

      if (!silent) setIsLoading(true);

      try {
        const board = await fetchAppointments({ userId, isTrainer, isDemoMode });
        setAppointments(board.appointments);
        setPersistent(board.persistent);
        setError(null);
        refreshGate.current.markFetched();
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar las citas');
      } finally {
        setIsLoading(false);
      }
    },
    [userId, isTrainer, isDemoMode],
  );

  useEffect(() => {
    refreshGate.current = createStaleRefresh(45_000);
    void load({ force: true });
  }, [load]);

  useFocusRefresh(() => load({ silent: true }));

  const upsert = useCallback((appointment: Appointment) => {
    setAppointments((current) => {
      const exists = current.some((item) => item.id === appointment.id);
      const next = exists
        ? current.map((item) => (item.id === appointment.id ? appointment : item))
        : [...current, appointment];

      return next.sort((left, right) => right.startsAt.localeCompare(left.startsAt));
    });
  }, []);

  const create = useCallback(
    async (draft: AppointmentDraft) => {
      if (!userId) return { error: 'Sesión no disponible.' };

      const { appointment, error: createError } = await createAppointment(draft, {
        userId,
        isTrainer,
        useLocalStore,
      });

      if (!appointment) return { error: createError };

      upsert(appointment);
      void notifyAppointment(
        appointment,
        buildAppointmentProposedMessage(appointment, isTrainer),
        isTrainer,
      );

      return { appointment, error: createError };
    },
    [userId, isTrainer, useLocalStore, upsert],
  );

  const confirm = useCallback(
    async (appointment: Appointment) => {
      if (!userId) return { error: 'Sesión no disponible.' };

      const { appointment: updated, error: confirmError } = await confirmAppointment(appointment, {
        userId,
        isTrainer,
        useLocalStore,
      });

      if (!updated) return { error: confirmError };

      upsert(updated);
      void notifyAppointment(updated, buildAppointmentConfirmedMessage(updated), isTrainer);

      return { appointment: updated };
    },
    [userId, isTrainer, useLocalStore, upsert],
  );

  const cancel = useCallback(
    async (appointment: Appointment) => {
      if (!userId) return { error: 'Sesión no disponible.' };

      const { appointment: updated, error: cancelError } = await cancelAppointment(appointment, {
        userId,
        isTrainer,
        useLocalStore,
      });

      if (!updated) return { error: cancelError };

      upsert(updated);
      void notifyAppointment(updated, buildAppointmentCancelledMessage(updated), isTrainer);

      return { appointment: updated };
    },
    [userId, isTrainer, useLocalStore, upsert],
  );

  const { upcoming, past } = useMemo(() => splitAppointmentsByTime(appointments), [appointments]);

  return {
    appointments,
    upcoming,
    past,
    isLoading,
    error,
    persistent,
    isTrainer,
    viewerId: userId,
    refresh: useCallback(() => load({ silent: true, force: true }), [load]),
    create,
    confirm,
    cancel,
  };
}
