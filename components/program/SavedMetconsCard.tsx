import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Button } from '@/components/ui/Button';
import { colors, spacing, typography } from '@/constants/theme';
import { useSavedMetcons } from '@/hooks/useSavedMetcons';

interface SavedMetconsCardProps {
  style?: StyleProp<ViewStyle>;
}

function formatSavedDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function SavedMetconsCard({ style }: SavedMetconsCardProps) {
  const router = useRouter();
  const { entries, isLoading, toggleSaved, isSaving } = useSavedMetcons();

  return (
    <View style={style}>
      {isLoading ? (
        <ActivityIndicator color={colors.metcon} style={styles.loader} />
      ) : entries.length === 0 ? (
        <Text style={styles.empty}>
          Marca la estrella en un metcon para guardarlo aquí y tenerlo a mano.
        </Text>
      ) : (
        <View style={styles.list}>
          {entries.map((entry) => (
            <View key={entry.id} style={styles.row}>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/workout/[id]',
                    params: { id: entry.workoutId },
                  })
                }
                style={({ pressed }) => [styles.rowMain, pressed && styles.pressed]}
              >
                <Text style={styles.rowTitle} numberOfLines={2}>
                  {entry.workoutName}
                </Text>
                <Text style={styles.rowMeta} numberOfLines={1}>
                  {entry.programName ? `${entry.programName} · ` : ''}
                  Guardado el {formatSavedDate(entry.savedAt)}
                </Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  void toggleSaved({
                    workoutId: entry.workoutId,
                    programId: entry.programId,
                    workoutName: entry.workoutName,
                    programName: entry.programName,
                  })
                }
                disabled={isSaving(entry.workoutId)}
                accessibilityLabel="Quitar de guardados"
                style={({ pressed }) => [styles.starBtn, pressed && styles.pressed]}
              >
                {isSaving(entry.workoutId) ? (
                  <ActivityIndicator size="small" color={colors.accent} />
                ) : (
                  <Ionicons name="star" size={20} color={colors.accent} />
                )}
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <Button
        title="Ver programación Metcon"
        variant="outline"
        onPress={() => router.push('/tabs/programs')}
        style={styles.cta}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginVertical: spacing.sm,
  },
  empty: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowMain: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  rowMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  starBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cta: {
    marginTop: spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
});
