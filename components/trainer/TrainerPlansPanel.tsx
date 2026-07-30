import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, spacing, typography } from '@/constants/theme';
import { useTrainerAthletePlans } from '@/hooks/useAthletePlans';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { getSessionLabel, groupPersonalizedPlans } from '@/lib/personalizedPlanGroups';
import { ATHLETE_PLAN_TYPE_LABELS, type AthletePlanType } from '@/lib/trainerConstants';
import type { AthletePlan } from '@/lib/types';

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
}

function PlanGroupItem({
  title,
  sessions,
  onOpenSession,
}: {
  title: string;
  sessions: AthletePlan[];
  onOpenSession: (planId: string) => void;
}) {
  return (
    <View style={styles.groupItem}>
      <View style={styles.groupHeader}>
        <Text style={styles.planTitle}>{title}</Text>
        <Text style={styles.planMeta}>
          {sessions.length} sesión{sessions.length === 1 ? '' : 'es'}
        </Text>
      </View>
      {sessions.map((session, index) => (
        <Pressable
          key={session.id}
          onPress={() => onOpenSession(session.id)}
          style={({ pressed }) => [styles.sessionItem, pressed && styles.planItemPressed]}
        >
          <Text style={styles.sessionTitle}>{getSessionLabel(session, index)}</Text>
          <Text style={styles.planChevron}>›</Text>
        </Pressable>
      ))}
    </View>
  );
}

interface TrainerPlansPanelProps {
  activePlanType: AthletePlanType;
}

export function TrainerPlansPanel({ activePlanType }: TrainerPlansPanelProps) {
  const router = useRouter();
  const { plans, isLoading, refresh } = useTrainerAthletePlans(activePlanType);

  useFocusRefresh(() => refresh());

  const groupedPlans = useMemo(() => {
    if (activePlanType !== 'personalized') return [];
    return groupPersonalizedPlans(plans);
  }, [activePlanType, plans]);

  const nutritionPlans = useMemo(
    () => (activePlanType === 'nutrition' ? plans : []),
    [activePlanType, plans],
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
      ) : activePlanType === 'personalized' ? (
        groupedPlans.length === 0 ? (
          <Text style={styles.emptyText}>
            Todavía no has creado planes en esta categoría. Usa el botón de arriba para empezar.
          </Text>
        ) : (
          <View style={styles.list}>
            {groupedPlans.slice(0, 5).map((group) => (
              <PlanGroupItem
                key={group.id}
                title={group.title}
                sessions={group.sessions}
                onOpenSession={(planId) =>
                  router.push({ pathname: '/trainer/plan/[id]', params: { id: planId } })
                }
              />
            ))}
            {groupedPlans.length > 5 ? (
              <Text style={styles.moreText}>+ {groupedPlans.length - 5} planes más</Text>
            ) : null}
          </View>
        )
      ) : plans.length === 0 ? (
        <Text style={styles.emptyText}>
          Todavía no has creado planes en esta categoría. Usa el botón de arriba para empezar.
        </Text>
      ) : (
        <View style={styles.list}>
          {nutritionPlans.slice(0, 5).map((plan) => (
            <Pressable
              key={plan.id}
              onPress={() => router.push({ pathname: '/trainer/plan/[id]', params: { id: plan.id } })}
              style={({ pressed }) => [styles.planItem, pressed && styles.planItemPressed]}
            >
              <View style={styles.planItemText}>
                <Text style={styles.planTitle}>{plan.title}</Text>
                <Text style={styles.planMeta}>
                  {plan.athleteName ?? 'Atleta'} · {ATHLETE_PLAN_TYPE_LABELS[plan.planType]} ·{' '}
                  {formatDate(plan.createdAt)}
                </Text>
              </View>
              <Text style={styles.planChevron}>›</Text>
            </Pressable>
          ))}
          {nutritionPlans.length > 5 ? (
            <Text style={styles.moreText}>+ {nutritionPlans.length - 5} planes más</Text>
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
  groupItem: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  groupHeader: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: `${colors.surfaceLight}88`,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sessionTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
  },
  planItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  planItemPressed: {
    opacity: 0.7,
  },
  planItemText: {
    flex: 1,
  },
  planChevron: {
    ...typography.h3,
    color: colors.textMuted,
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
