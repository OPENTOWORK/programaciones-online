import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { GymErrorBanner, GymScreen } from '@/components/gym/GymScreen';
import { TrainerChatPanel } from '@/components/trainer/TrainerChatPanel';
import { AppIcon } from '@/components/ui/AppIcon';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, spacing, typography } from '@/constants/theme';
import { useGym } from '@/hooks/useGym';
import { useChatComposer } from '@/hooks/useChatComposer';
import { useGymChatInbox } from '@/hooks/useGymChatInbox';
import { useGymMemberMessages } from '@/hooks/useGymMemberMessages';
import { gymMemberFullName } from '@/lib/gymTypes';

export default function GymMemberChatScreen() {
  const router = useRouter();
  const { memberId } = useLocalSearchParams<{ memberId: string }>();
  const { gym } = useGym();
  const { conversations } = useGymChatInbox();
  const member = conversations.find((item) => item.member.id === memberId)?.member;
  const { messages, isEmpty, sendMessage, error, refresh, isLoading } = useGymMemberMessages({
    gymId: gym?.id,
    memberId,
    asStaff: true,
  });

  const composer = useChatComposer({
    attachmentsEnabled: false,
    onSend: async (text) => sendMessage(text),
  });

  if (!gym || (isLoading && !member)) {
    return (
      <GymScreen>
        <ScreenWrapper scrollable={false}>
          <ActivityIndicator color={colors.accent} style={styles.loader} />
        </ScreenWrapper>
      </GymScreen>
    );
  }

  if (!member) {
    return (
      <GymScreen>
        <ScreenWrapper>
          <Text style={styles.error}>No se encontró este miembro.</Text>
        </ScreenWrapper>
      </GymScreen>
    );
  }

  const subtitle = member.userId
    ? member.email ?? member.phone ?? 'Cuenta vinculada'
    : 'El miembro no podrá responder hasta vincular su cuenta en la app';

  return (
    <GymScreen>
      <ScreenWrapper scrollable={false} padded={false}>
        <View style={styles.container}>
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button">
              <AppIcon name="chevronLeft" size={20} color={colors.text} />
            </Pressable>
            <View style={styles.topCopy}>
              <Text style={styles.topTitle}>{gymMemberFullName(member)}</Text>
              <Text style={styles.topSubtitle} numberOfLines={1}>{subtitle}</Text>
            </View>
          </View>

          {error ? <GymErrorBanner message={error} onRetry={refresh} /> : null}

          <TrainerChatPanel
            emptyTitle="Sin mensajes todavía"
            emptyText="Envía el primer mensaje a este miembro"
            messages={messages}
            isEmpty={isEmpty}
            viewerRole="trainer"
            composer={composer}
          />
        </View>
      </ScreenWrapper>
    </GymScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCopy: {
    flex: 1,
    minWidth: 0,
  },
  topTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  topSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  loader: {
    marginTop: spacing.xl,
  },
  error: {
    color: colors.danger,
  },
});
