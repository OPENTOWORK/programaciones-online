import { StyleSheet, Text, View } from 'react-native';

import { borderRadius, colors, typography } from '@/constants/theme';

interface BadgeProps {
  label: string;
  color?: string;
}

export function Badge({ label, color = colors.accent }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: `${color}22`, borderColor: `${color}55` }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
