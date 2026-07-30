import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import * as Linking from 'expo-linking';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { ensureAuthCallbackProcessed, parseAuthCallbackFromUrl } from '@/lib/authCallback';
import {
  clearActiveRecoveryUrl,
  setActiveRecoveryUrl,
  waitForRecoverySession,
} from '@/lib/recoverySession';
import { getSupabase } from '@/lib/supabase';
import { getWebLocationHref } from '@/lib/platformAccess';

async function resolveRecoveryCallbackUrl(
  consumePendingAuthCallbackUrl: () => string | null,
): Promise<string | null> {
  const pending = consumePendingAuthCallbackUrl();
  if (pending?.includes('update-password')) {
    return pending;
  }

  if (Platform.OS !== 'web') {
    const initialUrl = await Linking.getInitialURL();
    if (initialUrl?.includes('update-password')) {
      return initialUrl;
    }
  }

  if (Platform.OS === 'web') {
    return getWebLocationHref();
  }

  return pending;
}

export default function UpdatePasswordScreen() {
  const router = useRouter();
  const { consumePendingAuthCallbackUrl, getAuthCallbackSnapshot } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function prepareRecoverySession() {
      const supabase = getSupabase();
      if (!supabase) {
        if (!cancelled) {
          setReady(false);
          setCheckingSession(false);
          setRecoveryError('Supabase no está disponible.');
        }
        return;
      }

      const callbackUrl = await resolveRecoveryCallbackUrl(consumePendingAuthCallbackUrl);
      if (callbackUrl) {
        setActiveRecoveryUrl(callbackUrl);

        const existingFlow = getAuthCallbackSnapshot(callbackUrl);
        if (existingFlow.status === 'error') {
          if (!cancelled) {
            setRecoveryError(existingFlow.sanitizedMessage ?? 'El enlace no es válido o ha caducado.');
            setReady(false);
            setCheckingSession(false);
          }
          return;
        }

        if (existingFlow.status !== 'success') {
          const parsed = parseAuthCallbackFromUrl(callbackUrl);
          if (parsed.status === 'error') {
            if (!cancelled) {
              setRecoveryError(parsed.message);
              setReady(false);
              setCheckingSession(false);
            }
            return;
          }

          if (parsed.status === 'pending') {
            const result = await ensureAuthCallbackProcessed(supabase, callbackUrl);
            if (!result.ok && !cancelled) {
              setRecoveryError(result.sanitizedMessage ?? result.error ?? 'El enlace no es válido o ha caducado.');
              setReady(false);
              setCheckingSession(false);
              return;
            }
          }
        }
      }

      const hasSession = await waitForRecoverySession(supabase, callbackUrl ?? undefined);
      if (!cancelled) {
        setReady(hasSession);
        setCheckingSession(false);
        if (!hasSession) {
          setRecoveryError('El enlace ha caducado o no es correcto. Solicita uno nuevo.');
        }
      }
    }

    prepareRecoverySession();

    return () => {
      cancelled = true;
    };
  }, [consumePendingAuthCallbackUrl, getAuthCallbackSnapshot]);

  const handleUpdate = async () => {
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setSuccessMessage('');
      return;
    }

    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      setSuccessMessage('');
      return;
    }

    setError('');
    setSuccessMessage('');
    setLoading(true);

    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      setError('Supabase no está disponible');
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await supabase.auth.signOut({ scope: 'local' });
    clearActiveRecoveryUrl();
    setSuccessMessage('Contraseña actualizada. Ya puedes iniciar sesión con tu nueva contraseña.');

    if (Platform.OS !== 'web') {
      setTimeout(() => router.replace('/auth/login'), 1500);
    }
  };

  if (checkingSession) {
    return (
      <ScreenWrapper scrollable={false}>
        <Text style={styles.title}>Verificando enlace</Text>
        <Text style={styles.subtitle}>Espera un momento mientras validamos tu enlace de recuperación…</Text>
      </ScreenWrapper>
    );
  }

  if (!ready) {
    return (
      <ScreenWrapper scrollable={false}>
        <Text style={styles.title}>Enlace no válido</Text>
        <Text style={styles.subtitle}>
          {recoveryError ?? 'El enlace ha caducado o no es correcto. Solicita uno nuevo desde recuperar contraseña.'}
        </Text>
        <Link href="/auth/forgot-password" style={styles.link}>
          <Text style={styles.linkText}>Solicitar nuevo enlace</Text>
        </Link>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Text style={styles.title}>Nueva contraseña</Text>
      <Text style={styles.subtitle}>Introduce y confirma tu nueva contraseña</Text>

      {successMessage ? (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>{successMessage}</Text>
          <Link href="/auth/login" style={styles.link}>
            <Text style={styles.linkText}>Ir al login</Text>
          </Link>
        </View>
      ) : null}

      <Input
        label="Nueva contraseña"
        placeholder="Mínimo 6 caracteres"
        value={password}
        onChangeText={setPassword}
        showPasswordToggle
        secureTextEntry
      />
      <Input
        label="Confirmar contraseña"
        placeholder="Repite la contraseña"
        value={confirm}
        onChangeText={setConfirm}
        showPasswordToggle
        secureTextEntry
        error={error}
      />

      <Button title="Guardar contraseña" onPress={handleUpdate} loading={loading} />
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
  link: { marginTop: spacing.lg, alignSelf: 'center' },
  linkText: { ...typography.body, color: colors.accent, fontWeight: '600' },
});
