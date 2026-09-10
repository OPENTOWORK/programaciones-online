import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';

export interface AthleteProgramOption {
  id: string;
  name: string;
}

interface AthleteProgramPickerProps {
  programs: AthleteProgramOption[];
  selectedId?: string;
  onSelect: (programId: string) => void;
  defaultExpanded?: boolean;
}

export function AthleteProgramPicker({
  programs,
  selectedId,
  onSelect,
  defaultExpanded = false,
}: AthleteProgramPickerProps) {
  const selected = programs.find((program) => program.id === selectedId) ?? programs[0];

  if (programs.length === 0 || !selected) return null;

  return (
    <CollapsibleSection title="Programación actual" defaultExpanded={defaultExpanded}>
      <View style={styles.options}>
        {programs.map((program) => {
          const active = program.id === selected.id;
          return (
            <Pressable
              key={program.id}
              onPress={() => onSelect(program.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={active ? `${program.name}, seleccionada` : `Elegir ${program.name}`}
              style={({ pressed }) => [
                styles.option,
                active && styles.optionActive,
                pressed && styles.optionPressed,
              ]}
            >
              <Text style={[styles.optionText, active && styles.optionTextActive]} numberOfLines={2}>
                {program.name}
              </Text>
              {active ? <Ionicons name="checkmark" size={18} color={colors.accent} /> : null}
            </Pressable>
          );
        })}
      </View>
    </CollapsibleSection>
  );
}

const styles = StyleSheet.create({
  options: {
    gap: spacing.sm,
  },
  option: {
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
  optionActive: {
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },
  optionPressed: {
    opacity: 0.88,
  },
  optionText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
    flex: 1,
  },
  optionTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
});
