import { useRouter } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { borderRadius, colors, spacing, typography } from '@/constants/theme';

export function AthleteWorkoutTimer() {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push('/timer')}
      accessibilityRole="button"
      accessibilityLabel="Abrir cronómetro de entreno"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Text style={styles.title}>Cronómetro</Text>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  pressed: {
    opacity: 0.9,
  },
  title: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
    flex: 1,
  },
});
