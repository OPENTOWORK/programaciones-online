import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  ScheduleCalendarModal,
  type CalendarSessionSaveInput,
} from '@/components/trainer/ScheduleCalendarModal';
import type { CalendarDayActionId } from '@/components/trainer/CalendarDayActionsMenu';
import { TrainerAthleteChatWidget } from '@/components/trainer/TrainerAthleteChatWidget';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { useAthlete } from '@/hooks/useAthletes';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { useTrainerAthletePlans } from '@/hooks/useAthletePlans';
import { loadTrainerAthleteScheduleSources } from '@/lib/athleteSchedule';
import { copyCalendarDaySessions } from '@/lib/copyCalendarDaySessions';
import { moveCalendarSessionToDate } from '@/lib/moveCalendarSession';
import { createActivationAfterSession } from '@/lib/planActivation';
import {
  createPersonalizedPlanPreviewProgram,
  parsePersonalizedPlanContent,
  serializePersonalizedPlanContent,
  validatePersonalizedPlanDraft,
} from '@/lib/personalizedPlanContent';
import {
  findPlanGroup as findPlanGroupByPlan,
  getNextSessionNumber,
  groupPersonalizedPlans,
  type PersonalizedPlanGroup,
} from '@/lib/personalizedPlanGroups';
import type { SchedulePreviewItem } from '@/lib/programSchedulePreview';
import type { ScheduleCalendarSource } from '@/lib/scheduleCalendarItems';
import { buildDayOrderUpdates } from '@/lib/scheduleDayOrder';
import { hasSessionBlockContent } from '@/lib/sessionBlockSections';
import { openTrainerPreviewSession } from '@/lib/sessionNavigation';
import {
  formatScheduleSummary,
  scheduleForCalendarDate,
  toLocalDateString,
  toWeekdayIndex,
} from '@/lib/sessionSchedule';
import {
  createEmptySessionDraft,
  createRestDayDraft,
  isActivationSessionDraft,
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

/** Ids de sesión personalizada: `plan:<planId>` o `plan:<planId>:<YYYY-MM-DD>`. */
function planIdFromCalendarItem(item: SchedulePreviewItem) {
  if (!item.id.startsWith('plan:')) return undefined;
  const rest = item.id.slice('plan:'.length);
  const withoutDate = rest.replace(/:\d{4}-\d{2}-\d{2}$/, '');
  return withoutDate || undefined;
}

export default function TrainerAthleteCalendarScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const athleteId = id ?? '';
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
      // Solo planes del atleta: el catálogo de Programaciones no se edita ni borra aquí.
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

  const personalizedGroups = useMemo(
    () => groupPersonalizedPlans(personalizedPlans),
    [personalizedPlans],
  );

  const calendarSource = useMemo<ScheduleCalendarSource>(
    () => ({
      program: createPersonalizedPlanPreviewProgram(
        athlete?.name ? `Programación de ${athlete.name}` : 'Programación del atleta',
      ),
      workouts: [],
      draft: createEmptySessionDraft(0),
      isNewSession: false,
      athleteSchedule: {
        plans: personalizedPlans,
        workouts: [],
        // Sin catalogPrograms: esas sesiones viven en Programaciones, no en la ficha del atleta.
      },
    }),
    [athlete?.name, personalizedPlans],
  );

  const findPlan = useCallback(
    (planId?: string) => personalizedPlans.find((plan) => plan.id === planId),
    [personalizedPlans],
  );

  const findPlanGroup = useCallback(
    (planId?: string): PersonalizedPlanGroup | undefined => {
      const plan = findPlan(planId);
      if (!plan) return undefined;
      return findPlanGroupByPlan(personalizedGroups, plan);
    },
    [findPlan, personalizedGroups],
  );

  const defaultPlanGroup = personalizedGroups[0];

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

      if (
        !isActivationSessionDraft(scheduledDraft) &&
        !isRestDaySessionDraft(scheduledDraft) &&
        result.plan
      ) {
        const planGroupId = defaultPlanGroup?.planGroupId ?? result.plan.planGroupId ?? result.plan.id;
        const activationError = await createActivationAfterSession(
          scheduledDraft,
          sessionNumber,
          {
            athleteId,
            title: result.plan.title,
            planGroupId,
            existingSessions: defaultPlanGroup?.sessions ?? [],
          },
          async (input) => {
            const activationResult = await createPlan({
              athleteId: input.athleteId,
              planType: 'personalized',
              title: input.title,
              content: input.content,
              planGroupId: input.planGroupId,
              sessionNumber: input.sessionNumber,
              athleteName: athlete?.name,
            });
            return { error: activationResult.error };
          },
        );
        if (activationError) return activationError;
      }

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

    if (!planId) {
      return 'Solo se pueden eliminar sesiones del plan personalizado de este atleta.';
    }

    const result = await removePlan(planId);
    if (result.error) return result.error;
    await loadSchedule();
    return null;
  };

  const handleCalendarCopy = async (item: SchedulePreviewItem) => {
    const planId = planIdFromCalendarItem(item);
    const source = findPlan(planId);
    const group = findPlanGroup(planId);
    if (!source || !group) return 'No se pudo copiar la sesión.';

    const nextNumber = getNextSessionNumber(group.sessions);
    const draft = parsePersonalizedPlanContent(source.content, (source.sessionNumber ?? 1) - 1);
    const copiedDraft = renameSessionCopy(draft, nextNumber);
    const result = await createPlan({
      athleteId: source.athleteId,
      planType: 'personalized',
      title: group.title,
      content: serializePersonalizedPlanContent(copiedDraft, nextNumber),
      planGroupId: group.planGroupId,
      sessionNumber: nextNumber,
      athleteName: athlete?.name,
    });

    if (result.error) return result.error;

    const activationError = await createActivationAfterSession(
      copiedDraft,
      nextNumber,
      {
        athleteId: source.athleteId,
        title: group.title,
        planGroupId: group.planGroupId,
        existingSessions: group.sessions,
      },
      async (input) => {
        const activationResult = await createPlan({
          athleteId: input.athleteId,
          planType: 'personalized',
          title: input.title,
          content: input.content,
          planGroupId: input.planGroupId,
          sessionNumber: input.sessionNumber,
          athleteName: athlete?.name,
        });
        return { error: activationResult.error };
      },
    );
    if (activationError) return activationError;

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
    const source = findPlan(planId);
    if (!source) return 'Solo se pueden mover sesiones de planes personalizados.';

    const orderedIds = dayItems
      ?.map((entry) => planIdFromCalendarItem(entry))
      .filter((entry): entry is string => Boolean(entry));

    const error = await moveCalendarSessionToDate({
      sessions: personalizedPlans,
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
    const updates = buildDayOrderUpdates(orderedIds, personalizedPlans);
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

    await loadSchedule();
    return null;
  };

  if (athleteLoading || scheduleLoading) {
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

  const hasSchedule = personalizedPlans.length > 0;
  const catalogNote =
    activeCatalogCount > 0
      ? ` Tiene ${activeCatalogCount} programación${activeCatalogCount === 1 ? '' : 'es'} de catálogo activa${activeCatalogCount === 1 ? '' : 's'} (se gestiona en Programaciones).`
      : '';

  return (
    <ScreenWrapper scrollable={false} padded={false}>
      <View style={styles.screen}>
        <ScheduleCalendarModal
          visible
          presentation="inline"
          title={athlete.name}
          subtitle={
            hasSchedule
              ? `Plan personalizado de este atleta. Pulsa el marcador de un día para crear, copiar o añadir desde plantilla.${catalogNote}`
              : `Todavía no hay un plan personalizado. Pulsa el marcador de un día para crear la primera sesión.${catalogNote}`
          }
          source={calendarSource}
          headerAction={
            <Pressable
              onPress={() => router.push({ pathname: '/trainer/athlete/[id]', params: { id: athlete.id } })}
              style={({ pressed }) => [styles.profileLink, pressed && styles.profileLinkPressed]}
            >
              <Text style={styles.profileLinkText}>Ver ficha del atleta</Text>
            </Pressable>
          }
          loadSessionDraft={loadCalendarSessionDraft}
          buildSessionDraft={buildSessionDraftForDate}
          buildRestDayDraft={buildRestDayDraftForDate}
          saveSession={saveCalendarSession}
          onDayAction={handleDayAction}
          onSessionPreview={(item) => openTrainerPreviewSession(router, item, calendarSource)}
          onSessionEdit={openCalendarSession}
          onSessionCopy={handleCalendarCopy}
          onCopyDayToDate={handleCopyDayToDate}
          onSessionDelete={handleCalendarDelete}
          onSessionMoveToDate={handleCalendarMoveToDate}
          onSessionReorderDay={handleCalendarReorderDay}
        />
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
    backgroundColor: `${colors.accent}12`,
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
