import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Input } from '@/components/ui/Input';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { deleteOwnAccount } from '@/lib/accountDeletionService';

const CONFIRM_WORD = 'BORRAR';

const DELETED_DATA = [
  'Tu perfil, datos físicos, de nutrición y de entrenamiento',
  'Tus programaciones asignadas y el historial de sesiones',
  'Tus fotos de progreso, vídeos y notas de voz',
  'Tus mensajes con entrenadores y solicitudes de soporte',
  'Tus reservas y citas con el gimnasio',
];

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [confirmText, setConfirmText] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  const canContinue = confirmText.trim().toUpperCase() === CONFIRM_WORD;

  const handleDelete = async () => {
    setDeleting(true);
    setError('');

    const result = await deleteOwnAccount();

    if (result.error) {
      setDeleting(false);
      setShowConfirm(false);
      setError(result.error);
      return;
    }

    // La cuenta ya no existe: la sesión local se limpia y se vuelve al login.
    await signOut();
    setDeleting(false);
    setShowConfirm(false);
    router.replace('/auth/login');
  };

  return (
    <ScreenWrapper>
      <SectionHeader
        title="Eliminar cuenta"
        subtitle="Borra tu cuenta y todos tus datos de forma permanente"
      />

      <Card style={styles.warningCard}>
        <Text style={styles.warningTitle}>Esta acción no se puede deshacer</Text>
        <Text style={styles.warningText}>
          Al eliminar tu cuenta se borra de forma permanente e inmediata toda la información
          asociada a {user.email}. No se guarda ninguna copia y no podrás recuperarla.
        </Text>
      </Card>

      <Text style={styles.listTitle}>Se eliminará</Text>
      <View style={styles.list}>
        {DELETED_DATA.map((item) => (
          <View key={item} style={styles.listRow}>
            <Text style={styles.listBullet}>•</Text>
            <Text style={styles.listText}>{item}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.confirmLabel}>
        Escribe {CONFIRM_WORD} para habilitar el botón de eliminación.
      </Text>
      <Input
        label="Confirmación"
        value={confirmText}
        onChangeText={setConfirmText}
        placeholder={CONFIRM_WORD}
        autoCapitalize="characters"
        autoCorrect={false}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        title="Eliminar mi cuenta"
        onPress={() => setShowConfirm(true)}
        disabled={!canContinue || deleting}
        loading={deleting}
        style={styles.deleteButton}
        textStyle={styles.deleteButtonText}
      />

      <Button
        title="Cancelar"
        variant="ghost"
        onPress={() => router.back()}
        disabled={deleting}
        style={styles.cancelButton}
      />

      <ConfirmModal
        visible={showConfirm}
        title="¿Eliminar tu cuenta definitivamente?"
        message={`Se borrarán todos los datos de ${user.email}. Esta acción es irreversible.`}
        checkboxLabel="Entiendo que perderé todos mis datos y no podré recuperarlos."
        confirmLabel="Eliminar cuenta"
        destructive
        busy={deleting}
        onCancel={() => setShowConfirm(false)}
        onConfirm={() => void handleDelete()}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  warningCard: {
    marginTop: spacing.md,
    borderColor: colors.danger,
    backgroundColor: `${colors.danger}11`,
  },
  warningTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  warningText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  listTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  list: {
    gap: spacing.xs,
  },
  listRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  listBullet: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  listText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  confirmLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  error: {
    ...typography.bodySmall,
    color: colors.danger,
    marginTop: spacing.sm,
  },
  deleteButton: {
    marginTop: spacing.md,
    backgroundColor: colors.danger,
  },
  deleteButtonText: {
    color: colors.white,
  },
  cancelButton: {
    marginTop: spacing.xs,
  },
});
