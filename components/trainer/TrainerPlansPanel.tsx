import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { TrainerAthleteScheduleBoard } from '@/components/trainer/TrainerAthleteScheduleBoard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useGymMembers } from '@/hooks/useGymData';
import { useTrainerAthletePlans } from '@/hooks/useAthletePlans';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import {
  fetchAthleteIdsAssignedToOtherTrainers,
  isAdminRole,
} from '@/lib/athleteService';
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
  memberProfileId?: string;
  titles: string[];
  sessions: AthletePlan[];
}

function partitionByCeded<T>(
  items: T[],
  getAthleteId: (item: T) => string,
  cededIds: Set<string>,
) {
  const ceded: T[] = [];
  const own: T[] = [];

  for (const item of items) {
    if (cededIds.has(getAthleteId(item))) {
      ceded.push(item);
    } else {
      own.push(item);
    }
  }

  return { ceded, own };
}

function groupPlansByAthlete(
  plans: AthletePlan[],
  memberIdByAthleteId?: Map<string, string>,
): AthleteCalendarGroup[] {
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
      memberProfileId: memberIdByAthleteId?.get(group.athleteId),
      titles: [group.title],
      sessions: [...group.sessions],
    });
  }

  return [...byAthlete.values()].sort((left, right) =>
    left.athleteName.localeCompare(right.athleteName, 'es'),
  );
}

