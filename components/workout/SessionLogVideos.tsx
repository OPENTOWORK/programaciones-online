import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionSheetModal } from '@/components/ui/ActionSheetModal';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { SessionVideoSendModal } from '@/components/workout/SessionVideoSendModal';
import { VideoTelestratorModal } from '@/components/trainer/VideoTelestratorModal';
import { SessionVideoPlayer } from '@/components/workout/SessionVideoPlayer';
import { colors, spacing, typography } from '@/constants/theme';
import { useSessionVideos } from '@/hooks/useSessionVideos';
import type { SessionLogVideo } from '@/lib/sessionVideoService';
import type { SessionVideoSource } from '@/lib/sessionVideoPicker';
import type { FeedbackAttachmentDraft } from '@/lib/trainerFeedbackMediaService';

function formatVideoDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface SessionLogVideosProps {
  logId?: string;
  userId?: string;
  readOnly?: boolean;
  compact?: boolean;
  tone?: 'default' | 'subtle';
  requiresSavedLog?: boolean;
  canUpload?: boolean;
  videos?: SessionLogVideo[];
  isLoading?: boolean;
  isUploading?: boolean;
  error?: string | null;
  onUpload?: (source: SessionVideoSource) => void;
  onRemove?: (videoId: string) => void;
  onAnnotatedVideo?: (draft: FeedbackAttachmentDraft, video: SessionLogVideo) => void;
}

export function SessionLogVideos({
  logId,
  userId,
  readOnly = false,
  compact = false,
  tone = 'default',
  requiresSavedLog = false,
  canUpload: canUploadProp,
  videos: videosProp,
  isLoading: isLoadingProp,
  isUploading: isUploadingProp,
  error: errorProp,
  onUpload,
  onRemove,
  onAnnotatedVideo,
}: SessionLogVideosProps) {
  const controlled = videosProp !== undefined;
  const internal = useSessionVideos(controlled ? undefined : logId, controlled ? undefined : userId);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [annotateVideo, setAnnotateVideo] = useState<SessionLogVideo | null>(null);

  const videos = videosProp ?? internal.videos;
  const isLoading = isLoadingProp ?? internal.isLoading;
  const isUploading = isUploadingProp ?? internal.isUploading;
  const error = errorProp ?? internal.error;

  const canUpload =
    canUploadProp ?? (!readOnly && Boolean(logId && userId) && !requiresSavedLog);
  const needsSaveFirst = requiresSavedLog && !logId && !canUploadProp;
  const subtle = tone === 'subtle';

  const handleUploadPress = () => {
    if (onUpload) {
      setPickerOpen(true);
      return;
    }
    void internal.uploadVideo({ source: Platform.OS === 'web' ? 'library' : 'camera' });
  };

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact, subtle && styles.wrapSubtle]}>
      {!subtle ? (
        <View style={styles.header}>
          <Text style={styles.label}>Videos del entreno</Text>
          {videos.length > 0 ? <Text style={styles.count}>{videos.length}</Text> : null}
        </View>
      ) : null}

      {needsSaveFirst ? (
        <Text style={[styles.hint, subtle && styles.hintSubtle]}>
          Guarda la sesión para poder subir videos de tu entrenamiento.
        </Text>
      ) : null}

      {canUpload && !readOnly ? (
        <Button
          title={isUploading ? 'Subiendo video…' : 'Subir video de la sesión'}
          variant="outline"
          onPress={handleUploadPress}
          loading={isUploading}
          disabled={isUploading}
          style={styles.uploadBtn}
        />
      ) : null}

      {isLoading ? (
        <Text style={[styles.hint, subtle && styles.hintSubtle]}>Cargando videos…</Text>
      ) : videos.length === 0 ? (
        <View style={[styles.emptyState, subtle && styles.emptyStateSubtle]}>
          {!subtle ? null : <AppIcon name="camera" size={18} color={colors.textMuted} outlined />}
          <Text style={[styles.hint, subtle && styles.hintSubtle]}>
            {readOnly
              ? 'Sin vídeos adjuntos en esta sesión.'
              : 'Desde cada ejercicio puedes grabar un vídeo, o subir uno general de la sesión.'}
          </Text>
        </View>
      ) : (
        <View style={styles.videoList}>
          {videos.map((video) => {
            const title = video.exerciseName?.trim() || 'Vídeo de la sesión';
            return (
              <View key={video.id} style={styles.videoClip}>
                <SessionVideoPlayer
                  url={video.url}
                  mimeType={video.mimeType}
                  compact={compact || subtle}
                  title={title}
                  subtitle={formatVideoDate(video.createdAt)}
                  onAnnotate={onAnnotatedVideo ? () => setAnnotateVideo(video) : undefined}
                />
                {!readOnly ? (
                  <Pressable
                    onPress={() => {
                      if (onRemove) {
                        onRemove(video.id);
                        return;
                      }
                      void internal.removeVideo(video.id);
                    }}
                    style={({ pressed }) => [styles.deleteBtn, pressed && styles.pressed]}
                  >
                    <AppIcon name="trash" size={14} color={colors.danger} />
                    <Text style={styles.deleteText}>Eliminar</Text>
                  </Pressable>
                ) : null}
              </View>
            );
          })}
        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <ActionSheetModal
        visible={pickerOpen}
        title="Subir video de la sesión"
        subtitle="Graba con la cámara o elige uno de la galería."
        onClose={() => setPickerOpen(false)}
        actions={[
          {
            key: 'camera',
            label: 'Grabar con la cámara',
            onPress: () => {
              setPickerOpen(false);
              onUpload?.('camera');
            },
          },
          {
            key: 'library',
            label: Platform.OS === 'web' ? 'Elegir vídeo' : 'Elegir de la galería',
            onPress: () => {
              setPickerOpen(false);
              onUpload?.('library');
            },
          },
        ]}
      />

      {!controlled ? (
        <SessionVideoSendModal
          visible={Boolean(internal.pendingUpload)}
          exerciseName={internal.pendingUpload?.exerciseName}
          sending={internal.isUploading}
          onSend={() => void internal.confirmPendingUpload()}
          onEdit={() => void internal.editPendingUpload()}
          onCancel={internal.cancelPendingUpload}
        />
      ) : null}

      {onAnnotatedVideo && annotateVideo ? (
        <VideoTelestratorModal
          visible
          videoUrl={annotateVideo.url}
          title={annotateVideo.exerciseName?.trim() || annotateVideo.fileName}
          onClose={() => setAnnotateVideo(null)}
          onComplete={(draft) => {
            onAnnotatedVideo(draft, annotateVideo);
            setAnnotateVideo(null);
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  wrapCompact: {
    marginTop: 0,
    paddingTop: 0,
    borderTopWidth: 0,
  },
  wrapSubtle: {
    marginTop: 0,
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  count: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },
  hintSubtle: {
    ...typography.bodySmall,
    lineHeight: 20,
    fontStyle: 'normal',
  },
  emptyState: {
    gap: spacing.xs,
  },
  emptyStateSubtle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingLeft: 36,
  },
  uploadBtn: {
    marginBottom: spacing.sm,
  },
  videoList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  videoClip: {
    gap: spacing.xs,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    paddingLeft: 2,
  },
  deleteText: {
    ...typography.caption,
    color: colors.danger,
    fontWeight: '600',
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  pressed: {
    opacity: 0.85,
  },
});
