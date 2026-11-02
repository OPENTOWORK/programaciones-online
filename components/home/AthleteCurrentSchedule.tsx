import { useFocusEffect, useNavigation } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/constants/theme';

import { AthleteProgramPicker } from '@/components/program/AthleteProgramPicker';
import { AthleteScheduleCalendar } from '@/components/schedule/AthleteScheduleCalendar';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { useAthleteCededAccess } from '@/hooks/useAthleteCededAccess';
import {
  useAthletePreviewEffectiveUser,
  useAthletePreviewMode,
  useShowsAthleteExperience,
} from '@/hooks/useAthletePreviewMode';
import { useAuth } from '@/hooks/useAuth';
import { useMyAthletePlans } from '@/hooks/useAthletePlans';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { usePrograms } from '@/hooks/usePrograms';
import { isTrainerRole } from '@/lib/athleteService';
import { filterActivePersonalizedPlanGroups, groupPersonalizedPlans } from '@/lib/personalizedPlanGroups';
import { isVenuePlaceholderProgram } from '@/lib/standardVenueCatalog';
import { isSessionBasedAthletePlanType } from '@/lib/trainerConstants';
import type { AthletePlan, Program } from '@/lib/types';

/**
 * Calendario del atleta + desplegable de programación actual (planes asignados
 * y programaciones de catálogo activas).
 */
