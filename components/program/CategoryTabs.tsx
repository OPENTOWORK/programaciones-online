import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Card } from '@/components/ui/Card';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import type { AppIconName } from '@/constants/icons';
import type { Plan } from '@/lib/programService';
import type { ProgramCategory } from '@/lib/types';

const PLAN_ICONS: Partial<Record<ProgramCategory, AppIconName>> = {
  personalized: 'personal',
  standard: 'strength',
  hype: 'intense',
  nutrition: 'measure',
  home_training: 'home',
};

interface CategoryTabsProps {
  plans: Plan[];
  activePlanId: string;
  onChange: (planId: string) => void;
}

export function CategoryTabs({ plans, activePlanId, onChange }: CategoryTabsProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>Tipo de plan</Text>
      <View style={styles.list}>
        {plans.map((plan) => {
          const isActive = plan.id === activePlanId;
          const icon = PLAN_ICONS[plan.category] ?? 'programs';

          return (
            <Pressable
              key={plan.id}
              onPress={() => onChange(plan.id)}
              style={({ pressed }) => [
                styles.option,
                isActive && styles.optionActive,
                pressed && !isActive ? styles.optionPressed : null,
              ]}
            >
              <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
                <AppIcon name={icon} size={18} color={isActive ? colors.accent : colors.textMuted} outlined />
              </View>
              <Text style={[styles.optionText, isActive && styles.optionTextActive]} numberOfLines={2}>
                {plan.label}
              </Text>
              <View style={[styles.radio, isActive && styles.radioActive]}>
                {isActive ? <View style={styles.radioDot} /> : null}
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
  optionActive: {
    borderColor: `${colors.accent}88`,
    backgroundColor: `${colors.accent}12`,
  },
  optionPressed: {
    opacity: 0.88,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: `${colors.accent}18`,
  },
  optionText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
    flex: 1,
  },
  optionTextActive: {
    color: colors.text,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: colors.accent,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
});
