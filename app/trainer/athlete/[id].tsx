import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { borderRadius, goalLabels, levelColors, colors, spacing, typography } from '@/constants/theme';
import { useAthlete } from '@/hooks/useAthletes';
import { useAthleteIntakeForm } from '@/hooks/useAthleteIntakeForm';
import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { useTrainerAthletePlans } from '@/hooks/useAthletePlans';
import { useTrainerCrmActivity } from '@/hooks/useTrainerCrmActivity';
import { fetchAthletePlansForAthlete } from '@/lib/athletePlanService';
import { splitAssignedPlans, type PersonalizedPlanGroup } from '@/lib/personalizedPlanGroups';
import { fetchAthleteSessionLogs } from '@/lib/sessionLogService';
import { markAthleteDetailAlertsRead } from '@/lib/trainerAthleteAlerts';
import type { AthletePlan } from '@/lib/types';
import { AthleteSessionLogCard } from '@/components/trainer/AthleteSessionLogCard';
import { AthleteFeedbackPanel } from '@/components/trainer/AthleteFeedbackPanel';
import { AssignedPlansList } from '@/components/program/AssignedPlansList';
import { IntakeAnswersTable } from '@/components/trainer/IntakeAnswersTable';

function formatActivityDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatOptionalValue(value: string | number | undefined, suffix = '') {
  if (value === undefined || value === null || value === '') {
    return 'No indicado';
  }

  return `${value}${suffix}`;
}

function confirmDestructiveAction(message: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(message)) {
      onConfirm();
    }
    return;
  }

  Alert.alert('Confirmar', message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Eliminar', style: 'destructive', onPress: onConfirm },
  ]);
}

