import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import type { AppIconName } from '@/constants/icons';

export type CrmViewMode = 'kanban' | 'list' | 'grid';

const VIEW_OPTIONS: Array<{ id: CrmViewMode; label: string; icon: AppIconName }> = [
  { id: 'kanban', label: 'Kanban', icon: 'kanban' },
  { id: 'list', label: 'Lista', icon: 'programs' },
  { id: 'grid', label: 'Cuadrícula', icon: 'templates' },
];

export function CrmViewToggle({
  mode,
  onChange,
}: {
  mode: CrmViewMode;
  onChange: (mode: CrmViewMode) => void;
}) {
  return (
    <View style={styles.toggle}>
      {VIEW_OPTIONS.map((item) => {
        const active = mode === item.id;
        return (
          <Pressable
            key={item.id}
            onPress={() => onChange(item.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`Ver CRM en ${item.label.toLowerCase()}`}
            style={({ pressed }) => [
              styles.chip,
              active && styles.chipActive,
              pressed && styles.pressed,
            ]}
          >
            <AppIcon name={item.icon} size={14} color={active ? colors.accent : colors.textMuted} />
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    flexShrink: 0,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  chipActive: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}18`,
  },
  chipText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  chipTextActive: {
    color: colors.text,
  },
  pressed: {
    opacity: 0.88,
  },
});
