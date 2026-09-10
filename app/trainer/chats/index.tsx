import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { TrainerChatPanel } from '@/components/trainer/TrainerChatPanel';
import { AppIcon } from '@/components/ui/AppIcon';
import { Card } from '@/components/ui/Card';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useAthlete } from '@/hooks/useAthletes';
import { useChatComposer } from '@/hooks/useChatComposer';
import { useCanManageAthleteChat } from '@/hooks/useCanManageAthleteChat';
import { useTrainerChatInbox, type TrainerChatConversation } from '@/hooks/useTrainerChatInbox';
import { useTrainerMessages } from '@/hooks/useTrainerMessages';
import { getFeedbackChatHref } from '@/lib/navigation';
import { useTrainerNotifications } from '@/hooks/useTrainerNotifications';

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
  selected,
  onPress,
}: {
  conversation: TrainerChatConversation;
  selected: boolean;
  onPress: () => void;
}) {
  const unread = conversation.preview?.unread ?? conversation.athlete.alerts?.chatCount ?? 0;

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

function SelectedChat({ athleteId, onOpened }: { athleteId: string; onOpened?: () => void }) {
  const router = useRouter();
  const { athlete, isLoading } = useAthlete(athleteId);
  const canChat = useCanManageAthleteChat(athleteId);
  const { messages, isEmpty, sendMessage } = useTrainerMessages({ athleteId, asTrainer: true });
  const { acknowledgeChat } = useTrainerNotifications();
  const composer = useChatComposer({
    onSend: (text, attachments) => sendMessage(text, attachments),
  });

  const acknowledgeChatRef = useRef(acknowledgeChat);
  acknowledgeChatRef.current = acknowledgeChat;

  useEffect(() => {
    if (!canChat) return;
    let cancelled = false;
    void acknowledgeChatRef.current(athleteId).then(() => {
      if (!cancelled) onOpened?.();
    });
    return () => {
      cancelled = true;
    };
    // Solo al cambiar de conversación: onOpened refresca la bandeja.
  }, [athleteId, canChat]);

  if ((isLoading && !athlete) || canChat === null) {
    return <ActivityIndicator color={colors.accent} style={styles.threadLoader} />;
  }

  if (!athlete || !canChat) {
    return (
      <Text style={styles.emptyText}>
        No puedes abrir este chat. El atleta está asignado a otro entrenador.
      </Text>
    );
  }

  return (
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
  );
}

export default function TrainerChatsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const selectedId = Array.isArray(id) ? id[0] : id;
  const { conversations, isLoading, error, refresh } = useTrainerChatInbox();
  const [query, setQuery] = useState('');
  const { width } = useWindowDimensions();
  const split = width >= 960;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return conversations;
    return conversations.filter((conversation) => {
      const haystack = `${conversation.athlete.name} ${conversation.athlete.email}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [conversations, query]);

  const openChat = (athleteId: string) => {
    if (split) {
      router.replace({ pathname: '/trainer/chats', params: { id: athleteId } });
      return;
    }
    router.push({ pathname: '/trainer/chat/[id]', params: { id: athleteId } });
  };

  return (
    <ScreenWrapper scrollable={false} padded={false}>
      <View style={[styles.page, split && styles.pageSplit]}>
        <View style={[styles.inbox, split && styles.inboxSplit]}>
          <View style={styles.header}>
            <Text style={styles.title}>Chats</Text>
            <Text style={styles.subtitle}>Conversaciones con tus atletas</Text>
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
          </View>

          {isLoading ? (
            <ActivityIndicator color={colors.accent} style={styles.loader} />
          ) : error ? (
            <Text style={styles.error}>{error}</Text>
          ) : filtered.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                {query.trim() ? 'Sin coincidencias' : 'Todavía no hay chats'}
              </Text>
              <Text style={styles.emptyText}>
                {query.trim()
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
                  selected={split && selectedId === conversation.athlete.id}
                  onPress={() => openChat(conversation.athlete.id)}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {split ? (
          <View style={styles.thread}>
            {selectedId ? (
              <SelectedChat key={selectedId} athleteId={selectedId} onOpened={() => void refresh()} />
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
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    padding: spacing.md,
    gap: spacing.sm,
  },
  inboxSplit: {
    maxWidth: 380,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  header: {
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
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
