import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/constants/theme';
import type { AthleteIntakeForm } from '@/lib/types';

const TRAINING_PLACE_LABELS: Record<NonNullable<AthleteIntakeForm['trainingPlace']>, string> = {
  gimnasio: 'Gimnasio',
  casa: 'Casa',
  ambas: 'Gimnasio y casa',
};

function yesNo(value: boolean | undefined) {
  if (value === undefined) return 'No indicado';
  return value ? 'Sí' : 'No';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

interface IntakeAnswersTableProps {
  form: AthleteIntakeForm;
}

function Row({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, last && styles.rowLast]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export function IntakeAnswersTable({ form }: IntakeAnswersTableProps) {
  const goalsText = [...form.goals, form.goalsOther ? `Otro: ${form.goalsOther}` : null]
    .filter(Boolean)
    .join(', ');

  const repsText = [
    form.pushupsReps !== undefined ? `Flexiones: ${form.pushupsReps}` : null,
    form.squatsReps !== undefined ? `Sentadillas: ${form.squatsReps}` : null,
    form.pullupsReps !== undefined ? `Dominadas: ${form.pullupsReps}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={styles.table}>
      <Row label="Objetivos de entrenamiento" value={goalsText || 'No indicado'} />
      <Row label="Experiencia en gimnasios o deporte" value={form.experience || 'No indicado'} />
      <Row
        label="Dónde entrena"
        value={form.trainingPlace ? TRAINING_PLACE_LABELS[form.trainingPlace] : 'No indicado'}
      />
      <Row label="Equipamiento disponible" value={form.equipment || 'No indicado'} />
      <Row label="Disponibilidad para entrenar" value={form.availability || 'No indicado'} />
      <Row label="Repeticiones en una tirada" value={repsText || 'No indicado'} />
      <Row label="¿Tiene o ha tenido lesiones?" value={yesNo(form.hasInjuries)} />
      {form.injuriesDetail ? <Row label="Detalle de la lesión" value={form.injuriesDetail} /> : null}
      <Row label="¿Toma medicación relevante?" value={yesNo(form.takesMedication)} />
      <Row label="¿Ha tenido cirugías relevantes?" value={yesNo(form.hadSurgery)} />
      <Row
        label="¿Tiene alguna condición médica?"
        value={yesNo(form.hasMedicalCondition)}
        last={!form.completedAt}
      />
      {form.completedAt ? (
        <Row label="Completado el" value={formatDate(form.completedAt)} last />
      ) : null}
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
});
