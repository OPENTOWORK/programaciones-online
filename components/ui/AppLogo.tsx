import { Image, StyleSheet, View, type ViewStyle } from 'react-native';

const appLogo = require('@/assets/app-logo.png');

interface AppLogoProps {
  size?: number;
  style?: ViewStyle;
}

export function AppLogo({ size = 48, style }: AppLogoProps) {
  const radius = Math.round(size * 0.22);

  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: radius }, style]}>
      <Image source={appLogo} style={{ width: size, height: size, borderRadius: radius }} resizeMode="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
});
