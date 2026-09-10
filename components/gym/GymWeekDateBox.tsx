import { createElement } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { borderRadius, colors, typography } from '@/constants/theme';
import { gymDateKey } from '@/lib/gymTraining';

export function GymWeekDateBox({
  date,
  onChangeDate,
}: {
  date: Date;
  onChangeDate: (value: string) => void;
}) {
  const value = gymDateKey(date);

  return (
    <View style={styles.box}>
      <AppIcon name="calendar" size={16} color={colors.accent} outlined />
      {Platform.OS === 'web'
        ? createElement('input', {
            type: 'date',
            value,
            onChange: (event: { target: { value: string } }) => {
              if (event.target.value) onChangeDate(event.target.value);
            },
            'aria-label': 'Elegir semana',
            style: {
              border: 'none',
              background: 'transparent',
              color: 'inherit',
              fontFamily: 'inherit',
              fontSize: 13,
              fontWeight: '700',
              outline: 'none',
              minWidth: 128,
              cursor: 'pointer',
            },
          })
        : (
          <TextInput
            value={value}
            onChangeText={(next) => {
              if (/^\d{4}-\d{2}-\d{2}$/.test(next)) onChangeDate(next);
            }}
            accessibilityLabel="Elegir semana"
            placeholder="AAAA-MM-DD"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
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
    minHeight: 36,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
  },
  input: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
    minWidth: 108,
    paddingVertical: 6,
  },
});
