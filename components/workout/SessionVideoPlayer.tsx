import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { colors, spacing, typography, withAlpha } from '@/constants/theme';
import {
  formatPlaybackRateLabel,
  formatPlayerClock,
  SESSION_VIDEO_PLAYBACK_RATES,
} from '@/lib/videoTelestrator';

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
  expanded?: boolean;
  title?: string;
  subtitle?: string;
  onAnnotate?: () => void;
  showPlaybackSpeeds?: boolean;
  autoPlay?: boolean;
  onEnded?: () => void;
  playbackRate?: number;
  onPlaybackRateChange?: (rate: number) => void;
}

export function SessionVideoPlayer({
  url,
  compact = false,
  expanded = false,
  title,
  subtitle,
  onAnnotate,
  showPlaybackSpeeds = false,
  autoPlay = false,
  onEnded,
  playbackRate: playbackRateProp,
  onPlaybackRateChange,
}: SessionVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [aspect, setAspect] = useState(DEFAULT_PORTRAIT_ASPECT);
  const [duration, setDuration] = useState<number | null>(null);
  const [internalPlaybackRate, setInternalPlaybackRate] = useState(1);
  const playbackRate = playbackRateProp ?? internalPlaybackRate;
  const portrait = aspect <= 0.92;
  const metaLine = [subtitle, duration ? formatPlayerClock(duration) : null].filter(Boolean).join(' · ');

  const applyPlaybackRate = useCallback(
    (rate: number) => {
      if (onPlaybackRateChange) {
        onPlaybackRateChange(rate);
      } else {
        setInternalPlaybackRate(rate);
      }
      if (videoRef.current) {
        videoRef.current.playbackRate = rate;
      }
    },
    [onPlaybackRateChange],
  );

  useEffect(() => {
    if (Platform.OS !== 'web' || !autoPlay) return;
    const video = videoRef.current;
    if (!video) return;
    void video.play().catch(() => undefined);
  }, [autoPlay, url]);

  const handleMeta = (event: { target: EventTarget | null }) => {
    const video = event.target as HTMLVideoElement | null;
    if (!video) return;
    videoRef.current = video;
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      setAspect(video.videoWidth / video.videoHeight);
    }
    if (Number.isFinite(video.duration) && video.duration > 0) {
      setDuration(video.duration);
    }
    video.playbackRate = playbackRate;
    if (autoPlay) {
      void video.play().catch(() => undefined);
    }
  };

  const info =
    title && !expanded ? (
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
    <View
      style={[
        styles.clip,
        compact && styles.clipCompact,
        !portrait && !expanded && styles.clipLandscape,
        expanded && styles.clipExpanded,
      ]}
    >
      <View
        style={[
          styles.stage,
          expanded ? styles.stageExpanded : { aspectRatio: aspect },
        ]}
      >
        <video
          ref={(node) => {
            videoRef.current = node;
          }}
          src={url}
          controls
          playsInline
          preload="metadata"
          onLoadedMetadata={handleMeta}
          onEnded={() => onEnded?.()}
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

      {showPlaybackSpeeds ? (
        <View style={styles.speedRow}>
          <Text style={styles.speedLabel}>Velocidad</Text>
          <View style={styles.speedChips}>
            {SESSION_VIDEO_PLAYBACK_RATES.map((rate) => {
              const active = playbackRate === rate;
              return (
                <Pressable
                  key={rate}
                  onPress={() => applyPlaybackRate(rate)}
                  accessibilityRole="button"
                  accessibilityLabel={`Velocidad ${formatPlaybackRateLabel(rate)}`}
                  style={({ pressed }) => [
                    styles.speedChip,
                    active && styles.speedChipActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.speedChipText, active && styles.speedChipTextActive]}>
                    {formatPlaybackRateLabel(rate)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

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
  clipExpanded: {
    width: '100%',
    maxWidth: '100%',
    borderRadius: 18,
  },
  stage: {
    width: '100%',
    backgroundColor: '#07090C',
  },
  stageExpanded: Platform.select({
    web: {
      width: '100%',
      height: 'min(72vh, 760px)' as unknown as number,
      maxHeight: '72vh' as unknown as number,
    } as const,
    default: {
      minHeight: 420,
    },
  }),
  speedRow: {
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#0C1118',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  speedLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  speedChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  speedChip: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  speedChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  speedChipText: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.72)',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  speedChipTextActive: {
    color: colors.white,
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
