import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { AthletePlanCard } from '@/components/program/AthletePlanCard';
import { PersonalizedPlanGroupCard } from '@/components/program/PersonalizedPlanGroupCard';
import { ProgramCard } from '@/components/program/ProgramCard';
import { ServicePlanEmptyCard } from '@/components/program/ServicePlanEmptyCard';
import { HomeTrainingCalendarPanel } from '@/components/homeTraining/HomeTrainingCalendarPanel';
import { TrainerPlansPanel } from '@/components/trainer/TrainerPlansPanel';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SUPPORT_ROUTE } from '@/constants/support';
import { colors, spacing, typography } from '@/constants/theme';
import { useAthleteIntakeForm } from '@/hooks/useAthleteIntakeForm';
import { useAuth } from '@/hooks/useAuth';
import { useMyAthletePlans } from '@/hooks/useAthletePlans';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { usePrograms } from '@/hooks/usePrograms';
import { isTrainerOnlyRole, isTrainerRole, isGymRole } from '@/lib/athleteService';
import { queueChatPrefill } from '@/lib/chatPrefill';
import { partitionHypePlanPrograms } from '@/lib/hypeCatalog';
import { isTrainerDesktopWeb } from '@/lib/platformAccess';
import { groupPersonalizedPlans } from '@/lib/personalizedPlanGroups';
import { type Plan } from '@/lib/programService';
import { queueSupportPrefill } from '@/lib/supportPrefill';
import { resolveStandardVenuePrograms } from '@/lib/standardVenueCatalog';
import type { StandardVenueId } from '@/lib/standardVenues';
import {
  isServicePlanCategory,
  isSessionBasedAthletePlanType,
  isGymAthletePlanStaffCategory,
  HOME_TRAINING_STAFF_JOIN,
  getServicePlanContent,
  PERSONALIZED_GYM_PLAN_CONTENT,
  usesAthleteServiceView,
  type AthletePlanType,
} from '@/lib/trainerConstants';

function serviceCategoryToPlanType(
  category: 'personalized' | 'nutrition' | 'gym_training',
): AthletePlanType {
  return category;
}

interface PlanCategoryContentProps {
  planId: string;
  plan: Plan;
  standardVenue?: StandardVenueId;
}

