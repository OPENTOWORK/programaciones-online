import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CrmBoard } from '@/components/trainer/CrmBoard';
import { TrainerChatPanel } from '@/components/trainer/TrainerChatPanel';
import { Card } from '@/components/ui/Card';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, spacing, typography } from '@/constants/theme';
import { useAthleteIntakeForm } from '@/hooks/useAthleteIntakeForm';
import { useAuth } from '@/hooks/useAuth';
import { useChatComposer } from '@/hooks/useChatComposer';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { useTrainerMessages } from '@/hooks/useTrainerMessages';
import { isTrainerRole } from '@/lib/athleteService';
import { takeChatPrefill } from '@/lib/chatPrefill';

function AthleteChatScreen() {
  const router = useRouter();
  const { prefill } = useLocalSearchParams<{ prefill?: string | string[] }>();
  const { messages, isEmpty, sendMessage } = useTrainerMessages();
  const { isComplete: intakeComplete, isLoading: intakeLoading } = useAthleteIntakeForm();
  const composer = useChatComposer({
    disabled: !intakeLoading && !intakeComplete,
    onSend: (text, attachments) => sendMessage(text, attachments),
  });

  useFocusRefresh(() => {
    const paramMessage = Array.isArray(prefill) ? prefill[0] : prefill;
    const queuedMessage = takeChatPrefill();
    const message =
      typeof paramMessage === 'string' && paramMessage.trim() ? paramMessage : queuedMessage;

    if (message?.trim()) {
      composer.onChangeMessage(message);
    }
  });

  const lastTrainerMsg = [...messages].reverse().find((message) => message.sender === 'trainer');
  const chatBlocked = !intakeLoading && !intakeComplete;

  return (
    <ScreenWrapper scrollable={false} padded={false}>
      <View style={styles.container}>
        {chatBlocked ? (
          <Pressable onPress={() => router.push({ pathname: '/profile/intake-form', params: { returnTo: 'trainer' } })}>
            <Card style={styles.intakeBanner}>
              <Text style={styles.intakeBannerTitle}>Completa el formulario de bienvenida</Text>
              <Text style={styles.intakeBannerText}>
                Es imprescindible para poder contactar con tu entrenador y empezar tu entrenamiento
                online. Toca aquí para rellenarlo.
              </Text>
            </Card>
          </Pressable>
        ) : null}

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
          disabled={chatBlocked}
          disabledMessage="Completa el formulario de bienvenida para escribir"
          composer={composer}
        />
      </View>
    </ScreenWrapper>
  );
}

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

  return <AthleteChatScreen />;
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md, paddingTop: spacing.md },
  title: { ...typography.h1, color: colors.text, marginBottom: 4 },
  intakeBanner: {
    marginBottom: spacing.md,
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}11`,
  },
  intakeBannerTitle: { ...typography.body, color: colors.text, fontWeight: '700' },
  intakeBannerText: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs, lineHeight: 20 },
  lastMsg: { marginBottom: spacing.md },
  lastLabel: { ...typography.caption, color: colors.accent, fontWeight: '700', marginBottom: spacing.xs },
  lastText: { ...typography.body, color: colors.textSecondary },
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
