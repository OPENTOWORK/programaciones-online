import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { colors, spacing, typography } from '@/constants/theme';
import { useSessionVideos } from '@/hooks/useSessionVideos';

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
}

export function SessionLogVideos({
  logId,
  userId,
  readOnly = false,
  compact = false,
  requiresSavedLog = false,
}: SessionLogVideosProps) {
  const { videos, isLoading, isUploading, error, uploadVideo, removeVideo } = useSessionVideos(logId, userId);

  const canUpload = !readOnly && Boolean(logId && userId);
  const needsSaveFirst = requiresSavedLog && !logId;

  const handleUpload = async () => {
    const result = await uploadVideo();
    if (result.error) {
      // error state handled by hook
    }
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

      {canUpload ? (
        <Button
          title={isUploading ? 'Subiendo video…' : 'Subir video de la sesión'}
          variant="outline"
          onPress={handleUpload}
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
            : 'Sube un video de tu entrenamiento para que tu entrenador lo revise.'}
        </Text>
      ) : (
        videos.map((video) => (
          <View key={video.id} style={styles.videoCard}>
            <View style={styles.videoMeta}>
              <Text style={styles.videoName} numberOfLines={1}>
                {video.fileName}
              </Text>
              <Text style={styles.videoDate}>{formatVideoDate(video.createdAt)}</Text>
            </View>

            <SessionVideoPlayer url={video.url} mimeType={video.mimeType} />

            {!readOnly ? (
              <Pressable
                onPress={() => void removeVideo(video.id)}
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
