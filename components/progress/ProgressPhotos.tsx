import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppIcon } from '@/components/ui/AppIcon';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { useProgressPhotos } from '@/hooks/useProgressPhotos';
import { formatMonthLabel, type PhotoTipo } from '@/lib/photoService';

async function pickImage() {
  if (Platform.OS !== 'web') {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return { error: 'Necesitamos permiso para acceder a tus fotos' };
    }
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [3, 4],
    quality: 0.85,
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

function PhotoSlot({
  label,
  uri,
  emptyHint,
  dense = false,
}: {
  label: string;
  uri?: string;
  emptyHint: string;
  dense?: boolean;
}) {
  return (
    <View style={styles.photoSlot}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[styles.photoImage, dense && styles.photoImageDense]}
          accessibilityLabel={label}
        />
      ) : (
        <View style={[styles.photoPlaceholder, dense && styles.photoPlaceholderDense]}>
          <AppIcon name="measure" size={dense ? 18 : 28} color={colors.textMuted} outlined />
          <Text style={[styles.photoPlaceholderText, dense && styles.photoPlaceholderTextDense]}>
            {emptyHint}
          </Text>
        </View>
      )}
      <Text style={[styles.photoLabel, dense && styles.photoLabelDense]}>{label}</Text>
    </View>
  );
}

