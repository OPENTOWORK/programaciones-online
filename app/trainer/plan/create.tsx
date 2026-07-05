import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, spacing, typography } from '@/constants/theme';
import { useAthlete, useAthletes } from '@/hooks/useAthletes';
import { useTrainerAthletePlans } from '@/hooks/useAthletePlans';
import { pickPlanPdf, type PickedPlanPdf } from '@/lib/planPdfPicker';
import { ATHLETE_PLAN_TYPE_LABELS, type AthletePlanType } from '@/lib/trainerConstants';
import { safeGoBack } from '@/lib/navigation';

function parsePlanType(value?: string | string[]): AthletePlanType {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === 'nutrition' ? 'nutrition' : 'personalized';
}

export default function CreateAthletePlanScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string | string[]; athleteId?: string | string[] }>();
  const planType = parsePlanType(params.type);
  const presetAthleteId = Array.isArray(params.athleteId) ? params.athleteId[0] : params.athleteId;

  const { athletes, isLoading: athletesLoading } = useAthletes();
  const { athlete: presetAthlete, isLoading: presetAthleteLoading } = useAthlete(presetAthleteId ?? '');
  const { createPlan } = useTrainerAthletePlans();

  const [selectedAthleteId, setSelectedAthleteId] = useState(presetAthleteId ?? '');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [attachedPdf, setAttachedPdf] = useState<PickedPlanPdf | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pickingPdf, setPickingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (presetAthleteId) {
      setSelectedAthleteId(presetAthleteId);
    }
  }, [presetAthleteId]);

  const selectedAthlete = useMemo(() => {
    if (!selectedAthleteId) return undefined;
    if (presetAthlete?.id === selectedAthleteId) return presetAthlete;
    return athletes.find((athlete) => athlete.id === selectedAthleteId);
  }, [athletes, presetAthlete, selectedAthleteId]);

  const toggleAthleteSelection = (athleteId: string) => {
    setSelectedAthleteId((current) => (current === athleteId ? '' : athleteId));
  };

  const handleSubmit = async () => {
    if (!selectedAthleteId) {
      setError('Selecciona un atleta');
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await createPlan({
      athleteId: selectedAthleteId,
      planType,
      title,
      content,
      athleteName: selectedAthlete?.name,
      pdf: attachedPdf ?? undefined,
    });

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    safeGoBack(router, '/tabs/programs');
  };

  const handlePickPdf = async () => {
    setPickingPdf(true);
    setError(null);

    const picked = await pickPlanPdf();
    setPickingPdf(false);

    if ('cancelled' in picked) return;
    if ('error' in picked) {
      setError(picked.error);
      return;
    }

    setAttachedPdf(picked);
  };

  return (
    <ScreenWrapper>
      <Text style={styles.title}>{ATHLETE_PLAN_TYPE_LABELS[planType]}</Text>
      <SectionHeader
        title="Asignar a un atleta"
        subtitle="El plan aparecerá en la pestaña correspondiente del atleta"
      />

      {athletesLoading || (presetAthleteId && presetAthleteLoading) ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : athletes.length === 0 ? (
        <Card>
          <Text style={styles.emptyTitle}>Sin atletas disponibles</Text>
          <Text style={styles.emptyText}>Registra atletas en la plataforma para poder asignarles planes.</Text>
        </Card>
      ) : (
        <>
          <Card style={styles.athletePicker}>
            <Text style={styles.pickerLabel}>Atleta</Text>
            <Text style={styles.pickerHint}>Pulsa de nuevo un atleta seleccionado para desmarcarlo.</Text>
            {athletes.map((athlete) => {
              const selected = athlete.id === selectedAthleteId;
              return (
                <Pressable
                  key={athlete.id}
                  onPress={() => toggleAthleteSelection(athlete.id)}
                  style={[styles.athleteOption, selected && styles.athleteOptionSelected]}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{athlete.avatarInitials}</Text>
                  </View>
                  <View style={styles.athleteInfo}>
                    <Text style={styles.athleteName}>{athlete.name}</Text>
                    <Text style={styles.athleteEmail}>{athlete.email}</Text>
                  </View>
                  <View style={[styles.radio, selected && styles.radioSelected]} />
                </Pressable>
              );
            })}
          </Card>

          <Input label="Título del plan" value={title} onChangeText={setTitle} placeholder="Ej. Fuerza 4 semanas" />

          <Input
            label="Contenido del plan"
            value={content}
            onChangeText={setContent}
            placeholder="Describe la programación o pauta nutricional..."
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            style={styles.contentInput}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.pdfSection}>
            <Button
              title={attachedPdf ? 'Cambiar PDF' : 'Adjuntar PDF'}
              variant="outline"
              onPress={() => void handlePickPdf()}
              loading={pickingPdf}
              style={styles.pdfButton}
            />
            {attachedPdf ? (
              <Text style={styles.pdfName} numberOfLines={2}>
                {attachedPdf.fileName}
              </Text>
            ) : (
              <Text style={styles.pdfHint}>Opcional. El atleta podrá descargar el PDF desde su plan.</Text>
            )}
          </View>

          <Button title="Guardar y asignar plan" onPress={() => void handleSubmit()} loading={submitting} />
        </>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: colors.text, marginBottom: 4 },
  loader: { marginTop: spacing.xl },
  emptyTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  emptyText: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 22 },
  athletePicker: { marginBottom: spacing.md },
  pickerLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  pickerHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  athleteOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  athleteOptionSelected: {
    backgroundColor: `${colors.accent}11`,
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.accentBlue}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontWeight: '700', color: colors.accentBlue },
  athleteInfo: { flex: 1 },
  athleteName: { ...typography.body, color: colors.text, fontWeight: '600' },
  athleteEmail: { ...typography.caption, color: colors.textMuted },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.border,
  },
  radioSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  contentInput: {
    minHeight: 160,
    paddingTop: 14,
  },
  error: {
    ...typography.bodySmall,
    color: colors.danger,
    marginBottom: spacing.md,
  },
  pdfSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  pdfButton: {
    width: '100%',
  },
  pdfName: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  pdfHint: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 20,
  },
});
