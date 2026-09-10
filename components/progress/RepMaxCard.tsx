import { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { RepMaxChart } from '@/components/progress/RepMaxChart';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useRepMaxes } from '@/hooks/useRepMaxes';
import { parseIntegerInput, parseMetricInput } from '@/lib/bodyMetrics';
import {
  REP_MAX_UNITS,
  SUGGESTED_RM_LIFTS,
  estimateOneRepMax,
  formatRmValue,
  formatRepMaxDate,
  formatRepMaxLoad,
  getRepMaxUnitMeta,
  type AthleteRepMax,
  type RepMaxUnit,
} from '@/lib/repMax';

export function RepMaxCard({
  userId,
  dense = false,
  embedded = false,
}: {
  userId?: string;
  dense?: boolean;
  embedded?: boolean;
}) {
  const { groups, isLoading, saving, persistent, error, canEdit, save, remove } = useRepMaxes(userId);

  const [exerciseName, setExerciseName] = useState('');
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState<RepMaxUnit>('kg');
  const [reps, setReps] = useState('1');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AthleteRepMax | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [pendingDelete, setPendingDelete] = useState<AthleteRepMax | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const parsedWeight = parseMetricInput(weight);
  const parsedReps = parseIntegerInput(reps) ?? 1;
  const unitMeta = getRepMaxUnitMeta(unit);
  const estimated =
    unit === 'kg' && parsedWeight && parsedReps > 1
      ? estimateOneRepMax(parsedWeight, parsedReps)
      : undefined;

  const emptyText = canEdit
    ? 'Añade sentadilla, press banca u otros máximos para programar con %RM.'
    : 'Este atleta todavía no tiene marcas de RM.';

  const resetForm = () => {
    setExerciseName('');
    setWeight('');
    setUnit('kg');
    setReps('1');
    setEditing(null);
    setFormError(null);
    setShowForm(false);
  };

  const startCreate = () => {
    setEditing(null);
    setExerciseName('');
    setWeight('');
    setUnit('kg');
    setReps('1');
    setFormError(null);
    setShowForm(true);
  };

  const startEdit = (entry: AthleteRepMax) => {
    setEditing(entry);
    setExerciseName(entry.exerciseName);
    setWeight(String(entry.value));
    setUnit(entry.unit);
    setReps(String(entry.reps));
    setFormError(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    setFormError(null);
    const result = await save(
      {
        exerciseName,
        value: parsedWeight ?? 0,
        unit,
        reps: parsedReps,
      },
      editing ?? undefined,
    );
    if (result.error) {
      setFormError(result.error);
      return;
    }
    resetForm();
  };

  const formVisible = canEdit && showForm;

  return (
    <Card style={[embedded ? styles.cardEmbedded : styles.card, !embedded && dense && styles.cardDense]}>
      {embedded ? (
        canEdit ? (
          <View style={styles.embeddedActions}>
            {!showForm ? (
              <Button title="Añadir" size="compact" onPress={startCreate} style={styles.addButton} />
            ) : (
              <Button title="Cerrar" size="compact" variant="ghost" onPress={resetForm} />
            )}
          </View>
        ) : null
      ) : (
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={[styles.title, dense && styles.titleDense]}>RM</Text>
            <Text style={[styles.subtitle, dense && styles.subtitleDense]}>
              Máximos de fuerza para programar porcentajes
            </Text>
          </View>
          {canEdit && !showForm ? (
            <Button title="Añadir" size="compact" onPress={startCreate} style={styles.addButton} />
          ) : null}
          {canEdit && showForm ? (
            <Button title="Cerrar" size="compact" variant="ghost" onPress={resetForm} />
          ) : null}
        </View>
      )}

      {!persistent ? (
        <Text style={styles.warning}>Las marcas se guardan en este dispositivo hasta sincronizar.</Text>
      ) : null}

      {formVisible ? (
        <View style={styles.form}>
          <TextInput
            value={exerciseName}
            onChangeText={setExerciseName}
            placeholder="Ejercicio (sentadilla, press banca…)"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, dense && styles.inputDense]}
          />
          <View style={styles.metricsRow}>
            <View style={[styles.input, styles.valueWrap, dense && styles.inputDense]}>
              <TextInput
                value={weight}
                onChangeText={setWeight}
                placeholder={unitMeta.placeholder}
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                style={styles.valueInput}
              />
              <View style={styles.unitGroup}>
                {REP_MAX_UNITS.map((option) => {
                  const selected = option.id === unit;
                  return (
                    <Pressable
                      key={option.id}
                      onPress={() => setUnit(option.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Unidad ${option.label}`}
                      style={[styles.unitChip, selected && styles.unitChipSelected]}
                    >
                      <Text style={[styles.unitChipText, selected && styles.unitChipTextSelected]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <TextInput
              value={reps}
              onChangeText={setReps}
              placeholder="reps"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              style={[styles.input, styles.repsInput, dense && styles.inputDense]}
            />
            <Button
              title={editing ? 'Guardar' : 'Añadir'}
              size="compact"
              loading={saving}
              disabled={saving || !exerciseName.trim() || !parsedWeight}
              onPress={() => void handleSave()}
              style={styles.saveButton}
            />
          </View>
          {estimated ? (
            <Text style={styles.estimate}>1RM estimado: {formatRmValue(estimated)} kg</Text>
          ) : null}
          <View style={styles.chips}>
            {SUGGESTED_RM_LIFTS.map((lift) => {
              const selected = exerciseName.trim().toLowerCase() === lift.toLowerCase();
              return (
                <Pressable
                  key={lift}
                  onPress={() => setExerciseName(lift)}
                  style={[styles.chip, selected && styles.chipSelected]}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{lift}</Text>
                </Pressable>
              );
            })}
          </View>
          {formError ? <Text style={styles.error}>{formError}</Text> : null}
        </View>
      ) : null}

      {isLoading ? (
        <ActivityIndicator color={colors.accent} />
      ) : (
        <>
          {groups.length === 0 && formVisible ? null : (
            <RepMaxChart groups={groups} emptyText={emptyText} />
          )}
          {groups.length > 0 ? (
            <View style={styles.list}>
              {groups.map((group) => {
                const isOpen = expanded[group.key] ?? false;
                return (
                  <View key={group.key} style={styles.group}>
                    <Pressable
                      onPress={() =>
                        setExpanded((current) => ({ ...current, [group.key]: !isOpen }))
                      }
                      accessibilityRole="button"
                      accessibilityState={{ expanded: isOpen }}
                      accessibilityLabel={isOpen ? `Contraer ${group.name}` : `Desplegar ${group.name}`}
                      style={({ pressed }) => [styles.groupHeader, pressed && styles.pressed]}
                    >
                      <View style={styles.rowCopy}>
                        <Text style={[styles.liftName, dense && styles.liftNameDense]}>{group.name}</Text>
                        <Text style={styles.load}>{formatRepMaxLoad(group.latest)}</Text>
                      </View>
                      <AppIcon
                        name="chevronDown"
                        size={18}
                        color={colors.textSecondary}
                        style={isOpen ? styles.chevronOpen : undefined}
                      />
                    </Pressable>
                    {isOpen ? (
                      <View style={styles.groupBody}>
                        <RepMaxRow
                          entry={group.latest}
                          canEdit={canEdit}
                          dense={dense}
                          hideLoad
                          onEdit={() => startEdit(group.latest)}
                          onDelete={() => setPendingDelete(group.latest)}
                        />
                        {group.history.map((entry) => (
                          <RepMaxRow
                            key={entry.id}
                            entry={entry}
                            canEdit={canEdit}
                            dense={dense}
                            muted
                            onEdit={() => startEdit(entry)}
                            onDelete={() => setPendingDelete(entry)}
                          />
                        ))}
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          ) : null}
        </>
      )}

      {error && !formError ? <Text style={styles.error}>{error}</Text> : null}

      <ConfirmModal
        visible={pendingDelete !== null}
        title="Eliminar RM"
        message={
          pendingDelete
            ? `Se quitará ${pendingDelete.exerciseName} (${formatRepMaxLoad(pendingDelete)}).`
            : undefined
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        destructive
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          const entry = pendingDelete;
          setPendingDelete(null);
          if (entry) {
            if (editing?.id === entry.id) resetForm();
            void remove(entry);
          }
        }}
      />
    </Card>
  );
}

function RepMaxRow({
  entry,
  title,
  canEdit,
  dense,
  muted = false,
  hideLoad = false,
  onEdit,
  onDelete,
}: {
  entry: AthleteRepMax;
  title?: string;
  canEdit: boolean;
  dense: boolean;
  muted?: boolean;
  hideLoad?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={[styles.row, muted && styles.rowMuted]}>
      <View style={styles.rowCopy}>
        {title ? <Text style={[styles.liftName, dense && styles.liftNameDense]}>{title}</Text> : null}
        {hideLoad ? null : (
          <Text style={[styles.load, muted && styles.loadMuted]}>{formatRepMaxLoad(entry)}</Text>
        )}
        <Text style={styles.date}>{formatRepMaxDate(entry.recordedAt)}</Text>
      </View>
      {canEdit ? (
        <View style={styles.rowActions}>
          <Pressable
            onPress={onEdit}
            accessibilityLabel="Editar RM"
            hitSlop={8}
            style={({ pressed }) => [styles.rowAction, pressed && styles.pressed]}
          >
            <AppIcon name="edit" size={16} color={colors.accent} />
          </Pressable>
          <Pressable
            onPress={onDelete}
            accessibilityLabel="Eliminar RM"
            hitSlop={8}
            style={({ pressed }) => [styles.rowAction, pressed && styles.pressed]}
          >
            <AppIcon name="trash" size={16} color={colors.danger} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
  },
  cardDense: {
    padding: spacing.sm + 2,
  },
  cardEmbedded: {
    padding: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  embeddedActions: {
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  titleDense: {
    ...typography.body,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  subtitleDense: {
    marginTop: 1,
  },
  addButton: {
    minWidth: 88,
  },
  warning: {
    ...typography.caption,
    color: colors.warning,
    marginBottom: spacing.sm,
  },
  form: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
    ...typography.bodySmall,
  },
  inputDense: {
    minHeight: 40,
    paddingVertical: spacing.xs + 2,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  valueWrap: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingRight: spacing.xs,
  },
  valueInput: {
    flex: 1,
    minWidth: 48,
    color: colors.text,
    paddingVertical: 0,
    ...typography.bodySmall,
  },
  unitGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  unitChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: colors.surface,
  },
  unitChipSelected: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '18'),
  },
  unitChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 11,
  },
  unitChipTextSelected: {
    color: colors.accent,
  },
  repsInput: {
    width: 64,
    flexGrow: 0,
    textAlign: 'center',
  },
  saveButton: {
    minWidth: 92,
  },
  estimate: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '18'),
  },
  chipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: colors.accent,
  },
  list: {
    gap: spacing.sm,
  },
  group: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
    gap: 4,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  groupBody: {
    gap: 4,
    paddingTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  rowMuted: {
    opacity: 0.8,
    paddingLeft: spacing.sm,
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
  },
  liftName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  liftNameDense: {
    ...typography.bodySmall,
    fontWeight: '700',
  },
  load: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '700',
    marginTop: 1,
  },
  loadMuted: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  date: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rowAction: {
    padding: spacing.xs,
  },
  error: {
    ...typography.bodySmall,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  pressed: {
    opacity: 0.65,
  },
});
