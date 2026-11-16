import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import AthletePlanSessionScreen from '@/app/athlete/plan/[id]/session';
import CalendarDayScreen from '@/app/calendar/[date]';
import AthleteIntakeFormScreen from '@/app/profile/intake-form';
import ProgramGroupChatScreen from '@/app/program/[id]/chat';
import ProgramCalendarScreen from '@/app/program/[id]/index';
import ProgramInfoScreen from '@/app/program/[id]/info';
import WorkoutDetailScreen from '@/app/workout/[id]';
import WorkoutTimerScreen from '@/app/timer';
import { PlanCategoryContent } from '@/components/program/PlanCategoryContent';
import { colors, spacing, typography } from '@/constants/theme';
import { EmbeddedRouteParamsProvider } from '@/hooks/useEmbeddedRouteParams';
import { useAthletePreviewMode } from '@/hooks/useAthletePreviewMode';
import { usePrograms } from '@/hooks/usePrograms';
import {
  athletePreviewRouteParams,
  athletePreviewRouteTitle,
  type AthletePreviewRoute,
} from '@/lib/athleteMobilePreviewRoutes';
import { isPlanCategoryAllowedForCededAthlete } from '@/lib/programService';

function PreviewPlanScreen({ planId }: { planId: string }) {
  const { simulateCededAthlete } = useAthletePreviewMode();
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

  if (!plan || plan.category === 'standard') {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>No se encontró este plan.</Text>
      </View>
    );
  }

  if (simulateCededAthlete && !isPlanCategoryAllowedForCededAthlete(plan.category)) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Un atleta cedido solo ve nutrición en esta vista.</Text>
      </View>
    );
  }

  return <PlanCategoryContent planId={planId} plan={plan} />;
}

function PreviewRouteBody({ route }: { route: AthletePreviewRoute }) {
  if (route.name === 'plan') {
    return <PreviewPlanScreen planId={route.params.id} />;
  }

  return (
    <EmbeddedRouteParamsProvider params={athletePreviewRouteParams(route)}>
      {route.name === 'program' ? <ProgramCalendarScreen /> : null}
      {route.name === 'program-info' ? <ProgramInfoScreen /> : null}
      {route.name === 'program-chat' ? <ProgramGroupChatScreen /> : null}
      {route.name === 'workout' ? <WorkoutDetailScreen /> : null}
      {route.name === 'athlete-session' ? <AthletePlanSessionScreen /> : null}
      {route.name === 'calendar' ? <CalendarDayScreen /> : null}
      {route.name === 'intake' ? <AthleteIntakeFormScreen /> : null}
      {route.name === 'timer' ? <WorkoutTimerScreen /> : null}
    </EmbeddedRouteParamsProvider>
  );
}

export function AthleteMobilePreviewStack({
  route,
  onBack,
}: {
  route: AthletePreviewRoute;
  onBack: () => void;
}) {
  const { plans } = usePrograms();
  const planLabel =
    route.name === 'plan' ? plans.find((item) => item.id === route.params.id)?.label : undefined;

  const hideHeader = route.name === 'timer';

  return (
    <View style={styles.stack}>
      {hideHeader ? null : (
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
            {planLabel ?? athletePreviewRouteTitle(route)}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
      )}
      <View style={styles.body}>
        <PreviewRouteBody route={route} />
      </View>
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
