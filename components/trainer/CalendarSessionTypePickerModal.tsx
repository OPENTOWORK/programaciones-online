import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { borderRadius, colors, spacing, typography } from '@/constants/theme';

export type CalendarSessionType = 'session' | 'activation';

interface CalendarSessionTypePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: CalendarSessionType) => void;
}

const OPTIONS: Array<{
  type: CalendarSessionType;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
}> = [
  {
    type: 'session',
    label: 'Sesión normal',
    description: 'Entreno principal del día.',
    icon: 'barbell-outline',
    accent: colors.accent,
  },
  {
    type: 'activation',
    label: 'Activación',
    description: 'Sesión corta previa al entreno.',
    icon: 'flash-outline',
    accent: colors.activation,
  },
];

export function CalendarSessionTypePickerModal({
  visible,
  onClose,
  onSelect,
}: CalendarSessionTypePickerModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>¿Qué quieres crear?</Text>
          <Text style={styles.subtitle}>Elige el tipo de sesión para este día.</Text>

          <View style={styles.options}>
            {OPTIONS.map((option) => (
              <Pressable
                key={option.type}
                onPress={() => onSelect(option.type)}
                style={({ pressed }) => [
                  styles.option,
                  { borderColor: `${option.accent}55` },
                  pressed && styles.optionPressed,
                ]}
              >
                <View style={[styles.optionIcon, { backgroundColor: `${option.accent}18` }]}>
                  <Ionicons name={option.icon} size={20} color={option.accent} />
                </View>
                <View style={styles.optionCopy}>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </Pressable>
            ))}
          </View>
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
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
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
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    backgroundColor: colors.background,
  },
  optionPressed: {
    opacity: 0.88,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCopy: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  optionDescription: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
