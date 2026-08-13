import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';

interface CreateClientModalProps {
  visible: boolean;
  saving?: boolean;
  onCancel: () => void;
  onConfirm: (input: { name: string; email: string; password: string }) => void;
}

export function CreateClientModal({
  visible,
  saving = false,
  onCancel,
  onConfirm,
}: CreateClientModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!visible) return;
    setName('');
    setEmail('');
    setPassword('');
    setErrors({});
  }, [visible]);

  const handleConfirm = () => {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = 'El nombre es obligatorio';
    if (!email.trim()) nextErrors.email = 'El email es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(email.trim())) nextErrors.email = 'Email no válido';
    if (!password) nextErrors.password = 'La contraseña es obligatoria';
    else if (password.length < 6) nextErrors.password = 'Mínimo 6 caracteres';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onConfirm({ name: name.trim(), email: email.trim(), password });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>Crear cliente</Text>
          <Text style={styles.subtitle}>
            Se creará una cuenta de atleta y aparecerá en la columna Registrado. Comparte la
            contraseña temporal con tu cliente para que pueda entrar.
          </Text>

          <Input
            label="Nombre"
            value={name}
            onChangeText={setName}
            placeholder="Ej. Ana López"
            error={errors.name}
            autoCapitalize="words"
          />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="cliente@email.com"
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Contraseña temporal"
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 6 caracteres"
            error={errors.password}
            secureTextEntry
            autoCapitalize="none"
          />

          <View style={styles.actions}>
            <Button title="Cancelar" variant="secondary" onPress={onCancel} style={styles.actionButton} />
            <Button
              title="Crear cliente"
              onPress={handleConfirm}
              loading={saving}
              style={styles.actionButton}
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
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    marginTop: 0,
    minHeight: 44,
  },
});
