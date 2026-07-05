import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AthleteCard } from '@/components/trainer/AthleteCard';
import { TrainerChatPanel } from '@/components/trainer/TrainerChatPanel';
import { Card } from '@/components/ui/Card';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, spacing, typography } from '@/constants/theme';
import { useAthletes } from '@/hooks/useAthletes';
import { useAuth } from '@/hooks/useAuth';
import { useTrainerMessages } from '@/hooks/useTrainerMessages';
import { isTrainerRole } from '@/lib/athleteService';
import { takeChatPrefill } from '@/lib/chatPrefill';

function AthleteChatScreen() {
  const { prefill } = useLocalSearchParams<{ prefill?: string | string[] }>();
  const { messages, isEmpty, sendMessage } = useTrainerMessages();
  const [newMessage, setNewMessage] = useState('');

  useFocusEffect(
    useCallback(() => {
      const paramMessage = Array.isArray(prefill) ? prefill[0] : prefill;
      const queuedMessage = takeChatPrefill();
      const message =
        typeof paramMessage === 'string' && paramMessage.trim() ? paramMessage : queuedMessage;

      if (message?.trim()) {
        setNewMessage(message);
      }
    }, [prefill]),
  );

  const lastTrainerMsg = [...messages].reverse().find((message) => message.sender === 'trainer');

  const handleSendMessage = async () => {
    const sent = await sendMessage(newMessage);
    if (sent) setNewMessage('');
  };

  return (
    <ScreenWrapper scrollable={false} padded={false}>
      <View style={styles.container}>
        {lastTrainerMsg ? (
          <Card style={styles.lastMsg}>
            <Text style={styles.lastLabel}>Último mensaje del entrenador</Text>
            <Text style={styles.lastText}>{lastTrainerMsg.text}</Text>
          </Card>
        ) : null}

        <TrainerChatPanel
          title="Tu Entrenador"
          emptyTitle="Sin mensajes todavía"
          emptyText="Escribe a tu entrenador para empezar la conversación"
          messages={messages}
          isEmpty={isEmpty}
          newMessage={newMessage}
          onChangeMessage={setNewMessage}
          onSend={handleSendMessage}
        />
      </View>
    </ScreenWrapper>
  );
}

function TrainerAthletesScreen() {
  const router = useRouter();
  const { athletes, isLoading, isEmpty, error, refresh } = useAthletes();

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return (
    <ScreenWrapper>
      <Text style={styles.title}>Mis atletas</Text>
      <SectionHeader title="Fichas de atletas" subtitle="Accede al perfil y al chat de cada atleta" />

      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : isEmpty ? (
        <Card>
          <Text style={styles.emptyTitle}>Sin atletas registrados</Text>
          <Text style={styles.emptyText}>Cuando haya atletas en la plataforma, aparecerán aquí.</Text>
        </Card>
      ) : (
        athletes.map((athlete) => (
          <AthleteCard
            key={athlete.id}
            athlete={athlete}
            onPress={() => router.push({ pathname: '/trainer/athlete/[id]', params: { id: athlete.id } })}
          />
        ))
      )}
    </ScreenWrapper>
  );
}

export default function TrainerScreen() {
  const { user } = useAuth();

  if (isTrainerRole(user?.role)) {
    return <TrainerAthletesScreen />;
  }

  return <AthleteChatScreen />;
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md, paddingTop: spacing.md },
  title: { ...typography.h1, color: colors.text, marginBottom: 4 },
  loader: { marginTop: spacing.xl },
  error: { ...typography.bodySmall, color: colors.danger, marginTop: spacing.md },
  emptyTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  emptyText: { ...typography.bodySmall, color: colors.textSecondary },
  lastMsg: { marginBottom: spacing.md },
  lastLabel: { ...typography.caption, color: colors.accent, fontWeight: '700', marginBottom: spacing.xs },
  lastText: { ...typography.body, color: colors.textSecondary },
});
