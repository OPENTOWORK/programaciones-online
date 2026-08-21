import { useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import type { SessionTemplate } from '@/lib/sessionTemplateService';
import { describeSessionTemplate } from '@/lib/sessionTemplates';

interface DraggableTemplateRowProps {
  template: SessionTemplate;
  onEdit: () => void;
  onOptions: () => void;
  onDragStart: (templateId: string) => void;
  onDragMove: (templateId: string, pageX: number, pageY: number) => void;
  onDragEnd: (templateId: string, pageX: number, pageY: number) => void;
}

export function DraggableTemplateRow({
  template,
  onEdit,
  onOptions,
  onDragStart,
  onDragMove,
  onDragEnd,
}: DraggableTemplateRowProps) {
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const [isDragging, setIsDragging] = useState(false);
  const summary = describeSessionTemplate(template.content);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          pan.setValue({ x: 0, y: 0 });
          setIsDragging(true);
          onDragStart(template.id);
        },
        onPanResponderMove: (_event, gesture) => {
          pan.setValue({ x: gesture.dx, y: gesture.dy });
          onDragMove(template.id, gesture.moveX, gesture.moveY);
        },
        onPanResponderRelease: (_event, gesture) => {
          setIsDragging(false);
          onDragEnd(template.id, gesture.moveX, gesture.moveY);
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false, speed: 20 }).start();
        },
        onPanResponderTerminate: (_event, gesture) => {
          setIsDragging(false);
          onDragEnd(template.id, gesture.moveX, gesture.moveY);
          pan.setValue({ x: 0, y: 0 });
        },
      }),
    [onDragEnd, onDragMove, onDragStart, pan, template.id],
  );

  return (
    <Animated.View
      style={[
        styles.row,
        isDragging && styles.rowDragging,
        { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
      ]}
    >
      <Pressable
        accessibilityLabel={`Arrastrar ${template.name}`}
        style={({ pressed }) => [styles.dragHandle, pressed && styles.pressed]}
        {...panResponder.panHandlers}
      >
        <AppIcon name="dragHandle" size={18} color={colors.textMuted} />
      </Pressable>

      <Pressable
        onPress={onEdit}
        style={({ pressed }) => [styles.rowMain, pressed && styles.pressed]}
      >
        <Text style={styles.rowName} numberOfLines={2}>
          {template.formatTag ?? template.tag ?? template.name}
        </Text>
        <Text style={styles.rowDetails} numberOfLines={1}>
          {[
            template.formatTag && template.tag ? template.tag : null,
            `${summary.blockCount} bloque${summary.blockCount === 1 ? '' : 's'}`,
          ]
            .filter(Boolean)
            .join(' · ')}
        </Text>
        {summary.exerciseLines.length > 0 ? (
          <View style={styles.exerciseList}>
            {summary.exerciseLines.map((line, index) => (
              <Text key={`${template.id}-ex-${index}`} style={styles.exerciseLine} numberOfLines={2}>
                • {line}
              </Text>
            ))}
          </View>
        ) : (
          <Text style={styles.rowBlocks}>Sin ejercicios listados</Text>
        )}
      </Pressable>

      <Pressable
        onPress={onOptions}
        hitSlop={8}
        accessibilityLabel={`Opciones de ${template.name}`}
        style={({ pressed }) => [styles.rowOptions, pressed && styles.pressed]}
      >
        <AppIcon name="menuDots" size={18} color={colors.textSecondary} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  rowDragging: {
    zIndex: 40,
    elevation: 10,
    borderColor: `${colors.accent}88`,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
  },
  dragHandle: {
    paddingLeft: spacing.sm,
    paddingVertical: spacing.md,
    paddingRight: spacing.xs,
    cursor: 'grab' as unknown as undefined,
  },
  rowMain: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingRight: spacing.xs,
    gap: 2,
  },
  rowName: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  rowDetails: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  rowBlocks: {
    ...typography.caption,
    color: colors.textMuted,
  },
  exerciseList: {
    marginTop: spacing.xs,
    gap: 2,
  },
  exerciseLine: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  rowOptions: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  pressed: {
    opacity: 0.75,
  },
});
