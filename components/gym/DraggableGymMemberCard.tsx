import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Platform,
  StyleSheet,
  View,
  type GestureResponderHandlers,
} from 'react-native';

import { GymMemberCrmCard } from '@/components/gym/GymMemberCrmCard';
import type { GymMember } from '@/lib/gymTypes';

const TAP_SLOP = 8;

interface DraggableGymMemberCardProps {
  member: GymMember;
  canOperate: boolean;
  isMoving: boolean;
  isPlaceholder: boolean;
  canMovePrev: boolean;
  canMoveNext: boolean;
  cardRef?: (node: View | null) => void;
  onPress: () => void;
  onMovePrev: () => void;
  onMoveNext: () => void;
  onDragStart: (memberId: string, pageX: number, pageY: number) => void;
  onDragMove: (memberId: string, pageX: number, pageY: number) => void;
  onDragEnd: (memberId: string, pageX: number, pageY: number) => boolean;
}

function useDragZoneHandlers(
  enabled: boolean,
  memberId: string,
  pan: Animated.ValueXY,
  onPress: () => void,
  onDragStart: (memberId: string, pageX: number, pageY: number) => void,
  onDragMove: (memberId: string, pageX: number, pageY: number) => void,
  onDragEnd: (memberId: string, pageX: number, pageY: number) => boolean,
  setIsDragging: (value: boolean) => void,
) {
  const [dragElement, setDragElement] = useState<HTMLElement | null>(null);
  const dragDistanceRef = useRef(0);

  const bindDragZone = useCallback((node: View | null) => {
    setDragElement((node as unknown as HTMLElement | null) ?? null);
  }, []);

  const finishDrag = useCallback(
    (pageX: number, pageY: number) => {
      const wasTap = dragDistanceRef.current < TAP_SLOP;
      setIsDragging(false);
      const relocated = onDragEnd(memberId, pageX, pageY);
      if (!relocated) {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
          speed: 24,
          bounciness: 0,
        }).start();
      } else {
        pan.setValue({ x: 0, y: 0 });
      }
      if (wasTap) onPress();
    },
    [memberId, onDragEnd, onPress, pan, setIsDragging],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => enabled,
        onMoveShouldSetPanResponder: () => enabled,
        onStartShouldSetPanResponderCapture: () => enabled,
        onMoveShouldSetPanResponderCapture: () => enabled,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (_evt, gestureState) => {
          pan.setValue({ x: 0, y: 0 });
          dragDistanceRef.current = 0;
          setIsDragging(true);
          onDragStart(memberId, gestureState.x0, gestureState.y0);
        },
        onPanResponderMove: (_evt, gestureState) => {
          dragDistanceRef.current = Math.max(
            dragDistanceRef.current,
            Math.abs(gestureState.dx) + Math.abs(gestureState.dy),
          );
          if (Platform.OS !== 'web') {
            pan.setValue({ x: gestureState.dx, y: gestureState.dy });
          }
          onDragMove(memberId, gestureState.moveX, gestureState.moveY);
        },
        onPanResponderRelease: (_evt, gestureState) => {
          finishDrag(gestureState.moveX, gestureState.moveY);
        },
        onPanResponderTerminate: (_evt, gestureState) => {
          finishDrag(gestureState.moveX, gestureState.moveY);
        },
      }),
    [enabled, finishDrag, memberId, onDragMove, onDragStart, pan, setIsDragging],
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
      onDragStart(memberId, event.clientX, event.clientY);

      const onPointerMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        dragDistanceRef.current = Math.max(dragDistanceRef.current, Math.abs(dx) + Math.abs(dy));
        onDragMove(memberId, ev.clientX, ev.clientY);
      };

      const finish = (ev: PointerEvent) => {
        try {
          node.releasePointerCapture(ev.pointerId);
        } catch {
          // already released
        }
        node.removeEventListener('pointermove', onPointerMove);
        node.removeEventListener('pointerup', finish);
        node.removeEventListener('pointercancel', finish);
        finishDrag(ev.clientX, ev.clientY);
      };

      node.addEventListener('pointermove', onPointerMove);
      node.addEventListener('pointerup', finish);
      node.addEventListener('pointercancel', finish);
    };

    node.addEventListener('pointerdown', onPointerDown);
    return () => node.removeEventListener('pointerdown', onPointerDown);
  }, [dragElement, enabled, finishDrag, memberId, onDragMove, onDragStart, pan, setIsDragging]);

  const nativeHandlers: GestureResponderHandlers | undefined =
    Platform.OS === 'web' ? undefined : enabled ? panResponder.panHandlers : undefined;

  return { bindDragZone, nativeHandlers };
}

export function DraggableGymMemberCard({
  member,
  canOperate,
  isMoving,
  isPlaceholder,
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
  const useNativeLift = Platform.OS !== 'web';

  const { bindDragZone, nativeHandlers } = useDragZoneHandlers(
    canOperate && !isPlaceholder,
    member.id,
    pan,
    onPress,
    onDragStart,
    onDragMove,
    onDragEnd,
    setIsDragging,
  );

  if (isPlaceholder) {
    return (
      <View ref={cardRef} collapsable={false} style={styles.placeholderSlot}>
        <GymMemberCrmCard member={member} canOperate={canOperate} variant="placeholder" />
      </View>
    );
  }

  return (
    <Animated.View
      ref={cardRef}
      collapsable={false}
      style={[
        styles.wrap,
        useNativeLift && isDragging && styles.wrapDragging,
        useNativeLift && {
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        },
      ]}
    >
      <GymMemberCrmCard
        member={member}
        canOperate={canOperate}
        isMoving={isMoving}
        canMovePrev={canMovePrev}
        canMoveNext={canMoveNext}
        variant={useNativeLift && isDragging ? 'overlay' : 'default'}
        dragHandleRef={bindDragZone}
        dragHandleProps={nativeHandlers}
        onPress={onPress}
        onMovePrev={onMovePrev}
        onMoveNext={onMoveNext}
      />
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
  placeholderSlot: {
    minHeight: 88,
  },
});
