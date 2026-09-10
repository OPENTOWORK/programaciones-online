import { StyleSheet, Text, View } from 'react-native';

import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import type { SupportMessage } from '@/lib/supportService';

const ROLE_LABELS: Record<string, string> = {
  atleta: 'Atleta',
  entrenador: 'Entrenador',
  administrador: 'Administrador',
};

function formatWhen(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const startOfDay = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const dayDiff = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86_400_000);

  if (dayDiff === 0) return `Hoy ${time}`;
  if (dayDiff === 1) return `Ayer ${time}`;

  return `${date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} ${time}`;
}

export function SupportConversation({
  messages,
  requesterId,
  requesterName,
  requesterRole,
  loading = false,
}: {
  messages: readonly SupportMessage[];
  requesterId: string;
  requesterName: string;
  requesterRole: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <View style={styles.thread}>
        {[0, 1].map((index) => (
          <View key={index} style={styles.bubble}>
            <SkeletonBlock height={12} width="34%" />
            <SkeletonBlock height={14} width="82%" style={styles.skeletonSpacer} />
            <SkeletonBlock height={14} width="58%" style={styles.skeletonSpacer} />
          </View>
        ))}
      </View>
    );
  }

  if (messages.length === 0) {
    return <Text style={styles.empty}>Todavía no hay mensajes en esta solicitud.</Text>;
  }

  return (
    <View style={styles.thread}>
      {messages.map((message) => {
        if (message.isInternal) {
          return (
            <View key={message.id} style={[styles.bubble, styles.internalBubble]}>
              <View style={styles.header}>
                <Text style={styles.internalAuthor}>Nota interna</Text>
                <Text style={styles.when}>{formatWhen(message.createdAt)}</Text>
              </View>
              <Text style={styles.internalText}>{message.message}</Text>
            </View>
          );
        }

        const fromRequester = message.senderId === requesterId;

        return (
          <View
            key={message.id}
            style={[styles.bubble, fromRequester ? styles.userBubble : styles.teamBubble]}
          >
            <View style={styles.header}>
              <Text style={fromRequester ? styles.userAuthor : styles.teamAuthor}>
                {fromRequester ? requesterName : 'Equipo de Training ProgLine'}
              </Text>
              {fromRequester ? (
                <Text style={styles.role}>{ROLE_LABELS[requesterRole] ?? 'Usuario'}</Text>
              ) : null}
              <View style={styles.headerSpacer} />
              <Text style={styles.when}>{formatWhen(message.createdAt)}</Text>
            </View>
            <Text style={styles.text}>{message.message}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  thread: {
    gap: spacing.sm,
  },
  bubble: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    padding: spacing.sm + 4,
  },
  userBubble: {
    borderColor: colors.border,
  },
  teamBubble: {
    borderColor: withAlpha(colors.accent, '40'),
    backgroundColor: withAlpha(colors.accent, '0D'),
  },
  internalBubble: {
    borderColor: withAlpha(colors.warning, '55'),
    backgroundColor: withAlpha(colors.warning, '12'),
    borderStyle: 'dashed',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  headerSpacer: {
    flex: 1,
    minWidth: 0,
  },
  userAuthor: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
  },
  teamAuthor: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  internalAuthor: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    fontSize: 10,
  },
  role: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
  when: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
  text: {
    ...typography.bodySmall,
    color: colors.text,
    lineHeight: 20,
  },
  internalText: {
    ...typography.bodySmall,
    color: colors.text,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  empty: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  skeletonSpacer: {
    marginTop: 8,
  },
});
