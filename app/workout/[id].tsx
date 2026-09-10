import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from 'react-native';

import { SessionPdfCard } from '@/components/workout/SessionPdfCard';
import { SessionWorkoutView } from '@/components/workout/SessionWorkoutView';
import { HypeCatalogAccessGate } from '@/components/program/HypeCatalogAccessGate';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useExerciseVideos } from '@/hooks/useExerciseVideos';
import { useProgram, useWorkout } from '@/hooks/usePrograms';
import { useSessionRunner } from '@/hooks/useSessionRunner';
import { signedUrlForCatalogWorkoutPdf } from '@/lib/catalogWorkoutPdfService';
import { canEnterHypeCatalogProgram, isPaidHypeCatalogProgram } from '@/lib/hypeCatalog';
import { formatDayLabel } from '@/lib/programSchedulePreview';
import { safeGoBack } from '@/lib/navigation';

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
  const { id, date } = useLocalSearchParams<{ id: string; date?: string }>();
  const router = useRouter();
  const { user, isDemoMode } = useAuth();
  const { workout, isLoading } = useWorkout(id ?? '');
  const { program: parentProgram } = useProgram(workout?.programId ?? '');
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
    isDemoMode,
  });

  if (isLoading || runner.loadingLog) {
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
    parentProgram &&
    isPaidHypeCatalogProgram(parentProgram) &&
    !canEnterHypeCatalogProgram(user?.role)
  ) {
    return <HypeCatalogAccessGate program={parentProgram} />;
  }

  const pdfStoragePath = workout.schedule?.pdfStoragePath;

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
            safeGoBack(router, '/tabs/programs');
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
