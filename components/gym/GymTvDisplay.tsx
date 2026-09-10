import { useEffect } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppLogo } from '@/components/ui/AppLogo';
import { GymTvWorkoutBlocks } from '@/components/gym/GymTvWorkoutBlocks';
import { AppIcon } from '@/components/ui/AppIcon';
import { HYPE_PROGRAM_COLORS } from '@/lib/gymTraining';
import type { Workout } from '@/lib/types';

function enterFullscreen() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  const root = document.documentElement;
  if (root.requestFullscreen && !document.fullscreenElement) {
    void root.requestFullscreen().catch(() => undefined);
  }
}

function exitFullscreen() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  if (document.fullscreenElement) {
    void document.exitFullscreen().catch(() => undefined);
  }
}

export function GymTvDisplay({
  gymName,
  programName,
  dateLabel,
  workout,
  title,
  body,
  onClose,
}: {
  gymName: string;
  programName: string;
  dateLabel: string;
  workout?: Workout;
  title?: string;
  body?: string;
  onClose: () => void;
}) {
  const accent = HYPE_PROGRAM_COLORS[programName] ?? '#FF3B30';

  useEffect(() => {
    enterFullscreen();
    const onKey = (event: { key: string }) => {
      if (event.key === 'Escape') onClose();
    };
    if (Platform.OS === 'web') {
      window.addEventListener('keydown', onKey);
    }
    return () => {
      if (Platform.OS === 'web') window.removeEventListener('keydown', onKey);
      exitFullscreen();
    };
  }, [onClose]);

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <AppLogo size={52} />
          <View>
            <Text style={styles.gymName}>{gymName}</Text>
            <Text style={[styles.program, { color: accent }]}>{programName}</Text>
          </View>
        </View>
        <Text style={styles.date}>{dateLabel}</Text>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Cerrar TV"
          style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
        >
          <AppIcon name="close" size={22} color="#FFFFFF" />
          <Text style={styles.closeText}>Cerrar</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body} contentInsetAdjustmentBehavior="automatic">
        {body ? (
          <Text style={styles.boardBody}>{body}</Text>
        ) : workout ? (
          <>
            {title || workout.name ? (
              <Text style={styles.title}>{title ?? workout.name}</Text>
            ) : null}
            <GymTvWorkoutBlocks workout={workout} size="tv" />
          </>
        ) : (
          <Text style={styles.boardEmpty}>Esta sesión todavía no tiene bloques.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#0A0B0D',
    minHeight: '100%',
    ...(Platform.OS === 'web' ? ({ height: '100vh' } as object) : null),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
    minWidth: 0,
  },
  gymName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  program: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  date: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  closeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  closeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  pressed: {
    opacity: 0.8,
  },
  body: {
    paddingHorizontal: 36,
    paddingVertical: 32,
    gap: 28,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '800',
    textAlign: 'center',
  },
  boardBody: {
    color: '#E8EEF4',
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    textAlign: 'center',
  },
  boardEmpty: {
    color: '#9AA3AD',
    fontSize: 24,
    textAlign: 'center',
  },
});
