import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/constants/theme';
import {
  formatIntakeAnswerValue,
  type IntakeFormAnswers,
  type IntakeFormSchema,
} from '@/lib/intakeFormTypes';

interface DynamicIntakeAnswersTableProps {
  schema: IntakeFormSchema;
  answers: IntakeFormAnswers;
  completedAt?: string;
}

function Row({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, last && styles.rowLast]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function DynamicIntakeAnswersTable({
  schema,
  answers,
  completedAt,
}: DynamicIntakeAnswersTableProps) {
  const visibleFields = schema.fields.filter((field) => {
    const value = answers[field.id];
    return value !== undefined && value !== null && value !== '';
  });

  if (visibleFields.length === 0) {
    return <Text style={styles.empty}>Sin respuestas registradas.</Text>;
  }

  return (
    <View style={styles.table}>
      {visibleFields.map((field, index) => (
        <Row
          key={field.id}
          label={field.label}
          value={formatIntakeAnswerValue(field, answers[field.id])}
          last={!completedAt && index === visibleFields.length - 1}
        />
      ))}
      {completedAt ? <Row label="Completado el" value={formatDate(completedAt)} last /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    flexBasis: '42%',
    flexShrink: 0,
    fontWeight: '600',
  },
  value: {
    ...typography.bodySmall,
    color: colors.text,
    flex: 1,
  },
  empty: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