export function PlanCategoryContent({ planId, plan, standardVenue }: PlanCategoryContentProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const isTrainerDesktop = isTrainerDesktopWeb(user?.role);
  const useProgramGrid = isTrainerDesktop && width >= 960;
  const { getByPlanId, refresh } = usePrograms();
  const serviceCategory = isServicePlanCategory(plan.category) ? plan.category : undefined;
  const isStaff = isTrainerRole(user?.role);
  const isGymAthletePlansStaff =
    isGymRole(user?.role) && isGymAthletePlanStaffCategory(serviceCategory);
  const useAthleteView = usesAthleteServiceView(user?.role, plan.category);
  const { isComplete: intakeComplete, isLoading: intakeLoading } = useAthleteIntakeForm();

  const isHomeTraining = serviceCategory === 'home_training';
  const athletePlanType =
    serviceCategory === 'personalized' ||
    serviceCategory === 'nutrition' ||
    serviceCategory === 'gym_training'
      ? serviceCategoryToPlanType(serviceCategory)
      : undefined;

  const {
    plans: myAthletePlans,
    isLoading: athletePlansLoading,
    refresh: refreshAthletePlans,
  } = useMyAthletePlans(athletePlanType);

  useFocusRefresh(
    () => refresh(),
    () => {
      if (useAthleteView) {
        void refreshAthletePlans();
      }
    },
  );
  const programs = standardVenue
    ? resolveStandardVenuePrograms(standardVenue, getByPlanId(planId), planId)
    : getByPlanId(planId);
  const { catalogPrograms, weeklyChallenge } = useMemo(
    () =>
      plan.category === 'hype'
        ? partitionHypePlanPrograms(programs, planId)
        : { catalogPrograms: programs, weeklyChallenge: null },
    [plan.category, programs, planId],
  );
  const athleteHasWeeklyChallenge = Boolean(
    weeklyChallenge &&
      (user?.currentProgramId === weeklyChallenge.id ||
        user?.currentPrograms?.some((item) => item.id === weeklyChallenge.id)),
  );
  const showWeeklyChallenge = Boolean(weeklyChallenge && (isStaff || athleteHasWeeklyChallenge));
  const servicePlanContent = serviceCategory
    ? getServicePlanContent(serviceCategory, user?.role)
    : null;
  const isServiceRequestPlan = serviceCategory === 'gym_training';
  const showAthleteAssignedPlans =
    useAthleteView &&
    !isHomeTraining &&
    athletePlanType &&
    (athletePlansLoading || myAthletePlans.length > 0);
  const showServiceEmptyCard =
    Boolean(servicePlanContent && serviceCategory) &&
    useAthleteView &&
    !isHomeTraining &&
    !athletePlansLoading &&
    myAthletePlans.length === 0 &&
    (isServiceRequestPlan ||
      (programs.length === 0 &&
        (serviceCategory === 'nutrition' || serviceCategory === 'personalized')));
  const showPersonalizedGymCard =
    serviceCategory === 'personalized' &&
    !isGymRole(user?.role) &&
    programs.length === 0 &&
    myAthletePlans.length === 0 &&
    !athletePlansLoading &&
    useAthleteView;

  const openTrainerChat = (prefill: string) => {
    queueChatPrefill(prefill);

    if (isTrainerOnlyRole(user?.role)) {
      router.push('/trainer/client-chat');
      return;
    }

    if (!isStaff && !intakeLoading && !intakeComplete) {
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

  const openGymAthletePlanCreate = () => {
    if (!athletePlanType) return;
    router.push({
      pathname: '/trainer/plan/create',
      params: { type: athletePlanType },
    });
  };

  const openServicePlanRequest = (prefill: string, subject: string) => {
    if (isGymRole(user?.role)) {
      if (serviceCategory === 'personalized') {
        openGymAthletePlanCreate();
        return;
      }

      queueSupportPrefill({
        category: 'programs',
        subject,
        message: prefill,
      });
      router.replace(SUPPORT_ROUTE);
      return;
    }

    openTrainerChat(prefill);
  };

  const groupedPersonalizedPlans = groupPersonalizedPlans(
    myAthletePlans.filter((item) => isSessionBasedAthletePlanType(item.planType)),
  );
  const nutritionPlans = myAthletePlans.filter((item) => item.planType === 'nutrition');

  if (isHomeTraining) {
    return (
      <HomeTrainingCalendarPanel
        asAthlete={useAthleteView}
        onRequestHomeTrainerJoin={
          isTrainerOnlyRole(user?.role)
            ? () => openTrainerChat(HOME_TRAINING_STAFF_JOIN.prefill)
            : undefined
        }
      />
    );
  }

  return (
    <>
      {showAthleteAssignedPlans ? (
        <View style={styles.assignedSection}>
          <SectionHeader title="Tu plan asignado" subtitle="Preparado por tu entrenador" />
          {athletePlansLoading ? (
            <ActivityIndicator color={colors.accent} style={styles.loader} />
          ) : (
            <>
              {groupedPersonalizedPlans.map((group) => (
                <PersonalizedPlanGroupCard key={group.id} group={group} />
              ))}
              {nutritionPlans.map((athletePlan) => (
                <AthletePlanCard key={athletePlan.id} plan={athletePlan} />
              ))}
            </>
          )}
        </View>
      ) : null}

      {isServiceRequestPlan && useAthleteView && servicePlanContent && serviceCategory && myAthletePlans.length === 0 ? (
        <View style={styles.serviceCards}>
          <ServicePlanEmptyCard
            category={serviceCategory}
            title={servicePlanContent.title}
            text={servicePlanContent.text}
            button={servicePlanContent.button}
            onRequest={() => openServicePlanRequest(servicePlanContent.prefill, servicePlanContent.title)}
          />
        </View>
      ) : catalogPrograms.length === 0 ? (
        showServiceEmptyCard && servicePlanContent && serviceCategory ? (
          <View style={styles.serviceCards}>
            <ServicePlanEmptyCard
              category={serviceCategory}
              title={servicePlanContent.title}
              text={servicePlanContent.text}
              button={servicePlanContent.button}
              onRequest={() => openServicePlanRequest(servicePlanContent.prefill, servicePlanContent.title)}
            />
            {showPersonalizedGymCard ? (
              <ServicePlanEmptyCard
                category="gym_training"
                icon="strength"
                title={PERSONALIZED_GYM_PLAN_CONTENT.title}
                text={PERSONALIZED_GYM_PLAN_CONTENT.text}
                button={PERSONALIZED_GYM_PLAN_CONTENT.button}
                onRequest={() =>
                  openServicePlanRequest(
                    PERSONALIZED_GYM_PLAN_CONTENT.prefill,
                    PERSONALIZED_GYM_PLAN_CONTENT.title,
                  )
                }
              />
            ) : null}
          </View>
        ) : useAthleteView && serviceCategory && myAthletePlans.length > 0 ? null : useAthleteView ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Sin programaciones disponibles</Text>
            <Text style={styles.emptyText}>Todavía no hay programaciones publicadas en este plan.</Text>
          </Card>
        ) : null
      ) : (
        <View style={useProgramGrid ? styles.programGrid : undefined}>
          {catalogPrograms.map((program) => (
            <View key={program.id} style={useProgramGrid ? styles.programGridItem : undefined}>
              <ProgramCard program={program} />
            </View>
          ))}
        </View>
      )}

      {showWeeklyChallenge && weeklyChallenge ? (
        <View style={styles.weeklyChallengeSection}>
          <ProgramCard program={weeklyChallenge} />
        </View>
      ) : null}

      {isStaff && !useAthleteView && athletePlanType ? (
        <TrainerPlansPanel activePlanType={athletePlanType} />
      ) : isGymAthletePlansStaff && athletePlanType ? (
        <TrainerPlansPanel activePlanType={athletePlanType} audience="gym" />
      ) : isGymRole(user?.role) && serviceCategory === 'nutrition' ? (
        <TrainerPlansPanel activePlanType="nutrition" audience="gym" allowCreate={false} />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: spacing.xl },
  assignedSection: { marginTop: spacing.md },
  serviceCards: { gap: spacing.md },
  emptyCard: { alignItems: 'stretch' },
  emptyTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  emptyText: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 22 },
  programGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  programGridItem: {
    flexGrow: 1,
    flexBasis: '48%',
    minWidth: 320,
  },
  weeklyChallengeSection: {
    marginTop: spacing.md,
  },
});
