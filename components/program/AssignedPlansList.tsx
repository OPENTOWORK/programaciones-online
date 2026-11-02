import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography, withAlpha } from '@/constants/theme';
import { getSessionLabel, type PersonalizedPlanGroup } from '@/lib/personalizedPlanGroups';
import { isPlanValidityEnded, type PlanValidity } from '@/lib/planValidity';
import { ATHLETE_PLAN_TYPE_LABELS } from '@/lib/trainerConstants';
import type { AthletePlan } from '@/lib/types';
import { planGroupUsesOnceRecurrence } from '@/lib/planGroupRecurrence';
import { PlanGroupValidityFields } from '@/components/program/PlanGroupValidityFields';

interface AssignedPlansListProps {
  personalizedGroups: PersonalizedPlanGroup[];
  nutritionPlans: AthletePlan[];
  onOpenSession: (planId: string) => void;
  onOpenNutritionPlan: (planId: string) => void;
  onViewGroupCalendar?: (group: PersonalizedPlanGroup) => void;
  onOpenPrivateNotes?: (group: PersonalizedPlanGroup) => void;
  planPrivateNotesCounts?: Record<string, number>;
  onEditGroup?: (group: PersonalizedPlanGroup) => void;
  onUpdateGroupValidity?: (group: PersonalizedPlanGroup, validity: PlanValidity) => void | Promise<void>;
  onRepeatGroupWeekly?: (group: PersonalizedPlanGroup) => void | Promise<void>;
  onDeleteSession?: (planId: string, label: string) => void;
  onDeleteGroup?: (group: PersonalizedPlanGroup) => void;
  onEditNutritionPlan?: (planId: string) => void;
  onDeleteNutritionPlan?: (planId: string, title: string) => void;
}

