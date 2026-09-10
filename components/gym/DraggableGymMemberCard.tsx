import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Animated,
  PanResponder,
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

const TAP_SLOP = 8;

interface DraggableGymMemberCardProps {
  member: GymMember;
  canOperate: boolean;
  isMoving: boolean;
  canMovePrev: boolean;
  canMoveNext: boolean;
  cardRef?: (node: View | null) => void;
  onPress: () => void;
  onMovePrev: () => void;
  onMoveNext: () => void;
  onDragStart: (memberId: string) => void;
  onDragMove: (memberId: string, pageX: number, pageY: number) => void;
  onDragEnd: (memberId: string, pageX: number, pageY: number) => void;
}

function useDragZoneHandlers(
  enabled: boolean,
  memberId: string,
  pan: Animated.ValueXY,
  onPress: () => void,
  onDragStart: (memberId: string) => void,
  onDragMove: (memberId: string, pageX: number, pageY: number) => void,
  onDragEnd: (memberId: string, pageX: number, pageY: number) => void,
  setIsDragging: (value: boolean) => void,
) {
  const [dragElement, setDragElement] = useState<HTMLElement | null>(null);
  const dragDistanceRef = useRef(0);

  const bindDragZone = useCallback((node: View | null) => {
    setDragElement((node as unknown as HTMLElement | null) ?? null);
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => enabled,
        onMoveShouldSetPanResponder: () => enabled,
        onStartShouldSetPanResponderCapture: () => enabled,
        onMoveShouldSetPanResponderCapture: () => enabled,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          pan.setValue({ x: 0, y: 0 });
          dragDistanceRef.current = 0;
          setIsDragging(true);
          onDragStart(memberId);
        },
        onPanResponderMove: (_evt, gestureState) => {
          dragDistanceRef.current = Math.max(
            dragDistanceRef.current,
            Math.abs(gestureState.dx) + Math.abs(gestureState.dy),
          );
          pan.setValue({ x: gestureState.dx, y: gestureState.dy });
          onDragMove(memberId, gestureState.moveX, gestureState.moveY);
        },
        onPanResponderRelease: (_evt, gestureState) => {
          const wasTap = dragDistanceRef.current < TAP_SLOP;
          setIsDragging(false);
          onDragEnd(memberId, gestureState.moveX, gestureState.moveY);
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            speed: 22,
            bounciness: 0,
          }).start();
          if (wasTap) onPress();
        },
        onPanResponderTerminate: (_evt, gestureState) => {
          setIsDragging(false);
          onDragEnd(memberId, gestureState.moveX, gestureState.moveY);
          pan.setValue({ x: 0, y: 0 });
        },
      }),
    [enabled, memberId, onDragEnd, onDragMove, onDragStart, onPress, pan, setIsDragging],
  );

  useEffect(() => {
    if (Platform.OS !== 'web' || !enabled || !dragElement) return;

    const node = dragElement;

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      node.setPointerCapture(event.pointerId);

      const startX = event.clientX;
      const startY = event.clientY;
      dragDistanceRef.current = 0;
      pan.setValue({ x: 0, y: 0 });
      setIsDragging(true);
      onDragStart(memberId);

      const onPointerMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        dragDistanceRef.current = Math.max(dragDistanceRef.current, Math.abs(dx) + Math.abs(dy));
        pan.setValue({ x: dx, y: dy });
        onDragMove(memberId, ev.clientX, ev.clientY);
      };

      const finish = (ev: PointerEvent) => {
        const wasTap = dragDistanceRef.current < TAP_SLOP;
        try {
          node.releasePointerCapture(ev.pointerId);
        } catch {
          // already released
        }
        node.removeEventListener('pointermove', onPointerMove);
        node.removeEventListener('pointerup', finish);
        node.removeEventListener('pointercancel', finish);
        setIsDragging(false);
        onDragEnd(memberId, ev.clientX, ev.clientY);
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
          speed: 22,
          bounciness: 0,
        }).start();
        if (wasTap) onPress();
      };

      node.addEventListener('pointermove', onPointerMove);
      node.addEventListener('pointerup', finish);
      node.addEventListener('pointercancel', finish);
    };

    node.addEventListener('pointerdown', onPointerDown);
    return () => node.removeEventListener('pointerdown', onPointerDown);
  }, [dragElement, enabled, memberId, onDragEnd, onDragMove, onDragStart, onPress, pan, setIsDragging]);

  const nativeHandlers: GestureResponderHandlers | undefined =
    Platform.OS === 'web' ? undefined : enabled ? panResponder.panHandlers : undefined;

  return { bindDragZone, nativeHandlers };
}

export function DraggableGymMemberCard({
  member,
  canOperate,
  isMoving,
  canMovePrev,
  canMoveNext,
  cardRef,
  onPress,
  onMovePrev,
  onMoveNext,
  onDragStart,
  onDragMove,
  onDragEnd,
}: DraggableGymMemberCardProps) {
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const [isDragging, setIsDragging] = useState(false);

  const { bindDragZone, nativeHandlers } = useDragZoneHandlers(
    canOperate,
    member.id,
    pan,
    onPress,
    onDragStart,
    onDragMove,
    onDragEnd,
    setIsDragging,
  );
  const whatsappUrl = getWhatsAppUrl(member.phone);
  const hasPhone = Boolean(whatsappUrl);

  return (
    <Animated.View
      ref={cardRef}
      collapsable={false}
      style={[
        styles.wrap,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        },
        isDragging && styles.wrapDragging,
      ]}
    >
      <View style={[styles.card, isDragging && styles.cardDragging, isMoving && styles.cardMoving]}>
        <View style={styles.cardTop}>
          <View
            ref={bindDragZone}
            style={[
              styles.dragZone,
              canOperate && styles.dragZoneActive,
              isDragging && styles.dragZoneDragging,
            ]}
            {...nativeHandlers}
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
          </View>

          <Pressable
            onPress={() => {
              if (whatsappUrl) void openExternalUrl(whatsappUrl);
              else onPress();
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

          {canOperate ? (
            <View style={styles.dragHint}>
              <AppIcon name="dragHandle" size={16} color={colors.textMuted} />
            </View>
          ) : null}
        </View>

        {canOperate ? (
          <View style={styles.cardActions}>
            <Pressable
              disabled={!canMovePrev || isMoving || isDragging}
              onPress={onMovePrev}
              accessibilityLabel="Fase anterior"
              style={({ pressed }) => [
                styles.moveBtn,
                (!canMovePrev || isMoving || isDragging) && styles.moveBtnDisabled,
                pressed && styles.pressed,
              ]}
            >
              <AppIcon name="chevronLeft" size={14} color={colors.textSecondary} />
            </Pressable>
            <Pressable
              disabled={!canMoveNext || isMoving || isDragging}
              onPress={onMoveNext}
              accessibilityLabel="Fase siguiente"
              style={({ pressed }) => [
                styles.moveBtn,
                (!canMoveNext || isMoving || isDragging) && styles.moveBtnDisabled,
                pressed && styles.pressed,
              ]}
            >
              <AppIcon name="chevronRight" size={14} color={colors.textSecondary} />
            </Pressable>
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  wrapDragging: {
    zIndex: 80,
    elevation: 16,
  },
  card: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  cardDragging: {
    borderColor: colors.accent,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
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
  dragZoneDragging: {
    ...(Platform.OS === 'web' ? ({ cursor: 'grabbing' } as object) : null),
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
