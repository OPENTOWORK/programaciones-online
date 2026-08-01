import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { CategoryTabs } from '@/components/program/CategoryTabs';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { usePrograms } from '@/hooks/usePrograms';

export default function ProgramsScreen() {
  const router = useRouter();
  const { plans, isLoading, error, refresh } = usePrograms();

  useFocusRefresh(() => refresh());

  return (
    <ScreenWrapper>
      <Text style={styles.title}>Programaciones</Text>
      <SectionHeader title="Elige tu plan" subtitle="Selecciona el tipo de programación que buscas" />

      {isLoading && plans.length === 0 ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <CategoryTabs plans={plans} />
      )}

      <Pressable
        onPress={() => router.push('/library')}
        style={({ pressed }) => [styles.libraryCard, pressed && styles.libraryCardPressed]}
      >
        <View style={styles.libraryIcon}>
          <Ionicons name="videocam" size={18} color={colors.accent} />
        </View>
        <View style={styles.libraryCopy}>
          <Text style={styles.libraryTitle}>Biblioteca de ejercicios</Text>
          <Text style={styles.librarySubtitle}>
            Vídeos de técnica de todos los movimientos, buscables por nombre.
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </Pressable>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: colors.text, marginBottom: 4 },
  loader: { marginTop: 32 },
  error: { ...typography.bodySmall, color: colors.danger, marginTop: 16 },
  libraryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: `${colors.accent}44`,
    backgroundColor: colors.surface,
  },
  libraryCardPressed: {
    borderColor: colors.accent,
    opacity: 0.9,
  },
  libraryIcon: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.accent}18`,
  },
  libraryCopy: {
    flex: 1,
    minWidth: 0,
  },
  libraryTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  librarySubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 18,
  },
});
