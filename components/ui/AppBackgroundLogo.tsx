import type { ReactNode } from 'react';
import { Image, StyleSheet, View, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

const logoWatermark = require('@/assets/logo-watermark.png');

/** Proporción del emblema recortado (974x788). */
const MARK_ASPECT = 1.236;

interface AppBackgroundScaffoldProps {
  children: ReactNode;
  style?: ViewStyle;
}

/**
 * Envuelve el contenido de una pantalla y coloca el emblema de marca detrás.
 * La capa vive dentro del contenedor, así no tapa el menú lateral ni la cabecera.
 */
export function AppBackgroundScaffold({ children, style }: AppBackgroundScaffoldProps) {
  return (
    <View style={[styles.scaffold, style]}>
      <AppBackgroundLogo />
      <View style={styles.foreground}>{children}</View>
    </View>
  );
}

export function AppBackgroundLogo() {
  const { scheme } = useAppTheme();
  const isLight = scheme === 'light';

  return (
    <View
      style={styles.layer}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.markWrap}>
        <Image
          source={logoWatermark}
          style={[styles.mark, isLight ? styles.markLight : styles.markDark]}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scaffold: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
  },
  foreground: {
    flex: 1,
    minHeight: 0,
    zIndex: 1,
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  markWrap: {
    width: '54%',
    maxWidth: 460,
    aspectRatio: MARK_ASPECT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    width: '100%',
    height: '100%',
  },
  markDark: {
    opacity: 0.13,
  },
  markLight: {
    opacity: 0.1,
  },
});
