import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text } from 'react-native';
import * as Linking from 'expo-linking';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import {
  ensureAuthCallbackProcessed,
  getCurrentAuthCallbackUrl,
  parseAuthCallbackFromUrl,
} from '@/lib/authCallback';
import {
  getConfirmEmailErrorUi,
  isEmailConfirmationDeepLink,
  resolveConfirmEmailErrorFromCallback,
  resolveConfirmEmailErrorUi,
} from '@/lib/confirmEmailFlow';
import { getEmailConfirmationRedirectUrl, LOCAL_WEB_AUTH_ORIGIN } from '@/lib/authRedirect';
import { getPostLoginRoute } from '@/lib/navigation';
import { getSupabase } from '@/lib/supabase';

async function resolveConfirmEmailCallbackUrl(
  consumePendingAuthCallbackUrl: () => string | null,
): Promise<string | null> {
  const pending = consumePendingAuthCallbackUrl();
  if (pending && isEmailConfirmationDeepLink(pending)) {
    return pending;
  }

  let initialUrl: string | null = null;
  if (Platform.OS !== 'web') {
    initialUrl = await Linking.getInitialURL();
    if (initialUrl && isEmailConfirmationDeepLink(initialUrl)) {
      return initialUrl;
    }
  }

  const current = getCurrentAuthCallbackUrl();
  if (current && (Platform.OS === 'web' || isEmailConfirmationDeepLink(current))) {
    return current;
  }

  return pending ?? initialUrl ?? current ?? null;
}