function TrainerAthleteCalendarCard({
  group,
  audience = 'trainer',
}: {
  group: AthleteCalendarGroup;
  audience?: 'trainer' | 'gym';
}) {
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
          onPress={() => {
            if (audience === 'gym' && group.memberProfileId) {
              router.push({
                pathname: '/gym/members/[id]',
                params: { id: group.memberProfileId },
              });
              return;
            }

            router.push({ pathname: '/trainer/athlete/[id]', params: { id: group.athleteId } });
          }}
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

function NutritionPlanList({ plans }: { plans: AthletePlan[] }) {
  const router = useRouter();

  return (
    <View style={styles.list}>
      {plans.map((plan) => (
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
  );
}

function ClientOwnerBlock({
  title,
  subtitle,
  emptyText,
  children,
  isEmpty,
}: {
  title: string;
  subtitle: string;
  emptyText: string;
  children: ReactNode;
  isEmpty: boolean;
}) {
  return (
    <View style={styles.ownerBlock}>
      <View>
        <Text style={styles.ownerTitle}>{title}</Text>
        <Text style={styles.ownerSubtitle}>{subtitle}</Text>
      </View>
      {isEmpty ? <Text style={styles.emptyText}>{emptyText}</Text> : children}
    </View>
  );
}

interface TrainerPlansPanelProps {
  activePlanType: AthletePlanType;
  audience?: 'trainer' | 'gym';
  allowCreate?: boolean;
}

function panelTitle(
  activePlanType: AthletePlanType,
  audience: 'trainer' | 'gym',
  allowCreate: boolean,
) {
  if (audience === 'gym' && activePlanType === 'nutrition' && !allowCreate) {
    return 'Planes nutricionales asignados';
  }

  return 'Calendarios de atletas';
}

function panelSubtitle(
  activePlanType: AthletePlanType,
  audience: 'trainer' | 'gym',
  allowCreate: boolean,
) {
  if (audience === 'gym' && activePlanType === 'nutrition' && !allowCreate) {
    return 'Planes preparados por el equipo de Training Prog Line para los atletas de tu gimnasio';
  }

  if (audience === 'gym') {
    return 'Crea, asigna y edita planes personalizados para los atletas de tu gimnasio';
  }

  return `Consulta y edita ${ATHLETE_PLAN_TYPE_LABELS[activePlanType].toLowerCase()}s en el calendario de cada atleta`;
}

function createPlanButtonLabel(activePlanType: AthletePlanType, audience: 'trainer' | 'gym') {
  if (audience === 'gym' && activePlanType === 'personalized') {
    return 'Asignar plan personalizado a un atleta';
  }

  return CREATE_ATHLETE_PLAN_LABELS[activePlanType];
}

function gymEmptyPlanText(activePlanType: AthletePlanType, allowCreate: boolean) {
  if (activePlanType === 'nutrition' && !allowCreate) {
    return 'Todavía no hay planes nutricionales asignados. Usa el formulario de arriba para solicitar información a nuestro equipo.';
  }

  return 'Todavía no has asignado planes en esta categoría. Usa el botón de arriba para crear uno y asignarlo a un atleta.';
}

export function TrainerPlansPanel({
  activePlanType,
  audience = 'trainer',
  allowCreate = true,
}: TrainerPlansPanelProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { members } = useGymMembers();
  const { plans, isLoading, refresh } = useTrainerAthletePlans(activePlanType);
  const isAdmin = isAdminRole(user?.role);
  const isGymAudience = audience === 'gym';
  const [cededIds, setCededIds] = useState<Set<string> | null>(null);

  const memberIdByAthleteId = useMemo(() => {
    const map = new Map<string, string>();
    for (const member of members) {
      if (member.userId) {
        map.set(member.userId, member.id);
      }
    }
    return map;
  }, [members]);

  const loadCededIds = useCallback(async () => {
    if (!isAdmin || !user?.id || isGymAudience) {
      setCededIds(null);
      return;
    }

    try {
      setCededIds(await fetchAthleteIdsAssignedToOtherTrainers(user.id));
    } catch {
      setCededIds(new Set());
    }
  }, [isAdmin, isGymAudience, user?.id]);

  useEffect(() => {
    void loadCededIds();
  }, [loadCededIds]);

  const refreshAll = useCallback(() => {
    refresh();
    void loadCededIds();
  }, [loadCededIds, refresh]);

  useFocusRefresh(() => refreshAll());

  const isSessionBased = isSessionBasedAthletePlanType(activePlanType);
  const athleteCalendars = useMemo(
    () =>
      isSessionBased
        ? groupPlansByAthlete(plans, isGymAudience ? memberIdByAthleteId : undefined)
        : [],
    [isGymAudience, isSessionBased, memberIdByAthleteId, plans],
  );
  const nutritionPlans = useMemo(
    () => (activePlanType === 'nutrition' ? plans : []),
    [activePlanType, plans],
  );
  const splitCalendars = useMemo(
    () =>
      cededIds
        ? partitionByCeded(athleteCalendars, (group) => group.athleteId, cededIds)
        : { ceded: [] as AthleteCalendarGroup[], own: athleteCalendars },
    [athleteCalendars, cededIds],
  );
  const splitNutrition = useMemo(
    () =>
      cededIds
        ? partitionByCeded(nutritionPlans, (plan) => plan.athleteId, cededIds)
        : { ceded: [] as AthletePlan[], own: nutritionPlans },
    [cededIds, nutritionPlans],
  );

  const waitingForOwnerSplit = isAdmin && !isGymAudience && cededIds === null;
  const showOwnerSplit = isAdmin && !isGymAudience && cededIds !== null;

  const calendarList = (groups: AthleteCalendarGroup[]) => (
    <View style={styles.calendarList}>
      {groups.map((group) => (
        <TrainerAthleteCalendarCard key={group.athleteId} group={group} audience={audience} />
      ))}
    </View>
  );

  const emptyPlanText = isGymAudience
    ? gymEmptyPlanText(activePlanType, allowCreate)
    : 'Todavía no has creado planes en esta categoría. Usa el botón de arriba para empezar.';

  const renderSessionContent = () => {
    if (athleteCalendars.length === 0) {
      return <Text style={styles.emptyText}>{emptyPlanText}</Text>;
    }

    if (showOwnerSplit) {
      return (
        <View style={styles.ownerBlocks}>
          <ClientOwnerBlock
            title="Clientes cedidos"
            subtitle="Atletas asignados a otros entrenadores"
            emptyText="No hay clientes cedidos con planes en esta categoría."
            isEmpty={splitCalendars.ceded.length === 0}
          >
            {calendarList(splitCalendars.ceded)}
          </ClientOwnerBlock>
          <ClientOwnerBlock
            title="Clientes del admin"
            subtitle="Tus clientes directos"
            emptyText="Todavía no hay planes para tus clientes en esta categoría."
            isEmpty={splitCalendars.own.length === 0}
          >
            {calendarList(splitCalendars.own)}
          </ClientOwnerBlock>
        </View>
      );
    }

    return calendarList(athleteCalendars);
  };

  const renderNutritionContent = () => {
    if (nutritionPlans.length === 0) {
      return <Text style={styles.emptyText}>{emptyPlanText}</Text>;
    }

    if (showOwnerSplit) {
      return (
        <View style={styles.ownerBlocks}>
          <ClientOwnerBlock
            title="Clientes cedidos"
            subtitle="Atletas asignados a otros entrenadores"
            emptyText="No hay clientes cedidos con planes en esta categoría."
            isEmpty={splitNutrition.ceded.length === 0}
          >
            <NutritionPlanList plans={splitNutrition.ceded} />
          </ClientOwnerBlock>
          <ClientOwnerBlock
            title="Clientes del admin"
            subtitle="Tus clientes directos"
            emptyText="Todavía no hay planes para tus clientes en esta categoría."
            isEmpty={splitNutrition.own.length === 0}
          >
            <NutritionPlanList plans={splitNutrition.own} />
          </ClientOwnerBlock>
        </View>
      );
    }

    return <NutritionPlanList plans={nutritionPlans} />;
  };

  return (
    <Card style={styles.panel}>
      <SectionHeader
        title={panelTitle(activePlanType, audience, allowCreate)}
        subtitle={panelSubtitle(activePlanType, audience, allowCreate)}
      />

      {allowCreate ? (
        <Button
          title={createPlanButtonLabel(activePlanType, audience)}
          onPress={() =>
            router.push({
              pathname: '/trainer/plan/create',
              params: { type: activePlanType },
            })
          }
          style={styles.actionButton}
        />
      ) : null}

      {isLoading || waitingForOwnerSplit ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : isSessionBased ? (
        renderSessionContent()
      ) : (
        renderNutritionContent()
      )}

      {!isLoading && !waitingForOwnerSplit ? (
        <Button title="Actualizar" variant="ghost" onPress={() => void refreshAll()} style={styles.refreshBtn} />
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
  ownerBlocks: {
    gap: spacing.md,
  },
  ownerBlock: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: spacing.sm,
  },
  ownerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  ownerSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
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
