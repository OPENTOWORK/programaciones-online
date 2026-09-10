import { useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, type View } from 'react-native';

import { CrmLeadCard } from '@/components/trainer/CrmLeadCard';
import type { AthleteSummary } from '@/lib/types';

interface DraggableLeadCardProps {
  athlete: AthleteSummary;
  canMovePrev: boolean;
  canMoveNext: boolean;
  onPress: () => void;
  onMovePrev: () => void;
  onMoveNext: () => void;
  onOpenActions: () => void;
  onDismissAlerts?: () => void;
  /** El tablero mide la tarjeta al empezar un arrastre para saber dónde cae la que se mueve. */
  cardRef?: (node: View | null) => void;
  onDragStart: (athleteId: string) => void;
  onDragMove: (athleteId: string, pageX: number, pageY: number) => void;
  onDragEnd: (athleteId: string, pageX: number, pageY: number) => void;
  readOnly?: boolean;
}

export function DraggableLeadCard({
  athlete,
  cardRef,
  onDragStart,
  onDragMove,
  onDragEnd,
  readOnly = false,
  ...cardProps
}: DraggableLeadCardProps) {
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const [isDragging, setIsDragging] = useState(false);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !readOnly,
        onMoveShouldSetPanResponder: () => !readOnly,
        onPanResponderGrant: () => {
          pan.setValue({ x: 0, y: 0 });
          setIsDragging(true);
          onDragStart(athlete.id);
        },
        onPanResponderMove: (_evt, gestureState) => {
          pan.setValue({ x: gestureState.dx, y: gestureState.dy });
          onDragMove(athlete.id, gestureState.moveX, gestureState.moveY);
        },
        onPanResponderRelease: (_evt, gestureState) => {
          setIsDragging(false);
          onDragEnd(athlete.id, gestureState.moveX, gestureState.moveY);
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false, speed: 20 }).start();
        },
        onPanResponderTerminate: (_evt, gestureState) => {
          setIsDragging(false);
          onDragEnd(athlete.id, gestureState.moveX, gestureState.moveY);
          pan.setValue({ x: 0, y: 0 });
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [athlete.id, readOnly],
  );

  return (
    <Animated.View
      ref={cardRef}
      collapsable={false}
      style={[
        { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
        isDragging && { zIndex: 50, elevation: 12 },
      ]}
    >
      <CrmLeadCard
        athlete={athlete}
        isDragging={isDragging}
        readOnly={readOnly}
        dragHandleProps={readOnly ? undefined : panResponder.panHandlers}
        {...cardProps}
      />
    </Animated.View>
  );
}

