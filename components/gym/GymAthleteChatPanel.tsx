import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { TrainerChatPanel } from '@/components/trainer/TrainerChatPanel';
import { Card } from '@/components/ui/Card';
import { colors, spacing, typography } from '@/constants/theme';
import { useChatComposer } from '@/hooks/useChatComposer';
import { useGymMemberMessages } from '@/hooks/useGymMemberMessages';

interface GymAthleteChatPanelProps {
  gymId: string;
  memberId: string;
  gymName: string;
}

export function GymAthleteChatPanel({ gymId, memberId, gymName }: GymAthleteChatPanelProps) {
  const { messages, isEmpty, sendMessage, error, refresh, isLoading } = useGymMemberMessages({
    gymId,
    memberId,
    asStaff: false,
  });

  const composer = useChatComposer({
    attachmentsEnabled: false,
    onSend: async (text) => sendMessage(text),
  });

  if (isLoading) {
    return <ActivityIndicator color={colors.accent} style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      {error ? (
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorAction} onPress={() => void refresh()}>
            Reintentar
          </Text>
        </Card>
      ) : null}

      <TrainerChatPanel
        title={gymName}
        subtitle="Chat con el gimnasio"
        emptyTitle="Sin mensajes todavía"
        emptyText="Escribe al gimnasio si tienes alguna duda"
        messages={messages}
        isEmpty={isEmpty}
        viewerRole="user"
        composer={composer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 420,
    gap: spacing.sm,
  },
  loader: {
    marginTop: spacing.lg,
  },
  errorCard: {
    gap: spacing.xs,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.danger,
  },
  errorAction: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '700',
  },
});
