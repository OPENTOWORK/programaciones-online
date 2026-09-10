import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Text } from 'react-native';

import { SessionPdfCard } from '@/components/workout/SessionPdfCard';
import { SessionWorkoutView } from '@/components/workout/SessionWorkoutView';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useExerciseVideos } from '@/hooks/useExerciseVideos';
import { useAthletePlan } from '@/hooks/useAthletePlans';
import { useSessionRunner } from '@/hooks/useSessionRunner';
import { combineMainPartsForSave, extractExercisesFromSessionDraft } from '@/lib/sessionBlockSections';
import { isPdfOnlyPlanSession, parsePersonalizedPlanContent } from '@/lib/personalizedPlanContent';
import { formatDayLabel } from '@/lib/programSchedulePreview';
import { PDF_SESSION_DURATION, pdfSessionTitle } from '@/lib/trainerSessionDraft';
import { allowsTrainerFeedbackVideos } from '@/lib/feedbackVideoAccess';
import { safeGoBack } from '@/lib/navigation';

export default function AthletePlanSessionScreen() {
  const { id, date } = useLocalSearchParams<{ id: string; date?: string }>();
  const router = useRouter();
  const { user, isDemoMode } = useAuth();
  const { plan, isLoading } = useAthletePlan(id ?? '');
  const { getVideoId, hasVideo } = useExerciseVideos();

  const scheduledDate = date ?? new Date().toISOString().slice(0, 10);
  const scheduledDateLabel = formatDayLabel(new Date(`${scheduledDate}T12:00:00`));

  const workout = useMemo(() => {
    if (!plan) return null;
    const draft = parsePersonalizedPlanContent(plan.content, (plan.sessionNumber ?? 1) - 1);
    /* El título de una sesión solo-PDF es el propio documento, igual que en el calendario. */
    const isPdfOnly = isPdfOnlyPlanSession(plan, draft);
    const sessionName =
      isPdfOnly && plan.pdfFileName
        ? pdfSessionTitle(plan.pdfFileName)
        : draft.name.trim() || `Sesión ${plan.sessionNumber ?? 1}`;
    return {
      name: sessionName,
      sessionNumber: plan.sessionNumber ?? 1,
      kind: draft.kind,
      estimatedDuration: isPdfOnly ? PDF_SESSION_DURATION : draft.estimatedDuration,
      warmup: draft.warmup,
      main: combineMainPartsForSave(draft.main, draft.metcon),
      core: draft.core,
      cooldown: draft.cooldown,
      exercises: extractExercisesFromSessionDraft(draft),
    };
  }, [plan]);

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
      athletePlanId: id,
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

  if (!plan || !workout) {
    return (
      <ScreenWrapper>
        <Text style={{ color: colors.danger }}>Plan no encontrado</Text>
      </ScreenWrapper>
    );
  }

  const draft = parsePersonalizedPlanContent(plan.content);

  return (
    <ScreenWrapper>
      <SessionWorkoutView
        workout={workout}
        meta={[draft.dayLabel, workout.estimatedDuration].filter(Boolean).join(' · ')}
        scheduledDateLabel={scheduledDateLabel}
        attachment={
          plan.pdfUrl ? (
            <SessionPdfCard fileName={plan.pdfFileName} url={plan.pdfUrl} />
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
        allowFeedbackVideos={allowsTrainerFeedbackVideos({ planType: plan.planType })}
      />
    </ScreenWrapper>
  );
}
