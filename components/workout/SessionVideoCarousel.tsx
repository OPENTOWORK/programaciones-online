import { useCallback, useEffect, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { SessionVideoPlayer } from '@/components/workout/SessionVideoPlayer';
import { colors, spacing, typography } from '@/constants/theme';
import type { SessionLogVideo } from '@/lib/sessionVideoService';

interface SessionVideoCarouselModalProps {
  visible: boolean;
  videos: readonly SessionLogVideo[];
  formatVideoDate: (iso: string) => string;
  showPlaybackSpeeds?: boolean;
  onClose: () => void;
  onAnnotate?: (video: SessionLogVideo) => void;
}

export function SessionVideoCarouselModal({
  visible,
  videos,
  formatVideoDate,
  showPlaybackSpeeds = false,
  onClose,
  onAnnotate,
}: SessionVideoCarouselModalProps) {
  const [index, setIndex] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [autoPlay, setAutoPlay] = useState(false);
  const hasMultiple = videos.length > 1;
  const safeIndex = videos.length === 0 ? 0 : Math.min(index, videos.length - 1);
  const current = videos[safeIndex];

  useEffect(() => {
    if (!visible) {
      setAutoPlay(false);
      return;
    }
    setIndex(0);
    setAutoPlay(true);
  }, [visible]);

  const goTo = useCallback(
    (nextIndex: number, shouldAutoPlay = true) => {
      if (videos.length === 0) return;
      const normalized = ((nextIndex % videos.length) + videos.length) % videos.length;
      setIndex(normalized);
      setAutoPlay(shouldAutoPlay);
    },
    [videos.length],
  );

  const goNext = useCallback(() => {
    goTo(safeIndex + 1);
  }, [goTo, safeIndex]);

  const goPrev = useCallback(() => {
    goTo(safeIndex - 1);
  }, [goTo, safeIndex]);

  useEffect(() => {
    if (!visible || Platform.OS !== 'web') return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key === 'ArrowRight') {
        goNext();
        return;
      }
      if (event.key === 'ArrowLeft') {
        goPrev();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goNext, goPrev, onClose, visible]);

  if (Platform.OS !== 'web' || !current) {
    return null;
  }

  const title = current.exerciseName?.trim() || 'Vídeo de la sesión';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Cerrar reproducción continua" />

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={styles.panelTitleWrap}>
              <Text style={styles.panelTitle}>Reproducción continua</Text>
              {hasMultiple ? (
                <Text style={styles.panelCounter}>
                  {safeIndex + 1} / {videos.length}
                </Text>
              ) : null}
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
            >
              <Ionicons name="close" size={22} color={colors.white} />
            </Pressable>
          </View>

          <Text style={styles.videoTitle} numberOfLines={2}>{title}</Text>
          <Text style={styles.videoMeta}>{formatVideoDate(current.createdAt)}</Text>

          <View style={styles.playerWrap}>
            {hasMultiple ? (
              <Pressable
                onPress={goPrev}
                accessibilityRole="button"
                accessibilityLabel="Vídeo anterior"
                style={({ pressed }) => [styles.sideNav, styles.sideNavLeft, pressed && styles.pressed]}
              >
                <Ionicons name="chevron-back" size={28} color={colors.white} />
              </Pressable>
            ) : null}

            <View style={styles.playerSlot}>
              <SessionVideoPlayer
                key={current.id}
                url={current.url}
                mimeType={current.mimeType}
                expanded
                showPlaybackSpeeds={showPlaybackSpeeds}
                autoPlay={autoPlay}
                onEnded={hasMultiple ? goNext : undefined}
                playbackRate={playbackRate}
                onPlaybackRateChange={setPlaybackRate}
                onAnnotate={onAnnotate ? () => onAnnotate(current) : undefined}
              />
            </View>

            {hasMultiple ? (
              <Pressable
                onPress={goNext}
                accessibilityRole="button"
                accessibilityLabel="Vídeo siguiente"
                style={({ pressed }) => [styles.sideNav, styles.sideNavRight, pressed && styles.pressed]}
              >
                <Ionicons name="chevron-forward" size={28} color={colors.white} />
              </Pressable>
            ) : null}
          </View>

          {hasMultiple ? (
            <Text style={styles.hint}>
              Los vídeos se reproducen uno tras otro. Pulsa Esc o la X para volver a la vista en cuadrícula.
            </Text>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 8, 12, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  panel: {
    width: '100%',
    maxWidth: 1080,
    zIndex: 1,
    gap: spacing.sm,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  panelTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  panelTitle: {
    ...typography.h3,
    color: colors.white,
    fontWeight: '800',
  },
  panelCounter: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.72)',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  videoTitle: {
    ...typography.body,
    color: colors.white,
    fontWeight: '700',
  },
  videoMeta: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.62)',
    marginBottom: spacing.xs,
  },
  playerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  playerSlot: {
    flex: 1,
    minWidth: 0,
  },
  sideNav: {
    width: 44,
    height: 72,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  sideNavLeft: {},
  sideNavRight: {},
  hint: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  pressed: {
    opacity: 0.85,
  },
});
