import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { borderRadius, colors, spacing, typography } from '@/constants/theme';

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

export function ActionSheetModal({ visible, title, subtitle, actions, onClose }: ActionSheetModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

          <View style={styles.actions}>
            {actions.map((action) => (
              <Pressable
                key={action.key}
                onPress={() => {
                  if (action.disabled) return;
                  action.onPress();
                }}
                disabled={action.disabled}
                style={({ pressed }) => [
                  styles.actionRow,
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

          <Pressable onPress={onClose} style={({ pressed }) => [styles.cancelRow, pressed && styles.actionRowPressed]}>
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
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 2,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  actions: {
    gap: 2,
  },
  actionRow: {
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
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
  },
  actionTextDestructive: {
    color: colors.danger,
  },
  actionTextDisabled: {
    color: colors.textMuted,
  },
  cancelRow: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
});
