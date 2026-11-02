import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { TrainerBroadcastModal } from '@/components/trainer/TrainerBroadcastModal';
import { TrainerChatPanel } from '@/components/trainer/TrainerChatPanel';
import { AppIcon } from '@/components/ui/AppIcon';
import { Card } from '@/components/ui/Card';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useAthlete, useAthletes } from '@/hooks/useAthletes';
import { useChatComposer } from '@/hooks/useChatComposer';
import { useCanManageAthleteChat } from '@/hooks/useCanManageAthleteChat';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { useTrainerBroadcast } from '@/hooks/useTrainerBroadcast';
import {
  trainerConversationUnread,
  useTrainerChatInbox,
  type TrainerChatConversation,
} from '@/hooks/useTrainerChatInbox';
import { useTrainerDesktopWebLayout, useTrainerMobileLayout } from '@/hooks/useTrainerMobileLayout';
import { useTrainerMessages } from '@/hooks/useTrainerMessages';
import { useTrainerNotifications } from '@/hooks/useTrainerNotifications';
import { getFeedbackChatHref } from '@/lib/navigation';

function formatChatTime(iso?: string) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Ayer';

  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

function previewCopy(conversation: TrainerChatConversation) {
  const text = conversation.preview?.lastText.trim();
  if (!text) {
    return conversation.preview ? 'Adjunto' : 'Empieza la conversación';
  }
  return conversation.preview?.lastSender === 'trainer' ? `Tú: ${text}` : text;
}

