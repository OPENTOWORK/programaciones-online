import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
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
import { isAdminRole } from '@/lib/athleteService';
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
import { getNextSessionNumber, groupPersonalizedPlans, splitAssignedPlans, type PersonalizedPlanGroup } from '@/lib/personalizedPlanGroups';
import { applyPlanValidityToContent, countSessionsOutsidePlanValidity, earliestScheduledDateForPlans, formatPlanDateDisplay, type PlanValidity } from '@/lib/planValidity';
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
import { openTrainerPreviewSession } from '@/lib/sessionNavigation';
import { fetchAthleteSessionLogs } from '@/lib/sessionLogService';
import {
  markAthleteAlertRead,
  withAlertSourceCleared,
  type AlertSource,
} from '@/lib/trainerAthleteAlerts';
import type { AthletePlan } from '@/lib/types';
import { AlertDismissButton } from '@/components/trainer/AlertDismissButton';
import { AthleteSessionLogsPanel } from '@/components/trainer/AthleteSessionLogsPanel';
import { AthleteFeedbackPanel } from '@/components/trainer/AthleteFeedbackPanel';
import { AthleteProgressPanel } from '@/components/trainer/AthleteProgressPanel';
import {
  ScheduleCalendarModal,
  type CalendarSessionSaveInput,
} from '@/components/trainer/ScheduleCalendarModal';
import { AssignedPlansList } from '@/components/program/AssignedPlansList';
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
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const canOpenAthleteCalendar = isAdminRole(user?.role);
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
  const [sessionLogViewMode, setSessionLogViewMode] = useState<'list' | 'calendar'>('list');
  const [dismissedAlertSources, setDismissedAlertSources] = useState<AlertSource[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [planActionError, setPlanActionError] = useState<string | null>(null);
  const [calendarGroup, setCalendarGroup] = useState<PersonalizedPlanGroup | null>(null);
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

    const hiddenCount = countSessionsOutsidePlanValidity(group.sessions, validity);
    if (hiddenCount > 0) {
      const earliest = earliestScheduledDateForPlans(group.sessions);
      setPlanActionError(
        `La vigencia ocultaría ${hiddenCount} sesión${hiddenCount === 1 ? '' : 'es'} del calendario. ` +
          `La primera sesión programada es el ${earliest ? formatPlanDateDisplay(earliest) : '—'}: ajusta "Desde" a esa fecha o anterior.`,
      );
      return;
    }

    for (const session of group.sessions) {
      const sessionNumber = session.sessionNumber ?? 1;
      const content = applyPlanValidityToContent(session.content, validity);
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

  const calendarSource = useMemo<ScheduleCalendarSource>(
    () => ({
      program: createPersonalizedPlanPreviewProgram(calendarGroup?.title ?? 'Plan personalizado'),
      workouts: [],
      draft: createEmptySessionDraft(0),
      isNewSession: false,
      athleteSchedule: { plans: calendarGroup?.sessions ?? [], workouts: [] },
    }),
    [calendarGroup],
  );

  /** El calendario del atleta identifica cada sesión como `plan:<id>:<fecha>`. */
  const loadCalendarSessionDraft = (item: SchedulePreviewItem) => {
    const planId = item.id.startsWith('plan:') ? item.id.split(':')[1] : undefined;
    const session = calendarGroup?.sessions.find((entry) => entry.id === planId);
    if (!session) return null;
    return parsePersonalizedPlanContent(session.content, (session.sessionNumber ?? 1) - 1);
  };

  const planIdFromCalendarItem = (item: SchedulePreviewItem) => {
    if (!item.id.startsWith('plan:')) return undefined;
    const rest = item.id.slice('plan:'.length);
    return rest.replace(/:\d{4}-\d{2}-\d{2}$/, '') || undefined;
  };

  const refreshCalendarGroup = useCallback(async () => {
    if (!calendarGroup || !id || !user?.id) return;

    const plans = await fetchAthletePlansForAthlete(id);
    setAssignedPlans(plans);

    const group = groupPersonalizedPlans(plans).find(
      (entry) => entry.id === calendarGroup.id || entry.planGroupId === calendarGroup.planGroupId,
    );
    if (group) setCalendarGroup(group);
    else setCalendarGroup(null);
  }, [calendarGroup, id, user?.id]);

  const handleCalendarDelete = async (item: SchedulePreviewItem) => {
    const planId = planIdFromCalendarItem(item);
    if (!planId) return 'No se pudo identificar la sesión.';

    const result = await removePlan(planId);
    if (result.error) return result.error;

    await refreshCalendarGroup();
    return null;
  };

  const handleCalendarCopy = async (item: SchedulePreviewItem, targetDate: Date) => {
    if (!calendarGroup) return 'No hay plan cargado.';

    const error = await copyCalendarSession({
      item,
      targetDate,
      planIdFromItem: planIdFromCalendarItem,
      findPlan: (planId) => calendarGroup.sessions.find((session) => session.id === planId),
      findPlanGroup: () => calendarGroup,
      loadDraft: loadCalendarSessionDraft,
      applyDateToDraft,
      createPlan: async (input) => {
        const result = await createPlan(input);
        return { error: result.error };
      },
      athleteName: athlete?.name,
    });

    if (error) return error;

    await refreshCalendarGroup();
    return null;
  };

  const handleCopyDayToDate = async (
    _sourceDate: Date,
    targetDate: Date,
    items: SchedulePreviewItem[],
  ) => {
    if (!calendarGroup) return 'No hay plan cargado.';

    const error = await copyCalendarDaySessions({
      items,
      targetDate,
      planIdFromItem: planIdFromCalendarItem,
      findPlan: (planId) => calendarGroup.sessions.find((session) => session.id === planId),
      findPlanGroup: () => calendarGroup,
      loadDraft: loadCalendarSessionDraft,
      applyDateToDraft,
      createPlan: async (input) => {
        const result = await createPlan(input);
        return { error: result.error };
      },
      athleteName: athlete?.name,
    });

    if (error) return error;
    await refreshCalendarGroup();
    return null;
  };

  const handleCalendarMoveToDate = async (
    item: SchedulePreviewItem,
    date: Date,
    dayItems?: SchedulePreviewItem[],
  ) => {
    const planId = planIdFromCalendarItem(item);
    const sessions = calendarGroup?.sessions;
    const source = sessions?.find((session) => session.id === planId);
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
    await refreshCalendarGroup();
    return null;
  };

  const handleCalendarReorderDay = async (_date: Date, orderedItems: SchedulePreviewItem[]) => {
    const sessions = calendarGroup?.sessions;
    if (!sessions) return 'No se pudo reordenar el día.';

    const orderedIds = orderedItems
      .map((item) => planIdFromCalendarItem(item))
      .filter((planId): planId is string => Boolean(planId));
    const updates = buildDayOrderUpdates(orderedIds, sessions);
    if (updates.length === 0) return null;

    for (const update of updates) {
      const result = await updatePlan(update.id, {
        athleteId: update.athleteId,
        planType: 'personalized',
        title: update.title,
        content: update.content,
      });
      if (result.error) return result.error;
    }

    await refreshCalendarGroup();
    return null;
  };

  const openCalendarSession = (item: SchedulePreviewItem) => {
    const planId = item.id.startsWith('plan:') ? item.id.split(':')[1] : undefined;
    if (!planId) return;
    setCalendarGroup(null);
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
    const source = calendarGroup?.sessions.find((session) => session.id === planId);

    if (source) {
      const result = await updatePlan(source.id, {
        athleteId: source.athleteId,
        planType: source.planType,
        title: source.title,
        content: serializePersonalizedPlanContent(scheduledDraft, source.sessionNumber ?? 1),
      });
      if (result.error) return result.error;
      await refreshCalendarGroup();
      return null;
    }

    if (!calendarGroup || !id) return 'No se pudo guardar la sesión.';

    const sessionNumber = getNextSessionNumber(calendarGroup.sessions);
    const result = await createPlan({
      athleteId: id,
      planType: calendarGroup.sessions[0]?.planType ?? 'personalized',
      title: calendarGroup.title,
      content: serializePersonalizedPlanContent(scheduledDraft, sessionNumber),
      planGroupId: calendarGroup.planGroupId,
      sessionNumber,
      athleteName: athlete?.name,
    });
    if (result.error) return result.error;
    await refreshCalendarGroup();
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

  if (isLoading) {
    return (
      <ScreenWrapper scrollable={false}>
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      </ScreenWrapper>
    );
  }

  if (!athlete) {
    return (
      <ScreenWrapper>
        <Text style={styles.error}>Atleta no encontrado</Text>
      </ScreenWrapper>
    );
  }

  const { personalizedGroups, nutritionPlans } = splitAssignedPlans(assignedPlans);

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
        {canOpenAthleteCalendar ? (
          <Pressable
            onPress={() =>
              router.push({ pathname: '/trainer/athlete/[id]/calendar', params: { id: athlete.id } })
            }
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
          subtitle="Origen de las novedades de este atleta"
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
              </Pressable>
              <AlertDismissButton onPress={() => dismissAlert('chat')} />
            </View>
          ) : null}

          {visibleAlerts.sessionCount > 0 ? (
            <View style={styles.alertRow}>
              <AppIcon name="stats" size={20} color={colors.warning} />
              <View style={styles.alertCopy}>
                <Text style={styles.alertTitle}>
                  {visibleAlerts.sessionCount} registro{visibleAlerts.sessionCount === 1 ? '' : 's'} de entreno nuevo
                  {visibleAlerts.sessionCount === 1 ? '' : 's'}
                </Text>
                <Text style={styles.alertText}>Puedes revisarlo en “Registro de entrenos” más abajo.</Text>
              </View>
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
        title="Seguimiento"
        subtitle="Notas, columnas, planes y mensajes por fecha"
      >
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

      <CollapsibleSection
        style={styles.programCard}
        title="Formularios del atleta"
        subtitle="Respuestas de los cuestionarios personalizados"
      >
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

      <CollapsibleSection
        style={styles.programCard}
        title="Programación"
        subtitle="Programación personalizada de este atleta"
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
              onOpenSession={(planId) =>
                router.push({ pathname: '/trainer/plan/[id]', params: { id: planId } })
              }
              onOpenNutritionPlan={(planId) =>
                router.push({ pathname: '/trainer/plan/[id]', params: { id: planId } })
              }
              onViewGroupCalendar={setCalendarGroup}
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

      <CollapsibleSection
        style={styles.programCard}
        title="Registro de entrenos"
        subtitle="Sensaciones, progreso y videos por sesión"
      >
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

      <AthleteFeedbackPanel feedback={athleteFeedback} style={styles.programCard} />

      <AthleteProgressPanel
        athleteId={athlete.id}
        metricHistory={physicalHistory}
        style={styles.programCard}
      />
      </View>

      <ScheduleCalendarModal
        visible={calendarGroup !== null}
        onClose={() => setCalendarGroup(null)}
        title={calendarGroup?.title ?? 'Calendario del plan'}
        subtitle={`Sesiones programadas de ${athlete.name}.`}
        source={calendarSource}
        loadSessionDraft={loadCalendarSessionDraft}
        buildSessionDraft={(date) =>
          applyDateToDraft(
            createEmptySessionDraft(getNextSessionNumber(calendarGroup?.sessions ?? []) - 1),
            date,
          )
        }
        buildRestDayDraft={(date) => applyDateToDraft(createRestDayDraft(0), date)}
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
  error: { ...typography.body, color: colors.danger, textAlign: 'center' },
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
  programCard: { marginTop: spacing.md },
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
