import { useRouter } from 'expo-router';
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
  gym_training: 'phase',
};

interface CategoryTabsProps {
  plans: Plan[];
}

export function CategoryTabs({ plans }: CategoryTabsProps) {
  const router = useRouter();

  return (
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>Tipo de plan</Text>
      <View style={styles.list}>
        {plans.map((plan) => {
          const icon = PLAN_ICONS[plan.category] ?? 'programs';

          return (
            <Pressable
              key={plan.id}
              onPress={() => router.push(`/plan/${plan.id}`)}
              style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
            >
              <View style={styles.iconWrap}>
                <AppIcon name={icon} size={18} color={colors.textMuted} outlined />
              </View>
              <Text style={styles.optionText} numberOfLines={2}>
                {plan.label}
              </Text>
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
