import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';

import { SessionWorkoutView } from '@/components/workout/SessionWorkoutView';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, spacing, typography } from '@/constants/theme';
import { useExerciseVideos } from '@/hooks/useExerciseVideos';
import { formatDayLabel, parseSchedulePreviewItemKey } from '@/lib/programSchedulePreview';
import { safeGoBack } from '@/lib/navigation';
import { normalizeRouteParam } from '@/lib/routeParams';
import { formatDateParam, openTrainerPreviewDay } from '@/lib/sessionNavigation';
import {
  buildTrainerPreviewItems,
  peekTrainerPreview,
  resolveTrainerPreviewSession,
} from '@/lib/trainerPreviewContext';

export default function TrainerPreviewSessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    previewKey?: string | string[];
    itemId?: string | string[];
    date?: string | string[];
  }>();
  const previewKey = normalizeRouteParam(params.previewKey);
  const itemId = normalizeRouteParam(params.itemId);
  const date = normalizeRouteParam(params.date);
  const { getVideoId, hasVideo } = useExerciseVideos();

  const previewState = previewKey ? peekTrainerPreview(previewKey) : undefined;
  const scheduledDate = date ?? formatDateParam(new Date());
  const scheduledDateLabel = formatDayLabel(new Date(`${scheduledDate}T12:00:00`));

  const previewItem = useMemo(() => {
    if (!previewState || !itemId) return null;
    const items = buildTrainerPreviewItems(previewState, new Date(`${scheduledDate}T12:00:00`));
    const exact = items.find(
      (item) => item.id === itemId && formatDateParam(item.date) === scheduledDate,
    );
    if (exact) return exact;

    const { sourceId, dateKey } = parseSchedulePreviewItemKey(itemId);
    return items.find(
      (item) =>
        parseSchedulePreviewItemKey(item.id).sourceId === sourceId &&
        (dateKey ? formatDateParam(item.date) === dateKey : formatDateParam(item.date) === scheduledDate),
    );
  }, [previewState, itemId, scheduledDate]);

  const workout = useMemo(() => {
    if (!previewState || !previewItem) return null;
    return resolveTrainerPreviewSession(previewState, previewItem);
  }, [previewState, previewItem]);

  if (!previewState) {
    return (
      <ScreenWrapper>
        <Card>
          <Text style={styles.emptyTitle}>Vista previa no disponible</Text>
          <Text style={styles.emptyText}>
            Vuelve al editor y pulsa de nuevo el calendario para abrir la vista previa.
          </Text>
          <Button title="Volver" variant="outline" onPress={() => safeGoBack(router)} style={styles.backBtn} />
        </Card>
      </ScreenWrapper>
    );
  }

  if (!previewItem || !workout) {
    return (
      <ScreenWrapper>
        <SectionHeader
          title={scheduledDateLabel}
          subtitle="Vista previa · sesiones programadas para este día"
        />
        <Card>
          <Text style={styles.emptyTitle}>Sin sesiones este día</Text>
          <Text style={styles.emptyText}>
            No hay entrenos programados para esta fecha con la configuración actual.
          </Text>
          <Button
            title="Ver día completo"
            variant="outline"
            onPress={() => openTrainerPreviewDay(router, new Date(`${scheduledDate}T12:00:00`), previewState)}
            style={styles.backBtn}
          />
        </Card>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Card style={styles.banner}>
        <Text style={styles.bannerTitle}>Vista previa</Text>
        <Text style={styles.bannerText}>
          Así verá el atleta esta sesión. No se guardan marcas ni sensaciones desde aquí.
        </Text>
      </Card>

      <SessionWorkoutView
        workout={workout}
        meta={[previewItem.dayLabel, workout.estimatedDuration].filter(Boolean).join(' · ')}
        scheduledDateLabel={scheduledDateLabel}
        checklist={[]}
        completed={{}}
        feelings=""
        onFeelingsChange={() => {}}
        onToggleItem={() => {}}
        onSave={() => {}}
        saving={false}
        getVideoId={getVideoId}
        hasVideo={hasVideo}
        preview
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginBottom: spacing.md,
    borderColor: `${colors.accentBlue}55`,
    backgroundColor: `${colors.accentBlue}12`,
  },
  bannerTitle: { ...typography.body, color: colors.accentBlue, fontWeight: '700', marginBottom: spacing.xs },
  bannerText: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 20 },
  emptyTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  emptyText: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 22 },
  backBtn: { marginTop: spacing.md },
});
