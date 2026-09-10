import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';

export interface ActionSheetAction {
  key: string;
  label: string;
  destructive?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

interface ActionSheetModalProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  actions: ActionSheetAction[];
  onClose: () => void;
}

const isWeb = Platform.OS === 'web';

export function ActionSheetModal({ visible, title, subtitle, actions, onClose }: ActionSheetModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.overlay, isWeb && styles.overlayWeb]} onPress={onClose}>
        <Pressable
          style={[styles.sheet, isWeb && styles.sheetWeb]}
          onPress={(event) => event.stopPropagation()}
        >
          {title || subtitle ? (
            <View style={styles.header}>
              {title ? <Text style={styles.title}>{title}</Text> : null}
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
          ) : null}

          <View style={styles.actionsGroup}>
            {actions.map((action, index) => (
              <Pressable
                key={action.key}
                onPress={() => {
                  if (action.disabled) return;
                  action.onPress();
                }}
                disabled={action.disabled}
                style={({ pressed }) => [
                  styles.actionRow,
                  index < actions.length - 1 && styles.actionRowBorder,
                  pressed && !action.disabled && styles.actionRowPressed,
                  action.disabled && styles.actionRowDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.actionText,
                    action.destructive && styles.actionTextDestructive,
                    action.disabled && styles.actionTextDisabled,
                  ]}
                >
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.cancelRow, pressed && styles.actionRowPressed]}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  overlayWeb: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  sheetWeb: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 360,
    paddingBottom: spacing.md,
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '0 12px 40px rgba(15, 20, 25, 0.18)' } as object)
      : null),
  },
  header: {
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    gap: 2,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  actionsGroup: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  actionRow: {
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  actionRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  actionRowPressed: {
    backgroundColor: colors.surfaceLight,
  },
  actionRowDisabled: {
    opacity: 0.4,
  },
  actionText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  actionTextDestructive: {
    color: colors.danger,
    fontWeight: '600',
  },
  actionTextDisabled: {
    color: colors.textMuted,
  },
  cancelRow: {
    marginTop: spacing.xs,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: withAlpha(colors.surfaceLight, '88'),
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
});
