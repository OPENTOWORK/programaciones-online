import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';

interface ExerciseLibrarySettingsModalProps {
  visible: boolean;
  athletesCanSeePageLibrary: boolean;
  saving?: boolean;
  error?: string | null;
  onClose: () => void;
  onChange: (athletesCanSeePageLibrary: boolean) => void;
}

export function ExerciseLibrarySettingsModal({
  visible,
  athletesCanSeePageLibrary,
  saving = false,
  error,
  onClose,
  onChange,
}: ExerciseLibrarySettingsModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>Configuración de biblioteca</Text>
          <Text style={styles.subtitle}>
            Decide qué vídeos pueden ver tus atletas cuando abren la biblioteca.
          </Text>

          <Pressable
            onPress={() => !saving && onChange(true)}
            disabled={saving}
            style={({ pressed }) => [
              styles.option,
              athletesCanSeePageLibrary && styles.optionActive,
              pressed && !saving && styles.optionPressed,
            ]}
          >
            <View style={styles.optionCopy}>
              <Text style={[styles.optionTitle, athletesCanSeePageLibrary && styles.optionTitleActive]}>
                Vídeos de la página + los míos
              </Text>
              <Text style={styles.optionText}>
                Tus atletas verán el catálogo general y también los vídeos que subas tú.
              </Text>
            </View>
            {athletesCanSeePageLibrary ? (
              <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
            ) : null}
          </Pressable>

          <Pressable
            onPress={() => !saving && onChange(false)}
            disabled={saving}
            style={({ pressed }) => [
              styles.option,
              !athletesCanSeePageLibrary && styles.optionActive,
              pressed && !saving && styles.optionPressed,
            ]}
          >
            <View style={styles.optionCopy}>
              <Text style={[styles.optionTitle, !athletesCanSeePageLibrary && styles.optionTitleActive]}>
                Solo mis vídeos
              </Text>
              <Text style={styles.optionText}>
                Tus atletas solo verán los vídeos que hayas subido tú a la biblioteca.
              </Text>
            </View>
            {!athletesCanSeePageLibrary ? (
              <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
            ) : null}
          </Pressable>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {saving ? <Text style={styles.saving}>Guardando…</Text> : null}

          <Pressable onPress={onClose} style={({ pressed }) => [styles.closeBtn, pressed && styles.closeBtnPressed]}>
            <Text style={styles.closeBtnText}>Cerrar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
  },
  optionActive: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '12'),
  },
  optionPressed: {
    opacity: 0.9,
  },
  optionCopy: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  optionTitleActive: {
    color: colors.accent,
  },
  optionText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
  },
  saving: {
    ...typography.caption,
    color: colors.textMuted,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  closeBtnPressed: {
    opacity: 0.85,
  },
  closeBtnText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
