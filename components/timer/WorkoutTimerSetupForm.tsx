import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Input } from '@/components/ui/Input';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import {
  WORKOUT_TIMER_MODE_LABELS,
  parseDurationMinutes,
  parsePositiveInt,
  type WorkoutTimerDirection,
  type WorkoutTimerMode,
  type WorkoutTimerSettings,
} from '@/lib/athleteWorkoutTimer';

const MODES: WorkoutTimerMode[] = ['crono', 'for_time', 'amrap', 'emom', 'tabata'];
const DIRECTIONS: Array<{ key: WorkoutTimerDirection; label: string }> = [
  { key: 'up', label: '↑ Arriba' },
  { key: 'down', label: '↓ Abajo' },
];

function durationMinutesFromSettings(seconds: number) {
  return String(Math.max(1, Math.round(seconds / 60)));
}

export function WorkoutTimerSetupForm({
  settings,
  onChange,
}: {
  settings: WorkoutTimerSettings;
  onChange: (patch: Partial<WorkoutTimerSettings>) => void;
}) {
  const showDirection = settings.mode !== 'tabata';
  const showDuration =
    settings.mode !== 'tabata' && (settings.direction === 'down' || settings.mode === 'emom');
  const showTabataConfig = settings.mode === 'tabata';

  return (
    <View style={styles.form}>
      <Text style={styles.label}>Formato</Text>
      <View style={styles.chips}>
        {MODES.map((mode) => {
          const selected = settings.mode === mode;
          return (
            <Pressable
              key={mode}
              onPress={() => onChange({ mode, direction: mode === 'tabata' ? 'down' : settings.direction })}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.chip,
                selected && styles.chipActive,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                {WORKOUT_TIMER_MODE_LABELS[mode]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {showDirection ? (
        <>
          <Text style={styles.label}>Cuenta</Text>
          <View style={styles.chips}>
            {DIRECTIONS.map((option) => {
              const selected = settings.direction === option.key;
              return (
                <Pressable
                  key={option.key}
                  onPress={() => onChange({ direction: option.key })}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={({ pressed }) => [
                    styles.chip,
                    styles.chipHalf,
                    selected && styles.chipActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}

      {showDuration ? (
        <Input
          label={settings.mode === 'emom' ? 'Minutos totales' : 'Duración (min)'}
          value={durationMinutesFromSettings(settings.durationSeconds)}
          onChangeText={(value) =>
            onChange({
              durationSeconds: parseDurationMinutes(value, settings.durationSeconds / 60),
            })
          }
          keyboardType="number-pad"
        />
      ) : null}

      {showTabataConfig ? (
        <View style={styles.tabataGrid}>
          <View style={styles.tabataField}>
            <Input
              label="Trabajo (s)"
              value={String(settings.tabataWorkSeconds)}
              onChangeText={(value) =>
                onChange({ tabataWorkSeconds: parsePositiveInt(value, 20) })
              }
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.tabataField}>
            <Input
              label="Descanso (s)"
              value={String(settings.tabataRestSeconds)}
              onChangeText={(value) =>
                onChange({ tabataRestSeconds: parsePositiveInt(value, 10) })
              }
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.tabataFieldWide}>
            <Input
              label="Rondas"
              value={String(settings.tabataRounds)}
              onChangeText={(value) =>
                onChange({ tabataRounds: parsePositiveInt(value, 8) })
              }
              keyboardType="number-pad"
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  chipHalf: {
    flexGrow: 1,
    flexBasis: '45%',
    alignItems: 'center',
  },
  chipActive: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '18'),
  },
  chipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  chipTextActive: {
    color: colors.text,
  },
  pressed: {
    opacity: 0.85,
  },
  tabataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  tabataField: {
    flex: 1,
    minWidth: 96,
  },
  tabataFieldWide: {
    width: '100%',
  },
});
