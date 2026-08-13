import { useRouter } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, spacing, typography } from '@/constants/theme';
import { PLAN_DISPLAY_LABELS } from '@/lib/programService';
import type { StandardVenueId } from '@/lib/standardVenues';
import type { ProgramCategory } from '@/lib/types';

interface TrainerCatalogPanelProps {
  planId: string;
  category: ProgramCategory;
  standardVenue?: StandardVenueId;
}

export function TrainerCatalogPanel({ planId, category, standardVenue }: TrainerCatalogPanelProps) {
  const router = useRouter();
  const planLabel = PLAN_DISPLAY_LABELS[category] ?? 'Programación';

  return (
    <Card style={styles.panel}>
      <SectionHeader
        title="Gestión de programaciones"
        subtitle={`Crea y edita programaciones del plan ${planLabel}`}
      />

      <Button
        title="Crear programación"
        onPress={() =>
          router.push({
            pathname: '/trainer/program/create',
            params: {
              planId,
              category,
              ...(standardVenue ? { standardVenue } : {}),
            },
          })
        }
        style={styles.actionButton}
      />

      <Text style={styles.hint}>
        Tras crearla irás directo al editor de sesiones con bloques, días y vista de calendario.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginTop: spacing.lg,
  },
  actionButton: {
    width: '100%',
    marginBottom: spacing.sm,
  },
  hint: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
