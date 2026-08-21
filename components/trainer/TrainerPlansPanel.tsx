import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { TrainerAthleteScheduleBoard } from '@/components/trainer/TrainerAthleteScheduleBoard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, spacing, typography } from '@/constants/theme';
import { useTrainerAthletePlans } from '@/hooks/useAthletePlans';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { groupPersonalizedPlans } from '@/lib/personalizedPlanGroups';
import {
  ATHLETE_PLAN_TYPE_LABELS,
  CREATE_ATHLETE_PLAN_LABELS,
  isSessionBasedAthletePlanType,
  type AthletePlanType,
} from '@/lib/trainerConstants';
import type { AthletePlan } from '@/lib/types';

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
}

interface AthleteCalendarGroup {
  athleteId: string;
  athleteName: string;
  titles: string[];
  sessions: AthletePlan[];
}

function groupPlansByAthlete(plans: AthletePlan[]): AthleteCalendarGroup[] {
  const byAthlete = new Map<string, AthleteCalendarGroup>();

  for (const group of groupPersonalizedPlans(plans)) {
    const athleteName = group.sessions[0]?.athleteName?.trim() || 'Atleta';
    const existing = byAthlete.get(group.athleteId);
    if (existing) {
      existing.titles.push(group.title);
      existing.sessions.push(...group.sessions);
      continue;
    }

    byAthlete.set(group.athleteId, {
      athleteId: group.athleteId,
      athleteName,
      titles: [group.title],
      sessions: [...group.sessions],
    });
  }

  return [...byAthlete.values()].sort((left, right) =>
    left.athleteName.localeCompare(right.athleteName, 'es'),
  );
}

function TrainerAthleteCalendarCard({ group }: { group: AthleteCalendarGroup }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const sessionCount = group.sessions.length;

  return (
    <View style={[styles.calendarCard, !expanded && styles.calendarCardCollapsed]}>
      <View style={[styles.calendarHeader, expanded && styles.calendarHeaderExpanded]}>
        <Pressable
          onPress={() => setExpanded((current) => !current)}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          accessibilityLabel={
            expanded
              ? `Contraer calendario de ${group.athleteName}`
              : `Desplegar calendario de ${group.athleteName}`
          }
          style={({ pressed }) => [styles.headerMain, pressed && styles.pressed]}
        >
          <View style={styles.headerText}>
            <Text style={styles.athleteName}>{group.athleteName}</Text>
            <Text style={styles.planTitles}>
              {group.titles.join(' · ')} · {sessionCount} sesión{sessionCount === 1 ? '' : 'es'}
            </Text>
          </View>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.textSecondary}
          />
        </Pressable>
        <Pressable
          onPress={() =>
            router.push({ pathname: '/trainer/athlete/[id]', params: { id: group.athleteId } })
          }
          hitSlop={8}
          accessibilityRole="link"
          accessibilityLabel={`Ver ficha de ${group.athleteName}`}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text style={styles.athleteLink}>Ficha</Text>
        </Pressable>
      </View>

      {expanded ? <TrainerAthleteScheduleBoard athleteId={group.athleteId} embedded /> : null}
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

  const isSessionBased = isSessionBasedAthletePlanType(activePlanType);
  const athleteCalendars = useMemo(
    () => (isSessionBased ? groupPlansByAthlete(plans) : []),
    [isSessionBased, plans],
  );
  const nutritionPlans = useMemo(
    () => (activePlanType === 'nutrition' ? plans : []),
    [activePlanType, plans],
  );

  return (
    <Card style={styles.panel}>
      <SectionHeader
        title="Calendarios de atletas"
        subtitle={`Consulta y edita ${ATHLETE_PLAN_TYPE_LABELS[activePlanType].toLowerCase()}s en el calendario de cada atleta`}
      />

      <Button
        title={CREATE_ATHLETE_PLAN_LABELS[activePlanType]}
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
      ) : isSessionBased ? (
        athleteCalendars.length === 0 ? (
          <Text style={styles.emptyText}>
            Todavía no has creado planes en esta categoría. Usa el botón de arriba para empezar.
          </Text>
        ) : (
          <View style={styles.calendarList}>
            {athleteCalendars.map((group) => (
              <TrainerAthleteCalendarCard key={group.athleteId} group={group} />
            ))}
          </View>
        )
      ) : plans.length === 0 ? (
        <Text style={styles.emptyText}>
          Todavía no has creado planes en esta categoría. Usa el botón de arriba para empezar.
        </Text>
      ) : (
        <View style={styles.list}>
          {nutritionPlans.map((plan) => (
            <Pressable
              key={plan.id}
              onPress={() => router.push({ pathname: '/trainer/plan/[id]', params: { id: plan.id } })}
              style={({ pressed }) => [styles.planItem, pressed && styles.pressed]}
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
        </View>
      )}

      {!isLoading ? (
        <Button title="Actualizar" variant="ghost" onPress={() => void refresh()} style={styles.refreshBtn} />
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
  calendarList: {
    gap: spacing.sm,
  },
  calendarCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: spacing.md,
  },
  calendarCardCollapsed: {
    paddingVertical: spacing.sm,
    gap: 0,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  calendarHeaderExpanded: {
    paddingBottom: spacing.xs,
  },
  headerMain: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  athleteName: {
    ...typography.h3,
    color: colors.text,
  },
  planTitles: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  athleteLink: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '600',
  },
  list: {
    gap: spacing.sm,
  },
  planItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pressed: {
    opacity: 0.75,
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
  refreshBtn: {
    marginTop: spacing.sm,
  },
});
