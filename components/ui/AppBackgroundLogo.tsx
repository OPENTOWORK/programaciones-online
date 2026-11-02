import type { ReactNode } from 'react';
import { Image, Platform, StyleSheet, View, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

const logoWatermark = require('@/assets/logo-watermark.png');
const logoWatermarkOnLight = require('@/assets/logo-watermark-on-light.png');

/** Proporción de la TP del logotipo (1200x837). */
const MARK_ASPECT = 1200 / 837;

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
          source={isLight ? logoWatermarkOnLight : logoWatermark}
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
    backgroundColor: 'transparent',
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? ({ height: '100%' } as const) : null),
  },
  layer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  markWrap: {
    position: 'absolute',
    width: '54%',
    maxWidth: 460,
    aspectRatio: MARK_ASPECT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  markDark: {
    opacity: 0.08,
  },
  markLight: {
    opacity: 0.06,
  },
});
