import { useFocusEffect } from 'expo-router';
import { useEmbeddedRouteParams } from '@/hooks/useEmbeddedRouteParams';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { borderRadius, goalLabels, levelColors, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useAthlete } from '@/hooks/useAthletes';
import { useAthleteIntakeForm } from '@/hooks/useAthleteIntakeForm';
import { useAthleteIntakeForms } from '@/hooks/useAthleteIntakeForms';
import { useAuth } from '@/hooks/useAuth';
import { useCanManageAthleteChat } from '@/hooks/useCanManageAthleteChat';
import { isTrainerRole } from '@/lib/athleteService';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { usePhysicalProfile } from '@/hooks/usePhysicalProfile';
import { useTrainerAthletePlans } from '@/hooks/useAthletePlans';
import { useTrainerAthleteFeedback } from '@/hooks/useTrainerAthleteFeedback';
import { useTrainerCrmActivity } from '@/hooks/useTrainerCrmActivity';
import { fetchAthletePlansForAthlete } from '@/lib/athletePlanService';
import { copyCalendarDaySessions, copyCalendarSession } from '@/lib/copyCalendarDaySessions';
import {
  createPersonalizedPlanPreviewProgram,
  parsePersonalizedPlanContent,
  serializePersonalizedPlanContent,
  validatePersonalizedPlanDraft,
} from '@/lib/personalizedPlanContent';
import {
  buildPlanGroupExerciseNoteSections,
  countPlanGroupExerciseNotes,
  sessionLogIdsForPlanGroup,
} from '@/lib/planGroupExerciseNotes';
import {
  filterActivePersonalizedPlanGroups,
  findPlanGroup,
  getNextSessionNumber,
  splitAssignedPlans,
  type PersonalizedPlanGroup,
} from '@/lib/personalizedPlanGroups';
import { buildPlanGroupSessionContentsForValidityChange, countSessionsOutsidePlanValidity, earliestScheduledDateForPlans, formatPlanDateDisplay, type PlanValidity } from '@/lib/planValidity';
import { convertSessionContentToWeeklyRecurrence } from '@/lib/planGroupRecurrence';
import type { SchedulePreviewItem } from '@/lib/programSchedulePreview';
import type { ScheduleCalendarSource } from '@/lib/scheduleCalendarItems';
import { buildDayOrderUpdates } from '@/lib/scheduleDayOrder';
import { moveCalendarSessionToDate } from '@/lib/moveCalendarSession';
import { hasSessionBlockContent } from '@/lib/sessionBlockSections';
import { formatScheduleSummary, toLocalDateString, toWeekdayIndex } from '@/lib/sessionSchedule';
import {
  createEmptySessionDraft,
  createRestDayDraft,
  isActivationSessionDraft,
  isRestDaySessionDraft,
  renameSessionCopy,
  type SessionDraft,
} from '@/lib/trainerSessionDraft';
import {
  formatBmi,
  formatDerived,
  formatKcal,
  formatMeasured,
  primaryGoalLabels,
} from '@/lib/bodyMetrics';
import { getTrainerAthleteProfileHref } from '@/lib/navigation';
import { openTrainerPreviewSession } from '@/lib/sessionNavigation';
import { fetchAthleteSessionLogs } from '@/lib/sessionLogService';
import {
  markAthleteAlertRead,
  withAlertSourceCleared,
  type AlertSource,
} from '@/lib/trainerAthleteAlerts';
import type { AthletePlan } from '@/lib/types';
import { fetchAthleteExerciseNotes } from '@/lib/trainerExerciseNoteService';
import { AlertDismissButton } from '@/components/trainer/AlertDismissButton';
import { AthleteSessionLogsPanel } from '@/components/trainer/AthleteSessionLogsPanel';
import { AthleteProgressPanel } from '@/components/trainer/AthleteProgressPanel';
import {
  ScheduleCalendarModal,
  type CalendarSessionSaveInput,
} from '@/components/trainer/ScheduleCalendarModal';
import { AssignedPlansList } from '@/components/program/AssignedPlansList';
import { PlanGroupPrivateNotesModal } from '@/components/trainer/PlanGroupPrivateNotesModal';
import { IntakeAnswersTable } from '@/components/trainer/IntakeAnswersTable';
import { DynamicIntakeAnswersTable } from '@/components/intake/DynamicIntakeAnswersTable';

function formatActivityDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function applyDateToDraft(draft: SessionDraft, date: Date): SessionDraft {
  const schedule = {
    weekdays: [toWeekdayIndex(date)],
    recurrence: 'once' as const,
    startDate: toLocalDateString(date),
  };
  return { ...draft, schedule, dayLabel: formatScheduleSummary(schedule) };
}

function formatOptionalValue(value: string | number | undefined, suffix = '') {
  if (value === undefined || value === null || value === '') {
    return 'No indicado';
  }

  return `${value}${suffix}`;
}

type PendingDelete = {
  title: string;
  message: string;
  onConfirm: () => void;
};

