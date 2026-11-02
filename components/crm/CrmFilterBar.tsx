import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';

export interface CrmFilterOption {
  id: string;
  label: string;
  count: number;
}

interface CrmFilterBarProps {
  options: CrmFilterOption[];
  /** `null` = sin filtro de columna. */
  value: string | null;
  onChange: (value: string | null) => void;
  totalLabel?: string;
  totalCount: number;
  onlyPending: boolean;
  onOnlyPendingChange: (value: boolean) => void;
  pendingCount: number;
}

export function CrmFilterBar({
  options,
  value,
  onChange,
  totalLabel = 'Todos',
  totalCount,
  onlyPending,
  onOnlyPendingChange,
  pendingCount,
}: CrmFilterBarProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      <Chip
        label={`${totalLabel} · ${totalCount}`}
        active={value === null}
        onPress={() => onChange(null)}
      />

      {options.map((option) => (
        <Chip
          key={option.id}
          label={`${option.label} · ${option.count}`}
          active={value === option.id}
          onPress={() => onChange(value === option.id ? null : option.id)}
        />
      ))}

      <View style={styles.divider} />

      <Chip
        label={`Con avisos · ${pendingCount}`}
        active={onlyPending}
        tone="alert"
        onPress={() => onOnlyPendingChange(!onlyPending)}
      />
    </ScrollView>
  );
}

function Chip({
  label,
  active,
  onPress,
  tone = 'default',
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  tone?: 'default' | 'alert';
}) {
  const accent = tone === 'alert' ? colors.danger : colors.accent;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.chip,
        active && { borderColor: accent, backgroundColor: withAlpha(accent, '18') },
        pressed && styles.chipPressed,
      ]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingRight: spacing.sm,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
    marginHorizontal: 2,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    maxWidth: 220,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  chipPressed: {
    opacity: 0.88,
  },
  chipText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  chipTextActive: {
    color: colors.text,
  },
});
