import type { ReactElement } from 'react';
import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { borderRadius, colors, shadows, spacing, typography } from '@/constants/theme';

interface HoverTooltipProps {
  label: string;
  children: ReactElement;
}

/** Etiqueta breve al pasar el ratón (web). En móvil no hace nada. */
export function HoverTooltip({ label, children }: HoverTooltipProps) {
  const [visible, setVisible] = useState(false);

  if (Platform.OS !== 'web') {
    return children;
  }

  const webHandlers = {
    onMouseEnter: () => setVisible(true),
    onMouseLeave: () => setVisible(false),
  };

  return (
    <View style={styles.wrap} {...webHandlers}>
      {children}
      {visible ? (
        <View style={styles.tooltip} pointerEvents="none">
          <Text style={styles.tooltipText}>{label}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltip: {
    position: 'absolute',
    bottom: '100%',
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 140,
    zIndex: 20,
    ...shadows.card,
  },
  tooltipText: {
    ...typography.caption,
    color: colors.text,
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
  },
});
