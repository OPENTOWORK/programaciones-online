import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';

interface AddYoutubeVideoModalProps {
  visible: boolean;
  saving?: boolean;
  error?: string | null;
  onClose: () => void;
  onSave: (input: { name: string; youtubeUrl: string }) => void;
}

export function AddYoutubeVideoModal({
  visible,
  saving = false,
  error,
  onClose,
  onSave,
}: AddYoutubeVideoModalProps) {
  const [name, setName] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');

  useEffect(() => {
    if (!visible) return;
    setName('');
    setYoutubeUrl('');
  }, [visible]);

  const canSave = name.trim().length > 0 && youtubeUrl.trim().length > 0 && !saving;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>Añadir vídeo de YouTube</Text>
          <Text style={styles.subtitle}>
            Se guardará en la biblioteca para que el equipo y los atletas puedan consultar la técnica.
          </Text>

          <Input
            label="Nombre del ejercicio"
            value={name}
            onChangeText={setName}
            placeholder="Ej. Pull up"
            autoCapitalize="sentences"
          />
          <Input
            label="Enlace de YouTube"
            value={youtubeUrl}
            onChangeText={setYoutubeUrl}
            placeholder="https://youtube.com/watch?v=..."
            autoCapitalize="none"
            autoCorrect={false}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <Button title="Cancelar" variant="outline" onPress={onClose} disabled={saving} style={styles.action} />
            <Button
              title="Añadir vídeo"
              onPress={() => onSave({ name, youtubeUrl })}
              loading={saving}
              disabled={!canSave}
              style={styles.action}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  action: {
    flex: 1,
  },
});
