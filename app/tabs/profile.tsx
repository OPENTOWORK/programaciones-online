import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { ProfileAppointmentsCard } from '@/components/appointments/ProfileAppointmentsCard';
import { IconBadge } from '@/components/ui/AppIcon';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PrivacyPolicyLink } from '@/components/legal/PrivacyPolicyLink';
import { Card } from '@/components/ui/Card';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { goalLabels, levelColors, colors, spacing, typography } from '@/constants/theme';
import type { AppIconName } from '@/constants/icons';
import { useAthleteIntakeForm } from '@/hooks/useAthleteIntakeForm';
import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { useMyAthletePlans } from '@/hooks/useAthletePlans';
import { usePrograms } from '@/hooks/usePrograms';
import { isTrainerRole } from '@/lib/athleteService';
import { groupPersonalizedPlans } from '@/lib/personalizedPlanGroups';
import { ATHLETE_PLAN_TYPE_LABELS } from '@/lib/trainerConstants';
import type { AthletePlan, AthletePlanType } from '@/lib/types';

const PLAN_ICONS: Record<AthletePlanType, AppIconName> = {
  personalized: 'personal',
  nutrition: 'measure',
};

function planCategoryRoute(plans: { id: string; category: string }[], planType: AthletePlanType) {
  const match = plans.find((plan) => plan.category === planType);
  if (match) return match.id;
  return planType === 'nutrition' ? 'plan-nutrition' : 'personalized';
}

