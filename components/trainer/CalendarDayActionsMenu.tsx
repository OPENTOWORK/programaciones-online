import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import { Modal, Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import type { PopoverAnchor } from '@/components/ui/PopoverMenu';
import { HoverTooltip } from '@/components/ui/HoverTooltip';
import { borderRadius, colors, shadows, spacing } from '@/constants/theme';

export type CalendarDayActionId = 'session' | 'rest' | 'nutrition' | 'copy' | 'template';

export interface CalendarDayAction {
  id: CalendarDayActionId;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
}

const DAY_ACTIONS: CalendarDayAction[] = [
  { id: 'session', label: 'Nueva sesión', icon: 'add' },
  { id: 'rest', label: 'Día de descanso', icon: 'flash-outline' },
  { id: 'nutrition', label: 'Nutrición', icon: 'nutrition-outline' },
  { id: 'copy', label: 'Copiar día', icon: 'copy-outline' },
  { id: 'template', label: 'Usar plantilla', icon: 'albums-outline' },
];

const MENU_WIDTH = 148;
const GAP = 8;
const SCREEN_MARGIN = spacing.sm;

interface CalendarDayActionsMenuProps {
  visible: boolean;
  anchor: PopoverAnchor | null;
  onClose: () => void;
  onAction: (action: CalendarDayActionId) => void;
  canCopy?: boolean;
  /** El día ya tiene un descanso marcado. */
  hasRestDay?: boolean;
  accentColor?: string;
}

export function CalendarDayActionsMenu({
  visible,
  anchor,
  onClose,
  onAction,
  canCopy = false,
  hasRestDay = false,
  accentColor = colors.accent,
}: CalendarDayActionsMenuProps) {
  const { width, height } = useWindowDimensions();

  if (!anchor) return null;

  const menuHeight = 112;
  const openUpwards = anchor.y + anchor.height + GAP + menuHeight > height - SCREEN_MARGIN;
  const left = Math.min(
    Math.max(SCREEN_MARGIN, anchor.x + anchor.width / 2 - MENU_WIDTH / 2),
    width - MENU_WIDTH - SCREEN_MARGIN,
  );
  const top = openUpwards
    ? Math.max(SCREEN_MARGIN, anchor.y - GAP - menuHeight)
    : anchor.y + anchor.height + GAP;

  const actions = DAY_ACTIONS.map((action) => {
    if (action.id === 'copy') return { ...action, disabled: !canCopy };
    if (action.id === 'rest') return { ...action, disabled: hasRestDay };
    return action;
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.menu, { left, top, width: MENU_WIDTH }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.row}>
            {actions.slice(0, 3).map((action) => (
              <DayActionButton
                key={action.id}
                action={action}
                accentColor={accentColor}
                onPress={() => onAction(action.id)}
              />
            ))}
          </View>
          <View style={[styles.row, styles.rowBottom]}>
            {actions.slice(3).map((action) => (
              <DayActionButton
                key={action.id}
                action={action}
                accentColor={accentColor}
                onPress={() => onAction(action.id)}
              />
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function dayActionTooltip(action: CalendarDayAction): string {
  if (action.id === 'copy' && action.disabled) return 'Sin sesiones';
  if (action.id === 'rest' && action.disabled) return 'Ya hay descanso';
  return action.label;
}

function DayActionButton({
  action,
  onPress,
  accentColor,
}: {
  action: CalendarDayAction;
  onPress: () => void;
  accentColor: string;
}) {
  return (
    <HoverTooltip label={dayActionTooltip(action)}>
      <Pressable
        onPress={() => {
          if (action.disabled) return;
          onPress();
        }}
        disabled={action.disabled}
        accessibilityLabel={action.label}
        style={({ pressed }) => [
          styles.actionBtn,
          {
            backgroundColor: `${accentColor}10`,
            borderColor: `${accentColor}30`,
          },
          action.disabled && styles.actionBtnDisabled,
          pressed &&
            !action.disabled && [
              styles.actionBtnPressed,
              { backgroundColor: `${accentColor}22` },
            ],
          Platform.OS === 'web' && !action.disabled && styles.actionBtnWeb,
        ]}
      >
        <Ionicons
          name={action.icon}
          size={18}
          color={action.disabled ? colors.textMuted : colors.text}
        />
      </Pressable>
    </HoverTooltip>
  );
}

interface DayActionsButtonProps {
  onPress: (anchor: PopoverAnchor) => void;
  size?: 'small' | 'medium';
  color?: string;
}

/** Icono de marcador en la celda del día; abre el menú de acciones rápidas. */
export function DayActionsButton({ onPress, size = 'small', color = colors.accent }: DayActionsButtonProps) {
  const ref = useRef<View>(null);
  const iconSize = size === 'small' ? 14 : 16;

  return (
    <Pressable
      ref={ref}
      hitSlop={8}
      accessibilityLabel="Acciones del día"
      onPress={(event) => {
        event.stopPropagation?.();
        ref.current?.measureInWindow((x, y, width, height) => onPress({ x, y, width, height }));
      }}
      style={({ pressed }) => [styles.dayBtn, pressed && styles.dayBtnPressed]}
    >
      <Ionicons name="bookmark-outline" size={iconSize} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  menu: {
    position: 'absolute',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xs,
    gap: spacing.xs,
    overflow: 'visible',
    ...shadows.card,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
    overflow: 'visible',
  },
  rowBottom: {
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionBtnPressed: {
    opacity: 0.85,
  },
  actionBtnDisabled: {
    opacity: 0.45,
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  actionBtnWeb: {
    cursor: 'pointer',
  } as object,
  dayBtn: {
    padding: 2,
    borderRadius: borderRadius.sm,
  },
  dayBtnPressed: {
    opacity: 0.75,
  },
});
