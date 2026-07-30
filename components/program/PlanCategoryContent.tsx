import { useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { AthletePlanCard } from '@/components/program/AthletePlanCard';
import { PersonalizedPlanGroupCard } from '@/components/program/PersonalizedPlanGroupCard';
import { AthleteScheduleCalendar } from '@/components/schedule/AthleteScheduleCalendar';
import { ProgramCard } from '@/components/program/ProgramCard';
import { ServicePlanEmptyCard } from '@/components/program/ServicePlanEmptyCard';
import { TrainerCatalogPanel } from '@/components/trainer/TrainerCatalogPanel';
import { TrainerPlansPanel } from '@/components/trainer/TrainerPlansPanel';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, spacing, typography } from '@/constants/theme';
import { useAthleteIntakeForm } from '@/hooks/useAthleteIntakeForm';
import { useAuth } from '@/hooks/useAuth';
import { useMyAthletePlans } from '@/hooks/useAthletePlans';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { usePrograms } from '@/hooks/usePrograms';import { isTrainerRole } from '@/lib/athleteService';
import { isTrainerDesktopWeb } from '@/lib/platformAccess';
import { isTrainerEditableCategory, type Plan } from '@/lib/programService';
import { queueChatPrefill } from '@/lib/chatPrefill';
import { groupPersonalizedPlans } from '@/lib/personalizedPlanGroups';
import {
  isServicePlanCategory,
  PERSONALIZED_GYM_PLAN_CONTENT,
  SERVICE_PLAN_CONTENT,
  type AthletePlanType,
} from '@/lib/trainerConstants';

function serviceCategoryToPlanType(category: 'personalized' | 'nutrition'): AthletePlanType {
  return category;
}

interface PlanCategoryContentProps {
  planId: string;
  plan: Plan;
}

export function PlanCategoryContent({ planId, plan }: PlanCategoryContentProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const isTrainerDesktop = isTrainerDesktopWeb(user?.role);
  const useProgramGrid = isTrainerDesktop && width >= 960;
  const { getByPlanId, getById, refresh } = usePrograms();
  const isTrainer = isTrainerRole(user?.role);
  const { isComplete: intakeComplete, isLoading: intakeLoading } = useAthleteIntakeForm();

  const canEditCatalog = isTrainer && isTrainerEditableCategory(plan.category);
  const serviceCategory = isServicePlanCategory(plan.category) ? plan.category : undefined;
  const athletePlanType =
    serviceCategory === 'personalized' || serviceCategory === 'nutrition'
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
      if (!isTrainer) {
        void refreshAthletePlans();
      }
    },
  );
  const programs = getByPlanId(planId);
  const servicePlanContent = serviceCategory ? SERVICE_PLAN_CONTENT[serviceCategory] : null;
  const showAthleteAssignedPlans =
    !isTrainer &&
    athletePlanType &&
    (athletePlansLoading || myAthletePlans.length > 0);
  const showServiceEmptyCard =
    Boolean(servicePlanContent && serviceCategory) &&
    programs.length === 0 &&
    myAthletePlans.length === 0 &&
    !athletePlansLoading &&
    (serviceCategory === 'home_training' || serviceCategory === 'gym_training' || !isTrainer);
  const showPersonalizedGymCard =
    serviceCategory === 'personalized' &&
    programs.length === 0 &&
    myAthletePlans.length === 0 &&
    !athletePlansLoading &&
    !isTrainer;

  const openTrainerChat = (prefill: string) => {
    queueChatPrefill(prefill);

    if (!isTrainer && !intakeLoading && !intakeComplete) {
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

  const showAthleteCalendar =
    !isTrainer && (myAthletePlans.length > 0 || programs.length > 0 || Boolean(user?.currentProgramId));

  const activeProgramForCalendar = user?.currentProgramId
    ? getById(user.currentProgramId)
    : programs[0];

  const groupedPersonalizedPlans = groupPersonalizedPlans(
    myAthletePlans.filter((item) => item.planType === 'personalized'),
  );
  const nutritionPlans = myAthletePlans.filter((item) => item.planType === 'nutrition');

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

      {showAthleteCalendar ? (
        <AthleteScheduleCalendar program={activeProgramForCalendar} />
      ) : null}

      {programs.length === 0 ? (
        showServiceEmptyCard && servicePlanContent && serviceCategory ? (
          <View style={styles.serviceCards}>
            <ServicePlanEmptyCard
              category={serviceCategory}
              title={servicePlanContent.title}
              text={servicePlanContent.text}
              button={servicePlanContent.button}
              onRequest={() => openTrainerChat(servicePlanContent.prefill)}
            />
            {showPersonalizedGymCard ? (
              <ServicePlanEmptyCard
                category="personalized"
                icon="strength"
                title={PERSONALIZED_GYM_PLAN_CONTENT.title}
                text={PERSONALIZED_GYM_PLAN_CONTENT.text}
                button={PERSONALIZED_GYM_PLAN_CONTENT.button}
                onRequest={() => openTrainerChat(PERSONALIZED_GYM_PLAN_CONTENT.prefill)}
              />
            ) : null}
          </View>
        ) : !isTrainer && serviceCategory && myAthletePlans.length > 0 ? null : !isTrainer ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Sin programaciones disponibles</Text>
            <Text style={styles.emptyText}>Todavía no hay programaciones publicadas en este plan.</Text>
          </Card>
        ) : null
      ) : (
        <View style={useProgramGrid ? styles.programGrid : undefined}>
          {programs.map((program) => (
            <View key={program.id} style={useProgramGrid ? styles.programGridItem : undefined}>
              <ProgramCard program={program} />
            </View>
          ))}
        </View>
      )}

      {isTrainer && canEditCatalog ? (
        <TrainerCatalogPanel planId={plan.id} category={plan.category} />
      ) : null}

      {isTrainer && athletePlanType ? <TrainerPlansPanel activePlanType={athletePlanType} /> : null}
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
});
