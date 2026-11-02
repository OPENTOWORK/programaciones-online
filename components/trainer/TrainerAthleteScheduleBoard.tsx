import { useAppNavigation } from '@/hooks/useAppNavigation';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import type { CalendarDayActionId } from '@/components/trainer/CalendarDayActionsMenu';
import {
  ScheduleCalendarModal,
  type CalendarSessionSaveInput,
} from '@/components/trainer/ScheduleCalendarModal';
import { TrainerAthleteChatWidget } from '@/components/trainer/TrainerAthleteChatWidget';
import { HeaderBackButton } from '@/components/ui/HeaderBackButton';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useTrainerAthletePlans } from '@/hooks/useAthletePlans';
import { useAthlete } from '@/hooks/useAthletes';
import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { loadTrainerAthleteScheduleSources } from '@/lib/athleteSchedule';
import { copyCalendarDaySessions, copyCalendarSession } from '@/lib/copyCalendarDaySessions';
import { collectExerciseNamesFromSessionDraft } from '@/lib/exerciseTextParser';
import { syncExerciseVideosForNames } from '@/lib/exerciseVideoSyncService';
import { moveCalendarSessionToDate } from '@/lib/moveCalendarSession';
import {
  createPersonalizedPlanPreviewProgram,
  parsePersonalizedPlanContent,
  serializePersonalizedPlanContent,
  validatePersonalizedPlanDraft,
} from '@/lib/personalizedPlanContent';
import {
  findPlanGroup as findPlanGroupByPlan,
  getNextSessionNumber,
  filterActivePersonalizedPlanGroups,
  groupPersonalizedPlans,
  type PersonalizedPlanGroup,
} from '@/lib/personalizedPlanGroups';
import type { PickedPlanPdf } from '@/lib/planPdfPicker';
import { importAthletePlanPdfToCalendar } from '@/lib/planPdfImportService';
import type { SchedulePreviewItem } from '@/lib/programSchedulePreview';
import type { ScheduleCalendarSource } from '@/lib/scheduleCalendarItems';
import { buildDayOrderUpdates } from '@/lib/scheduleDayOrder';
import { hasSessionBlockContent } from '@/lib/sessionBlockSections';
import { getTrainerAthleteDetailsHref } from '@/lib/navigation';
import { openTrainerPreviewSession } from '@/lib/sessionNavigation';
import { formatScheduleSummary, toLocalDateString, toWeekdayIndex } from '@/lib/sessionSchedule';
import {
  createEmptySessionDraft,
  createRestDayDraft,
  defaultDayOrder,
  isActivationSessionDraft,
  isPdfSessionDraft,
  isRestDaySessionDraft,
  renameSessionCopy,
  type SessionDraft,
} from '@/lib/trainerSessionDraft';
import type { AthletePlan } from '@/lib/types';

const DEFAULT_PLAN_TITLE = 'Plan personalizado';

function applyDateToDraft(draft: SessionDraft, date: Date): SessionDraft {
  const schedule = {
    weekdays: [toWeekdayIndex(date)],
    recurrence: 'once' as const,
    startDate: toLocalDateString(date),
  };
  return { ...draft, schedule, dayLabel: formatScheduleSummary(schedule) };
}

function planIdFromCalendarItem(item: SchedulePreviewItem) {
  if (!item.id.startsWith('plan:')) return undefined;
  const rest = item.id.slice('plan:'.length);
  return rest.replace(/:\d{4}-\d{2}-\d{2}$/, '') || undefined;
}

function nextDayOrder(dayItems: SchedulePreviewItem[]) {
  if (dayItems.length === 0) return 0;
  return Math.max(...dayItems.map((item) => item.dayOrder ?? defaultDayOrder(item))) + 1;
}

interface TrainerAthleteScheduleBoardProps {
  athleteId: string;
  embedded?: boolean;
}

