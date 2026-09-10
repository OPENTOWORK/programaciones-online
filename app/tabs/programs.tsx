import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useMemo } from 'react';

import { CategoryTabs } from '@/components/program/CategoryTabs';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { usePrograms } from '@/hooks/usePrograms';
import { isGymRole } from '@/lib/athleteService';
import { filterPlansForUserRole } from '@/lib/programService';

export default function ProgramsScreen() {
  const { user } = useAuth();
  const { plans, isLoading, error, refresh } = usePrograms();
  const visiblePlans = useMemo(
    () => filterPlansForUserRole(plans, user?.role),
    [plans, user?.role],
  );

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
        <CategoryTabs plans={visiblePlans} userRole={user?.role} />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: colors.text, marginBottom: 4 },
  loader: { marginTop: 32 },
  error: { ...typography.bodySmall, color: colors.danger, marginTop: 16 },
});
