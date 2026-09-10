import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { EXERCISE_METRIC_LABELS, guessMetricTypeFromName } from '@/lib/exercisePrescription';
import { createEmptyExercise } from '@/lib/trainerSessionDraft';
import type { Exercise, ExerciseMetricType } from '@/lib/types';

interface ExerciseGridEditorProps {
  exercises: Exercise[];
  onChange: (exercises: Exercise[]) => void;
}

const METRIC_TYPES: ExerciseMetricType[] = ['reps', 'rir', 'cal', 'lbs'];

function CompactField({
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  width,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad';
  width?: number;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      keyboardType={keyboardType}
      style={[styles.compactInput, width ? { width } : styles.compactInputFlex]}
    />
  );
}

function ExerciseCard({
  exercise,
  onUpdate,
  onRemove,
  canRemove,
}: {
  exercise: Exercise;
  onUpdate: (patch: Partial<Exercise>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const metricType = exercise.metricType ?? 'reps';
  const showReps = metricType !== 'cal';

  const handleNameChange = (name: string) => {
    const patch: Partial<Exercise> = { name };
    if (!exercise.name.trim() && name.trim()) {
      patch.metricType = guessMetricTypeFromName(name);
    }
    onUpdate(patch);
  };

  return (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Ionicons name="options-outline" size={16} color={colors.textMuted} />
          <TextInput
            value={exercise.name}
            onChangeText={handleNameChange}
            placeholder="Nombre del ejercicio"
            placeholderTextColor={colors.textMuted}
            style={styles.nameInput}
          />
        </View>
        {canRemove ? (
          <Pressable onPress={onRemove} hitSlop={8} style={styles.removeBtn} accessibilityLabel="Quitar ejercicio">
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.metricChips}>
        {METRIC_TYPES.map((type) => {
          const active = metricType === type;
          return (
            <Pressable
              key={type}
              onPress={() => {
                const patch: Partial<Exercise> = { metricType: type };
                if (type === 'cal') patch.reps = '—';
                onUpdate(patch);
              }}
              style={[styles.metricChip, active && styles.metricChipActive]}
            >
              <Text style={[styles.metricChipText, active && styles.metricChipTextActive]}>
                {EXERCISE_METRIC_LABELS[type]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.prescriptionRow}>
        <View style={styles.fieldGroup}>
          <CompactField
            value={String(exercise.sets)}
            onChangeText={(text) => {
              const sets = Number.parseInt(text, 10);
              onUpdate({ sets: Number.isFinite(sets) ? sets : exercise.sets });
            }}
            keyboardType="number-pad"
            width={52}
          />
          <Text style={styles.fieldLabel}>Series</Text>
        </View>

        {showReps ? (
          <View style={styles.fieldGroup}>
            <CompactField
              value={exercise.reps}
              onChangeText={(reps) => onUpdate({ reps })}
              width={52}
            />
            <Text style={styles.fieldLabel}>reps</Text>
          </View>
        ) : null}

        {metricType !== 'reps' ? (
          <>
            <View style={styles.fieldGroup}>
              <Text style={styles.genderSymbol}>♂</Text>
              <CompactField
                value={exercise.maleTarget ?? ''}
                onChangeText={(maleTarget) => onUpdate({ maleTarget })}
                keyboardType="number-pad"
                width={52}
              />
              <Text style={[styles.fieldLabel, styles.metricLabel]}>{EXERCISE_METRIC_LABELS[metricType]}</Text>
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.genderSymbol}>♀</Text>
              <CompactField
                value={exercise.femaleTarget ?? ''}
                onChangeText={(femaleTarget) => onUpdate({ femaleTarget })}
                keyboardType="number-pad"
                width={52}
              />
              <Text style={[styles.fieldLabel, styles.metricLabel]}>{EXERCISE_METRIC_LABELS[metricType]}</Text>
            </View>
          </>
        ) : null}
      </View>

      <View style={styles.restRow}>
        <Text style={styles.restLabel}>Descanso</Text>
        <CompactField
          value={exercise.rest}
          onChangeText={(rest) => onUpdate({ rest })}
          placeholder="60s"
        />
      </View>
    </Card>
  );
}

export function ExerciseGridEditor({ exercises, onChange }: ExerciseGridEditorProps) {
  const { width } = useWindowDimensions();
  const columns = width >= 640 ? 2 : 1;
  const cardWidth = columns === 2 ? '48.5%' : '100%';

  const updateExercise = (exerciseId: string, patch: Partial<Exercise>) => {
    onChange(exercises.map((exercise) => (exercise.id === exerciseId ? { ...exercise, ...patch } : exercise)));
  };

  const removeExercise = (exerciseId: string) => {
    onChange(exercises.filter((exercise) => exercise.id !== exerciseId));
  };

  const addExercise = () => {
    onChange([...exercises, createEmptyExercise()]);
  };

  const showEmptyState = exercises.length === 0;

  return (
    <Card style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionAccent} />
        <View style={styles.sectionHeaderText}>
          <Text style={styles.heading}>Ejercicios</Text>
          <Text style={styles.hint}>
            Ejercicios con series y reps que verá el atleta en la lista de la sesión.
          </Text>
        </View>
      </View>

      {showEmptyState ? (
        <View style={styles.emptySection}>
          <Ionicons name="barbell-outline" size={24} color={colors.textMuted} />
          <Text style={styles.emptyText}>Sin ejercicios todavía.</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {exercises.map((exercise) => (
            <View key={exercise.id} style={{ width: cardWidth }}>
              <ExerciseCard
                exercise={exercise}
                onUpdate={(patch) => updateExercise(exercise.id, patch)}
                onRemove={() => removeExercise(exercise.id)}
                canRemove
              />
            </View>
          ))}
        </View>
      )}

      <Pressable
        onPress={addExercise}
        style={({ pressed }) => [styles.addZone, pressed && styles.addZonePressed]}
        accessibilityRole="button"
        accessibilityLabel="Añadir ejercicio"
      >
        <Ionicons name="add-circle-outline" size={20} color={colors.accent} />
        <Text style={styles.addZoneText}>Añadir ejercicio</Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  sectionAccent: {
    width: 3,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accentBlue,
    marginTop: 2,
  },
  sectionHeaderText: {
    flex: 1,
    gap: 2,
  },
  heading: {
    ...typography.h3,
    color: colors.text,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },
  emptySection: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: withAlpha(colors.surfaceLight, '66'),
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  card: {
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  cardTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  nameInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  removeBtn: {
    padding: 2,
  },
  metricChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  metricChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
  },
  metricChipActive: {
    borderColor: colors.accentBlue,
    backgroundColor: `${colors.accentBlue}18`,
  },
  metricChipText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  metricChipTextActive: {
    color: colors.accentBlue,
  },
  prescriptionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  fieldGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: colors.text,
    fontSize: 14,
    minHeight: 34,
    textAlign: 'center',
  },
  compactInputFlex: {
    flex: 1,
    textAlign: 'left',
    paddingHorizontal: spacing.sm,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  metricLabel: {
    color: colors.accentBlue,
    fontWeight: '700',
  },
  genderSymbol: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontWeight: '700',
    width: 14,
    textAlign: 'center',
  },
  restRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  restLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  addZone: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: withAlpha(colors.accent, '88'),
    backgroundColor: withAlpha(colors.accent, '08'),
  },
  addZonePressed: {
    opacity: 0.85,
    backgroundColor: withAlpha(colors.accent, '14'),
  },
  addZoneText: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '700',
  },
});
