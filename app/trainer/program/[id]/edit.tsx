import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useProgram } from '@/hooks/usePrograms';
import { isTrainerRole } from '@/lib/athleteService';
import { updateProgramCatalog, updateWorkoutCatalog } from '@/lib/programEditService';
import { isTrainerEditableCategory } from '@/lib/programService';
import { safeGoBack } from '@/lib/navigation';
import type { Exercise, Workout } from '@/lib/types';

type WorkoutDraft = {
  name: string;
  estimatedDuration: string;
  warmup: string;
  main: string;
  core: string;
  cooldown: string;
  exercises: Exercise[];
};

function toWorkoutDraft(workout: Workout): WorkoutDraft {
  return {
    name: workout.name,
    estimatedDuration: workout.estimatedDuration,
    warmup: workout.warmup,
    main: workout.main,
    core: workout.core ?? '',
    cooldown: workout.cooldown,
    exercises: workout.exercises.map((exercise) => ({ ...exercise })),
  };
}

export default function EditProgramScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, isDemoMode } = useAuth();
  const { program, workouts, isLoading } = useProgram(id ?? '');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [workoutDrafts, setWorkoutDrafts] = useState<Record<string, WorkoutDraft>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canEdit = isTrainerRole(user?.role) && isTrainerEditableCategory(program?.category);

  useEffect(() => {
    if (!program) return;
    setName(program.name);
    setDescription(program.description);
  }, [program]);

  useEffect(() => {
    const drafts = Object.fromEntries(workouts.map((workout) => [workout.id, toWorkoutDraft(workout)]));
    setWorkoutDrafts(drafts);
  }, [workouts]);

  const orderedWorkouts = useMemo(
    () =>
      workouts
        .map((workout) => ({ workout, draft: workoutDrafts[workout.id] }))
        .filter((item): item is { workout: Workout; draft: WorkoutDraft } => Boolean(item.draft)),
    [workoutDrafts, workouts],
  );

  const updateExerciseField = (
    workoutId: string,
    exerciseId: string,
    field: keyof Exercise,
    value: string,
  ) => {
    setWorkoutDrafts((current) => {
      const draft = current[workoutId];
      if (!draft) return current;

      return {
        ...current,
        [workoutId]: {
          ...draft,
          exercises: draft.exercises.map((exercise) => {
            if (exercise.id !== exerciseId) return exercise;

            if (field === 'sets') {
              const sets = Number.parseInt(value, 10);
              return { ...exercise, sets: Number.isFinite(sets) ? sets : exercise.sets };
            }

            return { ...exercise, [field]: value };
          }),
        },
      };
    });
  };

  const updateWorkoutField = (workoutId: string, field: keyof WorkoutDraft, value: string) => {
    setWorkoutDrafts((current) => {
      const draft = current[workoutId];
      if (!draft) return current;
      return { ...current, [workoutId]: { ...draft, [field]: value } };
    });
  };

  const handleSave = async () => {
    if (!program || !canEdit) return;

    setSubmitting(true);
    setError(null);

    const programResult = await updateProgramCatalog(program.id, { name, description });
    if (programResult.error) {
      setSubmitting(false);
      setError(programResult.error);
      return;
    }

    for (const { workout, draft } of orderedWorkouts) {
      const workoutResult = await updateWorkoutCatalog(workout.id, {
        name: draft.name,
        estimatedDuration: draft.estimatedDuration,
        warmup: draft.warmup,
        main: draft.main,
        core: draft.core || undefined,
        cooldown: draft.cooldown,
        exercises: draft.exercises,
      });

      if (workoutResult.error) {
        setSubmitting(false);
        setError(workoutResult.error);
        return;
      }
    }

    setSubmitting(false);
    safeGoBack(router, '/tabs/programs');
  };

  if (isLoading) {
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
      <SectionHeader title={program.name} subtitle="Solo visible para entrenadores en Estándar e Hype" />

      <Input label="Nombre" value={name} onChangeText={setName} placeholder="Nombre de la programación" />
      {isDemoMode ? (
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
      ) : null}

      {orderedWorkouts.length > 0 ? (
        <>
          <SectionHeader title="Sesiones" subtitle="Edita el contenido de cada sesión publicada" />
          {orderedWorkouts.map(({ workout, draft }) => (
            <Card key={workout.id} style={styles.workoutCard}>
              <Text style={styles.workoutTitle}>{workout.workoutDate ?? workout.dayLabel}</Text>

              <Input
                label="Nombre de sesión"
                value={draft.name}
                onChangeText={(value) => updateWorkoutField(workout.id, 'name', value)}
              />
              <Input
                label="Duración estimada"
                value={draft.estimatedDuration}
                onChangeText={(value) => updateWorkoutField(workout.id, 'estimatedDuration', value)}
              />
              <Input
                label="Calentamiento"
                value={draft.warmup}
                onChangeText={(value) => updateWorkoutField(workout.id, 'warmup', value)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={styles.textAreaSmall}
              />
              <Input
                label="Parte principal"
                value={draft.main}
                onChangeText={(value) => updateWorkoutField(workout.id, 'main', value)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={styles.textAreaSmall}
              />
              <Input
                label="Core"
                value={draft.core}
                onChangeText={(value) => updateWorkoutField(workout.id, 'core', value)}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
                style={styles.textAreaSmall}
              />
              <Input
                label="Vuelta a la calma"
                value={draft.cooldown}
                onChangeText={(value) => updateWorkoutField(workout.id, 'cooldown', value)}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
                style={styles.textAreaSmall}
              />

              <Text style={styles.exerciseHeading}>Ejercicios</Text>
              {draft.exercises.map((exercise) => (
                <View key={exercise.id} style={styles.exerciseBlock}>
                  <Input
                    label="Ejercicio"
                    value={exercise.name}
                    onChangeText={(value) => updateExerciseField(workout.id, exercise.id, 'name', value)}
                  />
                  <View style={styles.exerciseRow}>
                    <View style={styles.exerciseField}>
                      <Input
                        label="Series"
                        value={String(exercise.sets)}
                        onChangeText={(value) => updateExerciseField(workout.id, exercise.id, 'sets', value)}
                        keyboardType="number-pad"
                      />
                    </View>
                    <View style={styles.exerciseField}>
                      <Input
                        label="Reps"
                        value={exercise.reps}
                        onChangeText={(value) => updateExerciseField(workout.id, exercise.id, 'reps', value)}
                      />
                    </View>
                    <View style={styles.exerciseField}>
                      <Input
                        label="Descanso"
                        value={exercise.rest}
                        onChangeText={(value) => updateExerciseField(workout.id, exercise.id, 'rest', value)}
                      />
                    </View>
                  </View>
                  <Input
                    label="Notas"
                    value={exercise.notes ?? ''}
                    onChangeText={(value) => updateExerciseField(workout.id, exercise.id, 'notes', value)}
                  />
                </View>
              ))}
            </Card>
          ))}
        </>
      ) : (
        <Card>
          <Text style={styles.emptyText}>
            Esta programación aún no tiene sesiones sincronizadas. Puedes editar el nombre y la descripción.
          </Text>
        </Card>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title="Guardar cambios" onPress={() => void handleSave()} loading={submitting} style={styles.saveBtn} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: spacing.xl },
  title: { ...typography.h1, color: colors.text, marginBottom: 4 },
  textArea: { minHeight: 110, paddingTop: 14 },
  textAreaSmall: { minHeight: 84, paddingTop: 14 },
  workoutCard: { marginBottom: spacing.md },
  workoutTitle: { ...typography.h3, color: colors.accent, marginBottom: spacing.sm },
  exerciseHeading: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: '700', marginBottom: spacing.sm },
  exerciseBlock: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
  },
  exerciseRow: { flexDirection: 'row', gap: spacing.sm },
  exerciseField: { flex: 1 },
  emptyText: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 22 },
  error: { ...typography.bodySmall, color: colors.danger, marginBottom: spacing.md },
  saveBtn: { marginTop: spacing.md },
});