function PlanStatusBadge({ active }: { active: boolean }) {
  return (
    <View
      style={[styles.statusBadge, active ? styles.statusBadgeActive : styles.statusBadgeExpired]}
      accessibilityLabel={active ? 'Plan activo' : 'Plan caducado'}
    >
      <Text
        style={[
          styles.statusBadgeText,
          active ? styles.statusBadgeTextActive : styles.statusBadgeTextExpired,
        ]}
      >
        {active ? 'Activo' : 'Caducado'}
      </Text>
    </View>
  );
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

function PlanGroupCard({
  group,
  onOpenSession,
  onViewGroupCalendar,
  onOpenPrivateNotes,
  planPrivateNotesCounts,
  onEditGroup,
  onUpdateGroupValidity,
  onRepeatGroupWeekly,
  onDeleteSession,
  onDeleteGroup,
  defaultExpanded = false,
}: {
  group: PersonalizedPlanGroup;
  onOpenSession: (planId: string) => void;
  onViewGroupCalendar?: (group: PersonalizedPlanGroup) => void;
  onOpenPrivateNotes?: (group: PersonalizedPlanGroup) => void;
  planPrivateNotesCounts?: Record<string, number>;
  onEditGroup?: (group: PersonalizedPlanGroup) => void;
  onUpdateGroupValidity?: (group: PersonalizedPlanGroup, validity: PlanValidity) => void | Promise<void>;
  onRepeatGroupWeekly?: (group: PersonalizedPlanGroup) => void | Promise<void>;
  onDeleteSession?: (planId: string, label: string) => void;
  onDeleteGroup?: (group: PersonalizedPlanGroup) => void;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const ended = isPlanValidityEnded(group.validity);
  const noteCount = planPrivateNotesCounts?.[group.id] ?? 0;
  const hasPrivateNotes = noteCount > 0;

  return (
    <View style={styles.group}>
      <View style={[styles.groupHeader, expanded && styles.groupHeaderExpanded]}>
        <View style={styles.groupHeaderTop}>
          <View style={styles.groupHeaderBody}>
            <Pressable
              onPress={() => setExpanded((current) => !current)}
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              accessibilityLabel={expanded ? `Contraer ${group.title}` : `Desplegar ${group.title}`}
              style={({ pressed }) => [styles.groupHeaderText, pressed && styles.rowPressed]}
            >
              <Text style={styles.groupTitle}>{group.title}</Text>
              <Text style={styles.groupMeta}>
                Plan personalizado · {group.sessions.length} sesión{group.sessions.length === 1 ? '' : 'es'}
              </Text>
            </Pressable>

            {onUpdateGroupValidity ? (
              <PlanGroupValidityFields
                variant="inline"
                value={group.validity}
                onCommit={(validity) => void onUpdateGroupValidity(group, validity)}
              />
            ) : null}

            <View style={styles.groupHeaderActions}>
              {onOpenPrivateNotes ? (
                <Pressable
                  onPress={() => onOpenPrivateNotes(group)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    hasPrivateNotes
                      ? `Apuntes privados de ${group.title}, ${noteCount} apuntes`
                      : `Ver apuntes de ${group.title}`
                  }
                  style={({ pressed }) => [
                    styles.privateNotesBtn,
                    !hasPrivateNotes && styles.privateNotesBtnMuted,
                    pressed && styles.privateNotesBtnPressed,
                  ]}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={15}
                    color={hasPrivateNotes ? colors.accentBlue : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.privateNotesBtnText,
                      !hasPrivateNotes && styles.privateNotesBtnTextMuted,
                    ]}
                  >
                    Apuntes
                  </Text>
                  {hasPrivateNotes ? (
                    <View style={styles.privateNotesCount}>
                      <Text style={styles.privateNotesCountText}>{noteCount}</Text>
                    </View>
                  ) : null}
                </Pressable>
              ) : null}
              {onViewGroupCalendar ? (
                <Pressable
                  onPress={() => onViewGroupCalendar(group)}
                  accessibilityLabel={`Ver sesiones de ${group.title}`}
                  style={({ pressed }) => [styles.viewPlanBtn, pressed && styles.viewPlanBtnPressed]}
                >
                  <Ionicons name="list-outline" size={15} color={colors.accent} />
                  <Text style={styles.viewPlanText}>Ver plan</Text>
                </Pressable>
              ) : null}
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
              <PlanStatusBadge active={!ended} />
            </View>
          </View>

          <Pressable
            onPress={() => setExpanded((current) => !current)}
            accessibilityRole="button"
            accessibilityLabel={expanded ? `Contraer ${group.title}` : `Desplegar ${group.title}`}
            hitSlop={8}
            style={({ pressed }) => [styles.expandBtnTrailing, pressed && styles.actionBtnPressed]}
          >
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
        </View>
      </View>

      {expanded ? (
        <>
          {onRepeatGroupWeekly && planGroupUsesOnceRecurrence(group.sessions) ? (
            <View style={styles.recurrenceNotice}>
              <Text style={styles.recurrenceNoticeText}>
                Las sesiones están como «una sola vez»: solo aparecen en su semana inicial. La vigencia no
                las repite cada semana.
              </Text>
              <Pressable
                onPress={() => onRepeatGroupWeekly(group)}
                style={({ pressed }) => [styles.repeatWeeklyBtn, pressed && styles.repeatWeeklyBtnPressed]}
              >
                <Text style={styles.repeatWeeklyBtnText}>Repetir cada semana</Text>
              </Pressable>
            </View>
          ) : null}

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
        </>
      ) : null}
    </View>
  );
}

export function AssignedPlansList({
  personalizedGroups,
  nutritionPlans,
  onOpenSession,
  onOpenNutritionPlan,
  onViewGroupCalendar,
  onOpenPrivateNotes,
  planPrivateNotesCounts,
  onEditGroup,
  onUpdateGroupValidity,
  onRepeatGroupWeekly,
  onDeleteSession,
  onDeleteGroup,
  onEditNutritionPlan,
  onDeleteNutritionPlan,
}: AssignedPlansListProps) {
  return (
    <View style={styles.wrap}>
      {personalizedGroups.map((group) => (
        <PlanGroupCard
          key={group.id}
          group={group}
          onOpenSession={onOpenSession}
          onViewGroupCalendar={onViewGroupCalendar}
          onOpenPrivateNotes={onOpenPrivateNotes}
          planPrivateNotesCounts={planPrivateNotesCounts}
          onEditGroup={onEditGroup}
          onUpdateGroupValidity={onUpdateGroupValidity}
          onRepeatGroupWeekly={onRepeatGroupWeekly}
          onDeleteSession={onDeleteSession}
          onDeleteGroup={onDeleteGroup}
        />
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
    backgroundColor: withAlpha(colors.surfaceLight, '88'),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  groupHeaderExpanded: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  groupHeaderTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  groupHeaderBody: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  groupHeaderText: {
    flexShrink: 0,
    minWidth: 140,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  expandBtnTrailing: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginTop: 2,
    flexShrink: 0,
    alignSelf: 'flex-start',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  groupHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
  },
  statusBadge: {
    marginLeft: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusBadgeActive: {
    backgroundColor: withAlpha(colors.success, '1A'),
    borderColor: withAlpha(colors.success, '66'),
  },
  statusBadgeExpired: {
    backgroundColor: withAlpha(colors.danger, '14'),
    borderColor: withAlpha(colors.danger, '55'),
  },
  statusBadgeText: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.2,
  },
  statusBadgeTextActive: {
    color: colors.success,
  },
  statusBadgeTextExpired: {
    color: colors.danger,
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
  recurrenceNotice: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    padding: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${colors.warning}55`,
    backgroundColor: `${colors.warning}10`,
    gap: spacing.sm,
  },
  recurrenceNoticeText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  repeatWeeklyBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '12'),
  },
  repeatWeeklyBtnPressed: {
    opacity: 0.88,
  },
  repeatWeeklyBtnText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
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
  viewPlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: withAlpha(colors.accent, '55'),
    backgroundColor: withAlpha(colors.accent, '14'),
    marginRight: spacing.xs,
  },
  viewPlanBtnPressed: {
    backgroundColor: withAlpha(colors.accent, '26'),
  },
  viewPlanText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  privateNotesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: withAlpha(colors.accentBlue, '55'),
    backgroundColor: withAlpha(colors.accentBlue, '12'),
    marginRight: spacing.xs,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  privateNotesBtnPressed: {
    backgroundColor: withAlpha(colors.accentBlue, '24'),
  },
  privateNotesBtnMuted: {
    borderColor: withAlpha(colors.textSecondary, '44'),
    backgroundColor: withAlpha(colors.textMuted, '08'),
  },
  privateNotesBtnText: {
    ...typography.caption,
    color: colors.accentBlue,
    fontWeight: '700',
  },
  privateNotesBtnTextMuted: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  privateNotesCount: {
    minWidth: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: colors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  privateNotesCountText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '800',
    fontSize: 9,
    lineHeight: 12,
  },
  actionBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  actionBtnPressed: {
    backgroundColor: withAlpha(colors.textMuted, '18'),
  },
});
