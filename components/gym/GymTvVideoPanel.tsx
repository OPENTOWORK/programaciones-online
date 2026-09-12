import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GymTvYoutubeCarousel } from '@/components/gym/GymTvYoutubeCarousel';
import { AppIcon } from '@/components/ui/AppIcon';
import type { GymTvVideoItem } from '@/lib/gymTvWorkout';

function videosSignature(videos: readonly GymTvVideoItem[]) {
  return videos.map((video) => `${video.key}:${video.youtubeVideoId}`).join('|');
}

export function GymTvVideoPanel({
  videos,
  accent,
  onActiveChange,
}: {
  videos: readonly GymTvVideoItem[];
  accent: string;
  onActiveChange?: (video: GymTvVideoItem) => void;
}) {
  const [activeVideo, setActiveVideo] = useState<GymTvVideoItem | null>(videos[0] ?? null);
  const onActiveChangeRef = useRef(onActiveChange);
  const videosKey = useMemo(() => videosSignature(videos), [videos]);

  onActiveChangeRef.current = onActiveChange;

  useEffect(() => {
    setActiveVideo(videos[0] ?? null);
  }, [videosKey, videos]);

  const handleActiveChange = useCallback((video: GymTvVideoItem) => {
    setActiveVideo(video);
    onActiveChangeRef.current?.(video);
  }, []);

  const hasVideos = videos.length > 0;

  return (
    <View style={styles.panel}>
      <View style={styles.panelHead}>
        <Text style={styles.panelLabel}>Demostración</Text>
        {activeVideo ? (
          <Text style={styles.panelExercise} numberOfLines={2}>{activeVideo.title}</Text>
        ) : null}
      </View>

      <View style={[styles.frame, { borderColor: `${accent}55` }]}>
        {hasVideos ? (
          <GymTvYoutubeCarousel videos={videos} onActiveChange={handleActiveChange} />
        ) : (
          <View style={styles.placeholder}>
            <View style={[styles.placeholderIcon, { backgroundColor: `${accent}22` }]}>
              <AppIcon name="video" size={42} color={accent} />
            </View>
            <Text style={styles.placeholderTitle}>Vídeo del ejercicio</Text>
            <Text style={styles.placeholderCopy}>
              Cuando vincules un vídeo a cada movimiento, se mostrará aquí junto al WOD.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: '100%',
    flex: 1,
    alignSelf: 'stretch',
    gap: 10,
  },
  panelHead: {
    gap: 4,
  },
  panelLabel: {
    color: '#9AA3AD',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  panelExercise: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  },
  frame: {
    width: '100%',
    maxWidth: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: '#111318',
    position: 'relative',
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 14,
  },
  placeholderIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  placeholderCopy: {
    color: '#9AA3AD',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 360,
  },
});
