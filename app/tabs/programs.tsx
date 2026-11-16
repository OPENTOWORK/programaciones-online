import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useMemo } from 'react';

import { CategoryTabs } from '@/components/program/CategoryTabs';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { fontUiBold, fontUiRegular } from '@/constants/fonts';
import { colors } from '@/constants/theme';
import { useAthleteCededAccess } from '@/hooks/useAthleteCededAccess';
import { useAthletePreviewMode } from '@/hooks/useAthletePreviewMode';
import { useTrainerMobilePreviewMode } from '@/hooks/useTrainerMobilePreview';
import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { usePrograms } from '@/hooks/usePrograms';
import { isGymRole } from '@/lib/athleteService';
import { usesPhoneProgramPager } from '@/lib/platformAccess';
import { filterPlansForCededAthlete, filterPlansForUserRole } from '@/lib/programService';

export default function ProgramsScreen() {
  const { user } = useAuth();
  const preview = useAthletePreviewMode();
  const trainerPreview = useTrainerMobilePreviewMode();
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

  const pagePlans =
    usesPhoneProgramPager(preview.enabled || trainerPreview.enabled) &&
    !isGymRole(effectiveRole) &&
    !error &&
    visiblePlans.length > 0;

  return (
    <ScreenWrapper scrollable={!pagePlans} style={pagePlans ? styles.fill : undefined}>
      <View style={pagePlans ? styles.stage : undefined}>
        <Text style={styles.title}>Programaciones</Text>
        {isGymRole(effectiveRole) ? null : (
          <Text style={styles.subtitle}>Encuentra tu próximo reto</Text>
        )}

        {isLoading && visiblePlans.length === 0 ? (
          <ActivityIndicator color={colors.accent} style={styles.loader} />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <CategoryTabs
            plans={visiblePlans}
            userRole={effectiveRole}
            layout={pagePlans ? 'page' : 'compact'}
          />
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    minHeight: 0,
  },
  stage: {
    flex: 1,
    minHeight: 0,
  },
  title: {
    fontFamily: fontUiBold,
    fontWeight: 'normal',
    fontSize: 24,
    lineHeight: 30,
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fontUiRegular,
    fontWeight: 'normal',
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  loader: { marginTop: 32 },
  error: {
    fontFamily: fontUiRegular,
    fontWeight: 'normal',
    fontSize: 14,
    lineHeight: 20,
    color: colors.danger,
    marginTop: 16,
  },
});
