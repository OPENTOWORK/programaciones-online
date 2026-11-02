import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppIcon } from '@/components/ui/AppIcon';
import Ionicons from '@expo/vector-icons/Ionicons';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useProgressPhotos } from '@/hooks/useProgressPhotos';
import { ensureMediaLibraryPickerAccess } from '@/lib/mediaLibraryPicker';
import { formatMonthLabel, type PhotoTipo } from '@/lib/photoService';

const PHOTO_ASPECT = 3 / 4;

async function pickImage() {
  const permission = await ensureMediaLibraryPickerAccess();
  if (!permission.granted) {
    return { error: 'Necesitamos permiso para acceder a tus fotos' };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [3, 4],
    quality: 0.72,
  });

  if (result.canceled || !result.assets[0]) {
    return { cancelled: true as const };
  }

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    mimeType: asset.mimeType ?? 'image/jpeg',
  };
}

type PhotoViewerState = { uri: string; label: string };

function PhotoLightbox({
  viewer,
  onClose,
}: {
  viewer: PhotoViewerState | null;
  onClose: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const maxWidth = Math.min(width - spacing.lg * 2, 520);
  const maxHeight = Math.min(height * 0.78, maxWidth / PHOTO_ASPECT);

  if (!viewer) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.lightboxOverlay}>
        <Pressable style={styles.lightboxBackdrop} onPress={onClose} accessibilityLabel="Cerrar foto" />
        <View style={styles.lightboxCard}>
          <Image
            source={{ uri: viewer.uri }}
            style={{ width: maxWidth, height: maxHeight, maxWidth: '100%' }}
            resizeMode="contain"
            accessibilityLabel={viewer.label}
          />
          <Text style={styles.lightboxLabel}>{viewer.label}</Text>
          <Button title="Cerrar" variant="secondary" onPress={onClose} style={styles.lightboxCloseBtn} />
        </View>
      </View>
    </Modal>
  );
}

