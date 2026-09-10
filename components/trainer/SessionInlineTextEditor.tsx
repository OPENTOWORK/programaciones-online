import { useMemo } from 'react';
import { StyleSheet, TextInput, useWindowDimensions } from 'react-native';

import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';

const LINE_HEIGHT = 18;
const VERTICAL_PADDING = spacing.sm * 2;

interface SessionInlineTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SessionInlineTextEditor({
  value,
  onChange,
  placeholder = 'Escribe el entrenamiento…',
}: SessionInlineTextEditorProps) {
  const { height: windowHeight } = useWindowDimensions();

  const editorHeight = useMemo(() => {
    const lineCount = Math.max(value.split('\n').length, 14);
    const contentHeight = lineCount * LINE_HEIGHT + VERTICAL_PADDING;
    const comfortableHeight = Math.min(windowHeight * 0.52, 560);
    return Math.max(contentHeight, comfortableHeight);
  }, [value, windowHeight]);

  return (
    <TextInput
      multiline
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      style={[styles.input, { height: editorHeight, minHeight: editorHeight }]}
      textAlignVertical="top"
      scrollEnabled
    />
  );
}

const styles = StyleSheet.create({
  input: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: LINE_HEIGHT,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: withAlpha(colors.accent, '44'),
    backgroundColor: colors.background,
    width: '100%',
  },
});
