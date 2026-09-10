import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { PICKER_THEMES } from '@/constants/appThemes';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

interface ThemePickerProps {
  compact?: boolean;
}

export function ThemePicker({ compact = false }: ThemePickerProps) {
  const { themeId, theme, setThemeId, canChooseTheme } = useAppTheme();
  const [open, setOpen] = useState(false);

  if (!canChooseTheme) return null;

  return (
    <View style={compact ? styles.compactWrap : styles.wrap}>
      <Pressable
        onPress={() => setOpen((current) => !current)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={open ? 'Cerrar selector de tema' : 'Elegir tema'}
        style={({ pressed }) => [
          compact ? styles.compactTrigger : styles.trigger,
          pressed && styles.triggerPressed,
        ]}
      >
        {compact ? (
          <View style={[styles.currentSwatch, styles.currentSwatchCompact, { backgroundColor: theme.swatch }]} />
        ) : (
          <>
            <AppIcon name="colorPalette" size={16} color={colors.textSecondary} outlined />
            <Text style={styles.title}>Elegir tema</Text>
            <View style={[styles.currentSwatch, { backgroundColor: theme.swatch }]} />
          </>
        )}
        <AppIcon
          name="chevronDown"
          size={compact ? 12 : 14}
          color={colors.textMuted}
          style={open ? styles.chevronOpen : undefined}
        />
      </Pressable>
      {open ? (
        <View style={styles.grid}>
          {PICKER_THEMES.map((option) => {
            const selected = option.id === themeId;
            return (
              <Pressable
                key={option.id}
                onPress={() => setThemeId(option.id)}
                accessibilityRole="button"
                accessibilityLabel={`Tema ${option.label}`}
                accessibilityState={{ selected }}
                style={({ pressed }) => [
                  styles.swatch,
                  compact && styles.swatchCompact,
                  selected && styles.swatchSelected,
                  pressed && styles.swatchPressed,
                ]}
              >
                <View style={[styles.swatchFill, { backgroundColor: option.swatch }]} />
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  compactWrap: {
    maxWidth: 168,
    padding: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'stretch',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    cursor: 'pointer',
  },
  compactTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    cursor: 'pointer',
  },
  triggerPressed: {
    opacity: 0.85,
  },
  title: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    flex: 1,
  },
  currentSwatch: {
    width: 14,
    height: 14,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  currentSwatchCompact: {
    width: 16,
    height: 16,
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 2,
    paddingBottom: 2,
  },
  swatch: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.full,
    padding: 2,
    borderWidth: 2,
    borderColor: 'transparent',
    cursor: 'pointer',
  },
  swatchCompact: {
    width: 18,
    height: 18,
  },
  swatchSelected: {
    borderColor: colors.text,
  },
  swatchPressed: {
    opacity: 0.85,
  },
  swatchFill: {
    flex: 1,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
  },
});
