import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/constants/theme';
import { getSessionLabel, type PersonalizedPlanGroup } from '@/lib/personalizedPlanGroups';
import { ATHLETE_PLAN_TYPE_LABELS } from '@/lib/trainerConstants';
import type { AthletePlan } from '@/lib/types';

interface AssignedPlansListProps {
  personalizedGroups: PersonalizedPlanGroup[];
  nutritionPlans: AthletePlan[];
  onOpenSession: (planId: string) => void;
  onOpenNutritionPlan: (planId: string) => void;
  onEditGroup?: (group: PersonalizedPlanGroup) => void;
  onDeleteSession?: (planId: string, label: string) => void;
  onDeleteGroup?: (group: PersonalizedPlanGroup) => void;
  onEditNutritionPlan?: (planId: string) => void;
  onDeleteNutritionPlan?: (planId: string, title: string) => void;
}

function PlanActionButton({
  icon,
  label,
  onPress,
  danger = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
    >
      <Ionicons name={icon} size={18} color={danger ? colors.danger : colors.textSecondary} />
    </Pressable>
  );
}

export function AssignedPlansList({
  personalizedGroups,
  nutritionPlans,
  onOpenSession,
  onOpenNutritionPlan,
  onEditGroup,
  onDeleteSession,
  onDeleteGroup,
  onEditNutritionPlan,
  onDeleteNutritionPlan,
}: AssignedPlansListProps) {
  return (
    <View style={styles.wrap}>
      {personalizedGroups.map((group) => (
        <View key={group.id} style={styles.group}>
          <View style={styles.groupHeader}>
            <View style={styles.groupHeaderText}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              <Text style={styles.groupMeta}>
                Plan personalizado · {group.sessions.length} sesión{group.sessions.length === 1 ? '' : 'es'}
              </Text>
            </View>
            <View style={styles.groupHeaderActions}>
              {onEditGroup ? (
                <PlanActionButton
                  icon="create-outline"
                  label={`Editar plan ${group.title}`}
                  onPress={() => onEditGroup(group)}
                />
              ) : null}
              {onDeleteGroup ? (
                <PlanActionButton
                  icon="trash-outline"
                  label={`Eliminar plan ${group.title}`}
                  onPress={() => onDeleteGroup(group)}
                  danger
                />
              ) : null}
            </View>
          </View>

          {group.sessions.map((session, index) => {
            const sessionLabel = getSessionLabel(session, index);
            return (
              <View key={session.id} style={styles.sessionRow}>
                <Pressable
                  onPress={() => onOpenSession(session.id)}
                  style={({ pressed }) => [styles.sessionMain, pressed && styles.rowPressed]}
                >
                  <View style={styles.sessionText}>
                    <Text style={styles.sessionTitle}>{sessionLabel}</Text>
                    <Text style={styles.sessionMeta}>{ATHLETE_PLAN_TYPE_LABELS.personalized}</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </Pressable>
                <View style={styles.rowActions}>
                  {onDeleteSession ? (
                    <PlanActionButton
                      icon="trash-outline"
                      label={`Eliminar ${sessionLabel}`}
                      onPress={() => onDeleteSession(session.id, sessionLabel)}
                      danger
                    />
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      ))}

      {nutritionPlans.map((plan) => (
        <View key={plan.id} style={styles.nutritionRow}>
          <Pressable
            onPress={() => onOpenNutritionPlan(plan.id)}
            style={({ pressed }) => [styles.sessionMain, pressed && styles.rowPressed]}
          >
            <View style={styles.sessionText}>
              <Text style={styles.groupTitle}>{plan.title}</Text>
              <Text style={styles.groupMeta}>{ATHLETE_PLAN_TYPE_LABELS.nutrition}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
          <View style={styles.rowActions}>
            {onEditNutritionPlan ? (
              <PlanActionButton
                icon="create-outline"
                label={`Editar ${plan.title}`}
                onPress={() => onEditNutritionPlan(plan.id)}
              />
            ) : null}
            {onDeleteNutritionPlan ? (
              <PlanActionButton
                icon="trash-outline"
                label={`Eliminar ${plan.title}`}
                onPress={() => onDeleteNutritionPlan(plan.id, plan.title)}
                danger
              />
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  group: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: `${colors.surfaceLight}88`,
  },
  groupHeaderText: {
    flex: 1,
  },
  groupHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  groupTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  groupMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  nutritionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  sessionMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 0,
  },
  rowPressed: {
    opacity: 0.7,
  },
  sessionText: {
    flex: 1,
    minWidth: 0,
  },
  sessionTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  sessionMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  chevron: {
    ...typography.h3,
    color: colors.textMuted,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.xs,
    gap: 2,
  },
  actionBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  actionBtnPressed: {
    backgroundColor: `${colors.textMuted}18`,
  },
});
