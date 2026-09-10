import { createElement } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { borderRadius, colors, typography } from '@/constants/theme';

export function GymPickerBox({
  type,
  value,
  onChange,
  accessibilityLabel,
}: {
  type: 'date' | 'time';
  value: string;
  onChange: (value: string) => void;
  accessibilityLabel: string;
}) {
  const isDate = type === 'date';

  return (
    <View style={styles.box}>
      <AppIcon
        name={isDate ? 'calendar' : 'time'}
        size={16}
        color={isDate ? colors.accent : colors.accentBlue}
        outlined
      />
      {Platform.OS === 'web'
        ? createElement('input', {
            type,
            value,
            onChange: (event: { target: { value: string } }) => {
              if (event.target.value) onChange(event.target.value);
            },
            'aria-label': accessibilityLabel,
            style: {
              border: 'none',
              background: 'transparent',
              color: 'inherit',
              fontFamily: 'inherit',
              fontSize: 14,
              fontWeight: '600',
              outline: 'none',
              minWidth: isDate ? 128 : 88,
              cursor: 'pointer',
            },
          })
        : (
          <TextInput
            value={value}
            onChangeText={onChange}
            accessibilityLabel={accessibilityLabel}
            placeholder={isDate ? 'AAAA-MM-DD' : 'HH:MM'}
            placeholderTextColor={colors.textMuted}
            style={[styles.input, isDate ? styles.dateInput : styles.timeInput]}
          />
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
  },
  input: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    paddingVertical: 8,
  },
  dateInput: {
    minWidth: 108,
  },
  timeInput: {
    minWidth: 64,
  },
});
