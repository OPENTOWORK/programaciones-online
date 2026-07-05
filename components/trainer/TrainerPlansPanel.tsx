import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, spacing, typography } from '@/constants/theme';
import { useTrainerAthletePlans } from '@/hooks/useAthletePlans';
import { ATHLETE_PLAN_TYPE_LABELS, type AthletePlanType } from '@/lib/trainerConstants';
import type { AthletePlan } from '@/lib/types';

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
}

function PlanListItem({ plan }: { plan: AthletePlan }) {
  return (
    <View style={styles.planItem}>
      <Text style={styles.planTitle}>{plan.title}</Text>
      <Text style={styles.planMeta}>
        {plan.athleteName ?? 'Atleta'} · {ATHLETE_PLAN_TYPE_LABELS[plan.planType]} · {formatDate(plan.createdAt)}
      </Text>
    </View>
  );
}

interface TrainerPlansPanelProps {
  activePlanType: AthletePlanType;
}

export function TrainerPlansPanel({ activePlanType }: TrainerPlansPanelProps) {
  const router = useRouter();
  const { plans, isLoading, refresh } = useTrainerAthletePlans(activePlanType);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const createLabel =
    activePlanType === 'nutrition' ? 'Crear plan nutricional' : 'Crear plan personalizado';

  return (
    <Card style={styles.panel}>
      <SectionHeader
        title="Planes para atletas"
        subtitle={`Crea y asigna ${ATHLETE_PLAN_TYPE_LABELS[activePlanType].toLowerCase()}s a tus atletas`}
      />

      <Button
        title={createLabel}
        onPress={() =>
          router.push({
            pathname: '/trainer/plan/create',
            params: { type: activePlanType },
          })
        }
        style={styles.actionButton}
      />

      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : plans.length === 0 ? (
        <Text style={styles.emptyText}>
          Todavía no has creado planes en esta categoría. Usa el botón de arriba para empezar.
        </Text>
      ) : (
        <View style={styles.list}>
          {plans.slice(0, 5).map((plan) => (
            <PlanListItem key={plan.id} plan={plan} />
          ))}
          {plans.length > 5 ? (
            <Text style={styles.moreText}>+ {plans.length - 5} planes más</Text>
          ) : null}
        </View>
      )}

      {!isLoading ? (
        <Button title="Actualizar listado" variant="ghost" onPress={() => void refresh()} style={styles.refreshBtn} />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginTop: spacing.lg,
  },
  actionButton: {
    width: '100%',
    marginBottom: spacing.md,
  },
  loader: {
    marginTop: spacing.sm,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  list: {
    gap: spacing.sm,
  },
  planItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  planTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  planMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  moreText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  refreshBtn: {
    marginTop: spacing.sm,
  },
});
