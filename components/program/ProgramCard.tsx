import { useState } from 'react';
import { Alert, ImageBackground, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { IconBadge } from '@/components/ui/AppIcon';
import { spacing, typography, colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { usePrograms } from '@/hooks/usePrograms';
import { isTrainerRole } from '@/lib/athleteService';
import { ensureVenueCatalogProgram } from '@/lib/programEditService';
import { getProgramCover } from '@/lib/programCovers';
import { isMetconCatalogProgram, isVenuePlaceholderProgram } from '@/lib/standardVenueCatalog';
import type { Program } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface ProgramCardProps {
  program: Program;
}

export function ProgramCard({ program }: ProgramCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { refresh } = usePrograms();
  const isTrainer = isTrainerRole(user?.role);
  const isComingSoon = isVenuePlaceholderProgram(program);
  const canManagePlaceholder = isComingSoon && isTrainer;
  const isLocked = program.status === 'bloqueada' && !canManagePlaceholder;
  const isMetcon = isMetconCatalogProgram(program);
  const [creating, setCreating] = useState(false);
  const useMetconBlue = isMetcon && !(isLocked || (isComingSoon && !isTrainer));
  const cover = getProgramCover(program);

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

  const body = (
    <>
      {program.catalogPrice ? (
        <View
          style={[
            styles.priceBadge,
            cover && styles.priceBadgeCover,
            isMetcon && (cover ? styles.priceBadgeMetconCover : styles.priceBadgeMetcon),
          ]}
        >
          <Text style={[styles.price, isMetcon && styles.priceMetcon]}>{program.catalogPrice}</Text>
        </View>
      ) : null}
      <View style={styles.header}>
        <IconBadge
          name={program.icon}
          containerSize={48}
          size={24}
          color={isMetcon ? colors.metcon : colors.accent}
          style={cover ? styles.iconBadgeCover : undefined}
        />
        <View style={styles.headerText}>
          <View style={styles.titleRow}>
            <Text style={[styles.name, isMetcon && styles.nameMetcon, cover && styles.textOnCover]}>
              {program.name}
            </Text>
            {program.catalogNameTag ? (
              <Text style={[styles.nameTag, isMetcon && styles.nameTagMetcon]}>
                {program.catalogNameTag}
              </Text>
            ) : null}
          </View>
          {program.description ? (
            <Text style={[styles.description, cover && styles.textOnCover]}>{program.description}</Text>
          ) : null}
          {program.equipment.length > 0 ? (
            <Text style={[styles.equipment, cover && styles.textOnCover]}>
              <Text style={styles.equipmentLabel}>Material necesario · </Text>
              {program.equipment.join(' · ')}
            </Text>
          ) : null}
        </View>
      </View>

      <Button
        title={buttonTitle}
        onPress={() => void handlePress()}
        variant={isLocked || (isComingSoon && !isTrainer) ? 'secondary' : 'primary'}
        disabled={isLocked || (isComingSoon && !isTrainer)}
        loading={creating}
        style={useMetconBlue ? { ...styles.button, ...styles.buttonMetcon } : styles.button}
        textStyle={useMetconBlue ? styles.buttonMetconText : undefined}
      />
    </>
  );

  return (
    <Card style={cover ? { ...styles.card, ...styles.cardCover, ...(isMetcon ? styles.cardMetcon : {}) } : isMetcon ? { ...styles.card, ...styles.cardMetcon } : styles.card}>
      {cover ? (
        <ImageBackground
          source={cover}
          style={styles.cover}
          imageStyle={styles.coverImage}
          resizeMode="cover"
        >
          <LinearGradient
            colors={
              isMetcon
                ? ['rgba(15,20,25,0.28)', 'rgba(15,20,25,0.72)', 'rgba(10,16,26,0.92)']
                : ['rgba(15,20,25,0.24)', 'rgba(15,20,25,0.70)', 'rgba(15,20,25,0.90)']
            }
            locations={[0, 0.42, 1]}
            style={styles.coverOverlay}
          >
            {body}
          </LinearGradient>
        </ImageBackground>
      ) : (
        body
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  cardCover: {
    padding: 0,
    backgroundColor: colors.background,
  },
  cardMetcon: {
    borderColor: `${colors.metcon}66`,
  },
  cover: {
    minHeight: 204,
  },
  coverImage: {
    opacity: 0.92,
  },
  coverOverlay: {
    padding: spacing.md,
    minHeight: 204,
  },
  priceBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: `${colors.accent}18`,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 2,
  },
  priceBadgeCover: {
    backgroundColor: 'rgba(15,20,25,0.72)',
    borderWidth: 1,
    borderColor: `${colors.accent}40`,
  },
  priceBadgeMetcon: {
    backgroundColor: `${colors.metcon}18`,
  },
  priceBadgeMetconCover: {
    borderColor: `${colors.metcon}50`,
  },
  price: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  priceMetcon: {
    color: colors.metcon,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    paddingRight: 92,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  name: {
    ...typography.h3,
    color: colors.text,
  },
  nameMetcon: {
    color: colors.metcon,
  },
  nameTag: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    backgroundColor: `${colors.accent}14`,
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  nameTagMetcon: {
    color: colors.metcon,
    backgroundColor: `${colors.metcon}14`,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  equipment: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  equipmentLabel: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  textOnCover: {
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  iconBadgeCover: {
    backgroundColor: 'rgba(15,20,25,0.62)',
  },
  button: {
    marginTop: spacing.xs,
  },
  buttonMetcon: {
    backgroundColor: '#3B7DD8',
    borderColor: 'rgba(255,255,255,0.16)',
    shadowColor: '#3B7DD8',
  },
  buttonMetconText: {
    color: colors.white,
  },
});
