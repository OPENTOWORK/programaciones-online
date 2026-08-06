import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { ActionSheetModal, type ActionSheetAction } from '@/components/ui/ActionSheetModal';
import { AppIcon } from '@/components/ui/AppIcon';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PromptModal } from '@/components/ui/PromptModal';
import { CrmColumn, CRM_COLUMN_WIDTH } from '@/components/trainer/CrmColumn';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { useTrainerCrmBoard } from '@/hooks/useTrainerCrmBoard';
import { dropIndexForPosition, dropLineOffsetForIndex } from '@/lib/dragDropList';

type LeadActionsState = { athleteId: string; stageId: string } | null;
type ColumnActionsState = { stageId: string } | null;
type PromptState = { mode: 'create' } | { mode: 'rename'; stageId: string } | null;
type DeleteLeadState = { athleteId: string; name: string } | null;

type ColumnBounds = { stageId: string; x: number; y: number; width: number };
type CardBounds = { athleteId: string; stageId: string; y: number; height: number };
/** Columna y hueco donde caería la ficha que se está arrastrando. */
type DropHint = { stageId: string; index: number; lineTop: number | null };

const MIN_SCROLL_THUMB_WIDTH = 48;

export function CrmBoard() {
  const router = useRouter();
  const {
    columns,
    isLoading,
    error,
    persistent,
    roleNotice,
    dismissRoleNotice,
    moveLeadToStage,
    moveLeadToAdjacentStage,
    reorderLeadWithinStage,
    removeLead,
    addStage,
    renameStage,
    removeStage,
    moveStage,
  } = useTrainerCrmBoard();

  const [leadActions, setLeadActions] = useState<LeadActionsState>(null);
  const [columnActions, setColumnActions] = useState<ColumnActionsState>(null);
  const [prompt, setPrompt] = useState<PromptState>(null);
  const [leadToDelete, setLeadToDelete] = useState<DeleteLeadState>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [draggingAthleteId, setDraggingAthleteId] = useState<string | null>(null);
  const [dropHint, setDropHint] = useState<DropHint | null>(null);
  const columnNodesRef = useRef(new Map<string, View | null>());
  const columnBoundsRef = useRef<ColumnBounds[]>([]);
  const columnRefCallbacksRef = useRef(new Map<string, (node: View | null) => void>());
  const cardNodesRef = useRef(new Map<string, View | null>());
  const cardBoundsRef = useRef<CardBounds[]>([]);
  const cardRefCallbacksRef = useRef(new Map<string, (node: View | null) => void>());

  const boardWrapperRef = useRef<View | null>(null);
  const boardScrollRef = useRef<ScrollView | null>(null);
  const boardBoundsRef = useRef<{ x: number; width: number } | null>(null);
  const scrollXRef = useRef(0);
  const autoScrollDirRef = useRef<'left' | 'right' | null>(null);
  const autoScrollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const contentWidthRef = useRef(0);
  const viewportWidthRef = useRef(0);
  const trackNodeRef = useRef<View | null>(null);
  const trackWidthRef = useRef(0);
  const trackPageXRef = useRef(0);
  const thumbWidthRef = useRef(0);
  const grabOffsetRef = useRef(0);
  const thumbTranslateX = useRef(new Animated.Value(0)).current;
  const [thumbWidth, setThumbWidth] = useState(0);
  const [canScrollBoard, setCanScrollBoard] = useState(false);
  const [isDraggingThumb, setIsDraggingThumb] = useState(false);

  const stopAutoScroll = useCallback(() => {
    autoScrollDirRef.current = null;
    if (autoScrollTimerRef.current) {
      clearInterval(autoScrollTimerRef.current);
      autoScrollTimerRef.current = null;
    }
  }, []);

  const startAutoScroll = useCallback(
    (direction: 'left' | 'right') => {
      if (autoScrollDirRef.current === direction) return;
      autoScrollDirRef.current = direction;

      if (autoScrollTimerRef.current) return;

      autoScrollTimerRef.current = setInterval(() => {
        if (!autoScrollDirRef.current) return;
        const step = autoScrollDirRef.current === 'left' ? -16 : 16;
        const nextX = Math.max(0, scrollXRef.current + step);
        boardScrollRef.current?.scrollTo({ x: nextX, animated: false });
        // measureInWindow tras el desplazamiento para refrescar los límites de las columnas
        measureColumnBounds();
      }, 16);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const registerColumnRef = useCallback((stageId: string) => {
    const cached = columnRefCallbacksRef.current.get(stageId);
    if (cached) return cached;

    const callback = (node: View | null) => {
      columnNodesRef.current.set(stageId, node);
    };
    columnRefCallbacksRef.current.set(stageId, callback);
    return callback;
  }, []);

  const registerCardRef = useCallback((athleteId: string) => {
    const cached = cardRefCallbacksRef.current.get(athleteId);
    if (cached) return cached;

    const callback = (node: View | null) => {
      cardNodesRef.current.set(athleteId, node);
    };
    cardRefCallbacksRef.current.set(athleteId, callback);
    return callback;
  }, []);

  const measureColumnBounds = useCallback(() => {
    const entries = Array.from(columnNodesRef.current.entries());
    const bounds: ColumnBounds[] = [];
    let pending = entries.length;

    if (pending === 0) {
      columnBoundsRef.current = [];
      return;
    }

    // Las medidas se publican de golpe para que nadie lea una lista a medio hacer.
    const settle = () => {
      pending -= 1;
      if (pending <= 0) columnBoundsRef.current = bounds;
    };

    entries.forEach(([stageId, node]) => {
      if (!node) {
        settle();
        return;
      }
      node.measureInWindow((x, y, width) => {
        bounds.push({ stageId, x, y, width });
        settle();
      });
    });
  }, []);

  const measureCardBounds = useCallback(() => {
    const stageByAthlete = new Map<string, string>();
    columns.forEach((column) => column.leads.forEach((lead) => stageByAthlete.set(lead.id, column.stage.id)));

    const entries = Array.from(cardNodesRef.current.entries());
    const bounds: CardBounds[] = [];
    let pending = entries.length;

    if (pending === 0) {
      cardBoundsRef.current = [];
      return;
    }

    const settle = () => {
      pending -= 1;
      if (pending <= 0) cardBoundsRef.current = bounds.sort((a, b) => a.y - b.y);
    };

    entries.forEach(([athleteId, node]) => {
      const stageId = stageByAthlete.get(athleteId);
      if (!node || !stageId) {
        settle();
        return;
      }
      node.measureInWindow((_x, y, _width, height) => {
        bounds.push({ athleteId, stageId, y, height });
        settle();
      });
    });
  }, [columns]);

  const findStageAtPageX = useCallback((pageX: number) => {
    const match = columnBoundsRef.current.find((bounds) => pageX >= bounds.x && pageX <= bounds.x + bounds.width);
    return match?.stageId ?? null;
  }, []);

  /** Columna bajo el dedo y hueco en el que quedaría la ficha, con la altura de la línea que lo marca. */
  const findDropHint = useCallback(
    (athleteId: string, pageX: number, pageY: number): DropHint | null => {
      const stageId = findStageAtPageX(pageX);
      if (!stageId) return null;

      const others = cardBoundsRef.current.filter(
        (card) => card.stageId === stageId && card.athleteId !== athleteId,
      );
      const index = dropIndexForPosition(others, pageY);
      const lineY = dropLineOffsetForIndex(others, index);
      const column = columnBoundsRef.current.find((bounds) => bounds.stageId === stageId);

      return { stageId, index, lineTop: lineY === null || !column ? null : lineY - column.y };
    },
    [findStageAtPageX],
  );

  const EDGE_ZONE = 56;

  const handleDragStart = useCallback(
    (athleteId: string) => {
      measureColumnBounds();
      measureCardBounds();
      boardWrapperRef.current?.measureInWindow((x, _y, width) => {
        boardBoundsRef.current = { x, width };
      });
      setDraggingAthleteId(athleteId);
    },
    [measureCardBounds, measureColumnBounds],
  );

  const handleDragMove = useCallback(
    (athleteId: string, pageX: number, pageY: number) => {
      setDropHint((current) => {
        const next = findDropHint(athleteId, pageX, pageY);
        if (!next || !current) return next;
        const same =
          next.stageId === current.stageId && next.index === current.index && next.lineTop === current.lineTop;
        return same ? current : next;
      });

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
    [findDropHint, startAutoScroll, stopAutoScroll],
  );

  const handleDragEnd = useCallback(
    (athleteId: string, pageX: number, pageY: number) => {
      stopAutoScroll();
      const target = findDropHint(athleteId, pageX, pageY);
      setDraggingAthleteId(null);
      setDropHint(null);

      if (!target) return;

      const currentColumn = columns.find((column) => column.leads.some((lead) => lead.id === athleteId));
      const currentIndex = currentColumn?.leads.findIndex((lead) => lead.id === athleteId) ?? -1;
      // Soltarla en su mismo hueco no es un movimiento: ni se guarda ni se apunta en el historial.
      if (target.stageId === currentColumn?.stage.id && target.index === currentIndex) return;

      void moveLeadToStage(athleteId, target.stageId, target.index);
    },
    [columns, findDropHint, moveLeadToStage, stopAutoScroll],
  );

  /** Coloca el pulgar de la barra sin re-renderizar el tablero en cada frame de scroll. */
  const syncScrollbar = useCallback(() => {
    const scrollable = contentWidthRef.current - viewportWidthRef.current;
    const scrollableBoard = scrollable > 1;

    setCanScrollBoard((current) => (current === scrollableBoard ? current : scrollableBoard));

    if (!scrollableBoard) {
      thumbWidthRef.current = 0;
      setThumbWidth((current) => (current === 0 ? current : 0));
      thumbTranslateX.setValue(0);
      return;
    }

    // La guía se mide al montarse; hasta entonces no hay nada que colocar.
    const track = trackWidthRef.current;
    if (track <= 0) return;

    const ratio = viewportWidthRef.current / contentWidthRef.current;
    const nextWidth = Math.min(track, Math.max(MIN_SCROLL_THUMB_WIDTH, Math.round(track * ratio)));

    if (nextWidth !== thumbWidthRef.current) {
      thumbWidthRef.current = nextWidth;
      setThumbWidth(nextWidth);
    }

    const progress = Math.min(1, Math.max(0, scrollXRef.current / scrollable));
    thumbTranslateX.setValue(progress * (track - nextWidth));
  }, [thumbTranslateX]);

  const handleBoardScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      scrollXRef.current = contentOffset.x;
      contentWidthRef.current = contentSize.width;
      viewportWidthRef.current = layoutMeasurement.width;
      syncScrollbar();
    },
    [syncScrollbar],
  );

  const handleBoardContentSizeChange = useCallback(
    (width: number) => {
      contentWidthRef.current = width;
      syncScrollbar();
    },
    [syncScrollbar],
  );

  const handleBoardLayout = useCallback(
    (event: LayoutChangeEvent) => {
      viewportWidthRef.current = event.nativeEvent.layout.width;
      syncScrollbar();
    },
    [syncScrollbar],
  );

  const measureTrack = useCallback(() => {
    trackNodeRef.current?.measureInWindow((x, _y, width) => {
      trackPageXRef.current = x;
      trackWidthRef.current = width;
      syncScrollbar();
    });
  }, [syncScrollbar]);

  const handleTrackLayout = useCallback(
    (event: LayoutChangeEvent) => {
      trackWidthRef.current = event.nativeEvent.layout.width;
      measureTrack();
    },
    [measureTrack],
  );

  /** Desplaza el tablero según la posición del dedo/ratón dentro de la barra. */
  const scrollToTrackPosition = useCallback((localX: number) => {
    const range = trackWidthRef.current - thumbWidthRef.current;
    const scrollable = contentWidthRef.current - viewportWidthRef.current;
    if (range <= 0 || scrollable <= 0) return;

    const progress = Math.min(1, Math.max(0, (localX - grabOffsetRef.current) / range));
    boardScrollRef.current?.scrollTo({ x: progress * scrollable, animated: false });
  }, []);

  const scrollByStep = useCallback((direction: -1 | 1) => {
    const scrollable = contentWidthRef.current - viewportWidthRef.current;
    if (scrollable <= 0) return;

    const step = CRM_COLUMN_WIDTH + spacing.sm;
    const nextX = Math.min(scrollable, Math.max(0, scrollXRef.current + direction * step));
    boardScrollRef.current?.scrollTo({ x: nextX, animated: true });
  }, []);

  const trackPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (_event, gesture) => {
          measureTrack();
          setIsDraggingThumb(true);

          const localX = gesture.x0 - trackPageXRef.current;
          const scrollable = contentWidthRef.current - viewportWidthRef.current;
          const range = trackWidthRef.current - thumbWidthRef.current;
          const thumbLeft =
            scrollable > 0 ? Math.min(1, Math.max(0, scrollXRef.current / scrollable)) * range : 0;

          const grabbedThumb = localX >= thumbLeft && localX <= thumbLeft + thumbWidthRef.current;
          if (grabbedThumb) {
            // Agarrar el pulgar no debe moverlo: se conserva el punto donde se pinchó.
            grabOffsetRef.current = localX - thumbLeft;
            return;
          }

          grabOffsetRef.current = thumbWidthRef.current / 2;
          scrollToTrackPosition(localX);
        },
        onPanResponderMove: (_event, gesture) => {
          scrollToTrackPosition(gesture.moveX - trackPageXRef.current);
        },
        onPanResponderRelease: () => setIsDraggingThumb(false),
        onPanResponderTerminate: () => setIsDraggingThumb(false),
      }),
    [measureTrack, scrollToTrackPosition],
  );

  useEffect(() => stopAutoScroll, [stopAutoScroll]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visibleColumns = useMemo(() => {
    if (!normalizedQuery) return columns;
    return columns.map((column) => ({
      ...column,
      leads: column.leads.filter(
        (athlete) =>
          athlete.name.toLowerCase().includes(normalizedQuery) ||
          athlete.email.toLowerCase().includes(normalizedQuery),
      ),
    }));
  }, [columns, normalizedQuery]);

  const dragSourceStageId = draggingAthleteId
    ? columns.find((column) => column.leads.some((lead) => lead.id === draggingAthleteId))?.stage.id
    : undefined;

  if (isLoading && columns.length === 0) {
    return <ActivityIndicator color={colors.accent} style={styles.loader} />;
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  const activeColumnIndex = columns.findIndex((column) =>
    leadActions ? column.stage.id === leadActions.stageId : false,
  );
  const activeLead =
    leadActions && columns[activeColumnIndex]
      ? columns[activeColumnIndex].leads.find((athlete) => athlete.id === leadActions.athleteId)
      : undefined;

  const leadModalActions: ActionSheetAction[] = [];
  if (leadActions && activeLead) {
    leadModalActions.push(
      ...columns
        .filter((column) => column.stage.id !== leadActions.stageId)
        .map((column) => ({
          key: `move-${column.stage.id}`,
          label: `Mover a "${column.stage.name}"`,
          onPress: () => {
            void moveLeadToStage(leadActions.athleteId, column.stage.id);
            setLeadActions(null);
          },
        })),
      {
        key: 'up',
        label: 'Subir en esta columna',
        onPress: () => {
          void reorderLeadWithinStage(leadActions.stageId, leadActions.athleteId, 'up');
          setLeadActions(null);
        },
      },
      {
        key: 'down',
        label: 'Bajar en esta columna',
        onPress: () => {
          void reorderLeadWithinStage(leadActions.stageId, leadActions.athleteId, 'down');
          setLeadActions(null);
        },
      },
      {
        key: 'open',
        label: 'Ver ficha del atleta',
        onPress: () => {
          setLeadActions(null);
          router.push({ pathname: '/trainer/athlete/[id]', params: { id: leadActions.athleteId } });
        },
      },
      {
        key: 'delete',
        label: 'Eliminar ficha del tablero',
        destructive: true,
        onPress: () => {
          setLeadToDelete({ athleteId: leadActions.athleteId, name: activeLead.name });
          setLeadActions(null);
        },
      },
    );
  }

  const activeColumn = columnActions ? columns.find((column) => column.stage.id === columnActions.stageId) : undefined;
  const columnModalActions: ActionSheetAction[] = [];
  if (columnActions && activeColumn) {
    const index = columns.findIndex((column) => column.stage.id === columnActions.stageId);
    columnModalActions.push(
      {
        key: 'rename',
        label: 'Renombrar columna',
        onPress: () => {
          setColumnActions(null);
          setPrompt({ mode: 'rename', stageId: columnActions.stageId });
        },
      },
      {
        key: 'left',
        label: 'Mover columna a la izquierda',
        disabled: index <= 0,
        onPress: () => {
          void moveStage(columnActions.stageId, 'left');
          setColumnActions(null);
        },
      },
      {
        key: 'right',
        label: 'Mover columna a la derecha',
        disabled: index >= columns.length - 1,
        onPress: () => {
          void moveStage(columnActions.stageId, 'right');
          setColumnActions(null);
        },
      },
      {
        key: 'delete',
        label: 'Eliminar columna',
        destructive: true,
        disabled: columns.length <= 1,
        onPress: () => {
          void removeStage(columnActions.stageId);
          setColumnActions(null);
        },
      },
    );
  }

  return (
    <View style={styles.wrapper}>
      {!persistent ? (
        <View style={styles.warningBanner}>
          <AppIcon name="info" size={14} color={colors.warning} />
          <Text style={styles.warningText}>
            Los cambios de este tablero se guardan solo en esta sesión. Ejecuta la migración SQL del CRM en Supabase
            para que se guarden de forma permanente.
          </Text>
        </View>
      ) : null}

      {roleNotice ? (
        <View style={[styles.roleNotice, roleNotice.kind === 'error' && styles.roleNoticeError]}>
          <AppIcon
            name={roleNotice.kind === 'error' ? 'info' : 'check'}
            size={14}
            color={roleNotice.kind === 'error' ? colors.danger : colors.accentBlue}
          />
          <Text style={styles.roleNoticeText}>{roleNotice.message}</Text>
          <Pressable onPress={dismissRoleNotice} hitSlop={8}>
            <AppIcon name="close" size={14} color={colors.textMuted} />
          </Pressable>
        </View>
      ) : null}

      <View style={styles.searchBar}>
        <AppIcon name="search" size={16} color={colors.textMuted} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar atleta por nombre o email..."
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
        />
        {searchQuery ? (
          <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
            <AppIcon name="close" size={16} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      <View ref={boardWrapperRef} collapsable={false} style={styles.boardWrapper}>
        <ScrollView
          style={styles.boardVerticalScroll}
          contentContainerStyle={styles.boardVerticalContent}
          scrollEnabled={!draggingAthleteId}
          showsVerticalScrollIndicator
        >
          <ScrollView
            ref={boardScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled={!draggingAthleteId}
            onScroll={handleBoardScroll}
            onLayout={handleBoardLayout}
            onContentSizeChange={handleBoardContentSizeChange}
            scrollEventThrottle={16}
            style={styles.boardScroll}
            contentContainerStyle={styles.board}
          >
            {visibleColumns.map((column, index) => (
              <CrmColumn
                key={column.stage.id}
                stage={column.stage}
                leads={column.leads}
                emptyText={normalizedQuery ? 'Sin resultados' : 'Sin atletas en esta columna'}
                canMoveLeft={index > 0}
                canMoveRight={index < columns.length - 1}
                isDropTarget={dropHint?.stageId === column.stage.id}
                isDragSource={dragSourceStageId === column.stage.id}
                dropLineTop={dropHint?.stageId === column.stage.id ? dropHint.lineTop : null}
                columnRef={registerColumnRef(column.stage.id)}
                cardRef={registerCardRef}
                onOpenColumnActions={() => setColumnActions({ stageId: column.stage.id })}
                onOpenLead={(athleteId) =>
                  router.push({ pathname: '/trainer/athlete/[id]', params: { id: athleteId } })
                }
                onOpenLeadActions={(athleteId) => setLeadActions({ athleteId, stageId: column.stage.id })}
                onMoveLeadPrev={(athleteId) => moveLeadToAdjacentStage(athleteId, 'prev')}
                onMoveLeadNext={(athleteId) => moveLeadToAdjacentStage(athleteId, 'next')}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
              />
            ))}

            <Pressable
              onPress={() => setPrompt({ mode: 'create' })}
              style={({ pressed }) => [styles.addColumn, pressed && styles.addColumnPressed]}
            >
              <AppIcon name="add" size={20} color={colors.accent} />
              <Text style={styles.addColumnText}>Nueva columna</Text>
            </Pressable>
          </ScrollView>
        </ScrollView>
      </View>

      {canScrollBoard ? (
        <View style={styles.scrollbarRow}>
          <Pressable
            onPress={() => scrollByStep(-1)}
            hitSlop={6}
            style={({ pressed }) => [styles.scrollbarArrow, pressed && styles.scrollbarArrowPressed]}
          >
            <AppIcon name="chevronLeft" size={16} color={colors.textSecondary} />
          </Pressable>

          <View style={styles.scrollbarHitArea} {...trackPanResponder.panHandlers}>
            <View ref={trackNodeRef} collapsable={false} style={styles.scrollbarTrack} onLayout={handleTrackLayout}>
              <Animated.View
                style={[
                  styles.scrollbarThumb,
                  isDraggingThumb && styles.scrollbarThumbActive,
                  { width: thumbWidth, transform: [{ translateX: thumbTranslateX }] },
                ]}
              />
            </View>
          </View>

          <Pressable
            onPress={() => scrollByStep(1)}
            hitSlop={6}
            style={({ pressed }) => [styles.scrollbarArrow, pressed && styles.scrollbarArrowPressed]}
          >
            <AppIcon name="chevronRight" size={16} color={colors.textSecondary} />
          </Pressable>
        </View>
      ) : null}

      <ActionSheetModal
        visible={Boolean(leadActions && activeLead)}
        title={activeLead?.name}
        subtitle="¿Qué quieres hacer con este atleta?"
        actions={leadModalActions}
        onClose={() => setLeadActions(null)}
      />

      <ActionSheetModal
        visible={Boolean(columnActions && activeColumn)}
        title={activeColumn?.stage.name}
        actions={columnModalActions}
        onClose={() => setColumnActions(null)}
      />

      <ConfirmModal
        visible={leadToDelete !== null}
        title="Eliminar ficha del tablero"
        message={`${leadToDelete?.name ?? 'Esta ficha'} dejará de aparecer en tu CRM. Su cuenta, su chat y sus entrenamientos no se borran, pero perderás la columna y el orden que tenía.`}
        checkboxLabel="Entiendo que la ficha desaparecerá del tablero"
        confirmLabel="Eliminar ficha"
        destructive
        onCancel={() => setLeadToDelete(null)}
        onConfirm={() => {
          if (leadToDelete) void removeLead(leadToDelete.athleteId);
          setLeadToDelete(null);
        }}
      />

      <PromptModal
        visible={prompt?.mode === 'create'}
        title="Nueva columna"
        placeholder="Ej. Propuesta enviada"
        confirmLabel="Crear"
        onCancel={() => setPrompt(null)}
        onConfirm={(value) => {
          void addStage(value);
          setPrompt(null);
        }}
      />

      <PromptModal
        visible={prompt?.mode === 'rename'}
        title="Renombrar columna"
        placeholder="Nombre de la columna"
        initialValue={
          prompt?.mode === 'rename' ? columns.find((column) => column.stage.id === prompt.stageId)?.stage.name ?? '' : ''
        }
        confirmLabel="Guardar"
        onCancel={() => setPrompt(null)}
        onConfirm={(value) => {
          if (prompt?.mode === 'rename') {
            void renameStage(prompt.stageId, value);
          }
          setPrompt(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  loader: {
    marginTop: spacing.xl,
  },
  error: {
    ...typography.bodySmall,
    color: colors.danger,
    marginTop: spacing.md,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: `${colors.warning}18`,
    borderWidth: 1,
    borderColor: `${colors.warning}44`,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  warningText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  roleNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: `${colors.accentBlue}18`,
    borderWidth: 1,
    borderColor: `${colors.accentBlue}44`,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  roleNoticeError: {
    backgroundColor: `${colors.danger}18`,
    borderColor: `${colors.danger}44`,
  },
  roleNoticeText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm + 2,
    height: 40,
    marginBottom: spacing.sm,
    maxWidth: 360,
  },
  searchInput: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.text,
    height: '100%',
  },
  boardWrapper: {
    flex: 1,
  },
  boardVerticalScroll: {
    flex: 1,
  },
  boardVerticalContent: {
    flexGrow: 1,
  },
  /** Sin encoger: la altura la marcan las columnas y el scroll vertical lo lleva el contenedor. */
  boardScroll: {
    flexGrow: 1,
    flexShrink: 0,
  },
  board: {
    paddingBottom: spacing.md,
    alignItems: 'stretch',
  },
  scrollbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    marginRight: spacing.sm,
  },
  scrollbarArrow: {
    width: 28,
    height: 24,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  scrollbarArrowPressed: {
    backgroundColor: colors.surface,
    borderColor: colors.accent,
  },
  scrollbarHitArea: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  scrollbarTrack: {
    height: 12,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  scrollbarThumb: {
    height: '100%',
    borderRadius: borderRadius.full,
    backgroundColor: colors.textSecondary,
  },
  scrollbarThumbActive: {
    backgroundColor: colors.accent,
  },
  addColumn: {
    width: CRM_COLUMN_WIDTH,
    minHeight: 56,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginRight: spacing.sm,
  },
  addColumnPressed: {
    backgroundColor: colors.surfaceLight,
  },
  addColumnText: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '600',
  },
});