function ConversationRow({
  conversation,
  selected = false,
  onPress,
}: {
  conversation: TrainerChatConversation;
  selected?: boolean;
  onPress: () => void;
}) {
  const unread = trainerConversationUnread(conversation);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Chat con ${conversation.athlete.name}`}
      style={({ pressed }) => [
        styles.row,
        selected && styles.rowSelected,
        pressed && styles.rowPressed,
      ]}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{conversation.athlete.avatarInitials}</Text>
      </View>
      <View style={styles.rowCopy}>
        <View style={styles.rowTop}>
          <Text style={styles.rowName} numberOfLines={1}>
            {conversation.athlete.name}
          </Text>
          <Text style={[styles.rowTime, unread > 0 && styles.rowTimeUnread]}>
            {formatChatTime(conversation.preview?.lastAt)}
          </Text>
        </View>
        <View style={styles.rowBottom}>
          <Text style={[styles.rowPreview, unread > 0 && styles.rowPreviewUnread]} numberOfLines={1}>
            {previewCopy(conversation)}
          </Text>
          {unread > 0 ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unread > 99 ? '99+' : unread}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function SelectedAthleteChat({
  athleteId,
  onChatRead,
}: {
  athleteId: string;
  onChatRead?: () => void;
}) {
  const router = useRouter();
  const { athlete, isLoading: loadingAthlete } = useAthlete(athleteId);
  const canChat = useCanManageAthleteChat(athleteId);
  const { messages, isEmpty, sendMessage } = useTrainerMessages({ athleteId, asTrainer: true });
  const { acknowledgeChat } = useTrainerNotifications();

  const composer = useChatComposer({
    onSend: (text, attachments) => sendMessage(text, attachments),
  });

  const markRead = useCallback(() => {
    if (!athleteId || !canChat) return;
    onChatRead?.();
    void acknowledgeChat(athleteId);
  }, [acknowledgeChat, athleteId, canChat, onChatRead]);

  useFocusRefresh(markRead);

  useEffect(() => {
    markRead();
  }, [markRead]);

  if (loadingAthlete || canChat === null) {
    return <ActivityIndicator color={colors.accent} style={styles.threadLoader} />;
  }

  if (!athlete || !canChat) {
    return (
      <View style={styles.threadEmpty}>
        <Text style={styles.threadEmptyTitle}>Chat no disponible</Text>
        <Text style={styles.threadEmptyText}>
          No puedes abrir este chat. El atleta está asignado a otro entrenador.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.threadInner}>
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
  );
}

export default function TrainerChatsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ athleteId?: string | string[] }>();
  const selectedAthleteId = Array.isArray(params.athleteId) ? params.athleteId[0] : params.athleteId;
  const isDesktopTrainer = useTrainerDesktopWebLayout();
  const isMobileLayout = useTrainerMobileLayout();
  const isSplitLayout = isDesktopTrainer && !isMobileLayout;
  const { conversations, isLoading, error, refresh, patchPreviewUnread } = useTrainerChatInbox();
  const { athletes } = useAthletes();
  const [query, setQuery] = useState('');
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const broadcast = useTrainerBroadcast();

  const unreadCount = useMemo(
    () =>
      conversations.filter((conversation) => trainerConversationUnread(conversation) > 0).length,
    [conversations],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return conversations.filter((conversation) => {
      if (onlyUnread && trainerConversationUnread(conversation) === 0) {
        return false;
      }
      if (!needle) return true;
      const haystack = `${conversation.athlete.name} ${conversation.athlete.email}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [conversations, onlyUnread, query]);

  const openChat = (athleteId: string) => {
    if (isSplitLayout) {
      router.replace({ pathname: '/trainer/chats', params: { athleteId } });
      return;
    }
    router.push({ pathname: '/trainer/chat/[id]', params: { id: athleteId } });
  };

  const selectedAthlete = useMemo(
    () => conversations.find((item) => item.athlete.id === selectedAthleteId)?.athlete,
    [conversations, selectedAthleteId],
  );

  const openBroadcast = () => {
    broadcast.reset();
    setBroadcastOpen(true);
    void broadcast.loadGroups(athletes);
  };

  return (
    <ScreenWrapper scrollable={false} padded={false}>
      <View style={[styles.page, isSplitLayout && styles.pageSplit]}>
        <View style={[styles.inbox, isSplitLayout ? styles.inboxSplit : styles.inboxMobile]}>
          <View style={[styles.header, isSplitLayout && styles.headerSplit]}>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Chats</Text>
              <Text style={styles.subtitle} numberOfLines={isSplitLayout ? 2 : undefined}>
                Conversaciones con tus atletas
              </Text>
            </View>
            <Pressable
              onPress={openBroadcast}
              accessibilityRole="button"
              accessibilityLabel="Envío masivo"
              style={({ pressed }) => [
                styles.broadcastBtn,
                isSplitLayout && styles.broadcastBtnSplit,
                pressed && styles.rowPressed,
              ]}
            >
              <AppIcon name="trainer" size={15} color={colors.accent} outlined />
              <Text style={styles.broadcastBtnText}>Envío masivo</Text>
            </Pressable>
          </View>

          <View style={styles.searchWrap}>
            <AppIcon name="search" size={16} color={colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar atleta"
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
            />
            {query ? (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <AppIcon name="close" size={16} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>

          <View style={styles.filterRow}>
            <Pressable
              onPress={() => setOnlyUnread(false)}
              accessibilityRole="button"
              accessibilityState={{ selected: !onlyUnread }}
              style={({ pressed }) => [
                styles.filterChip,
                !onlyUnread && styles.filterChipActive,
                pressed && styles.rowPressed,
              ]}
            >
              <Text style={[styles.filterChipText, !onlyUnread && styles.filterChipTextActive]}>
                Todos · {conversations.length}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setOnlyUnread(true)}
              accessibilityRole="button"
              accessibilityState={{ selected: onlyUnread }}
              style={({ pressed }) => [
                styles.filterChip,
                onlyUnread && styles.filterChipActive,
                pressed && styles.rowPressed,
              ]}
            >
              <Text style={[styles.filterChipText, onlyUnread && styles.filterChipTextActive]}>
                Sin leer · {unreadCount}
              </Text>
            </Pressable>
          </View>

          {isLoading ? (
            <ActivityIndicator color={colors.accent} style={styles.loader} />
          ) : error ? (
            <Text style={styles.error}>{error}</Text>
          ) : filtered.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                {query.trim() || onlyUnread ? 'Sin coincidencias' : 'Todavía no hay chats'}
              </Text>
              <Text style={styles.emptyText}>
                {onlyUnread
                  ? 'No tienes mensajes sin leer.'
                  : query.trim()
                    ? 'Prueba con otro nombre o correo.'
                    : 'Cuando un atleta te escriba, o tú le envíes un mensaje, aparecerá aquí.'}
              </Text>
            </Card>
          ) : (
            <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
              {filtered.map((conversation) => (
                <ConversationRow
                  key={conversation.athlete.id}
                  conversation={conversation}
                  selected={isSplitLayout && selectedAthleteId === conversation.athlete.id}
                  onPress={() => openChat(conversation.athlete.id)}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {isSplitLayout ? (
          <View style={styles.thread}>
            {selectedAthlete ? (
              <SelectedAthleteChat
                key={selectedAthlete.id}
                athleteId={selectedAthlete.id}
                onChatRead={() => patchPreviewUnread(selectedAthlete.id)}
              />
            ) : (
              <View style={styles.threadEmpty}>
                <AppIcon name="chat" size={28} color={colors.textMuted} outlined />
                <Text style={styles.threadEmptyTitle}>Selecciona un chat</Text>
                <Text style={styles.threadEmptyText}>
                  Elige un atleta a la izquierda para ver la conversación.
                </Text>
              </View>
            )}
          </View>
        ) : null}
      </View>

      <TrainerBroadcastModal
        visible={broadcastOpen}
        groups={broadcast.groups}
        loading={broadcast.isLoading}
        progress={broadcast.progress}
        outcome={broadcast.outcome}
        error={broadcast.error}
        onClose={() => setBroadcastOpen(false)}
        onSend={(recipients, template) => {
          void broadcast.send(recipients, template).then((result) => {
            if (result && result.failed.length === 0) void refresh();
          });
        }}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    minHeight: 0,
  },
  pageSplit: {
    flexDirection: 'row',
  },
  inbox: {
    minWidth: 0,
    minHeight: 0,
    padding: spacing.md,
    gap: spacing.sm,
  },
  inboxMobile: {
    flex: 1,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  inboxSplit: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 360,
    width: 360,
    minWidth: 320,
    maxWidth: 400,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '18'),
  },
  filterChipText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: colors.text,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  headerSplit: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    alignSelf: 'stretch',
  },
  broadcastBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: withAlpha(colors.accent, '55'),
    backgroundColor: withAlpha(colors.accent, '12'),
    flexShrink: 0,
  },
  broadcastBtnSplit: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  broadcastBtnText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  title: {
    ...typography.h2,
    color: colors.text,
    flexShrink: 0,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
    flexShrink: 1,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    minHeight: 44,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    ...typography.bodySmall,
    paddingVertical: 10,
  },
  loader: {
    marginTop: spacing.lg,
  },
  error: {
    ...typography.bodySmall,
    color: colors.danger,
    marginTop: spacing.md,
  },
  emptyCard: {
    marginTop: spacing.md,
  },
  emptyTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  list: {
    paddingBottom: spacing.xl,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
  },
  rowSelected: {
    backgroundColor: withAlpha(colors.accent, '14'),
  },
  rowPressed: {
    opacity: 0.88,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${colors.accentBlue}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.bodySmall,
    color: colors.accentBlue,
    fontWeight: '700',
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
    flex: 1,
  },
  rowTime: {
    ...typography.caption,
    color: colors.textMuted,
    flexShrink: 0,
  },
  rowTimeUnread: {
    color: colors.accent,
    fontWeight: '700',
  },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowPreview: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  rowPreviewUnread: {
    color: colors.text,
    fontWeight: '600',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
    fontSize: 11,
  },
  thread: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    padding: spacing.md,
  },
  threadInner: {
    flex: 1,
    minHeight: 0,
  },
  threadLoader: {
    marginTop: spacing.xl,
  },
  threadEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  threadEmptyTitle: {
    ...typography.h3,
    color: colors.text,
  },
  threadEmptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
});
