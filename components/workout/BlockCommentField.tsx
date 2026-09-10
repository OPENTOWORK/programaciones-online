import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useVoiceNoteRecorder } from '@/hooks/useVoiceNoteRecorder';
import { formatAttachmentDuration } from '@/lib/feedbackAttachments';
import { sessionBlockCommentHasContent, type SessionBlockComment } from '@/lib/sessionBlockCommentService';
import type { FeedbackAttachmentDraft } from '@/lib/trainerFeedbackMediaService';

interface BlockCommentFieldProps {
  blockKey: string;
  comment?: SessionBlockComment;
  readOnly?: boolean;
  disabled?: boolean;
  isSaving?: boolean;
  onAudioReady?: (draft: FeedbackAttachmentDraft) => void;
  onSaveText: (text: string) => void;
  onRemoveAudio?: () => void;
}

function BlockCommentAudioPlayer({
  url,
  durationSeconds,
}: {
  url: string;
  durationSeconds?: number;
}) {
  const player = useAudioPlayer(Platform.OS === 'web' ? null : { uri: url });
  const status = useAudioPlayerStatus(player);
  const duration = formatAttachmentDuration(durationSeconds);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.audioWrap}>
        <audio src={url} controls style={{ width: '100%' }}>
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
    <Pressable onPress={togglePlayback} style={({ pressed }) => [styles.audioBtn, pressed && styles.pressed]}>
      <Ionicons name={status.playing ? 'pause' : 'play'} size={18} color={colors.accent} />
      <Text style={styles.audioBtnText}>
        {status.playing ? 'Pausar nota de voz' : 'Escuchar nota de voz'}
        {duration ? ` · ${duration}` : ''}
      </Text>
    </Pressable>
  );
}

export function BlockCommentField({
  blockKey,
  comment,
  readOnly = false,
  disabled = false,
  isSaving = false,
  onAudioReady,
  onSaveText,
  onRemoveAudio,
}: BlockCommentFieldProps) {
  const [expanded, setExpanded] = useState(() => sessionBlockCommentHasContent(comment));
  const [localText, setLocalText] = useState(comment?.text ?? '');
  const voice = useVoiceNoteRecorder();

  useEffect(() => {
    setLocalText(comment?.text ?? '');
    if (sessionBlockCommentHasContent(comment)) {
      setExpanded(true);
    }
  }, [comment?.text, comment?.audioUrl, comment?.id]);

  const hasContent = sessionBlockCommentHasContent(comment) || localText.trim().length > 0;
  const showField = !readOnly || hasContent;

  if (!showField) return null;

  const toggleRecording = async () => {
    if (disabled || isSaving) return;

    if (voice.isRecording) {
      const draft = await voice.stop();
      if (draft) onAudioReady?.(draft);
      return;
    }

    voice.clearError();
    await voice.start();
  };

  if (readOnly) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.label}>Comentario del atleta</Text>
        {comment?.text?.trim() ? <Text style={styles.readOnlyText}>{comment.text}</Text> : null}
        {comment?.audioUrl ? (
          <BlockCommentAudioPlayer url={comment.audioUrl} durationSeconds={comment.audioDurationSeconds} />
        ) : null}
      </View>
    );
  }

  if (!expanded) {
    return (
      <Pressable
        onPress={() => setExpanded(true)}
        disabled={disabled}
        style={({ pressed }) => [styles.collapsedBtn, pressed && !disabled && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Poner comentario sobre este bloque"
      >
        <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.textMuted} />
        <Text style={styles.collapsedText}>Poner comentario</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>¿Cómo ha ido este bloque?</Text>
        {!hasContent ? (
          <Pressable onPress={() => setExpanded(false)} hitSlop={8}>
            <Text style={styles.closeHint}>Ocultar</Text>
          </Pressable>
        ) : null}
      </View>

      <TextInput
        value={localText}
        onChangeText={setLocalText}
        onBlur={() => onSaveText(localText)}
        placeholder="Escribe cómo te ha ido este bloque…"
        placeholderTextColor={colors.textMuted}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        editable={!disabled && !isSaving}
        style={styles.input}
      />

      <View style={styles.toolbar}>
        <Pressable
          onPress={() => void toggleRecording()}
          disabled={disabled || isSaving}
          style={({ pressed }) => [
            styles.voiceBtn,
            voice.isRecording && styles.voiceBtnRecording,
            pressed && !disabled && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={voice.isRecording ? 'Detener grabación' : 'Grabar nota de voz'}
        >
          <Ionicons
            name={voice.isRecording ? 'stop-circle' : 'mic-outline'}
            size={18}
            color={voice.isRecording ? colors.danger : colors.accent}
          />
          <Text style={[styles.voiceBtnText, voice.isRecording && styles.voiceBtnTextRecording]}>
            {voice.isRecording
              ? `Grabando… ${formatAttachmentDuration(Math.round(voice.durationMillis / 1000))}`
              : 'Nota de voz'}
          </Text>
        </Pressable>

        {isSaving ? <Text style={styles.savingHint}>Guardando…</Text> : null}
      </View>

      {voice.error ? <Text style={styles.error}>{voice.error}</Text> : null}

      {comment?.audioUrl ? (
        <View style={styles.audioRow}>
          <BlockCommentAudioPlayer url={comment.audioUrl} durationSeconds={comment.audioDurationSeconds} />
          {onRemoveAudio ? (
            <Pressable
              onPress={onRemoveAudio}
              disabled={disabled || isSaving}
              hitSlop={8}
              accessibilityLabel="Eliminar nota de voz"
            >
              <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <Text style={styles.srOnly}>{blockKey}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  closeHint: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  collapsedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  collapsedText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  input: {
    minHeight: 72,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    ...typography.bodySmall,
    color: colors.text,
    lineHeight: 20,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  voiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: withAlpha(colors.accent, '44'),
    backgroundColor: colors.background,
  },
  voiceBtnRecording: {
    borderColor: `${colors.danger}66`,
    backgroundColor: `${colors.danger}10`,
  },
  voiceBtnText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  voiceBtnTextRecording: {
    color: colors.danger,
  },
  savingHint: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  audioWrap: {
    flex: 1,
  },
  audioBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  audioBtnText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
    flexShrink: 1,
  },
  readOnlyText: {
    ...typography.bodySmall,
    color: colors.text,
    lineHeight: 20,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
  },
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  pressed: {
    opacity: 0.85,
  },
});
