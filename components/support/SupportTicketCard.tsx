import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { SupportStatusBadge } from '@/components/support/SupportStatusBadge';
import { AppIcon } from '@/components/ui/AppIcon';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import {
  SUPPORT_CATEGORY_LABELS,
  formatTicketNumber,
  type SupportTicket,
} from '@/lib/supportService';
import { formatRelativeTime } from '@/lib/supportTickets';

/** Tarjeta de una solicitud en la lista del usuario. */
export function SupportTicketCard({
  ticket,
  onPress,
}: {
  ticket: SupportTicket;
  onPress: () => void;
}) {
  const hasNewReply = ticket.unreadForUser > 0;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Abrir solicitud ${formatTicketNumber(ticket.ticketNumber)}`}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        styles.card,
        hasNewReply && styles.cardHighlighted,
        hovered && styles.cardHovered,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.ticketNumber}>{formatTicketNumber(ticket.ticketNumber)}</Text>
        <SupportStatusBadge status={ticket.status} />
        <View style={styles.spacer} />
        <AppIcon name="chevronRight" size={16} color={colors.textMuted} />
      </View>

      <Text style={styles.subject} numberOfLines={2}>
        {ticket.subject}
      </Text>

      <View style={styles.metaRow}>
        <Text style={styles.meta}>{SUPPORT_CATEGORY_LABELS[ticket.category]}</Text>
        <Text style={styles.metaDot}>·</Text>
        <Text style={styles.meta}>{formatRelativeTime(ticket.lastMessageAt)}</Text>
      </View>

      {hasNewReply ? (
        <View style={styles.newReply}>
          <View style={styles.newReplyDot} />
          <Text style={styles.newReplyText}>Nueva respuesta del equipo</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function SupportTicketCardSkeleton() {
  return (
    <View style={styles.card}>
      <SkeletonBlock height={12} width="30%" />
      <SkeletonBlock height={16} width="78%" style={styles.skeletonSpacer} />
      <SkeletonBlock height={12} width="46%" style={styles.skeletonSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: 6,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  cardHighlighted: {
    borderColor: withAlpha(colors.accent, '55'),
  },
  cardHovered: {
    backgroundColor: colors.surfaceLight,
  },
  cardPressed: {
    opacity: 0.85,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  spacer: {
    flex: 1,
    minWidth: 0,
  },
  ticketNumber: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  subject: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  metaDot: {
    ...typography.caption,
    color: colors.textMuted,
  },
  newReply: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  newReplyDot: {
    width: 7,
    height: 7,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
  },
  newReplyText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  skeletonSpacer: {
    marginTop: 8,
  },
});
