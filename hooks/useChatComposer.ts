import { useCallback, useState } from 'react';
import { Platform } from 'react-native';

import { useVoiceNoteRecorder } from '@/hooks/useVoiceNoteRecorder';
import type { ChatAttachmentDraft } from '@/lib/chatAttachments';
import {
  appendDrafts,
  canAddDrafts,
  draftsFromFileList,
  pickChatFile,
  pickChatGif,
  pickChatImage,
  pickChatVideo,
} from '@/lib/chatAttachments';

const QUICK_EMOJIS = ['😀', '👍', '🔥', '💪', '🙌', '❤️', '😂', '🎉', '👏', '✅'];

interface UseChatComposerOptions {
  disabled?: boolean;
  /** Los atletas de Base/HYPE no envían vídeo; solo Personal · Coaching. */
  allowVideoAttachments?: boolean;
  attachmentsEnabled?: boolean;
  onSend: (text: string, attachments: ChatAttachmentDraft[]) => Promise<boolean>;
}

export function useChatComposer({
  disabled = false,
  allowVideoAttachments = true,
  attachmentsEnabled = true,
  onSend,
}: UseChatComposerOptions) {
  const recorder = useVoiceNoteRecorder();
  const [newMessage, setNewMessage] = useState('');
  const [drafts, setDrafts] = useState<ChatAttachmentDraft[]>([]);
  const [attachError, setAttachError] = useState<string | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [sending, setSending] = useState(false);

  const addDraft = useCallback((draft: ChatAttachmentDraft) => {
    if (!attachmentsEnabled) return;
    if (!allowVideoAttachments && draft.kind === 'video') {
      setAttachError('El envío de vídeo está disponible solo en Personal · Coaching.');
      return;
    }
    setAttachError(null);
    setDrafts((current) => {
      const next = appendDrafts(current, [draft]);
      if (next.error) {
        setAttachError(next.error);
        return current;
      }
      return next.drafts;
    });
  }, [allowVideoAttachments, attachmentsEnabled]);

  const addDrafts = useCallback((incoming: ChatAttachmentDraft[]) => {
    if (!attachmentsEnabled) return;
    if (incoming.length === 0) return;
    const allowed = allowVideoAttachments
      ? incoming
      : incoming.filter((draft) => draft.kind !== 'video');
    if (allowed.length < incoming.length) {
      setAttachError('El envío de vídeo está disponible solo en Personal · Coaching.');
    }
    if (allowed.length === 0) return;
    setAttachError((current) => (allowed.length < incoming.length ? current : null));
    setDrafts((current) => {
      const next = appendDrafts(current, allowed);
      if (next.error) {
        setAttachError(next.error);
        return current;
      }
      return next.drafts;
    });
  }, [allowVideoAttachments, attachmentsEnabled]);

  const removeDraft = useCallback((index: number) => {
    setDrafts((current) => current.filter((_, position) => position !== index));
  }, []);

  const handleAttachPhoto = async (fromCamera = false) => {
    if (disabled) return;
    const limit = canAddDrafts(drafts.length);
    if (limit?.error) {
      setAttachError(limit.error);
      return;
    }
    const result = await pickChatImage(fromCamera, { allowVideo: allowVideoAttachments });
    if (result.error) setAttachError(result.error);
    if (result.draft) {
      if (!allowVideoAttachments && result.draft.kind === 'video') {
        setAttachError('El envío de vídeo está disponible solo en Personal · Coaching.');
        return;
      }
      addDraft(result.draft);
    }
  };

  const handleAttachVideo = async () => {
    if (!allowVideoAttachments) {
      setAttachError('El envío de vídeo está disponible solo en Personal · Coaching.');
      return;
    }
    if (disabled) return;
    const limit = canAddDrafts(drafts.length);
    if (limit?.error) {
      setAttachError(limit.error);
      return;
    }
    const result = await pickChatVideo();
    if (result.error) setAttachError(result.error);
    if (result.draft) addDraft(result.draft);
  };

  const handleAttachGif = async () => {
    if (disabled) return;
    const limit = canAddDrafts(drafts.length);
    if (limit?.error) {
      setAttachError(limit.error);
      return;
    }
    const result = await pickChatGif();
    if (result.error) setAttachError(result.error);
    if (result.draft) addDraft(result.draft);
  };

  const handleAttachFile = async () => {
    if (disabled) return;
    const limit = canAddDrafts(drafts.length);
    if (limit?.error) {
      setAttachError(limit.error);
      return;
    }
    const result = await pickChatFile();
    if (result.error) setAttachError(result.error);
    if (result.draft) addDraft(result.draft);
  };

  const handleToggleRecording = async () => {
    if (disabled) return;
    setAttachError(null);

    if (recorder.isRecording) {
      const draft = await recorder.stop();
      if (draft) {
        addDraft({
          kind: 'audio',
          uri: draft.uri,
          mimeType: draft.mimeType,
          fileName: draft.fileName,
          durationSeconds: draft.durationSeconds,
        });
      }
      return;
    }

    const limit = canAddDrafts(drafts.length);
    if (limit?.error) {
      setAttachError(limit.error);
      return;
    }
    await recorder.start();
  };

  const handleCancelRecording = async () => {
    await recorder.cancel();
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage((current) => `${current}${emoji}`);
    setEmojiOpen(false);
  };

  const clearComposer = useCallback(() => {
    setNewMessage('');
    setDrafts([]);
    setAttachError(null);
    setEmojiOpen(false);
    setDragOver(false);
    void recorder.cancel();
  }, [recorder.cancel]);

  const handleSend = async () => {
    if (disabled || sending) return false;
    const trimmed = newMessage.trim();
    if (!trimmed && drafts.length === 0) return false;

    setSending(true);
    setAttachError(null);
    const sent = await onSend(trimmed, drafts);
    setSending(false);

    if (sent) {
      clearComposer();
    } else {
      setAttachError('No se pudo enviar el mensaje. Inténtalo de nuevo.');
    }

    return sent;
  };

  const handleDropFiles = async (files: FileList | File[]) => {
    if (disabled || Platform.OS !== 'web') return;
    const result = await draftsFromFileList(files, drafts.length);
    if (result.error) {
      setAttachError(result.error);
      return;
    }
    const draftsToAdd = allowVideoAttachments
      ? result.drafts
      : result.drafts.filter((draft) => draft.kind !== 'video');
    if (draftsToAdd.length < result.drafts.length) {
      setAttachError('El envío de vídeo está disponible solo en Personal · Coaching.');
    }
    addDrafts(draftsToAdd);
  };

  const webDropHandlers =
    Platform.OS === 'web'
      ? {
          onDragEnter: (event: { preventDefault: () => void }) => {
            event.preventDefault();
            if (!disabled) setDragOver(true);
          },
          onDragOver: (event: { preventDefault: () => void }) => {
            event.preventDefault();
            if (!disabled) setDragOver(true);
          },
          onDragLeave: () => setDragOver(false),
          onDrop: (event: { preventDefault: () => void; dataTransfer?: DataTransfer }) => {
            event.preventDefault();
            setDragOver(false);
            if (disabled || !event.dataTransfer?.files?.length) return;
            void handleDropFiles(event.dataTransfer.files);
          },
        }
      : {};

  return {
    newMessage,
    onChangeMessage: setNewMessage,
    clearComposer,
    drafts,
    removeDraft,
    attachError,
    emojiOpen,
    setEmojiOpen,
    quickEmojis: QUICK_EMOJIS,
    onEmojiSelect: handleEmojiSelect,
    dragOver,
    webDropHandlers,
    sending,
    onSend: handleSend,
    onAttachPhoto: () => void handleAttachPhoto(false),
    onAttachCamera: () => void handleAttachPhoto(true),
    onAttachVideo: () => void handleAttachVideo(),
    allowVideoAttachments,
    attachmentsEnabled,
    onAttachGif: () => void handleAttachGif(),
    onAttachFile: () => void handleAttachFile(),
    onToggleRecording: () => void handleToggleRecording(),
    onCancelRecording: () => void handleCancelRecording(),
    isRecording: recorder.isRecording,
    recordingMillis: recorder.durationMillis,
    recordingError: recorder.error,
  };
}
