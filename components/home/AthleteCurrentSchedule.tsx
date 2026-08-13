import { useFocusEffect, useNavigation } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AthleteProgramPicker } from '@/components/program/AthleteProgramPicker';
import { AthleteScheduleCalendar } from '@/components/schedule/AthleteScheduleCalendar';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useMyAthletePlans } from '@/hooks/useAthletePlans';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { usePrograms } from '@/hooks/usePrograms';
import { isTrainerRole } from '@/lib/athleteService';
import { groupPersonalizedPlans } from '@/lib/personalizedPlanGroups';
import { isVenuePlaceholderProgram } from '@/lib/standardVenueCatalog';
import type { AthletePlan, Program } from '@/lib/types';

const NO_ASSIGNED_PLANS: AthletePlan[] = [];

/**
 * Calendario del atleta + desplegable de programación actual (planes asignados
 * y programaciones de catálogo activas).
 */
export function AthleteCurrentSchedule() {
  const navigation = useNavigation();
  const { user, refreshUser } = useAuth();
  const { getById } = usePrograms();
  const isTrainer = isTrainerRole(user?.role);
  const { plans: myAthletePlans, refresh: refreshAthletePlans } = useMyAthletePlans(
    isTrainer ? undefined : 'personalized',
  );
  /** Remonta menús para dejarlos siempre cerrados al volver al inicio. */
  const [menusKey, setMenusKey] = useState(0);

  const collapseMenus = useCallback(() => {
    setMenusKey((current) => current + 1);
  }, []);

  useFocusEffect(
    useCallback(() => {
      collapseMenus();
    }, [collapseMenus]),
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', () => {
      collapseMenus();
    });
    return unsubscribe;
  }, [collapseMenus, navigation]);

  useFocusRefresh(() => {
    if (!isTrainer) {
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
      .filter((program) => !isVenuePlaceholderProgram(program));
  }, [getById, isTrainer, user?.currentProgram, user?.currentPrograms]);

  const assignedPersonalizedGroups = useMemo(
    () =>
      isTrainer
        ? []
        : groupPersonalizedPlans(myAthletePlans.filter((item) => item.planType === 'personalized')),
    [isTrainer, myAthletePlans],
  );

  type CalendarSelection =
    | { kind: 'catalog'; id: string; name: string; program: Program }
    | { kind: 'plan'; id: string; name: string; plans: AthletePlan[] };

  const calendarOptions = useMemo((): CalendarSelection[] => {
    const planOptions: CalendarSelection[] = assignedPersonalizedGroups.map((group) => ({
      kind: 'plan',
      id: `plan:${group.id}`,
      name: group.title,
      plans: group.sessions,
    }));

    const catalogOptions: CalendarSelection[] = catalogActivePrograms.map((program) => ({
      kind: 'catalog',
      id: `catalog:${program.id}`,
      name: program.name,
      program,
    }));

    return [...planOptions, ...catalogOptions];
  }, [assignedPersonalizedGroups, catalogActivePrograms]);

  const [selectedCalendarId, setSelectedCalendarId] = useState<string | undefined>();

  useEffect(() => {
    if (calendarOptions.length === 0) {
      setSelectedCalendarId(undefined);
      return;
    }

    setSelectedCalendarId((current) => {
      if (current && calendarOptions.some((option) => option.id === current)) {
        return current;
      }

      if (user?.currentProgramId) {
        const catalogMatch = calendarOptions.find(
          (option) => option.kind === 'catalog' && option.program.id === user.currentProgramId,
        );
        if (catalogMatch) return catalogMatch.id;
      }

      return calendarOptions[0]?.id;
    });
  }, [calendarOptions, user?.currentProgramId]);

  const selectedCalendar = calendarOptions.find((option) => option.id === selectedCalendarId);

  if (isTrainer || !selectedCalendar || calendarOptions.length === 0) {
    return null;
  }

  const activeProgramForCalendar =
    selectedCalendar.kind === 'catalog' ? selectedCalendar.program : undefined;
  const assignedPlansForCalendar =
    selectedCalendar.kind === 'plan' ? selectedCalendar.plans : NO_ASSIGNED_PLANS;

  return (
    <View style={styles.wrap} key={menusKey}>
      <CollapsibleSection title="Tu calendario" defaultExpanded={false}>
        <AthleteScheduleCalendar
          program={activeProgramForCalendar}
          assignedPlans={assignedPlansForCalendar}
          hideHeader
        />
      </CollapsibleSection>
      <AthleteProgramPicker
        programs={calendarOptions.map((option) => ({
          id: option.id,
          name: option.name,
        }))}
        selectedId={selectedCalendar.id}
        onSelect={setSelectedCalendarId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
});
