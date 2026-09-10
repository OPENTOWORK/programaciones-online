import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { PlanCategoryContent } from '@/components/program/PlanCategoryContent';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, typography } from '@/constants/theme';
import { usePrograms } from '@/hooks/usePrograms';
import { normalizeRouteParam } from '@/lib/routeParams';

export default function PlanCategoryScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const planId = normalizeRouteParam(params.id) ?? '';
  const { plans, isLoading, error } = usePrograms();
  const plan = plans.find((item) => item.id === planId);

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

  if (!plan || plan.category === 'standard') {
    return <Redirect href="/tabs/programs" />;
  }

  return (
    <>
      <Stack.Screen options={{ title: plan.label }} />
      <ScreenWrapper>
        <PlanCategoryContent planId={planId} plan={plan} />
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: 32 },
  error: { ...typography.bodySmall, color: colors.danger },
});