export function AthleteCurrentSchedule({
  preferPersonalized = false,
  forceExpanded = false,
}: {
  preferPersonalized?: boolean;
  forceExpanded?: boolean;
} = {}) {
  const navigation = useNavigation();
  const { user: authUser, refreshUser } = useAuth();
  const user = useAthletePreviewEffectiveUser() ?? authUser;
  const preview = useAthletePreviewMode();
  const { isCeded: isCededAthlete } = useAthleteCededAccess();
  const showsAthleteExperience = useShowsAthleteExperience();
  const { getById } = usePrograms();
  const isTrainer = !preview.enabled && isTrainerRole(user?.role);
  const { plans: myAthletePlans, refresh: refreshAthletePlans } = useMyAthletePlans();
  /** Remonta menús para dejarlos siempre cerrados al volver al inicio. */
  const [menusKey, setMenusKey] = useState(0);

  const collapseMenus = useCallback(() => {
    setMenusKey((current) => current + 1);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (forceExpanded) return;
      collapseMenus();
    }, [collapseMenus, forceExpanded]),
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', () => {
      if (forceExpanded) return;
      collapseMenus();
    });
    return unsubscribe;
  }, [collapseMenus, forceExpanded, navigation]);

  useFocusRefresh(() => {
    if (showsAthleteExperience) {
      void refreshAthletePlans();
      void refreshUser(true);
    }
  });

  const catalogActivePrograms = useMemo(() => {
    if (isTrainer) return [] as Program[];

    const summaries = user?.currentPrograms ?? (user?.currentProgram ? [user.currentProgram] : []);
    return summaries
      .map((summary) => {
        const full = getById(summary.id);
        if (full) return full;
        return {
          id: summary.id,
          name: summary.name,
          category: 'standard' as const,
          level: 'principiante' as const,
          duration: '4 semanas' as const,
          sessionsPerWeek: summary.sessionsPerWeek,
          status: 'activa' as const,
          icon: (summary.icon as Program['icon']) ?? 'programs',
          description: '',
          equipment: [],
          trainingDays: [],
          weeks: [],
        } satisfies Program;
      })
      .filter((program) => !isVenuePlaceholderProgram(program) && program.category !== 'standard')
      .filter((program) => !isCededAthlete || program.category === 'nutrition');
  }, [getById, isCededAthlete, isTrainer, user?.currentProgram, user?.currentPrograms]);

  const allPersonalizedGroups = useMemo(
    () =>
      isTrainer
        ? []
        : groupPersonalizedPlans(
            myAthletePlans.filter((item) => isSessionBasedAthletePlanType(item.planType)),
          ),
    [isTrainer, myAthletePlans],
  );

  const activePersonalizedGroups = useMemo(
    () => filterActivePersonalizedPlanGroups(allPersonalizedGroups),
    [allPersonalizedGroups],
  );

  const cededNutritionPlanOptions = useMemo(() => {
    if (!isCededAthlete || isTrainer) return [] as AthletePlan[];

    return myAthletePlans.filter((plan) => plan.planType === 'nutrition');
  }, [isCededAthlete, isTrainer, myAthletePlans]);

  type CalendarSelection =
    | { kind: 'catalog'; id: string; name: string; program: Program }
    | { kind: 'plan'; id: string; name: string; plans: AthletePlan[] };

  const pickerOptions = useMemo((): CalendarSelection[] => {
    const planOptions: CalendarSelection[] = activePersonalizedGroups.map((group) => ({
      kind: 'plan',
      id: `plan:${group.id}`,
      name: group.title,
      plans: group.sessions,
    }));

    const nutritionOptions: CalendarSelection[] = cededNutritionPlanOptions.map((plan) => ({
      kind: 'plan',
      id: `plan:${plan.id}`,
      name: plan.title,
      plans: [plan],
    }));

    const catalogOptions: CalendarSelection[] = catalogActivePrograms.map((program) => ({
      kind: 'catalog',
      id: `catalog:${program.id}`,
      name: program.name,
      program,
    }));

    return [...planOptions, ...nutritionOptions, ...catalogOptions];
  }, [activePersonalizedGroups, cededNutritionPlanOptions, catalogActivePrograms]);

  const hasScheduleHistory = useMemo(() => {
    if (isTrainer) return false;
    return (
      allPersonalizedGroups.length > 0 ||
      catalogActivePrograms.length > 0 ||
      cededNutritionPlanOptions.length > 0
    );
  }, [
    allPersonalizedGroups.length,
    catalogActivePrograms.length,
    cededNutritionPlanOptions.length,
    isTrainer,
  ]);

  const [selectedPickerId, setSelectedPickerId] = useState<string | undefined>();

  useEffect(() => {
    if (pickerOptions.length === 0) {
      setSelectedPickerId(undefined);
      return;
    }

    setSelectedPickerId((current) => {
      if (preferPersonalized) {
        const personalized = pickerOptions.find((option) => option.kind === 'plan');
        if (personalized) return personalized.id;
      }

      if (current && pickerOptions.some((option) => option.id === current)) {
        return current;
      }

      if (user?.currentProgramId) {
        const catalogMatch = pickerOptions.find(
          (option) => option.kind === 'catalog' && option.program.id === user.currentProgramId,
        );
        if (catalogMatch) return catalogMatch.id;
      }

      return pickerOptions[0]?.id;
    });
  }, [pickerOptions, preferPersonalized, user?.currentProgramId]);

  const selectedPickerOption = pickerOptions.find((option) => option.id === selectedPickerId);

  if (!showsAthleteExperience) {
    return null;
  }

  if (!hasScheduleHistory) {
    if (!preview.enabled && !isCededAthlete) {
      return null;
    }

    const calendarHint = isCededAthlete
      ? 'Aquí verás tu calendario cuando tu entrenador te asigne un plan activo.'
      : 'Aquí verás el calendario de entreno cuando el atleta tenga una programación activa.';
    const programHint = isCededAthlete
      ? 'Tus planes asignados por tu entrenador aparecerán aquí.'
      : 'Los atletas eligen aquí entre sus planes asignados y las programaciones de catálogo activas.';

    return (
      <View style={styles.wrap} key={menusKey}>
        <CollapsibleSection title="Tu calendario" defaultExpanded={forceExpanded}>
          <Text style={styles.emptyHint}>{calendarHint}</Text>
        </CollapsibleSection>
        <CollapsibleSection title="Programación actual" defaultExpanded={forceExpanded}>
          <Text style={styles.emptyHint}>{programHint}</Text>
        </CollapsibleSection>
      </View>
    );
  }

  const activeProgramForCalendar =
    selectedPickerOption?.kind === 'catalog' ? selectedPickerOption.program : undefined;

  const programHint =
    pickerOptions.length === 0
      ? isCededAthlete
        ? 'No tienes programación activa. Las anteriores siguen en tu calendario.'
        : 'No tienes programación activa. Las anteriores siguen en tu calendario.'
      : null;

  return (
    <View style={styles.wrap} key={menusKey}>
      <CollapsibleSection title="Tu calendario" defaultExpanded={forceExpanded}>
        <AthleteScheduleCalendar program={activeProgramForCalendar} hideHeader />
      </CollapsibleSection>
      {pickerOptions.length > 0 && selectedPickerOption ? (
        <AthleteProgramPicker
          programs={pickerOptions.map((option) => ({
            id: option.id,
            name: option.name,
          }))}
          selectedId={selectedPickerOption.id}
          onSelect={setSelectedPickerId}
          defaultExpanded={forceExpanded}
        />
      ) : (
        <CollapsibleSection title="Programación actual" defaultExpanded={forceExpanded}>
          <Text style={styles.emptyHint}>{programHint}</Text>
        </CollapsibleSection>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  emptyHint: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
