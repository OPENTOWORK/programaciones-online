import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
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
    setLoading(true);
    const { error } = await signUp(email.trim(), password, name.trim());
    setLoading(false);
    if (error) {
      Alert.alert('Error', error);
      return;
    }
    router.replace('/tabs/home');
  };

  return (
    <ScreenWrapper>
      <Text style={styles.title}>Crear cuenta</Text>
      <Text style={styles.subtitle}>Empieza tu transformación hoy</Text>

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
  subtitle: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.lg },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footerText: { ...typography.bodySmall, color: colors.textSecondary },
  linkAccent: { ...typography.bodySmall, color: colors.accent, fontWeight: '600' },
});
