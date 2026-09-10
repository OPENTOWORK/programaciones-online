import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ProgramSessionsCalendar } from '@/components/program/ProgramSessionsCalendar';
import { ProgramSessionsGrid } from '@/components/program/ProgramSessionsGrid';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useProgram } from '@/hooks/usePrograms';
import { HypeCatalogAccessGate } from '@/components/program/HypeCatalogAccessGate';
import { canEnterHypeCatalogProgram, isPaidHypeCatalogProgram } from '@/lib/hypeCatalog';
import { canManageTrainerProgram } from '@/lib/programService';
import { isMetconCatalogProgram } from '@/lib/standardVenueCatalog';

export default function ProgramCalendarScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
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

  const canEdit = canManageTrainerProgram(user?.role, program.category, program);
  const useGrid = isMetconCatalogProgram(program);

  if (isPaidHypeCatalogProgram(program) && !canEnterHypeCatalogProgram(user?.role)) {
    return <HypeCatalogAccessGate program={program} />;
  }

  if (useGrid) {
    return (
      <ProgramSessionsGrid
        program={program}
        workouts={workouts}
        isLoading={isLoadingWorkouts}
        canManage={canEdit}
        onWorkoutsChange={reloadWorkouts}
      />
    );
  }

  return (
    <ScreenWrapper scrollable={false} padded={false}>
      <View style={styles.screen}>
        <ProgramSessionsCalendar
          program={program}
          workouts={workouts}
          isLoading={isLoadingWorkouts}
          canManage={canEdit}
          onWorkoutsChange={reloadWorkouts}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  loader: { marginTop: spacing.xl },
  error: { ...typography.body, color: colors.danger, textAlign: 'center' },
});
