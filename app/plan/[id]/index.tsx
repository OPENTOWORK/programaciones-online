import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { PlanCategoryContent } from '@/components/program/PlanCategoryContent';
import { StandardVenueTabs } from '@/components/program/StandardVenueTabs';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, typography } from '@/constants/theme';
import { usePrograms } from '@/hooks/usePrograms';
import { normalizeRouteParam } from '@/lib/routeParams';
import { isStandardVenueId, type StandardVenueId } from '@/lib/standardVenues';

function resolveVenueParam(value?: string): StandardVenueId {
  return isStandardVenueId(value) ? value : 'gym';
}

export default function PlanCategoryScreen() {
  const params = useLocalSearchParams<{ id?: string | string[]; venue?: string | string[] }>();
  const planId = normalizeRouteParam(params.id) ?? '';
  const venueParam = normalizeRouteParam(params.venue);
  const { plans, isLoading, error } = usePrograms();
  const plan = plans.find((item) => item.id === planId);
  const [selectedVenue, setSelectedVenue] = useState<StandardVenueId>(() => resolveVenueParam(venueParam));

  useEffect(() => {
    if (isStandardVenueId(venueParam)) {
      setSelectedVenue(venueParam);
    }
  }, [venueParam]);

  if (isLoading && plans.length === 0) {
    return (
      <ScreenWrapper scrollable={false}>
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper>
        <Text style={styles.error}>{error}</Text>
      </ScreenWrapper>
    );
  }

  if (!plan) {
    return (
      <ScreenWrapper>
        <Text style={styles.error}>Tipo de plan no encontrado</Text>
      </ScreenWrapper>
    );
  }

  const isStandardPlan = plan.category === 'standard';

  return (
    <>
      <Stack.Screen options={{ title: plan.label }} />
      <ScreenWrapper>
        {isStandardPlan ? (
          <>
            <StandardVenueTabs value={selectedVenue} onChange={setSelectedVenue} />
            <PlanCategoryContent planId={planId} plan={plan} standardVenue={selectedVenue} />
          </>
        ) : (
          <PlanCategoryContent planId={planId} plan={plan} />
        )}
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: 32 },
  error: { ...typography.bodySmall, color: colors.danger },
});
