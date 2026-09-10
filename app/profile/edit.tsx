import { Redirect, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { goalLabels, levelColors, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { usePhysicalProfile } from '@/hooks/usePhysicalProfile';
import {
  ACTIVITY_LEVEL_OPTIONS,
  BIOLOGICAL_SEX_OPTIONS,
  PRIMARY_GOAL_OPTIONS,
  activityLevelHints,
  activityLevelLabels,
  biologicalSexLabels,
  deriveBodyMetrics,
  formatBirthDateInput,
  formatBmi,
  formatDerived,
  formatKcal,
  parseBirthDateInput,
  parseIntegerInput,
  parseMetricInput,
  primaryGoalLabels,
  type ActivityLevel,
  type BiologicalSex,
  type MeasuredBodyMetrics,
  type PrimaryGoal,
} from '@/lib/bodyMetrics';
import type { FitnessLevel, ProgramGoal } from '@/lib/types';
import { safeGoBack } from '@/lib/navigation';

const fitnessLevels: FitnessLevel[] = ['principiante', 'intermedio', 'avanzado'];
const programGoals: ProgramGoal[] = ['fuerza', 'hipertrofia', 'pérdida de grasa', 'rendimiento', 'movilidad'];

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile, refreshUser } = useAuth();
  const { basics, measured, isLoading, saving, save } = usePhysicalProfile();

  const [name, setName] = useState(user?.name ?? '');
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel | undefined>(user?.fitnessLevel);
  const [mainGoal, setMainGoal] = useState<ProgramGoal | undefined>(user?.mainGoal);

  const [birthDate, setBirthDate] = useState('');
  const [biologicalSex, setBiologicalSex] = useState<BiologicalSex | undefined>();
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | undefined>();
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoal | undefined>();
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [restingHr, setRestingHr] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [muscleMass, setMuscleMass] = useState('');
  const [bodyWater, setBodyWater] = useState('');
  const [visceralFat, setVisceralFat] = useState('');
  const [boneMass, setBoneMass] = useState('');

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (isLoading || hydrated) return;

    setBirthDate(formatBirthDateInput(basics.birthDate));
    setBiologicalSex(basics.biologicalSex);
    setActivityLevel(basics.activityLevel);
    setPrimaryGoal(basics.primaryGoal);
    setHeight(basics.heightCm !== undefined ? String(basics.heightCm) : '');
    setTargetWeight(basics.targetWeightKg !== undefined ? String(basics.targetWeightKg) : '');
    setWeight(measured.weightKg !== undefined ? String(measured.weightKg) : '');
    setRestingHr(measured.restingHeartRate !== undefined ? String(measured.restingHeartRate) : '');
    setBodyFat(measured.bodyFatPercentage !== undefined ? String(measured.bodyFatPercentage) : '');
    setMuscleMass(measured.muscleMassKg !== undefined ? String(measured.muscleMassKg) : '');
    setBodyWater(measured.bodyWaterPercentage !== undefined ? String(measured.bodyWaterPercentage) : '');
    setVisceralFat(measured.visceralFat !== undefined ? String(measured.visceralFat) : '');
    setBoneMass(measured.boneMassKg !== undefined ? String(measured.boneMassKg) : '');
    setHydrated(true);
  }, [isLoading, hydrated, basics, measured]);

  const draftMeasured: MeasuredBodyMetrics = useMemo(
    () => ({
      weightKg: parseMetricInput(weight),
      bodyFatPercentage: parseMetricInput(bodyFat),
      muscleMassKg: parseMetricInput(muscleMass),
      bodyWaterPercentage: parseMetricInput(bodyWater),
      visceralFat: parseMetricInput(visceralFat),
      boneMassKg: parseMetricInput(boneMass),
      restingHeartRate: parseIntegerInput(restingHr),
    }),
    [weight, bodyFat, muscleMass, bodyWater, visceralFat, boneMass, restingHr],
  );

  /** Vista previa: los valores derivados se recalculan mientras se escribe. */
  const preview = useMemo(
    () =>
      deriveBodyMetrics(
        {
          birthDate: parseBirthDateInput(birthDate).iso,
          biologicalSex,
          heightCm: parseMetricInput(height),
          activityLevel,
          primaryGoal,
        },
        draftMeasured,
      ),
    [birthDate, biologicalSex, height, activityLevel, primaryGoal, draftMeasured],
  );

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  const validate = () => {
    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return null;
    }

    const birthDateResult = parseBirthDateInput(birthDate);
    if (birthDateResult.error) {
      setError(birthDateResult.error);
      return null;
    }

    const ranges: Array<[string, string, number, number, string]> = [
      [height, 'altura', 100, 250, 'cm'],
      [weight, 'peso', 30, 300, 'kg'],
      [targetWeight, 'peso objetivo', 30, 300, 'kg'],
      [restingHr, 'frecuencia cardiaca en reposo', 30, 140, 'lpm'],
      [bodyFat, 'grasa corporal', 3, 70, '%'],
      [muscleMass, 'masa muscular', 10, 120, 'kg'],
      [bodyWater, 'agua corporal', 20, 80, '%'],
      [visceralFat, 'grasa visceral', 1, 30, ''],
      [boneMass, 'masa ósea', 0.5, 8, 'kg'],
    ];

    for (const [value, label, min, max, unit] of ranges) {
      if (!value.trim()) continue;
      const parsed = parseMetricInput(value);
      if (parsed === undefined || parsed < min || parsed > max) {
        setError(`Introduce una ${label} válida entre ${min} y ${max} ${unit}`.trim());
        return null;
      }
    }

    setError('');
    return { birthDate: birthDateResult.iso };
  };

  const handleSave = async () => {
    const validated = validate();
    if (!validated) return;

    setSuccessMessage('');
    setSubmitting(true);

    const { error: profileError } = await updateProfile({
      name: name.trim(),
      fitnessLevel,
      mainGoal,
      height: parseMetricInput(height),
      weight: parseMetricInput(weight),
    });

    if (profileError) {
      setSubmitting(false);
      setError(profileError);
      return;
    }

    const { error: physicalError, warning } = await save({
      basics: {
        birthDate: validated.birthDate,
        biologicalSex,
        activityLevel,
        primaryGoal,
        targetWeightKg: parseMetricInput(targetWeight),
      },
      measured: draftMeasured,
    });

    setSubmitting(false);

    if (physicalError) {
      setError(physicalError);
      return;
    }

    await refreshUser(true);

    setSuccessMessage(
      warning ?? 'Perfil actualizado correctamente.',
    );
    setTimeout(() => safeGoBack(router, '/tabs/profile'), 800);
  };

  return (
    <ScreenWrapper>
      <Text style={styles.title}>Editar perfil</Text>
      <Text style={styles.subtitle}>Actualiza tus datos personales y tus mediciones corporales.</Text>

      {successMessage ? (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      ) : null}

      <Card style={styles.section}>
        <SectionHeader title="Datos personales" />
        <Input label="Nombre" placeholder="Tu nombre" value={name} onChangeText={setName} />
        <Input label="Email" value={user.email} editable={false} style={styles.disabledInput} />
        <Text style={styles.fieldHint}>El email no se puede cambiar desde aquí.</Text>

        <Input
          label="Fecha de nacimiento"
          placeholder="dd/mm/aaaa"
          value={birthDate}
          onChangeText={setBirthDate}
        />
        <Text style={styles.fieldHint}>
          {preview.age !== undefined
            ? `Edad calculada: ${preview.age} años`
            : 'La edad se calcula automáticamente y se usa para el metabolismo basal.'}
        </Text>

        <Text style={styles.fieldLabel}>Sexo biológico</Text>
        <View style={styles.optionsWrap}>
          {BIOLOGICAL_SEX_OPTIONS.map((option) => {
            const selected = biologicalSex === option;
            return (
              <Pressable
                key={option}
                onPress={() => setBiologicalSex(option)}
                style={[styles.optionChip, selected && styles.optionChipSelected]}
              >
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                  {biologicalSexLabels[option]}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.fieldHint}>
          La fórmula de metabolismo basal necesita hombre o mujer para dar un resultado.
        </Text>

        <Text style={styles.fieldLabel}>Nivel</Text>
        <View style={styles.optionsWrap}>
          {fitnessLevels.map((level) => {
            const selected = fitnessLevel === level;
            return (
              <Pressable
                key={level}
                onPress={() => setFitnessLevel(level)}
                style={[
                  styles.optionChip,
                  selected && { borderColor: levelColors[level], backgroundColor: `${levelColors[level]}22` },
                ]}
              >
                <Text style={[styles.optionText, selected && { color: levelColors[level] }]}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.fieldLabel}>Enfoque de entrenamiento</Text>
        <View style={styles.optionsWrap}>
          {programGoals.map((goal) => {
            const selected = mainGoal === goal;
            return (
              <Pressable
                key={goal}
                onPress={() => setMainGoal(goal)}
                style={[styles.optionChip, selected && styles.optionChipSelected]}
              >
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{goalLabels[goal]}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.fieldLabel}>Objetivo principal</Text>
        <View style={styles.optionsWrap}>
          {PRIMARY_GOAL_OPTIONS.map((goal) => {
            const selected = primaryGoal === goal;
            return (
              <Pressable
                key={goal}
                onPress={() => setPrimaryGoal(goal)}
                style={[styles.optionChip, selected && styles.optionChipSelected]}
              >
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                  {primaryGoalLabels[goal]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.fieldLabel}>Nivel de actividad</Text>
        <View style={styles.optionsWrap}>
          {ACTIVITY_LEVEL_OPTIONS.map((option) => {
            const selected = activityLevel === option;
            return (
              <Pressable
                key={option}
                onPress={() => setActivityLevel(option)}
                style={[styles.optionChip, selected && styles.optionChipSelected]}
              >
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                  {activityLevelLabels[option]}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.fieldHint}>
          {activityLevel
            ? activityLevelHints[activityLevel]
            : 'Se usa para estimar tu gasto energético diario.'}
        </Text>
      </Card>

      <Card style={styles.section}>
        <SectionHeader title="Medidas" subtitle="Tus datos y tus mediciones" />
        <Input
          label="Altura (cm)"
          placeholder="Ej. 175"
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
        />
        <Input
          label="Peso (kg)"
          placeholder="Ej. 75"
          value={weight}
          onChangeText={setWeight}
          keyboardType="decimal-pad"
        />
        <Input
          label="Peso objetivo (kg)"
          placeholder="Opcional"
          value={targetWeight}
          onChangeText={setTargetWeight}
          keyboardType="decimal-pad"
        />
        <Input
          label="FC en reposo (lpm)"
          placeholder="Opcional"
          value={restingHr}
          onChangeText={setRestingHr}
          keyboardType="numeric"
        />
      </Card>

      <Card style={styles.section}>
        <SectionHeader
          title="Composición corporal"
          subtitle="Opcional: rellénalo solo si tienes una medición o báscula que lo mida"
        />
        <Input
          label="Grasa corporal (%)"
          placeholder="Ej. 18"
          value={bodyFat}
          onChangeText={setBodyFat}
          keyboardType="decimal-pad"
        />
        <Input
          label="Masa muscular (kg)"
          placeholder="Ej. 36"
          value={muscleMass}
          onChangeText={setMuscleMass}
          keyboardType="decimal-pad"
        />
        <Input
          label="Agua corporal (%)"
          placeholder="Ej. 55"
          value={bodyWater}
          onChangeText={setBodyWater}
          keyboardType="decimal-pad"
        />
        <Input
          label="Grasa visceral"
          placeholder="Ej. 8"
          value={visceralFat}
          onChangeText={setVisceralFat}
          keyboardType="decimal-pad"
        />
        <Input
          label="Masa ósea (kg)"
          placeholder="Ej. 3.2"
          value={boneMass}
          onChangeText={setBoneMass}
          keyboardType="decimal-pad"
        />
      </Card>

      <Card style={styles.section}>
        <SectionHeader title="Calculado por la app" subtitle="Se actualiza con lo que escribes" />
        <PreviewRow label="IMC" value={formatBmi(preview.bmi)} />
        <PreviewRow label="Masa grasa" value={formatDerived(preview.fatMassKg, ' kg')} />
        <PreviewRow label="Masa libre de grasa" value={formatDerived(preview.leanBodyMassKg, ' kg')} />
        <PreviewRow label="Metabolismo basal" value={formatKcal(preview.bmrKcal)} />
        <PreviewRow
          label="Gasto energético diario estimado"
          value={formatKcal(preview.estimatedDailyExpenditureKcal)}
        />
      </Card>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title="Guardar cambios" onPress={handleSave} loading={submitting || saving} />
      <Button
        title="Cancelar"
        onPress={() => safeGoBack(router, '/tabs/profile')}
        variant="ghost"
        style={styles.cancelBtn}
      />
    </ScreenWrapper>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.previewRow}>
      <Text style={styles.previewLabel}>{label}</Text>
      <Text style={styles.previewValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.xs },
  subtitle: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.lg },
  section: { marginBottom: spacing.md },
  successBanner: {
    backgroundColor: `${colors.success}22`,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.success,
  },
  successText: { ...typography.bodySmall, color: colors.success, lineHeight: 20 },
  disabledInput: { opacity: 0.7 },
  fieldHint: { ...typography.caption, color: colors.textMuted, marginTop: -8, marginBottom: spacing.md },
  fieldLabel: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.sm, fontWeight: '500' },
  optionsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  optionChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  optionChipSelected: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '22'),
  },
  optionText: { ...typography.bodySmall, color: colors.textSecondary },
  optionTextSelected: { color: colors.accent, fontWeight: '600' },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  previewLabel: { ...typography.bodySmall, color: colors.textSecondary, flexShrink: 1 },
  previewValue: { ...typography.body, color: colors.text, fontWeight: '600', textAlign: 'right' },
  error: { ...typography.bodySmall, color: colors.danger, textAlign: 'center', marginBottom: spacing.sm },
  cancelBtn: { marginTop: spacing.sm },
});
