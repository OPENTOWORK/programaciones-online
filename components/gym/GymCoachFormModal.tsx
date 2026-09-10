import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import {
  generateGymCoachPassword,
  type InviteGymCoachInput,
  type InviteGymCoachResult,
} from '@/lib/gymCoachService';

interface FormState {
  name: string;
  email: string;
  phone: string;
  password: string;
}

function emptyForm(): FormState {
  return {
    name: '',
    email: '',
    phone: '',
    password: generateGymCoachPassword(),
  };
}

export function GymCoachFormModal({
  visible,
  gymName,
  onCancel,
  onSubmit,
}: {
  visible: boolean;
  gymName?: string;
  onCancel: () => void;
  onSubmit: (input: Omit<InviteGymCoachInput, 'gymId'>) => Promise<InviteGymCoachResult>;
}) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setForm(emptyForm());
      setError(null);
    }
  }, [visible]);

  const patch = (changes: Partial<FormState>) => setForm((current) => ({ ...current, ...changes }));

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }
    if (!form.email.trim()) {
      setError('El email es obligatorio.');
      return;
    }

    setSaving(true);
    setError(null);
    const result = await onSubmit({
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
    });
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          onPress={onCancel}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.card}>
          <Text style={styles.title}>Nuevo entrenador</Text>
          <Text style={styles.subtitle}>
            Le enviaremos un correo para entrar al panel
            {gymName ? ` de ${gymName}` : ''}. Podrá gestionar entrenamientos y tareas.
          </Text>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <Input
              label="Nombre"
              value={form.name}
              onChangeText={(value) => patch({ name: value })}
              placeholder="Ej. Laura Gómez"
              autoCapitalize="words"
            />
            <Input
              label="Email"
              value={form.email}
              onChangeText={(value) => patch({ email: value })}
              placeholder="entrenador@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Input
              label="Teléfono (opcional)"
              value={form.phone}
              onChangeText={(value) => patch({ phone: value })}
              placeholder="600 000 000"
              keyboardType="phone-pad"
            />
            <Input
              label="Contraseña temporal"
              value={form.password}
              onChangeText={(value) => patch({ password: value })}
              autoCapitalize="none"
              showPasswordToggle
            />
            <Text style={styles.hint}>
              También se la enviamos por correo. Puedes cambiarla antes de invitar.
            </Text>
          </ScrollView>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <Button
              title="Cancelar"
              variant="secondary"
              onPress={onCancel}
              style={styles.actionButton}
            />
            <Button
              title="Enviar invitación"
              onPress={() => void handleSubmit()}
              loading={saving}
              style={styles.actionButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    maxHeight: '88%',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  form: {
    flexGrow: 0,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
