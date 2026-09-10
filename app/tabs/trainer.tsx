import { StyleSheet, Text, View } from 'react-native';

import { AthleteTrainerChatScreen } from '@/components/chat/AthleteTrainerChatScreen';
import { CrmBoard } from '@/components/trainer/CrmBoard';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { isTrainerRole } from '@/lib/athleteService';

function TrainerAthletesScreen() {
  return (
    <ScreenWrapper scrollable={false} style={styles.crmScreen}>
      <View style={styles.crmHeader}>
        <Text style={styles.title}>Mis atletas</Text>
        <Text style={styles.crmSubtitle}>
          Mueve cada atleta entre columnas y crea las que necesites, como en un CRM
        </Text>
      </View>
      <CrmBoard />
    </ScreenWrapper>
  );
}

export default function TrainerScreen() {
  const { user } = useAuth();

  if (isTrainerRole(user?.role)) {
    return <TrainerAthletesScreen />;
  }

  return <AthleteTrainerChatScreen />;
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: colors.text, marginBottom: 4 },
  crmScreen: {
    paddingBottom: spacing.sm,
  },
  crmHeader: {
    marginBottom: spacing.sm,
  },
  crmSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
