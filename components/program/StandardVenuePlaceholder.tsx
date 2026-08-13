import { useRouter } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { IconBadge } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, spacing, typography } from '@/constants/theme';
import type { StandardVenue } from '@/lib/standardVenues';

interface StandardVenuePlaceholderProps {
  venue: StandardVenue;
  planId: string;
}

export function StandardVenuePlaceholder({ venue, planId }: StandardVenuePlaceholderProps) {
  const router = useRouter();

  return (
    <>
      <SectionHeader title={venue.label} subtitle="Estándar" />

      <Card style={styles.card}>
        <IconBadge name={venue.icon} containerSize={52} size={26} />
        <Text style={styles.title}>Próximamente</Text>
        <Text style={styles.text}>
          Estamos preparando las programaciones de {venue.label.toLowerCase()}. Muy pronto podrás
          verlas aquí.
        </Text>
        <Button
          title="Volver a Estándar"
          variant="outline"
          onPress={() => router.replace({ pathname: '/plan/[id]', params: { id: planId } })}
          style={styles.button}
        />
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  text: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  button: {
    marginTop: spacing.sm,
    alignSelf: 'stretch',
  },
});
