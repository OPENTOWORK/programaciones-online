import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { colors, spacing, typography } from '@/constants/theme';
import { formatAttachmentDuration } from '@/lib/feedbackAttachments';
import type { ChatAttachmentKind } from '@/lib/types';

export interface DisplayAttachment {
  id: string;
  kind: ChatAttachmentKind;
  fileName: string;
  mimeType: string;
  url: string;
  durationSeconds?: number;
}

function openExternal(url: string) {
  if (Platform.OS === 'web') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  void Linking.openURL(url);
}

function ImageAttachment({ attachment }: { attachment: DisplayAttachment }) {
  if (Platform.OS === 'web') {
    return (
      <img
        src={attachment.url}
        alt={attachment.fileName}
        style={{
          width: '100%',
          maxHeight: 240,
          borderRadius: 12,
          objectFit: 'contain',
          backgroundColor: colors.black,
        }}
      />
    );
  }

  return (
    <Pressable
      onPress={() => openExternal(attachment.url)}
      style={({ pressed }) => [styles.mediaBtn, pressed && styles.pressed]}
    >
      <Ionicons name="image-outline" size={22} color={colors.accent} />
      <Text style={styles.mediaBtnText}>Ver imagen</Text>
    </Pressable>
  );
}

function FileAttachment({ attachment }: { attachment: DisplayAttachment }) {
  return (
    <Pressable
      onPress={() => openExternal(attachment.url)}
      style={({ pressed }) => [styles.mediaBtn, pressed && styles.pressed]}
    >
      <Ionicons name="document-text-outline" size={22} color={colors.accent} />
      <Text style={styles.mediaBtnText} numberOfLines={1}>
        {attachment.fileName}
      </Text>
    </Pressable>
  );
}

function VideoAttachment({ attachment }: { attachment: DisplayAttachment }) {
  if (Platform.OS === 'web') {
    return (
      <video
        src={attachment.url}
        controls
        playsInline
        style={{
          width: '100%',
          maxHeight: 240,
          borderRadius: 12,
          backgroundColor: colors.black,
        }}
      >
        <track kind="captions" />
      </video>
    );
  }

  return (
    <Pressable
      onPress={() => openExternal(attachment.url)}
      style={({ pressed }) => [styles.mediaBtn, pressed && styles.pressed]}
    >
      <AppIcon name="play" size={22} color={colors.accent} />
      <Text style={styles.mediaBtnText}>Reproducir vídeo</Text>
    </Pressable>
  );
}

function AudioAttachment({ attachment }: { attachment: DisplayAttachment }) {
  const player = useAudioPlayer(Platform.OS === 'web' ? null : { uri: attachment.url });
  const status = useAudioPlayerStatus(player);
  const duration = formatAttachmentDuration(attachment.durationSeconds);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.audioWrap}>
        <audio src={attachment.url} controls style={{ width: '100%' }}>
          <track kind="captions" />
        </audio>
      </View>
    );
  }

  const togglePlayback = () => {
    if (status.playing) {
      player.pause();
      return;
    }
    if (status.didJustFinish || player.currentTime >= player.duration) {
      player.seekTo(0);
    }
    player.play();
  };

  return (
    <Pressable
      onPress={togglePlayback}
      style={({ pressed }) => [styles.mediaBtn, pressed && styles.pressed]}
    >
      <AppIcon name={status.playing ? 'pause' : 'play'} size={22} color={colors.accent} />
      <Text style={styles.mediaBtnText}>
        {status.playing ? 'Pausar nota de voz' : 'Escuchar nota de voz'}
        {duration ? ` · ${duration}` : ''}
      </Text>
    </Pressable>
  );
}

interface FeedbackAttachmentListProps {
  attachments: DisplayAttachment[];
  onRemove?: (attachment: DisplayAttachment) => void;
}

export function FeedbackAttachmentList({ attachments, onRemove }: FeedbackAttachmentListProps) {
  if (attachments.length === 0) return null;

  return (
    <View style={styles.wrap}>
      {attachments.map((attachment) => {
        const duration = formatAttachmentDuration(attachment.durationSeconds);

        return (
          <View key={attachment.id} style={styles.item}>
            <View style={styles.itemHeader}>
              {attachment.kind === 'audio' ? (
                <AppIcon name="mic" size={14} color={colors.accent} />
              ) : attachment.kind === 'file' ? (
                <Ionicons name="document-text-outline" size={14} color={colors.accent} />
              ) : attachment.kind === 'image' || attachment.kind === 'gif' ? (
                <Ionicons name="image-outline" size={14} color={colors.accent} />
              ) : (
                <AppIcon name="video" size={14} color={colors.accent} />
              )}
              <Text style={styles.itemLabel} numberOfLines={1}>
                {attachment.kind === 'audio'
                  ? 'Nota de voz'
                  : attachment.kind === 'gif'
                    ? 'GIF'
                    : attachment.kind === 'image'
                      ? 'Imagen'
                      : attachment.kind === 'file'
                        ? attachment.fileName
                        : attachment.fileName}
                {attachment.kind === 'audio' && duration ? ` · ${duration}` : ''}
              </Text>
              {onRemove ? (
                <Pressable onPress={() => onRemove(attachment)} hitSlop={8}>
                  <AppIcon name="close" size={16} color={colors.textMuted} />
                </Pressable>
              ) : null}
            </View>

            {attachment.kind === 'audio' ? (
              <AudioAttachment attachment={attachment} />
            ) : attachment.kind === 'image' || attachment.kind === 'gif' ? (
              <ImageAttachment attachment={attachment} />
            ) : attachment.kind === 'file' ? (
              <FileAttachment attachment={attachment} />
            ) : (
              <VideoAttachment attachment={attachment} />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  item: {
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  itemLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
    flex: 1,
  },
  audioWrap: {
    paddingVertical: spacing.xs,
  },
  mediaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: `${colors.accent}18`,
    borderWidth: 1,
    borderColor: `${colors.accent}44`,
  },
  mediaBtnText: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
});
