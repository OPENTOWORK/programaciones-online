import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';

interface SessionVideoExercisePickerModalProps {
  visible: boolean;
  exerciseNames: string[];
  onSelect: (exerciseName: string) => void;
  onClose: () => void;
}

export function SessionVideoExercisePickerModal({
  visible,
  exerciseNames,
  onSelect,
  onClose,
}: SessionVideoExercisePickerModalProps) {
  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>¿De qué ejercicio es el vídeo?</Text>
          <Text style={styles.subtitle}>
            Si subes un vídeo general de la sesión, indica el ejercicio al que corresponde.
          </Text>

          {exerciseNames.length === 0 ? (
            <Text style={styles.empty}>No hay ejercicios en esta sesión.</Text>
          ) : (
            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
            >
              {exerciseNames.map((name) => (
                <Pressable
                  key={name}
                  onPress={() => onSelect(name)}
                  style={({ pressed }) => [styles.option, pressed && styles.pressed]}
                >
                  <Text style={styles.optionText}>{name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          <Button title="Cancelar" variant="secondary" onPress={onClose} style={styles.cancelBtn} />
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
    width: '100%',
    maxWidth: 420,
    maxHeight: '80%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    lineHeight: 20,
  },
  empty: {
    ...typography.bodySmall,
    color: colors.textMuted,
    paddingVertical: spacing.md,
    textAlign: 'center',
  },
  list: {
    flexGrow: 0,
    flexShrink: 1,
  },
  listContent: {
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  option: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  optionText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  cancelBtn: {
    marginTop: spacing.xs,
  },
  pressed: {
    backgroundColor: withAlpha(colors.accent, '12'),
  },
});
