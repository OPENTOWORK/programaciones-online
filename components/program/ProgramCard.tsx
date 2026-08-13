import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppIcon, IconBadge } from '@/components/ui/AppIcon';
import { goalLabels, levelColors, spacing, typography, colors } from '@/constants/theme';
import type { AppIconName } from '@/constants/icons';
import { useAuth } from '@/hooks/useAuth';
import { usePrograms } from '@/hooks/usePrograms';
import { isTrainerRole } from '@/lib/athleteService';
import { ensureVenueCatalogProgram } from '@/lib/programEditService';
import { isVenuePlaceholderProgram } from '@/lib/standardVenueCatalog';
import type { Program } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface ProgramCardProps {
  program: Program;
}

function MetaItem({ icon, text }: { icon: AppIconName; text: string }) {
  return (
    <View style={styles.metaRow}>
      <AppIcon name={icon} size={16} color={colors.textMuted} />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

export function ProgramCard({ program }: ProgramCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { refresh } = usePrograms();
  const isTrainer = isTrainerRole(user?.role);
  const isComingSoon = isVenuePlaceholderProgram(program);
  const canManagePlaceholder = isComingSoon && isTrainer;
  const isLocked = program.status === 'bloqueada' && !canManagePlaceholder;
  const [creating, setCreating] = useState(false);

  const handlePress = async () => {
    if (canManagePlaceholder) {
      setCreating(true);
      const result = await ensureVenueCatalogProgram(program);
      setCreating(false);

      if (result.error || !result.program) {
        Alert.alert('Error', result.error ?? 'No se pudo crear la programación');
        return;
      }

      await refresh(true);
      router.push(`/program/${result.program.id}`);
      return;
    }

    router.push(`/program/${program.id}`);
  };

  const buttonTitle = canManagePlaceholder
    ? 'Crear programación'
    : isComingSoon
      ? 'Próximamente'
      : isLocked
        ? 'Bloqueada'
        : 'Ver programación';

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <IconBadge name={program.icon} containerSize={48} size={24} />
        <View style={styles.headerText}>
          <Text style={styles.name}>{program.name}</Text>
          <View style={styles.badges}>
            <Badge label={program.level} color={levelColors[program.level]} />
          </View>
        </View>
      </View>

      <View style={styles.meta}>
        {program.duration !== 'Por definir' ? (
          <MetaItem icon="calendar" text={program.duration} />
        ) : null}
        {program.goal ? <MetaItem icon="goal" text={goalLabels[program.goal]} /> : null}
        {program.sessionsPerWeek > 0 ? (
          <MetaItem icon="frequency" text={`${program.sessionsPerWeek}x/semana`} />
        ) : null}
      </View>

      <Button
        title={buttonTitle}
        onPress={() => void handlePress()}
        variant={isLocked || (isComingSoon && !isTrainer) ? 'secondary' : 'primary'}
        disabled={isLocked || (isComingSoon && !isTrainer)}
        loading={creating}
        style={styles.button}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  name: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  meta: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metaText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  button: {
    marginTop: spacing.xs,
  },
});
