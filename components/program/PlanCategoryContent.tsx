import { HomeTrainingCalendarPanel } from '@/components/homeTraining/HomeTrainingCalendarPanel';
import { AthletePlanCard } from '@/components/program/AthletePlanCard';
import { CatalogProgramList } from '@/components/program/CatalogProgramList';
import { HorizontalPager } from '@/components/program/HorizontalPager';
import { PersonalizedPlanGroupCard } from '@/components/program/PersonalizedPlanGroupCard';
import { PlanCoverCard } from '@/components/program/PlanCoverCard';
import { ProgramCard } from '@/components/program/ProgramCard';
import {
  planBrandActionButtonStyle,
  planBrandActionButtonTextStyle,
} from '@/components/program/planBrandUi';
import { ServicePlanEmptyCard } from '@/components/program/ServicePlanEmptyCard';
import { TrainerPlansPanel } from '@/components/trainer/TrainerPlansPanel';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SUPPORT_ROUTE } from '@/constants/support';
import { fontUiBold, fontUiRegular } from '@/constants/fonts';
import { colors, spacing, typography } from '@/constants/theme';
import type { AppIconName } from '@/constants/icons';
import { useMyAthletePlans } from '@/hooks/useAthletePlans';
import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { usePrograms } from '@/hooks/usePrograms';
import { isGymRole, isTrainerOnlyRole, isTrainerRole } from '@/lib/athleteService';
import { queueChatPrefill } from '@/lib/chatPrefill';
import { partitionHypePlanPrograms } from '@/lib/hypeCatalog';
import { filterActivePersonalizedPlanGroups, groupPersonalizedPlans } from '@/lib/personalizedPlanGroups';
import { inferPlanValidityFromSessions, isPlanValidityEnded } from '@/lib/planValidity';
import { isTrainerDesktopWeb, usesPhoneProgramPager } from '@/lib/platformAccess';
import { type Plan } from '@/lib/programService';
import { resolveStandardVenuePrograms } from '@/lib/standardVenueCatalog';
import type { StandardVenueId } from '@/lib/standardVenues';
import { queueSupportPrefill } from '@/lib/supportPrefill';
import {
    getServicePlanContent,
    HOME_TRAINING_STAFF_JOIN,
    isGymAthletePlanStaffCategory,
    isServicePlanCategory,
    isSessionBasedAthletePlanType,
    TRAINER_NUTRITION_STAFF_CONTENT,
    usesAthleteServiceView,
    type AthletePlanType,
} from '@/lib/trainerConstants';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { useAthletePreviewMode } from '@/hooks/useAthletePreviewMode';
import { useTrainerMobilePreviewMode } from '@/hooks/useTrainerMobilePreview';
import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

function serviceCategoryToPlanType(
  category: 'personalized' | 'nutrition' | 'gym_training',
): AthletePlanType {
  return category;
}

const SERVICE_PAGE_ICONS: Record<'personalized' | 'nutrition' | 'home_training' | 'gym_training', AppIconName> = {
  personalized: 'personal',
  nutrition: 'measure',
  home_training: 'home',
  gym_training: 'phase',
};

interface ServicePageItem {
  id: string;
  category: 'personalized' | 'nutrition' | 'home_training' | 'gym_training';
  icon?: AppIconName;
  title: string;
  subtitle: string;
  button: string;
  onPress: () => void;
  createButton?: string;
  onCreate?: () => void;
}

function ServicePlanPagePager({ pages }: { pages: ServicePageItem[] }) {
  return (
    <View style={styles.pagerHost}>
      <HorizontalPager
        items={pages}
        label={(page) => page.title}
        renderPage={(page) => (
          <PlanCoverCard
            icon={page.icon ?? SERVICE_PAGE_ICONS[page.category]}
            title={page.title}
            subtitle={page.subtitle}
            layout="page"
            onPress={page.onPress}
            trailing={
              <View style={styles.pageActions}>
                <Button
                  title={page.button}
                  size="compact"
                  variant="outline"
                  onPress={page.onPress}
                  style={styles.pageButton}
                  textStyle={styles.pageButtonText}
                  numberOfLines={1}
                />
                {page.createButton && page.onCreate ? (
                  <Button
                    title={page.createButton}
                    size="compact"
                    variant="outline"
                    onPress={page.onCreate}
                    style={styles.pageButton}
                    textStyle={styles.pageButtonText}
                  />
                ) : null}
              </View>
            }
          />
        )}
      />
    </View>
  );
}

