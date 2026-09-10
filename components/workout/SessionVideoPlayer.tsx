import { useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { colors, spacing, typography, withAlpha } from '@/constants/theme';
import { formatPlayerClock } from '@/lib/videoTelestrator';

const DEFAULT_PORTRAIT_ASPECT = 9 / 16;
const CLIP_WIDTH = 248;

function openVideoUrl(url: string) {
  if (Platform.OS === 'web') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  void Linking.openURL(url);
}

interface SessionVideoPlayerProps {
  url: string;
  mimeType?: string;
  compact?: boolean;
  title?: string;
  subtitle?: string;
  onAnnotate?: () => void;
}

export function SessionVideoPlayer({
  url,
  compact = false,
  title,
  subtitle,
  onAnnotate,
}: SessionVideoPlayerProps) {
  const [aspect, setAspect] = useState(DEFAULT_PORTRAIT_ASPECT);
  const [duration, setDuration] = useState<number | null>(null);
  const portrait = aspect <= 0.92;
  const metaLine = [subtitle, duration ? formatPlayerClock(duration) : null].filter(Boolean).join(' · ');

  const handleMeta = (event: { target: EventTarget | null }) => {
    const video = event.target as HTMLVideoElement | null;
    if (!video) return;
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      setAspect(video.videoWidth / video.videoHeight);
    }
    if (Number.isFinite(video.duration) && video.duration > 0) {
      setDuration(video.duration);
    }
  };

  const info = title ? (
    <View style={styles.infoBar}>
      <Text style={styles.infoTitle} numberOfLines={2}>
        {title}
      </Text>
      {metaLine ? <Text style={styles.infoMeta}>{metaLine}</Text> : null}
    </View>
  ) : null;

  if (Platform.OS !== 'web') {
    return (
      <View style={[styles.clip, compact && styles.clipCompact, !portrait && styles.clipLandscape]}>
        {info}
        <Pressable
          onPress={() => openVideoUrl(url)}
          style={({ pressed }) => [styles.nativeBtn, pressed && styles.pressed]}
        >
          <AppIcon name="play" size={22} color={colors.accent} />
          <Text style={styles.nativeBtnText}>Reproducir vídeo</Text>
        </Pressable>
        {onAnnotate ? (
          <Text style={styles.nativeHint}>Las correcciones en vídeo se hacen desde el panel web.</Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.clip, compact && styles.clipCompact, !portrait && styles.clipLandscape]}>
      <View style={[styles.stage, { aspectRatio: aspect }]}>
        <video
          src={url}
          controls
          playsInline
          preload="metadata"
          onLoadedMetadata={handleMeta}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            objectFit: 'contain',
            backgroundColor: '#07090C',
          }}
        >
          <track kind="captions" />
        </video>
      </View>

      {info}

      {onAnnotate ? (
        <Pressable
          onPress={onAnnotate}
          accessibilityRole="button"
          accessibilityLabel="Corregir en vídeo"
          style={({ pressed }) => [styles.annotateBar, pressed && styles.pressed]}
        >
          <AppIcon name="edit" size={15} color={colors.white} />
          <Text style={styles.annotateText}>Corregir en vídeo</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    width: CLIP_WIDTH,
    maxWidth: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#10161E',
    borderWidth: 1,
    borderColor: 'rgba(15, 20, 25, 0.16)',
  },
  clipCompact: {
    width: 232,
  },
  clipLandscape: {
    width: 340,
    maxWidth: '100%',
  },
  stage: {
    width: '100%',
    backgroundColor: '#07090C',
  },
  infoBar: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
    backgroundColor: '#10161E',
  },
  infoTitle: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '700',
    lineHeight: 18,
  },
  infoMeta: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.62)',
    fontVariant: ['tabular-nums'],
  },
  annotateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: 11,
    backgroundColor: colors.accent,
  },
  annotateText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '700',
  },
  nativeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    margin: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: withAlpha(colors.accent, '22'),
    borderWidth: 1,
    borderColor: withAlpha(colors.accent, '44'),
  },
  nativeBtnText: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '700',
  },
  nativeHint: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.62)',
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  pressed: {
    opacity: 0.88,
  },
});
