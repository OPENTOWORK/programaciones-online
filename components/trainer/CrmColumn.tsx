import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { DraggableLeadCard } from '@/components/trainer/DraggableLeadCard';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import type { AthleteSummary, CrmStage } from '@/lib/types';

export const CRM_COLUMN_WIDTH = 268;

interface CrmColumnProps {
  stage: CrmStage;
  leads: AthleteSummary[];
  emptyText?: string;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  isDropTarget: boolean;
  /** La columna de la que sale la ficha deja de recortar para que se vea entera mientras viaja. */
  isDragSource: boolean;
  /** Altura de la línea que marca dónde caerá la ficha arrastrada, medida desde el borde de la columna. */
  dropLineTop: number | null;
  columnRef: (node: View | null) => void;
  cardRef: (athleteId: string) => (node: View | null) => void;
  onOpenColumnActions: () => void;
  onOpenLead: (athleteId: string) => void;
  onOpenLeadActions: (athleteId: string) => void;
  onMoveLeadPrev: (athleteId: string) => void;
  onMoveLeadNext: (athleteId: string) => void;
  onDragStart: (athleteId: string) => void;
  onDragMove: (athleteId: string, pageX: number, pageY: number) => void;
  onDragEnd: (athleteId: string, pageX: number, pageY: number) => void;
}

export function CrmColumn({
  stage,
  leads,
  emptyText = 'Sin atletas en esta columna',
  canMoveLeft,
  canMoveRight,
  isDropTarget,
  isDragSource,
  dropLineTop,
  columnRef,
  cardRef,
  onOpenColumnActions,
  onOpenLead,
  onOpenLeadActions,
  onMoveLeadPrev,
  onMoveLeadNext,
  onDragStart,
  onDragMove,
  onDragEnd,
}: CrmColumnProps) {
  return (
    <View
      ref={columnRef}
      collapsable={false}
      style={[styles.column, isDropTarget && styles.columnDropTarget, isDragSource && styles.columnDragSource]}
    >
      <Pressable
        onPress={onOpenColumnActions}
        style={({ pressed }) => [styles.header, pressed && styles.headerPressed]}
      >
        <View style={styles.headerCopy}>
          <Text style={styles.title} numberOfLines={1}>
            {stage.name}
          </Text>
          <Text style={styles.count}>{leads.length}</Text>
        </View>
        <AppIcon name="menuDots" size={16} color={colors.textMuted} />
      </Pressable>

      {stage.roleSlug === 'entrenador' ? (
        <Text style={styles.roleHint}>Al soltar aquí, el atleta pasa a rol entrenador</Text>
      ) : null}

      <View style={styles.list}>
        {leads.length === 0 ? (
          <Text style={[styles.emptyText, isDropTarget && styles.emptyTextDropTarget]}>
            {isDropTarget ? 'Suelta aquí' : emptyText}
          </Text>
        ) : (
          leads.map((athlete) => (
            <DraggableLeadCard
              key={athlete.id}
              athlete={athlete}
              cardRef={cardRef(athlete.id)}
              canMovePrev={canMoveLeft}
              canMoveNext={canMoveRight}
              onPress={() => onOpenLead(athlete.id)}
              onOpenActions={() => onOpenLeadActions(athlete.id)}
              onMovePrev={() => onMoveLeadPrev(athlete.id)}
              onMoveNext={() => onMoveLeadNext(athlete.id)}
              onDragStart={onDragStart}
              onDragMove={onDragMove}
              onDragEnd={onDragEnd}
            />
          ))
        )}
      </View>

      {/* En posición absoluta a propósito: si ocupara sitio movería las fichas y el hueco calculado
       * cambiaría solo con dibujar la línea. */}
      {dropLineTop !== null ? (
        <View pointerEvents="none" style={[styles.dropLine, { top: dropLineTop }]} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    width: CRM_COLUMN_WIDTH,
    minHeight: 180,
    marginRight: spacing.sm,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  columnDropTarget: {
    borderColor: colors.accent,
    borderWidth: 2,
    backgroundColor: `${colors.accent}0F`,
  },
  /** Sin recorte y por encima del resto: si no, la ficha se corta al salir y la tapan las columnas siguientes. */
  columnDragSource: {
    overflow: 'visible',
    zIndex: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  headerPressed: {
    backgroundColor: colors.surface,
  },
  headerCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  title: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
    flexShrink: 1,
  },
  count: {
    ...typography.caption,
    color: colors.textMuted,
    backgroundColor: colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
  },
  roleHint: {
    ...typography.caption,
    color: colors.accentBlue,
    paddingHorizontal: spacing.sm + 2,
    paddingTop: spacing.xs,
    lineHeight: 15,
  },
  list: {
    flexGrow: 1,
    padding: spacing.sm,
  },
  emptyText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  emptyTextDropTarget: {
    color: colors.accent,
    fontWeight: '700',
  },
  dropLine: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    height: 3,
    marginTop: -1.5,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    zIndex: 10,
  },
});
