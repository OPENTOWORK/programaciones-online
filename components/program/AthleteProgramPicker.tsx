import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ActionSheetModal } from '@/components/ui/ActionSheetModal';
import { Card } from '@/components/ui/Card';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';

export interface AthleteProgramOption {
  id: string;
  name: string;
}

interface AthleteProgramPickerProps {
  programs: AthleteProgramOption[];
  selectedId?: string;
  onSelect: (programId: string) => void;
}

export function AthleteProgramPicker({ programs, selectedId, onSelect }: AthleteProgramPickerProps) {
  const [visible, setVisible] = useState(false);
  const selected = programs.find((program) => program.id === selectedId) ?? programs[0];

  if (programs.length === 0 || !selected) return null;

  return (
    <>
      <Card style={styles.card}>
        <Text style={styles.label}>Programación actual</Text>
        <Pressable
          onPress={() => setVisible(true)}
          style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}
          accessibilityRole="button"
          accessibilityLabel={`Programación actual: ${selected.name}. Cambiar programación.`}
        >
          <Text style={styles.value} numberOfLines={1}>
            {selected.name}
          </Text>
          <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
        </Pressable>
      </Card>

      <ActionSheetModal
        visible={visible}
        title="Tus programaciones"
        subtitle="Elige la programación para ver su calendario"
        actions={programs.map((program) => ({
          key: program.id,
          label: program.id === selected.id ? `✓ ${program.name}` : program.name,
          onPress: () => {
            onSelect(program.id);
            setVisible(false);
          },
        }))}
        onClose={() => setVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
  },
  triggerPressed: {
    opacity: 0.88,
  },
  value: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
  },
});
