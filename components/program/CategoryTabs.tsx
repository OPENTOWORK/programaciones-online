import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Card } from '@/components/ui/Card';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import type { AppIconName } from '@/constants/icons';
import { useAthleteIntakeForm } from '@/hooks/useAthleteIntakeForm';
import { useMyAthletePlans } from '@/hooks/useAthletePlans';
import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { isTrainerRole } from '@/lib/athleteService';
import { queueChatPrefill } from '@/lib/chatPrefill';
import type { Plan } from '@/lib/programService';
import type { ProgramCategory } from '@/lib/types';
import {
  isServicePlanCategory,
  SERVICE_PLAN_CONTENT,
} from '@/lib/trainerConstants';

const PLAN_ICONS: Partial<Record<ProgramCategory, AppIconName>> = {
  personalized: 'personal',
  standard: 'strength',
  hype: 'intense',
  nutrition: 'measure',
  home_training: 'home',
  gym_training: 'phase',
};

const REQUEST_GREEN = '#22C55E';

interface CategoryTabsProps {
  plans: Plan[];
}

export function CategoryTabs({ plans }: CategoryTabsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const isTrainer = isTrainerRole(user?.role);
  const { isComplete: intakeComplete, isLoading: intakeLoading } = useAthleteIntakeForm();
  const { plans: personalizedPlans, refresh: refreshPersonalizedPlans } =
    useMyAthletePlans(isTrainer ? undefined : 'personalized');

  useFocusRefresh(() => {
    if (!isTrainer) {
      void refreshPersonalizedPlans();
    }
  });

  const hasPersonalizedPlan = useMemo(
    () => !isTrainer && personalizedPlans.some((plan) => plan.planType === 'personalized'),
    [isTrainer, personalizedPlans],
  );

  const openRequest = (category: ProgramCategory) => {
    if (!isServicePlanCategory(category)) return;

    const prefill = SERVICE_PLAN_CONTENT[category].prefill;
    queueChatPrefill(prefill);

    if (!isTrainer && !intakeLoading && !intakeComplete) {
      router.push({
        pathname: '/profile/intake-form',
        params: { returnTo: 'trainer' },
      });
      return;
    }

    router.push({
      pathname: '/tabs/trainer',
      params: { prefill },
    });
  };

  const openPlan = (planId: string) => {
    router.push(`/plan/${planId}`);
  };

  const openHomeCalendar = () => {
    router.push({
      pathname: '/tabs/home',
      params: { focus: 'calendar' },
    });
  };

  return (
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>Tipo de plan</Text>
      <View style={styles.list}>
        {plans.map((plan) => {
          const icon = PLAN_ICONS[plan.category] ?? 'programs';
          const showRequest = isServicePlanCategory(plan.category);
          const showViewProgramming =
            plan.category === 'personalized' && hasPersonalizedPlan;
          const actionLabel = showViewProgramming ? 'Ver programación' : 'Solicitar';

          return (
            <Pressable
              key={plan.id}
              onPress={() => openPlan(plan.id)}
              style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
            >
              <View style={styles.iconWrap}>
                <AppIcon name={icon} size={18} color={colors.textMuted} outlined />
              </View>
              <Text style={styles.optionText} numberOfLines={2}>
                {plan.label}
              </Text>
              {showRequest ? (
                <Pressable
                  onPress={(event) => {
                    event.stopPropagation?.();
                    if (showViewProgramming) {
                      openHomeCalendar();
                      return;
                    }
                    openRequest(plan.category);
                  }}
                  style={({ pressed }) => [
                    styles.requestBtn,
                    pressed && styles.requestBtnPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${actionLabel} ${plan.label}`}
                >
                  <Text style={styles.requestBtnText}>{actionLabel}</Text>
                </Pressable>
              ) : null}
              <View style={styles.radio}>
                <Text style={styles.chevron}>›</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  cardTitle: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  list: {
    gap: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
  },
  optionPressed: {
    opacity: 0.88,
    borderColor: `${colors.accent}55`,
    backgroundColor: `${colors.accent}08`,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
  },
  requestBtn: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    backgroundColor: REQUEST_GREEN,
    flexShrink: 0,
  },
  requestBtnPressed: {
    opacity: 0.88,
  },
  requestBtnText: {
    ...typography.caption,
    color: colors.black,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  radio: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 22,
    lineHeight: 22,
    fontWeight: '600',
  },
});
