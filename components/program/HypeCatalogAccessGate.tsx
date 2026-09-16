import { StyleSheet, Text } from 'react-native';

import { ProgramCard } from '@/components/program/ProgramCard';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, spacing, typography } from '@/constants/theme';
import { CATALOG_ACCESS_REQUEST_MESSAGE, SHOW_CATALOG_PRICING } from '@/lib/storeCompliance';
import type { Program } from '@/lib/types';

export function HypeCatalogAccessGate({ program }: { program: Program }) {
  return (
    <ScreenWrapper>
      <Text style={styles.title}>
        {SHOW_CATALOG_PRICING ? 'Programación de pago' : 'Programación no asignada'}
      </Text>
      <Text style={styles.copy}>{CATALOG_ACCESS_REQUEST_MESSAGE}</Text>
      <ProgramCard program={program} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  copy: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
});
