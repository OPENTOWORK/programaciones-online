import { useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionSheetModal } from '@/components/ui/ActionSheetModal';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { colors, spacing, typography } from '@/constants/theme';
import { useSessionVideos } from '@/hooks/useSessionVideos';
import type { SessionLogVideo } from '@/lib/sessionVideoService';
import type { SessionVideoSource } from '@/lib/sessionVideoPicker';

function formatVideoDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function openVideoUrl(url: string) {
  if (Platform.OS === 'web') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  void Linking.openURL(url);
}

function SessionVideoPlayer({ url }: { url: string; mimeType?: string }) {
  if (Platform.OS === 'web') {
    return (
      <video
        src={url}
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
      onPress={() => openVideoUrl(url)}
      style={({ pressed }) => [styles.nativeVideoBtn, pressed && styles.pressed]}
    >
      <AppIcon name="play" size={22} color={colors.accent} />
      <Text style={styles.nativeVideoBtnText}>Reproducir video</Text>
    </Pressable>
  );
}

interface SessionLogVideosProps {
  logId?: string;
  userId?: string;
  readOnly?: boolean;
  compact?: boolean;
  requiresSavedLog?: boolean;
  canUpload?: boolean;
  videos?: SessionLogVideo[];
  isLoading?: boolean;
  isUploading?: boolean;
  error?: string | null;
  onUpload?: (source: SessionVideoSource) => void;
  onRemove?: (videoId: string) => void;
}

export function SessionLogVideos({
  logId,
  userId,
  readOnly = false,
  compact = false,
  requiresSavedLog = false,
  canUpload: canUploadProp,
  videos: videosProp,
  isLoading: isLoadingProp,
  isUploading: isUploadingProp,
  error: errorProp,
  onUpload,
  onRemove,
}: SessionLogVideosProps) {
  const controlled = videosProp !== undefined;
  const internal = useSessionVideos(controlled ? undefined : logId, controlled ? undefined : userId);
  const [pickerOpen, setPickerOpen] = useState(false);

  const videos = videosProp ?? internal.videos;
  const isLoading = isLoadingProp ?? internal.isLoading;
  const isUploading = isUploadingProp ?? internal.isUploading;
  const error = errorProp ?? internal.error;

  const canUpload =
    canUploadProp ?? (!readOnly && Boolean(logId && userId) && !requiresSavedLog);
  const needsSaveFirst = requiresSavedLog && !logId && !canUploadProp;

  const handleUploadPress = () => {
    if (onUpload) {
      setPickerOpen(true);
      return;
    }
    void internal.uploadVideo({ source: Platform.OS === 'web' ? 'library' : 'camera' });
  };

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <View style={styles.header}>
        <Text style={styles.label}>Videos del entreno</Text>
        {videos.length > 0 ? <Text style={styles.count}>{videos.length}</Text> : null}
      </View>

      {needsSaveFirst ? (
        <Text style={styles.hint}>Guarda la sesión para poder subir videos de tu entrenamiento.</Text>
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
        <Text style={styles.hint}>Cargando videos…</Text>
      ) : videos.length === 0 ? (
        <Text style={styles.hint}>
          {readOnly
            ? 'Todavía no hay videos subidos para esta sesión.'
            : 'Desde cada ejercicio puedes grabar un vídeo, o subir uno general de la sesión.'}
        </Text>
      ) : (
        videos.map((video) => (
          <View key={video.id} style={styles.videoCard}>
            <View style={styles.videoMeta}>
              <Text style={styles.videoName} numberOfLines={1}>
                {video.exerciseName?.trim() || video.fileName}
              </Text>
              {video.exerciseName?.trim() ? (
                <Text style={styles.videoExercise} numberOfLines={1}>
                  {video.fileName}
                </Text>
              ) : null}
              <Text style={styles.videoDate}>{formatVideoDate(video.createdAt)}</Text>
            </View>

            <SessionVideoPlayer url={video.url} mimeType={video.mimeType} />

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
                <AppIcon name="trash" size={16} color={colors.danger} />
                <Text style={styles.deleteText}>Eliminar</Text>
              </Pressable>
            ) : null}
          </View>
        ))
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <ActionSheetModal
        visible={pickerOpen}
        title="Subir video de la sesión"
        subtitle={
          Platform.OS === 'web'
            ? 'Elige un vídeo de tu dispositivo.'
            : 'Graba con la cámara o elige uno de la galería.'
        }
        onClose={() => setPickerOpen(false)}
        actions={[
          ...(Platform.OS === 'web'
            ? []
            : [
                {
                  key: 'camera',
                  label: 'Grabar con la cámara',
                  onPress: () => {
                    setPickerOpen(false);
                    onUpload?.('camera');
                  },
                },
              ]),
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
  uploadBtn: {
    marginBottom: spacing.sm,
  },
  videoCard: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  videoMeta: {
    gap: 2,
  },
  videoName: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  videoExercise: {
    ...typography.caption,
    color: colors.textMuted,
  },
  videoDate: {
    ...typography.caption,
    color: colors.textMuted,
  },
  nativeVideoBtn: {
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
  nativeVideoBtnText: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '700',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
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
