import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import TrainerAthleteScreen from '@/app/trainer/athlete/[id]';
import CreateTrainerPlanScreen from '@/app/trainer/plan/create';
import TrainerPlanScreen from '@/app/trainer/plan/[id]';
import { PlanCategoryContent } from '@/components/program/PlanCategoryContent';
import { colors, spacing, typography } from '@/constants/theme';
import { EmbeddedRouteParamsProvider } from '@/hooks/useEmbeddedRouteParams';
import { usePrograms } from '@/hooks/usePrograms';
import {
  previewRouteTitle,
  type TrainerPreviewRoute,
} from '@/lib/trainerMobilePreviewRoutes';

function PreviewPlanCategoryScreen({ planId }: { planId: string }) {
  const { plans, isLoading, error } = usePrograms();
  const plan = plans.find((item) => item.id === planId);

  if (isLoading && plans.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>No se encontró este plan.</Text>
      </View>
    );
  }

  return <PlanCategoryContent planId={planId} plan={plan} />;
}

function renderPreviewRoute(route: TrainerPreviewRoute) {
  switch (route.name) {
    case 'plan-category':
      return <PreviewPlanCategoryScreen planId={route.planId} />;
    case 'trainer-plan-create':
      return (
        <EmbeddedRouteParamsProvider params={{ type: route.type }}>
          <CreateTrainerPlanScreen />
        </EmbeddedRouteParamsProvider>
      );
    case 'trainer-plan':
      return (
        <EmbeddedRouteParamsProvider params={{ id: route.id, edit: route.edit }}>
          <TrainerPlanScreen />
        </EmbeddedRouteParamsProvider>
      );
    case 'trainer-athlete':
      return (
        <EmbeddedRouteParamsProvider params={{ id: route.id }}>
          <TrainerAthleteScreen />
        </EmbeddedRouteParamsProvider>
      );
    default:
      return null;
  }
}

export function TrainerMobilePreviewStack({
  route,
  onBack,
}: {
  route: TrainerPreviewRoute;
  onBack: () => void;
}) {
  const { plans } = usePrograms();
  const planLabel =
    route.name === 'plan-category'
      ? plans.find((item) => item.id === route.planId)?.label
      : undefined;

  return (
    <View style={styles.stack}>
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          hitSlop={8}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {planLabel ?? previewRouteTitle(route)}
        </Text>
        <View style={styles.headerSpacer} />
      </View>
      <View style={styles.body}>{renderPreviewRoute(route)}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    flex: 1,
    minHeight: 0,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  headerTitle: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 36,
  },
  body: {
    flex: 1,
    minHeight: 0,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  error: {
    ...typography.bodySmall,
    color: colors.danger,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});