export default function AthleteDetailScreen() {
  const { id: rawId } = useEmbeddedRouteParams<{ id?: string | string[] }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const router = useAppNavigation();
  const { user } = useAuth();
  const canChat = useCanManageAthleteChat(id ?? '');
  const { removePlan, createPlan, updatePlan } = useTrainerAthletePlans();
  const { athlete, isLoading, refresh: refreshAthlete } = useAthlete(id ?? '');
  const {
    entries: activityEntries,
    isLoading: activityLoading,
    persistent: activityPersistent,
    addNote,
    removeEntry: removeActivityEntry,
  } = useTrainerCrmActivity(id ?? '');
  const { form: intakeForm, isLoading: intakeLoading, isComplete: intakeComplete, usesCustomForms } =
    useAthleteIntakeForm(id, user?.id);
  const { statuses: intakeStatuses, isLoading: intakeStatusesLoading } = useAthleteIntakeForms(id, user?.id);
  const {
    basics: physicalBasics,
    measured: physicalMeasured,
    derived: physicalDerived,
    history: physicalHistory,
  } = usePhysicalProfile(id, { heightCm: athlete?.height, weightKg: athlete?.weight });
  const athleteFeedback = useTrainerAthleteFeedback(id ?? '');
  const [noteText, setNoteText] = useState('');
  const [assignedPlans, setAssignedPlans] = useState<AthletePlan[]>([]);
  const [sessionLogs, setSessionLogs] = useState<Awaited<ReturnType<typeof fetchAthleteSessionLogs>>>([]);
  const [sessionLogViewMode, setSessionLogViewMode] = useState<'list' | 'calendar'>('calendar');
  const [dismissedAlertSources, setDismissedAlertSources] = useState<AlertSource[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [planActionError, setPlanActionError] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [privateNotesGroup, setPrivateNotesGroup] = useState<PersonalizedPlanGroup | null>(null);
  const [planPrivateNotesCounts, setPlanPrivateNotesCounts] = useState<Record<string, number>>({});
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [sectionsKey, setSectionsKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setSectionsKey((current) => current + 1);
    }, []),
  );

  const loadAssignedPlans = useCallback(async () => {
    if (!id || !user?.id) {
      setAssignedPlans([]);
      setPlansLoading(false);
      return;
    }

    setPlansLoading(true);
    setPlanActionError(null);

    try {
      const data = await fetchAthletePlansForAthlete(id);
      setAssignedPlans(data);
    } catch {
      setAssignedPlans([]);
    } finally {
      setPlansLoading(false);
    }
  }, [id, user?.id]);

  useFocusRefresh(
    () => loadAssignedPlans(),
    () => refreshAthlete(),
  );

  useEffect(() => {
    let cancelled = false;

    async function loadLogs() {
      if (!id) {
        setSessionLogs([]);
        setLogsLoading(false);
        return;
      }

      setLogsLoading(true);
      try {
        const logs = await fetchAthleteSessionLogs(id);
        if (!cancelled) setSessionLogs(logs);
      } catch {
        if (!cancelled) setSessionLogs([]);
      } finally {
        if (!cancelled) setLogsLoading(false);
      }
    }

    void loadLogs();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    setDismissedAlertSources([]);
  }, [id]);

  const visibleAlerts = useMemo(() => {
    if (!athlete?.alerts) return null;
    const hiddenSources = canChat ? dismissedAlertSources : [...dismissedAlertSources, 'chat' as AlertSource];
    return hiddenSources.reduce(
      (current, source) => withAlertSourceCleared(current, source),
      athlete.alerts,
    );
  }, [athlete?.alerts, canChat, dismissedAlertSources]);

  const latestSessionLogId = useMemo(() => {
    if (athlete?.alerts?.lastSessionLogId) return athlete.alerts.lastSessionLogId;
    const latest = [...sessionLogs].sort((left, right) =>
      (right.updatedAt ?? right.completedAt ?? right.scheduledDate).localeCompare(
        left.updatedAt ?? left.completedAt ?? left.scheduledDate,
      ),
    )[0];
    return latest?.id;
  }, [athlete?.alerts?.lastSessionLogId, sessionLogs]);

  const dismissAlert = useCallback(
    (source: AlertSource) => {
      setDismissedAlertSources((current) => (current.includes(source) ? current : [...current, source]));
      if (id) {
        void markAthleteAlertRead(id, source);
      }
    },
    [id],
  );

  const handleDeletePlan = async (planId: string) => {
    const result = await removePlan(planId);
    if (result.error) {
      setPlanActionError(result.error);
      return;
    }
    await loadAssignedPlans();
  };

  const handleDeleteSession = (planId: string, label: string) => {
    setPendingDelete({
      title: 'Eliminar sesión',
      message: `Se eliminará ${label}. Esta acción no se puede deshacer.`,
      onConfirm: () => void handleDeletePlan(planId),
    });
  };

  const handleDeleteGroup = (group: PersonalizedPlanGroup) => {
    const sessionCount = group.sessions.length;
    const sessionLabel = sessionCount === 1 ? 'su sesión' : `sus ${sessionCount} sesiones`;
    setPendingDelete({
      title: 'Eliminar plan',
      message: `Se eliminará «${group.title}» y ${sessionLabel}. Esta acción no se puede deshacer.`,
      onConfirm: () => {
        void (async () => {
          for (const session of group.sessions) {
            const result = await removePlan(session.id);
            if (result.error) {
              setPlanActionError(result.error);
              return;
            }
          }
          await loadAssignedPlans();
        })();
      },
    });
  };

  const handleUpdateGroupValidity = async (group: PersonalizedPlanGroup, validity: PlanValidity) => {
    setPlanActionError(null);

    const updatedContents = buildPlanGroupSessionContentsForValidityChange(
      group.sessions,
      group.validity,
      validity,
    );

    const shiftedSessions = group.sessions.map((session, index) => ({
      ...session,
      content: updatedContents[index] ?? session.content,
    }));

    const hiddenCount = countSessionsOutsidePlanValidity(shiftedSessions, validity);
    if (hiddenCount > 0) {
      const earliest = earliestScheduledDateForPlans(shiftedSessions);
      setPlanActionError(
        `Tras mover las sesiones, ${hiddenCount} quedarían fuera de la vigencia. ` +
          `La primera sesión programada es el ${earliest ? formatPlanDateDisplay(earliest) : '—'}: ajusta «Desde» o «Hasta».`,
      );
      return;
    }

    for (const [index, session] of group.sessions.entries()) {
      const content = updatedContents[index];
      if (!content) continue;
      const result = await updatePlan(session.id, {
        athleteId: session.athleteId,
        planType: session.planType,
        title: session.title,
        content,
      });
      if (result.error) {
        setPlanActionError(result.error);
        return;
      }
    }

    await loadAssignedPlans();
  };

  const handleRepeatGroupWeekly = async (group: PersonalizedPlanGroup) => {
    setPlanActionError(null);

    for (const session of group.sessions) {
      const sessionNumber = session.sessionNumber ?? 1;
      const content = convertSessionContentToWeeklyRecurrence(session.content, sessionNumber);
      const result = await updatePlan(session.id, {
        athleteId: session.athleteId,
        planType: session.planType,
        title: session.title,
        content,
      });
      if (result.error) {
        setPlanActionError(result.error);
        return;
      }
    }

    await loadAssignedPlans();
  };

  const handleDeleteNutritionPlan = (planId: string, title: string) => {
    setPendingDelete({
      title: 'Eliminar plan nutricional',
      message: `Se eliminará «${title}». Esta acción no se puede deshacer.`,
      onConfirm: () => void handleDeletePlan(planId),
    });
  };

  const openPlanGroupEditor = (group: PersonalizedPlanGroup) => {
    const firstSession = group.sessions[0];
    if (!firstSession) return;
    router.push({
      pathname: '/trainer/plan/[id]',
      params: { id: firstSession.id, edit: 'group' },
    });
  };

  const openPlanGroupSessions = (group: PersonalizedPlanGroup) => {
    const firstSession = group.sessions[0];
    if (!firstSession) return;
    router.push({ pathname: '/trainer/plan/[id]', params: { id: firstSession.id } });
  };

  const calendarPersonalizedGroups = useMemo(
    () => splitAssignedPlans(assignedPlans, { includeEnded: true }).personalizedGroups,
    [assignedPlans],
  );

  const allCalendarPlans = useMemo(
    () => calendarPersonalizedGroups.flatMap((group) => group.sessions),
    [calendarPersonalizedGroups],
  );

  const defaultCalendarPlanGroup = useMemo(() => {
    const active = filterActivePersonalizedPlanGroups(calendarPersonalizedGroups);
    return active[0] ?? calendarPersonalizedGroups[0];
  }, [calendarPersonalizedGroups]);

  const calendarSource = useMemo<ScheduleCalendarSource>(
    () => ({
      program: createPersonalizedPlanPreviewProgram(
        athlete?.name ? `Programación de ${athlete.name}` : 'Programación del atleta',
      ),
      workouts: [],
      draft: createEmptySessionDraft(0),
      isNewSession: false,
      athleteSchedule: { plans: allCalendarPlans, workouts: [] },
    }),
    [allCalendarPlans, athlete?.name],
  );

  const findCalendarPlan = useCallback(
    (planId?: string) => allCalendarPlans.find((plan) => plan.id === planId),
    [allCalendarPlans],
  );

  const findCalendarPlanGroup = useCallback(
    (planId?: string) => findPlanGroup(calendarPersonalizedGroups, planId ?? ''),
    [calendarPersonalizedGroups],
  );

  const planIdFromCalendarItem = (item: SchedulePreviewItem) => {
    if (!item.id.startsWith('plan:')) return undefined;
    const rest = item.id.slice('plan:'.length);
    return rest.replace(/:\d{4}-\d{2}-\d{2}$/, '') || undefined;
  };

  /** El calendario del atleta identifica cada sesión como `plan:<id>:<fecha>`. */
  const loadCalendarSessionDraft = (item: SchedulePreviewItem) => {
    const planId = planIdFromCalendarItem(item);
    const session = findCalendarPlan(planId);
    if (!session) return null;
    return parsePersonalizedPlanContent(session.content, (session.sessionNumber ?? 1) - 1);
  };

  const refreshCalendarPlans = useCallback(async () => {
    await loadAssignedPlans();
  }, [loadAssignedPlans]);

  const resolveCalendarSessionNumber = useCallback(
    (date: Date, draft: SessionDraft) => {
      if (isActivationSessionDraft(draft) && defaultCalendarPlanGroup) {
        const weekday = toWeekdayIndex(date);
        const matchingSession = defaultCalendarPlanGroup.sessions.find((plan) => {
          const planDraft = parsePersonalizedPlanContent(plan.content, (plan.sessionNumber ?? 1) - 1);
          return (
            !isActivationSessionDraft(planDraft) && planDraft.schedule.weekdays.includes(weekday)
          );
        });
        if (matchingSession?.sessionNumber) return matchingSession.sessionNumber;
      }

      return defaultCalendarPlanGroup
        ? getNextSessionNumber(defaultCalendarPlanGroup.sessions)
        : 1;
    },
    [defaultCalendarPlanGroup],
  );

  const handleCalendarDelete = async (item: SchedulePreviewItem) => {
    const planId = planIdFromCalendarItem(item);
    if (!planId) return 'No se pudo identificar la sesión.';

    const result = await removePlan(planId);
    if (result.error) return result.error;

    await refreshCalendarPlans();
    return null;
  };

  const handleCalendarCopy = async (item: SchedulePreviewItem, targetDate: Date) => {
    const error = await copyCalendarSession({
      item,
      targetDate,
      planIdFromItem: planIdFromCalendarItem,
      findPlan: findCalendarPlan,
      findPlanGroup: findCalendarPlanGroup,
      loadDraft: loadCalendarSessionDraft,
      applyDateToDraft,
      createPlan: async (input) => {
        const result = await createPlan(input);
        return { error: result.error };
      },
      athleteName: athlete?.name,
    });

    if (error) return error;

    await refreshCalendarPlans();
    return null;
  };

  const handleCopyDayToDate = async (
    _sourceDate: Date,
    targetDate: Date,
    items: SchedulePreviewItem[],
  ) => {
    const error = await copyCalendarDaySessions({
      items,
      targetDate,
      planIdFromItem: planIdFromCalendarItem,
      findPlan: findCalendarPlan,
      findPlanGroup: findCalendarPlanGroup,
      loadDraft: loadCalendarSessionDraft,
      applyDateToDraft,
      createPlan: async (input) => {
        const result = await createPlan(input);
        return { error: result.error };
      },
      athleteName: athlete?.name,
    });

    if (error) return error;
    await refreshCalendarPlans();
    return null;
  };

  const handleCalendarMoveToDate = async (
    item: SchedulePreviewItem,
    date: Date,
    dayItems?: SchedulePreviewItem[],
  ) => {
    const planId = planIdFromCalendarItem(item);
    const group = planId ? findCalendarPlanGroup(planId) : undefined;
    const source = findCalendarPlan(planId);
    const sessions = group?.sessions;
    if (!sessions || !source) return 'No se pudo mover la sesión.';

    const error = await moveCalendarSessionToDate({
      sessions,
      plan: source,
      targetDate: date,
      orderedIds: dayItems
        ?.map((entry) => planIdFromCalendarItem(entry))
        .filter((entry): entry is string => Boolean(entry)),
      updatePlan: async (id, input) => {
        const result = await updatePlan(id, input);
        return { error: result.error };
      },
    });

    if (error) return error;
    await refreshCalendarPlans();
    return null;
  };

  const handleCalendarReorderDay = async (_date: Date, orderedItems: SchedulePreviewItem[]) => {
    const orderedIds = orderedItems
      .map((item) => planIdFromCalendarItem(item))
      .filter((planId): planId is string => Boolean(planId));
    const touchedGroupIds = new Set<string>();

    for (const planId of orderedIds) {
      const group = findCalendarPlanGroup(planId);
      if (group) touchedGroupIds.add(group.id);
    }

    for (const groupId of touchedGroupIds) {
      const group = calendarPersonalizedGroups.find((entry) => entry.id === groupId);
      if (!group) continue;

      const dayIds = orderedIds.filter((planId) =>
        group.sessions.some((session) => session.id === planId),
      );
      const updates = buildDayOrderUpdates(dayIds, group.sessions);
      if (updates.length === 0) continue;

      for (const update of updates) {
        const result = await updatePlan(update.id, {
          athleteId: update.athleteId,
          planType: 'personalized',
          title: update.title,
          content: update.content,
        });
        if (result.error) return result.error;
      }
    }

    await refreshCalendarPlans();
    return null;
  };

  const openCalendarSession = (item: SchedulePreviewItem) => {
    const planId = planIdFromCalendarItem(item);
    if (!planId) return;
    setCalendarOpen(false);
    router.push({ pathname: '/trainer/plan/[id]', params: { id: planId, edit: '1' } });
  };

  const saveCalendarSession = async ({ draft, date, item }: CalendarSessionSaveInput) => {
    const draftError = validatePersonalizedPlanDraft(draft);
    if (draftError) return draftError;
    if (
      !isActivationSessionDraft(draft) &&
      !isRestDaySessionDraft(draft) &&
      !hasSessionBlockContent(draft)
    ) {
      return 'Añade al menos un bloque de entrenamiento.';
    }

    const scheduledDraft = applyDateToDraft(draft, date);
    const planId = item ? planIdFromCalendarItem(item) : undefined;
    const source = findCalendarPlan(planId);

    if (source) {
      const result = await updatePlan(source.id, {
        athleteId: source.athleteId,
        planType: source.planType,
        title: source.title,
        content: serializePersonalizedPlanContent(scheduledDraft, source.sessionNumber ?? 1),
      });
      if (result.error) return result.error;
      await refreshCalendarPlans();
      return null;
    }

    if (!defaultCalendarPlanGroup || !id) return 'No se pudo guardar la sesión.';

    const sessionNumber = resolveCalendarSessionNumber(date, scheduledDraft);
    const result = await createPlan({
      athleteId: id,
      planType: defaultCalendarPlanGroup.sessions[0]?.planType ?? 'personalized',
      title: defaultCalendarPlanGroup.title,
      content: serializePersonalizedPlanContent(scheduledDraft, sessionNumber),
      planGroupId: defaultCalendarPlanGroup.planGroupId,
      sessionNumber,
      athleteName: athlete?.name,
    });
    if (result.error) return result.error;
    await refreshCalendarPlans();
    return null;
  };

  const openNutritionPlanEditor = (planId: string) => {
    router.push({ pathname: '/trainer/plan/[id]', params: { id: planId, edit: '1' } });
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    await addNote(noteText);
    setNoteText('');
  };

  const handleDeleteActivityEntry = (entryId: string) => {
    setPendingDelete({
      title: 'Eliminar entrada',
      message: 'Se eliminará esta entrada del seguimiento. Esta acción no se puede deshacer.',
      onConfirm: () => void removeActivityEntry(entryId),
    });
  };

  const planGroupsForNotes = calendarPersonalizedGroups;

  const refreshPlanPrivateNotesCounts = useCallback(async () => {
    if (!user?.id || !isTrainerRole(user.role) || !id || planGroupsForNotes.length === 0) {
      setPlanPrivateNotesCounts({});
      return;
    }

    const notes = await fetchAthleteExerciseNotes({ trainerId: user.id, athleteId: id });
    const counts: Record<string, number> = {};
    for (const group of planGroupsForNotes) {
      const scope = { sessionLogIds: sessionLogIdsForPlanGroup(group, sessionLogs) };
      counts[group.id] = countPlanGroupExerciseNotes(
        buildPlanGroupExerciseNoteSections(group, notes, scope),
      );
    }
    setPlanPrivateNotesCounts(counts);
  }, [id, planGroupsForNotes, sessionLogs, user?.id, user?.role]);

  useEffect(() => {
    void refreshPlanPrivateNotesCounts();
  }, [refreshPlanPrivateNotesCounts]);

  if (isLoading) {
    return (
      <ScreenWrapper scrollable={false}>
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      </ScreenWrapper>
    );
  }

  if (!athlete) {
    return (
      <ScreenWrapper scrollable={false}>
        <View style={styles.missingState}>
          <Text style={styles.error}>No se pudo cargar la ficha de este atleta.</Text>
          <Text style={styles.errorHint}>
            Comprueba que sigue asignado a tu tablero y vuelve a intentarlo.
          </Text>
          <Button title="Reintentar" onPress={() => refreshAthlete()} style={styles.retryBtn} />
        </View>
      </ScreenWrapper>
    );
  }

  const { personalizedGroups, nutritionPlans } = splitAssignedPlans(assignedPlans, {
    includeEnded: true,
  });

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{athlete.avatarInitials}</Text>
        </View>
        <Text style={styles.name}>{athlete.name}</Text>
        <Text style={styles.email}>{athlete.email}</Text>
        {canChat ? (
          <Button
            title="Abrir chat"
            onPress={() => router.push({ pathname: '/trainer/chat/[id]', params: { id: athlete.id } })}
            style={styles.chatBtnHeader}
          />
        ) : null}
        {isTrainerRole(user?.role) ? (
          <Pressable
            onPress={() => router.push(getTrainerAthleteProfileHref(athlete.id))}
            style={({ pressed }) => [styles.calendarLink, pressed && styles.calendarLinkPressed]}
          >
            <Text style={styles.calendarLinkText}>Ver calendario del atleta</Text>
          </Pressable>
        ) : null}
        <View style={styles.badges}>
          {athlete.fitnessLevel ? (
            <Text style={[styles.badge, { color: levelColors[athlete.fitnessLevel] }]}>
              {athlete.fitnessLevel}
            </Text>
          ) : null}
          {athlete.mainGoal ? (
            <Text style={[styles.badge, { color: colors.accentBlue }]}>{goalLabels[athlete.mainGoal]}</Text>
          ) : null}
        </View>
      </View>

      <View key={sectionsKey}>
      {visibleAlerts && visibleAlerts.total > 0 ? (
        <CollapsibleSection
          style={styles.alertCard}
          title={`${visibleAlerts.total} alerta${visibleAlerts.total === 1 ? '' : 's'} pendiente${visibleAlerts.total === 1 ? '' : 's'}`}
        >
          {visibleAlerts.chatCount > 0 ? (
            <View style={styles.alertRow}>
              <Pressable
                onPress={() =>
                  router.push({ pathname: '/trainer/chat/[id]', params: { id: athlete.id } })
                }
                style={({ pressed }) => [styles.alertRowMain, pressed && styles.alertRowPressed]}
              >
                <AppIcon name="chat" size={20} color={colors.warning} />
                <View style={styles.alertCopy}>
                  <Text style={styles.alertTitle}>
                    {visibleAlerts.chatCount} mensaje{visibleAlerts.chatCount === 1 ? '' : 's'} nuevo
                    {visibleAlerts.chatCount === 1 ? '' : 's'} en el chat
                  </Text>
                  <Text style={styles.alertText}>Ábrelo para responder o márcalo como visto.</Text>
                </View>
                <View style={styles.alertAction}>
                  <Text style={styles.alertActionText}>Ver mensaje</Text>
                </View>
              </Pressable>
              <AlertDismissButton onPress={() => dismissAlert('chat')} />
            </View>
          ) : null}

          {visibleAlerts.sessionCount > 0 ? (
            <View style={styles.alertRow}>
              <Pressable
                onPress={() => {
                  if (!latestSessionLogId) return;
                  router.push({
                    pathname: '/trainer/athlete/[id]/log/[logId]',
                    params: { id: athlete.id, logId: latestSessionLogId },
                  });
                }}
                disabled={!latestSessionLogId}
                style={({ pressed }) => [styles.alertRowMain, pressed && styles.alertRowPressed]}
              >
                <AppIcon name="stats" size={20} color={colors.warning} />
                <View style={styles.alertCopy}>
                  <Text style={styles.alertTitle}>
                    {visibleAlerts.sessionCount} registro{visibleAlerts.sessionCount === 1 ? '' : 's'} de entreno nuevo
                    {visibleAlerts.sessionCount === 1 ? '' : 's'}
                  </Text>
                  <Text style={styles.alertText}>Puedes revisarlo en “Registro de entrenos” más abajo.</Text>
                </View>
                <View style={[styles.alertAction, !latestSessionLogId && styles.alertActionDisabled]}>
                  <Text style={styles.alertActionText}>Ver entrenamiento</Text>
                </View>
              </Pressable>
              <AlertDismissButton onPress={() => dismissAlert('sessions')} />
            </View>
          ) : null}

          {visibleAlerts.intakeChanged ? (
            <View style={styles.alertRow}>
              <AppIcon name="info" size={20} color={colors.warning} />
              <View style={styles.alertCopy}>
                <Text style={styles.alertTitle}>Cuestionario actualizado</Text>
                <Text style={styles.alertText}>
                  El atleta ha completado o modificado su formulario de bienvenida.
                </Text>
              </View>
              <AlertDismissButton onPress={() => dismissAlert('intake')} />
            </View>
          ) : null}
        </CollapsibleSection>
      ) : null}

      <CollapsibleSection
        style={styles.programCard}
        title="Programación"
        hideHeaderActionsWhenCollapsed
        headerActions={
          !plansLoading && personalizedGroups.length > 0 ? (
            <Pressable
              onPress={() => setCalendarOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Ver calendario de todos los planes"
              style={({ pressed }) => [
                styles.programCalendarBtn,
                pressed && styles.programCalendarBtnPressed,
              ]}
            >
              <AppIcon name="calendar" size={15} color={colors.accent} />
              <Text style={styles.programCalendarBtnText}>Ver calendario</Text>
            </Pressable>
          ) : null
        }
      >
        {plansLoading ? (
          <ActivityIndicator color={colors.accent} />
        ) : personalizedGroups.length === 0 ? (
          <Text style={styles.emptyProgram}>Todavía no has asignado una programación a este atleta.</Text>
        ) : (
          <>
            {planActionError ? <Text style={styles.planActionError}>{planActionError}</Text> : null}
            <AssignedPlansList
              personalizedGroups={personalizedGroups}
              nutritionPlans={[]}
              planPrivateNotesCounts={planPrivateNotesCounts}
              onOpenPrivateNotes={setPrivateNotesGroup}
              onOpenSession={(planId) =>
                router.push({ pathname: '/trainer/plan/[id]', params: { id: planId } })
              }
              onOpenNutritionPlan={(planId) =>
                router.push({ pathname: '/trainer/plan/[id]', params: { id: planId } })
              }
              onViewGroupCalendar={openPlanGroupSessions}
              onEditGroup={openPlanGroupEditor}
              onUpdateGroupValidity={handleUpdateGroupValidity}
              onRepeatGroupWeekly={handleRepeatGroupWeekly}
              onDeleteSession={handleDeleteSession}
              onDeleteGroup={handleDeleteGroup}
            />
          </>
        )}

        <View style={styles.planActions}>
          <Button
            title="Crear plan personalizado"
            variant="outline"
            onPress={() =>
              router.push({
                pathname: '/trainer/plan/create',
                params: { type: 'personalized', athleteId: athlete.id },
              })
            }
            style={styles.planActionBtn}
          />
        </View>
      </CollapsibleSection>

      {!plansLoading && nutritionPlans.length > 0 ? (
        <CollapsibleSection style={styles.programCard} title="Plan nutricional">
          {planActionError ? <Text style={styles.planActionError}>{planActionError}</Text> : null}
          <AssignedPlansList
            personalizedGroups={[]}
            nutritionPlans={nutritionPlans}
            onOpenSession={(planId) =>
              router.push({ pathname: '/trainer/plan/[id]', params: { id: planId } })
            }
            onOpenNutritionPlan={(planId) =>
              router.push({ pathname: '/trainer/plan/[id]', params: { id: planId } })
            }
            onEditNutritionPlan={openNutritionPlanEditor}
            onDeleteNutritionPlan={handleDeleteNutritionPlan}
          />
        </CollapsibleSection>
      ) : null}

      <CollapsibleSection style={styles.programCard} title="Registro de entrenos">
        <AthleteSessionLogsPanel
          logs={sessionLogs}
          loading={logsLoading}
          feedback={athleteFeedback}
          viewMode={sessionLogViewMode}
          onViewModeChange={setSessionLogViewMode}
          onOpenLog={(logId) =>
            router.push({
              pathname: '/trainer/athlete/[id]/log/[logId]',
              params: { id: athlete.id, logId },
            })
          }
        />
      </CollapsibleSection>

      <AthleteProgressPanel
        athleteId={athlete.id}
        metricHistory={physicalHistory}
        style={styles.programCard}
      />

      <CollapsibleSection style={styles.programCard} title="Datos físicos">
        <InfoRow label="Edad" value={formatDerived(physicalDerived.age, ' años', 0)} />
        <InfoRow label="Altura" value={formatMeasured(physicalBasics.heightCm, ' cm')} />
        <InfoRow label="Peso" value={formatMeasured(physicalMeasured.weightKg, ' kg')} />
        <InfoRow label="IMC" value={formatBmi(physicalDerived.bmi)} />
        <InfoRow label="FC en reposo" value={formatMeasured(physicalMeasured.restingHeartRate, ' lpm')} />
        <InfoRow label="Grasa corporal" value={formatMeasured(physicalMeasured.bodyFatPercentage, ' %')} />
        <InfoRow label="Masa grasa" value={formatDerived(physicalDerived.fatMassKg, ' kg')} />
        <InfoRow label="Masa libre de grasa" value={formatDerived(physicalDerived.leanBodyMassKg, ' kg')} />
        <InfoRow label="Masa muscular" value={formatMeasured(physicalMeasured.muscleMassKg, ' kg')} />
        <InfoRow label="Metabolismo basal" value={formatKcal(physicalDerived.bmrKcal)} />
        <InfoRow
          label="Gasto diario estimado"
          value={formatKcal(physicalDerived.estimatedDailyExpenditureKcal)}
        />
        <InfoRow
          label="Objetivo principal"
          value={physicalBasics.primaryGoal ? primaryGoalLabels[physicalBasics.primaryGoal] : 'No indicado'}
        />
        <InfoRow label="Limitaciones" value={formatOptionalValue(athlete.injuries)} />
      </CollapsibleSection>

      <CollapsibleSection style={styles.programCard} title="Seguimiento">
        {!activityPersistent ? (
          <Text style={styles.activityWarning}>
            Este historial se guarda solo en esta sesión (falta ejecutar la migración SQL del CRM en Supabase).
          </Text>
        ) : null}

        <View style={styles.noteRow}>
          <TextInput
            value={noteText}
            onChangeText={setNoteText}
            placeholder="Añadir una nota, ej. 'A la espera de respuesta'"
            placeholderTextColor={colors.textMuted}
            style={styles.noteInput}
            onSubmitEditing={handleAddNote}
            returnKeyType="send"
          />
          <Pressable
            onPress={handleAddNote}
            disabled={!noteText.trim()}
            style={({ pressed }) => [
              styles.noteAddBtn,
              !noteText.trim() && styles.noteAddBtnDisabled,
              pressed && Boolean(noteText.trim()) && styles.noteAddBtnPressed,
            ]}
          >
            <AppIcon name="add" size={18} color={noteText.trim() ? colors.white : colors.textMuted} />
          </Pressable>
        </View>

        {activityLoading ? (
          <ActivityIndicator color={colors.accent} style={styles.loader} />
        ) : activityEntries.length === 0 ? (
          <Text style={styles.emptyProgram}>
            Todavía no hay seguimiento registrado. Se añadirá automáticamente al mover columnas, asignar planes o
            enviar mensajes desde el chat.
          </Text>
        ) : (
          activityEntries.map((entry) => (
            <View key={entry.id} style={styles.activityRow}>
              <View style={styles.activityCopy}>
                <Text style={styles.activityDate}>
                  {formatActivityDate(entry.createdAt)}
                  {entry.trainerName ? ` · ${entry.trainerName}` : ''}
                </Text>
                <Text style={styles.activityMessage}>{entry.message}</Text>
              </View>
              <Pressable onPress={() => handleDeleteActivityEntry(entry.id)} hitSlop={8}>
                <AppIcon name="close" size={16} color={colors.textMuted} />
              </Pressable>
            </View>
          ))
        )}
      </CollapsibleSection>

      <CollapsibleSection style={styles.programCard} title="Formularios">
        {intakeLoading || intakeStatusesLoading ? (
          <ActivityIndicator color={colors.accent} style={styles.loader} />
        ) : usesCustomForms && intakeStatuses.length > 0 ? (
          <View style={styles.intakeFormsList}>
            {intakeStatuses.map((status) => (
              <View key={status.template.id} style={styles.intakeFormBlock}>
                <Text style={styles.intakeFormTitle}>
                  {status.template.name}
                  {status.template.isDefault ? ' · Por defecto' : ''}
                </Text>
                {status.isComplete && status.submission ? (
                  <DynamicIntakeAnswersTable
                    schema={status.template.schema}
                    answers={status.submission.answers}
                    completedAt={status.submission.completedAt}
                  />
                ) : (
                  <Text style={styles.emptyProgram}>
                    Este atleta todavía no ha completado este formulario.
                  </Text>
                )}
              </View>
            ))}
          </View>
        ) : intakeForm && intakeComplete ? (
          <IntakeAnswersTable form={intakeForm} />
        ) : (
          <Text style={styles.emptyProgram}>
            Este atleta todavía no ha completado el formulario de bienvenida.
          </Text>
        )}
      </CollapsibleSection>
      </View>

      {privateNotesGroup ? (
        <PlanGroupPrivateNotesModal
          visible
          group={privateNotesGroup}
          athleteId={athlete.id}
          athleteName={athlete.name}
          sessionLogs={sessionLogs}
          onClose={() => setPrivateNotesGroup(null)}
          onNotesChanged={() => void refreshPlanPrivateNotesCounts()}
        />
      ) : null}

      <ScheduleCalendarModal
        visible={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        title="Programación"
        subtitle={`de ${athlete.name}, según sus fechas de vigencia.`}
        planGroups={calendarPersonalizedGroups}
        source={calendarSource}
        loadSessionDraft={loadCalendarSessionDraft}
        buildSessionDraft={(date) =>
          applyDateToDraft(
            createEmptySessionDraft(resolveCalendarSessionNumber(date, createEmptySessionDraft(0)) - 1),
            date,
          )
        }
        buildRestDayDraft={(date) =>
          applyDateToDraft(
            createRestDayDraft(
              (defaultCalendarPlanGroup
                ? getNextSessionNumber(defaultCalendarPlanGroup.sessions)
                : 1) - 1,
            ),
            date,
          )
        }
        saveSession={saveCalendarSession}
        onSessionPreview={(item) => openTrainerPreviewSession(router, item, calendarSource)}
        onSessionEdit={openCalendarSession}
        onSessionCopy={handleCalendarCopy}
        onCopyDayToDate={handleCopyDayToDate}
        onSessionDelete={handleCalendarDelete}
        onSessionMoveToDate={handleCalendarMoveToDate}
        onSessionReorderDay={handleCalendarReorderDay}
      />

      <ConfirmModal
        visible={pendingDelete !== null}
        title={pendingDelete?.title ?? ''}
        message={pendingDelete?.message}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        destructive
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          const action = pendingDelete?.onConfirm;
          setPendingDelete(null);
          action?.();
        }}
      />
    </ScreenWrapper>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: spacing.xl },
  missingState: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  error: { ...typography.body, color: colors.danger, textAlign: 'center' },
  errorHint: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    minWidth: 160,
  },
  header: { alignItems: 'center', marginBottom: spacing.lg },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: `${colors.accentBlue}22`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: colors.accentBlue },
  name: { ...typography.h2, color: colors.text },
  email: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 4 },
  chatBtnHeader: {
    marginTop: spacing.md,
    alignSelf: 'stretch',
    maxWidth: 360,
    width: '100%',
  },
  calendarLink: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    backgroundColor: withAlpha(colors.accent, '12'),
  },
  calendarLinkPressed: {
    opacity: 0.85,
  },
  calendarLinkText: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '700',
  },
  badges: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  badge: { ...typography.bodySmall, fontWeight: '600' },
  alertCard: {
    marginBottom: spacing.md,
    borderColor: colors.warning,
    backgroundColor: `${colors.warning}0D`,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  alertRowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  alertRowPressed: {
    opacity: 0.7,
  },
  alertCopy: {
    flex: 1,
  },
  alertTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  alertText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  alertAction: {
    flexShrink: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: withAlpha(colors.accent, '55'),
    backgroundColor: withAlpha(colors.accent, '14'),
  },
  alertActionDisabled: {
    opacity: 0.45,
  },
  alertActionText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  programCard: { marginTop: spacing.md },
  programCalendarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: withAlpha(colors.accent, '55'),
    backgroundColor: withAlpha(colors.accent, '14'),
    marginTop: 2,
  },
  programCalendarBtnPressed: {
    backgroundColor: withAlpha(colors.accent, '26'),
  },
  programCalendarBtnText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  emptyProgram: { ...typography.bodySmall, color: colors.textMuted },
  intakeFormsList: { gap: spacing.md },
  intakeFormBlock: { gap: spacing.sm },
  intakeFormTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  planActionError: {
    ...typography.bodySmall,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  planRowPressed: { opacity: 0.7 },
  planRowText: { flex: 1 },
  planChevron: { ...typography.h3, color: colors.textMuted },
  planTitle: { ...typography.body, color: colors.text, fontWeight: '600' },
  planMeta: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  planActions: { gap: spacing.sm, marginTop: spacing.md },
  planActionBtn: { width: '100%' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { ...typography.body, color: colors.textSecondary },
  rowValue: { ...typography.body, color: colors.text, fontWeight: '500' },
  activityWarning: {
    ...typography.caption,
    color: colors.warning,
    marginBottom: spacing.sm,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  noteInput: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 44,
    color: colors.text,
    ...typography.bodySmall,
  },
  noteAddBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accentDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteAddBtnDisabled: {
    backgroundColor: colors.surfaceLight,
  },
  noteAddBtnPressed: {
    opacity: 0.85,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activityCopy: {
    flex: 1,
  },
  activityDate: {
    ...typography.caption,
    color: colors.accentBlue,
    fontWeight: '700',
    marginBottom: 2,
  },
  activityMessage: {
    ...typography.bodySmall,
    color: colors.text,
  },
});
