import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, type ViewStyle } from 'react-native';

import { borderRadius, colors } from '@/constants/theme';

interface SkeletonBlockProps {
  height?: number;
  width?: number | `${number}%`;
  radius?: number;
  style?: ViewStyle;
}

/** Placeholder animado para cargas de datos. Sustituye al spinner en bloques con forma conocida. */
export function SkeletonBlock({ height = 16, width = '100%', radius, style }: SkeletonBlockProps) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 720,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 720,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [pulse]);

  return (
    <Animated.View
      style={[
        styles.block,
        { height, width, borderRadius: radius ?? borderRadius.sm },
        { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.9] }) },
        style,
      ]}
    />
  );
}

/** Varias líneas de skeleton con la última más corta, como un párrafo. */
export function SkeletonRows({
  rows = 3,
  height = 16,
  gap = 10,
}: {
  rows?: number;
  height?: number;
  gap?: number;
}) {
  return (
    <View style={{ gap }}>
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonBlock
          key={index}
          height={height}
          width={index === rows - 1 ? '62%' : '100%'}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: colors.surfaceLight,
  },
});
