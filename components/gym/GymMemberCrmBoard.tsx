import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DraggableGymMemberCard } from '@/components/gym/DraggableGymMemberCard';
import { GymMemberCrmCard } from '@/components/gym/GymMemberCrmCard';
import { GymEmptyState, GymErrorBanner } from '@/components/gym/GymScreen';
import { Button } from '@/components/ui/Button';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { updateGymMember } from '@/lib/gymService';
import {
  GYM_MEMBER_PIPELINE_STAGES,
  gymMemberCrmColumn,
  type GymMember,
  type GymMemberPipelineStage,
} from '@/lib/gymTypes';

const COLUMN_WIDTH = 260;
const EDGE_ZONE = 56;

type ColumnBounds = { stageKey: GymMemberPipelineStage; x: number; width: number };

type DragOverlay = {
  member: GymMember;
  pageX: number;
  pageY: number;
  width: number;
  offsetX: number;
  offsetY: number;
};

export function GymMemberCrmBoard({
  members,
  isLoading,
  error,
  canOperate,
  onRetry,
  onAdd,
}: {
  members: GymMember[];
  isLoading: boolean;
  error?: string | null;
  canOperate: boolean;
  onRetry: () => void;
  onAdd: () => void;
}) {
  const router = useRouter();
  const [localMembers, setLocalMembers] = useState(members);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropStageKey, setDropStageKey] = useState<GymMemberPipelineStage | null>(null);
  const [dragOverlay, setDragOverlay] = useState<DragOverlay | null>(null);

  const boardScrollRef = useRef<ScrollView | null>(null);
  const scrollXRef = useRef(0);
  const columnNodesRef = useRef(new Map<GymMemberPipelineStage, View | null>());
  const cardNodesRef = useRef(new Map<string, View | null>());
  const columnBoundsRef = useRef<ColumnBounds[]>([]);
  const autoScrollDirRef = useRef<'left' | 'right' | null>(null);
  const autoScrollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const boardBoundsRef = useRef<{ x: number; width: number } | null>(null);
  const boardWrapperRef = useRef<View | null>(null);
  const dropStageRef = useRef<GymMemberPipelineStage | null>(null);
  const dragOverlayRef = useRef<DragOverlay | null>(null);
  const dropRafRef = useRef<number | null>(null);
  const overlayRafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!draggingId) setLocalMembers(members);
  }, [members, draggingId]);

  const byStage = useMemo(() => {
    const groups = new Map<GymMemberPipelineStage, GymMember[]>();
    for (const stage of GYM_MEMBER_PIPELINE_STAGES) groups.set(stage.key, []);
    for (const member of localMembers) {
      const stageKey = gymMemberCrmColumn(member);
      groups.get(stageKey)?.push(member);
    }
    return groups;
  }, [localMembers]);

  const stopAutoScroll = useCallback(() => {
    autoScrollDirRef.current = null;
    if (autoScrollTimerRef.current) {
      clearInterval(autoScrollTimerRef.current);
      autoScrollTimerRef.current = null;
    }
  }, []);

  const measureColumns = useCallback(() => {
    const bounds: ColumnBounds[] = [];
    let pending = GYM_MEMBER_PIPELINE_STAGES.length;

    for (const stage of GYM_MEMBER_PIPELINE_STAGES) {
      const node = columnNodesRef.current.get(stage.key);
      if (!node) {
        pending -= 1;
        if (pending === 0) columnBoundsRef.current = bounds;
        continue;
      }

      node.measureInWindow((x, _y, width) => {
        bounds.push({ stageKey: stage.key, x, width });
        pending -= 1;
        if (pending === 0) {
          bounds.sort((a, b) => a.x - b.x);
          columnBoundsRef.current = bounds;
        }
      });
    }
  }, []);

  const startAutoScroll = useCallback(
    (direction: 'left' | 'right') => {
      if (autoScrollDirRef.current === direction) return;
      autoScrollDirRef.current = direction;
      if (autoScrollTimerRef.current) return;

      autoScrollTimerRef.current = setInterval(() => {
        if (!autoScrollDirRef.current) return;
        const step = autoScrollDirRef.current === 'left' ? -18 : 18;
        const nextX = Math.max(0, scrollXRef.current + step);
        scrollXRef.current = nextX;
        boardScrollRef.current?.scrollTo({ x: nextX, animated: false });
        measureColumns();
      }, 16);
    },
    [measureColumns],
  );

  const findStageAtPageX = useCallback((pageX: number) => {
    const match = columnBoundsRef.current.find((bounds) => pageX >= bounds.x && pageX <= bounds.x + bounds.width);
    return match?.stageKey ?? null;
  }, []);

  const scheduleInFrame = useCallback((slotRef: { current: number | null }, task: () => void) => {
    if (slotRef.current !== null) return;
    const run = () => {
      slotRef.current = null;
      task();
    };
    if (typeof requestAnimationFrame === 'function') {
      slotRef.current = requestAnimationFrame(run);
    } else {
      slotRef.current = setTimeout(run, 16) as unknown as number;
    }
  }, []);

  const cancelFrame = useCallback((slotRef: { current: number | null }) => {
    if (slotRef.current === null) return;
    if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(slotRef.current);
    else clearTimeout(slotRef.current);
    slotRef.current = null;
  }, []);

  const scheduleDropStage = useCallback(
    (stageKey: GymMemberPipelineStage | null) => {
      if (dropStageRef.current === stageKey) return;
      dropStageRef.current = stageKey;
      scheduleInFrame(dropRafRef, () => setDropStageKey(dropStageRef.current));
    },
    [scheduleInFrame],
  );

  const scheduleOverlayMove = useCallback(
    (pageX: number, pageY: number) => {
      const current = dragOverlayRef.current;
      if (!current) return;
      dragOverlayRef.current = { ...current, pageX, pageY };
      scheduleInFrame(overlayRafRef, () => {
        if (dragOverlayRef.current) setDragOverlay(dragOverlayRef.current);
      });
    },
    [scheduleInFrame],
  );

  const clearDrag = useCallback(() => {
    stopAutoScroll();
    setDraggingId(null);
    setDropStageKey(null);
    dropStageRef.current = null;
    dragOverlayRef.current = null;
    setDragOverlay(null);
    cancelFrame(dropRafRef);
    cancelFrame(overlayRafRef);
  }, [cancelFrame, stopAutoScroll]);

  const moveMemberToStage = useCallback(
    async (memberId: string, stageKey: GymMemberPipelineStage) => {
      const member = localMembers.find((item) => item.id === memberId);
      if (!member || gymMemberCrmColumn(member) === stageKey) return;

      setMovingId(memberId);
      setLocalMembers((prev) =>
        prev.map((item) => (item.id === memberId ? { ...item, pipelineStage: stageKey } : item)),
      );

      const result = await updateGymMember(memberId, { pipelineStage: stageKey });
      setMovingId(null);

      if (result.error) {
        setLocalMembers(members);
        return;
      }

      // Sincroniza en segundo plano sin vaciar el tablero ni forzar recarga visual.
      setTimeout(() => onRetry(), 0);
    },
    [localMembers, members, onRetry],
  );

  const moveMember = async (member: GymMember, direction: -1 | 1) => {
    const index = GYM_MEMBER_PIPELINE_STAGES.findIndex(
      (stage) => stage.key === gymMemberCrmColumn(member),
    );
    const next = GYM_MEMBER_PIPELINE_STAGES[index + direction];
    if (!next) return;
    await moveMemberToStage(member.id, next.key);
  };

  const handleDragStart = useCallback(
    (memberId: string, pageX: number, pageY: number) => {
      measureColumns();
      boardWrapperRef.current?.measureInWindow((x, _y, width) => {
        boardBoundsRef.current = { x, width };
      });

      const member = localMembers.find((item) => item.id === memberId);
      if (!member) return;

      const cardNode = cardNodesRef.current.get(memberId);
      if (Platform.OS === 'web' && cardNode) {
        cardNode.measureInWindow((x, y, width) => {
          const overlay: DragOverlay = {
            member,
            pageX,
            pageY,
            width,
            offsetX: pageX - x,
            offsetY: pageY - y,
          };
          dragOverlayRef.current = overlay;
          setDragOverlay(overlay);
        });
      }

      setDraggingId(memberId);
    },
    [localMembers, measureColumns],
  );

  const handleDragMove = useCallback(
    (_memberId: string, pageX: number, pageY: number) => {
      scheduleDropStage(findStageAtPageX(pageX));
      scheduleOverlayMove(pageX, pageY);

      const boardBounds = boardBoundsRef.current;
      if (!boardBounds) return;

      if (pageX <= boardBounds.x + EDGE_ZONE) {
        startAutoScroll('left');
      } else if (pageX >= boardBounds.x + boardBounds.width - EDGE_ZONE) {
        startAutoScroll('right');
      } else {
        stopAutoScroll();
      }
    },
    [findStageAtPageX, scheduleDropStage, scheduleOverlayMove, startAutoScroll, stopAutoScroll],
  );

  const handleDragEnd = useCallback(
    (memberId: string, pageX: number): boolean => {
      const targetStage = findStageAtPageX(pageX);
      const member = localMembers.find((item) => item.id === memberId);
      const relocated = Boolean(
        targetStage && member && gymMemberCrmColumn(member) !== targetStage,
      );

      clearDrag();

      if (relocated && targetStage) {
        void moveMemberToStage(memberId, targetStage);
      }

      return relocated;
    },
    [clearDrag, findStageAtPageX, localMembers, moveMemberToStage],
  );

  const registerColumnRef = useCallback(
    (stageKey: GymMemberPipelineStage) => (node: View | null) => {
      columnNodesRef.current.set(stageKey, node);
    },
    [],
  );

  const registerCardRef = useCallback(
    (memberId: string) => (node: View | null) => {
      cardNodesRef.current.set(memberId, node);
    },
    [],
  );

  const openMember = useCallback(
    (memberId: string) => {
      router.push({ pathname: '/gym/members/[id]', params: { id: memberId } });
    },
    [router],
  );

  useEffect(
    () => () => {
      stopAutoScroll();
      cancelFrame(dropRafRef);
      cancelFrame(overlayRafRef);
    },
    [cancelFrame, stopAutoScroll],
  );

  if (error) return <GymErrorBanner message={error} onRetry={onRetry} />;

  if (isLoading) {
    return (
      <View style={styles.skeletonRow}>
        {[0, 1, 2].map((index) => (
          <SkeletonBlock key={index} height={280} width={COLUMN_WIDTH} radius={borderRadius.md} />
        ))}
      </View>
    );
  }

  if (members.length === 0) {
    return (
      <GymEmptyState
        icon="trainer"
        title="Todavía no hay atletas en el CRM"
        text="Añade un interesado o un miembro y arrástralo entre columnas según avance."
        action={
          canOperate ? (
            <Button title="Añadir el primero" variant="outline" size="compact" onPress={onAdd} />
          ) : undefined
        }
      />
    );
  }

  const draggingMember = draggingId
    ? localMembers.find((member) => member.id === draggingId)
    : undefined;
  const dragSourceStage = draggingMember ? gymMemberCrmColumn(draggingMember) : undefined;

  return (
    <View ref={boardWrapperRef} collapsable={false} style={styles.boardWrapper}>
      <ScrollView
        ref={boardScrollRef}
        horizontal
        style={styles.board}
        contentContainerStyle={styles.boardContent}
        showsHorizontalScrollIndicator
        scrollEnabled={!draggingId}
        keyboardShouldPersistTaps="handled"
        onScroll={(event) => {
          scrollXRef.current = event.nativeEvent.contentOffset.x;
        }}
        scrollEventThrottle={16}
      >
        {GYM_MEMBER_PIPELINE_STAGES.map((stage, stageIndex) => {
          const cards = byStage.get(stage.key) ?? [];
          const isDropTarget = dropStageKey === stage.key && draggingId !== null;
          const isDragSource = dragSourceStage === stage.key;

          return (
            <View
              key={stage.key}
              ref={registerColumnRef(stage.key)}
              collapsable={false}
              style={[
                styles.column,
                draggingId ? styles.columnWhileDragging : null,
                isDropTarget && styles.columnDropTarget,
                isDragSource && styles.columnDragSource,
              ]}
            >
              <View style={styles.columnHead}>
                <View style={styles.columnCopy}>
                  <Text style={styles.columnTitle}>{stage.label}</Text>
                  <Text style={styles.columnHint} numberOfLines={2}>{stage.hint}</Text>
                </View>
                <Text style={styles.columnCount}>{cards.length}</Text>
              </View>

              <View style={styles.columnBody}>
                {cards.length === 0 ? (
                  <Text style={[styles.columnEmpty, isDropTarget && styles.columnEmptyDropTarget]}>
                    {isDropTarget ? 'Suelta aquí' : 'Nadie en esta fase'}
                  </Text>
                ) : (
                  cards.map((member) => (
                    <DraggableGymMemberCard
                      key={member.id}
                      member={member}
                      canOperate={canOperate}
                      isMoving={movingId === member.id}
                      isPlaceholder={draggingId === member.id}
                      canMovePrev={stageIndex > 0}
                      canMoveNext={stageIndex < GYM_MEMBER_PIPELINE_STAGES.length - 1}
                      cardRef={registerCardRef(member.id)}
                      onPress={() => openMember(member.id)}
                      onMovePrev={() => void moveMember(member, -1)}
                      onMoveNext={() => void moveMember(member, 1)}
                      onDragStart={handleDragStart}
                      onDragMove={handleDragMove}
                      onDragEnd={handleDragEnd}
                    />
                  ))
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {dragOverlay ? (
        <View
          pointerEvents="none"
          style={[
            styles.dragOverlay,
            {
              left: dragOverlay.pageX - dragOverlay.offsetX,
              top: dragOverlay.pageY - dragOverlay.offsetY,
              width: dragOverlay.width,
            },
          ]}
        >
          <GymMemberCrmCard
            member={dragOverlay.member}
            canOperate={canOperate}
            variant="overlay"
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  boardWrapper: {
    flex: 1,
    minHeight: 0,
    marginTop: spacing.sm,
    overflow: 'visible',
    position: 'relative',
  },
  board: {
    flex: 1,
    minHeight: 0,
    overflow: 'visible',
  },
  boardContent: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
    alignItems: 'stretch',
  },
  column: {
    width: COLUMN_WIDTH,
    minHeight: 320,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  columnWhileDragging: {
    overflow: 'visible',
  },
  columnDropTarget: {
    borderColor: colors.accent,
    borderWidth: 2,
    backgroundColor: withAlpha(colors.accent, '0F'),
  },
  columnDragSource: {
    overflow: 'visible',
    zIndex: 20,
  },
  columnHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surfaceLight,
  },
  columnCopy: {
    flex: 1,
    minWidth: 0,
  },
  columnTitle: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  columnHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    fontSize: 10,
  },
  columnCount: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '800',
  },
  columnBody: {
    flex: 1,
    minHeight: 0,
    padding: spacing.sm,
    gap: spacing.sm,
    overflow: 'visible',
  },
  columnEmpty: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
    paddingVertical: spacing.sm,
  },
  columnEmptyDropTarget: {
    color: colors.accent,
    fontWeight: '700',
    fontStyle: 'normal',
  },
  dragOverlay: {
    position: Platform.OS === 'web' ? ('fixed' as const) : ('absolute' as const),
    zIndex: 200,
    elevation: 24,
  },
});