export default function ConfirmEmailScreen() {
  const router = useRouter();
  const { pending, email: emailParam, error: errorParam } = useLocalSearchParams<{
    pending?: string;
    email?: string;
    error?: string;
  }>();
  const { refreshUser, consumePendingAuthCallbackUrl, getAuthCallbackSnapshot } = useAuth();
  const [checking, setChecking] = useState(pending !== '1' && !errorParam);
  const [errorUi, setErrorUi] = useState(() =>
    errorParam
      ? {
          ...getConfirmEmailErrorUi('generic'),
          message: decodeURIComponent(String(errorParam)),
        }
      : null,
  );
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendEmail, setResendEmail] = useState(typeof emailParam === 'string' ? emailParam : '');
  const email = resendEmail.trim();

  useEffect(() => {
    if (pending === '1' || errorParam) {
      return;
    }

    let cancelled = false;

    async function confirmFromLink() {
      const supabase = getSupabase();
      if (!supabase) {
        if (!cancelled) {
          setErrorUi({
            ...getConfirmEmailErrorUi('generic'),
            message: 'Supabase no está disponible.',
          });
          setChecking(false);
        }
        return;
      }

      const callbackUrl = await resolveConfirmEmailCallbackUrl(consumePendingAuthCallbackUrl);
      if (!callbackUrl) {
        if (!cancelled) {
          setErrorUi(getConfirmEmailErrorUi('invalid_link'));
          setChecking(false);
        }
        return;
      }

      /* Un intento fallido no significa que la confirmación fallara: otro proceso puede haber
       * canjeado el enlace y dejado la sesión lista. Solo es error si no hay sesión. */
      const hasSession = async () => {
        const { data } = await supabase.auth.getSession();
        return Boolean(data.session?.user);
      };

      const existingFlow = getAuthCallbackSnapshot(callbackUrl);
      if (existingFlow.status === 'error' && !(await hasSession())) {
        if (!cancelled) {
          setErrorUi(resolveConfirmEmailErrorUi(existingFlow.errorCode, existingFlow.sanitizedMessage));
          setChecking(false);
        }
        return;
      }

      const parsed = parseAuthCallbackFromUrl(callbackUrl);
      if (parsed.status === 'error') {
        if (!cancelled) {
          setErrorUi(resolveConfirmEmailErrorFromCallback({
            status: 'error',
            errorCode: parsed.errorCode ?? null,
            message: parsed.message,
          }));
          setChecking(false);
        }
        return;
      }

      if (parsed.status === 'idle') {
        if (!cancelled) {
          setErrorUi(getConfirmEmailErrorUi('invalid_link'));
          setChecking(false);
        }
        return;
      }

      if (existingFlow.status !== 'success') {
        const result = await ensureAuthCallbackProcessed(supabase, callbackUrl);
        if (cancelled) return;

        if (!result.ok && !(await hasSession())) {
          if (cancelled) return;
          setErrorUi(resolveConfirmEmailErrorUi(result.errorCode ?? null, result.sanitizedMessage ?? result.error));
          setChecking(false);
          return;
        }
      }

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        if (!cancelled) {
          setErrorUi(getConfirmEmailErrorUi('generic'));
          setChecking(false);
        }
        return;
      }

      const loaded = await refreshUser(true);
      if (cancelled) return;

      if (!loaded?.ok) {
        router.replace('/');
        return;
      }

      setSuccess(true);
      setChecking(false);
      router.replace(getPostLoginRoute(loaded.profile?.role));
    }

    void confirmFromLink();

    return () => {
      cancelled = true;
    };
  }, [pending, errorParam, refreshUser, router, consumePendingAuthCallbackUrl, getAuthCallbackSnapshot]);

  const handleResend = async () => {
    if (!email.trim()) {
      Alert.alert('Email necesario', 'Vuelve a registrarte para recibir un nuevo enlace de confirmación.');
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      Alert.alert('Error', 'Supabase no está disponible.');
      return;
    }

    setResending(true);
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: {
        emailRedirectTo: getEmailConfirmationRedirectUrl(),
      },
    });
    setResending(false);

    if (resendError) {
      Alert.alert('No se pudo reenviar', resendError.message);
      return;
    }

    Alert.alert('Email enviado', 'Te hemos enviado un nuevo enlace de confirmación. Revisa tu bandeja y spam.');
  };

  if (checking) {
    return (
      <ScreenWrapper scrollable={false}>
        <ActivityIndicator size="large" color={colors.accent} style={styles.loader} />
        <Text style={styles.title}>Confirmando email</Text>
        <Text style={styles.subtitle}>Estamos validando tu enlace…</Text>
      </ScreenWrapper>
    );
  }

  if (pending === '1' && !errorUi && !success) {
    return (
      <ScreenWrapper scrollable={false}>
        <Text style={styles.title}>Revisa tu email</Text>
        <Text style={styles.subtitle}>
          Te hemos enviado un enlace de confirmación{email ? ` a ${email}` : ''}. Haz clic en el enlace para activar tu
          cuenta.
        </Text>
        <Text style={styles.hint}>
          {Platform.OS === 'web'
            ? `Si el enlace no abre la app, comprueba que Supabase tenga configurada la URL ${LOCAL_WEB_AUTH_ORIGIN}/auth/confirm-email`
            : 'Abre el enlace desde tu móvil para confirmar la cuenta en Training ProgLine.'}
        </Text>
        <Text style={styles.hint}>
          ¿No llega? Revisa spam y correo no deseado (remitente: noreply@mail.app.supabase.co). Hotmail/Outlook pueden
          tardar varios minutos. Supabase limita envíos en plan gratuito.
        </Text>
        <Input
          label="Tu email"
          placeholder="tu@email.com"
          value={resendEmail}
          onChangeText={setResendEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Button
          title="Reenviar email de confirmación"
          onPress={handleResend}
          loading={resending}
          disabled={!email}
        />
        <Link href="/auth/login" style={styles.linkBlock}>
          <Text style={styles.linkText}>Ir a iniciar sesión</Text>
        </Link>
      </ScreenWrapper>
    );
  }

  if (success) {
    return (
      <ScreenWrapper scrollable={false}>
        <Text style={styles.title}>Email confirmado</Text>
        <Text style={styles.subtitle}>Tu cuenta ya está activa. Redirigiendo…</Text>
      </ScreenWrapper>
    );
  }

  const showResend = errorUi?.showResend && Boolean(email.trim());

  return (
    <ScreenWrapper scrollable={false}>
      <Text style={styles.title}>{errorUi?.title ?? 'No se pudo confirmar'}</Text>
      <Text style={styles.subtitle}>{errorUi?.message ?? 'El enlace no es válido o ha caducado.'}</Text>
      {showResend ? (
        <Button title="Reenviar email de confirmación" onPress={handleResend} loading={resending} />
      ) : null}
      {errorUi?.showLogin !== false ? (
        <Link href="/auth/login" style={styles.linkBlock}>
          <Text style={styles.linkText}>Ir a iniciar sesión</Text>
        </Link>
      ) : null}
      {!email ? (
        <Link href="/auth/register" style={styles.linkBlock}>
          <Text style={styles.linkText}>Volver a registrarse</Text>
        </Link>
      ) : null}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loader: { marginBottom: spacing.lg },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.lg },
  hint: {
    ...typography.bodySmall,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  linkBlock: { marginTop: spacing.md, alignSelf: 'center' },
  linkText: { ...typography.body, color: colors.accent, fontWeight: '600' },
});
