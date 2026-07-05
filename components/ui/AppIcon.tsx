import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors } from '@/constants/theme';
import { resolveIconName, type AppIconName } from '@/constants/icons';
import { Ionicons } from '@expo/vector-icons';

interface AppIconProps {
  name: AppIconName;
  size?: number;
  color?: string;
  outlined?: boolean;
  style?: ViewStyle;
}

export function AppIcon({ name, size = 22, color = colors.text, outlined = false, style }: AppIconProps) {
  return (
    <View style={style}>
      <Ionicons name={resolveIconName(name, outlined)} size={size} color={color} />
    </View>
  );
}

interface IconBadgeProps {
  name: AppIconName;
  size?: number;
  containerSize?: number;
  color?: string;
  style?: ViewStyle;
}

export function IconBadge({
  name,
  size = 26,
  containerSize = 52,
  color = colors.accent,
  style,
}: IconBadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: containerSize / 2,
        },
        style,
      ]}
    >
      <AppIcon name={name} size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: `${colors.accent}18`,
    borderWidth: 1,
    borderColor: `${colors.accent}33`,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
