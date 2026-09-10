import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import type { AppIconName } from '@/constants/icons';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { GYM_BOOKING_STATUS_LABELS, type GymBooking, type GymBookingStatus } from '@/lib/gymTypes';

const STATUS_COLORS: Record<GymBookingStatus, string> = {
  confirmed: '#4ADE80',
  waiting: colors.warning,
  attended: colors.accentBlue,
  no_show: colors.danger,
  cancelled: colors.textMuted,
};

interface BookingAction {
  key: GymBookingStatus;
  label: string;
  icon: AppIconName;
  destructive?: boolean;
  disabled?: boolean;
}

const BOOKING_ACTIONS: BookingAction[] = [
  { key: 'attended', label: 'Marcar asistencia', icon: 'check' },
  { key: 'no_show', label: 'Marcar como no asistió', icon: 'close' },
  { key: 'confirmed', label: 'Volver a confirmada', icon: 'calendar' },
  { key: 'cancelled', label: 'Cancelar reserva', icon: 'trash', destructive: true },
];

function memberInitials(name?: string) {
  return (name ?? 'M')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function formatTime(iso?: string) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

interface GymBookingActionModalProps {
  visible: boolean;
  booking: GymBooking | null;
  onClose: () => void;
  onStatusChange: (status: GymBookingStatus) => void;
}

export function GymBookingActionModal({
  visible,
  booking,
  onClose,
  onStatusChange,
}: GymBookingActionModalProps) {
  if (!booking) return null;

  const statusColor = STATUS_COLORS[booking.status];
  const classLabel = booking.classTitle ?? 'Clase';
  const classTime = formatTime(booking.classStartAt);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{memberInitials(booking.memberName)}</Text>
            </View>
            <View style={styles.headerCopy}>
              <Text style={styles.title} numberOfLines={1}>{booking.memberName ?? 'Miembro'}</Text>
              <View style={[styles.statusBadge, { backgroundColor: withAlpha(statusColor, '16') }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {GYM_BOOKING_STATUS_LABELS[booking.status]}
                </Text>
              </View>
            </View>
          </View>

          {classTime || classLabel ? (
            <View style={styles.classContext}>
              <AppIcon name="calendar" size={14} color={colors.textMuted} />
              <Text style={styles.classContextText} numberOfLines={1}>
                {classTime ? `${classTime} · ` : ''}{classLabel}
              </Text>
            </View>
          ) : null}

          <Text style={styles.sectionLabel}>Gestionar reserva</Text>

          <View style={styles.actions}>
            {BOOKING_ACTIONS.map((action) => {
              const disabled = booking.status === action.key;
              const tone = action.destructive ? colors.danger : colors.text;

              return (
                <Pressable
                  key={action.key}
                  onPress={() => {
                    if (disabled) return;
                    onStatusChange(action.key);
                  }}
                  disabled={disabled}
                  accessibilityRole="button"
                  accessibilityState={{ disabled }}
                  accessibilityLabel={action.label}
                  style={({ pressed }) => [
                    styles.actionRow,
                    action.destructive && styles.actionRowDestructive,
                    disabled && styles.actionRowDisabled,
                    pressed && !disabled && styles.actionRowPressed,
                  ]}
                >
                  <View
                    style={[
                      styles.actionIcon,
                      action.destructive && styles.actionIconDestructive,
                      disabled && styles.actionIconDisabled,
                    ]}
                  >
                    <AppIcon
                      name={action.icon}
                      size={16}
                      color={disabled ? colors.textMuted : action.destructive ? colors.danger : colors.accent}
                    />
                  </View>
                  <Text
                    style={[
                      styles.actionLabel,
                      { color: disabled ? colors.textMuted : tone },
                      action.destructive && !disabled && styles.actionLabelDestructive,
                    ]}
                  >
                    {action.label}
                  </Text>
                  {!disabled ? (
                    <AppIcon name="chevronRight" size={14} color={colors.textMuted} />
                  ) : (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>Actual</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.footer}>
            <Button title="Cerrar" variant="outline" onPress={onClose} style={styles.closeButton} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 18px 48px rgba(15, 23, 42, 0.18)',
        } as object)
      : null),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: withAlpha(colors.accent, '14'),
    borderWidth: 1,
    borderColor: withAlpha(colors.accent, '28'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '800',
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: borderRadius.full,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 11,
  },
  classContext: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  classContextText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    flex: 1,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  actions: {
    gap: spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 11,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  actionRowDestructive: {
    borderColor: withAlpha(colors.danger, '25'),
    backgroundColor: withAlpha(colors.danger, '06'),
  },
  actionRowDisabled: {
    opacity: 0.72,
    ...(Platform.OS === 'web' ? ({ cursor: 'default' } as object) : null),
  },
  actionRowPressed: {
    backgroundColor: colors.surfaceLight,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    backgroundColor: withAlpha(colors.accent, '12'),
    borderWidth: 1,
    borderColor: withAlpha(colors.accent, '22'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconDestructive: {
    backgroundColor: withAlpha(colors.danger, '10'),
    borderColor: withAlpha(colors.danger, '22'),
  },
  actionIconDisabled: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.border,
  },
  actionLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    flex: 1,
  },
  actionLabelDestructive: {
    color: colors.danger,
    fontWeight: '700',
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currentBadgeText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 10,
  },
  footer: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  closeButton: {
    width: '100%',
  },
});
