import { useFocusEffect, useNavigation, useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, View } from 'react-native';

import { ProfileAppointmentsCard } from '@/components/appointments/ProfileAppointmentsCard';
import { BodyMeasurementReminderCard } from '@/components/profile/BodyMeasurementReminderCard';
import { ProfileChallengeCard } from '@/components/profile/ProfileChallengeCard';
import { ProfileNotificationsCard } from '@/components/profile/ProfileNotificationsCard';
import { ProfileFooterLinks } from '@/components/legal/ProfileFooterLinks';
import { SavedMetconsCard } from '@/components/program/SavedMetconsCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, goalLabels, levelColors, spacing, typography } from '@/constants/theme';
import { useAthleteIntakeForm } from '@/hooks/useAthleteIntakeForm';
import { useAthleteIntakeForms } from '@/hooks/useAthleteIntakeForms';
import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { useIntakeFormTemplates } from '@/hooks/useIntakeFormTemplates';
import { useNutritionProfile } from '@/hooks/useNutritionProfile';
import { usePhysicalProfile } from '@/hooks/usePhysicalProfile';
import { useTrainingProfile } from '@/hooks/useTrainingProfile';
import { isTrainerRole } from '@/lib/athleteService';
import {
    activityLevelLabels,
    formatBmi,
    formatDerived,
    formatKcal,
    formatMeasured,
    NOT_INDICATED,
    primaryGoalLabels,
} from '@/lib/bodyMetrics';
import { dietaryPreferenceLabels, trainingExperienceLabels } from '@/lib/profilePreferences';
import { shouldShowBodyMeasurementReminder } from '@/lib/bodyMeasurementReminder';
import type { IntakeFormTemplate } from '@/lib/intakeFormTypes';

function trainerFormButtonLabel(template: IntakeFormTemplate) {
  const badges: string[] = [];
  if (template.isDefault) badges.push('Por defecto');
  if (!template.isActive) badges.push('Inactivo');
  const suffix = badges.length > 0 ? ` · ${badges.join(' · ')}` : '';
  const fieldCount = template.schema.fields.length;
  return `${template.name}${suffix} · ${fieldCount} campo${fieldCount === 1 ? '' : 's'}`;
}

function formatList(values: string[]) {
  return values.length > 0 ? values.join(', ') : NOT_INDICATED;
}

function formatText(value?: string) {
  return value?.trim() ? value.trim() : NOT_INDICATED;
}

