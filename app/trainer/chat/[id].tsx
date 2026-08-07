import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { TrainerChatPanel } from '@/components/trainer/TrainerChatPanel';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, spacing } from '@/constants/theme';
import { useAthlete } from '@/hooks/useAthletes';
import { useChatComposer } from '@/hooks/useChatComposer';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { useTrainerMessages } from '@/hooks/useTrainerMessages';
import { markAthleteAlertRead } from '@/lib/trainerAthleteAlerts';

export default function TrainerAthleteChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const athleteId = id ?? '';
  const { athlete, isLoading: loadingAthlete } = useAthlete(athleteId);
  const { messages, isEmpty, sendMessage } = useTrainerMessages({ athleteId, asTrainer: true });

  const composer = useChatComposer({
    onSend: (text, attachments) => sendMessage(text, attachments),
  });

  useFocusRefresh(() => {
    if (athleteId) {
      void markAthleteAlertRead(athleteId, 'chat');
    }
  });

  if (loadingAthlete) {
    return (
      <ScreenWrapper scrollable={false}>
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scrollable={false} padded={false}>
      <View style={styles.container}>
        <TrainerChatPanel
          title={athlete?.name ?? 'Chat con atleta'}
          subtitle={athlete?.email}
          emptyTitle="Sin mensajes todavía"
          emptyText="Envía el primer mensaje a este atleta"
          messages={messages}
          isEmpty={isEmpty}
          viewerRole="trainer"
          composer={composer}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md, paddingTop: spacing.md },
  loader: { marginTop: spacing.xl },
});
