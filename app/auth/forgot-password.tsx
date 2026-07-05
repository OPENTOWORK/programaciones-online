import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';

export default function ForgotPasswordScreen() {
  const { resetPassword, isDemoMode } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setError('');
    setWarningMessage('');
    setSuccessMessage('');
  };

  const handleReset = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Introduce un email válido');
      setWarningMessage('');
      setSuccessMessage('');
      return;
    }

    setError('');
    setWarningMessage('');
    setSuccessMessage('');
    setLoading(true);
    const result = await resetPassword(email.trim());
    setLoading(false);

    if (result.error) {
      if (result.error.includes('límite de envíos')) {
        setWarningMessage(result.error);
      } else {
        setError(result.error);
      }
      return;
    }

    setSuccessMessage(
      isDemoMode
        ? 'Modo demo: se simularía el envío del email de recuperación.'
        : 'Hemos enviado un email con el enlace para restablecer tu contraseña. Revisa tu bandeja de entrada y la carpeta de spam.',
    );
  };

  return (
    <ScreenWrapper>
      <Text style={styles.title}>Recuperar contraseña</Text>
      <Text style={styles.subtitle}>
        Te enviaremos un enlace para restablecer tu contraseña al email registrado en tu cuenta.
      </Text>

      {successMessage ? (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      ) : null}

      {warningMessage ? (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>{warningMessage}</Text>
          <Text style={styles.warningHint}>
            Revisa también tu bandeja de spam: es posible que un enlace anterior ya se haya enviado.
          </Text>
        </View>
      ) : null}

      <Input
        label="Email"
        placeholder="tu@email.com"
        value={email}
        onChangeText={handleEmailChange}
        keyboardType="email-address"
        autoCapitalize="none"
        error={error}
      />

      <Button title="Enviar enlace" onPress={handleReset} loading={loading} />

      <Text style={styles.hint}>
        Usa el mismo email con el que te registraste. Supabase limita los envíos a pocos correos por hora.
      </Text>

      <Link href="/auth/login" style={styles.link}>
        <Text style={styles.linkText}>← Volver al login</Text>
      </Link>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.xs },
  subtitle: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.lg },
  successBanner: {
    backgroundColor: `${colors.success}22`,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.success,
  },
  successText: { ...typography.bodySmall, color: colors.success, lineHeight: 20 },
  warningBanner: {
    backgroundColor: `${colors.warning}22`,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  warningText: { ...typography.bodySmall, color: colors.warning, lineHeight: 20 },
  warningHint: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs, lineHeight: 18 },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.md,
    lineHeight: 18,
  },
  link: { alignSelf: 'center', marginTop: spacing.xl },
  linkText: { ...typography.bodySmall, color: colors.accent, fontWeight: '600' },
});
