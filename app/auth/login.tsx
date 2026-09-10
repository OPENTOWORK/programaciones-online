import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Button } from '@/components/ui/Button';
import { AppLogo } from '@/components/ui/AppLogo';
import { Input } from '@/components/ui/Input';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, spacing, typography, withAlpha } from '@/constants/theme';
import { DEMO_TRAINER, DEMO_USER } from '@/lib/mockData';
import { isWebPlatform } from '@/lib/platformAccess';
import { useAuth } from '@/hooks/useAuth';
import { getPostLoginRoute } from '@/lib/navigation';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, isDemoMode } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = 'El email es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email no válido';
    if (!password) newErrors.password = 'La contraseña es obligatoria';
    else if (password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setAuthError(null);
    setLoading(true);

    try {
      const { error, profile } = await signIn(email.trim().toLowerCase(), password);
      if (error) {
        setAuthError(error);
        Alert.alert('Error', error);
        return;
      }
      if (profile) {
        router.replace(getPostLoginRoute(profile.role));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo iniciar sesión.';
      setAuthError(message);
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail(DEMO_USER.email);
    setPassword(DEMO_USER.password);
    setErrors({});
  };

  const fillDemoTrainer = () => {
    setEmail(DEMO_TRAINER.email);
    setPassword(DEMO_TRAINER.password);
    setErrors({});
  };

  const isWeb = isWebPlatform();

  return (
    <ScreenWrapper>
      <LinearGradient colors={[withAlpha(colors.accent, '22'), 'transparent']} style={styles.hero}>
        <View style={styles.logoWrap}>
          <AppLogo size={96} />
        </View>
        {!isWeb ? (
          <Text style={styles.subtitle}>Tus programaciones de entrenamiento online</Text>
        ) : null}
      </LinearGradient>

      {isDemoMode && (
        <View style={styles.demoBanner}>
          <Text style={styles.demoText}>Modo demo activo — Supabase no configurado</Text>
          <Button title="Usar cuenta demo atleta" onPress={fillDemo} variant="outline" style={styles.demoBtn} />
          {isWeb ? (
            <Button title="Usar cuenta demo entrenador" onPress={fillDemoTrainer} variant="outline" style={styles.demoBtn} />
          ) : null}
        </View>
      )}

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
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        showPasswordToggle
        secureTextEntry
        error={errors.password}
      />

      <Button title="Iniciar sesión" onPress={handleLogin} loading={loading} />

      {authError ? <Text style={styles.authError}>{authError}</Text> : null}

      <Link href="/auth/forgot-password" style={styles.link}>
        <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
      </Link>

      <View style={styles.footer}>
        <Text style={styles.footerText}>¿No tienes cuenta? </Text>
        <Link href="/auth/register">
          <Text style={styles.linkAccent}>Regístrate</Text>
        </Link>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    borderRadius: 16,
    marginBottom: spacing.lg,
  },
  logoWrap: { marginBottom: spacing.sm },
  title: { ...typography.h1, color: colors.text },
  subtitle: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs },
  demoBanner: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  demoText: { ...typography.bodySmall, color: colors.accent, marginBottom: spacing.sm },
  demoBtn: { minHeight: 44, marginBottom: spacing.xs },
  link: { alignSelf: 'center', marginTop: spacing.md },
  authError: {
    ...typography.bodySmall,
    color: colors.danger,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  linkText: { ...typography.bodySmall, color: colors.textSecondary },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footerText: { ...typography.bodySmall, color: colors.textSecondary },
  linkAccent: { ...typography.bodySmall, color: colors.accent, fontWeight: '600' },
});
