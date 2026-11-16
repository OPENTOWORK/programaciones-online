import { useAppNavigation } from '@/hooks/useAppNavigation';
import { StyleSheet, Text, View } from 'react-native';

import { HorizontalPager } from '@/components/program/HorizontalPager';
import { PlanCoverCard } from '@/components/program/PlanCoverCard';
import {
  planBrandActionButtonStyle,
  planBrandActionButtonTextStyle,
} from '@/components/program/planBrandUi';
import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/constants/theme';
import { fontUiBold, fontUiSemibold } from '@/constants/fonts';
import type { AppIconName } from '@/constants/icons';
import { isGymRole, isTrainerRole } from '@/lib/athleteService';
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
  layout?: 'compact' | 'page';
}

export function CategoryTabs({
  plans,
  userRole,
  showSectionLabel = true,
  layout = 'compact',
}: CategoryTabsProps) {
  const router = useAppNavigation();
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

  const isStaff = isTrainerRole(userRole) || isGymRole(userRole);

  const renderPlan = (plan: Plan, cardLayout: 'compact' | 'page' = 'compact') => {
    const icon = PLAN_ICONS[plan.category] ?? 'programs';
    const actionLabel = isServicePlanCategory(plan.category)
      ? isStaff
        ? 'Crear plan'
        : 'Solicitar plan'
      : 'Entrar';
    const page = cardLayout === 'page';

    return (
      <PlanCoverCard
        key={plan.id}
        icon={icon}
        title={plan.label}
        subtitle={getPlanDisplaySubtitle(plan.category, userRole)}
        onPress={() => openPlan(plan.id)}
        layout={cardLayout}
        trailing={
          <Button
            title={actionLabel}
            size="compact"
            variant="outline"
            onPress={() => openPlan(plan.id)}
            style={page ? styles.pageButton : planBrandActionButtonStyle}
            textStyle={{
              ...planBrandActionButtonTextStyle,
              fontFamily: fontUiBold,
              fontWeight: 'normal',
              fontSize: page ? 16 : 14,
              lineHeight: page ? 20 : 18,
            }}
          />
        }
      />
    );
  };

  if (layout === 'page' && !gymSections) {
    return (
      <View style={styles.pagerHost}>
        <HorizontalPager
          items={plans}
          label={(plan) => plan.label}
          renderPage={(plan) => renderPlan(plan, 'page')}
        />
      </View>
    );
  }

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
  pagerHost: {
    flex: 1,
    minHeight: 0,
  },
  pageButton: {
    ...planBrandActionButtonStyle,
    width: '100%',
    alignSelf: 'stretch',
    minHeight: 48,
  },
  list: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontFamily: fontUiSemibold,
    fontWeight: 'normal',
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 14,
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
