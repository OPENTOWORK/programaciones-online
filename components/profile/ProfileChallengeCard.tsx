import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { colors, spacing, typography } from '@/constants/theme';
import { useAthletes } from '@/hooks/useAthletes';

/** Crea un reto personalizado para un atleta. No es el desafío semanal de catálogo. */
export function ProfileChallengeCard() {
  const router = useRouter();
  const { athletes, isLoading } = useAthletes();
  const [selectedAthleteId, setSelectedAthleteId] = useState('');

  const selectedAthlete = athletes.find((athlete) => athlete.id === selectedAthleteId);

  const handleCreate = () => {
    if (!selectedAthleteId) return;
    router.push({
      pathname: '/trainer/plan/create',
      params: { type: 'personalized', athleteId: selectedAthleteId, title: 'Reto' },
    });
  };

  return (
    <CollapsibleSection
      title="Crear reto"
      subtitle="Aparece en el plan y el calendario del atleta"
      style={styles.card}
    >
      <Text style={styles.copy}>
        Elige un atleta y crea un reto para su plan personalizado. No tiene que ver con el desafío
        semanal de Training · Performance.
      </Text>

      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : athletes.length === 0 ? (
        <Text style={styles.empty}>Todavía no tienes atletas para asignar un reto.</Text>
      ) : (
        <View style={styles.list}>
          {athletes.map((athlete) => {
            const selected = athlete.id === selectedAthleteId;
            return (
              <Pressable
                key={athlete.id}
                onPress={() => setSelectedAthleteId((current) => (current === athlete.id ? '' : athlete.id))}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[styles.athleteRow, selected && styles.athleteRowSelected]}
              >
                <Text style={styles.athleteName} numberOfLines={1}>
                  {athlete.name}
                </Text>
                <View style={[styles.radio, selected && styles.radioSelected]} />
              </Pressable>
            );
          })}
        </View>
      )}

      <Button
        title={selectedAthlete ? `Crear reto para ${selectedAthlete.name}` : 'Crear reto'}
        variant="primary"
        disabled={!selectedAthleteId}
        onPress={handleCreate}
        style={styles.button}
      />
    </CollapsibleSection>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.md,
  },
  copy: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  loader: {
    marginTop: spacing.md,
  },
  empty: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  list: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  athleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  athleteRowSelected: {
    borderColor: colors.accent,
  },
  athleteName: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.textMuted,
  },
  radioSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  button: {
    marginTop: spacing.md,
  },
});