export default function ProfileScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { user, signOut, refreshUser } = useAuth();
  const { basics, measured, derived, refresh, latestMeasurement } = usePhysicalProfile();
  const { profile: nutrition, refresh: refreshNutrition } = useNutritionProfile();
  const { profile: training, refresh: refreshTraining } = useTrainingProfile();
  const isAthlete = !isTrainerRole(user?.role);
  const { isComplete: intakeComplete, isLoading: intakeLoading, usesCustomForms } = useAthleteIntakeForm();
  const { statuses: intakeStatuses, isLoading: intakeListLoading } = useAthleteIntakeForms();
  const { templates: trainerIntakeForms, isLoading: trainerIntakeFormsLoading } = useIntakeFormTemplates();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  /** Remonta las secciones para dejarlas siempre cerradas al volver al perfil. */
  const [sectionsKey, setSectionsKey] = useState(0);

  const collapseSections = useCallback(() => {
    setSectionsKey((current) => current + 1);
  }, []);

  useFocusEffect(
    useCallback(() => {
      collapseSections();
    }, [collapseSections]),
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', () => {
      collapseSections();
    });
    return unsubscribe;
  }, [collapseSections, navigation]);

  useFocusRefresh(() => {
    void refreshUser();
    void refresh();
    void refreshNutrition();
    void refreshTraining();
  });

  if (!user) return null;

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

  const showBodyMeasurementReminder =
    isAthlete && shouldShowBodyMeasurementReminder(user, latestMeasurement?.measuredAt);

  const intakeSubtitle =
    intakeLoading || intakeListLoading
      ? 'Comprobando…'
      : usesCustomForms && intakeStatuses.length > 0
        ? `${intakeStatuses.filter((status) => status.isComplete).length}/${intakeStatuses.length} completados`
        : intakeComplete
          ? 'Completado'
          : 'Pendiente · ayuda a tu entrenador a conocerte';

  const trainerFormsSubtitle =
    trainerIntakeFormsLoading
      ? 'Comprobando…'
      : trainerIntakeForms.length > 0
        ? `${trainerIntakeForms.length} formulario${trainerIntakeForms.length === 1 ? '' : 's'} creado${trainerIntakeForms.length === 1 ? '' : 's'}`
        : 'Crea cuestionarios personalizados para tus atletas';

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.avatarInitials}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        {isAthlete && (user.fitnessLevel || user.mainGoal) ? (
          <View style={styles.badges}>
            {user.fitnessLevel ? (
              <Badge label={user.fitnessLevel} color={levelColors[user.fitnessLevel]} />
            ) : null}
            {user.mainGoal ? <Badge label={goalLabels[user.mainGoal]} color={colors.accentBlue} /> : null}
          </View>
        ) : null}
      </View>

      {showBodyMeasurementReminder ? (
        <BodyMeasurementReminderCard
          lastMeasuredAt={latestMeasurement?.measuredAt}
          onPress={handleEdit}
        />
      ) : null}

      <View key={sectionsKey}>
        {isAthlete ? (
          <CollapsibleSection
            title="Formularios del entrenador"
            style={
              !intakeComplete && !intakeLoading && !intakeListLoading
                ? { ...styles.sectionCard, ...styles.intakeCardPending }
                : styles.sectionCard
            }
          >
            <Text style={styles.sectionLead}>{intakeSubtitle}</Text>
            {usesCustomForms && intakeStatuses.length > 0 ? (
              <View style={styles.intakeList}>
                {intakeStatuses.map((status) => (
                  <Button
                    key={status.template.id}
                    title={
                      status.isComplete
                        ? `${status.template.name} · Ver respuestas`
                        : `${status.template.name} · Completar`
                    }
                    variant={status.isComplete ? 'outline' : 'primary'}
                    onPress={() =>
                      router.push({
                        pathname: '/profile/intake-form',
                        params: { templateId: status.template.id },
                      })
                    }
                    style={styles.intakeListButton}
                  />
                ))}
              </View>
            ) : (
              <Button
                title={intakeComplete ? 'Ver o editar respuestas' : 'Completar formulario'}
                variant={intakeComplete ? 'outline' : 'primary'}
                onPress={() => router.push('/profile/intake-form')}
              />
            )}
          </CollapsibleSection>
        ) : null}

        {!isAthlete ? (
          <CollapsibleSection title="Formularios para atletas" style={styles.sectionCard}>
            <Text style={styles.sectionLead}>{trainerFormsSubtitle}</Text>
            {trainerIntakeFormsLoading ? (
              <ActivityIndicator color={colors.accent} style={styles.sectionLoader} />
            ) : trainerIntakeForms.length > 0 ? (
              <View style={styles.intakeList}>
                {trainerIntakeForms.map((template) => (
                  <Button
                    key={template.id}
                    title={trainerFormButtonLabel(template)}
                    variant="outline"
                    onPress={() =>
                      router.push(`/profile/intake-forms/${template.id}` as Href)
                    }
                    style={styles.intakeListButton}
                  />
                ))}
                <Button
                  title="Gestionar formularios"
                  variant="primary"
                  onPress={() => router.push('/profile/intake-forms')}
                  style={styles.sectionButton}
                />
              </View>
            ) : (
              <Button
                title="Crear formulario"
                variant="primary"
                onPress={() => router.push('/profile/intake-forms')}
                style={styles.sectionButton}
              />
            )}
          </CollapsibleSection>
        ) : null}

        <ProfileAppointmentsCard />

        {!isAthlete ? <ProfileNotificationsCard /> : null}

        {!isAthlete ? <ProfileChallengeCard /> : null}

        {isAthlete ? (
          <CollapsibleSection title="Entrenamientos favoritos" style={styles.sectionCard}>
            <Text style={styles.sectionLead}>Sesiones que marcaste con la estrella</Text>
            <SavedMetconsCard />
          </CollapsibleSection>
        ) : null}

        {isAthlete ? (
          <>
            <CollapsibleSection title="Datos físicos" style={styles.sectionCard}>
              <Text style={styles.sectionLead}>Medidas corporales y valores calculados</Text>
              <InfoRow label="Edad" value={formatDerived(derived.age, ' años', 0)} />
              <InfoRow label="Altura" value={formatMeasured(basics.heightCm, ' cm')} />
              <InfoRow label="Peso" value={formatMeasured(measured.weightKg, ' kg')} />
              <InfoRow label="FC en reposo" value={formatMeasured(measured.restingHeartRate, ' lpm')} />
              <InfoRow label="Peso objetivo" value={formatMeasured(basics.targetWeightKg, ' kg')} />
              <InfoRow
                label="Nivel de actividad"
                value={basics.activityLevel ? activityLevelLabels[basics.activityLevel] : NOT_INDICATED}
              />
              <InfoRow
                label="Objetivo principal"
                value={basics.primaryGoal ? primaryGoalLabels[basics.primaryGoal] : NOT_INDICATED}
              />

              <GroupTitle title="Composición corporal" hint="Báscula inteligente o medición" />
              <InfoRow label="Grasa corporal" value={formatMeasured(measured.bodyFatPercentage, ' %')} />
              <InfoRow label="Masa muscular" value={formatMeasured(measured.muscleMassKg, ' kg')} />
              <InfoRow label="Agua corporal" value={formatMeasured(measured.bodyWaterPercentage, ' %')} />
              <InfoRow label="Grasa visceral" value={formatMeasured(measured.visceralFat)} />
              <InfoRow label="Masa ósea" value={formatMeasured(measured.boneMassKg, ' kg')} />
              {measured.metabolicAge !== undefined ? (
                <InfoRow
                  label="Edad metabólica"
                  value={`${measured.metabolicAge} años`}
                  hint="Estimación del dispositivo"
                />
              ) : null}

              <GroupTitle title="Calculado por la app" hint="Se recalcula al guardar tus datos" />
              <InfoRow label="IMC" value={formatBmi(derived.bmi)} />
              <InfoRow label="Masa grasa" value={formatDerived(derived.fatMassKg, ' kg')} />
              <InfoRow
                label="Masa libre de grasa"
                value={formatDerived(derived.leanBodyMassKg, ' kg')}
                hint="Incluye músculo, hueso, órganos y agua"
              />
              <InfoRow label="Metabolismo basal" value={formatKcal(derived.bmrKcal)} />
              <InfoRow
                label="Gasto energético diario estimado"
                value={formatKcal(derived.estimatedDailyExpenditureKcal)}
              />
              <Button
                title="Editar datos físicos"
                variant="outline"
                onPress={handleEdit}
                style={styles.sectionButton}
              />
            </CollapsibleSection>

            <CollapsibleSection title="Nutrición" style={styles.sectionCard}>
              <Text style={styles.sectionLead}>Preferencias y alimentos a evitar</Text>
              <InfoRow
                label="Tipo de dieta"
                value={
                  nutrition.dietaryPreference
                    ? dietaryPreferenceLabels[nutrition.dietaryPreference]
                    : NOT_INDICATED
                }
              />
              <InfoRow label="Comidas al día" value={formatMeasured(nutrition.mealsPerDay)} />
              <InfoRow label="Alergias" value={formatList(nutrition.foodAllergies)} />
              <InfoRow label="Intolerancias" value={formatList(nutrition.foodIntolerances)} />
              <InfoRow label="Alimentos excluidos" value={formatList(nutrition.excludedFoods)} />
              <InfoRow label="Notas" value={formatText(nutrition.nutritionNotes)} />
              <Button
                title="Editar datos de nutrición"
                variant="outline"
                onPress={() => router.push('/profile/nutrition')}
                style={styles.sectionButton}
              />
            </CollapsibleSection>

            <CollapsibleSection title="Entrenamiento" style={styles.sectionCard}>
              <Text style={styles.sectionLead}>Disponibilidad y limitaciones</Text>
              <InfoRow
                label="Experiencia"
                value={
                  training.trainingExperience
                    ? trainingExperienceLabels[training.trainingExperience]
                    : NOT_INDICATED
                }
              />
              <InfoRow label="Días por semana" value={formatMeasured(training.trainingDaysPerWeek)} />
              <InfoRow label="Días preferidos" value={formatList(training.preferredTrainingDays)} />
              <InfoRow
                label="Duración de sesión"
                value={formatMeasured(training.sessionDurationMinutes, ' min')}
              />
              <InfoRow label="Lesiones o limitaciones" value={formatText(training.injuriesOrLimitations)} />
              <InfoRow label="Notas" value={formatText(training.trainingNotes)} />
              <Button
                title="Editar datos de entrenamiento"
                variant="outline"
                onPress={() => router.push('/profile/training')}
                style={styles.sectionButton}
              />
            </CollapsibleSection>
          </>
        ) : null}
      </View>

      {isAthlete ? (
        <Button title="Editar perfil" onPress={handleEdit} variant="outline" style={styles.btn} />
      ) : null}

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

      <ProfileFooterLinks />
    </ScreenWrapper>
  );
}

function GroupTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <View style={styles.groupTitle}>
      <Text style={styles.groupTitleText}>{title}</Text>
      {hint ? <Text style={styles.groupTitleHint}>{hint}</Text> : null}
    </View>
  );
}

function InfoRow({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLabelWrap}>
        <Text style={styles.rowLabel}>{label}</Text>
        {hint ? <Text style={styles.rowHint}>{hint}</Text> : null}
      </View>
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
  sectionCard: { marginTop: spacing.md },
  sectionLead: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  sectionLoader: { marginVertical: spacing.sm },
  sectionButton: { marginTop: spacing.md },
  intakeCardPending: { borderColor: colors.accent },
  intakeList: { gap: spacing.sm },
  intakeListButton: { marginTop: 0 },
  groupTitle: { marginTop: spacing.md, marginBottom: spacing.xs },
  groupTitleText: { ...typography.bodySmall, color: colors.text, fontWeight: '700' },
  groupTitleHint: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabelWrap: { flexShrink: 1 },
  rowLabel: { ...typography.body, color: colors.textSecondary },
  rowHint: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  rowValue: { ...typography.body, color: colors.text, fontWeight: '500', textAlign: 'right' },
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
