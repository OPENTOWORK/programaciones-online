import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';

interface WellhubActivationCardProps {
  onActivate: () => void;
}

export function WellhubActivationCard({ onActivate }: WellhubActivationCardProps) {
  const [wellhubId, setWellhubId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);

  const handleActivate = () => {
    if (!wellhubId.trim()) {
      setError('Introduce el ID de Wellhub de tu gimnasio.');
      return;
    }

    setError(null);
    setActivating(true);
    setTimeout(() => {
      setActivating(false);
      onActivate();
    }, 350);
  };

  return (
    <View style={styles.card}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Wellhub</Text>
      </View>
      <Text style={styles.title}>Activar Wellhub</Text>
      <Text style={styles.subtitle}>
        Conecta tu gimnasio con esta plataforma. Introduce el ID que te ha dado Wellhub para
        empezar a recibir socios aquí.
      </Text>

      <Input
        label="ID de Wellhub"
        value={wellhubId}
        onChangeText={(value) => {
          setWellhubId(value);
          if (error) setError(null);
        }}
        placeholder="Pega aquí tu ID de gimnasio en Wellhub"
        autoCapitalize="none"
        autoCorrect={false}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        title="Activar Wellhub"
        onPress={handleActivate}
        loading={activating}
        style={styles.button}
      />

      <Text style={styles.hint}>
        La sincronización automática de altas estará disponible en cuanto activemos la conexión con
        Wellhub.
      </Text>
    </View>
  );
}

export function WellhubActivatedBanner() {
  return (
    <View style={styles.activeBanner}>
      <Text style={styles.activeTitle}>Wellhub activado</Text>
      <Text style={styles.activeText}>
        Tu gimnasio está preparado en esta plataforma. Los socios que lleguen desde Wellhub
        aparecerán en esta pestaña.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
        } as object)
      : null),
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: withAlpha('#7C3AED', '18'),
    borderWidth: 1,
    borderColor: withAlpha('#7C3AED', '33'),
  },
  badgeText: {
    ...typography.caption,
    color: '#7C3AED',
    fontWeight: '800',
    letterSpacing: 0.3,
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
  button: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginTop: -4,
  },
  activeBanner: {
    borderWidth: 1,
    borderColor: withAlpha('#7C3AED', '33'),
    borderRadius: borderRadius.md,
    backgroundColor: withAlpha('#7C3AED', '10'),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    gap: 2,
  },
  activeTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '800',
  },
  activeText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
