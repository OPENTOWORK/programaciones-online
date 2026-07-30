import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ActiveProgramCard } from '@/components/progress/ActiveProgramCard';
import { MotivationBanner } from '@/components/progress/MotivationBanner';
import { ProgressOverview } from '@/components/progress/ProgressOverview';
import { ProgressPhotos } from '@/components/progress/ProgressPhotos';
import { TrainerFeedbackCard } from '@/components/progress/TrainerFeedbackCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, spacing, typography } from '@/constants/theme';
import { useActiveProgram } from '@/hooks/useActiveProgram';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { useProgress } from '@/hooks/useProgress';

export default function ProgressScreen() {
  const router = useRouter();
  const { progress, refresh } = useProgress();
  const { actives, refresh: refreshActivePrograms } = useActiveProgram();
  useFocusRefresh(
    () => refresh(),
    () => refreshActivePrograms(),
  );

  const weeklyValue =
    progress.weeklyTarget > 0
      ? `${progress.weeklyCompleted}/${progress.weeklyTarget}`
      : `${progress.weeklyCompleted}`;

  const monthlyValue =
    progress.monthlyTarget > 0
      ? `${progress.monthlyCompleted}/${progress.monthlyTarget}`
      : `${progress.monthlyCompleted}`;

  return (
    <ScreenWrapper style={styles.screen}>
      <View style={styles.layout}>
        <Text style={styles.title}>Mi Progreso</Text>

        <MotivationBanner dense message={progress.motivationalStatus} />

        <ProgressOverview
          dense
          stats={[
            {
              icon: 'calendar',
              value: weeklyValue,
              label: 'Esta semana',
              hint: 'entrenamientos',
            },
            {
              icon: 'calendar',
              value: monthlyValue,
              label: 'Este mes',
              hint: 'entrenamientos',
            },
            {
              icon: 'streak',
              value: `${progress.streak}`,
              label: 'Racha',
              hint: progress.streak === 1 ? 'día' : 'días',
              accent: colors.accent,
            },
          ]}
        />

        {actives.length > 0 ? (
          <View style={styles.block}>
            <Text style={styles.sectionTitle}>Programación activa</Text>
            <Text style={styles.sectionSubtitle}>{actives.length} de 3 activas</Text>
            {actives.map((active) => (
              <ActiveProgramCard key={active.program.id} active={active} dense />
            ))}
          </View>
        ) : (
          <Card style={styles.emptyProgramsCard}>
            <Text style={styles.emptyProgramsTitle}>Sin programación activa</Text>
            <Text style={styles.emptyProgramsText}>
              Empieza una programación para ver aquí tu próximo entrenamiento.
            </Text>
            <Button
              title="Ver programaciones"
              onPress={() => router.push('/tabs/programs')}
              style={styles.denseButton}
              textStyle={styles.denseButtonText}
            />
          </Card>
        )}

        <View style={styles.block}>
          <Text style={styles.sectionTitle}>Historial reciente</Text>
          {progress.history.length === 0 ? (
            <Card style={styles.denseCard}>
              <Text style={styles.emptyText}>Cuando completes entrenamientos, aparecerán aquí.</Text>
            </Card>
          ) : (
            <View style={styles.historyGrid}>
              {progress.history.map((log) => (
                <Card key={log.id} style={styles.historyCard}>
                  <Text style={styles.historyName} numberOfLines={1}>
                    {log.workoutName}
                  </Text>
                  <Text style={styles.historyMeta} numberOfLines={1}>
                    {log.completedAt} · {log.duration}
                  </Text>
                </Card>
              ))}
            </View>
          )}
        </View>

        <ProgressPhotos dense />
        <TrainerFeedbackCard dense />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  layout: {
    flex: 1,
    gap: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 2,
  },
  block: {
    gap: spacing.xs,
    flexShrink: 1,
  },
  sectionTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  emptyProgramsCard: {
    padding: spacing.sm + 2,
    gap: spacing.xs,
    marginBottom: 0,
  },
  emptyProgramsTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  emptyProgramsText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  denseButton: {
    minHeight: 40,
    marginTop: spacing.xs,
    paddingVertical: spacing.sm,
  },
  denseButtonText: {
    fontSize: 13,
  },
  denseCard: {
    padding: spacing.sm + 2,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  historyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  historyCard: {
    width: '48%',
    flexGrow: 1,
    padding: spacing.sm + 2,
    marginBottom: 0,
  },
  historyName: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  historyMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
});
