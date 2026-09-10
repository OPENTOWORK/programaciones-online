import { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';

interface CreateClientModalProps {
  visible: boolean;
  saving?: boolean;
  onCancel: () => void;
  onConfirm: (input: { name: string; email: string; password: string }) => void;
}

const NO_AUTOFILL: Pick<
  TextInputProps,
  'autoComplete' | 'autoCorrect' | 'importantForAutofill' | 'spellCheck' | 'textContentType'
> = {
  autoComplete: 'off',
  autoCorrect: false,
  importantForAutofill: 'no',
  spellCheck: false,
  textContentType: 'none',
};

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
  const [autofillLocked, setAutofillLocked] = useState(Platform.OS === 'web');

  useEffect(() => {
    if (!visible) {
      setName('');
      setEmail('');
      setPassword('');
      setErrors({});
      setAutofillLocked(Platform.OS === 'web');
      return;
    }

    if (Platform.OS !== 'web') {
      setAutofillLocked(false);
      return;
    }

    // Chrome rellena al insertar el formulario. Mientras está en solo lectura, se salta el autofill.
    const timer = setTimeout(() => setAutofillLocked(false), 150);
    return () => clearTimeout(timer);
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

  const unlockAutofill = () => {
    if (autofillLocked) setAutofillLocked(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      {visible ? (
        <View style={styles.overlay}>
          <Pressable
            accessibilityLabel="Cerrar"
            accessibilityRole="button"
            onPress={onCancel}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.card}>
            <Text style={styles.title}>Crear cliente</Text>
            <Text style={styles.subtitle}>
              Se creará una cuenta de atleta, aparecerá en la columna Registrado y recibirá un
              correo de bienvenida en su Gmail. Comparte también la contraseña temporal para que
              pueda entrar.
            </Text>

            <AutofillDecoy />

            <Input
              {...NO_AUTOFILL}
              label="Nombre"
              value={name}
              onChangeText={setName}
              onFocus={unlockAutofill}
              placeholder="Ej. Ana López"
              error={errors.name}
              autoCapitalize="words"
              readOnly={autofillLocked}
            />
            <Input
              {...NO_AUTOFILL}
              label="Email"
              value={email}
              onChangeText={setEmail}
              onFocus={unlockAutofill}
              placeholder="cliente@email.com"
              error={errors.email}
              keyboardType={Platform.OS === 'web' ? 'default' : 'email-address'}
              autoCapitalize="none"
              readOnly={autofillLocked}
            />
            <Input
              {...NO_AUTOFILL}
              autoComplete="new-password"
              textContentType="newPassword"
              label="Contraseña temporal"
              value={password}
              onChangeText={setPassword}
              onFocus={unlockAutofill}
              placeholder="Mínimo 6 caracteres"
              error={errors.password}
              secureTextEntry
              autoCapitalize="none"
              readOnly={autofillLocked}
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
          </View>
        </View>
      ) : null}
    </Modal>
  );
}

function AutofillDecoy() {
  if (Platform.OS !== 'web') return null;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={styles.autofillDecoy}
    >
      <TextInput
        autoComplete="username"
        importantForAutofill="yes"
        textContentType="username"
      />
      <TextInput
        autoComplete="current-password"
        importantForAutofill="yes"
        secureTextEntry
        textContentType="password"
      />
    </View>
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
    zIndex: 1,
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
  autofillDecoy: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    overflow: 'hidden',
  },
});