/** Las sesiones sueltas no tienen duración ni frecuencia, así que la línea se queda vacía. */
function activeProgramMeta(program: { duration: string; sessionsPerWeek: number }) {
  return [
    program.duration && program.duration !== 'Por definir' ? program.duration : null,
    program.sessionsPerWeek > 0 ? `${program.sessionsPerWeek}x/semana` : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

function formatOptionalValue(value: string | number | undefined, suffix = '') {
  if (value === undefined || value === null || value === '') {
    return 'No indicado';
  }

  return `${value}${suffix}`;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, refreshUser, finishActiveProgram } = useAuth();
  const { plans: catalogPlans } = usePrograms();
  const {
    plans: assignedPlans,
    isLoading: assignedPlansLoading,
    refresh: refreshAssignedPlans,
  } = useMyAthletePlans();
  const isAthlete = !isTrainerRole(user?.role);
  const { isComplete: intakeComplete, isLoading: intakeLoading } = useAthleteIntakeForm();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState<string | null>(null);
  const [finishingProgram, setFinishingProgram] = useState(false);

  useFocusRefresh(
    () => {
      void refreshUser();
    },
    () => {
      void refreshAssignedPlans();
    },
  );

  if (!user) return null;

  const activePrograms =
    user.currentPrograms ?? (user.currentProgram ? [user.currentProgram] : []);
  const groupedPersonalizedPlans = groupPersonalizedPlans(
    assignedPlans.filter((plan) => plan.planType === 'personalized'),
  );
  const nutritionPlans = assignedPlans.filter((plan) => plan.planType === 'nutrition');
  const hasAssignedPlans = assignedPlans.length > 0;

  const confirmLogout = async () => {
    setLoggingOut(true);
    await signOut();
    setLoggingOut(false);
    setShowLogoutConfirm(false);
    router.replace('/auth/login');
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      setShowLogoutConfirm(true);
      return;
    }

    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: confirmLogout },
    ]);
  };

  const handleEdit = () => {
    router.push('/profile/edit');
  };

  const confirmFinishProgram = async (programId: string) => {
    setFinishingProgram(true);
    const { error } = await finishActiveProgram(programId);
    setFinishingProgram(false);
    setShowFinishConfirm(null);

    if (error) {
      if (Platform.OS === 'web') {
        window.alert(error);
        return;
      }

      Alert.alert('Error', error);
    }
  };

  const handleFinishProgram = (programId: string, programName: string) => {
    if (Platform.OS === 'web') {
      setShowFinishConfirm(programId);
      return;
    }

    Alert.alert(
      'Finalizar programación',
      `¿Seguro que quieres finalizar "${programName}"? Podrás empezar otra programación cuando quieras.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Finalizar', style: 'destructive', onPress: () => confirmFinishProgram(programId) },
      ],
    );
  };

  const finishingProgramName = activePrograms.find((program) => program.id === showFinishConfirm)?.name;

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.avatarInitials}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.badges}>
          {user.fitnessLevel ? (
            <Badge label={user.fitnessLevel} color={levelColors[user.fitnessLevel]} />
          ) : (
            <Badge label="Nivel sin definir" color={colors.textMuted} />
          )}
          {user.mainGoal ? (
            <Badge label={goalLabels[user.mainGoal]} color={colors.accentBlue} />
          ) : (
            <Badge label="Objetivo sin definir" color={colors.textMuted} />
          )}
        </View>
      </View>

      {isAthlete && !intakeLoading ? (
        <Card style={[styles.programCard, !intakeComplete && styles.intakeCardPending]}>
          <SectionHeader
            title="Formulario de bienvenida"
            subtitle={
              intakeComplete
                ? 'Completado'
                : 'Imprescindible para contactar con tu entrenador y empezar tu entrenamiento online'
            }
          />
          <Button
            title={intakeComplete ? 'Ver / editar respuestas' : 'Rellenar formulario'}
            variant={intakeComplete ? 'outline' : 'primary'}
            onPress={() => router.push('/profile/intake-form')}
          />
        </Card>
      ) : null}

      <ProfileAppointmentsCard />

      <Card style={styles.programCard}>
        <SectionHeader title="Datos físicos" />
        <InfoRow label="Altura" value={formatOptionalValue(user.height, ' cm')} />
        <InfoRow label="Peso" value={formatOptionalValue(user.weight, ' kg')} />
        <InfoRow label="Limitaciones" value={formatOptionalValue(user.injuries)} />
      </Card>

      {assignedPlansLoading ? (
        <Card style={styles.programCard}>
          <SectionHeader title="Planes asignados" subtitle="Preparados por tu entrenador" />
          <ActivityIndicator color={colors.accent} style={styles.inlineLoader} />
        </Card>
      ) : hasAssignedPlans ? (
        <Card style={styles.programCard}>
          <SectionHeader title="Planes asignados" subtitle="Preparados por tu entrenador" />
          {groupedPersonalizedPlans.map((group) => (
            <AssignedPlanRow
              key={group.id}
              icon="personal"
              title={group.title}
              meta={`${group.sessions.length} sesión${group.sessions.length === 1 ? '' : 'es'} · ${ATHLETE_PLAN_TYPE_LABELS.personalized}`}
              onPress={() => router.push(`/plan/${planCategoryRoute(catalogPlans, 'personalized')}`)}
            />
          ))}
          {nutritionPlans.map((plan) => (
            <AssignedPlanRow
              key={plan.id}
              icon="measure"
              title={plan.title}
              meta={ATHLETE_PLAN_TYPE_LABELS.nutrition}
              onPress={() => router.push(`/plan/${planCategoryRoute(catalogPlans, 'nutrition')}`)}
            />
          ))}
        </Card>
      ) : null}

      {activePrograms.length > 0 ? (
        <Card style={styles.programCard}>
          <SectionHeader
            title="Programación de catálogo"
            subtitle={`${activePrograms.length} de 3 activas`}
          />
          {activePrograms.map((program, index) => (
            <View key={program.id}>
              {index > 0 ? <View style={styles.programDivider} /> : null}
              {showFinishConfirm === program.id ? (
                <View style={styles.confirmBox}>
                  <Text style={styles.confirmTitle}>¿Finalizar "{finishingProgramName}"?</Text>
                  <Text style={styles.confirmText}>
                    Se marcará como completada y liberará un hueco para otra programación.
                  </Text>
                  <View style={styles.confirmActions}>
                    <Button
                      title="Cancelar"
                      onPress={() => setShowFinishConfirm(null)}
                      variant="outline"
                      disabled={finishingProgram}
                      style={styles.confirmBtn}
                    />
                    <Button
                      title="Finalizar"
                      onPress={() => confirmFinishProgram(program.id)}
                      loading={finishingProgram}
                      style={styles.confirmBtn}
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.programRow}>
                  <IconBadge name="programs" containerSize={32} size={16} />
                  <View style={styles.programInfo}>
                    <Text style={styles.programName}>{program.name}</Text>
                    {activeProgramMeta(program) ? (
                      <Text style={styles.programMeta}>{activeProgramMeta(program)}</Text>
                    ) : null}
                  </View>
                  <View style={styles.programActions}>
                    <Pressable
                      onPress={() => router.push(`/program/${program.id}`)}
                      style={styles.continueLink}
                    >
                      <Text style={styles.continueLinkText}>Continuar</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleFinishProgram(program.id, program.name)}
                      style={styles.finishRowLink}
                    >
                      <Text style={styles.finishRowLinkText}>Finalizar</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          ))}
        </Card>
      ) : (
        <Card style={styles.programCard}>
          <SectionHeader title="Programación de catálogo" />
          <Text style={styles.emptyProgram}>
            {hasAssignedPlans
              ? 'No tienes ninguna programación de catálogo activa. Tus planes personalizados aparecen arriba.'
              : 'No tienes ninguna programación activa asignada.'}
          </Text>
        </Card>
      )}

      <Button title="Editar perfil" onPress={handleEdit} variant="outline" style={styles.btn} />

      {showLogoutConfirm ? (
        <View style={styles.confirmBox}>
          <Text style={styles.confirmTitle}>¿Seguro que quieres salir?</Text>
          <Text style={styles.confirmText}>Tendrás que iniciar sesión de nuevo para acceder a tu cuenta.</Text>
          <View style={styles.confirmActions}>
            <Button
              title="Cancelar"
              onPress={() => setShowLogoutConfirm(false)}
              variant="outline"
              disabled={loggingOut}
              style={styles.confirmBtn}
            />
            <Button
              title="Salir"
              onPress={confirmLogout}
              loading={loggingOut}
              style={styles.confirmBtn}
            />
          </View>
        </View>
      ) : (
        <Button title="Cerrar sesión" onPress={handleLogout} variant="ghost" style={styles.btn} />
      )}

      <PrivacyPolicyLink variant="small" />
    </ScreenWrapper>
  );
}

function AssignedPlanRow({
  icon,
  title,
  meta,
  onPress,
}: {
  icon: AppIconName;
  title: string;
  meta: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.assignedPlanRow}>
      <IconBadge name={icon} containerSize={32} size={16} />
      <View style={styles.programInfo}>
        <Text style={styles.programName}>{title}</Text>
        <Text style={styles.programMeta}>{meta}</Text>
      </View>
      <Pressable onPress={onPress} style={styles.continueLink}>
        <Text style={styles.continueLinkText}>Ver plan</Text>
      </Pressable>
    </View>
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
  header: { alignItems: 'center', marginBottom: spacing.lg },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: colors.black },
  name: { ...typography.h2, color: colors.text },
  email: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 4 },
  badges: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  programCard: { marginTop: spacing.md },
  intakeCardPending: { borderColor: colors.accent },
  inlineLoader: { marginTop: spacing.sm },
  assignedPlanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  programDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  programRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  programInfo: { flex: 1 },
  programName: { ...typography.body, color: colors.text, fontWeight: '600' },
  programMeta: { ...typography.bodySmall, color: colors.textMuted, marginTop: 4 },
  programActions: { alignItems: 'flex-end' },
  continueLink: { paddingVertical: spacing.xs, paddingLeft: spacing.sm },
  continueLinkText: { ...typography.bodySmall, color: colors.accent, fontWeight: '600' },
  finishRowLink: { paddingTop: 2, paddingLeft: spacing.sm },
  finishRowLinkText: { ...typography.caption, color: colors.textMuted, fontWeight: '600' },
  emptyProgram: { ...typography.bodySmall, color: colors.textMuted },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { ...typography.body, color: colors.textSecondary },
  rowValue: { ...typography.body, color: colors.text, fontWeight: '500' },
  btn: { marginTop: spacing.md },
  confirmBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: `${colors.danger}11`,
  },
  confirmTitle: { ...typography.body, color: colors.text, fontWeight: '600' },
  confirmText: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs },
  confirmActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  confirmBtn: { flex: 1, marginTop: 0, minHeight: 44 },
});
