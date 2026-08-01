import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message?: string;
  /** Texto de la casilla que hay que marcar antes de poder confirmar. */
  checkboxLabel?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({
  visible,
  title,
  message,
  checkboxLabel,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destructive = false,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (visible) setChecked(false);
  }, [visible]);

  const canConfirm = !checkboxLabel || checked;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          {checkboxLabel ? (
            <Pressable
              onPress={() => setChecked((current) => !current)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              style={({ pressed }) => [styles.checkRow, pressed && styles.checkRowPressed]}
            >
              <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                {checked ? <AppIcon name="check" size={12} color={colors.white} /> : null}
              </View>
              <Text style={styles.checkLabel}>{checkboxLabel}</Text>
            </Pressable>
          ) : null}

          <View style={styles.actions}>
            <Button title={cancelLabel} variant="secondary" onPress={onCancel} style={styles.actionButton} />
            <Button
              title={confirmLabel}
              onPress={onConfirm}
              disabled={!canConfirm}
              style={destructive ? styles.destructiveButton : styles.actionButton}
              textStyle={destructive ? styles.destructiveText : undefined}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  message: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    padding: spacing.sm,
  },
  checkRowPressed: {
    borderColor: colors.accent,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkLabel: {
    ...typography.bodySmall,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionButton: {
    flex: 1,
  },
  destructiveButton: {
    flex: 1,
    backgroundColor: colors.danger,
  },
  destructiveText: {
    color: colors.white,
  },
});
