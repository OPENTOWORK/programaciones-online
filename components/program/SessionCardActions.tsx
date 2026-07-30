import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/constants/theme';
import { deleteWorkoutCatalog } from '@/lib/programEditService';

interface SessionCardActionsProps {
  programId: string;
  workoutId: string;
  workoutName: string;
  canManage?: boolean;
  onDeleted?: () => void;
}

export function SessionCardActions({
  programId,
  workoutId,
  workoutName,
  canManage = false,
  onDeleted,
}: SessionCardActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const openView = () => router.push(`/workout/${workoutId}`);

  const openEdit = () => {
    router.push({
      pathname: '/trainer/program/[id]/session/[workoutId]',
      params: { id: programId, workoutId },
    });
  };

  const confirmDelete = async () => {
    setDeleting(true);
    const result = await deleteWorkoutCatalog(workoutId);
    setDeleting(false);

    if (result.error) {
      if (Platform.OS === 'web') {
        window.alert(result.error);
      } else {
        Alert.alert('Error', result.error);
      }
      return;
    }

    onDeleted?.();
  };

  const handleDelete = () => {
    const message = `¿Seguro que quieres eliminar "${workoutName}"? Esta acción no se puede deshacer.`;

    if (Platform.OS === 'web') {
      if (window.confirm(message)) {
        void confirmDelete();
      }
      return;
    }

    Alert.alert('Eliminar sesión', message, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => void confirmDelete() },
    ]);
  };

  if (!canManage) {
    return (
      <Button title="Ver" variant="outline" onPress={openView} style={styles.actionBtn} />
    );
  }

  return (
    <View style={styles.actions}>
      <Button title="Ver" variant="outline" onPress={openView} style={styles.actionBtn} />
      <Button title="Editar" variant="outline" onPress={openEdit} style={styles.actionBtn} />
      <Button
        title="Eliminar"
        variant="outline"
        onPress={handleDelete}
        loading={deleting}
        style={styles.deleteBtn}
        textStyle={styles.deleteBtnText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  actionBtn: { minHeight: 40, paddingHorizontal: spacing.sm },
  deleteBtn: { minHeight: 40, paddingHorizontal: spacing.sm, borderColor: colors.danger },
  deleteBtnText: { color: colors.danger },
});
