import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { SessionDraftSummary } from '@/components/trainer/SessionDraftSummary';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { useSavedMetcons } from '@/hooks/useSavedMetcons';
import { METCON_SESSION_NAME, workoutToSessionDraft } from '@/lib/trainerSessionDraft';
import { parseWorkoutBlocksFromText } from '@/lib/workoutBlockBuilder';
import type { Program, Workout } from '@/lib/types';

function metconDisplayName(workout: Workout) {
  const raw = workout.name.trim().replace(/^=\s*/, '');
  if (!raw || /^activaci[oó]n$/i.test(raw)) return METCON_SESSION_NAME;
  return raw;
}

function chipMeta(workout: Workout) {
  if (workout.schedule?.kind === 'rest') return 'Descanso';
  const blocks =
    parseWorkoutBlocksFromText(workout.warmup).length +
    parseWorkoutBlocksFromText(workout.main).length +
    parseWorkoutBlocksFromText(workout.core ?? '').length +
    parseWorkoutBlocksFromText(workout.cooldown).length;
  const exercises = workout.exercises.length;
  const parts = [workout.estimatedDuration || '60 min'];
  if (blocks > 0) parts.push(`${blocks} bloque${blocks === 1 ? '' : 's'}`);
  if (exercises > 0) parts.push(`${exercises} ejercicio${exercises === 1 ? '' : 's'}`);
  return parts.join(' · ');
}

interface AthleteMetconSessionsListProps {
  program: Program;
  entries: Array<{ workout: Workout; slotIndex: number }>;
}

export function AthleteMetconSessionsList({ program, entries }: AthleteMetconSessionsListProps) {
  const router = useRouter();
  const { isSaved, toggleSaved, isSaving } = useSavedMetcons();
  const [expandedId, setExpandedId] = useState<string | null>(entries[0]?.workout.id ?? null);

  const sortedEntries = useMemo(
    () => [...entries].sort((left, right) => left.slotIndex - right.slotIndex),
    [entries],
  );

  if (sortedEntries.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>Todavía no hay metcons publicados en esta programación.</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {sortedEntries.map(({ workout, slotIndex }) => {
        const expanded = expandedId === workout.id;
        const draft = workoutToSessionDraft(workout, 0);
        const saved = isSaved(workout.id);
        const saving = isSaving(workout.id);
        const displayName = metconDisplayName(workout);

        return (
          <View key={workout.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderCopy}>
                <Text style={styles.cardKicker}>Metcon {slotIndex + 1}</Text>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/workout/[id]',
                      params: { id: workout.id },
                    })
                  }
                  style={({ pressed }) => [pressed && styles.pressed]}
                >
                  <Text style={styles.cardTitle}>{displayName}</Text>
                </Pressable>
              </View>

              <View style={styles.cardActions}>
                <Pressable
                  onPress={() => {
                    void toggleSaved({
                      workoutId: workout.id,
                      programId: program.id,
                      workoutName: displayName,
                      programName: program.name,
                    }).then((result) => {
                      if (result.error) {
                        Alert.alert('No se pudo guardar', result.error);
                        return;
                      }
                      if (result.warning) {
                        Alert.alert('Guardado localmente', result.warning);
                      }
                    });
                  }}
                  disabled={saving}
                  accessibilityLabel={saved ? 'Quitar de guardados' : 'Guardar en mi perfil'}
                  style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={colors.accent} />
                  ) : (
                    <Ionicons
                      name={saved ? 'star' : 'star-outline'}
                      size={20}
                      color={saved ? colors.accent : colors.textSecondary}
                    />
                  )}
                </Pressable>
                <Pressable
                  onPress={() => setExpandedId(expanded ? null : workout.id)}
                  accessibilityLabel={expanded ? 'Ocultar detalle' : 'Ver detalle'}
                  style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
                >
                  <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={expanded ? colors.metcon : colors.textSecondary}
                  />
                </Pressable>
              </View>
            </View>

            <Text style={styles.cardMeta}>{chipMeta(workout)}</Text>

            {expanded ? (
              <View style={styles.cardDetail}>
                <SessionDraftSummary draft={draft} hideSectionLabels />
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/workout/[id]',
                      params: { id: workout.id },
                    })
                  }
                  style={({ pressed }) => [styles.openBtn, pressed && styles.pressed]}
                >
                  <Text style={styles.openBtnText}>Abrir entrenamiento</Text>
                  <Ionicons name="arrow-forward" size={16} color={colors.metcon} />
                </Pressable>
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  card: {
    borderWidth: 1,
    borderColor: `${colors.metcon}66`,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.metcon}10`,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardHeaderCopy: {
    flex: 1,
    gap: 2,
  },
  cardKicker: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  cardTitle: {
    ...typography.h3,
    color: colors.metcon,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  cardMeta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  cardDetail: {
    borderTopWidth: 1,
    borderTopColor: `${colors.metcon}33`,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.metcon,
    backgroundColor: `${colors.metcon}18`,
  },
  openBtnText: {
    ...typography.bodySmall,
    color: colors.metcon,
    fontWeight: '700',
  },
  emptyCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
