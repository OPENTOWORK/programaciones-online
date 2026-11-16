import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppointmentFormModal } from '@/components/appointments/AppointmentFormModal';
import { TrainerChatPanel } from '@/components/trainer/TrainerChatPanel';
import { Card } from '@/components/ui/Card';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useAppointments } from '@/hooks/useAppointments';
import { useAthleteIntakeForm } from '@/hooks/useAthleteIntakeForm';
import { useMyAthletePlans } from '@/hooks/useAthletePlans';
import { useAuth } from '@/hooks/useAuth';
import { useChatComposer } from '@/hooks/useChatComposer';
import { useTrainerMessages } from '@/hooks/useTrainerMessages';
import { isTrainerOnlyRole } from '@/lib/athleteService';
import { takeChatPrefill } from '@/lib/chatPrefill';
import { getFeedbackChatHref } from '@/lib/navigation';
import type { AppointmentDraft } from '@/lib/appointmentService';

type SlotKind = 'call' | 'video';

function formatProposedSlot(kind: SlotKind, startsAt: string) {
  const when = new Date(startsAt).toLocaleString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
  return kind === 'video' ? `Propongo una videollamada el ${when}.` : `Propongo una llamada el ${when}.`;
}

export function AthleteTrainerChatScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const hideIntakeReminder = isTrainerOnlyRole(user?.role);
  const { prefill } = useLocalSearchParams<{ prefill?: string | string[] }>();
  const { messages, isEmpty, sendMessage } = useTrainerMessages();
  const { isComplete: intakeComplete, isLoading: intakeLoading, defaultTemplateId } = useAthleteIntakeForm();
  const { plans: personalizedPlans } = useMyAthletePlans('personalized');
  const { create: createAppointment } = useAppointments();
  const [slotKind, setSlotKind] = useState<SlotKind | null>(null);
  const [savingSlot, setSavingSlot] = useState(false);
  const [slotNotice, setSlotNotice] = useState<string | null>(null);
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

  const proposeSlot = useCallback(
    async (draft: AppointmentDraft) => {
      if (!slotKind) return;
      setSavingSlot(true);
      const result = await createAppointment(draft);
      setSavingSlot(false);

      if (!result.appointment) {
        setSlotNotice(result.error ?? 'No se pudo fijar la fecha.');
        return;
      }

      const line = formatProposedSlot(slotKind, result.appointment.startsAt);
      const current = composerRef.current.newMessage.trim();
      composerRef.current.onChangeMessage(current ? `${current}\n\n${line}` : line);
      setSlotNotice('Fecha añadida al mensaje. Revísala y envíala.');
      setSlotKind(null);
    },
    [createAppointment, slotKind],
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

        <View style={styles.slotRow}>
          <Pressable
            onPress={() => setSlotKind('call')}
            accessibilityRole="button"
            accessibilityLabel="Fijar una llamada"
            style={({ pressed }) => [styles.slotButton, pressed && styles.slotButtonPressed]}
          >
            <Text style={styles.slotButtonText}>Fijar llamada</Text>
          </Pressable>
          <Pressable
            onPress={() => setSlotKind('video')}
            accessibilityRole="button"
            accessibilityLabel="Fijar una videollamada"
            style={({ pressed }) => [styles.slotButton, pressed && styles.slotButtonPressed]}
          >
            <Text style={styles.slotButtonText}>Fijar videollamada</Text>
          </Pressable>
        </View>
        {slotNotice ? <Text style={styles.slotNotice}>{slotNotice}</Text> : null}

        <TrainerChatPanel
          title="Equipo Training ProgLine"
          emptyTitle="Sin mensajes todavía"
          emptyText="El mensaje ya está escrito. Puedes fijar una llamada o videollamada y enviarlo."
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
        <AppointmentFormModal
          visible={slotKind !== null}
          isTrainer={false}
          athletes={[]}
          initialDate={new Date()}
          saving={savingSlot}
          appointmentKind={slotKind ?? 'video'}
          onClose={() => setSlotKind(null)}
          onSubmit={(draft) => void proposeSlot(draft)}
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
  slotRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  slotButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '14'),
  },
  slotButtonPressed: {
    opacity: 0.85,
  },
  slotButtonText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
    textAlign: 'center',
  },
  slotNotice: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
