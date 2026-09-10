import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { useAppointments } from '@/hooks/useAppointments';
import { useAthletes } from '@/hooks/useAthletes';
import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { isTrainerRole } from '@/lib/athleteService';
import { canConfirmAppointment } from '@/lib/appointmentSchedule';
import { mockAthletes, mockTrainerMessages } from '@/lib/mockData';
import { fetchTrainerChatPreviews, type TrainerChatPreview } from '@/lib/trainerService';
import { getDemoTrainerMessages } from '@/lib/trainerWelcomeMessage';
import {
  markAthleteAlertRead,
  markAthleteAlertUnread,
  withAlertSourceCleared,
  withAlertSourceReopened,
  type AlertSource,
} from '@/lib/trainerAthleteAlerts';
import {
  buildTrainerNotifications,
  dropReopenedDoneNotifications,
  loadTrainerNotificationMarks,
  mergeTrainerNotifications,
  notificationDismissalKey,
  saveTrainerNotificationMarks,
  upsertDismissedNotifications,
  upsertDoneNotification,
  type TrainerNotification,
  type TrainerNotificationDismissal,
} from '@/lib/trainerNotifications';

interface TrainerNotificationsContextValue {
  items: TrainerNotification[];
  count: number;
  /** Mensajes del atleta sin responder, según la bandeja de chats. */
  chatUnread: number;
  counts: {
    chat: number;
    sessions: number;
    intake: number;
    appointment: number;
    total: number;
  };
  isLoading: boolean;
  toggle: (item: TrainerNotification) => Promise<void>;
  removeMany: (items: TrainerNotification[]) => Promise<void>;
  acknowledgeChat: (athleteId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const EMPTY_COUNTS = {
  chat: 0,
  sessions: 0,
  intake: 0,
  appointment: 0,
  total: 0,
};

const EMPTY_CONTEXT: TrainerNotificationsContextValue = {
  items: [],
  count: 0,
  chatUnread: 0,
  counts: EMPTY_COUNTS,
  isLoading: false,
  toggle: async () => undefined,
  removeMany: async () => undefined,
  acknowledgeChat: async () => undefined,
  refresh: async () => undefined,
};

function previewUnreadFromMessages(
  athleteId: string,
  messages: { sender: string; text: string; timestamp: string }[],
): TrainerChatPreview | undefined {
  const last = messages[messages.length - 1];
  if (!last) return undefined;

  let unread = 0;
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index].sender === 'user') unread += 1;
    else break;
  }

  return {
    athleteId,
    lastText: last.text.trim(),
    lastAt: last.timestamp,
    lastSender: last.sender === 'trainer' ? 'trainer' : 'user',
    unread,
  };
}

const TrainerNotificationsContext = createContext<TrainerNotificationsContextValue>(EMPTY_CONTEXT);

