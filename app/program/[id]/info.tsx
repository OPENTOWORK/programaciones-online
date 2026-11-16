import { useAthletePreviewMode } from '@/hooks/useAthletePreviewMode';
import { useEmbeddedRouteParams } from '@/hooks/useEmbeddedRouteParams';
import { normalizeRouteParam } from '@/lib/routeParams';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { ProgramInfoContent } from '@/components/program/ProgramInfoContent';
import { HypeCatalogAccessGate } from '@/components/program/HypeCatalogAccessGate';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useProgram } from '@/hooks/usePrograms';
import { useProgramEntitlement } from '@/hooks/usePurchases';
import { canEnterHypeCatalogProgram, isPaidHypeCatalogProgram } from '@/lib/hypeCatalog';
import { canManageTrainerProgram } from '@/lib/programService';

export default function ProgramInfoScreen() {
  const params = useEmbeddedRouteParams<{ id?: string | string[] }>();
  const id = normalizeRouteParam(params.id) ?? '';
  const preview = useAthletePreviewMode();
  const { user, refreshUser } = useAuth();
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

  if (
    isPaidHypeCatalogProgram(program) &&
    !canEnterHypeCatalogProgram(user?.role) &&
    !hasProgramEntitlement(program.id)
  ) {
    return <HypeCatalogAccessGate program={program} />;
  }

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
