import { StyleSheet, Text } from 'react-native';

import { HomeBlock } from '@/components/home/HomeBlock';
import { Button } from '@/components/ui/Button';
import { colors, spacing, typography } from '@/constants/theme';
import { useAppNavigation } from '@/hooks/useAppNavigation';

export function AthleteWorkoutTimer() {
  const navigation = useAppNavigation();

  return (
    <HomeBlock kicker="Entreno" title="Cronómetro">
      <Text style={styles.lead}>Intervalos, descanso y series, listos para la sesión.</Text>
      <Button title="Abrir cronómetro" onPress={() => navigation.push('/timer')} style={styles.action} />
    </HomeBlock>
  );
}

const styles = StyleSheet.create({
  lead: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  action: {
    marginTop: spacing.lg,
    alignSelf: 'flex-start',
  },
});
