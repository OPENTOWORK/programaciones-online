import { StyleSheet, Text } from 'react-native';

import { ProgramCard } from '@/components/program/ProgramCard';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, spacing, typography } from '@/constants/theme';
import type { Program } from '@/lib/types';

export function HypeCatalogAccessGate({ program }: { program: Program }) {
  return (
    <ScreenWrapper>
      <Text style={styles.title}>Programación de pago</Text>
      <Text style={styles.copy}>
        El contenido está reservado al administrador. Los atletas y entrenadores podrán comprarla
        cuando conectemos la pasarela de pagos.
      </Text>
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
