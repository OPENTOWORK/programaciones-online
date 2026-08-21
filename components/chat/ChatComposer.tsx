import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { HoverTooltip } from '@/components/ui/HoverTooltip';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import type { ChatAttachmentDraft } from '@/lib/chatAttachments';
import { formatAttachmentDuration } from '@/lib/feedbackAttachments';

interface ChatComposerToolbarProps {
  disabled?: boolean;
  compact?: boolean;
  isRecording: boolean;
  onToggleRecording: () => void;
  onAttachCamera: () => void;
  onAttachGif: () => void;
  onAttachFile: () => void;
  emojiOpen: boolean;
  onToggleEmoji: () => void;
  allowVideoAttachments?: boolean;
}

export function ChatComposerToolbar({
  disabled = false,
  compact = false,
  isRecording,
  onToggleRecording,
  onAttachCamera,
  onAttachGif,
  onAttachFile,
  emojiOpen,
  onToggleEmoji,
  allowVideoAttachments = true,
}: ChatComposerToolbarProps) {
  const iconSize = compact ? 16 : 18;

  return (
    <View style={styles.toolbar}>
      <HoverTooltip label={isRecording ? 'Detener grabación' : 'Nota de voz'}>
        <Pressable
          onPress={onToggleRecording}
          disabled={disabled}
          style={({ pressed }) => [
            styles.toolBtn,
            compact && styles.toolBtnCompact,
            isRecording && styles.toolBtnRecording,
            pressed && !disabled && styles.toolBtnPressed,
            disabled && styles.toolBtnDisabled,
          ]}
        >
          <Ionicons
            name={isRecording ? 'stop-circle' : 'mic-outline'}
            size={iconSize}
            color={isRecording ? colors.danger : colors.textSecondary}
          />
        </Pressable>
      </HoverTooltip>

      <HoverTooltip label={allowVideoAttachments ? 'Foto o vídeo' : 'Foto'}>
        <Pressable
          onPress={onAttachCamera}
          disabled={disabled}
          style={({ pressed }) => [
            styles.toolBtn,
            compact && styles.toolBtnCompact,
            pressed && !disabled && styles.toolBtnPressed,
            disabled && styles.toolBtnDisabled,
          ]}
        >
          <Ionicons name="camera-outline" size={iconSize} color={colors.textSecondary} />
        </Pressable>
      </HoverTooltip>

      <HoverTooltip label="Emoji">
        <Pressable
          onPress={onToggleEmoji}
          disabled={disabled}
          style={({ pressed }) => [
            styles.toolBtn,
            compact && styles.toolBtnCompact,
            emojiOpen && styles.toolBtnActive,
            pressed && !disabled && styles.toolBtnPressed,
            disabled && styles.toolBtnDisabled,
          ]}
        >
          <Ionicons name="happy-outline" size={iconSize} color={colors.textSecondary} />
        </Pressable>
      </HoverTooltip>

      <HoverTooltip label="GIF">
        <Pressable
          onPress={onAttachGif}
          disabled={disabled}
          style={({ pressed }) => [
            styles.toolBtn,
            compact && styles.toolBtnCompact,
            pressed && !disabled && styles.toolBtnPressed,
            disabled && styles.toolBtnDisabled,
          ]}
        >
          <Text style={styles.gifLabel}>GIF</Text>
        </Pressable>
      </HoverTooltip>

      <HoverTooltip label="Adjuntar archivo">
        <Pressable
          onPress={onAttachFile}
          disabled={disabled}
          style={({ pressed }) => [
            styles.toolBtn,
            compact && styles.toolBtnCompact,
            pressed && !disabled && styles.toolBtnPressed,
            disabled && styles.toolBtnDisabled,
          ]}
        >
          <Ionicons name="attach-outline" size={iconSize} color={colors.textSecondary} />
        </Pressable>
      </HoverTooltip>
    </View>
  );
}

export function ChatDraftPreview({
  drafts,
  onRemove,
}: {
  drafts: ChatAttachmentDraft[];
  onRemove: (index: number) => void;
}) {
  if (drafts.length === 0) return null;

  return (
    <View style={styles.drafts}>
      {drafts.map((draft, index) => (
        <View key={`${draft.fileName}-${index}`} style={styles.draftChip}>
          <Ionicons
            name={
              draft.kind === 'audio'
                ? 'mic'
                : draft.kind === 'video'
                  ? 'videocam'
                  : draft.kind === 'file'
                    ? 'document'
                    : 'image'
            }
            size={14}
            color={colors.accent}
          />
          <Text style={styles.draftLabel} numberOfLines={1}>
            {draft.kind === 'audio'
              ? `Nota de voz${draft.durationSeconds ? ` · ${formatAttachmentDuration(draft.durationSeconds)}` : ''}`
              : draft.fileName}
          </Text>
          <Pressable onPress={() => onRemove(index)} hitSlop={8}>
            <Ionicons name="close" size={14} color={colors.textMuted} />
          </Pressable>
        </View>
      ))}
    </View>
  );
}

export function ChatEmojiPicker({
  emojis,
  onSelect,
}: {
  emojis: readonly string[];
  onSelect: (emoji: string) => void;
}) {
  return (
    <View style={styles.emojiPicker}>
      {emojis.map((emoji) => (
        <Pressable
          key={emoji}
          onPress={() => onSelect(emoji)}
          style={({ pressed }) => [styles.emojiBtn, pressed && styles.toolBtnPressed]}
        >
          <Text style={styles.emoji}>{emoji}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingBottom: spacing.xs,
  },
  toolBtn: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  toolBtnCompact: {
    width: 30,
    height: 30,
  },
  toolBtnPressed: {
    opacity: 0.85,
    backgroundColor: `${colors.accent}12`,
  },
  toolBtnActive: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}18`,
  },
  toolBtnRecording: {
    borderColor: `${colors.danger}88`,
    backgroundColor: `${colors.danger}18`,
  },
  toolBtnDisabled: {
    opacity: 0.45,
  },
  gifLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '800',
    fontSize: 11,
  },
  drafts: {
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  draftChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.accent}10`,
    borderWidth: 1,
    borderColor: `${colors.accent}33`,
  },
  draftLabel: {
    ...typography.caption,
    color: colors.text,
    flex: 1,
  },
  emojiPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.xs,
    padding: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emojiBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
  },
  emoji: {
    fontSize: 18,
    lineHeight: 22,
  },
});
