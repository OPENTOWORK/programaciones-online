import { Image, StyleSheet, View, type ViewStyle } from 'react-native';

/** Icono de la app (TP · PROGLINE), cuadrado y con las esquinas ya redondeadas. */
const appLogo = require('@/assets/app-logo.png');

interface AppLogoProps {
  size?: number;
  style?: ViewStyle;
}

export function AppLogo({ size = 48, style }: AppLogoProps) {
  return (
    <View style={[styles.wrap, { width: size, height: size }, style]}>
      <Image source={appLogo} style={{ width: size, height: size }} resizeMode="contain" accessibilityIgnoresInvertColors />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
});
