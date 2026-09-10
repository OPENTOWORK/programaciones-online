import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Input } from '@/components/ui/Input';
import { colors, spacing, typography, withAlpha } from '@/constants/theme';
import {
  type IntakeFormAnswers,
  type IntakeFormField,
  type IntakeFormSchema,
} from '@/lib/intakeFormTypes';

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

function FieldBlock({
  field,
  value,
  onChange,
}: {
  field: IntakeFormField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  if (field.type === 'text') {
    return (
      <Input
        value={typeof value === 'string' ? value : ''}
        onChangeText={(text) => onChange(text)}
        placeholder={field.description ?? ''}
      />
    );
  }

  if (field.type === 'textarea') {
    return (
      <TextInput
        value={typeof value === 'string' ? value : ''}
        onChangeText={(text) => onChange(text)}
        placeholder={field.description ?? ''}
        placeholderTextColor={colors.textMuted}
        multiline
        style={styles.textarea}
      />
    );
  }

  if (field.type === 'number') {
    return (
      <Input
        value={typeof value === 'number' ? String(value) : typeof value === 'string' ? value : ''}
        onChangeText={(text) => {
          const trimmed = text.trim();
          if (!trimmed) {
            onChange(undefined);
            return;
          }
          const parsed = Number(trimmed);
          onChange(Number.isFinite(parsed) ? Math.round(parsed) : trimmed);
        }}
        keyboardType="numeric"
      />
    );
  }

  if (field.type === 'single_select') {
    const selected = typeof value === 'string' ? value : '';
    return (
      <View style={styles.optionsRow}>
        {(field.options ?? []).map((option) => {
          const isSelected = selected === option;
          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              style={[styles.optionChip, isSelected && styles.optionChipSelected]}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  if (field.type === 'multi_select') {
    const selected = Array.isArray(value) ? value.map(String) : [];
    return (
      <View style={styles.optionsRow}>
        {(field.options ?? []).map((option) => {
          const isSelected = selected.includes(option);
          return (
            <Pressable
              key={option}
              onPress={() => {
                onChange(
                  isSelected ? selected.filter((item) => item !== option) : [...selected, option],
                );
              }}
              style={[styles.optionChip, isSelected && styles.optionChipSelected]}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  if (field.type === 'yes_no') {
    return (
      <YesNoChips
        value={typeof value === 'boolean' ? value : undefined}
        onChange={(next) => onChange(next)}
      />
    );
  }

  if (field.type === 'yes_no_detail') {
    const record =
      value && typeof value === 'object' && !Array.isArray(value)
        ? (value as { value?: boolean; detail?: string })
        : {};
    return (
      <View style={styles.nestedBlock}>
        <YesNoChips
          value={typeof record.value === 'boolean' ? record.value : undefined}
          onChange={(next) => onChange({ ...record, value: next })}
        />
        {record.value ? (
          <Input
            value={record.detail ?? ''}
            onChangeText={(text) => onChange({ ...record, detail: text })}
            placeholder="Describe el detalle"
          />
        ) : null}
      </View>
    );
  }

  return null;
}

interface DynamicIntakeFormFieldsProps {
  schema: IntakeFormSchema;
  answers: IntakeFormAnswers;
  onChange: (answers: IntakeFormAnswers) => void;
}

export function DynamicIntakeFormFields({ schema, answers, onChange }: DynamicIntakeFormFieldsProps) {
  const setFieldValue = (fieldId: string, value: unknown) => {
    onChange({ ...answers, [fieldId]: value });
  };

  return (
    <View style={styles.container}>
      {schema.fields.map((field) => (
        <View key={field.id} style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>
            {field.label}
            {field.required ? <Text style={styles.required}> *</Text> : null}
          </Text>
          {field.description ? <Text style={styles.fieldDescription}>{field.description}</Text> : null}
          <FieldBlock
            field={field}
            value={answers[field.id]}
            onChange={(value) => setFieldValue(field.id, value)}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  fieldBlock: {
    gap: spacing.xs,
  },
  fieldLabel: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  required: {
    color: colors.danger,
  },
  fieldDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
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
  optionText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  optionTextSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
  textarea: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  nestedBlock: {
    gap: spacing.sm,
  },
});