export default function AthleteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { removePlan } = useTrainerAthletePlans();
  const { athlete, isLoading, refresh: refreshAthlete } = useAthlete(id ?? '');
  const {
    entries: activityEntries,
    isLoading: activityLoading,
    persistent: activityPersistent,
    addNote,
    removeEntry: removeActivityEntry,
  } = useTrainerCrmActivity(id ?? '');
  const { form: intakeForm, isLoading: intakeLoading, isComplete: intakeComplete } = useAthleteIntakeForm(id);
  const [noteText, setNoteText] = useState('');
  const [assignedPlans, setAssignedPlans] = useState<AthletePlan[]>([]);
  const [sessionLogs, setSessionLogs] = useState<Awaited<ReturnType<typeof fetchAthleteSessionLogs>>>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [planActionError, setPlanActionError] = useState<string | null>(null);

  const loadAssignedPlans = useCallback(async () => {
    if (!id || !user?.id) {
      setAssignedPlans([]);
      setPlansLoading(false);
      return;
    }

    setPlansLoading(true);
    setPlanActionError(null);

    try {
      const data = await fetchAthletePlansForAthlete(id, user.id);
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
    if (
      !id ||
      !athlete?.alerts ||
      (athlete.alerts.sessionCount === 0 && !athlete.alerts.intakeChanged)
    ) {
      return;
    }

    void markAthleteDetailAlertsRead(id);
  }, [id, athlete?.alerts]);

  const handleDeletePlan = async (planId: string) => {
    const result = await removePlan(planId);
    if (result.error) {
      setPlanActionError(result.error);
      return;
    }
    await loadAssignedPlans();
  };

  const handleDeleteSession = (planId: string, label: string) => {
    confirmDestructiveAction(
      `¿Eliminar ${label}? Esta acción no se puede deshacer.`,
      () => void handleDeletePlan(planId),
    );
  };

  const handleDeleteGroup = (group: PersonalizedPlanGroup) => {
    confirmDestructiveAction(
      `¿Eliminar el plan "${group.title}" y sus ${group.sessions.length} sesión${group.sessions.length === 1 ? '' : 'es'}?`,
      () => {
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
    );
  };

  const handleDeleteNutritionPlan = (planId: string, title: string) => {
    confirmDestructiveAction(
      `¿Eliminar el plan nutricional "${title}"? Esta acción no se puede deshacer.`,
      () => void handleDeletePlan(planId),
    );
  };

  const openPlanGroupEditor = (group: PersonalizedPlanGroup) => {
    const firstSession = group.sessions[0];
    if (!firstSession) return;
    router.push({
      pathname: '/trainer/plan/[id]',
      params: { id: firstSession.id, edit: 'group' },
    });
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
    confirmDestructiveAction('¿Eliminar esta entrada del seguimiento?', () => void removeActivityEntry(entryId));
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

      {athlete.alerts && athlete.alerts.total > 0 ? (
        <Card style={styles.alertCard}>
          <SectionHeader
            title={`${athlete.alerts.total} alerta${athlete.alerts.total === 1 ? '' : 's'} pendiente${athlete.alerts.total === 1 ? '' : 's'}`}
            subtitle="Origen de las novedades de este atleta"
          />

          {athlete.alerts.chatCount > 0 ? (
            <Pressable
              onPress={() =>
                router.push({ pathname: '/trainer/chat/[id]', params: { id: athlete.id } })
              }
              style={({ pressed }) => [styles.alertRow, pressed && styles.alertRowPressed]}
            >
              <AppIcon name="chat" size={20} color={colors.warning} />
              <View style={styles.alertCopy}>
                <Text style={styles.alertTitle}>
                  {athlete.alerts.chatCount} mensaje{athlete.alerts.chatCount === 1 ? '' : 's'} nuevo
                  {athlete.alerts.chatCount === 1 ? '' : 's'} en el chat
                </Text>
                <Text style={styles.alertText}>Abre el chat para leer y quitar esta alerta.</Text>
              </View>
              <AppIcon name="chevronRight" size={18} color={colors.textMuted} />
            </Pressable>
          ) : null}

          {athlete.alerts.sessionCount > 0 ? (
            <View style={styles.alertRow}>
              <AppIcon name="stats" size={20} color={colors.warning} />
              <View style={styles.alertCopy}>
                <Text style={styles.alertTitle}>
                  {athlete.alerts.sessionCount} registro{athlete.alerts.sessionCount === 1 ? '' : 's'} de entreno nuevo
                  {athlete.alerts.sessionCount === 1 ? '' : 's'}
                </Text>
                <Text style={styles.alertText}>Puedes revisarlo en “Registro de entrenos” más abajo.</Text>
              </View>
            </View>
          ) : null}

          {athlete.alerts.intakeChanged ? (
            <View style={styles.alertRow}>
              <AppIcon name="info" size={20} color={colors.warning} />
              <View style={styles.alertCopy}>
                <Text style={styles.alertTitle}>Cuestionario actualizado</Text>
                <Text style={styles.alertText}>
                  El atleta ha completado o modificado su formulario de bienvenida.
                </Text>
              </View>
            </View>
          ) : null}
        </Card>
      ) : null}

      <Card style={styles.programCard}>
        <SectionHeader title="Seguimiento" subtitle="Notas, columnas, planes y mensajes por fecha" />

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
            <AppIcon name="add" size={18} color={noteText.trim() ? colors.black : colors.textMuted} />
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
                <Text style={styles.activityDate}>{formatActivityDate(entry.createdAt)}</Text>
                <Text style={styles.activityMessage}>{entry.message}</Text>
              </View>
              <Pressable onPress={() => handleDeleteActivityEntry(entry.id)} hitSlop={8}>
                <AppIcon name="close" size={16} color={colors.textMuted} />
              </Pressable>
            </View>
          ))
        )}
      </Card>

      <Card>
        <SectionHeader title="Datos físicos" />
        <InfoRow label="Altura" value={formatOptionalValue(athlete.height, ' cm')} />
        <InfoRow label="Peso" value={formatOptionalValue(athlete.weight, ' kg')} />
        <InfoRow label="Limitaciones" value={formatOptionalValue(athlete.injuries)} />
      </Card>

      <Card style={styles.programCard}>
        <SectionHeader
          title="Formulario de bienvenida"
          subtitle="Respuestas del cuestionario previo al entrenamiento online"
        />
        {intakeLoading ? (
          <ActivityIndicator color={colors.accent} style={styles.loader} />
        ) : intakeForm && intakeComplete ? (
          <IntakeAnswersTable form={intakeForm} />
        ) : (
          <Text style={styles.emptyProgram}>
            Este atleta todavía no ha completado el formulario de bienvenida.
          </Text>
        )}
      </Card>

      <Card style={styles.programCard}>
        <SectionHeader title="Programación" subtitle="Programación personalizada de este atleta" />
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
              onEditGroup={openPlanGroupEditor}
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
      </Card>

      {!plansLoading && nutritionPlans.length > 0 ? (
        <Card style={styles.programCard}>
          <SectionHeader title="Plan nutricional" />
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
        </Card>
      ) : null}

      <Card style={styles.programCard}>
        <SectionHeader title="Registro de entrenos" subtitle="Sensaciones, progreso y videos por sesión" />
        {logsLoading ? (
          <ActivityIndicator color={colors.accent} />
        ) : sessionLogs.length === 0 ? (
          <Text style={styles.emptyProgram}>
            Todavía no hay sesiones registradas desde el calendario.
          </Text>
        ) : (
          sessionLogs.map((log) => (
            <AthleteSessionLogCard
              key={log.id}
              log={log}
              onPress={() =>
                router.push({
                  pathname: '/trainer/athlete/[id]/log/[logId]',
                  params: { id: athlete.id, logId: log.id },
                })
              }
            />
          ))
        )}
      </Card>

      <AthleteFeedbackPanel athleteId={athlete.id} />

      <Button
        title="Abrir chat"
        onPress={() => router.push({ pathname: '/trainer/chat/[id]', params: { id: athlete.id } })}
        style={styles.chatBtn}
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
  chatBtn: { marginTop: spacing.lg },
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
    backgroundColor: colors.accent,
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
