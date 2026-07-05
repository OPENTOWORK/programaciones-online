import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { goalLabels, levelColors, colors, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import type { FitnessLevel, ProgramGoal } from '@/lib/types';
import { safeGoBack } from '@/lib/navigation';

const fitnessLevels: FitnessLevel[] = ['principiante', 'intermedio', 'avanzado'];
const programGoals: ProgramGoal[] = ['fuerza', 'hipertrofia', 'pérdida de grasa', 'rendimiento', 'movilidad'];

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel | undefined>(user?.fitnessLevel);
  const [mainGoal, setMainGoal] = useState<ProgramGoal | undefined>(user?.mainGoal);
  const [height, setHeight] = useState(user?.height !== undefined ? String(user.height) : '');
  const [weight, setWeight] = useState(user?.weight !== undefined ? String(user.weight) : '');
  const [injuries, setInjuries] = useState(user?.injuries ?? '');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  const validate = () => {
    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return false;
    }

    if (height.trim()) {
      const parsedHeight = Number(height);
      if (!Number.isFinite(parsedHeight) || parsedHeight < 100 || parsedHeight > 250) {
        setError('Introduce una altura válida entre 100 y 250 cm');
        return false;
      }
    }

    if (weight.trim()) {
      const parsedWeight = Number(weight);
      if (!Number.isFinite(parsedWeight) || parsedWeight < 30 || parsedWeight > 300) {
        setError('Introduce un peso válido entre 30 y 300 kg');
        return false;
      }
    }

    setError('');
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    setSuccessMessage('');

    const { error: saveError } = await updateProfile({
      name: name.trim(),
      fitnessLevel,
      mainGoal,
      height: height.trim() ? Number(height) : undefined,
      weight: weight.trim() ? Number(weight) : undefined,
      injuries: injuries.trim() || undefined,
    });

    setLoading(false);

    if (saveError) {
      setError(saveError);
      return;
    }

    setSuccessMessage('Perfil actualizado correctamente.');
    setTimeout(() => safeGoBack(router, '/tabs/profile'), 800);
  };

  return (
    <ScreenWrapper>
      <Text style={styles.title}>Editar perfil</Text>
      <Text style={styles.subtitle}>Actualiza tus datos personales y objetivos de entrenamiento.</Text>

      {successMessage ? (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      ) : null}

      <Input label="Nombre" placeholder="Tu nombre" value={name} onChangeText={setName} />
      <Input
        label="Email"
        value={user.email}
        editable={false}
        style={styles.disabledInput}
      />
      <Text style={styles.fieldHint}>El email no se puede cambiar desde aquí.</Text>

      <Text style={styles.fieldLabel}>Nivel</Text>
      <View style={styles.optionsRow}>
        {fitnessLevels.map((level) => {
          const selected = fitnessLevel === level;
          return (
            <Pressable
              key={level}
              onPress={() => setFitnessLevel(level)}
              style={[styles.optionChip, selected && { borderColor: levelColors[level], backgroundColor: `${levelColors[level]}22` }]}
            >
              <Text style={[styles.optionText, selected && { color: levelColors[level] }]}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {!fitnessLevel ? <Text style={styles.fieldHint}>Selecciona tu nivel actual.</Text> : null}

      <Text style={styles.fieldLabel}>Objetivo principal</Text>
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
      {!mainGoal ? <Text style={styles.fieldHint}>Selecciona tu objetivo principal.</Text> : null}

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
        keyboardType="numeric"
      />
      <Input
        label="Limitaciones (opcional)"
        placeholder="Lesiones, molestias, etc."
        value={injuries}
        onChangeText={setInjuries}
        multiline
        error={error}
      />

      <Button title="Guardar cambios" onPress={handleSave} loading={loading} />
      <Button title="Cancelar" onPress={() => safeGoBack(router, '/tabs/profile')} variant="ghost" style={styles.cancelBtn} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.xs },
  subtitle: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.lg },
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
  cancelBtn: { marginTop: spacing.sm },
});
