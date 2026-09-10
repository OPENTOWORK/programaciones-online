import { Platform, StyleSheet, View } from 'react-native';

interface CoverColorWashProps {
  tint: string;
}

export function CoverColorWash({ tint }: CoverColorWashProps) {
  if (!tint || tint === 'transparent') return null;

  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: tint },
        Platform.OS === 'web' ? ({ mixBlendMode: 'color' } as object) : null,
      ]}
    />
  );
}
