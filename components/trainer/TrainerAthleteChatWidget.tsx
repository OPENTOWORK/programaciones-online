import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { TrainerChatPanel } from '@/components/trainer/TrainerChatPanel';
import { HoverTooltip } from '@/components/ui/HoverTooltip';
import { borderRadius, colors, shadows, spacing, typography } from '@/constants/theme';
import { useChatComposer } from '@/hooks/useChatComposer';
import { useCanManageAthleteChat } from '@/hooks/useCanManageAthleteChat';
import { useTrainerMessages } from '@/hooks/useTrainerMessages';
import { getFeedbackChatHref } from '@/lib/navigation';
import { markAthleteAlertRead } from '@/lib/trainerAthleteAlerts';

interface TrainerAthleteChatWidgetProps {
  athleteId: string;
  athleteName: string;
  unreadCount?: number;
}

export function TrainerAthleteChatWidget({
  athleteId,
  athleteName,
  unreadCount = 0,
}: TrainerAthleteChatWidgetProps) {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const canChat = useCanManageAthleteChat(athleteId);
  const { messages, isEmpty, sendMessage } = useTrainerMessages({ athleteId, asTrainer: true });

  const composer = useChatComposer({
    onSend: (text, attachments) => sendMessage(text, attachments),
  });

  const panelWidth = Math.min(360, width - spacing.lg * 2);
  const panelHeight = Math.min(440, height * 0.52);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && athleteId && canChat) {
      void markAthleteAlertRead(athleteId, 'chat');
    }
  }, [athleteId, canChat, open]);

  const openFullChat = () => {
    setOpen(false);
    router.push({ pathname: '/trainer/chat/[id]', params: { id: athleteId } });
  };

  if (canChat !== true) return null;

  return (
    <View style={styles.root} pointerEvents="box-none">
      {open ? (
        <View style={[styles.panel, { width: panelWidth, height: panelHeight }]}>
          <View style={styles.panelHeader}>
            <View style={styles.panelHeaderText}>
              <Text style={styles.panelTitle} numberOfLines={1}>
                Chat con {athleteName}
              </Text>
            </View>
            <View style={styles.panelHeaderActions}>
              <Pressable
                onPress={openFullChat}
                accessibilityLabel="Maximizar chat"
                style={({ pressed }) => [styles.panelHeaderBtn, pressed && styles.panelHeaderBtnPressed]}
              >
                <Ionicons name="expand-outline" size={18} color={colors.textSecondary} />
              </Pressable>
              <Pressable
                onPress={() => setOpen(false)}
                accessibilityLabel="Minimizar chat"
                style={({ pressed }) => [styles.panelHeaderBtn, pressed && styles.panelHeaderBtnPressed]}
              >
                <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
          </View>

          <View style={styles.panelBody}>
            <TrainerChatPanel
              emptyTitle="Sin mensajes todavía"
              emptyText={`Envía el primer mensaje a ${athleteName}`}
              messages={messages}
              isEmpty={isEmpty}
              viewerRole="trainer"
              compact
              composer={composer}
              onOpenFeedback={(message) => {
                setOpen(false);
                router.push(
                  getFeedbackChatHref({
                    asTrainer: true,
                    athleteId,
                    sessionLogId: message.sessionLogId,
                    scheduledDate: message.scheduledDate,
                  }),
                );
              }}
            />
          </View>
        </View>
      ) : null}

      <HoverTooltip label={`Chat con ${athleteName}`}>
        <Pressable
          onPress={() => setOpen((current) => !current)}
          accessibilityLabel={`Chat con ${athleteName}`}
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        >
          <Ionicons name={open ? 'close' : 'chatbubbles-outline'} size={22} color={colors.white} />
          {!open && unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </HoverTooltip>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    zIndex: 25,
    alignItems: 'flex-end',
  },
  panel: {
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    ...shadows.card,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  panelHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  panelTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  panelHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  panelHeaderBtn: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  panelHeaderBtnPressed: {
    opacity: 0.85,
  },
  panelBody: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  fab: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentDark,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    ...shadows.card,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  fabPressed: {
    opacity: 0.9,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
    borderWidth: 2,
    borderColor: colors.background,
  },
  badgeText: {
    ...typography.caption,
    color: colors.white,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
  },
});
