import { StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '@/constants/theme';

interface NavCountBadgeProps {
  count: number;
}

/** Contador amarillo de avisos pendientes en el menú. */
export function NavCountBadge({ count }: NavCountBadgeProps) {
  if (count <= 0) return null;

  return (
    <View
      accessibilityLabel={`${count} aviso${count === 1 ? '' : 's'} pendiente${count === 1 ? '' : 's'}`}
      style={styles.badge}
    >
      <Text style={styles.text}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 999,
    backgroundColor: colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...typography.caption,
    color: '#0F1419',
    fontWeight: '800',
    fontSize: 10,
    lineHeight: 13,
  },
});