function TrainerNotificationsProviderInner({ children }: { children: ReactNode }) {
  const { user, isDemoMode } = useAuth();
  const userId = user?.id ?? '';
  const { athletes, isLoading: athletesLoading, refresh: refreshAthletes, patchAthlete } =
    useAthletes();
  const { upcoming, isLoading: appointmentsLoading, viewerId, isTrainer, refresh: refreshAppointments } =
    useAppointments();

  const [doneItems, setDoneItems] = useState<TrainerNotification[]>([]);
  const [openedIds, setOpenedIds] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState<TrainerNotificationDismissal[]>([]);
  const [chatPreviews, setChatPreviews] = useState<Record<string, TrainerChatPreview>>({});
  const persistUserId = useRef(userId);
  persistUserId.current = userId;
  const dismissedRef = useRef(dismissed);
  dismissedRef.current = dismissed;
  const openedIdsRef = useRef(openedIds);
  openedIdsRef.current = openedIds;
  const athletesRef = useRef(athletes);
  athletesRef.current = athletes;

  const athleteIdsKey = useMemo(
    () => athletes.map((athlete) => athlete.id).sort().join(','),
    [athletes],
  );

  const loadChatPreviews = useCallback(async () => {
    if (isDemoMode) {
      const demoPreviews: Record<string, TrainerChatPreview> = {};
      for (const athlete of mockAthletes) {
        const messages = getDemoTrainerMessages(athlete.id, mockTrainerMessages);
        const preview = previewUnreadFromMessages(athlete.id, messages);
        if (preview) demoPreviews[athlete.id] = preview;
      }
      setChatPreviews(demoPreviews);
      return;
    }

    const athleteIds = athletesRef.current.map((athlete) => athlete.id);
    if (athletesLoading || athleteIds.length === 0) {
      setChatPreviews((current) => (Object.keys(current).length === 0 ? current : {}));
      return;
    }

    const data = await fetchTrainerChatPreviews(athleteIds);
    setChatPreviews(data);
  }, [athleteIdsKey, athletesLoading, isDemoMode]);

  const refresh = useCallback(async () => {
    await refreshAthletes(true);
    refreshAppointments();
    await loadChatPreviews();
  }, [loadChatPreviews, refreshAppointments, refreshAthletes]);

  useFocusRefresh(() => {
    void refresh();
  });

  useEffect(() => {
    void loadChatPreviews();
  }, [loadChatPreviews]);

  useEffect(() => {
    let cancelled = false;
    if (!userId) {
      setDoneItems([]);
      setOpenedIds([]);
      setDismissed([]);
      return;
    }
    void loadTrainerNotificationMarks(userId).then((marks) => {
      if (cancelled) return;
      setDoneItems(marks.done);
      setOpenedIds(marks.opened);
      setDismissed(marks.dismissed);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const feed = useMemo(() => {
    const pendingAppointments = viewerId
      ? upcoming.filter((appointment) => canConfirmAppointment(appointment, viewerId, isTrainer))
      : [];
    return buildTrainerNotifications({
      athletes,
      pendingAppointments,
    });
  }, [athletes, upcoming, viewerId, isTrainer]);

  useEffect(() => {
    setDoneItems((current) => {
      const next = dropReopenedDoneNotifications(feed, current);
      if (next.length === current.length && next.every((item, index) => item.id === current[index]?.id)) {
        return current;
      }
      if (persistUserId.current) {
        void saveTrainerNotificationMarks(persistUserId.current, {
          done: next,
          opened: openedIdsRef.current,
          dismissed: dismissedRef.current,
        });
      }
      return next;
    });
  }, [feed]);

  const items = useMemo(
    () => mergeTrainerNotifications(feed, doneItems, openedIds, dismissed),
    [feed, doneItems, openedIds, dismissed],
  );

  const pendingCount = useMemo(() => items.filter((item) => !item.done).length, [items]);
  const counts = useMemo(() => {
    const pending = items.filter((item) => !item.done);
    return {
      chat: pending.filter((item) => item.kind === 'chat').length,
      sessions: pending.filter((item) => item.kind === 'sessions').length,
      intake: pending.filter((item) => item.kind === 'intake').length,
      appointment: pending.filter((item) => item.kind === 'appointment').length,
      total: pending.length,
    };
  }, [items]);

  const chatUnread = useMemo(
    () => Object.values(chatPreviews).reduce((sum, preview) => sum + (preview.unread ?? 0), 0),
    [chatPreviews],
  );

  const persistMarks = useCallback(
    (
      done: TrainerNotification[],
      opened: string[],
      dismissedItems: TrainerNotificationDismissal[] = dismissedRef.current,
    ) => {
      setDoneItems(done);
      setOpenedIds(opened);
      setDismissed(dismissedItems);
      if (persistUserId.current) {
        void saveTrainerNotificationMarks(persistUserId.current, {
          done,
          opened,
          dismissed: dismissedItems,
        });
      }
    },
    [],
  );

  const patchAlert = useCallback(
    (item: TrainerNotification, reopen: boolean) => {
      if (!item.athleteId || !item.alertSource) return;
      const athlete = athletes.find((current) => current.id === item.athleteId);
      if (!athlete?.alerts) return;
      patchAthlete(item.athleteId, {
        alerts: reopen
          ? withAlertSourceReopened(athlete.alerts, item.alertSource)
          : withAlertSourceCleared(athlete.alerts, item.alertSource),
      });
    },
    [athletes, patchAthlete],
  );

  const toggle = useCallback(
    async (item: TrainerNotification) => {
      if (item.done) {
        persistMarks(
          doneItems.filter((current) => current.id !== item.id),
          [item.id, ...openedIds.filter((id) => id !== item.id)].slice(0, 40),
        );
        patchAlert(item, true);
        if (item.athleteId && item.alertSource) {
          await markAthleteAlertUnread(item.athleteId, item.alertSource);
        }
        return;
      }

      persistMarks(
        upsertDoneNotification(item, doneItems),
        openedIds.filter((id) => id !== item.id),
      );
      patchAlert(item, false);
      if (item.athleteId && item.alertSource) {
        await markAthleteAlertRead(item.athleteId, item.alertSource);
      }
    },
    [doneItems, openedIds, patchAlert, persistMarks],
  );

  const acknowledgeChat = useCallback(
    async (athleteId: string) => {
      if (!athleteId) return;

      const athlete = athletesRef.current.find((current) => current.id === athleteId);
      if (athlete?.alerts) {
        patchAthlete(athleteId, {
          alerts: withAlertSourceCleared(athlete.alerts, 'chat'),
        });
      }

      await markAthleteAlertRead(athleteId, 'chat');
      await refreshAthletes(true);
      await loadChatPreviews();
    },
    [loadChatPreviews, patchAthlete, refreshAthletes],
  );

  const removeMany = useCallback(
    async (itemsToRemove: TrainerNotification[]) => {
      if (itemsToRemove.length === 0) return;
      const keys = new Set(itemsToRemove.map(notificationDismissalKey));
      const ids = new Set(itemsToRemove.map((item) => item.id));
      persistMarks(
        doneItems.filter((current) => !keys.has(notificationDismissalKey(current)) && !ids.has(current.id)),
        openedIds.filter((id) => !ids.has(id)),
        upsertDismissedNotifications(itemsToRemove, dismissedRef.current),
      );

      const pendingAlerts = itemsToRemove.filter((item) => !item.done);
      for (const item of pendingAlerts) {
        patchAlert(item, false);
      }
      await Promise.all(
        pendingAlerts
          .filter((item): item is TrainerNotification & { athleteId: string; alertSource: AlertSource } =>
            Boolean(item.athleteId && item.alertSource),
          )
          .map((item) => markAthleteAlertRead(item.athleteId, item.alertSource)),
      );
    },
    [doneItems, openedIds, patchAlert, persistMarks],
  );

  const value = useMemo(
    () => ({
      items,
      count: pendingCount,
      chatUnread,
      counts,
      isLoading: athletesLoading || appointmentsLoading,
      toggle,
      removeMany,
      acknowledgeChat,
      refresh,
    }),
    [
      items,
      pendingCount,
      chatUnread,
      counts,
      athletesLoading,
      appointmentsLoading,
      toggle,
      removeMany,
      acknowledgeChat,
      refresh,
    ],
  );

  return (
    <TrainerNotificationsContext.Provider value={value}>{children}</TrainerNotificationsContext.Provider>
  );
}

export function TrainerNotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!isTrainerRole(user?.role)) {
    return <>{children}</>;
  }
  return <TrainerNotificationsProviderInner>{children}</TrainerNotificationsProviderInner>;
}

export function useTrainerNotifications() {
  return useContext(TrainerNotificationsContext);
}
