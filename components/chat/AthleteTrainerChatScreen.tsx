import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TrainerChatPanel } from '@/components/trainer/TrainerChatPanel';
import { Card } from '@/components/ui/Card';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useAthleteIntakeForm } from '@/hooks/useAthleteIntakeForm';
import { useMyAthletePlans } from '@/hooks/useAthletePlans';
import { useAuth } from '@/hooks/useAuth';
import { useChatComposer } from '@/hooks/useChatComposer';
import { useTrainerMessages } from '@/hooks/useTrainerMessages';
import { isTrainerOnlyRole } from '@/lib/athleteService';
import { takeChatPrefill } from '@/lib/chatPrefill';
import { getFeedbackChatHref } from '@/lib/navigation';

export function AthleteTrainerChatScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const hideIntakeReminder = isTrainerOnlyRole(user?.role);
  const { prefill } = useLocalSearchParams<{ prefill?: string | string[] }>();
  const { messages, isEmpty, sendMessage } = useTrainerMessages();
  const { isComplete: intakeComplete, isLoading: intakeLoading, defaultTemplateId } = useAthleteIntakeForm();
  const { plans: personalizedPlans } = useMyAthletePlans('personalized');
  const composer = useChatComposer({
    allowVideoAttachments: personalizedPlans.length > 0,
    onSend: (text, attachments) => sendMessage(text, attachments),
  });

  const composerRef = useRef(composer);
  composerRef.current = composer;
  const appliedPrefillRef = useRef<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const paramMessage = Array.isArray(prefill) ? prefill[0] : prefill;
      const queuedMessage = takeChatPrefill();
      const message =
        typeof paramMessage === 'string' && paramMessage.trim()
          ? paramMessage
          : queuedMessage;

      if (message?.trim() && appliedPrefillRef.current !== message) {
        appliedPrefillRef.current = message;
        composerRef.current.onChangeMessage(message);
        if (typeof paramMessage === 'string' && paramMessage.trim()) {
          router.setParams({ prefill: '' });
        }
      }

      return () => {
        appliedPrefillRef.current = null;
        composerRef.current.clearComposer();
        router.setParams({ prefill: '' });
      };
    }, [prefill, router]),
  );

  const lastTrainerMsg = [...messages].reverse().find((message) => message.sender === 'trainer');
  const chatBlocked = !hideIntakeReminder && !intakeLoading && !intakeComplete;

  return (
    <ScreenWrapper scrollable={false} padded={false}>
      <View style={styles.container}>
        {chatBlocked ? (
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/profile/intake-form',
                params: {
                  returnTo: 'trainer',
                  ...(defaultTemplateId ? { templateId: defaultTemplateId } : {}),
                },
              })
            }
          >
            <Card style={styles.intakeBanner}>
              <Text style={styles.intakeBannerTitle}>Completa el formulario de bienvenida</Text>
              <Text style={styles.intakeBannerText}>
                Ayuda a tu entrenador a conocerte. Toca aquí para rellenarlo. Ya puedes escribirle
                mientras tanto.
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
          composer={composer}
          onOpenFeedback={(message) =>
            router.push(
              getFeedbackChatHref({
                asTrainer: false,
                athleteId: '',
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
  intakeBanner: {
    marginBottom: spacing.md,
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '11'),
  },
  intakeBannerTitle: { ...typography.body, color: colors.text, fontWeight: '700' },
  intakeBannerText: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs, lineHeight: 20 },
  lastMsg: { marginBottom: spacing.md },
  lastLabel: { ...typography.caption, color: colors.accent, fontWeight: '700', marginBottom: spacing.xs },
  lastText: { ...typography.body, color: colors.textSecondary },
});
