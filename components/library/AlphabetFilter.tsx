import { ScrollView, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { ALPHABET_FILTER_LETTERS } from '@/lib/alphabetFilter';

interface AlphabetFilterProps {
  selected: string | null;
  availableLetters: Set<string>;
  onSelect: (letter: string | null) => void;
  style?: ViewStyle;
}

export function AlphabetFilter({ selected, availableLetters, onSelect, style }: AlphabetFilterProps) {
  const showSymbolBucket = availableLetters.has('#');

  return (
    <View style={[styles.wrap, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          onPress={() => onSelect(null)}
          accessibilityRole="button"
          accessibilityState={{ selected: selected === null }}
          accessibilityLabel="Mostrar todos"
          style={[styles.chip, selected === null && styles.chipActive]}
        >
          <Text style={[styles.chipText, selected === null && styles.chipTextActive]}>Todos</Text>
        </Pressable>

        {ALPHABET_FILTER_LETTERS.map((letter) => {
          const enabled = availableLetters.has(letter);
          const active = selected === letter;

          return (
            <Pressable
              key={letter}
              disabled={!enabled}
              onPress={() => onSelect(active ? null : letter)}
              accessibilityRole="button"
              accessibilityState={{ selected: active, disabled: !enabled }}
              accessibilityLabel={`Filtrar por ${letter}`}
              style={[
                styles.chip,
                active && styles.chipActive,
                !enabled && styles.chipDisabled,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  active && styles.chipTextActive,
                  !enabled && styles.chipTextDisabled,
                ]}
              >
                {letter}
              </Text>
            </Pressable>
          );
        })}

        {showSymbolBucket ? (
          <Pressable
            onPress={() => onSelect(selected === '#' ? null : '#')}
            accessibilityRole="button"
            accessibilityState={{ selected: selected === '#' }}
            accessibilityLabel="Filtrar por números y símbolos"
            style={[styles.chip, selected === '#' && styles.chipActive]}
          >
            <Text style={[styles.chipText, selected === '#' && styles.chipTextActive]}>#</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 2,
  },
  chip: {
    minWidth: 32,
    height: 32,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '18'),
  },
  chipDisabled: {
    opacity: 0.35,
  },
  chipText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  chipTextActive: {
    color: colors.accent,
  },
  chipTextDisabled: {
    color: colors.textMuted,
  },
});
