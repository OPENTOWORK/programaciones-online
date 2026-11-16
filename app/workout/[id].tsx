import { useAppNavigation } from '@/hooks/useAppNavigation';
import { useEmbeddedRouteParams } from '@/hooks/useEmbeddedRouteParams';
import { normalizeRouteParam } from '@/lib/routeParams';
import { StyleSheet, Text, View } from 'react-native';

import { SessionPdfCard } from '@/components/workout/SessionPdfCard';
import { SessionWorkoutView } from '@/components/workout/SessionWorkoutView';
import { HypeCatalogAccessGate } from '@/components/program/HypeCatalogAccessGate';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { brandColor, brandColors, colors, spacing } from '@/constants/theme';
import { fontUiRegular, fontUiSemibold } from '@/constants/fonts';
import { useAuth } from '@/hooks/useAuth';
import { useExerciseVideos } from '@/hooks/useExerciseVideos';
import { useProgram, useWorkout } from '@/hooks/usePrograms';
import { useProgramEntitlement } from '@/hooks/usePurchases';
import { useSessionRunner } from '@/hooks/useSessionRunner';
import { signedUrlForCatalogWorkoutPdf } from '@/lib/catalogWorkoutPdfService';
import { canEnterHypeCatalogProgram, isPaidHypeCatalogProgram } from '@/lib/hypeCatalog';
import { formatDayLabel } from '@/lib/programSchedulePreview';

function formatWorkoutMeta(workout: {
  workoutDate?: string;
  dayLabel: string;
  weekNumber: number;
  estimatedDuration: string;
}) {
  const usesTemplateDate = Boolean(workout.workoutDate?.startsWith('2000-'));

  return [
    usesTemplateDate ? workout.dayLabel : (workout.workoutDate ?? workout.dayLabel),
    !usesTemplateDate && workout.weekNumber > 1 ? `Semana ${workout.weekNumber}` : null,
    workout.estimatedDuration,
  ].filter(Boolean);
}

export default function WorkoutDetailScreen() {
  const params = useEmbeddedRouteParams<{
    id?: string | string[];
    date?: string | string[];
    preview?: string | string[];
  }>();
  const id = normalizeRouteParam(params.id);
  const date = normalizeRouteParam(params.date);
  const preview = normalizeRouteParam(params.preview);
  const isSampleWeek = preview === 'week';
  const isPreview = preview === '1' || preview === 'true' || isSampleWeek;
  const router = useAppNavigation();
  const { user, isDemoMode } = useAuth();
  const { workout, isLoading } = useWorkout(id ?? '');
  const { program: parentProgram } = useProgram(workout?.programId ?? '');
  const hasProgramEntitlement = useProgramEntitlement();
  const { getVideoId, hasVideo } = useExerciseVideos();

  const scheduledDate = date ?? new Date().toISOString().slice(0, 10);
  const scheduledDateLabel = formatDayLabel(new Date(`${scheduledDate}T12:00:00`));

  const runner = useSessionRunner({
    userId: user?.id,
    workout: workout ?? {
      name: '',
      estimatedDuration: '60 min',
      warmup: '',
      main: '',
      cooldown: '',
      exercises: [],
    },
    logLookup: {
      entrenoId: id,
      scheduledDate,
    },
    isDemoMode: isDemoMode || isPreview,
  });

  if (isLoading || (!isPreview && runner.loadingLog)) {
    return (
      <ScreenWrapper scrollable={false}>
        <Text style={{ color: colors.text }}>Cargando sesión…</Text>
      </ScreenWrapper>
    );
  }

  if (!workout) {
    return (
      <ScreenWrapper>
        <Text style={{ color: colors.danger }}>Sesión no encontrada</Text>
      </ScreenWrapper>
    );
  }

  if (
    !isPreview &&
    parentProgram &&
    isPaidHypeCatalogProgram(parentProgram) &&
    !canEnterHypeCatalogProgram(user?.role) &&
    !hasProgramEntitlement(parentProgram.id)
  ) {
    return <HypeCatalogAccessGate program={parentProgram} />;
  }

  const pdfStoragePath = workout.schedule?.pdfStoragePath;

  if (isPreview) {
    return (
      <ScreenWrapper>
        <View style={styles.previewBanner}>
          <Text style={styles.previewTitle}>{isSampleWeek ? 'Semana de prueba' : 'Día de ejemplo'}</Text>
          <Text style={styles.previewText}>
            {isSampleWeek
              ? `Sesión fija de ${parentProgram?.name ?? 'esta programación'}. No se guarda nada.`
              : `Vista previa de ${parentProgram?.name ?? 'esta programación'}. No se guardan marcas.`}
          </Text>
        </View>
        <SessionWorkoutView
          workout={{
            name: workout.name,
            estimatedDuration: workout.estimatedDuration,
            warmup: workout.warmup,
            main: workout.main,
            core: workout.core,
            cooldown: workout.cooldown,
            exercises: workout.exercises,
            programId: workout.programId,
          }}
          meta={formatWorkoutMeta(workout).join(' · ')}
          scheduledDateLabel={scheduledDateLabel}
          attachment={
            pdfStoragePath ? (
              <SessionPdfCard
                fileName={workout.schedule?.pdfFileName}
                resolveUrl={() => signedUrlForCatalogWorkoutPdf(pdfStoragePath)}
              />
            ) : null
          }
          checklist={[]}
          completed={{}}
          feelings=""
          onFeelingsChange={() => {}}
          onToggleItem={() => {}}
          onSave={() => router.back('/tabs/programs')}
          saving={false}
          getVideoId={getVideoId}
          hasVideo={hasVideo}
          preview
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <SessionWorkoutView
        workout={{
          name: workout.name,
          estimatedDuration: workout.estimatedDuration,
          warmup: workout.warmup,
          main: workout.main,
          core: workout.core,
          cooldown: workout.cooldown,
          exercises: workout.exercises,
          programId: workout.programId,
        }}
        meta={formatWorkoutMeta(workout).join(' · ')}
        scheduledDateLabel={scheduledDateLabel}
        attachment={
          pdfStoragePath ? (
            <SessionPdfCard
              fileName={workout.schedule?.pdfFileName}
              resolveUrl={() => signedUrlForCatalogWorkoutPdf(pdfStoragePath)}
            />
          ) : null
        }
        checklist={runner.checklist}
        completed={runner.completed}
        feelings={runner.feelings}
        onFeelingsChange={runner.setFeelings}
        onToggleItem={runner.toggleItem}
        onSave={() => {
          void runner.save(true).then((ok) => {
            if (!ok) return;
            if (date) {
              router.replace({ pathname: '/calendar/[date]', params: { date } });
              return;
            }
            router.back('/tabs/programs');
          });
        }}
        saving={runner.saving}
        error={runner.error}
        saved={runner.saved}
        logId={runner.logId}
        userId={user?.id}
        ensureLog={runner.ensureLog}
        getVideoId={getVideoId}
        hasVideo={hasVideo}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  previewBanner: {
    marginBottom: spacing.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: brandColor('cardBorder', '#2C313A'),
    backgroundColor: brandColor('card', '#12161C'),
    gap: 2,
  },
  previewTitle: {
    fontFamily: fontUiSemibold,
    fontWeight: 'normal',
    color: brandColor('title', brandColors.orangeHighlight),
    fontSize: 13,
    lineHeight: 18,
  },
  previewText: {
    fontFamily: fontUiRegular,
    fontWeight: 'normal',
    color: brandColor('body', '#C5CAD3'),
    fontSize: 13,
    lineHeight: 18,
  },
});