function ProgressPhotoTile({
  label,
  uri,
  emptyHint,
  onPress,
}: {
  label: string;
  uri?: string;
  emptyHint?: string;
  onPress?: () => void;
}) {
  const canOpen = Boolean(uri && onPress);

  const inner = (
    <View style={styles.thumbInner}>
      {uri ? (
        <Image source={{ uri }} style={styles.photoImage} resizeMode="cover" accessibilityLabel={label} />
      ) : (
        <View style={styles.photoPlaceholder}>
          <AppIcon name="measure" size={20} color={colors.textMuted} outlined />
          {emptyHint ? <Text style={styles.photoPlaceholderText}>{emptyHint}</Text> : null}
        </View>
      )}
      <View style={styles.photoBadge}>
        <Text style={styles.photoBadgeText} numberOfLines={1}>
          {label}
        </Text>
      </View>
      {canOpen ? (
        <View style={styles.thumbZoomHint}>
          <Ionicons name="expand-outline" size={14} color={colors.white} />
        </View>
      ) : null}
    </View>
  );

  if (canOpen) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Ver foto: ${label}`}
        style={({ pressed }) => [styles.thumbTile, pressed && styles.thumbTilePressed]}
      >
        {inner}
      </Pressable>
    );
  }

  return <View style={styles.thumbTile}>{inner}</View>;
}

export function ProgressPhotos({
  dense = false,
  userId,
  readOnly = false,
  embedded = false,
}: {
  dense?: boolean;
  userId?: string;
  readOnly?: boolean;
  embedded?: boolean;
}) {
  const { photos, isLoading, isUploading, error, uploadPhoto, isDemoMode } = useProgressPhotos(userId);
  const [localError, setLocalError] = useState<string | null>(null);
  const [viewer, setViewer] = useState<PhotoViewerState | null>(null);
  const canUpload = !readOnly && !isDemoMode;
  const compact = dense;

  const openViewer = (uri: string, label: string) => setViewer({ uri, label });

  const displayError = localError ?? error;

  const currentMonthLabel = formatMonthLabel(photos.currentMonthKey);
  const currentMonthPhoto = photos.monthlyPhotos.find((photo) => photo.mes === photos.currentMonthKey);

  async function handleUpload(tipo: PhotoTipo) {
    setLocalError(null);

    const picked = await pickImage();
    if ('error' in picked && picked.error) {
      setLocalError(picked.error);
      return;
    }
    if ('cancelled' in picked) return;
    if (!('uri' in picked) || !picked.uri) return;

    await uploadPhoto(tipo, picked.uri, picked.mimeType);
  }

  if (isLoading) {
    return (
      <View style={[styles.section, compact && styles.sectionCompact, embedded && styles.sectionEmbedded]}>
        {embedded ? null : (
          <Text style={[styles.sectionTitle, compact && styles.sectionTitleCompact]}>Fotos de progreso</Text>
        )}
        <Card style={compact ? styles.cardCompact : undefined}>
          <Text style={styles.loadingText}>Cargando fotos…</Text>
        </Card>
      </View>
    );
  }

  return (
    <View style={[styles.section, compact && styles.sectionCompact, embedded && styles.sectionEmbedded]}>
      {embedded ? null : (
        <Text style={[styles.sectionTitle, compact && styles.sectionTitleCompact]}>Fotos de progreso</Text>
      )}

      {isDemoMode && !readOnly ? (
        <Card style={compact ? styles.cardCompact : undefined}>
          <Text style={styles.infoText}>Inicia sesión con tu cuenta para guardar fotos de progreso.</Text>
        </Card>
      ) : null}

      {readOnly && photos.needsBeforePhoto ? (
        <Card style={compact ? styles.cardCompact : undefined}>
          <Text style={styles.infoText}>Este atleta todavía no ha subido fotos de progreso.</Text>
        </Card>
      ) : null}

      {!readOnly && photos.needsBeforePhoto ? (
        <Card style={[styles.promptCard, compact && styles.cardCompact]}>
          <View style={styles.promptHeader}>
            <View style={styles.promptIcon}>
              <AppIcon name="measure" size={22} color={colors.accent} />
            </View>
            <View style={styles.promptCopy}>
              <Text style={styles.promptTitle}>Tu foto de antes</Text>
              <Text style={styles.promptText}>
                Sube una foto inicial para comparar tu evolución con el tiempo.
              </Text>
            </View>
          </View>
          <Button
            title="Subir foto de antes"
            onPress={() => handleUpload('antes')}
            loading={isUploading}
            disabled={!canUpload}
          />
        </Card>
      ) : null}

      {!readOnly && !photos.needsBeforePhoto && photos.needsMonthlyPhoto ? (
        <Card style={[styles.reminderCard, compact && styles.cardCompact]}>
          <View style={styles.reminderRow}>
            <AppIcon name="calendar" size={20} color={colors.warning} outlined />
            <Text style={styles.reminderText}>
              Es momento de subir tu foto de {photos.currentMonthLabel}.
            </Text>
          </View>
          <Button
            title={`Subir foto de ${photos.currentMonthLabel}`}
            onPress={() => handleUpload('mensual')}
            loading={isUploading}
            variant="outline"
            style={styles.reminderButton}
          />
        </Card>
      ) : null}

      {!photos.needsBeforePhoto ? (
        <Card style={[styles.galleryCard, compact && styles.cardCompact]}>
          <View style={styles.galleryHeader}>
            <Text style={styles.galleryTitle}>Comparativa</Text>
            <Text style={styles.gallerySubtitle}>Antes · {currentMonthLabel}</Text>
          </View>

          <View style={styles.thumbGrid}>
            <ProgressPhotoTile
              label="Antes"
              uri={photos.antesPhoto?.url}
              emptyHint="Sin foto inicial"
              onPress={
                photos.antesPhoto?.url
                  ? () => openViewer(photos.antesPhoto!.url, 'Antes')
                  : undefined
              }
            />
            <ProgressPhotoTile
              label={currentMonthLabel}
              uri={currentMonthPhoto?.url}
              emptyHint="Pendiente este mes"
              onPress={
                currentMonthPhoto?.url
                  ? () => openViewer(currentMonthPhoto.url, currentMonthLabel)
                  : undefined
              }
            />
          </View>

          {!readOnly && !photos.needsMonthlyPhoto && photos.antesPhoto ? (
            <Button
              title="Actualizar foto del mes"
              onPress={() => handleUpload('mensual')}
              loading={isUploading}
              variant="secondary"
              style={styles.updateButton}
            />
          ) : null}
        </Card>
      ) : null}

      {displayError ? <Text style={styles.errorText}>{displayError}</Text> : null}

      <PhotoLightbox viewer={viewer} onClose={() => setViewer(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.lg,
  },
  sectionEmbedded: {
    marginTop: 0,
  },
  sectionCompact: {
    marginTop: 0,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sectionTitleCompact: {
    ...typography.body,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  cardCompact: {
    padding: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  promptCard: {
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  promptHeader: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  promptIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: withAlpha(colors.accent, '18'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  promptTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  promptText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  reminderCard: {
    marginBottom: spacing.md,
    gap: spacing.md,
    borderColor: withAlpha(colors.warning, '44'),
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  reminderText: {
    ...typography.bodySmall,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
  reminderButton: {
    marginTop: spacing.xs,
  },
  galleryCard: {
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: withAlpha(colors.surfaceLight, '55'),
    borderColor: colors.border,
  },
  galleryHeader: {
    gap: 2,
  },
  galleryTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  gallerySubtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  thumbGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  thumbTile: {
    width: 112,
    flexGrow: 0,
    flexShrink: 0,
  },
  thumbTilePressed: {
    opacity: 0.92,
  },
  thumbInner: {
    position: 'relative',
    width: '100%',
    aspectRatio: PHOTO_ASPECT,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...(Platform.OS === 'web'
      ? ({ cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.18)' } as object)
      : null),
  },
  thumbZoomHint: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 26,
    height: 26,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(colors.background, 'AA'),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: withAlpha(colors.border, '99'),
  },
  photoImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    backgroundColor: withAlpha(colors.surfaceLight, '88'),
  },
  photoPlaceholderText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 13,
  },
  photoBadge: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    bottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    backgroundColor: withAlpha(colors.background, 'D9'),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: withAlpha(colors.border, 'AA'),
  },
  photoBadgeText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
  },
  updateButton: {
    marginTop: spacing.xs,
  },
  lightboxOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  lightboxBackdrop: {
    ...StyleSheet.absoluteFill,
    ...(Platform.OS === 'web' ? ({ cursor: 'zoom-out' } as object) : null),
  },
  lightboxCard: {
    width: '100%',
    maxWidth: 520,
    alignItems: 'center',
    gap: spacing.md,
    zIndex: 1,
  },
  lightboxLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
  },
  lightboxCloseBtn: {
    alignSelf: 'stretch',
    maxWidth: 280,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.danger,
    marginTop: spacing.sm,
  },
});







