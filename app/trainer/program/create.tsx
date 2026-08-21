import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { isTrainerRole } from '@/lib/athleteService';
import { safeGoBack } from '@/lib/navigation';
import { createProgramCatalog } from '@/lib/programEditService';
import { isTrainerEditableCategory, PLAN_DISPLAY_LABELS } from '@/lib/programService';
import { formatStandardVenueDescription } from '@/lib/standardVenueCatalog';
import type { StandardVenueId } from '@/lib/standardVenues';
import type { ProgramCategory } from '@/lib/types';

function parseCategory(value?: string | string[]): ProgramCategory | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === 'standard' || raw === 'hype') return raw;
  return null;
}

function parseStandardVenue(value?: string | string[]): StandardVenueId | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === 'gym' || raw === 'calisthenics') return raw;
  return undefined;
}

export default function CreateProgramScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    planId?: string | string[];
    category?: string | string[];
    standardVenue?: string | string[];
  }>();
  const planId = Array.isArray(params.planId) ? params.planId[0] : params.planId;
  const category = parseCategory(params.category);
  const standardVenue = parseStandardVenue(params.standardVenue);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canCreate = isTrainerRole(user?.role) && category && isTrainerEditableCategory(category) && planId;

  const handleSubmit = async () => {
    if (!canCreate || !planId || !category) return;

    setSubmitting(true);
    setError(null);

    const result = await createProgramCatalog({
      planId,
      name,
      description: standardVenue
        ? formatStandardVenueDescription(description, standardVenue)
        : description,
      category,
    });

    setSubmitting(false);

    if (result.error || !result.program) {
      setError(result.error ?? 'No se pudo crear la programación');
      return;
    }

    router.replace({
      pathname: '/trainer/program/[id]/session/[workoutId]',
      params: { id: result.program.id, workoutId: 'new' },
    });
  };

  if (!canCreate) {
    return (
      <ScreenWrapper>
        <Text style={styles.error}>No tienes permiso para crear programaciones en este plan.</Text>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Text style={styles.title}>Nueva programación</Text>
      <SectionHeader
        title={PLAN_DISPLAY_LABELS[category]}
        subtitle="Crea la programación y añade la primera sesión con bloques de entrenamiento"
      />

      <Input label="Nombre" value={name} onChangeText={setName} placeholder="Ej. Fuerza fundamental" />
      <Input
        label="Descripción"
        value={description}
        onChangeText={setDescription}
        placeholder="Resumen visible para atletas"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        style={styles.textArea}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title="Crear y añadir sesión" onPress={() => void handleSubmit()} loading={submitting} />
      <Button title="Cancelar" variant="ghost" onPress={() => safeGoBack(router, '/tabs/programs')} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: colors.text, marginBottom: 4 },
  textArea: { minHeight: 110, paddingTop: 14 },
  error: { ...typography.bodySmall, color: colors.danger, marginBottom: spacing.md },
});
