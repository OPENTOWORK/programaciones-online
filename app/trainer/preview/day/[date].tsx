import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ProgramSchedulePreview } from '@/components/trainer/ProgramSchedulePreview';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, spacing, typography } from '@/constants/theme';
import { formatDayLabel } from '@/lib/programSchedulePreview';
import { normalizeRouteParam } from '@/lib/routeParams';
import { openTrainerPreviewDay, openTrainerPreviewSession } from '@/lib/sessionNavigation';
import { peekTrainerPreview, sessionsForTrainerPreviewDay } from '@/lib/trainerPreviewContext';
import { safeGoBack } from '@/lib/navigation';

export default function TrainerPreviewDayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string | string[]; previewKey?: string | string[] }>();
  const date = normalizeRouteParam(params.date);
  const previewKey = normalizeRouteParam(params.previewKey);

  const previewState = previewKey ? peekTrainerPreview(previewKey) : undefined;
  const dayDate = useMemo(() => (date ? new Date(`${date}T12:00:00`) : new Date()), [date]);

  const daySessions = useMemo(() => {
    if (!previewState) return { items: [], sessions: [] };
    return sessionsForTrainerPreviewDay(previewState, dayDate);
  }, [previewState, dayDate]);

  if (!previewState) {
    return (
      <ScreenWrapper>
        <Card>
          <Text style={styles.emptyTitle}>Vista previa no disponible</Text>
          <Text style={styles.emptyText}>
            Vuelve al editor y pulsa de nuevo un día del calendario para abrir la vista previa.
          </Text>
          <Button title="Volver" variant="outline" onPress={() => safeGoBack(router)} style={styles.backBtn} />
        </Card>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <SectionHeader
        title={formatDayLabel(dayDate)}
        subtitle="Vista previa · sesiones programadas para este día"
      />

      {daySessions.sessions.length === 0 ? (
        <Card>
          <Text style={styles.emptyTitle}>Sin sesiones este día</Text>
          <Text style={styles.emptyText}>
            Con la programación actual no hay entrenos en esta fecha. Ajusta los días de la sesión en el editor.
          </Text>
        </Card>
      ) : (
        <View style={styles.list}>
          {daySessions.sessions.map((session) => (
            <Pressable
              key={session.id}
              onPress={() => {
                const item = daySessions.items.find((entry) => entry.id === session.id);
                if (item) openTrainerPreviewSession(router, item, previewState);
              }}
              style={({ pressed }) => [styles.sessionCard, pressed && styles.sessionCardPressed]}
            >
              <Text style={styles.sessionName}>{session.name}</Text>
              <Text style={styles.sessionMeta}>
                {session.dayLabel} · {session.estimatedDuration}
              </Text>
              <Text style={styles.sessionHint}>Pulsa para ver la sesión en solo lectura</Text>
            </Pressable>
          ))}
        </View>
      )}

      <ProgramSchedulePreview
        program={previewState.program}
        workouts={previewState.workouts}
        draft={previewState.draft}
        editingWorkoutId={previewState.editingWorkoutId}
        isNewSession={previewState.isNewSession}
        additionalDrafts={previewState.additionalDrafts?.map((entry) => ({
          id: entry.id,
          draft: entry.draft,
        }))}
        onDayPress={(nextDate) => openTrainerPreviewDay(router, nextDate, previewState)}
        onSessionPress={(item) => openTrainerPreviewSession(router, item, previewState)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm, marginBottom: spacing.lg },
  sessionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  sessionCardPressed: {
    borderColor: colors.accentBlue,
    backgroundColor: `${colors.accentBlue}10`,
  },
  sessionName: { ...typography.body, color: colors.text, fontWeight: '700' },
  sessionMeta: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 4 },
  sessionHint: { ...typography.caption, color: colors.accentBlue, marginTop: spacing.sm, fontWeight: '600' },
  emptyTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  emptyText: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 22 },
  backBtn: { marginTop: spacing.md },
});