export function ProgressPhotos({ dense = false }: { dense?: boolean }) {
  const { photos, isLoading, isUploading, error, uploadPhoto, isDemoMode } = useProgressPhotos();
  const [localError, setLocalError] = useState<string | null>(null);

  const displayError = localError ?? error;

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
      <View style={[styles.section, dense && styles.sectionDense]}>
        <Text style={[styles.sectionTitle, dense && styles.sectionTitleDense]}>Fotos de progreso</Text>
        <Card style={dense ? styles.denseCard : undefined}>
          <Text style={[styles.loadingText, dense && styles.loadingTextDense]}>Cargando fotos…</Text>
        </Card>
      </View>
    );
  }

  return (
    <View style={[styles.section, dense && styles.sectionDense]}>
      <Text style={[styles.sectionTitle, dense && styles.sectionTitleDense]}>Fotos de progreso</Text>

      {isDemoMode ? (
        <Card style={dense ? styles.denseCard : undefined}>
          <Text style={[styles.infoText, dense && styles.infoTextDense]}>
            Inicia sesión con tu cuenta para guardar fotos de progreso.
          </Text>
        </Card>
      ) : null}

      {photos.needsBeforePhoto ? (
        <Card style={[styles.promptCard, dense && styles.promptCardDense]}>
          <View style={[styles.promptHeader, dense && styles.promptHeaderDense]}>
            <View style={[styles.promptIcon, dense && styles.promptIconDense]}>
              <AppIcon name="measure" size={dense ? 18 : 22} color={colors.accent} />
            </View>
            <View style={styles.promptCopy}>
              <Text style={[styles.promptTitle, dense && styles.promptTitleDense]}>Tu foto de antes</Text>
              <Text style={[styles.promptText, dense && styles.promptTextDense]}>
                Sube una foto inicial para comparar tu evolución con el tiempo.
              </Text>
            </View>
          </View>
          <Button
            title="Subir foto de antes"
            onPress={() => handleUpload('antes')}
            loading={isUploading}
            disabled={isDemoMode}
            style={dense ? styles.denseButton : undefined}
            textStyle={dense ? styles.denseButtonText : undefined}
          />
        </Card>
      ) : null}

      {!photos.needsBeforePhoto && photos.needsMonthlyPhoto ? (
        <Card style={[styles.reminderCard, dense && styles.reminderCardDense]}>
          <View style={styles.reminderRow}>
            <AppIcon name="calendar" size={dense ? 16 : 20} color={colors.warning} outlined />
            <Text style={[styles.reminderText, dense && styles.reminderTextDense]}>
              Es momento de subir tu foto de {photos.currentMonthLabel}.
            </Text>
          </View>
          <Button
            title={`Subir foto de ${photos.currentMonthLabel}`}
            onPress={() => handleUpload('mensual')}
            loading={isUploading}
            variant="outline"
            style={[styles.reminderButton, dense && styles.denseButton]}
            textStyle={dense ? styles.denseButtonText : undefined}
          />
        </Card>
      ) : null}

      {!photos.needsBeforePhoto ? (
        <Card style={dense ? styles.denseCard : undefined}>
          <Text style={[styles.galleryTitle, dense && styles.galleryTitleDense]}>Comparativa</Text>
          <View style={styles.galleryRow}>
            <PhotoSlot
              dense={dense}
              label="Antes"
              uri={photos.antesPhoto?.url}
              emptyHint="Sin foto"
            />
            <PhotoSlot
              dense={dense}
              label={formatMonthLabel(photos.currentMonthKey)}
              uri={photos.monthlyPhotos.find((photo) => photo.mes === photos.currentMonthKey)?.url}
              emptyHint="Pendiente este mes"
            />
          </View>

          {!photos.needsMonthlyPhoto && photos.antesPhoto ? (
            <Button
              title="Actualizar foto del mes"
              onPress={() => handleUpload('mensual')}
              loading={isUploading}
              variant="secondary"
              style={[styles.updateButton, dense && styles.denseButton]}
              textStyle={dense ? styles.denseButtonText : undefined}
            />
          ) : null}

          {photos.monthlyPhotos.length > 0 ? (
            <View style={[styles.historyBlock, dense && styles.historyBlockDense]}>
              <Text style={styles.historyTitle}>Historial mensual</Text>
              <View style={styles.historyGrid}>
                {photos.monthlyPhotos.map((photo) => (
                  <View key={photo.id} style={styles.historyItem}>
                    <Image
                      source={{ uri: photo.url }}
                      style={[styles.historyImage, dense && styles.historyImageDense]}
                    />
                    <Text style={styles.historyLabel}>
                      {photo.mes ? formatMonthLabel(photo.mes) : '—'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </Card>
      ) : null}

      {displayError ? <Text style={styles.errorText}>{displayError}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  infoText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
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
    backgroundColor: `${colors.accent}18`,
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
    borderColor: `${colors.warning}55`,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  reminderText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    lineHeight: 22,
  },
  reminderButton: {
    marginTop: spacing.xs,
  },
  galleryTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  galleryRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  photoSlot: {
    flex: 1,
    gap: spacing.sm,
  },
  photoImage: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
  },
  photoPlaceholder: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.surfaceLight,
  },
  photoPlaceholderText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  photoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  updateButton: {
    marginTop: spacing.md,
  },
  historyBlock: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  historyTitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  historyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  historyItem: {
    width: '31%',
    gap: 4,
  },
  historyImage: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceLight,
  },
  historyLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.danger,
    marginTop: spacing.sm,
  },
  sectionDense: {
    marginTop: 0,
    flexShrink: 1,
  },
  sectionTitleDense: {
    ...typography.body,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  denseCard: {
    padding: spacing.sm + 2,
  },
  loadingTextDense: {
    ...typography.bodySmall,
  },
  infoTextDense: {
    lineHeight: 18,
    marginBottom: 0,
    ...typography.bodySmall,
  },
  promptCardDense: {
    marginBottom: 0,
    padding: spacing.sm + 2,
    gap: spacing.sm,
  },
  promptHeaderDense: {
    gap: spacing.sm,
  },
  promptIconDense: {
    width: 34,
    height: 34,
  },
  promptTitleDense: {
    ...typography.bodySmall,
    fontWeight: '700',
  },
  promptTextDense: {
    lineHeight: 16,
    fontSize: 12,
  },
  reminderCardDense: {
    marginBottom: 0,
    padding: spacing.sm + 2,
    gap: spacing.sm,
  },
  reminderTextDense: {
    ...typography.bodySmall,
    lineHeight: 18,
  },
  galleryTitleDense: {
    ...typography.bodySmall,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  photoImageDense: {
    aspectRatio: 16 / 9,
  },
  photoPlaceholderDense: {
    aspectRatio: 16 / 9,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  photoPlaceholderTextDense: {
    fontSize: 10,
  },
  photoLabelDense: {
    fontSize: 10,
  },
  historyBlockDense: {
    marginTop: spacing.sm,
  },
  historyImageDense: {
    aspectRatio: 1,
  },
  denseButton: {
    minHeight: 40,
    paddingVertical: spacing.sm,
  },
  denseButtonText: {
    fontSize: 13,
  },
});
