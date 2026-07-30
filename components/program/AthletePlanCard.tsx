import { StyleSheet, Text, View } from 'react-native';

import { NutritionPlanContent } from '@/components/program/NutritionPlanContent';
import { PersonalizedPlanContent } from '@/components/program/PersonalizedPlanContent';
import { AppIcon, IconBadge } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors, spacing, typography } from '@/constants/theme';
import type { AppIconName } from '@/constants/icons';
import { openPlanPdf } from '@/lib/openPlanPdf';
import { isStructuredPersonalizedPlanContent } from '@/lib/personalizedPlanContent';
import type { AthletePlan } from '@/lib/types';

const PLAN_ICONS: Record<AthletePlan['planType'], AppIconName> = {
  personalized: 'personal',
  nutrition: 'measure',
};

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

interface AthletePlanCardProps {
  plan: AthletePlan;
}

export function AthletePlanCard({ plan }: AthletePlanCardProps) {
  const hasPdf = Boolean(plan.pdfUrl);
  const hasStructuredNutrition = Boolean(plan.nutritionData && plan.nutritionData.meals.length > 0);
  const hasStructuredPersonalized = Boolean(plan.content && isStructuredPersonalizedPlanContent(plan.content));

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <IconBadge name={PLAN_ICONS[plan.planType]} containerSize={44} size={22} />
        <View style={styles.headerText}>
          <Text style={styles.title}>{plan.title}</Text>
          <Text style={styles.date}>Asignado el {formatDate(plan.createdAt)}</Text>
        </View>
      </View>

      {hasStructuredNutrition ? (
        <View style={styles.structuredWrap}>
          <NutritionPlanContent data={plan.nutritionData!} />
        </View>
      ) : hasStructuredPersonalized ? (
        <View style={styles.structuredWrap}>
          <PersonalizedPlanContent content={plan.content} />
        </View>
      ) : plan.content ? (
        <View style={styles.contentWrap}>
          <AppIcon name="goal" size={16} color={colors.textMuted} />
          <Text style={styles.content}>{plan.content}</Text>
        </View>
      ) : null}

      {hasPdf ? (
        <View style={styles.pdfWrap}>
          <AppIcon name="programs" size={16} color={colors.textMuted} />
          <View style={styles.pdfInfo}>
            <Text style={styles.pdfLabel}>{plan.pdfFileName ?? 'Plan.pdf'}</Text>
            <Button
              title="Ver PDF"
              variant="outline"
              onPress={() => void openPlanPdf(plan.pdfUrl!)}
              style={styles.pdfOpenBtn}
            />
          </View>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  date: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  contentWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  content: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 22,
  },
  structuredWrap: {
    marginBottom: spacing.md,
  },
  pdfWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pdfInfo: {
    flex: 1,
    gap: spacing.sm,
  },
  pdfLabel: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  pdfOpenBtn: {
    alignSelf: 'flex-start',
    minHeight: 44,
    paddingHorizontal: spacing.lg,
  },
});
