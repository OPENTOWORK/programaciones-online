import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

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
  /** Lista visible, sin cabecera desplegable. */
  bare?: boolean;
  /** Filas bajas para convivir con el calendario. */
  compact?: boolean;
}

export function AthleteProgramPicker({
  programs,
  selectedId,
  onSelect,
  defaultExpanded = false,
  bare = false,
  compact = false,
}: AthleteProgramPickerProps) {
  const selected = programs.find((program) => program.id === selectedId) ?? programs[0];

  if (programs.length === 0 || !selected) return null;

  const options = (
      <View style={[styles.options, compact && styles.optionsCompact]}>
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
                compact && styles.optionCompact,
                active && styles.optionActive,
                pressed && styles.optionPressed,
              ]}
            >
              <Text
                style={[styles.optionText, compact && styles.optionTextCompact, active && styles.optionTextActive]}
                numberOfLines={1}
              >
                {program.name}
              </Text>
              {active ? <Ionicons name="checkmark" size={18} color={colors.accent} /> : null}
            </Pressable>
          );
        })}
      </View>
  );

  if (bare) return options;

  return (
    <CollapsibleSection title="Programación actual" defaultExpanded={defaultExpanded} style={styles.fill}>
      {options}
    </CollapsibleSection>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  options: {
    gap: spacing.sm,
  },
  optionsCompact: {
    gap: 6,
  },
  optionCompact: {
    paddingVertical: 7,
    paddingHorizontal: spacing.sm + 2,
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
  optionTextCompact: {
    fontSize: 14,
    lineHeight: 18,
  },
});
