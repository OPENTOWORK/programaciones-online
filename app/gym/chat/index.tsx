import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
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

import { GymEmptyState, GymErrorBanner, GymScreen } from '@/components/gym/GymScreen';
import { TrainerChatPanel } from '@/components/trainer/TrainerChatPanel';
import { AppIcon } from '@/components/ui/AppIcon';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useGym } from '@/hooks/useGym';
import { useChatComposer } from '@/hooks/useChatComposer';
import { useGymChatInbox, type GymChatConversation } from '@/hooks/useGymChatInbox';
import { useGymMemberMessages } from '@/hooks/useGymMemberMessages';
import { gymMemberFullName, gymMemberInitials, type GymMember } from '@/lib/gymTypes';

function formatChatTime(iso?: string) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Ayer';

  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

function previewCopy(conversation: GymChatConversation) {
  const text = conversation.preview?.lastText.trim();
  if (!text) {
    return conversation.preview ? 'Mensaje' : 'Empieza la conversación';
  }
  return conversation.preview?.lastSender === 'staff' ? `Tú: ${text}` : text;
}

function ConversationRow({
  conversation,
  selected,
  onPress,
}: {
  conversation: GymChatConversation;
  selected: boolean;
  onPress: () => void;
}) {
  const unread = conversation.preview?.unread ?? 0;
  const name = gymMemberFullName(conversation.member);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Chat con ${name}`}
      style={({ pressed }) => [
        styles.row,
        selected && styles.rowSelected,
        pressed && styles.rowPressed,
      ]}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{gymMemberInitials(conversation.member)}</Text>
      </View>
      <View style={styles.rowCopy}>
        <View style={styles.rowTop}>
          <Text style={styles.rowName} numberOfLines={1}>{name}</Text>
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
        {!conversation.member.userId ? (
          <Text style={styles.linkHint}>Sin cuenta en la app</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function SelectedMemberChat({
  member,
}: {
  member: GymMember;
}) {
  const { gym } = useGym();
  const { messages, isEmpty, sendMessage, error, refresh } = useGymMemberMessages({
    gymId: gym?.id,
    memberId: member.id,
    asStaff: true,
  });

  const composer = useChatComposer({
    attachmentsEnabled: false,
    onSend: async (text) => sendMessage(text),
  });

  if (!gym) {
    return <ActivityIndicator color={colors.accent} style={styles.threadLoader} />;
  }

  const subtitle = member.userId
    ? member.email ?? member.phone ?? 'Cuenta vinculada'
    : 'El miembro no podrá responder hasta vincular su cuenta en la app';

  return (
    <View style={styles.threadInner}>
      {error ? <GymErrorBanner message={error} onRetry={refresh} /> : null}
      <TrainerChatPanel
        title={gymMemberFullName(member)}
        subtitle={subtitle}
        emptyTitle="Sin mensajes todavía"
        emptyText="Envía el primer mensaje a este miembro"
        messages={messages}
        isEmpty={isEmpty}
        viewerRole="trainer"
        composer={composer}
      />
    </View>
  );
}

export default function GymChatScreen() {
  const router = useRouter();
  const { memberId } = useLocalSearchParams<{ memberId?: string | string[] }>();
  const selectedId = Array.isArray(memberId) ? memberId[0] : memberId;
  const { conversations, isLoading, error, refresh } = useGymChatInbox();
  const [query, setQuery] = useState('');
  const { width } = useWindowDimensions();
  const split = width >= 960;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return conversations;
    return conversations.filter((conversation) => {
      const haystack = `${gymMemberFullName(conversation.member)} ${conversation.member.email ?? ''} ${conversation.member.phone ?? ''}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [conversations, query]);

  const selectedMember = useMemo(
    () => conversations.find((item) => item.member.id === selectedId)?.member,
    [conversations, selectedId],
  );

  const openChat = (id: string) => {
    if (split) {
      router.replace({ pathname: '/gym/chat', params: { memberId: id } });
      return;
    }
    router.push({ pathname: '/gym/chat/[memberId]', params: { memberId: id } });
  };

  return (
    <GymScreen>
      <ScreenWrapper scrollable={false} padded={false}>
        <View style={[styles.page, split && styles.pageSplit]}>
          <View style={[styles.inbox, split && styles.inboxSplit]}>
            <View style={styles.header}>
              <Text style={styles.title}>Chat</Text>
              <Text style={styles.subtitle}>Conversaciones con tus miembros</Text>
            </View>

            <View style={styles.searchWrap}>
              <AppIcon name="search" size={16} color={colors.textMuted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar miembro"
                placeholderTextColor={colors.textMuted}
                style={styles.searchInput}
              />
            </View>

            {isLoading ? (
              <ActivityIndicator color={colors.accent} style={styles.loader} />
            ) : error ? (
              <GymErrorBanner message={error} onRetry={refresh} />
            ) : filtered.length === 0 ? (
              <GymEmptyState
                icon="chat"
                title={query.trim() ? 'Sin coincidencias' : 'Todavía no hay miembros'}
                text={
                  query.trim()
                    ? 'Prueba con otro nombre, correo o teléfono.'
                    : 'Cuando añadas miembros al gimnasio, podrás chatear con ellos aquí.'
                }
              />
            ) : (
              <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
                {filtered.map((conversation) => (
                  <ConversationRow
                    key={conversation.member.id}
                    conversation={conversation}
                    selected={split && selectedId === conversation.member.id}
                    onPress={() => openChat(conversation.member.id)}
                  />
                ))}
              </ScrollView>
            )}
          </View>

          {split ? (
            <View style={styles.thread}>
              {selectedMember ? (
                <SelectedMemberChat key={selectedMember.id} member={selectedMember} />
              ) : (
                <View style={styles.threadEmpty}>
                  <AppIcon name="chat" size={28} color={colors.textMuted} outlined />
                  <Text style={styles.threadEmptyTitle}>Selecciona un chat</Text>
                  <Text style={styles.threadEmptyText}>
                    Elige un miembro a la izquierda para ver la conversación.
                  </Text>
                </View>
              )}
            </View>
          ) : null}
        </View>
      </ScreenWrapper>
    </GymScreen>
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
  linkHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
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
    gap: spacing.sm,
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