interface PlanCategoryContentProps {
  planId: string;
  plan: Plan;
  standardVenue?: StandardVenueId;
}

function CatalogIntro() {
  return (
    <View style={styles.catalogIntro}>
      <Text style={styles.catalogTitle}>Programaciones</Text>
      <Text style={styles.catalogSubtitle}>Encuentra tu próximo reto</Text>
    </View>
  );
}

export function PlanCategoryContent({ planId, plan, standardVenue }: PlanCategoryContentProps) {
  const router = useAppNavigation();
  const preview = useAthletePreviewMode();
  const trainerPreview = useTrainerMobilePreviewMode();
  const viewingAsAthlete = preview.enabled;
  const phonePager = usesPhoneProgramPager(viewingAsAthlete || trainerPreview.enabled);
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const isTrainerDesktop = !viewingAsAthlete && isTrainerDesktopWeb(user?.role);
  const useProgramGrid = isTrainerDesktop && width >= 960;
  const { getByPlanId, refresh } = usePrograms();
  const serviceCategory = isServicePlanCategory(plan.category) ? plan.category : undefined;
  const isStaff = !viewingAsAthlete && isTrainerRole(user?.role);
  const isGymAthletePlansStaff =
    !viewingAsAthlete && isGymRole(user?.role) && isGymAthletePlanStaffCategory(serviceCategory);
  const useAthleteView = viewingAsAthlete || usesAthleteServiceView(user?.role, plan.category);

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

  const useCatalogPager =
    phonePager &&
    !useProgramGrid &&
    useAthleteView &&
    catalogPrograms.length > 0 &&
    !showAthleteAssignedPlans &&
    !showWeeklyChallenge &&
    !(
      isServiceRequestPlan &&
      servicePlanContent &&
      serviceCategory &&
      myAthletePlans.length === 0
    );

  const openTrainerChat = (prefill: string) => {
    queueChatPrefill(prefill);

    if (!viewingAsAthlete && isTrainerOnlyRole(user?.role)) {
      router.push('/trainer/client-chat');
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

  const openTrainerNutritionRequest = () => {
    queueChatPrefill(TRAINER_NUTRITION_STAFF_CONTENT.prefill);
    router.push('/trainer/client-chat');
  };

  const showTrainerNutritionStaffCard =
    !viewingAsAthlete &&
    isTrainerOnlyRole(user?.role) &&
    serviceCategory === 'nutrition' &&
    showServiceEmptyCard;

  const openServicePlanRequest = (prefill: string, subject: string) => {
    if (!viewingAsAthlete && isGymRole(user?.role)) {
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

  const servicePages: ServicePageItem[] = [];
  if (
    isServiceRequestPlan &&
    useAthleteView &&
    servicePlanContent &&
    serviceCategory &&
    myAthletePlans.length === 0
  ) {
    servicePages.push({
      id: serviceCategory,
      category: serviceCategory,
      title: servicePlanContent.title,
      subtitle: servicePlanContent.text,
      button: servicePlanContent.button,
      onPress: () => openServicePlanRequest(servicePlanContent.prefill, servicePlanContent.title),
    });
  } else if (
    catalogPrograms.length === 0 &&
    showServiceEmptyCard &&
    serviceCategory &&
    (showTrainerNutritionStaffCard || servicePlanContent)
  ) {
    servicePages.push({
      id: serviceCategory,
      category: serviceCategory,
      title: showTrainerNutritionStaffCard
        ? TRAINER_NUTRITION_STAFF_CONTENT.title
        : servicePlanContent!.title,
      subtitle: showTrainerNutritionStaffCard
        ? TRAINER_NUTRITION_STAFF_CONTENT.text
        : servicePlanContent!.text,
      button: showTrainerNutritionStaffCard
        ? TRAINER_NUTRITION_STAFF_CONTENT.requestButton
        : servicePlanContent!.button,
      onPress: showTrainerNutritionStaffCard
        ? openTrainerNutritionRequest
        : () => openServicePlanRequest(servicePlanContent!.prefill, servicePlanContent!.title),
      createButton: showTrainerNutritionStaffCard
        ? TRAINER_NUTRITION_STAFF_CONTENT.createButton
        : undefined,
      onCreate: showTrainerNutritionStaffCard ? openGymAthletePlanCreate : undefined,
    });
  }

  const fillScreen = useCatalogPager || (phonePager && servicePages.length > 0);

  const groupedPersonalizedPlans = filterActivePersonalizedPlanGroups(
    groupPersonalizedPlans(myAthletePlans.filter((item) => isSessionBasedAthletePlanType(item.planType))),
  );
  const nutritionPlans = myAthletePlans.filter((item) => {
    if (item.planType !== 'nutrition') return false;
    const validity = inferPlanValidityFromSessions([item]);
    return !isPlanValidityEnded(validity);
  });
  if (isHomeTraining) {
    return (
      <ScreenWrapper>
        <HomeTrainingCalendarPanel
          asAthlete={useAthleteView}
          onRequestHomeTrainerJoin={
            !viewingAsAthlete && isTrainerOnlyRole(user?.role)
              ? () => openTrainerChat(HOME_TRAINING_STAFF_JOIN.prefill)
              : undefined
          }
        />
      </ScreenWrapper>
    );
  }

  const content = (
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

      {servicePages.length > 0 ? (
        phonePager ? (
          <ServicePlanPagePager pages={servicePages} />
        ) : (
          <View style={styles.serviceCards}>
            {servicePages.map((page) => (
              <ServicePlanEmptyCard
                key={page.id}
                category={page.category}
                icon={page.icon}
                title={page.title}
                text={page.subtitle}
                button={page.button}
                onRequest={page.onPress}
                createButton={page.createButton}
                onCreate={page.onCreate}
              />
            ))}
          </View>
        )
      ) : catalogPrograms.length === 0 ? (
        useAthleteView && serviceCategory && myAthletePlans.length > 0 ? null : useAthleteView ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Sin programaciones disponibles</Text>
            <Text style={styles.emptyText}>Todavía no hay programaciones publicadas en este plan.</Text>
          </Card>
        ) : null
      ) : phonePager && !useProgramGrid && useAthleteView ? (
        <>
          {plan.category === 'hype' ? <CatalogIntro /> : null}
          <CatalogProgramList programs={catalogPrograms} />
        </>
      ) : (
        <>
          {plan.category === 'hype' ? <CatalogIntro /> : null}
          <View style={useProgramGrid ? styles.programGrid : undefined}>
            {catalogPrograms.map((program) => (
              <View key={program.id} style={useProgramGrid ? styles.programGridItem : undefined}>
                <ProgramCard program={program} />
              </View>
            ))}
          </View>
        </>
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

  return (
    <ScreenWrapper scrollable={!fillScreen} style={fillScreen ? styles.catalogScreen : undefined}>
      {fillScreen ? <View style={styles.catalogStage}>{content}</View> : content}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  catalogIntro: {
    gap: 2,
    marginBottom: spacing.sm,
  },
  catalogScreen: {
    flex: 1,
    minHeight: 0,
  },
  catalogStage: {
    flex: 1,
    minHeight: 0,
  },
  pagerHost: {
    flex: 1,
    minHeight: 0,
  },
  pageActions: {
    gap: spacing.sm,
  },
  pageButton: {
    ...planBrandActionButtonStyle,
    width: '100%',
    alignSelf: 'stretch',
    minHeight: 48,
  },
  pageButtonText: {
    ...planBrandActionButtonTextStyle,
    fontFamily: fontUiBold,
    fontWeight: 'normal',
    fontSize: 16,
    lineHeight: 20,
  },
  catalogTitle: {
    fontFamily: fontUiBold,
    fontWeight: 'normal',
    color: colors.text,
    fontSize: 24,
    lineHeight: 30,
  },
  catalogSubtitle: {
    fontFamily: fontUiRegular,
    fontWeight: 'normal',
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
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
