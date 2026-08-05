import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { NutritionPlanBuilder } from '@/components/trainer/NutritionPlanBuilder';
import { PersonalizedPlanSessionLayout, type QueuedPlanSession } from '@/components/trainer/PersonalizedPlanSessionLayout';
import type { CalendarSessionSaveInput } from '@/components/trainer/ScheduleCalendarModal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useAthlete, useAthletes } from '@/hooks/useAthletes';
import { useTrainerAthletePlans } from '@/hooks/useAthletePlans';
import { fetchAthletePlansForAthlete } from '@/lib/athletePlanService';
import { createEmptyNutritionPlan } from '@/lib/nutritionPlanContent';
import { safeGoBack } from '@/lib/navigation';
import { pickPlanPdf, type PickedPlanPdf } from '@/lib/planPdfPicker';
import {
  findPlanGroup,
  getNextSessionNumber,
  groupPersonalizedPlans,
  type PersonalizedPlanGroup,
} from '@/lib/personalizedPlanGroups';
import {
  parsePersonalizedPlanContent,
  serializePersonalizedPlanContent,
  validatePersonalizedPlanDraft,
} from '@/lib/personalizedPlanContent';
import { hasSessionBlockContent } from '@/lib/sessionBlockSections';
import { needsActivationForDraft } from '@/lib/planActivation';
import { parseSchedulePreviewItemKey, type SchedulePreviewItem } from '@/lib/programSchedulePreview';
import {
  formatScheduleSummary,
  toLocalDateString,
  toWeekdayIndex,
  type SessionSchedule,
} from '@/lib/sessionSchedule';
import { collectExerciseNamesFromSessionDraft } from '@/lib/exerciseTextParser';
import { syncExerciseVideosForNames } from '@/lib/exerciseVideoSyncService';
import {
  createActivationDraftFor,
  createEmptySessionDraft,
  type SessionDraft,
} from '@/lib/trainerSessionDraft';
import { ATHLETE_PLAN_TYPE_LABELS, type AthletePlanType } from '@/lib/trainerConstants';
import type { NutritionPlanData } from '@/lib/types';

function parsePlanType(value?: string | string[]): AthletePlanType {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === 'nutrition' ? 'nutrition' : 'personalized';
}

function parseOptionalParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function parseSessionNumber(value?: string | string[]) {
  const raw = parseOptionalParam(value);
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export default function CreateAthletePlanScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    type?: string | string[];
    athleteId?: string | string[];
    planGroupId?: string | string[];
    sessionNumber?: string | string[];
  }>();
  const planType = parsePlanType(params.type);
  const presetAthleteId = parseOptionalParam(params.athleteId);
  const presetPlanGroupId = parseOptionalParam(params.planGroupId);
  const presetSessionNumber = parseSessionNumber(params.sessionNumber);

  const { athletes, isLoading: athletesLoading } = useAthletes();
  const { athlete: presetAthlete, isLoading: presetAthleteLoading } = useAthlete(presetAthleteId ?? '');
  const { user } = useAuth();
  const { createPlan } = useTrainerAthletePlans();

  const isNutrition = planType === 'nutrition';

  const [selectedAthleteId, setSelectedAthleteId] = useState(presetAthleteId ?? '');
  const [title, setTitle] = useState('');
  const [createMode, setCreateMode] = useState<'new' | 'existing'>(presetPlanGroupId ? 'existing' : 'new');
  const [selectedGroupId, setSelectedGroupId] = useState(presetPlanGroupId ?? '');
  const [sessionNumber, setSessionNumber] = useState(presetSessionNumber ?? 1);
  const [existingGroups, setExistingGroups] = useState<PersonalizedPlanGroup[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [sessionDraft, setSessionDraft] = useState<SessionDraft>(() =>
    createEmptySessionDraft((presetSessionNumber ?? 1) - 1),
  );
  const [queuedSessions, setQueuedSessions] = useState<QueuedPlanSession[]>([]);
  const [hasPendingBlocks, setHasPendingBlocks] = useState(false);
  const [nutritionData, setNutritionData] = useState<NutritionPlanData>(() => createEmptyNutritionPlan());
  const [attachedPdf, setAttachedPdf] = useState<PickedPlanPdf | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pickingPdf, setPickingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (presetAthleteId) {
      setSelectedAthleteId(presetAthleteId);
    }
  }, [presetAthleteId]);

  useEffect(() => {
    if (isNutrition || !selectedAthleteId || !user?.id) {
      setExistingGroups([]);
      return;
    }

    let cancelled = false;
    setGroupsLoading(true);

    void fetchAthletePlansForAthlete(selectedAthleteId)
      .then((plans) => {
        if (cancelled) return;
        setExistingGroups(groupPersonalizedPlans(plans));
      })
      .catch(() => {
        if (!cancelled) setExistingGroups([]);
      })
      .finally(() => {
        if (!cancelled) setGroupsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isNutrition, selectedAthleteId, user?.id]);

  const selectedGroup = useMemo(
    () => (selectedGroupId ? findPlanGroup(existingGroups, selectedGroupId) : undefined),
    [existingGroups, selectedGroupId],
  );

  useEffect(() => {
    if (createMode !== 'existing' || !selectedGroup) return;
    setTitle(selectedGroup.title);
    const nextSessionNumber = presetSessionNumber ?? getNextSessionNumber(selectedGroup.sessions);
    setSessionNumber(nextSessionNumber);
    setSessionDraft(createEmptySessionDraft(nextSessionNumber - 1));
  }, [createMode, presetSessionNumber, selectedGroup]);

  useEffect(() => {
    if (presetPlanGroupId && existingGroups.length > 0) {
      setCreateMode('existing');
      setSelectedGroupId(presetPlanGroupId);
    }
  }, [existingGroups.length, presetPlanGroupId]);

  const selectedAthlete = useMemo(() => {
    if (!selectedAthleteId) return undefined;
    if (presetAthlete?.id === selectedAthleteId) return presetAthlete;
    return athletes.find((athlete) => athlete.id === selectedAthleteId);
  }, [athletes, presetAthlete, selectedAthleteId]);

  const toggleAthleteSelection = (athleteId: string) => {
    setSelectedAthleteId((current) => (current === athleteId ? '' : athleteId));
  };

  const handleTitleChange = (value: string) => {
    if (createMode === 'existing') return;
    setTitle(value);
  };

  const handleCreateModeChange = (mode: 'new' | 'existing') => {
    setCreateMode(mode);
    if (mode === 'new') {
      setSelectedGroupId('');
      setSessionNumber(1);
      setQueuedSessions([]);
      setSessionDraft(createEmptySessionDraft(0));
      return;
    }

    const firstGroup = existingGroups[0];
    if (!firstGroup) return;
    setSelectedGroupId(firstGroup.id);
  };

  const handleGroupChange = (groupId: string) => {
    setSelectedGroupId(groupId);
  };

  const handleSessionNumberChange = (value: number) => {
    setSessionNumber(value);
    setSessionDraft((current) => ({
      ...current,
      name: `Sesión ${value}`,
    }));
  };

  // Sesiones ya guardadas del plan elegido: se muestran en el calendario para no perderlas de vista.
  const savedGroupSessions = useMemo<QueuedPlanSession[]>(() => {
    if (createMode !== 'existing' || !selectedGroup) return [];

    return selectedGroup.sessions.map((session, index) => {
      const number = session.sessionNumber ?? index + 1;
      return {
        id: session.id,
        sessionNumber: number,
        draft: parsePersonalizedPlanContent(session.content, number - 1),
        isSaved: true,
      };
    });
  }, [createMode, selectedGroup]);

  const calendarSessions = useMemo(
    () => [...savedGroupSessions, ...queuedSessions],
    [savedGroupSessions, queuedSessions],
  );

  const canConfirmCurrentSession =
    createMode === 'new' &&
    validatePersonalizedPlanDraft(sessionDraft) === null &&
    hasSessionBlockContent(sessionDraft) &&
    !hasPendingBlocks;

  const resolvePlanTitle = () =>
    createMode === 'existing' ? selectedGroup?.title.trim() ?? '' : title.trim();

  const persistSession = async (
    draft: SessionDraft,
    sessionNum: number,
    options: { planGroupId?: string; attachPdf?: boolean },
  ) => {
    const draftError = validatePersonalizedPlanDraft(draft);
    if (draftError) {
      return { error: draftError };
    }

    const content = serializePersonalizedPlanContent(draft, sessionNum);
    const exerciseNames = collectExerciseNamesFromSessionDraft(draft);
    void syncExerciseVideosForNames(exerciseNames);

    const result = await createPlan({
      athleteId: selectedAthleteId,
      planType,
      title: resolvePlanTitle(),
      content,
      planGroupId: options.planGroupId,
      sessionNumber: sessionNum,
      athleteName: selectedAthlete?.name,
      pdf: options.attachPdf ? attachedPdf ?? undefined : undefined,
    });

    if (result.error) {
      return { error: result.error };
    }

    return { plan: result.plan };
  };

  /** Añade la sesión a la cola junto a su activación cuando ese día aún no tiene una. */
  const queueSessionWithActivation = (session: QueuedPlanSession) => {
    setQueuedSessions((current) => {
      const next = [...current, session];
      const existing = [...savedGroupSessions, ...next].map((entry) => entry.draft);
      if (!needsActivationForDraft(session.draft, existing)) return next;

      return [
        ...next,
        {
          id: `queued-activation-${session.sessionNumber}-${Date.now()}`,
          sessionNumber: session.sessionNumber,
          draft: createActivationDraftFor(session.draft),
        },
      ];
    });
  };

  const handleConfirmSession = () => {
    if (!canConfirmCurrentSession) {
      setError('Completa o elimina el bloque que estás editando antes de añadir otra sesión.');
      return;
    }

    queueSessionWithActivation({
      id: `queued-${sessionNumber}-${Date.now()}`,
      sessionNumber,
      draft: sessionDraft,
    });

    const nextSessionNumber = sessionNumber + 1;
    setSessionNumber(nextSessionNumber);
    setSessionDraft(createEmptySessionDraft(nextSessionNumber - 1));
    setError(null);
  };

  const applyDateToDraft = (draft: SessionDraft, date: Date): SessionDraft => {
    const schedule: SessionSchedule = {
      weekdays: [toWeekdayIndex(date)],
      recurrence: 'once',
      startDate: toLocalDateString(date),
    };
    return { ...draft, schedule, dayLabel: formatScheduleSummary(schedule) };
  };

  const nextCalendarSessionNumber = () => {
    const used = queuedSessions.map((session) => session.sessionNumber);
    if (hasSessionBlockContent(sessionDraft)) used.push(sessionNumber);
    return used.length === 0 ? sessionNumber : Math.max(...used) + 1;
  };

  const buildCalendarSessionDraft = (date: Date) =>
    applyDateToDraft(createEmptySessionDraft(nextCalendarSessionNumber() - 1), date);

  const loadCalendarSessionDraft = (item: SchedulePreviewItem) => {
    const { sourceId } = parseSchedulePreviewItemKey(item.id);
    // Las sesiones ya guardadas del plan solo se consultan aquí: se editan desde su propia ficha.
    if (savedGroupSessions.some((session) => session.id === sourceId)) return null;

    const queued = queuedSessions.find((session) => session.id === sourceId);
    if (queued) return queued.draft;
    return item.isCurrent ? sessionDraft : null;
  };

  const saveCalendarSession = ({ draft, item }: CalendarSessionSaveInput) => {
    const draftError = validatePersonalizedPlanDraft(draft);
    if (draftError) return draftError;
    if (!hasSessionBlockContent(draft)) return 'Añade al menos un bloque de entrenamiento.';

    const sourceId = item ? parseSchedulePreviewItemKey(item.id).sourceId : undefined;

    if (sourceId && savedGroupSessions.some((session) => session.id === sourceId)) {
      return 'Esta sesión ya está guardada. Ábrela desde el plan del atleta para modificarla.';
    }

    const queued = sourceId ? queuedSessions.find((session) => session.id === sourceId) : undefined;

    if (queued) {
      setQueuedSessions((sessions) =>
        sessions.map((session) => (session.id === queued.id ? { ...session, draft } : session)),
      );
      setError(null);
      return null;
    }

    if (item?.isCurrent) {
      setSessionDraft(draft);
      setError(null);
      return null;
    }

    const number = nextCalendarSessionNumber();
    queueSessionWithActivation({ id: `queued-${number}-${Date.now()}`, sessionNumber: number, draft });
    setError(null);
    return null;
  };

  const handleSubmit = async () => {
    if (!selectedAthleteId) {
      setError('Selecciona un atleta');
      return;
    }

    if (!isNutrition && createMode === 'existing' && !selectedGroup) {
      setError('Selecciona el plan al que quieres añadir la sesión');
      return;
    }

    const trimmedTitle = resolvePlanTitle();
    if (!trimmedTitle) {
      setError('El título del plan es obligatorio');
      return;
    }

    let content = '';
    if (isNutrition) {
      // handled below via nutritionData
    } else {
      const sessionsToSave: Array<{ sessionNumber: number; draft: SessionDraft }> = queuedSessions.map(
        (entry) => ({
          sessionNumber: entry.sessionNumber,
          draft: entry.draft,
        }),
      );

      const currentDraftError = validatePersonalizedPlanDraft(sessionDraft);
      const currentHasContent = hasSessionBlockContent(sessionDraft) || Boolean(attachedPdf);
      if (!currentDraftError && currentHasContent) {
        if (hasPendingBlocks) {
          setError('Completa o elimina el bloque que estás editando antes de guardar el plan.');
          return;
        }
        sessionsToSave.push({ sessionNumber, draft: sessionDraft });

        // Las sesiones ya encoladas traen su activación; la del formulario se añade aquí.
        const existing = [...savedGroupSessions, ...sessionsToSave].map((entry) => entry.draft);
        if (needsActivationForDraft(sessionDraft, existing)) {
          sessionsToSave.push({ sessionNumber, draft: createActivationDraftFor(sessionDraft) });
        }
      }

      if (sessionsToSave.length === 0) {
        setError(currentDraftError ?? 'Añade al menos una sesión al plan.');
        return;
      }

      setSubmitting(true);
      setError(null);

      try {
        let planGroupId = createMode === 'existing' ? selectedGroup?.planGroupId : undefined;
        let lastPlanId: string | undefined;

        for (const [index, session] of sessionsToSave.entries()) {
          const result = await persistSession(session.draft, session.sessionNumber, {
            planGroupId: index === 0 && createMode === 'new' ? undefined : planGroupId,
            attachPdf: index === 0,
          });

          if (result.error) {
            setError(result.error);
            return;
          }

          if (result.plan) {
            lastPlanId = result.plan.id;
            if (index === 0 && createMode === 'new') {
              planGroupId = result.plan.planGroupId ?? result.plan.id;
            }
          }
        }

        if (lastPlanId) {
          router.replace({ pathname: '/trainer/plan/[id]', params: { id: lastPlanId } });
          return;
        }

        safeGoBack(router, '/tabs/programs');
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : 'No se pudo guardar el plan');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await createPlan({
        athleteId: selectedAthleteId,
        planType,
        title: trimmedTitle,
        content,
        nutritionData: isNutrition ? nutritionData : undefined,
        athleteName: selectedAthlete?.name,
        pdf: attachedPdf ?? undefined,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.plan) {
        router.replace({ pathname: '/trainer/plan/[id]', params: { id: result.plan.id } });
        return;
      }

      safeGoBack(router, '/tabs/programs');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo guardar el plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePickPdf = async () => {
    setPickingPdf(true);
    setError(null);

    const picked = await pickPlanPdf();
    setPickingPdf(false);

    if ('cancelled' in picked) return;
    if ('error' in picked) {
      setError(picked.error);
      return;
    }

    setAttachedPdf(picked);
  };

  const athletePicker = (
    <Card style={styles.athletePicker}>
      <Text style={styles.pickerLabel}>Atleta</Text>
      <Text style={styles.pickerHint}>Pulsa de nuevo un atleta seleccionado para desmarcarlo.</Text>
      {athletes.map((athlete) => {
        const selected = athlete.id === selectedAthleteId;
        return (
          <Pressable
            key={athlete.id}
            onPress={() => toggleAthleteSelection(athlete.id)}
            style={[styles.athleteOption, selected && styles.athleteOptionSelected]}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{athlete.avatarInitials}</Text>
            </View>
            <View style={styles.athleteInfo}>
              <Text style={styles.athleteName}>{athlete.name}</Text>
              <Text style={styles.athleteEmail}>{athlete.email}</Text>
            </View>
            <View style={[styles.radio, selected && styles.radioSelected]} />
          </Pressable>
        );
      })}
    </Card>
  );

  const planFooter = (
    <View style={styles.footer}>
      <View style={styles.pdfSection}>
        <Button
          title={attachedPdf ? 'Cambiar PDF' : 'Adjuntar PDF'}
          variant="outline"
          onPress={() => void handlePickPdf()}
          loading={pickingPdf}
          style={styles.pdfButton}
        />
        {attachedPdf ? (
          <Text style={styles.pdfName} numberOfLines={2}>
            {attachedPdf.fileName}
          </Text>
        ) : (
          <Text style={styles.pdfHint}>Opcional. El atleta podrá descargar el PDF desde su plan.</Text>
        )}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title="Guardar y asignar plan" onPress={() => void handleSubmit()} loading={submitting} />
    </View>
  );

  return (
    <ScreenWrapper padded={false}>
      <View style={styles.page}>{renderPageContent()}</View>
    </ScreenWrapper>
  );

  function renderPageContent() {
    return (
      <>
        <View style={styles.pageHeader}>
          <Text style={styles.title}>{ATHLETE_PLAN_TYPE_LABELS[planType]}</Text>
          <SectionHeader
            title={selectedAthlete?.name ?? 'Asignar a un atleta'}
            subtitle={
              isNutrition
                ? 'El plan aparecerá en la pestaña correspondiente del atleta'
                : sessionDraft.dayLabel || 'Configura bloques, días y calendario como en una sesión'
            }
          />
        </View>

        {athletesLoading || (presetAthleteId && presetAthleteLoading) ? (
          <ActivityIndicator color={colors.accent} style={styles.loader} />
        ) : athletes.length === 0 ? (
          <Card>
            <Text style={styles.emptyTitle}>Sin atletas disponibles</Text>
            <Text style={styles.emptyText}>Registra atletas en la plataforma para poder asignarles planes.</Text>
          </Card>
        ) : isNutrition ? (
          <>
            {athletePicker}
            <Input
              label="Título del plan"
              value={title}
              onChangeText={setTitle}
              placeholder="Ej. Definición 8 semanas"
            />
            <NutritionPlanBuilder value={nutritionData} onChange={setNutritionData} />
            {planFooter}
          </>
        ) : (
          <>
            <Card style={styles.planSetupCard}>
              <Text style={styles.setupTitle}>Estructura del plan</Text>
              <Text style={styles.setupHint}>
                El título es el nombre del plan. Cada sesión se guarda por separado dentro del mismo plan.
              </Text>

              <View style={styles.modeRow}>
                <Pressable
                  onPress={() => handleCreateModeChange('new')}
                  style={[styles.modeBtn, createMode === 'new' && styles.modeBtnActive]}
                >
                  <Text style={[styles.modeBtnText, createMode === 'new' && styles.modeBtnTextActive]}>
                    Nuevo plan
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleCreateModeChange('existing')}
                  disabled={existingGroups.length === 0}
                  style={[
                    styles.modeBtn,
                    createMode === 'existing' && styles.modeBtnActive,
                    existingGroups.length === 0 && styles.modeBtnDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.modeBtnText,
                      createMode === 'existing' && styles.modeBtnTextActive,
                      existingGroups.length === 0 && styles.modeBtnTextDisabled,
                    ]}
                  >
                    Añadir sesión
                  </Text>
                </Pressable>
              </View>

              {createMode === 'existing' ? (
                groupsLoading ? (
                  <ActivityIndicator color={colors.accent} style={styles.inlineLoader} />
                ) : (
                  <>
                    <Text style={styles.fieldLabel}>Plan existente</Text>
                    <View style={styles.groupRow}>
                      {existingGroups.map((group) => {
                        const active = selectedGroup?.id === group.id;
                        return (
                          <Pressable
                            key={group.id}
                            onPress={() => handleGroupChange(group.id)}
                            style={[styles.groupBtn, active && styles.groupBtnActive]}
                          >
                            <Text style={[styles.groupBtnText, active && styles.groupBtnTextActive]}>
                              {group.title}
                            </Text>
                            <Text style={styles.groupBtnMeta}>
                              {group.sessions.length} sesión{group.sessions.length === 1 ? '' : 'es'}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </>
                )
              ) : null}

              <Input
                label="Título del plan"
                value={title}
                onChangeText={handleTitleChange}
                placeholder="Ej. Fuerza 4 semanas"
                editable={createMode === 'new'}
                style={createMode === 'existing' ? styles.readonlyInput : undefined}
              />

            </Card>

            {queuedSessions.length > 0 ? (
              <Card style={styles.queuedCard}>
                <Text style={styles.queuedTitle}>Sesiones en el calendario</Text>
                <Text style={styles.queuedHint}>
                  Aparecen como borrador hasta que pulses «Guardar y asignar plan».
                </Text>
                {queuedSessions.map((session) => (
                  <Text key={session.id} style={styles.queuedItem}>
                    {session.draft.name} · {session.draft.dayLabel}
                  </Text>
                ))}
              </Card>
            ) : null}

            {error ? <Text style={styles.error}>{error}</Text> : null}
            <PersonalizedPlanSessionLayout
              planTitle={title || selectedGroup?.title || 'Plan personalizado'}
              draft={sessionDraft}
              onDraftChange={setSessionDraft}
              header={athletePicker}
              showSessionName
              sessionNumber={sessionNumber}
              onSessionNumberChange={handleSessionNumberChange}
              queuedSessions={calendarSessions}
              onConfirmSession={createMode === 'new' ? handleConfirmSession : undefined}
              canConfirmSession={canConfirmCurrentSession}
              onPendingBlocksChange={setHasPendingBlocks}
              onBuildSessionDraftForDate={createMode === 'new' ? buildCalendarSessionDraft : undefined}
              onLoadCalendarSessionDraft={loadCalendarSessionDraft}
              onSaveCalendarSession={saveCalendarSession}
            />
            {planFooter}
          </>
        )}
      </>
    );
  }
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  pageHeader: {
    marginBottom: spacing.lg,
  },
  title: { ...typography.h1, color: colors.text, marginBottom: 4 },
  loader: { marginTop: spacing.xl },
  emptyTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  emptyText: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 22 },
  athletePicker: { marginBottom: spacing.md },
  pickerLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  pickerHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  athleteOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  athleteOptionSelected: {
    backgroundColor: `${colors.accent}11`,
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.accentBlue}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontWeight: '700', color: colors.accentBlue },
  athleteInfo: { flex: 1 },
  athleteName: { ...typography.body, color: colors.text, fontWeight: '600' },
  athleteEmail: { ...typography.caption, color: colors.textMuted },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.border,
  },
  radioSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  footer: {
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  error: {
    ...typography.bodySmall,
    color: colors.danger,
  },
  pdfSection: {
    gap: spacing.sm,
  },
  pdfButton: {
    width: '100%',
  },
  pdfName: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  pdfHint: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 20,
  },
  planSetupCard: {
    padding: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  setupTitle: {
    ...typography.h3,
    color: colors.text,
  },
  setupHint: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  modeBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  modeBtnActive: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}18`,
  },
  modeBtnDisabled: {
    opacity: 0.45,
  },
  modeBtnText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  modeBtnTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  modeBtnTextDisabled: {
    color: colors.textMuted,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  groupRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  groupBtn: {
    minWidth: 120,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  groupBtnActive: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}14`,
  },
  groupBtnText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  groupBtnTextActive: {
    color: colors.accent,
  },
  groupBtnMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  readonlyInput: {
    opacity: 0.75,
  },
  inlineLoader: {
    marginVertical: spacing.sm,
  },
  queuedCard: {
    padding: spacing.md,
    gap: spacing.xs,
    marginBottom: spacing.md,
    backgroundColor: `${colors.accent}10`,
    borderColor: `${colors.accent}33`,
  },
  queuedTitle: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '700',
  },
  queuedHint: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },
  queuedItem: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
