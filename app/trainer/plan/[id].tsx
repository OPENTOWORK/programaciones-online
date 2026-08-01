import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { NutritionPlanContent } from '@/components/program/NutritionPlanContent';
import { PersonalizedPlanContent } from '@/components/program/PersonalizedPlanContent';
import { NutritionPlanBuilder } from '@/components/trainer/NutritionPlanBuilder';
import {
  PersonalizedPlanSessionLayout,
  type QueuedPlanSession,
} from '@/components/trainer/PersonalizedPlanSessionLayout';
import {
  ScheduleCalendarModal,
  type CalendarSessionSaveInput,
} from '@/components/trainer/ScheduleCalendarModal';
import { AppIcon, IconBadge } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import type { AppIconName } from '@/constants/icons';
import { useAthletePlan, useTrainerAthletePlans } from '@/hooks/useAthletePlans';
import { fetchAthletePlansForAthlete } from '@/lib/athletePlanService';
import {
  parseSchedulePreviewItemKey,
  type SchedulePreviewItem,
} from '@/lib/programSchedulePreview';
import { normalizeRouteParam } from '@/lib/routeParams';
import { safeGoBack } from '@/lib/navigation';
import {
  findPlanGroup,
  getNextSessionNumber,
  getPlanGroupId,
  getSessionLabel,
  groupPersonalizedPlans,
} from '@/lib/personalizedPlanGroups';
import { createEmptyNutritionPlan } from '@/lib/nutritionPlanContent';
import { openPlanPdf } from '@/lib/openPlanPdf';
import { pickPlanPdf, type PickedPlanPdf } from '@/lib/planPdfPicker';
import {
  createPersonalizedPlanPreviewProgram,
  isStructuredPersonalizedPlanContent,
  parsePersonalizedPlanContent,
  serializePersonalizedPlanContent,
  validatePersonalizedPlanDraft,
} from '@/lib/personalizedPlanContent';
import type { ScheduleCalendarSource } from '@/lib/scheduleCalendarItems';
import { formatScheduleSummary, toWeekdayIndex } from '@/lib/sessionSchedule';
import { collectExerciseNamesFromSessionDraft } from '@/lib/exerciseTextParser';
import { syncExerciseVideosForNames } from '@/lib/exerciseVideoSyncService';
import { createEmptySessionDraft, type SessionDraft } from '@/lib/trainerSessionDraft';
import { ATHLETE_PLAN_TYPE_LABELS } from '@/lib/trainerConstants';
import type { AthletePlan, NutritionPlanData } from '@/lib/types';

