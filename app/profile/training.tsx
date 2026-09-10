import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, levelColors, spacing, typography, withAlpha } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useTrainingProfile } from '@/hooks/useTrainingProfile';
import { parseIntegerInput } from '@/lib/bodyMetrics';
import { safeGoBack } from '@/lib/navigation';
import {
  TRAINING_DAY_OPTIONS,
  TRAINING_EXPERIENCE_OPTIONS,
  trainingExperienceLabels,
} from '@/lib/profilePreferences';
import type { FitnessLevel } from '@/lib/types';

export default function TrainingProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, isLoading, saving, save } = useTrainingProfile();

  const [experience, setExperience] = useState<FitnessLevel | undefined>();
  const [daysPerWeek, setDaysPerWeek] = useState('');
  const [preferredDays, setPreferredDays] = useState<string[]>([]);
  const [sessionDuration, setSessionDuration] = useState('');
  const [injuries, setInjuries] = useState('');
  const [notes, setNotes] = useState('');

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (isLoading || hydrated) return;

    setExperience(profile.trainingExperience);
    setDaysPerWeek(profile.trainingDaysPerWeek !== undefined ? String(profile.trainingDaysPerWeek) : '');
    setPreferredDays(profile.preferredTrainingDays);
    setSessionDuration(
      profile.sessionDurationMinutes !== undefined ? String(profile.sessionDurationMinutes) : '',
    );
    setInjuries(profile.injuriesOrLimitations ?? '');
    setNotes(profile.trainingNotes ?? '');
    setHydrated(true);
  }, [isLoading, hydrated, profile]);

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  const toggleDay = (day: string) => {
    setPreferredDays((current) =>
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day],
    );
  };

  const handleSave = async () => {
    const days = parseIntegerInput(daysPerWeek);
    if (daysPerWeek.trim() && (days === undefined || days < 0 || days > 7)) {
      setError('Indica entre 0 y 7 días de entrenamiento por semana');
      return;
    }

    const duration = parseIntegerInput(sessionDuration);
    if (sessionDuration.trim() && (duration === undefined || duration < 10 || duration > 240)) {
      setError('Indica una duración de sesión entre 10 y 240 minutos');
      return;
    }

    setError('');
    setSuccessMessage('');

    const result = await save({
      trainingExperience: experience,
      trainingDaysPerWeek: days,
      preferredTrainingDays: preferredDays,
      sessionDurationMinutes: duration,
      injuriesOrLimitations: injuries.trim() || undefined,
      trainingNotes: notes.trim() || undefined,
    });

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccessMessage(result.warning ?? 'Datos de entrenamiento guardados.');
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
      <Text style={styles.title}>Datos de entrenamiento</Text>
      <Text style={styles.subtitle}>
        Con esto tu preparador ajusta el volumen y los días de la programación.
      </Text>

      {successMessage ? (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      ) : null}

      <Card style={styles.section}>
        <SectionHeader title="Experiencia" />
        <View style={styles.optionsWrap}>
          {TRAINING_EXPERIENCE_OPTIONS.map((option) => {
            const selected = experience === option;
            return (
              <Pressable
                key={option}
                onPress={() => setExperience(option)}
                style={[
                  styles.optionChip,
                  selected && { borderColor: levelColors[option], backgroundColor: `${levelColors[option]}22` },
                ]}
              >
                <Text style={[styles.optionText, selected && { color: levelColors[option] }]}>
                  {trainingExperienceLabels[option]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card style={styles.section}>
        <SectionHeader title="Disponibilidad" />
        <Input
          label="Días de entrenamiento por semana"
          placeholder="Ej. 4"
          value={daysPerWeek}
          onChangeText={setDaysPerWeek}
          keyboardType="numeric"
        />

        <Text style={styles.fieldLabel}>Días preferidos</Text>
        <View style={styles.optionsWrap}>
          {TRAINING_DAY_OPTIONS.map((day) => {
            const selected = preferredDays.includes(day);
            return (
              <Pressable
                key={day}
                onPress={() => toggleDay(day)}
                style={[styles.optionChip, selected && styles.optionChipSelected]}
              >
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{day}</Text>
              </Pressable>
            );
          })}
        </View>

        <Input
          label="Duración de sesión (min)"
          placeholder="Ej. 60"
          value={sessionDuration}
          onChangeText={setSessionDuration}
          keyboardType="numeric"
        />
      </Card>

      <Card style={styles.section}>
        <SectionHeader title="Lesiones y notas" />
        <Input
          label="Lesiones o limitaciones"
          placeholder="Molestias, zonas a evitar, material que no puedes usar…"
          value={injuries}
          onChangeText={setInjuries}
          multiline
          numberOfLines={3}
        />
        <Input
          label="Notas para tu preparador"
          placeholder="Horarios, competiciones, preferencias de ejercicios…"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />
      </Card>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title="Guardar datos de entrenamiento" onPress={handleSave} loading={saving} />
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
  error: { ...typography.bodySmall, color: colors.danger, textAlign: 'center', marginBottom: spacing.sm },
  cancelBtn: { marginTop: spacing.sm },
});
