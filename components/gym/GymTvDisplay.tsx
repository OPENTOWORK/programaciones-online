import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { GymTvVideoPanel } from '@/components/gym/GymTvVideoPanel';
import {
  GymTvBodyLines,
  GymTvStructuredBlocks,
  GymTvWorkoutBlocks,
} from '@/components/gym/GymTvWorkoutBlocks';
import { isHyroxProgram } from '@/lib/hypeBoardSessionDraft';
import { isStructuredWorkoutContent } from '@/lib/workoutContentParser';
import { AppLogo } from '@/components/ui/AppLogo';
import { AppIcon } from '@/components/ui/AppIcon';
import {
  collectGymTvExerciseLines,
  collectGymTvExerciseVideos,
  parseGymTvContentLines,
} from '@/lib/gymTvWorkout';
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
  const { width } = useWindowDimensions();
  const accent = HYPE_PROGRAM_COLORS[programName] ?? '#FF3B30';
  const wide = width >= 1100;

  const bodyLines = useMemo(
    () => (body ? parseGymTvContentLines(body, programName) : []),
    [body, programName],
  );
  const workoutLines = useMemo(
    () => (workout ? collectGymTvExerciseLines(workout) : []),
    [workout],
  );
  const usesStructuredBody = Boolean(
    body && !isHyroxProgram(programName) && (isStructuredWorkoutContent(body) || body.includes('•')),
  );
  const tvVideos = useMemo(
    () => collectGymTvExerciseVideos([...workoutLines, ...bodyLines]),
    [bodyLines, workoutLines],
  );

  const tvVideosKey = useMemo(
    () => tvVideos.map((video) => `${video.key}:${video.youtubeVideoId}`).join('|'),
    [tvVideos],
  );
  const [activeVideoKey, setActiveVideoKey] = useState<string | undefined>(tvVideos[0]?.key);

  useEffect(() => {
    setActiveVideoKey(tvVideos[0]?.key);
  }, [tvVideosKey, tvVideos]);

  const handleActiveVideoChange = useCallback((video: { key: string }) => {
    setActiveVideoKey(video.key);
  }, []);

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

  const sessionTitle = title ?? workout?.name;

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <AppLogo size={52} />
          <View style={styles.brandCopy}>
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

      <View style={[styles.main, wide ? styles.mainWide : styles.mainStacked]}>
        <ScrollView
          style={styles.workoutColumn}
          contentContainerStyle={styles.workoutContent}
          showsVerticalScrollIndicator={false}
        >
          {sessionTitle ? <Text style={styles.title}>{sessionTitle}</Text> : null}

          {body ? (
            usesStructuredBody ? (
              <GymTvStructuredBlocks content={body} accent={accent} activeVideoKey={activeVideoKey} />
            ) : (
              <GymTvBodyLines lines={bodyLines} accent={accent} />
            )
          ) : workout ? (
            <GymTvWorkoutBlocks
              workout={workout}
              size="tv"
              accent={accent}
              activeVideoKey={activeVideoKey}
            />
          ) : (
            <Text style={styles.boardEmpty}>Esta sesión todavía no tiene bloques.</Text>
          )}
        </ScrollView>

        <View style={[styles.videoColumn, wide ? styles.videoColumnWide : styles.videoColumnStacked]}>
          <GymTvVideoPanel
            accent={accent}
            videos={tvVideos}
            onActiveChange={handleActiveVideoChange}
          />
        </View>
      </View>
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
  brandCopy: {
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
  main: {
    flex: 1,
    minHeight: 0,
  },
  mainWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 24,
    paddingLeft: 28,
    paddingRight: 20,
    paddingVertical: 20,
  },
  mainStacked: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 24,
  },
  workoutColumn: {
    flex: 0.38,
    minWidth: 0,
    maxWidth: '40%',
  },
  workoutContent: {
    gap: 24,
    paddingBottom: 24,
    alignItems: 'flex-start',
  },
  videoColumn: {
    minWidth: 0,
  },
  videoColumnWide: {
    flex: 1,
    minWidth: 0,
    alignSelf: 'stretch',
    paddingTop: 0,
  },
  videoColumnStacked: {
    width: '100%',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '800',
    textAlign: 'left',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  boardEmpty: {
    color: '#9AA3AD',
    fontSize: 24,
    textAlign: 'left',
  },
});
