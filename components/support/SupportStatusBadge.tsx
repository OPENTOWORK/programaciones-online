import { StyleSheet, Text, View } from 'react-native';

import { borderRadius, colors, typography, withAlpha } from '@/constants/theme';
import {
  SUPPORT_PRIORITY_LABELS,
  SUPPORT_STATUS_LABELS,
  type SupportTicketPriority,
  type SupportTicketStatus,
} from '@/lib/supportService';

/** Verde de la paleta de niveles: en este tema `colors.success` es el rojo de marca. */
const SUPPORT_GREEN = '#4ADE80';

const STATUS_COLORS: Record<SupportTicketStatus, string> = {
  open: SUPPORT_GREEN,
  in_progress: colors.metcon,
  waiting_user: colors.warning,
  resolved: colors.accentBlue,
  closed: colors.textMuted,
};

const PRIORITY_COLORS: Record<SupportTicketPriority, string> = {
  low: colors.textMuted,
  normal: colors.textSecondary,
  high: colors.warning,
  urgent: colors.danger,
};

export function supportStatusColor(status: SupportTicketStatus) {
  return STATUS_COLORS[status];
}

export function supportPriorityColor(priority: SupportTicketPriority) {
  return PRIORITY_COLORS[priority];
}

/** El estado se lee por texto además del color, para no depender solo del tono. */
export function SupportStatusBadge({ status }: { status: SupportTicketStatus }) {
  const color = STATUS_COLORS[status];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: withAlpha(color, '1F'), borderColor: withAlpha(color, '4D') },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]} numberOfLines={1}>
        {SUPPORT_STATUS_LABELS[status]}
      </Text>
    </View>
  );
}

export function SupportPriorityBadge({ priority }: { priority: SupportTicketPriority }) {
  const color = PRIORITY_COLORS[priority];
  const strong = priority === 'high' || priority === 'urgent';

  return (
    <View
      style={[
        styles.badge,
        styles.priorityBadge,
        strong && { backgroundColor: withAlpha(color, '1F'), borderColor: withAlpha(color, '4D') },
      ]}
    >
      <Text style={[styles.label, { color }]} numberOfLines={1}>
        {SUPPORT_PRIORITY_LABELS[priority]}
      </Text>
    </View>
  );
}

/** Contador de mensajes sin leer. */
export function SupportUnreadDot({ count, label }: { count: number; label: string }) {
  if (count <= 0) return null;

  return (
    <View style={styles.unread} accessibilityLabel={label}>
      <Text style={styles.unreadText}>{count > 9 ? '9+' : count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  priorityBadge: {
    backgroundColor: colors.surfaceLight,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: borderRadius.full,
  },
  label: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 11,
  },
  unread: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: borderRadius.full,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '800',
    fontSize: 10,
    lineHeight: 13,
  },
});
