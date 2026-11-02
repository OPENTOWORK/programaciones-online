import { ActivityIndicator, Platform, StyleSheet, Text } from 'react-native';
import { useMemo } from 'react';

import { CategoryTabs } from '@/components/program/CategoryTabs';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, typography } from '@/constants/theme';
import { useAthleteCededAccess } from '@/hooks/useAthleteCededAccess';
import { useAthletePreviewMode } from '@/hooks/useAthletePreviewMode';
import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { usePrograms } from '@/hooks/usePrograms';
import { isGymRole } from '@/lib/athleteService';
import { filterPlansForCededAthlete, filterPlansForUserRole } from '@/lib/programService';

export default function ProgramsScreen() {
  const { user } = useAuth();
  const preview = useAthletePreviewMode();
  const effectiveRole = preview.enabled ? 'atleta' : user?.role;
  const { isCeded: isCededAthlete } = useAthleteCededAccess();
  const { plans, isLoading, error, refresh } = usePrograms();
  const visiblePlans = useMemo(() => {
    const roleFiltered = filterPlansForUserRole(plans, effectiveRole);
    if (isCededAthlete && effectiveRole === 'atleta') {
      return filterPlansForCededAthlete(roleFiltered);
    }
    return roleFiltered;
  }, [plans, effectiveRole, isCededAthlete]);

  useFocusRefresh(() => refresh());

  return (
    <ScreenWrapper>
      <Text style={styles.title}>Programaciones</Text>
      {isGymRole(user?.role) ? null : <SectionHeader title="Elige tu plan" />}

      {isLoading && visiblePlans.length === 0 ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <CategoryTabs plans={visiblePlans} userRole={effectiveRole} />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: {
    ...(Platform.OS === 'web' ? typography.h1 : typography.h2),
    color: colors.text,
    marginBottom: 4,
  },
  loader: { marginTop: 32 },
  error: { ...typography.bodySmall, color: colors.danger, marginTop: 16 },
});
