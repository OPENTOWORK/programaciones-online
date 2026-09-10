import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Input } from '@/components/ui/Input';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import {
  createEmptyIntakeField,
  INTAKE_FIELD_TYPE_LABELS,
  type IntakeFormField,
  type IntakeFormFieldType,
} from '@/lib/intakeFormTypes';

interface IntakeFormTemplateFieldEditorProps {
  fields: IntakeFormField[];
  onChange: (fields: IntakeFormField[]) => void;
}

const FIELD_TYPES: IntakeFormFieldType[] = [
  'text',
  'textarea',
  'number',
  'single_select',
  'multi_select',
  'yes_no',
  'yes_no_detail',
];

export function IntakeFormTemplateFieldEditor({ fields, onChange }: IntakeFormTemplateFieldEditorProps) {
  const updateField = (index: number, patch: Partial<IntakeFormField>) => {
    onChange(fields.map((field, fieldIndex) => (fieldIndex === index ? { ...field, ...patch } : field)));
  };

  const removeField = (index: number) => {
    onChange(fields.filter((_, fieldIndex) => fieldIndex !== index));
  };

  const moveField = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= fields.length) return;
    const next = [...fields];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onChange(next);
  };

  const addField = (type: IntakeFormFieldType) => {
    onChange([...fields, createEmptyIntakeField(type)]);
  };

  return (
    <View style={styles.container}>
      {fields.map((field, index) => (
        <View key={field.id} style={styles.fieldCard}>
          <View style={styles.fieldHeader}>
            <Text style={styles.fieldIndex}>Campo {index + 1}</Text>
            <View style={styles.fieldActions}>
              <Pressable
                onPress={() => moveField(index, -1)}
                disabled={index === 0}
                style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed, index === 0 && styles.disabled]}
                accessibilityLabel="Mover arriba"
              >
                <Text style={styles.moveText}>↑</Text>
              </Pressable>
              <Pressable
                onPress={() => moveField(index, 1)}
                disabled={index === fields.length - 1}
                style={({ pressed }) => [
                  styles.iconBtn,
                  pressed && styles.pressed,
                  index === fields.length - 1 && styles.disabled,
                ]}
                accessibilityLabel="Mover abajo"
              >
                <Text style={styles.moveText}>↓</Text>
              </Pressable>
              <Pressable
                onPress={() => removeField(index)}
                style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
                accessibilityLabel="Eliminar campo"
              >
                <AppIcon name="trash" size={16} color={colors.danger} />
              </Pressable>
            </View>
          </View>

          <Input
            label="Título del campo"
            value={field.label}
            onChangeText={(text) => updateField(index, { label: text })}
            placeholder="Ej. Objetivo principal"
          />

          <Input
            label="Descripción (opcional)"
            value={field.description ?? ''}
            onChangeText={(text) => updateField(index, { description: text })}
            placeholder="Texto de ayuda para el atleta"
          />

          <Text style={styles.typeLabel}>Tipo de campo</Text>
          <View style={styles.typeRow}>
            {FIELD_TYPES.map((type) => {
              const selected = field.type === type;
              return (
                <Pressable
                  key={type}
                  onPress={() => {
                    const nextType = type;
                    const patch: Partial<IntakeFormField> = { type: nextType };
                    if (nextType === 'single_select' || nextType === 'multi_select') {
                      patch.options = field.options?.length ? field.options : ['Opción 1', 'Opción 2'];
                    }
                    updateField(index, patch);
                  }}
                  style={[styles.typeChip, selected && styles.typeChipSelected]}
                >
                  <Text style={[styles.typeChipText, selected && styles.typeChipTextSelected]}>
                    {INTAKE_FIELD_TYPE_LABELS[type]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {field.type === 'single_select' || field.type === 'multi_select' ? (
            <Input
              label="Opciones (una por línea)"
              value={(field.options ?? []).join('\n')}
              onChangeText={(text) =>
                updateField(index, {
                  options: text
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean),
                })
              }
              multiline
              style={styles.optionsInput}
            />
          ) : null}

          <Pressable
            onPress={() => updateField(index, { required: !field.required })}
            style={({ pressed }) => [styles.requiredRow, pressed && styles.pressed]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: field.required }}
          >
            <View style={[styles.checkbox, field.required && styles.checkboxChecked]}>
              {field.required ? <AppIcon name="check" size={12} color={colors.white} /> : null}
            </View>
            <Text style={styles.requiredLabel}>Campo obligatorio</Text>
          </Pressable>
        </View>
      ))}

      <View style={styles.addRow}>
        {FIELD_TYPES.map((type) => (
          <Pressable
            key={type}
            onPress={() => addField(type)}
            style={({ pressed }) => [styles.addChip, pressed && styles.pressed]}
          >
            <Text style={styles.addChipText}>+ {INTAKE_FIELD_TYPE_LABELS[type]}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  fieldCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldIndex: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  fieldActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabled: {
    opacity: 0.35,
  },
  moveText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
  typeLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  typeChipSelected: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '22'),
  },
  typeChipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  typeChipTextSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
  optionsInput: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  requiredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  requiredLabel: {
    ...typography.bodySmall,
    color: colors.text,
  },
  addRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  addChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceLight,
  },
  addChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