export function TrainerAthleteScheduleBoard({
  athleteId,
  embedded = false,
}: TrainerAthleteScheduleBoardProps) {
  const router = useAppNavigation();
  const { user } = useAuth();
  const { athlete, isLoading: athleteLoading } = useAthlete(athleteId);
  const { createPlan, updatePlan, removePlan } = useTrainerAthletePlans();
  const [personalizedPlans, setPersonalizedPlans] = useState<AthletePlan[]>([]);
  const [activeCatalogCount, setActiveCatalogCount] = useState(0);
  const [scheduleLoading, setScheduleLoading] = useState(true);

  const loadSchedule = useCallback(async () => {
    if (!athleteId) {
      setPersonalizedPlans([]);
      setActiveCatalogCount(0);
      setScheduleLoading(false);
      return;
    }

    setScheduleLoading(true);
    try {
      const data = await loadTrainerAthleteScheduleSources(athleteId);
      setPersonalizedPlans(data.personalizedPlans);
      setActiveCatalogCount(data.catalogPrograms.length);
    } catch {
      setPersonalizedPlans([]);
      setActiveCatalogCount(0);
    } finally {
      setScheduleLoading(false);
    }
  }, [athleteId]);

  useFocusRefresh(loadSchedule);

  const calendarPersonalizedGroups = useMemo(
    () => groupPersonalizedPlans(personalizedPlans),
    [personalizedPlans],
  );

  const allCalendarPlans = useMemo(
    () => calendarPersonalizedGroups.flatMap((group) => group.sessions),
    [calendarPersonalizedGroups],
  );

  const defaultPlanGroup = useMemo(() => {
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
      athleteSchedule: {
        plans: allCalendarPlans,
        workouts: [],
      },
    }),
    [allCalendarPlans, athlete?.name],
  );

  const findPlan = useCallback(
    (planId?: string) => allCalendarPlans.find((plan) => plan.id === planId),
    [allCalendarPlans],
  );

  const findPlanGroup = useCallback(
    (planId?: string): PersonalizedPlanGroup | undefined =>
      findPlanGroupByPlan(calendarPersonalizedGroups, planId ?? ''),
    [calendarPersonalizedGroups],
  );

  const resolveSessionNumber = useCallback(
    (date: Date, draft: SessionDraft) => {
      if (isActivationSessionDraft(draft) && defaultPlanGroup) {
        const weekday = toWeekdayIndex(date);
        const matchingSession = defaultPlanGroup.sessions.find((plan) => {
          const planDraft = parsePersonalizedPlanContent(plan.content, (plan.sessionNumber ?? 1) - 1);
          return (
            !isActivationSessionDraft(planDraft) && planDraft.schedule.weekdays.includes(weekday)
          );
        });
        if (matchingSession?.sessionNumber) return matchingSession.sessionNumber;
      }

      return defaultPlanGroup ? getNextSessionNumber(defaultPlanGroup.sessions) : 1;
    },
    [defaultPlanGroup],
  );

  const buildSessionDraftForDate = useCallback(
    (date: Date) => {
      const sessionNumber = resolveSessionNumber(date, createEmptySessionDraft(0));
      return applyDateToDraft(createEmptySessionDraft(sessionNumber - 1), date);
    },
    [resolveSessionNumber],
  );

  const buildRestDayDraftForDate = useCallback(
    (date: Date) => {
      const sessionNumber = defaultPlanGroup
        ? getNextSessionNumber(defaultPlanGroup.sessions)
        : 1;
      return applyDateToDraft(createRestDayDraft(sessionNumber - 1), date);
    },
    [defaultPlanGroup],
  );

  const saveCalendarSession = useCallback(
    async ({ draft, date, item }: CalendarSessionSaveInput) => {
      const draftError = validatePersonalizedPlanDraft(draft);
      if (draftError) return draftError;
      if (
        !isActivationSessionDraft(draft) &&
        !isRestDaySessionDraft(draft) &&
        !isPdfSessionDraft(draft) &&
        !hasSessionBlockContent(draft)
      ) {
        return 'Añade al menos un bloque de entrenamiento.';
      }

      if (isRestDaySessionDraft(draft)) {
        const weekday = toWeekdayIndex(date);
        const alreadyRest = personalizedPlans.some((plan) => {
          const planDraft = parsePersonalizedPlanContent(plan.content, (plan.sessionNumber ?? 1) - 1);
          return (
            planDraft.kind === 'rest' &&
            planDraft.schedule.weekdays.includes(weekday) &&
            planDraft.schedule.startDate === toLocalDateString(date)
          );
        });
        if (alreadyRest) return 'Este día ya está marcado como descanso.';
      }

      const scheduledDraft = applyDateToDraft(draft, date);
      const planId = item ? planIdFromCalendarItem(item) : undefined;

      if (planId) {
        const source = findPlan(planId);
        if (!source) return 'Sesión no encontrada.';
        const sessionNumber = source.sessionNumber ?? 1;
        const result = await updatePlan(source.id, {
          athleteId: source.athleteId,
          planType: 'personalized',
          title: source.title,
          content: serializePersonalizedPlanContent(scheduledDraft, sessionNumber),
        });
        if (result.error) return result.error;
        void syncExerciseVideosForNames(collectExerciseNamesFromSessionDraft(scheduledDraft));
        await loadSchedule();
        return null;
      }

      const sessionNumber = resolveSessionNumber(date, scheduledDraft);
      const title = defaultPlanGroup?.title ?? DEFAULT_PLAN_TITLE;
      const result = await createPlan({
        athleteId,
        planType: 'personalized',
        title,
        content: serializePersonalizedPlanContent(scheduledDraft, sessionNumber),
        planGroupId: defaultPlanGroup?.planGroupId,
        sessionNumber,
        athleteName: athlete?.name,
      });

      if (result.error) return result.error;
      void syncExerciseVideosForNames(collectExerciseNamesFromSessionDraft(scheduledDraft));
      await loadSchedule();
      return null;
    },
    [
      athlete?.name,
      athleteId,
      createPlan,
      defaultPlanGroup,
      findPlan,
      loadSchedule,
      personalizedPlans,
      resolveSessionNumber,
      updatePlan,
    ],
  );

  const attachPdfToDate = useCallback(
    async (date: Date, pdf: PickedPlanPdf) => {
      if (!user?.id) return 'Sesión no válida';

      const monday = new Date(date);
      const day = monday.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      monday.setDate(monday.getDate() + diff);
      monday.setHours(12, 0, 0, 0);

      const result = await importAthletePlanPdfToCalendar({
        athleteId,
        trainerId: user.id,
        title: defaultPlanGroup?.title ?? DEFAULT_PLAN_TITLE,
        pdf,
        athleteName: athlete?.name,
        planGroupId: defaultPlanGroup?.planGroupId,
        weekStartDate: monday,
        replacePlanIds: defaultPlanGroup?.sessions.map((session) => session.id) ?? [],
      });

      if (result.error) return result.error;
      await loadSchedule();
      return null;
    },
    [athlete?.name, athleteId, defaultPlanGroup, loadSchedule, user?.id],
  );

  const handleDayAction = useCallback(
    (action: CalendarDayActionId) => {
      if (action !== 'nutrition') return;
      router.push({
        pathname: '/trainer/plan/create',
        params: { type: 'nutrition', athleteId },
      });
    },
    [athleteId, router],
  );

  const loadCalendarSessionDraft = (item: SchedulePreviewItem) => {
    const planId =
      planIdFromCalendarItem(item) ??
      personalizedPlans.find((plan) => item.id === plan.id || item.id.startsWith(`plan:${plan.id}`))
        ?.id;
    const plan = findPlan(planId);
    if (!plan) return null;
    return parsePersonalizedPlanContent(plan.content, (plan.sessionNumber ?? 1) - 1);
  };

  const openCalendarSession = (item: SchedulePreviewItem) => {
    const planId = planIdFromCalendarItem(item);
    if (!planId) return;
    router.push({ pathname: '/trainer/plan/[id]', params: { id: planId, edit: '1' } });
  };

  const handleCalendarDelete = async (item: SchedulePreviewItem) => {
    const planId =
      planIdFromCalendarItem(item) ??
      personalizedPlans.find((plan) => item.id === plan.id || item.id.startsWith(`plan:${plan.id}`))
        ?.id;
    if (!planId) return 'Solo se pueden eliminar sesiones del plan personalizado de este atleta.';
    const result = await removePlan(planId);
    if (result.error) return result.error;
    await loadSchedule();
    return null;
  };

  const handleCalendarCopy = async (item: SchedulePreviewItem, targetDate: Date) => {
    const error = await copyCalendarSession({
      item,
      targetDate,
      planIdFromItem: planIdFromCalendarItem,
      findPlan,
      findPlanGroup,
      loadDraft: loadCalendarSessionDraft,
      applyDateToDraft,
      createPlan: async (input) => {
        const result = await createPlan(input);
        return { error: result.error };
      },
      athleteName: athlete?.name,
    });
    if (error) return error;
    await loadSchedule();
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
      findPlan,
      findPlanGroup,
      loadDraft: loadCalendarSessionDraft,
      applyDateToDraft,
      createPlan: async (input) => {
        const result = await createPlan(input);
        return { error: result.error };
      },
      athleteName: athlete?.name,
    });
    if (error) return error;
    await loadSchedule();
    return null;
  };

  const handleCalendarMoveToDate = async (
    item: SchedulePreviewItem,
    date: Date,
    dayItems?: SchedulePreviewItem[],
  ) => {
    const planId = planIdFromCalendarItem(item);
    const group = planId ? findPlanGroup(planId) : undefined;
    const source = findPlan(planId);
    const sessions = group?.sessions;
    if (!source || !sessions) return 'Solo se pueden mover sesiones de planes personalizados.';
    const orderedIds = dayItems
      ?.map((entry) => planIdFromCalendarItem(entry))
      .filter((entry): entry is string => Boolean(entry));
    const error = await moveCalendarSessionToDate({
      sessions,
      plan: source,
      targetDate: date,
      orderedIds,
      updatePlan: async (id, input) => {
        const result = await updatePlan(id, input);
        return { error: result.error };
      },
    });
    if (error) return error;
    await loadSchedule();
    return null;
  };

  const handleCalendarReorderDay = async (_date: Date, orderedItems: SchedulePreviewItem[]) => {
    const orderedIds = orderedItems
      .map((item) => planIdFromCalendarItem(item))
      .filter((planId): planId is string => Boolean(planId));
    const touchedGroupIds = new Set<string>();

    for (const planId of orderedIds) {
      const group = findPlanGroup(planId);
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

    await loadSchedule();
    return null;
  };

  if (athleteLoading || scheduleLoading) {
    if (embedded) {
      return <ActivityIndicator color={colors.accent} style={styles.loader} />;
    }
    return (
      <ScreenWrapper scrollable={false}>
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      </ScreenWrapper>
    );
  }

  if (!athlete) {
    if (embedded) {
      return <Text style={styles.error}>Atleta no encontrado</Text>;
    }
    return (
      <ScreenWrapper>
        <Text style={styles.error}>Atleta no encontrado</Text>
      </ScreenWrapper>
    );
  }

  const hasSchedule = personalizedPlans.length > 0;
  const catalogNote =
    activeCatalogCount > 0
      ? ` Tiene ${activeCatalogCount} programación${activeCatalogCount === 1 ? '' : 'es'} de catálogo activa${activeCatalogCount === 1 ? '' : 's'} (se gestiona en Programaciones).`
      : '';

  const calendar = (
    <ScheduleCalendarModal
      visible
      presentation="inline"
      embedded={embedded}
      title={athlete.name}
      subtitle={
        hasSchedule
          ? `Todos los planes personalizados, según sus fechas de vigencia. Pulsa el marcador de un día para crear, copiar o añadir desde plantilla.${catalogNote}`
          : `Todavía no hay un plan personalizado. Pulsa el marcador de un día para crear la primera sesión.${catalogNote}`
      }
      source={calendarSource}
      planGroups={calendarPersonalizedGroups}
      headerAction={
        embedded ? undefined : (
          <Pressable
            onPress={() => router.push(getTrainerAthleteDetailsHref(athlete.id))}
            style={({ pressed }) => [styles.profileLink, pressed && styles.profileLinkPressed]}
          >
            <Text style={styles.profileLinkText}>Ver ficha del atleta</Text>
          </Pressable>
        )
      }
      loadSessionDraft={loadCalendarSessionDraft}
      buildSessionDraft={buildSessionDraftForDate}
      buildRestDayDraft={buildRestDayDraftForDate}
      saveSession={saveCalendarSession}
      onDayAction={handleDayAction}
      onAttachPdf={attachPdfToDate}
      onSessionPreview={(item) => openTrainerPreviewSession(router, item, calendarSource)}
      onSessionEdit={openCalendarSession}
      onSessionCopy={handleCalendarCopy}
      onCopyDayToDate={handleCopyDayToDate}
      onSessionDelete={handleCalendarDelete}
      onSessionMoveToDate={handleCalendarMoveToDate}
      onSessionReorderDay={handleCalendarReorderDay}
    />
  );

  if (embedded) {
    return calendar;
  }

  return (
    <ScreenWrapper scrollable={false} padded={false}>
      <View style={styles.screen}>
        <View style={styles.backRow}>
          <HeaderBackButton />
        </View>
        {calendar}
        <TrainerAthleteChatWidget
          athleteId={athlete.id}
          athleteName={athlete.name}
          unreadCount={athlete.alerts?.chatCount ?? 0}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    position: 'relative',
  },
  backRow: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  loader: {
    marginTop: spacing.xl,
  },
  error: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
  },
  profileLink: {
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    backgroundColor: withAlpha(colors.accent, '12'),
  },
  profileLinkPressed: {
    opacity: 0.85,
  },
  profileLinkText: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '700',
  },
});
