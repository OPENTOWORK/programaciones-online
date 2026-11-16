import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ProgramSessionsCalendar } from '@/components/program/ProgramSessionsCalendar';
import { ProgramSessionsGrid } from '@/components/program/ProgramSessionsGrid';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, spacing, typography } from '@/constants/theme';
import { useAthletePreviewMode } from '@/hooks/useAthletePreviewMode';
import { useAuth } from '@/hooks/useAuth';
import { useEmbeddedRouteParams } from '@/hooks/useEmbeddedRouteParams';
import { useProgram } from '@/hooks/usePrograms';
import { useProgramEntitlement } from '@/hooks/usePurchases';
import { normalizeRouteParam } from '@/lib/routeParams';
import { HypeCatalogAccessGate } from '@/components/program/HypeCatalogAccessGate';
import { canEnterHypeCatalogProgram, isPaidHypeCatalogProgram } from '@/lib/hypeCatalog';
import { canManageTrainerProgram } from '@/lib/programService';
import { isMetconCatalogProgram } from '@/lib/standardVenueCatalog';

export default function ProgramCalendarScreen() {
  const params = useEmbeddedRouteParams<{ id?: string | string[]; sample?: string | string[] }>();
  const id = normalizeRouteParam(params.id) ?? '';
  const sampleWeekOnly = normalizeRouteParam(params.sample) === '1';
  const preview = useAthletePreviewMode();
  const { user } = useAuth();
  const { program, workouts, isLoading, isLoadingWorkouts, reloadWorkouts } = useProgram(id);
  const hasProgramEntitlement = useProgramEntitlement();

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

  const canEdit = !preview.enabled && canManageTrainerProgram(user?.role, program.category, program);
  const useGrid = isMetconCatalogProgram(program);

  if (
    !sampleWeekOnly &&
    isPaidHypeCatalogProgram(program) &&
    !canEnterHypeCatalogProgram(user?.role) &&
    !hasProgramEntitlement(program.id)
  ) {
    return <HypeCatalogAccessGate program={program} />;
  }

  if (useGrid && !sampleWeekOnly) {
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
          canManage={canEdit && !sampleWeekOnly}
          sampleWeekOnly={sampleWeekOnly}
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
