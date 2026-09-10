import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { TrainerChatPanel } from '@/components/trainer/TrainerChatPanel';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, spacing } from '@/constants/theme';
import { useAthlete } from '@/hooks/useAthletes';
import { useChatComposer } from '@/hooks/useChatComposer';
import { useCanManageAthleteChat } from '@/hooks/useCanManageAthleteChat';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { useTrainerMessages } from '@/hooks/useTrainerMessages';
import { useTrainerNotifications } from '@/hooks/useTrainerNotifications';
import { getFeedbackChatHref } from '@/lib/navigation';

export default function TrainerAthleteChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const athleteId = id ?? '';
  const { athlete, isLoading: loadingAthlete } = useAthlete(athleteId);
  const canChat = useCanManageAthleteChat(athleteId);
  const { messages, isEmpty, sendMessage } = useTrainerMessages({ athleteId, asTrainer: true });
  const { acknowledgeChat } = useTrainerNotifications();

  const composer = useChatComposer({
    onSend: (text, attachments) => sendMessage(text, attachments),
  });

  useFocusRefresh(() => {
    if (athleteId && canChat) {
      void acknowledgeChat(athleteId);
    }
  });

  if (loadingAthlete || canChat === null) {
    return (
      <ScreenWrapper scrollable={false}>
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      </ScreenWrapper>
    );
  }

  if (!athlete || !canChat) {
    return (
      <ScreenWrapper>
        <Text style={styles.error}>No puedes abrir este chat. El atleta está asignado a otro entrenador.</Text>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scrollable={false} padded={false}>
      <View style={styles.container}>
        <TrainerChatPanel
          title={athlete.name}
          subtitle={athlete.email}
          emptyTitle="Sin mensajes todavía"
          emptyText="Envía el primer mensaje a este atleta"
          messages={messages}
          isEmpty={isEmpty}
          viewerRole="trainer"
          composer={composer}
          onOpenFeedback={(message) =>
            router.push(
              getFeedbackChatHref({
                asTrainer: true,
                athleteId,
                sessionLogId: message.sessionLogId,
                scheduledDate: message.scheduledDate,
              }),
            )
          }
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md, paddingTop: spacing.md },
  loader: { marginTop: spacing.xl },
  error: { color: colors.danger },
});
