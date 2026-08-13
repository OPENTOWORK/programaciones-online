import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import type { ActionSheetAction } from '@/components/ui/ActionSheetModal';
import { borderRadius, colors, shadows, spacing, typography } from '@/constants/theme';

/** Posición en pantalla del botón que abre el menú. */
export interface PopoverAnchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PopoverMenuProps {
  visible: boolean;
  anchor: PopoverAnchor | null;
  title?: string;
  actions: ActionSheetAction[];
  onClose: () => void;
}

const MENU_WIDTH = 210;
const GAP = 6;
const SCREEN_MARGIN = spacing.sm;

export function PopoverMenu({ visible, anchor, title, actions, onClose }: PopoverMenuProps) {
  const { width, height } = useWindowDimensions();

  if (!anchor) return null;

  // Alineado al borde derecho del botón, y hacia arriba si abajo no cabe.
  const estimatedHeight = (title ? 34 : 0) + actions.length * 42 + spacing.sm * 2;
  const openUpwards = anchor.y + anchor.height + GAP + estimatedHeight > height - SCREEN_MARGIN;

  const left = Math.min(
    Math.max(SCREEN_MARGIN, anchor.x + anchor.width - MENU_WIDTH),
    width - MENU_WIDTH - SCREEN_MARGIN,
  );
  const top = openUpwards
    ? Math.max(SCREEN_MARGIN, anchor.y - GAP - estimatedHeight)
    : anchor.y + anchor.height + GAP;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.menu, { left, top }]}
          onPress={(event) => event.stopPropagation()}
        >
          {title ? (
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          ) : null}

          {actions.map((action) => (
            <Pressable
              key={action.key}
              onPress={() => {
                if (action.disabled) return;
                action.onPress();
              }}
              disabled={action.disabled}
              style={({ pressed }) => [
                styles.row,
                pressed && !action.disabled && styles.rowPressed,
              ]}
            >
              <Text
                style={[
                  styles.rowText,
                  action.destructive && styles.rowTextDestructive,
                  action.disabled && styles.rowTextDisabled,
                ]}
              >
                {action.label}
              </Text>
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    width: MENU_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xs,
    ...shadows.card,
  },
  title: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xs,
    marginBottom: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  row: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  rowPressed: {
    backgroundColor: colors.surfaceLight,
  },
  rowText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  rowTextDestructive: {
    color: colors.danger,
  },
  rowTextDisabled: {
    color: colors.textMuted,
  },
});
