import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, Text } from 'react-native';

import { ActiveProgramCard } from '@/components/progress/ActiveProgramCard';
import { MotivationBanner } from '@/components/progress/MotivationBanner';
import { ProgressOverview } from '@/components/progress/ProgressOverview';
import { ProgressPhotos } from '@/components/progress/ProgressPhotos';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, spacing, typography } from '@/constants/theme';
import { useActiveProgram } from '@/hooks/useActiveProgram';
import { useProgress } from '@/hooks/useProgress';

export default function ProgressScreen() {
  const router = useRouter();
  const { progress, refresh } = useProgress();
  const { actives, refresh: refreshActivePrograms } = useActiveProgram();

  useFocusEffect(
    useCallback(() => {
      void refresh();
      void refreshActivePrograms();
    }, [refresh, refreshActivePrograms]),
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
    <ScreenWrapper>
      <Text style={styles.title}>Mi Progreso</Text>
      <MotivationBanner message={progress.motivationalStatus} />

      <ProgressOverview
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
        <>
          <SectionHeader
            title="Programación activa"
            subtitle={`${actives.length} de 3 activas`}
          />
          {actives.map((active) => (
            <ActiveProgramCard key={active.program.id} active={active} />
          ))}
        </>
      ) : (
        <Card style={styles.emptyProgramsCard}>
          <Text style={styles.emptyProgramsTitle}>Sin programación activa</Text>
          <Text style={styles.emptyProgramsText}>
            Empieza una programación para ver aquí tu próximo entrenamiento.
          </Text>
          <Button title="Ver programaciones" onPress={() => router.push('/tabs/programs')} />
        </Card>
      )}

      <SectionHeader title="Historial reciente" />
      {progress.history.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>Cuando completes entrenamientos, aparecerán aquí.</Text>
        </Card>
      ) : (
        progress.history.map((log) => (
          <Card key={log.id} style={styles.historyCard}>
            <Text style={styles.historyName}>{log.workoutName}</Text>
            <Text style={styles.historyMeta}>
              {log.completedAt} · {log.duration}
            </Text>
          </Card>
        ))
      )}

      <ProgressPhotos />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.md },
  emptyProgramsCard: { marginBottom: spacing.lg },
  emptyProgramsTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  emptyProgramsText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  emptyText: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },
  historyCard: { marginBottom: spacing.sm },
  historyName: { ...typography.body, color: colors.text, fontWeight: '600' },
  historyMeta: { ...typography.bodySmall, color: colors.textMuted, marginTop: 4 },
});
