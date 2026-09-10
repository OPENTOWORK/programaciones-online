import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  SupportPriorityBadge,
  SupportStatusBadge,
  SupportUnreadDot,
} from '@/components/support/SupportStatusBadge';
import { AppIcon } from '@/components/ui/AppIcon';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import {
  SUPPORT_CATEGORY_LABELS,
  formatTicketNumber,
  type SupportTicket,
} from '@/lib/supportService';
import { formatRelativeTime } from '@/lib/supportTickets';

const ROLE_LABELS: Record<string, string> = {
  atleta: 'Atleta',
  entrenador: 'Entrenador',
  administrador: 'Administrador',
};

export function SupportTicketsTable({
  tickets,
  loading = false,
  wide,
  onOpenTicket,
}: {
  tickets: readonly SupportTicket[];
  loading?: boolean;
  wide: boolean;
  onOpenTicket: (ticketId: string) => void;
}) {
  if (loading) {
    return (
      <View style={styles.skeletonList}>
        {[0, 1, 2, 3].map((index) => (
          <View key={index} style={styles.skeletonRow}>
            <SkeletonBlock height={12} width={72} />
            <View style={styles.flex}>
              <SkeletonBlock height={14} width="52%" />
            </View>
            <SkeletonBlock height={20} width={90} radius={borderRadius.full} />
          </View>
        ))}
      </View>
    );
  }

  if (tickets.length === 0) {
    return null;
  }

  if (!wide) {
    return (
      <View style={styles.cardList}>
        {tickets.map((ticket) => (
          <Pressable
            key={ticket.id}
            onPress={() => onOpenTicket(ticket.id)}
            accessibilityRole="button"
            accessibilityLabel={`Abrir ${formatTicketNumber(ticket.ticketNumber)}`}
            style={({ pressed }) => [
              styles.card,
              ticket.unreadForAdmin > 0 && styles.cardUnread,
              pressed && styles.rowPressed,
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.ticketNumber}>{formatTicketNumber(ticket.ticketNumber)}</Text>
              <SupportUnreadDot
                count={ticket.unreadForAdmin}
                label={`${ticket.unreadForAdmin} mensajes sin leer`}
              />
              <View style={styles.flex} />
              <SupportStatusBadge status={ticket.status} />
            </View>

            <Text style={styles.subject} numberOfLines={2}>
              {ticket.subject}
            </Text>

            <Text style={styles.cardMeta} numberOfLines={1}>
              {ticket.requesterName} · {ROLE_LABELS[ticket.requesterRole] ?? 'Usuario'} ·{' '}
              {SUPPORT_CATEGORY_LABELS[ticket.category]}
            </Text>
            <View style={styles.cardFooter}>
              <SupportPriorityBadge priority={ticket.priority} />
              <Text style={styles.cellMuted}>{formatRelativeTime(ticket.lastMessageAt)}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.table}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.colTicket]}>Ticket</Text>
        <Text style={[styles.headerCell, styles.colUser]}>Usuario</Text>
        <Text style={[styles.headerCell, styles.colRole]}>Rol</Text>
        <Text style={[styles.headerCell, styles.colSubject]}>Asunto</Text>
        <Text style={[styles.headerCell, styles.colCategory]}>Categoría</Text>
        <Text style={[styles.headerCell, styles.colStatus]}>Estado</Text>
        <Text style={[styles.headerCell, styles.colPriority]}>Prioridad</Text>
        <Text style={[styles.headerCell, styles.colActivity]}>Actividad</Text>
        <Text style={[styles.headerCell, styles.colAssigned]}>Asignado</Text>
        <View style={styles.colChevron} />
      </View>

      {tickets.map((ticket, index) => (
        <Pressable
          key={ticket.id}
          onPress={() => onOpenTicket(ticket.id)}
          accessibilityRole="button"
          accessibilityLabel={`Abrir ${formatTicketNumber(ticket.ticketNumber)}`}
          style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
            styles.bodyRow,
            index === tickets.length - 1 && styles.bodyRowLast,
            ticket.unreadForAdmin > 0 && styles.bodyRowUnread,
            hovered && styles.bodyRowHovered,
            pressed && styles.rowPressed,
          ]}
        >
          <View style={[styles.colTicket, styles.ticketCell]}>
            <Text style={styles.ticketNumber} numberOfLines={1}>
              {formatTicketNumber(ticket.ticketNumber)}
            </Text>
            <SupportUnreadDot
              count={ticket.unreadForAdmin}
              label={`${ticket.unreadForAdmin} mensajes sin leer`}
            />
          </View>

          <View style={styles.colUser}>
            <Text style={styles.userName} numberOfLines={1}>
              {ticket.requesterName}
            </Text>
            <Text style={styles.cellMuted} numberOfLines={1}>
              {ticket.requesterEmail}
            </Text>
          </View>

          <Text style={[styles.cell, styles.colRole]} numberOfLines={1}>
            {ROLE_LABELS[ticket.requesterRole] ?? 'Usuario'}
          </Text>

          <Text style={[styles.subjectCell, styles.colSubject]} numberOfLines={2}>
            {ticket.subject}
          </Text>

          <Text style={[styles.cell, styles.colCategory]} numberOfLines={1}>
            {SUPPORT_CATEGORY_LABELS[ticket.category]}
          </Text>

          <View style={styles.colStatus}>
            <SupportStatusBadge status={ticket.status} />
          </View>

          <View style={styles.colPriority}>
            <SupportPriorityBadge priority={ticket.priority} />
          </View>

          <Text style={[styles.cell, styles.colActivity]} numberOfLines={1}>
            {formatRelativeTime(ticket.lastMessageAt)}
          </Text>

          <Text style={[styles.cell, styles.colAssigned]} numberOfLines={1}>
            {ticket.assignedAdminName ?? (ticket.assignedAdminId ? 'Asignado' : 'Sin asignar')}
          </Text>

          <View style={styles.colChevron}>
            <AppIcon name="chevronRight" size={15} color={colors.textMuted} />
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    minWidth: 0,
  },
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerCell: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    fontSize: 10,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  bodyRowLast: {
    borderBottomWidth: 0,
  },
  bodyRowUnread: {
    backgroundColor: withAlpha(colors.accent, '0A'),
  },
  bodyRowHovered: {
    backgroundColor: colors.surfaceLight,
  },
  rowPressed: {
    opacity: 0.82,
  },
  colTicket: { flex: 1.25 },
  colUser: { flex: 1.9 },
  colRole: { flex: 0.9 },
  colSubject: { flex: 2.6 },
  colCategory: { flex: 1.3 },
  colStatus: { flex: 1.4 },
  colPriority: { flex: 1 },
  colActivity: { flex: 1.1 },
  colAssigned: { flex: 1.2 },
  colChevron: { width: 18, alignItems: 'flex-end' },
  ticketCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  ticketNumber: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  userName: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  subjectCell: {
    ...typography.bodySmall,
    color: colors.text,
    lineHeight: 18,
  },
  cell: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  cellMuted: {
    ...typography.caption,
    color: colors.textMuted,
  },
  cardList: {
    gap: spacing.sm,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    padding: spacing.sm + 4,
    gap: 6,
  },
  cardUnread: {
    borderColor: withAlpha(colors.accent, '55'),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  subject: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    lineHeight: 19,
  },
  cardMeta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: 2,
  },
  skeletonList: {
    gap: spacing.sm,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
});
