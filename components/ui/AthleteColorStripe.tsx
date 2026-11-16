import { StyleSheet, View } from 'react-native';

import { useAthleteColors } from '@/hooks/useAthleteColors';

/** Franja superior de la barra de pestañas con los dos colores de la paleta, uno en cada mitad. */
export function AthleteColorStripe() {
  const duo = useAthleteColors()?.duo;
  if (!duo) return null;

  return (
    <View style={styles.stripe} pointerEvents="none">
      <View style={[styles.half, { backgroundColor: duo[0] }]} />
      <View style={[styles.half, { backgroundColor: duo[1] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  stripe: {
    position: 'absolute',
    top: -1,
    left: 0,
    right: 0,
    height: 3,
    flexDirection: 'row',
  },
  half: {
    flex: 1,
  },
});
