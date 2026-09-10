import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SessionCardActions } from '@/components/program/SessionCardActions';
import { colors, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useProgram } from '@/hooks/usePrograms';
import { safeGoBack } from '@/lib/navigation';
import { updateProgramCatalog } from '@/lib/programEditService';
import { canManageTrainerProgram } from '@/lib/programService';
import type { Workout } from '@/lib/types';

function formatSessionMeta(workout: Workout) {
  return `${workout.estimatedDuration} · ${workout.exercises.length} ejercicios`;
}

export default function EditProgramScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { program, workouts, isLoading, reloadWorkouts } = useProgram(id ?? '', { refetchOnFocus: false });
  const initializedProgramId = useRef<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const canEdit = canManageTrainerProgram(user?.role, program?.category, program);

  useEffect(() => {
    if (!program) return;
    if (initializedProgramId.current === program.id) return;
    initializedProgramId.current = program.id;
    setName(program.name);
    setDescription(program.description);
  }, [program]);

  const handleSave = async () => {
    if (!program || !canEdit) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('El nombre de la programación es obligatorio.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const programResult = await updateProgramCatalog(program.id, {
      name: trimmedName,
      description,
    });

    setSubmitting(false);

    if (programResult.error) {
      setError(programResult.error);
      return;
    }

    setSuccessMessage('Datos de la programación guardados.');

    if (Platform.OS !== 'web') {
      Alert.alert('Cambios guardados', 'La programación se ha actualizado correctamente.');
    }
  };

  const openCreateSession = () => {
    router.push({
      pathname: '/trainer/program/[id]/session/[workoutId]',
      params: { id: program?.id ?? '', workoutId: 'new' },
    });
  };

  if (isLoading || authLoading) {
    return (
      <ScreenWrapper scrollable={false}>
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      </ScreenWrapper>
    );
  }

  if (!program || !canEdit) {
    return (
      <ScreenWrapper>
        <Text style={styles.error}>No tienes permiso para editar esta programación.</Text>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Text style={styles.title}>Editar programación</Text>
      <SectionHeader title={program.name} subtitle="Nombre, descripción y gestión de sesiones" />

      <Input label="Nombre" value={name} onChangeText={setName} placeholder="Nombre de la programación" />
      <Input
        label="Descripción"
        value={description}
        onChangeText={setDescription}
        placeholder="Descripción visible para atletas"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        style={styles.textArea}
      />

      <SectionHeader
        title="Sesiones"
        subtitle="Elige qué sesión editar o crea una nueva"
      />

      {workouts.length > 0 ? (
        workouts.map((workout) => (
          <Card key={workout.id} style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <View style={styles.sessionCopy}>
                <Text style={styles.sessionName}>{workout.name}</Text>
                <Text style={styles.sessionMeta}>{formatSessionMeta(workout)}</Text>
              </View>
              <SessionCardActions
                programId={program.id}
                workoutId={workout.id}
                workoutName={workout.name}
                canManage
                onDeleted={() => void reloadWorkouts()}
              />
            </View>
          </Card>
        ))
      ) : (
        <Card>
          <Text style={styles.emptyText}>Todavía no hay sesiones en esta programación.</Text>
        </Card>
      )}

      <Button title="Crear sesión" variant="outline" onPress={openCreateSession} style={styles.createBtn} />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

      <Button title="Guardar cambios" onPress={() => void handleSave()} loading={submitting} style={styles.saveBtn} />
      <Button
        title="Volver a la programación"
        variant="ghost"
        onPress={() => safeGoBack(router, `/program/${program.id}`)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: spacing.xl },
  title: { ...typography.h1, color: colors.text, marginBottom: 4 },
  textArea: { minHeight: 110, paddingTop: 14 },
  sessionCard: { marginBottom: spacing.sm },
  sessionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  sessionCopy: { flex: 1, minWidth: 180 },
  sessionName: { ...typography.body, color: colors.text, fontWeight: '600' },
  sessionMeta: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  createBtn: { marginTop: spacing.md },
  emptyText: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 22 },
  error: { ...typography.bodySmall, color: colors.danger, marginBottom: spacing.md, marginTop: spacing.md },
  success: { ...typography.bodySmall, color: colors.success, marginBottom: spacing.md, marginTop: spacing.md },
  saveBtn: { marginTop: spacing.md },
});
