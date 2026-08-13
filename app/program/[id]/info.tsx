import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { ProgramInfoContent } from '@/components/program/ProgramInfoContent';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useProgram } from '@/hooks/usePrograms';
import { isTrainerRole } from '@/lib/athleteService';
import { isTrainerEditableCategory } from '@/lib/programService';

export default function ProgramInfoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, refreshUser } = useAuth();
  const { program, workouts, isLoading, isLoadingWorkouts, reloadWorkouts } = useProgram(id ?? '');

  if (isLoading && !program) {
    return (
      <ScreenWrapper scrollable={false}>
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      </ScreenWrapper>
    );
  }

  if (!program) {
    return (
      <ScreenWrapper>
        <Text style={styles.error}>Programación no encontrada</Text>
      </ScreenWrapper>
    );
  }

  const canEdit = isTrainerRole(user?.role) && isTrainerEditableCategory(program.category);

  return (
    <ScreenWrapper>
      <ProgramInfoContent
        program={program}
        workouts={workouts}
        isLoadingWorkouts={isLoadingWorkouts}
        user={user}
        canEdit={canEdit}
        onRefreshWorkouts={() => void reloadWorkouts()}
        onUserRefresh={refreshUser}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: spacing.xl },
  error: { ...typography.body, color: colors.danger, textAlign: 'center' },
});
