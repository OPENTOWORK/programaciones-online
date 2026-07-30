import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { SessionTemplatesCard } from '@/components/trainer/SessionTemplatesCard';
import { WorkoutBlocksEditor } from '@/components/trainer/WorkoutBlocksEditor';
import { SessionScheduleEditor } from '@/components/trainer/SessionScheduleEditor';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { colors, spacing, typography } from '@/constants/theme';
import { formatScheduleSummary } from '@/lib/sessionSchedule';
import type { SessionDraft } from '@/lib/trainerSessionDraft';

interface SessionEditorFormProps {
  draft: SessionDraft;
  onChange: (draft: SessionDraft) => void;
  showSessionName?: boolean;
  sessionNumber?: number;
  onSessionNumberChange?: (value: number) => void;
  onConfirmSession?: () => void;
  canConfirmSession?: boolean;
  onPendingBlocksChange?: (hasPending: boolean) => void;
  showTemplates?: boolean;
}

export function SessionEditorForm({
  draft,
  onChange,
  showSessionName = true,
  sessionNumber,
  onSessionNumberChange,
  onConfirmSession,
  canConfirmSession = false,
  onPendingBlocksChange,
  showTemplates = true,
}: SessionEditorFormProps) {
  const { width } = useWindowDimensions();
  const isWide = width >= 720;

  const updateField = (field: keyof SessionDraft, value: string) => {
    onChange({ ...draft, [field]: value });
  };

  return (
    <View style={styles.form}>
      {showTemplates ? <SessionTemplatesCard draft={draft} onChange={onChange} /> : null}

      <Card style={styles.metaCard}>
        <Text style={styles.metaTitle}>Datos de la sesión</Text>
        <View style={[styles.metaRow, isWide && styles.metaRowWide]}>
          {showSessionName ? (
            <View style={styles.metaNameField}>
              <Input
                label="Nombre de sesión"
                value={draft.name}
                onChangeText={(value) => updateField('name', value)}
                style={styles.metaInput}
              />
            </View>
          ) : null}
          {sessionNumber != null ? (
            <View style={[styles.metaSessionNumberField, isWide && styles.metaSessionNumberFieldWide]}>
              <Input
                label="Número de sesión"
                value={String(sessionNumber)}
                onChangeText={(value) => {
                  const parsed = Number.parseInt(value, 10);
                  if (!Number.isFinite(parsed) || parsed < 1 || !onSessionNumberChange) return;
                  onSessionNumberChange(parsed);
                }}
                placeholder="1"
                keyboardType="number-pad"
                style={styles.metaInput}
              />
            </View>
          ) : null}
          <View style={[styles.metaDurationField, isWide && styles.metaDurationFieldWide, !showSessionName && styles.metaDurationFieldFull]}>
            <Input
              label="Duración estimada"
              value={draft.estimatedDuration}
              onChangeText={(value) => updateField('estimatedDuration', value)}
              style={styles.metaInput}
            />
          </View>
        </View>
      </Card>

      <SessionScheduleEditor
        schedule={draft.schedule}
        onChange={(schedule) =>
          onChange({
            ...draft,
            schedule,
            dayLabel: formatScheduleSummary(schedule),
          })
        }
      />

      <WorkoutBlocksEditor
        draft={draft}
        onChange={onChange}
        hideConfirmedBlocks
        onPendingBlocksChange={onPendingBlocksChange}
      />

      {onConfirmSession ? (
        <Button
          title="Listo, otra sesión"
          variant="outline"
          onPress={onConfirmSession}
          disabled={!canConfirmSession}
          style={styles.confirmSessionBtn}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.lg,
  },
  metaCard: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  metaTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  metaRow: {
    gap: spacing.sm,
  },
  metaRowWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  metaNameField: {
    flex: 1,
  },
  metaSessionNumberField: {
    width: '100%',
  },
  metaSessionNumberFieldWide: {
    width: 120,
    flexShrink: 0,
  },
  metaDurationField: {
    width: '100%',
  },
  metaDurationFieldWide: {
    width: 200,
    flexShrink: 0,
  },
  metaDurationFieldFull: {
    flex: 1,
    width: 'auto',
  },
  metaInput: {
    minHeight: 46,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  confirmSessionBtn: {
    width: '100%',
  },
});
