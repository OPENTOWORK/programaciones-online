import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HomeBrandShowcase } from '@/components/home/HomeBrandShowcase';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';

function formatToday() {
  return new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'atleta';

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.greeting}>Hola, {firstName}</Text>
          <Text style={styles.date}>{formatToday()}</Text>
        </View>
        <Pressable
          onPress={() => router.push('/tabs/profile')}
          accessibilityRole="button"
          accessibilityLabel="Ir al perfil"
          style={({ pressed }) => [styles.avatar, pressed && styles.avatarPressed]}
        >
          <Text style={styles.avatarText}>{user?.avatarInitials ?? 'TP'}</Text>
        </Pressable>
      </View>

      <HomeBrandShowcase />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  headerCopy: {
    flex: 1,
  },
  greeting: { ...typography.h2, color: colors.text },
  date: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPressed: {
    opacity: 0.88,
  },
  avatarText: { ...typography.body, color: colors.black, fontWeight: '700' },
});
