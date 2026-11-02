import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { AthleteTrainerChatScreen } from '@/components/chat/AthleteTrainerChatScreen';
import { CrmBoard } from '@/components/trainer/CrmBoard';
import { TrainerClientsTable } from '@/components/trainer/TrainerClientsTable';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, spacing, typography } from '@/constants/theme';
import { useAthletePreviewMode } from '@/hooks/useAthletePreviewMode';
import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { isTrainerRole } from '@/lib/athleteService';
import { getTrainerAthleteDetailsHref, getTrainerAthleteProfileHref } from '@/lib/navigation';
import { EMPTY_TRAINER_OVERVIEW, fetchTrainerOverview, type TrainerOverview } from '@/lib/trainerOverview';

const TABLE_BREAKPOINT = 900;

function TrainerAthletesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const tableLayout = width >= TABLE_BREAKPOINT;

  const [overview, setOverview] = useState<TrainerOverview>(EMPTY_TRAINER_OVERVIEW);
  const [overviewLoading, setOverviewLoading] = useState(true);

  const loadOverview = useCallback(async () => {
    if (!user?.id) {
      setOverview(EMPTY_TRAINER_OVERVIEW);
      setOverviewLoading(false);
      return;
    }

    setOverviewLoading(true);
    try {
      setOverview(await fetchTrainerOverview(user.id));
    } catch {
      setOverview(EMPTY_TRAINER_OVERVIEW);
    } finally {
      setOverviewLoading(false);
    }
  }, [user?.id]);

  useFocusRefresh(loadOverview);

  const openClientCalendar = useCallback(
    (athleteId: string) => {
      router.push(getTrainerAthleteProfileHref(athleteId));
    },
    [router],
  );

  const openClientDetails = useCallback(
    (athleteId: string) => {
      router.push(getTrainerAthleteDetailsHref(athleteId));
    },
    [router],
  );

  return (
    <ScreenWrapper style={styles.screen}>
      <View style={styles.page}>
        <Text style={styles.title}>Mis atletas</Text>

        <CollapsibleSection title="Tablero CRM" style={styles.crmCollapsible}>
          <CrmBoard embedded />
        </CollapsibleSection>

        <View style={styles.listSection}>
          <TrainerClientsTable
            clients={overview.clients}
            loading={overviewLoading}
            wide={tableLayout}
            onOpenClient={openClientCalendar}
            onOpenClientDetails={openClientDetails}
            onOpenClientCalendar={openClientCalendar}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}

export default function TrainerScreen() {
  const { user } = useAuth();
  const preview = useAthletePreviewMode();

  if (isTrainerRole(user?.role) && !preview.enabled) {
    return <TrainerAthletesScreen />;
  }

  return <AthleteTrainerChatScreen />;
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: spacing.xl,
  },
  page: {
    gap: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  crmCollapsible: {
    marginBottom: 0,
    overflow: 'visible',
  },
  listSection: {
    gap: spacing.sm,
  },
});
