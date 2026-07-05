import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AthletePlanCard } from '@/components/program/AthletePlanCard';
import { CategoryTabs } from '@/components/program/CategoryTabs';
import { ProgramCard } from '@/components/program/ProgramCard';
import { ServicePlanEmptyCard } from '@/components/program/ServicePlanEmptyCard';
import { TrainerPlansPanel } from '@/components/trainer/TrainerPlansPanel';
import { Card } from '@/components/ui/Card';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useMyAthletePlans } from '@/hooks/useAthletePlans';
import { usePrograms } from '@/hooks/usePrograms';
import { isTrainerRole } from '@/lib/athleteService';
import { isTrainerEditableCategory } from '@/lib/programService';
import { queueChatPrefill } from '@/lib/chatPrefill';
import { isServicePlanCategory, SERVICE_PLAN_CONTENT, type AthletePlanType } from '@/lib/trainerConstants';

function serviceCategoryToPlanType(category: 'personalized' | 'nutrition'): AthletePlanType {
  return category;
}

export default function ProgramsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { plans, getByPlanId, isLoading, error, refresh } = usePrograms();
  const [activePlanId, setActivePlanId] = useState('');
  const isTrainer = isTrainerRole(user?.role);

  const activePlan = plans.find((plan) => plan.id === activePlanId);
  const canEditCatalog = isTrainer && isTrainerEditableCategory(activePlan?.category);
  const serviceCategory = isServicePlanCategory(activePlan?.category) ? activePlan.category : undefined;
  const athletePlanType =
    serviceCategory === 'personalized' || serviceCategory === 'nutrition'
      ? serviceCategoryToPlanType(serviceCategory)
      : undefined;

  const {
    plans: myAthletePlans,
    isLoading: athletePlansLoading,
    refresh: refreshAthletePlans,
  } = useMyAthletePlans(athletePlanType);

  useEffect(() => {
    if (!activePlanId && plans[0]) {
      setActivePlanId(plans[0].id);
    }
  }, [activePlanId, plans]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
      if (!isTrainer) {
        void refreshAthletePlans();
      }
    }, [isTrainer, refresh, refreshAthletePlans]),
  );

  const programs = activePlanId ? getByPlanId(activePlanId) : [];
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
    (serviceCategory === 'home_training' || !isTrainer);

  return (
    <ScreenWrapper>
      <Text style={styles.title}>Programaciones</Text>
      <SectionHeader title="Elige tu plan" subtitle="Selecciona el tipo de programación que buscas" />

      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <>
          <CategoryTabs plans={plans} activePlanId={activePlanId} onChange={setActivePlanId} />

          {showAthleteAssignedPlans ? (
            <View style={styles.assignedSection}>
              <SectionHeader title="Tu plan asignado" subtitle="Preparado por tu entrenador" />
              {athletePlansLoading ? (
                <ActivityIndicator color={colors.accent} style={styles.loader} />
              ) : (
                myAthletePlans.map((plan) => <AthletePlanCard key={plan.id} plan={plan} />)
              )}
            </View>
          ) : null}

          {programs.length === 0 ? (
            showServiceEmptyCard && servicePlanContent && serviceCategory ? (
              <ServicePlanEmptyCard
                category={serviceCategory}
                title={servicePlanContent.title}
                text={servicePlanContent.text}
                button={servicePlanContent.button}
                onRequest={() => {
                  queueChatPrefill(servicePlanContent.prefill);
                  router.push({
                    pathname: '/tabs/trainer',
                    params: { prefill: servicePlanContent.prefill },
                  });
                }}
              />
            ) : !isTrainer && serviceCategory && myAthletePlans.length > 0 ? null : !isTrainer ? (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>Sin programaciones disponibles</Text>
                <Text style={styles.emptyText}>Todavía no hay programaciones publicadas en este plan.</Text>
              </Card>
            ) : null
          ) : (
            programs.map((program) => (
              <ProgramCard key={program.id} program={program} canEdit={canEditCatalog} />
            ))
          )}

          {isTrainer && athletePlanType ? <TrainerPlansPanel activePlanType={athletePlanType} /> : null}
        </>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: colors.text, marginBottom: 4 },
  loader: { marginTop: spacing.xl },
  error: { ...typography.bodySmall, color: colors.danger, marginTop: spacing.md },
  assignedSection: { marginTop: spacing.md },
  emptyCard: { alignItems: 'stretch' },
  emptyTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  emptyText: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 22 },
});
