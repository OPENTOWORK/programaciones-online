import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useNutritionProfile } from '@/hooks/useNutritionProfile';
import { parseIntegerInput } from '@/lib/bodyMetrics';
import { safeGoBack } from '@/lib/navigation';
import {
  DIETARY_PREFERENCE_OPTIONS,
  dietaryPreferenceLabels,
  parseCommaList,
} from '@/lib/profilePreferences';
import type { DietaryPreference } from '@/lib/types';

export default function NutritionProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, isLoading, saving, save } = useNutritionProfile();

  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference | undefined>();
  const [mealsPerDay, setMealsPerDay] = useState('');
  const [allergies, setAllergies] = useState('');
  const [intolerances, setIntolerances] = useState('');
  const [excludedFoods, setExcludedFoods] = useState('');
  const [notes, setNotes] = useState('');

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (isLoading || hydrated) return;

    setDietaryPreference(profile.dietaryPreference);
    setMealsPerDay(profile.mealsPerDay !== undefined ? String(profile.mealsPerDay) : '');
    setAllergies(profile.foodAllergies.join(', '));
    setIntolerances(profile.foodIntolerances.join(', '));
    setExcludedFoods(profile.excludedFoods.join(', '));
    setNotes(profile.nutritionNotes ?? '');
    setHydrated(true);
  }, [isLoading, hydrated, profile]);

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  const handleSave = async () => {
    const meals = parseIntegerInput(mealsPerDay);
    if (mealsPerDay.trim() && (meals === undefined || meals < 1 || meals > 10)) {
      setError('Indica entre 1 y 10 comidas al día');
      return;
    }

    setError('');
    setSuccessMessage('');

    const result = await save({
      dietaryPreference,
      foodAllergies: parseCommaList(allergies),
      foodIntolerances: parseCommaList(intolerances),
      excludedFoods: parseCommaList(excludedFoods),
      mealsPerDay: meals,
      nutritionNotes: notes.trim() || undefined,
    });

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccessMessage(result.warning ?? 'Datos de nutrición guardados.');
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
      <Text style={styles.title}>Datos de nutrición</Text>
      <Text style={styles.subtitle}>
        Esta información es para tu nutricionista y no se mezcla con tus datos físicos.
      </Text>

      {successMessage ? (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      ) : null}

      <Card style={styles.section}>
        <SectionHeader title="Tipo de alimentación" />
        <View style={styles.optionsWrap}>
          {DIETARY_PREFERENCE_OPTIONS.map((option) => {
            const selected = dietaryPreference === option;
            return (
              <Pressable
                key={option}
                onPress={() => setDietaryPreference(option)}
                style={[styles.optionChip, selected && styles.optionChipSelected]}
              >
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                  {dietaryPreferenceLabels[option]}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Input
          label="Comidas al día"
          placeholder="Ej. 4"
          value={mealsPerDay}
          onChangeText={setMealsPerDay}
          keyboardType="numeric"
        />
      </Card>

      <Card style={styles.section}>
        <SectionHeader title="Alergias e intolerancias" subtitle="Separa cada elemento con una coma" />
        <Input
          label="Alergias alimentarias"
          placeholder="Frutos secos, marisco…"
          value={allergies}
          onChangeText={setAllergies}
          multiline
        />
        <Input
          label="Intolerancias"
          placeholder="Lactosa, gluten…"
          value={intolerances}
          onChangeText={setIntolerances}
          multiline
        />
        <Input
          label="Alimentos que quieres evitar"
          placeholder="Casquería, picante…"
          value={excludedFoods}
          onChangeText={setExcludedFoods}
          multiline
        />
      </Card>

      <Card style={styles.section}>
        <SectionHeader title="Notas para el nutricionista" />
        <Input
          label="Notas"
          placeholder="Horarios, digestiones, suplementos, contexto…"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />
      </Card>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title="Guardar datos de nutrición" onPress={handleSave} loading={saving} />
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
