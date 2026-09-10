import { Image, StyleSheet, View, type ViewStyle } from 'react-native';

const appLogo = require('@/assets/app-logo.png');

/** Relación ancho/alto del logo completo (icono + texto). */
const LOGO_ASPECT = 0.82;

interface AppLogoProps {
  size?: number;
  style?: ViewStyle;
}

export function AppLogo({ size = 48, style }: AppLogoProps) {
  const height = size;
  const width = Math.round(size * LOGO_ASPECT);

  return (
    <View style={[styles.wrap, { width, height }, style]}>
      <Image source={appLogo} style={{ width, height }} resizeMode="contain" accessibilityIgnoresInvertColors />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
});
