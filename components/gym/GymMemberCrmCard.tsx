import { Ionicons } from '@expo/vector-icons';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderHandlers,
} from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { gymMemberFullName, gymMemberInitials, type GymMember } from '@/lib/gymTypes';
import { openExternalUrl } from '@/lib/openExternalUrl';
import { getWhatsAppUrl } from '@/lib/whatsappLink';

export interface GymMemberCrmCardProps {
  member: GymMember;
  canOperate: boolean;
  isMoving?: boolean;
  canMovePrev?: boolean;
  canMoveNext?: boolean;
  variant?: 'default' | 'placeholder' | 'overlay';
  dragHandleRef?: (node: View | null) => void;
  dragHandleProps?: GestureResponderHandlers;
  onPress?: () => void;
  onMovePrev?: () => void;
  onMoveNext?: () => void;
}

export function GymMemberCrmCard({
  member,
  canOperate,
  isMoving = false,
  canMovePrev = false,
  canMoveNext = false,
  variant = 'default',
  dragHandleRef,
  dragHandleProps,
  onPress,
  onMovePrev,
  onMoveNext,
}: GymMemberCrmCardProps) {
  const whatsappUrl = getWhatsAppUrl(member.phone);
  const hasPhone = Boolean(whatsappUrl);
  const isPlaceholder = variant === 'placeholder';
  const isOverlay = variant === 'overlay';

  return (
    <View
      style={[
        styles.card,
        isPlaceholder && styles.cardPlaceholder,
        isOverlay && styles.cardOverlay,
        isMoving && styles.cardMoving,
      ]}
    >
      <View style={styles.cardTop}>
        <Pressable
          ref={dragHandleRef}
          onPress={onPress}
          disabled={isPlaceholder || !onPress}
          style={({ pressed }) => [
            styles.dragZone,
            canOperate && !isPlaceholder && styles.dragZoneActive,
            pressed && !isPlaceholder && styles.pressed,
          ]}
          {...dragHandleProps}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{gymMemberInitials(member)}</Text>
          </View>
          <View style={styles.cardCopy}>
            <Text style={styles.cardName} numberOfLines={1}>{gymMemberFullName(member)}</Text>
            <Text style={styles.cardMeta} numberOfLines={1}>
              {member.email ?? member.phone ?? 'Sin contacto'}
            </Text>
          </View>
        </Pressable>

        {!isPlaceholder ? (
          <Pressable
            onPress={() => {
              if (whatsappUrl) void openExternalUrl(whatsappUrl);
              else onPress?.();
            }}
            accessibilityRole="link"
            accessibilityLabel={
              hasPhone
                ? `Abrir WhatsApp de ${gymMemberFullName(member)}`
                : `Añadir teléfono de ${gymMemberFullName(member)}`
            }
            hitSlop={6}
            style={({ pressed }) => [
              styles.whatsappBtn,
              !hasPhone && styles.whatsappBtnDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="logo-whatsapp"
              size={18}
              color={hasPhone ? '#25D366' : colors.textMuted}
            />
          </Pressable>
        ) : null}

        {canOperate && !isPlaceholder ? (
          <View style={styles.dragHint}>
            <AppIcon name="dragHandle" size={16} color={colors.textMuted} />
          </View>
        ) : null}
      </View>

      {canOperate && !isPlaceholder ? (
        <View style={styles.cardActions}>
          <Pressable
            disabled={!canMovePrev || isMoving}
            onPress={onMovePrev}
            accessibilityLabel="Fase anterior"
            style={({ pressed }) => [
              styles.moveBtn,
              (!canMovePrev || isMoving) && styles.moveBtnDisabled,
              pressed && styles.pressed,
            ]}
          >
            <AppIcon name="chevronLeft" size={14} color={colors.textSecondary} />
          </Pressable>
          <Pressable
            disabled={!canMoveNext || isMoving}
            onPress={onMoveNext}
            accessibilityLabel="Fase siguiente"
            style={({ pressed }) => [
              styles.moveBtn,
              (!canMoveNext || isMoving) && styles.moveBtnDisabled,
              pressed && styles.pressed,
            ]}
          >
            <AppIcon name="chevronRight" size={14} color={colors.textSecondary} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  cardPlaceholder: {
    borderStyle: 'dashed',
    borderColor: withAlpha(colors.accent, '66'),
    backgroundColor: withAlpha(colors.accent, '0A'),
    opacity: 0.55,
  },
  cardOverlay: {
    borderColor: colors.accent,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 14,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
          cursor: 'grabbing',
        } as object)
      : null),
  },
  cardMoving: {
    opacity: 0.7,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dragZone: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  dragZoneActive: {
    ...(Platform.OS === 'web'
      ? ({ cursor: 'grab', touchAction: 'none', userSelect: 'none' } as object)
      : null),
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: withAlpha(colors.accent, '22'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '800',
  },
  cardCopy: {
    flex: 1,
    minWidth: 0,
  },
  cardName: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  cardMeta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  whatsappBtn: {
    width: 30,
    height: 30,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha('#25D366', '14'),
    borderWidth: 1,
    borderColor: withAlpha('#25D366', '28'),
    flexShrink: 0,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  whatsappBtnDisabled: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.border,
  },
  dragHint: {
    paddingHorizontal: 4,
    paddingVertical: 6,
    opacity: 0.85,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
  },
  moveBtn: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  moveBtnDisabled: {
    opacity: 0.35,
  },
  pressed: {
    opacity: 0.85,
  },
});
