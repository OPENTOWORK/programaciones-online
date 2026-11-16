import { StyleSheet, Text } from 'react-native';

import { ProgramCard } from '@/components/program/ProgramCard';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, spacing, typography } from '@/constants/theme';
import { usePurchases } from '@/hooks/usePurchases';
import { CATALOG_ACCESS_REQUEST_MESSAGE } from '@/lib/storeCompliance';
import type { Program } from '@/lib/types';

export function HypeCatalogAccessGate({ program }: { program: Program }) {
  const { productsForProgram } = usePurchases();
  const soldInStore = productsForProgram(program.id).length > 0;

  return (
    <ScreenWrapper>
      <Text style={styles.title}>{soldInStore ? 'Programación de pago' : 'Programación no disponible'}</Text>
      <Text style={styles.copy}>
        {soldInStore
          ? 'Suscríbete desde la tienda de la app. Si ya la contrataste con esta cuenta, usa «Restaurar compras».'
          : CATALOG_ACCESS_REQUEST_MESSAGE}
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