const PLAN_ICONS: Record<'personalized' | 'nutrition', AppIconName> = {
  personalized: 'personal',
  nutrition: 'measure',
};

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function TrainerPlanDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[]; edit?: string | string[] }>();
  const planId = Array.isArray(params.id) ? params.id[0] : params.id ?? '';
  const editParam = normalizeRouteParam(params.edit);
  const wantsSessionEdit = editParam === '1';
  const wantsGroupEdit = editParam === 'group';

  const { plan, isLoading, error: loadError, refresh } = useAthletePlan(planId);
  const { createPlan, updatePlan, removePlan } = useTrainerAthletePlans();

  const [mode, setMode] = useState<'view' | 'edit' | 'editGroup'>('view');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sessionDraft, setSessionDraft] = useState<SessionDraft>(() => createEmptySessionDraft(0));
  const [nutritionData, setNutritionData] = useState<NutritionPlanData>(() => createEmptyNutritionPlan());
  const [attachedPdf, setAttachedPdf] = useState<PickedPlanPdf | null>(null);
  const [removePdfFlag, setRemovePdfFlag] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pickingPdf, setPickingPdf] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [groupSessions, setGroupSessions] = useState<AthletePlan[]>([]);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const isNutrition = plan?.planType === 'nutrition';
  const hasStructuredNutrition = Boolean(plan?.nutritionData && plan.nutritionData.meals.length > 0);
  const hasStructuredPersonalized = Boolean(plan?.content && isStructuredPersonalizedPlanContent(plan.content));

  const resetFormFromPlan = () => {
    if (!plan) return;
    setTitle(plan.title);
    setContent(plan.nutritionData ? '' : plan.content);
    setSessionDraft(
      plan.planType === 'personalized'
        ? parsePersonalizedPlanContent(plan.content, (plan.sessionNumber ?? 1) - 1)
        : createEmptySessionDraft(0),
    );
    setNutritionData(
      plan.nutritionData ?? {
        ...createEmptyNutritionPlan(),
        notes: plan.planType === 'nutrition' ? plan.content : '',
      },
    );
    setAttachedPdf(null);
    setRemovePdfFlag(false);
    setFormError(null);
  };

  useEffect(() => {
    resetFormFromPlan();
    if (wantsGroupEdit && plan?.planType === 'personalized') {
      setMode('editGroup');
      return;
    }
    setMode(wantsSessionEdit ? 'edit' : 'view');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan?.id, wantsGroupEdit, wantsSessionEdit]);

  useEffect(() => {
    if (!plan || plan.planType !== 'personalized') {
      setGroupSessions([]);
      return;
    }

    let cancelled = false;

    void fetchAthletePlansForAthlete(plan.athleteId, plan.trainerId)
      .then((plans) => {
        if (cancelled) return;
        const group = findPlanGroup(groupPersonalizedPlans(plans), plan);
        setGroupSessions(group?.sessions ?? [plan]);
      })
      .catch(() => {
        if (!cancelled) setGroupSessions([plan]);
      });

    return () => {
      cancelled = true;
    };
  }, [plan]);

  // El calendario debe enseñar todas las sesiones del plan, no solo la que se está editando.
  const otherGroupSessions = useMemo<QueuedPlanSession[]>(() => {
    if (!plan || plan.planType !== 'personalized') return [];

    return groupSessions
      .filter((session) => session.id !== plan.id)
      .map((session, index) => {
        const number = session.sessionNumber ?? index + 1;
        return {
          id: session.id,
          sessionNumber: number,
          draft: parsePersonalizedPlanContent(session.content, number - 1),
          isSaved: true,
        };
      });
  }, [groupSessions, plan]);

  const findGroupSession = (item: SchedulePreviewItem) => {
    const { sourceId } = parseSchedulePreviewItemKey(item.id);
    return groupSessions.find((session) => session.id === sourceId);
  };

  const loadCalendarSessionDraft = (item: SchedulePreviewItem) => {
    const sibling = otherGroupSessions.find((session) => session.id === findGroupSession(item)?.id);
    if (sibling) return sibling.draft;
    return item.isCurrent ? sessionDraft : null;
  };

  const viewCalendarSource = useMemo<ScheduleCalendarSource>(
    () => ({
      program: createPersonalizedPlanPreviewProgram(plan?.title ?? 'Plan personalizado'),
      workouts: [],
      draft: createEmptySessionDraft(0),
      isNewSession: false,
      athleteSchedule: { plans: groupSessions, workouts: [] },
    }),
    [groupSessions, plan?.title],
  );

  const planIdFromCalendarItem = (item: SchedulePreviewItem) =>
    item.id.startsWith('plan:') ? item.id.split(':')[1] : parseSchedulePreviewItemKey(item.id).sourceId;

  const refreshGroupSessions = useCallback(async () => {
    if (!plan || plan.planType !== 'personalized') return;
    const plans = await fetchAthletePlansForAthlete(plan.athleteId, plan.trainerId);
    const group = findPlanGroup(groupPersonalizedPlans(plans), plan);
    setGroupSessions(group?.sessions ?? [plan]);
    await refresh();
  }, [plan, refresh]);

  const loadViewCalendarSessionDraft = (item: SchedulePreviewItem) => {
    const sessionId = planIdFromCalendarItem(item);
    const session = groupSessions.find((entry) => entry.id === sessionId);
    if (!session) return null;
    return parsePersonalizedPlanContent(session.content, (session.sessionNumber ?? 1) - 1);
  };

  const handleViewCalendarDelete = async (item: SchedulePreviewItem) => {
    const sessionId = planIdFromCalendarItem(item);
    if (!sessionId) return 'No se pudo identificar la sesión.';

    const result = await removePlan(sessionId);
    if (result.error) return result.error;

    if (sessionId === plan?.id) {
      setCalendarOpen(false);
      safeGoBack(router, { pathname: '/trainer/athlete/[id]', params: { id: plan.athleteId } });
      return null;
    }

    await refreshGroupSessions();
    return null;
  };

  const handleViewCalendarCopy = async (item: SchedulePreviewItem) => {
    if (!plan) return 'No se pudo copiar la sesión.';
    const sessionId = planIdFromCalendarItem(item);
    const source = groupSessions.find((session) => session.id === sessionId);
    if (!source) return 'No se pudo copiar la sesión.';

    const nextNumber = getNextSessionNumber(groupSessions);
    const draft = parsePersonalizedPlanContent(source.content, (source.sessionNumber ?? 1) - 1);
    const result = await createPlan({
      athleteId: source.athleteId,
      planType: 'personalized',
      title: plan.title,
      content: serializePersonalizedPlanContent({ ...draft, name: `Sesión ${nextNumber}` }, nextNumber),
      planGroupId: getPlanGroupId(plan),
      sessionNumber: nextNumber,
      athleteName: plan.athleteName,
    });

    if (result.error) return result.error;
    await refreshGroupSessions();
    return null;
  };

  const handleViewCalendarMoveToDate = async (item: SchedulePreviewItem, date: Date) => {
    const sessionId = planIdFromCalendarItem(item);
    const source = groupSessions.find((session) => session.id === sessionId);
    if (!source) return 'No se pudo mover la sesión.';

    const draft = parsePersonalizedPlanContent(source.content, (source.sessionNumber ?? 1) - 1);
    const schedule = { ...draft.schedule, weekdays: [toWeekdayIndex(date)] };
    const updatedDraft = {
      ...draft,
      schedule,
      dayLabel: formatScheduleSummary(schedule),
    };

    const result = await updatePlan(source.id, {
      athleteId: source.athleteId,
      planType: 'personalized',
      title: source.title,
      content: serializePersonalizedPlanContent(updatedDraft, source.sessionNumber ?? 1),
    });

    if (result.error) return result.error;
    await refreshGroupSessions();
    return null;
  };

  const openCalendarSessionEditor = (item: SchedulePreviewItem) => {
    const sessionId = planIdFromCalendarItem(item);
    if (!sessionId) return;
    setCalendarOpen(false);
    router.push({ pathname: '/trainer/plan/[id]', params: { id: sessionId, edit: '1' } });
  };

  const enterEditMode = () => {
    resetFormFromPlan();
    setMode('edit');
  };

  const cancelEdit = () => {
    resetFormFromPlan();
    setMode('view');
  };

  const handlePickPdf = async () => {
    setPickingPdf(true);
    setFormError(null);

    const picked = await pickPlanPdf();
    setPickingPdf(false);

    if ('cancelled' in picked) return;
    if ('error' in picked) {
      setFormError(picked.error);
      return;
    }

    setRemovePdfFlag(false);
    setAttachedPdf(picked);
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
  };

  const handleSaveGroupPlan = async () => {
    if (!plan) return;

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setFormError('El título del plan es obligatorio');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      for (const session of groupSessions) {
        const result = await updatePlan(session.id, {
          athleteId: session.athleteId,
          planType: session.planType,
          title: trimmedTitle,
          content: session.content,
        });

        if (result.error) {
          setFormError(result.error);
          return;
        }
      }

      await refresh();
      setMode('view');
      router.replace({ pathname: '/trainer/plan/[id]', params: { id: plan.id } });
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : 'No se pudo guardar el plan');
    } finally {
      setSubmitting(false);
    }
  };

  const persistSessionDraft = async (draftToSave: SessionDraft): Promise<string | null> => {
    if (!plan) return 'No se pudo cargar el plan.';

    const trimmedTitle = title.trim();
    if (!trimmedTitle) return 'El título del plan es obligatorio';

    const draftError = validatePersonalizedPlanDraft(draftToSave);
    if (draftError && !attachedPdf && !plan.pdfFileName) return draftError;

    const videoSync = await syncExerciseVideosForNames(collectExerciseNamesFromSessionDraft(draftToSave));
    if (videoSync.error) return videoSync.error;

    const result = await updatePlan(plan.id, {
      athleteId: plan.athleteId,
      planType: plan.planType,
      title: trimmedTitle,
      content: serializePersonalizedPlanContent(draftToSave, plan.sessionNumber ?? 1),
      pdf: attachedPdf ?? undefined,
      removePdf: removePdfFlag,
    });

    if (result.error) return result.error;

    await refresh();
    return null;
  };

  /** Guarda una sesión hermana editada desde el calendario, sin tocar la que está abierta. */
  const persistOtherSessionDraft = async (
    target: AthletePlan,
    draftToSave: SessionDraft,
  ): Promise<string | null> => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return 'El título del plan es obligatorio';

    const draftError = validatePersonalizedPlanDraft(draftToSave);
    if (draftError) return draftError;

    const videoSync = await syncExerciseVideosForNames(collectExerciseNamesFromSessionDraft(draftToSave));
    if (videoSync.error) return videoSync.error;

    const content = serializePersonalizedPlanContent(draftToSave, target.sessionNumber ?? 1);
    const result = await updatePlan(target.id, {
      athleteId: target.athleteId,
      planType: target.planType,
      title: trimmedTitle,
      content,
    });

    if (result.error) return result.error;

    setGroupSessions((current) =>
      current.map((session) => (session.id === target.id ? { ...session, content } : session)),
    );
    return null;
  };

  const handleSave = async () => {
    if (!plan) return;

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setFormError('El título del plan es obligatorio');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      if (!isNutrition) {
        const draftError = await persistSessionDraft(sessionDraft);
        if (draftError) {
          setFormError(draftError);
          return;
        }

        setMode('view');
        return;
      }

      const result = await updatePlan(plan.id, {
        athleteId: plan.athleteId,
        planType: plan.planType,
        title: trimmedTitle,
        content: '',
        nutritionData,
        pdf: attachedPdf ?? undefined,
        removePdf: removePdfFlag,
      });

      if (result.error) {
        setFormError(result.error);
        return;
      }

      await refresh();
      setMode('view');
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : 'No se pudo guardar el plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCalendarSave = async ({ draft, item }: CalendarSessionSaveInput) => {
    const target = item ? findGroupSession(item) : undefined;
    if (target && target.id !== plan?.id) {
      return persistOtherSessionDraft(target, draft);
    }

    setSessionDraft(draft);
    return persistSessionDraft(draft);
  };

  const handleDelete = () => {
    if (!plan) return;

    const confirmDelete = async () => {
      setDeleting(true);
      const result = await removePlan(plan.id);
      setDeleting(false);

      if (result.error) {
        setFormError(result.error);
        return;
      }

      safeGoBack(router, `/trainer/athlete/${plan.athleteId}`);
    };

    if (Platform.OS === 'web') {
      if (window.confirm('¿Seguro que quieres eliminar este plan? Esta acción no se puede deshacer.')) {
        void confirmDelete();
      }
      return;
    }

    Alert.alert('Eliminar plan', '¿Seguro que quieres eliminar este plan? Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => void confirmDelete() },
    ]);
  };

  if (isLoading) {
    return (
      <ScreenWrapper>
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      </ScreenWrapper>
    );
  }

  if (!plan) {
    return (
      <ScreenWrapper>
        <Card>
          <Text style={styles.emptyTitle}>Plan no encontrado</Text>
          <Text style={styles.emptyText}>{loadError ?? 'Puede que el plan haya sido eliminado.'}</Text>
        </Card>
      </ScreenWrapper>
    );
  }

  const useWideEditor = mode === 'edit' && !isNutrition;
  const currentSessionIndex = groupSessions.findIndex((session) => session.id === plan.id);
  const currentSessionLabel = getSessionLabel(plan, Math.max(currentSessionIndex, 0));

  return (
    <ScreenWrapper padded={useWideEditor ? false : undefined}>
      <View style={[useWideEditor && styles.editPageShell]}>
      <View style={styles.header}>
        <IconBadge name={PLAN_ICONS[plan.planType]} containerSize={44} size={22} />
        <View style={styles.headerText}>
          <Text style={styles.title}>
            {isNutrition ? plan.title : `${plan.title} · ${currentSessionLabel}`}
          </Text>
          <Text style={styles.meta}>
            {plan.athleteName ?? 'Atleta'} · {ATHLETE_PLAN_TYPE_LABELS[plan.planType]} · Asignado el{' '}
            {formatDate(plan.createdAt)}
          </Text>
        </View>
      </View>

      {!isNutrition && groupSessions.length > 0 && mode !== 'editGroup' ? (
        <Card style={styles.sessionsCard}>
          <Text style={styles.sessionsTitle}>Sesiones del plan</Text>
          {groupSessions.map((session, index) => {
            const active = session.id === plan.id;
            return (
              <View
                key={session.id}
                style={[styles.sessionRow, active && styles.sessionRowActive]}
              >
                <Pressable
                  onPress={() =>
                    active
                      ? undefined
                      : router.replace({ pathname: '/trainer/plan/[id]', params: { id: session.id } })
                  }
                  style={styles.sessionRowMain}
                  disabled={active}
                >
                  <Text style={[styles.sessionRowText, active && styles.sessionRowTextActive]}>
                    {getSessionLabel(session, index)}
                  </Text>
                </Pressable>
                <View style={styles.sessionRowActions}>
                  <Pressable
                    onPress={() => setCalendarOpen(true)}
                    accessibilityLabel="Ver en el calendario"
                    hitSlop={6}
                    style={({ pressed }) => [styles.calendarBtn, pressed && styles.calendarBtnPressed]}
                  >
                    <Ionicons name="calendar-outline" size={14} color={colors.accent} />
                    <Text style={styles.calendarBtnText}>Calendario</Text>
                  </Pressable>
                  {active ? (
                    <Text style={styles.sessionCurrent}>Actual</Text>
                  ) : (
                    <Pressable
                      onPress={() =>
                        router.replace({ pathname: '/trainer/plan/[id]', params: { id: session.id } })
                      }
                      hitSlop={6}
                    >
                      <Text style={styles.planChevron}>›</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })}
          <Button
            title="Añadir sesión"
            variant="outline"
            onPress={() =>
              router.push({
                pathname: '/trainer/plan/create',
                params: {
                  type: 'personalized',
                  athleteId: plan.athleteId,
                  planGroupId: getPlanGroupId(plan),
                },
              })
            }
            style={styles.addSessionBtn}
          />
        </Card>
      ) : null}

      {mode === 'editGroup' ? (
        <Card style={styles.groupEditCard}>
          <Text style={styles.groupEditTitle}>Editar plan personalizado</Text>
          <Text style={styles.groupEditHint}>
            Cambia el título del plan o entra en cada sesión para editar su contenido.
          </Text>

          <Input label="Título del plan" value={title} onChangeText={handleTitleChange} />

          <Text style={styles.sessionsTitle}>Sesiones del plan</Text>
          {groupSessions.map((session, index) => (
            <View key={session.id} style={styles.groupSessionRow}>
              <View style={styles.groupSessionText}>
                <Text style={styles.sessionRowText}>{getSessionLabel(session, index)}</Text>
                <Text style={styles.groupSessionMeta}>
                  {parsePersonalizedPlanContent(
                    session.content,
                    (session.sessionNumber ?? index + 1) - 1,
                  ).dayLabel || 'Sin días configurados'}
                </Text>
              </View>
              <Button
                title="Editar sesión"
                variant="outline"
                onPress={() =>
                  router.replace({
                    pathname: '/trainer/plan/[id]',
                    params: { id: session.id, edit: '1' },
                  })
                }
                style={styles.groupSessionEditBtn}
              />
            </View>
          ))}

          <Button
            title="Añadir sesión"
            variant="outline"
            onPress={() =>
              router.push({
                pathname: '/trainer/plan/create',
                params: {
                  type: 'personalized',
                  athleteId: plan.athleteId,
                  planGroupId: getPlanGroupId(plan),
                },
              })
            }
            style={styles.addSessionBtn}
          />

          {formError ? <Text style={styles.error}>{formError}</Text> : null}

          <View style={styles.actionsRow}>
            <Button
              title="Guardar plan"
              onPress={() => void handleSaveGroupPlan()}
              loading={submitting}
              style={styles.actionBtn}
            />
            <Button
              title="Cancelar"
              variant="ghost"
              onPress={() => {
                resetFormFromPlan();
                setMode('view');
                router.replace({ pathname: '/trainer/plan/[id]', params: { id: plan.id } });
              }}
              style={styles.actionBtn}
            />
          </View>
        </Card>
      ) : null}

      {mode === 'view' ? (
        <>
          <Card style={styles.contentCard}>
            {hasStructuredNutrition ? (
              <NutritionPlanContent data={plan.nutritionData!} />
            ) : hasStructuredPersonalized ? (
              <PersonalizedPlanContent content={plan.content} sessionNumber={plan.sessionNumber ?? undefined} />
            ) : plan.content ? (
              <Text style={styles.contentText}>{plan.content}</Text>
            ) : null}

            {plan.pdfUrl ? (
              <View style={styles.pdfWrap}>
                <AppIcon name="programs" size={16} color={colors.textMuted} />
                <View style={styles.pdfInfo}>
                  <Text style={styles.pdfLabel}>{plan.pdfFileName ?? 'Plan.pdf'}</Text>
                  <Button
                    title="Ver PDF"
                    variant="outline"
                    onPress={() => void openPlanPdf(plan.pdfUrl!)}
                    style={styles.pdfOpenBtn}
                  />
                </View>
              </View>
            ) : null}
          </Card>

          {formError ? <Text style={styles.error}>{formError}</Text> : null}

          <View style={styles.actionsRow}>
            {!isNutrition && groupSessions.length > 0 ? (
              <Button
                title="Editar plan"
                onPress={() =>
                  router.replace({
                    pathname: '/trainer/plan/[id]',
                    params: { id: plan.id, edit: 'group' },
                  })
                }
                style={styles.actionBtn}
              />
            ) : (
              <Button title="Editar plan" onPress={enterEditMode} style={styles.actionBtn} />
            )}
            <Button
              title="Eliminar"
              variant="outline"
              onPress={handleDelete}
              loading={deleting}
              style={styles.deleteBtn}
              textStyle={styles.deleteBtnText}
            />
          </View>
        </>
      ) : (
        <View style={styles.editPage}>
          <Input label="Título del plan" value={title} onChangeText={handleTitleChange} />

          {isNutrition ? (
            <>
              <NutritionPlanBuilder value={nutritionData} onChange={setNutritionData} />
              {formError ? <Text style={styles.error}>{formError}</Text> : null}
              <View style={styles.pdfSection}>
                <Button
                  title={attachedPdf ? 'Cambiar PDF' : plan.pdfFileName ? 'Sustituir PDF' : 'Adjuntar PDF'}
                  variant="outline"
                  onPress={() => void handlePickPdf()}
                  loading={pickingPdf}
                  style={styles.pdfButton}
                />
                {attachedPdf ? (
                  <Text style={styles.pdfName} numberOfLines={2}>
                    {attachedPdf.fileName}
                  </Text>
                ) : plan.pdfFileName && !removePdfFlag ? (
                  <View style={styles.currentPdfRow}>
                    <Text style={styles.pdfName} numberOfLines={1}>
                      {plan.pdfFileName}
                    </Text>
                    <Button
                      title="Quitar PDF"
                      variant="ghost"
                      onPress={() => setRemovePdfFlag(true)}
                      style={styles.removePdfBtn}
                      textStyle={styles.removePdfBtnText}
                    />
                  </View>
                ) : (
                  <Text style={styles.pdfHint}>Opcional. El atleta podrá descargar el PDF desde su plan.</Text>
                )}
              </View>
              <View style={styles.actionsRow}>
                <Button title="Guardar cambios" onPress={() => void handleSave()} loading={submitting} style={styles.actionBtn} />
                <Button title="Cancelar" variant="ghost" onPress={cancelEdit} style={styles.actionBtn} />
              </View>
            </>
          ) : (
            <PersonalizedPlanSessionLayout
              planTitle={title}
              draft={sessionDraft}
              onDraftChange={setSessionDraft}
              showSessionName
              sessionNumber={plan.sessionNumber ?? 1}
              queuedSessions={otherGroupSessions}
              currentSessionSaved
              onLoadCalendarSessionDraft={loadCalendarSessionDraft}
              onSaveCalendarSession={handleCalendarSave}
              footer={
                <View style={styles.footer}>
                  <View style={styles.pdfSection}>
                    <Button
                      title={attachedPdf ? 'Cambiar PDF' : plan.pdfFileName ? 'Sustituir PDF' : 'Adjuntar PDF'}
                      variant="outline"
                      onPress={() => void handlePickPdf()}
                      loading={pickingPdf}
                      style={styles.pdfButton}
                    />
                    {attachedPdf ? (
                      <Text style={styles.pdfName} numberOfLines={2}>
                        {attachedPdf.fileName}
                      </Text>
                    ) : plan.pdfFileName && !removePdfFlag ? (
                      <View style={styles.currentPdfRow}>
                        <Text style={styles.pdfName} numberOfLines={1}>
                          {plan.pdfFileName}
                        </Text>
                        <Button
                          title="Quitar PDF"
                          variant="ghost"
                          onPress={() => setRemovePdfFlag(true)}
                          style={styles.removePdfBtn}
                          textStyle={styles.removePdfBtnText}
                        />
                      </View>
                    ) : (
                      <Text style={styles.pdfHint}>Opcional. El atleta podrá descargar el PDF desde su plan.</Text>
                    )}
                  </View>

                  {formError ? <Text style={styles.error}>{formError}</Text> : null}

                  <View style={styles.actionsRow}>
                    <Button title="Guardar cambios" onPress={() => void handleSave()} loading={submitting} style={styles.actionBtn} />
                    <Button title="Cancelar" variant="ghost" onPress={cancelEdit} style={styles.actionBtn} />
                  </View>
                </View>
              }
            />
          )}
        </View>
      )}
      </View>

      {!isNutrition ? (
        <ScheduleCalendarModal
          visible={calendarOpen}
          onClose={() => setCalendarOpen(false)}
          title={plan.title}
          subtitle={`Sesiones programadas de ${plan.athleteName ?? 'este atleta'}. Despliega una sesión para ver su contenido.`}
          source={viewCalendarSource}
          loadSessionDraft={loadViewCalendarSessionDraft}
          onSessionEdit={openCalendarSessionEditor}
          onSessionCopy={handleViewCalendarCopy}
          onSessionDelete={handleViewCalendarDelete}
          onSessionMoveToDate={handleViewCalendarMoveToDate}
        />
      ) : null}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: spacing.xl },
  emptyTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  emptyText: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 22 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  headerText: { flex: 1 },
  title: { ...typography.h2, color: colors.text },
  meta: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  contentCard: { marginBottom: spacing.md },
  contentText: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 22 },
  pdfWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pdfInfo: { flex: 1, gap: spacing.sm },
  pdfLabel: { ...typography.bodySmall, color: colors.text, fontWeight: '600' },
  pdfOpenBtn: { alignSelf: 'flex-start', minHeight: 44, paddingHorizontal: spacing.lg },
  error: { ...typography.bodySmall, color: colors.danger, marginBottom: spacing.md },
  actionsRow: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: { flex: 1 },
  deleteBtn: { flex: 1, borderColor: colors.danger },
  deleteBtnText: { color: colors.danger },
  editPage: {
    gap: spacing.md,
  },
  editPageShell: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  sessionsCard: {
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  sessionsTitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.background,
  },
  sessionRowActive: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}10`,
  },
  sessionRowMain: {
    flex: 1,
    minWidth: 0,
  },
  sessionRowText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  sessionRowTextActive: {
    color: colors.accent,
  },
  sessionRowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  calendarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: `${colors.accent}55`,
    backgroundColor: `${colors.accent}14`,
  },
  calendarBtnPressed: {
    backgroundColor: `${colors.accent}26`,
  },
  calendarBtnText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  sessionCurrent: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  planChevron: {
    ...typography.h3,
    color: colors.textMuted,
  },
  addSessionBtn: {
    marginTop: spacing.sm,
  },
  groupEditCard: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  groupEditTitle: {
    ...typography.h3,
    color: colors.text,
  },
  groupEditHint: {
    ...typography.bodySmall,
    color: colors.textMuted,
    lineHeight: 20,
  },
  groupSessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.background,
  },
  groupSessionText: {
    flex: 1,
    minWidth: 0,
  },
  groupSessionMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  groupSessionEditBtn: {
    minHeight: 40,
    paddingHorizontal: spacing.sm,
  },
  footer: {
    marginTop: spacing.md,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  contentInput: { minHeight: 160, paddingTop: 14 },
  pdfSection: { marginTop: spacing.sm, marginBottom: spacing.md, gap: spacing.sm },
  pdfButton: { width: '100%' },
  pdfName: { ...typography.bodySmall, color: colors.text, fontWeight: '600', flex: 1 },
  pdfHint: { ...typography.caption, color: colors.textMuted, lineHeight: 20 },
  currentPdfRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  removePdfBtn: { minHeight: 36, paddingHorizontal: spacing.sm },
  removePdfBtnText: { ...typography.bodySmall, color: colors.danger },
});
