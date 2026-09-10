import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors, spacing, typography, withAlpha } from '@/constants/theme';
import { openPlanPdf } from '@/lib/openPlanPdf';

interface SessionPdfCardProps {
  fileName?: string;
  /** URL firmada ya disponible. */
  url?: string;
  /** Se resuelve al pulsar cuando la URL firmada se pide bajo demanda. */
  resolveUrl?: () => Promise<string | undefined>;
  subtitle?: string;
}

export function SessionPdfCard({
  fileName,
  url,
  resolveUrl,
  subtitle = 'Tu entrenador ha adjuntado el entreno de este día en PDF.',
}: SessionPdfCardProps) {
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = async () => {
    setError(null);
    const direct = url;
    if (direct) {
      await openPlanPdf(direct);
      return;
    }

    if (!resolveUrl) return;

    setOpening(true);
    try {
      const resolved = await resolveUrl();
      if (!resolved) {
        setError('No se pudo abrir el PDF. Inténtalo de nuevo más tarde.');
        return;
      }
      await openPlanPdf(resolved);
    } catch {
      setError('No se pudo abrir el PDF. Inténtalo de nuevo más tarde.');
    } finally {
      setOpening(false);
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <AppIcon name="programs" size={18} color={colors.accent} />
        <View style={styles.headerText}>
          <Text style={styles.title}>{fileName ?? 'Entreno en PDF'}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      <Button title="Ver PDF" onPress={() => void open()} loading={opening} style={styles.button} />

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    borderColor: withAlpha(colors.accent, '55'),
    backgroundColor: withAlpha(colors.accent, '0D'),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  title: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  button: {
    marginTop: spacing.md,
  },
  error: {
    ...typography.bodySmall,
    color: colors.danger,
    marginTop: spacing.sm,
  },
});
