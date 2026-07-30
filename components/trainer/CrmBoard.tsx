import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ActionSheetModal, type ActionSheetAction } from '@/components/ui/ActionSheetModal';
import { AppIcon } from '@/components/ui/AppIcon';
import { PromptModal } from '@/components/ui/PromptModal';
import { CrmColumn, CRM_COLUMN_WIDTH } from '@/components/trainer/CrmColumn';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { useTrainerCrmBoard } from '@/hooks/useTrainerCrmBoard';

type LeadActionsState = { athleteId: string; stageId: string } | null;
type ColumnActionsState = { stageId: string } | null;
type PromptState = { mode: 'create' } | { mode: 'rename'; stageId: string } | null;

export function CrmBoard() {
  const router = useRouter();
  const {
    columns,
    isLoading,
    error,
    persistent,
    moveLeadToStage,
    moveLeadToAdjacentStage,
    reorderLeadWithinStage,
    addStage,
    renameStage,
    removeStage,
    moveStage,
  } = useTrainerCrmBoard();

  const [leadActions, setLeadActions] = useState<LeadActionsState>(null);
  const [columnActions, setColumnActions] = useState<ColumnActionsState>(null);
  const [prompt, setPrompt] = useState<PromptState>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [draggingAthleteId, setDraggingAthleteId] = useState<string | null>(null);
  const [hoverStageId, setHoverStageId] = useState<string | null>(null);
  const columnNodesRef = useRef(new Map<string, View | null>());
  const columnBoundsRef = useRef<Array<{ stageId: string; x: number; width: number }>>([]);
  const columnRefCallbacksRef = useRef(new Map<string, (node: View | null) => void>());

  const boardWrapperRef = useRef<View | null>(null);
  const boardScrollRef = useRef<ScrollView | null>(null);
  const boardBoundsRef = useRef<{ x: number; width: number } | null>(null);
  const scrollXRef = useRef(0);
  const autoScrollDirRef = useRef<'left' | 'right' | null>(null);
  const autoScrollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const measureColumnBounds = useCallback(() => {
    const entries = Array.from(columnNodesRef.current.entries());
    const bounds: Array<{ stageId: string; x: number; width: number }> = [];
    let pending = entries.length;

    if (pending === 0) {
      columnBoundsRef.current = [];
      return;
    }

    entries.forEach(([stageId, node]) => {
      if (!node) {
        pending -= 1;
        return;
      }
      node.measureInWindow((x, _y, width) => {
        bounds.push({ stageId, x, width });
        pending -= 1;
        if (pending <= 0) {
          columnBoundsRef.current = bounds;
        }
      });
    });
  }, []);

  const findStageAtPageX = useCallback((pageX: number) => {
    const match = columnBoundsRef.current.find((bounds) => pageX >= bounds.x && pageX <= bounds.x + bounds.width);
    return match?.stageId ?? null;
  }, []);

  const EDGE_ZONE = 56;

  const handleDragStart = useCallback(
    (athleteId: string) => {
      measureColumnBounds();
      boardWrapperRef.current?.measureInWindow((x, _y, width) => {
        boardBoundsRef.current = { x, width };
      });
      setDraggingAthleteId(athleteId);
    },
    [measureColumnBounds],
  );

  const handleDragMove = useCallback(
    (_athleteId: string, pageX: number) => {
      setHoverStageId((current) => {
        const next = findStageAtPageX(pageX);
        return next === current ? current : next;
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
    [findStageAtPageX, startAutoScroll, stopAutoScroll],
  );

  const handleDragEnd = useCallback(
    (athleteId: string, pageX: number) => {
      stopAutoScroll();
      const targetStageId = findStageAtPageX(pageX);
      setDraggingAthleteId(null);
      setHoverStageId(null);

      if (!targetStageId) return;

      const currentStageId = columns.find((column) => column.leads.some((lead) => lead.id === athleteId))?.stage.id;
      if (targetStageId === currentStageId) return;

      void moveLeadToStage(athleteId, targetStageId);
    },
    [columns, findStageAtPageX, moveLeadToStage, stopAutoScroll],
  );

  const handleBoardScroll = useCallback((event: { nativeEvent: { contentOffset: { x: number } } }) => {
    scrollXRef.current = event.nativeEvent.contentOffset.x;
  }, []);

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
          ref={boardScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={!draggingAthleteId}
          onScroll={handleBoardScroll}
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
              isDragActive={Boolean(draggingAthleteId)}
              isDropTarget={hoverStageId === column.stage.id}
              columnRef={registerColumnRef(column.stage.id)}
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
      </View>

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
  boardScroll: {
    flex: 1,
  },
  board: {
    paddingBottom: spacing.md,
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
