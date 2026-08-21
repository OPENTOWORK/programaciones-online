import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { PlanCoverCard } from '@/components/program/PlanCoverCard';
import { Button } from '@/components/ui/Button';
import { colors, spacing, typography } from '@/constants/theme';
import type { AppIconName } from '@/constants/icons';
import { PLAN_COVERS } from '@/lib/planCovers';
import { PLAN_DISPLAY_SUBTITLES, type Plan } from '@/lib/programService';
import type { ProgramCategory } from '@/lib/types';
import { isServicePlanCategory } from '@/lib/trainerConstants';

const PLAN_ICONS: Partial<Record<ProgramCategory, AppIconName>> = {
  personalized: 'personal',
  standard: 'strength',
  hype: 'intense',
  nutrition: 'measure',
  home_training: 'home',
  gym_training: 'phase',
};

interface CategoryTabsProps {
  plans: Plan[];
}

export function CategoryTabs({ plans }: CategoryTabsProps) {
  const router = useRouter();

  const openPlan = (planId: string) => {
    router.push(`/plan/${planId}`);
  };

  return (
    <View style={styles.list}>
      <Text style={styles.cardTitle}>Tipo de plan</Text>
      {plans.map((plan) => {
        const icon = PLAN_ICONS[plan.category] ?? 'programs';
        const actionLabel = isServicePlanCategory(plan.category) ? 'Solicitar plan' : 'Entrar';

        return (
          <PlanCoverCard
            key={plan.id}
            source={PLAN_COVERS[plan.category]}
            icon={icon}
            title={plan.label}
            subtitle={PLAN_DISPLAY_SUBTITLES[plan.category]}
            onPress={() => openPlan(plan.id)}
            trailing={
              <Button
                title={actionLabel}
                size="compact"
                variant={isServicePlanCategory(plan.category) ? 'success' : 'primary'}
                onPress={() => openPlan(plan.id)}
              />
            }
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
});
