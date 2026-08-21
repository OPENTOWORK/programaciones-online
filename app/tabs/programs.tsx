import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { CategoryTabs } from '@/components/program/CategoryTabs';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, typography } from '@/constants/theme';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { usePrograms } from '@/hooks/usePrograms';

export default function ProgramsScreen() {
  const { plans, isLoading, error, refresh } = usePrograms();

  useFocusRefresh(() => refresh());

  return (
    <ScreenWrapper>
      <Text style={styles.title}>Programaciones</Text>
      <SectionHeader title="Elige tu plan" subtitle="La misma línea premium en coaching, training y nutrition" />

      {isLoading && plans.length === 0 ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <CategoryTabs plans={plans} />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: colors.text, marginBottom: 4 },
  loader: { marginTop: 32 },
  error: { ...typography.bodySmall, color: colors.danger, marginTop: 16 },
});
