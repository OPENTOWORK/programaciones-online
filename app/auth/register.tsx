import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { PrivacyPolicyLink } from '@/components/legal/PrivacyPolicyLink';
import { Input } from '@/components/ui/Input';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, spacing, typography } from '@/constants/theme';
import { isWebPlatform } from '@/lib/platformAccess';
import { useAuth } from '@/hooks/useAuth';
import { getPostLoginRoute } from '@/lib/navigation';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!email.trim()) newErrors.email = 'El email es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email no válido';
    if (!password) newErrors.password = 'La contraseña es obligatoria';
    else if (password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
    if (password !== confirm) newErrors.confirm = 'Las contraseñas no coinciden';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setFormError(null);
    setLoading(true);

    try {
      const { error, profile, needsEmailConfirmation } = await signUp(email.trim(), password, name.trim());

      if (needsEmailConfirmation) {
        router.replace(`/auth/confirm-email?pending=1&email=${encodeURIComponent(email.trim())}`);
        return;
      }

      if (error) {
        setFormError(error);
        if (!isWebPlatform()) {
          Alert.alert('Error', error);
        }
        return;
      }

      if (profile) {
        router.replace(getPostLoginRoute(profile.role));
        return;
      }

      setFormError('No se pudo completar el registro. Inténtalo de nuevo.');
    } catch (registerError) {
      const message =
        registerError instanceof Error ? registerError.message : 'No se pudo completar el registro.';
      setFormError(message);
      if (!isWebPlatform()) {
        Alert.alert('Error', message);
      }
    } finally {
      setLoading(false);
    }
  };

  const isWeb = isWebPlatform();

  return (
    <ScreenWrapper>
      <Text style={styles.title}>Crear cuenta</Text>
      <Text style={styles.subtitle}>
        {isWeb ? 'Crea tu cuenta y accede según tu rol' : 'Empieza tu transformación hoy'}
      </Text>

      {isWeb ? (
        <Text style={styles.webNote}>
          Los entrenadores usan el panel web. Los atletas pueden entrar desde el navegador en versión móvil o desde la app
          de Android.
        </Text>
      ) : null}

      <Input label="Nombre" placeholder="Tu nombre" value={name} onChangeText={setName} error={errors.name} />
      <Input
        label="Email"
        placeholder="tu@email.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />
      <Input
        label="Contraseña"
        placeholder="Mínimo 6 caracteres"
        value={password}
        onChangeText={setPassword}
        showPasswordToggle
        secureTextEntry
        error={errors.password}
      />
      <Input
        label="Confirmar contraseña"
        placeholder="Repite la contraseña"
        value={confirm}
        onChangeText={setConfirm}
        showPasswordToggle
        secureTextEntry
        error={errors.confirm}
      />

      <PrivacyPolicyLink />

      {formError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{formError}</Text>
          {formError.includes('ya está registrado') ? (
            <Link href="/auth/login" style={styles.errorLink}>
              <Text style={styles.linkAccent}>Ir a iniciar sesión</Text>
            </Link>
          ) : null}
        </View>
      ) : null}

      <Button title="Registrarse" onPress={handleRegister} loading={loading} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
        <Link href="/auth/login">
          <Text style={styles.linkAccent}>Inicia sesión</Text>
        </Link>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.xs },
  subtitle: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.md },
  webNote: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  errorBanner: {
    backgroundColor: `${colors.danger}22`,
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.danger,
    lineHeight: 20,
  },
  errorLink: {
    alignSelf: 'flex-start',
  },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footerText: { ...typography.bodySmall, color: colors.textSecondary },
  linkAccent: { ...typography.bodySmall, color: colors.accent, fontWeight: '600' },
});
