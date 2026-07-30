import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, spacing, typography } from '@/constants/theme';
import { useAthleteIntakeForm } from '@/hooks/useAthleteIntakeForm';
import { safeGoBack } from '@/lib/navigation';
import { INTAKE_GOAL_OPTIONS, type AthleteIntakeForm, type IntakeTrainingPlace } from '@/lib/types';

const TRAINING_PLACE_OPTIONS: Array<{ value: IntakeTrainingPlace; label: string }> = [
  { value: 'gimnasio', label: 'Gimnasio' },
  { value: 'casa', label: 'Casa' },
  { value: 'ambas', label: 'Ambas' },
];

function YesNoChips({
  value,
  onChange,
}: {
  value: boolean | undefined;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.optionsRow}>
      {[
        { value: true, label: 'Sí' },
        { value: false, label: 'No' },
      ].map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={String(option.value)}
            onPress={() => onChange(option.value)}
            style={[styles.optionChip, selected && styles.optionChipSelected]}
          >
            <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function AthleteIntakeFormScreen() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const { form, isLoading, saving, save } = useAthleteIntakeForm();

  const [goals, setGoals] = useState<string[]>([]);
  const [goalsOther, setGoalsOther] = useState('');
  const [experience, setExperience] = useState('');
  const [trainingPlace, setTrainingPlace] = useState<IntakeTrainingPlace | undefined>();
  const [equipment, setEquipment] = useState('');
  const [availability, setAvailability] = useState('');
  const [pushups, setPushups] = useState('');
  const [squats, setSquats] = useState('');
  const [pullups, setPullups] = useState('');
  const [hasInjuries, setHasInjuries] = useState<boolean | undefined>();
  const [injuriesDetail, setInjuriesDetail] = useState('');
  const [takesMedication, setTakesMedication] = useState<boolean | undefined>();
  const [hadSurgery, setHadSurgery] = useState<boolean | undefined>();
  const [hasMedicalCondition, setHasMedicalCondition] = useState<boolean | undefined>();

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (isLoading || hydrated) return;

    if (form) {
      setGoals(form.goals);
      setGoalsOther(form.goalsOther ?? '');
      setExperience(form.experience ?? '');
      setTrainingPlace(form.trainingPlace);
      setEquipment(form.equipment ?? '');
      setAvailability(form.availability ?? '');
      setPushups(form.pushupsReps !== undefined ? String(form.pushupsReps) : '');
      setSquats(form.squatsReps !== undefined ? String(form.squatsReps) : '');
      setPullups(form.pullupsReps !== undefined ? String(form.pullupsReps) : '');
      setHasInjuries(form.hasInjuries);
      setInjuriesDetail(form.injuriesDetail ?? '');
      setTakesMedication(form.takesMedication);
      setHadSurgery(form.hadSurgery);
      setHasMedicalCondition(form.hasMedicalCondition);
    }

    setHydrated(true);
  }, [isLoading, hydrated, form]);

  const toggleGoal = (goal: string) => {
    setGoals((current) =>
      current.includes(goal) ? current.filter((item) => item !== goal) : [...current, goal],
    );
  };

  const parseReps = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : undefined;
  };

  const validate = () => {
    if (goals.length === 0) return 'Selecciona al menos un objetivo de entrenamiento.';
    if (!experience.trim()) return 'Cuéntanos tu experiencia en gimnasios o en el deporte.';
    if (!trainingPlace) return 'Indica dónde entrenas: gimnasio, casa o ambas.';
    if (!equipment.trim()) return 'Indica de qué equipamiento deportivo dispones (o "ninguno").';
    if (!availability.trim()) return 'Indica tu disponibilidad para entrenar.';
    if (parseReps(pushups) === undefined) return 'Indica cuántas flexiones puedes hacer en una tirada.';
    if (parseReps(squats) === undefined) return 'Indica cuántas sentadillas puedes hacer en una tirada.';
    if (parseReps(pullups) === undefined) return 'Indica cuántas dominadas puedes hacer en una tirada (0 si no puedes).';
    if (hasInjuries === undefined) return 'Indica si tienes o has tenido alguna lesión.';
    if (takesMedication === undefined) return 'Indica si tomas algún medicamento.';
    if (hadSurgery === undefined) return 'Indica si has tenido alguna cirugía relevante.';
    if (hasMedicalCondition === undefined) return 'Indica si tienes alguna condición médica a considerar.';
    return null;
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setSuccessMessage('');
      return;
    }

    setError('');

    const payload: AthleteIntakeForm = {
      goals,
      goalsOther: goalsOther.trim() || undefined,
      experience: experience.trim(),
      trainingPlace,
      equipment: equipment.trim(),
      availability: availability.trim(),
      pushupsReps: parseReps(pushups),
      squatsReps: parseReps(squats),
      pullupsReps: parseReps(pullups),
      hasInjuries,
      injuriesDetail: injuriesDetail.trim() || undefined,
      takesMedication,
      hadSurgery,
      hasMedicalCondition,
    };

    const result = await save(payload);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (returnTo === 'trainer') {
      router.replace('/tabs/trainer');
      return;
    }

    setSuccessMessage('Formulario guardado correctamente.');
    setTimeout(() => safeGoBack(router, '/tabs/profile'), 800);
  };

  if (isLoading) {
    return (
      <ScreenWrapper scrollable={false}>
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Text style={styles.title}>Formulario de bienvenida</Text>
      <Text style={styles.subtitle}>
        Necesitamos esta información antes de empezar tu entrenamiento online. Es imprescindible
        completarlo para poder contactar con tu entrenador.
      </Text>

      {successMessage ? (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      ) : null}

      <Card style={styles.section}>
        <SectionHeader
          title="Objetivos de entrenamiento"
          subtitle="Puedes elegir más de uno"
        />
        <View style={styles.optionsWrap}>
          {INTAKE_GOAL_OPTIONS.map((goal) => {
            const selected = goals.includes(goal);
            return (
              <Pressable
                key={goal}
                onPress={() => toggleGoal(goal)}
                style={[styles.optionChip, selected && styles.optionChipSelected]}
              >
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{goal}</Text>
              </Pressable>
            );
          })}
        </View>
        <Input
          label="Otro (opcional)"
          placeholder="Especifica otro objetivo"
          value={goalsOther}
          onChangeText={setGoalsOther}
        />
      </Card>

      <Card style={styles.section}>
        <SectionHeader title="Experiencia y entrenamiento" />
        <Input
          label="¿Qué experiencia tienes en gimnasios o en el deporte?"
          placeholder="Cuéntanos tu recorrido: años entrenando, deportes practicados..."
          value={experience}
          onChangeText={setExperience}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.fieldLabel}>¿Entrenas en gimnasios, en casa, o en ambas?</Text>
        <View style={styles.optionsRow}>
          {TRAINING_PLACE_OPTIONS.map((option) => {
            const selected = trainingPlace === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setTrainingPlace(option.value)}
                style={[styles.optionChip, selected && styles.optionChipSelected]}
              >
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Input
          label="¿De qué equipamiento deportivo dispones?"
          placeholder="Mancuernas, bandas, barra, ninguno..."
          value={equipment}
          onChangeText={setEquipment}
          multiline
          numberOfLines={2}
        />

        <Input
          label="¿Qué disponibilidad tienes para entrenar?"
          placeholder="Días y horarios en los que puedes entrenar"
          value={availability}
          onChangeText={setAvailability}
          multiline
          numberOfLines={2}
        />

        <Text style={styles.fieldLabel}>
          ¿Cuántas repeticiones puedes hacer de cada ejercicio en una tirada?
        </Text>
        <Input
          label="Flexiones"
          placeholder="Ej. 15"
          value={pushups}
          onChangeText={setPushups}
          keyboardType="numeric"
        />
        <Input
          label="Sentadillas"
          placeholder="Ej. 20"
          value={squats}
          onChangeText={setSquats}
          keyboardType="numeric"
        />
        <Input
          label="Dominadas"
          placeholder="Ej. 0"
          value={pullups}
          onChangeText={setPullups}
          keyboardType="numeric"
        />
      </Card>

      <Card style={styles.section}>
        <SectionHeader title="Historial de salud y lesiones" />

        <Text style={styles.fieldLabel}>
          ¿Tienes alguna lesión actual o has tenido alguna en el pasado que deba conocer?
        </Text>
        <YesNoChips value={hasInjuries} onChange={setHasInjuries} />
        <Input
          label="Detalle (si aplica)"
          placeholder="Sé todo lo específico posible: dolor, molestias, zona afectada..."
          value={injuriesDetail}
          onChangeText={setInjuriesDetail}
          multiline
          numberOfLines={3}
        />

        <Text style={[styles.fieldLabel, styles.fieldLabelSpaced]}>
          ¿Estás tomando algún medicamento que podría afectar tu rendimiento en el entrenamiento?
        </Text>
        <YesNoChips value={takesMedication} onChange={setTakesMedication} />

        <Text style={[styles.fieldLabel, styles.fieldLabelSpaced]}>
          ¿Has tenido alguna cirugía relevante en los últimos años?
        </Text>
        <YesNoChips value={hadSurgery} onChange={setHadSurgery} />

        <Text style={[styles.fieldLabel, styles.fieldLabelSpaced]}>
          ¿Tienes alguna condición médica que deba ser considerada? (Ej: diabetes, hipertensión, problemas
          de columna, etc.)
        </Text>
        <YesNoChips value={hasMedicalCondition} onChange={setHasMedicalCondition} />
      </Card>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title="Guardar formulario" onPress={handleSave} loading={saving} />
      <Button
        title="Cancelar"
        onPress={() => safeGoBack(router, '/tabs/profile')}
        variant="ghost"
        style={styles.cancelBtn}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: spacing.xl },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.xs },
  subtitle: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.lg, lineHeight: 20 },
  successBanner: {
    backgroundColor: `${colors.success}22`,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.success,
  },
  successText: { ...typography.bodySmall, color: colors.success, lineHeight: 20 },
  section: { marginBottom: spacing.md },
  fieldLabel: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.sm, fontWeight: '500' },
  fieldLabelSpaced: { marginTop: spacing.md },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
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
    backgroundColor: `${colors.accent}22`,
  },
  optionText: { ...typography.bodySmall, color: colors.textSecondary },
  optionTextSelected: { color: colors.accent, fontWeight: '600' },
  error: { ...typography.bodySmall, color: colors.danger, textAlign: 'center', marginBottom: spacing.sm },
  cancelBtn: { marginTop: spacing.sm },
});
