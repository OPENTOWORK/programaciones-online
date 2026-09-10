import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { PlanCoverCard } from '@/components/program/PlanCoverCard';
import {
  planBrandActionButtonStyle,
  planBrandActionButtonTextStyle,
} from '@/components/program/planBrandUi';
import { Button } from '@/components/ui/Button';
import { colors, spacing, typography } from '@/constants/theme';
import type { AppIconName } from '@/constants/icons';
import { isGymRole } from '@/lib/athleteService';
import { getPlanDisplaySubtitle, type Plan } from '@/lib/programService';
import type { ProgramCategory, UserRole } from '@/lib/types';
import { isServicePlanCategory } from '@/lib/trainerConstants';

const PLAN_ICONS: Partial<Record<ProgramCategory, AppIconName>> = {
  personalized: 'personal',
  standard: 'strength',
  hype: 'intense',
  nutrition: 'measure',
  home_training: 'home',
  gym_training: 'phase',
};

const GYM_PLAN_SECTIONS: Array<{ title: string; categories: ProgramCategory[] }> = [
  { title: 'Para tus atletas', categories: ['personalized', 'hype', 'nutrition'] },
  { title: 'Tu gimnasio', categories: ['gym_training'] },
];

interface CategoryTabsProps {
  plans: Plan[];
  userRole?: UserRole;
  showSectionLabel?: boolean;
}

export function CategoryTabs({ plans, userRole, showSectionLabel = true }: CategoryTabsProps) {
  const router = useRouter();
  const gymSections = isGymRole(userRole)
    ? GYM_PLAN_SECTIONS.map((section) => ({
        ...section,
        plans: section.categories
          .map((category) => plans.find((plan) => plan.category === category))
          .filter((plan): plan is Plan => Boolean(plan)),
      })).filter((section) => section.plans.length > 0)
    : null;

  const openPlan = (planId: string) => {
    router.push(`/plan/${planId}`);
  };

  const renderPlan = (plan: Plan) => {
    const icon = PLAN_ICONS[plan.category] ?? 'programs';
    const actionLabel = isServicePlanCategory(plan.category) ? 'Solicitar plan' : 'Entrar';

    return (
      <PlanCoverCard
        key={plan.id}
        icon={icon}
        title={plan.label}
        subtitle={getPlanDisplaySubtitle(plan.category, userRole)}
        onPress={() => openPlan(plan.id)}
        trailing={
          <Button
            title={actionLabel}
            size="compact"
            variant="outline"
            onPress={() => openPlan(plan.id)}
            style={planBrandActionButtonStyle}
            textStyle={planBrandActionButtonTextStyle}
          />
        }
      />
    );
  };

  if (gymSections) {
    return (
      <View style={styles.list}>
        {gymSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.cardTitle}>{section.title}</Text>
            <View style={styles.sectionPlans}>{section.plans.map(renderPlan)}</View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {showSectionLabel ? <Text style={styles.cardTitle}>Tipo de plan</Text> : null}
      {plans.map(renderPlan)}
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
  section: {
    gap: spacing.xs,
  },
  sectionPlans: {
    gap: spacing.sm,
  },
});
