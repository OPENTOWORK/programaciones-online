import { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  PlanBrandSilverIcon,
  planBrandActionButtonStyle,
  planBrandActionButtonTextStyle,
  planBrandStyles,
} from '@/components/program/planBrandUi';
import { AppIcon } from '@/components/ui/AppIcon';
import { borderRadius, spacing, typography, colors, brandColors, withAlpha } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { usePrograms } from '@/hooks/usePrograms';
import { isAdminRole, isTrainerRole } from '@/lib/athleteService';
import { getCatalogPriceOffer } from '@/lib/catalogPricing';
import { ensureHypeWeeklyChallengeProgram, ensureVenueCatalogProgram } from '@/lib/programEditService';
import {
  HYPE_CATALOG_PURCHASE_PENDING_MESSAGE,
  HYPE_CATALOG_PURCHASE_PENDING_TITLE,
  canEnterHypeCatalogProgram,
  isHypeWeeklyChallengePlaceholder,
  isHypeWeeklyChallengeProgram,
  isPaidHypeCatalogProgram,
} from '@/lib/hypeCatalog';
import { isMetconCatalogProgram, isVenuePlaceholderProgram } from '@/lib/standardVenueCatalog';
import type { Program } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface ProgramCardProps {
  program: Program;
}

export function ProgramCard({ program }: ProgramCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { refresh } = usePrograms();
  const isAdmin = isAdminRole(user?.role);
  const isStaff = isTrainerRole(user?.role);
  const isPaidCatalog = isPaidHypeCatalogProgram(program);
  const isComingSoon = isVenuePlaceholderProgram(program);
  const isWeeklyChallengePlaceholder = isHypeWeeklyChallengePlaceholder(program);
  const isWeeklyChallenge = isWeeklyChallengePlaceholder || isHypeWeeklyChallengeProgram(program);
  const isPlaceholder = isComingSoon || isWeeklyChallengePlaceholder;
  const canManagePlaceholder = isPlaceholder && (isPaidCatalog ? isAdmin : isStaff);
  const canEnter = !isPaidCatalog || canEnterHypeCatalogProgram(user?.role);
  const showBuy = isPaidCatalog && !isAdmin;
  const isLocked = !isPaidCatalog && program.status === 'bloqueada' && !canManagePlaceholder;
  const isMetcon = isMetconCatalogProgram(program);
  const useBlueTheme = isMetcon || isWeeklyChallenge;
  const [creating, setCreating] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const hasDetails = Boolean(
    program.description || program.catalogDesignedFor || program.catalogMonitor || program.equipment.length > 0,
  );
  const priceOffer = isPaidCatalog
    ? getCatalogPriceOffer(program.catalogPrice, user?.role)
    : program.catalogPrice
      ? { current: program.catalogPrice }
      : null;

  const handlePress = async () => {
    if (showBuy) {
      setPurchaseOpen(true);
      return;
    }

    if (canManagePlaceholder) {
      setCreating(true);
      const result = isWeeklyChallengePlaceholder
        ? await ensureHypeWeeklyChallengeProgram(program)
        : await ensureVenueCatalogProgram(program);
      setCreating(false);

      if (result.error || !result.program) {
        Alert.alert('Error', result.error ?? 'No se pudo crear la programación');
        return;
      }

      await refresh(true);
      router.push(`/program/${result.program.id}`);
      return;
    }

    if (!canEnter) return;
    router.push(`/program/${program.id}`);
  };

  const buttonTitle = canManagePlaceholder
    ? 'Crear programación'
    : showBuy
      ? 'Comprar'
      : isPlaceholder
        ? 'Próximamente'
        : isLocked
          ? 'Bloqueada'
          : 'Ver programación';

  const actionDisabled =
    creating ||
    (!showBuy && (isLocked || (isPlaceholder && !canManagePlaceholder)));
  const useBlueButton = useBlueTheme && !actionDisabled;

  const leadStyle = useBlueTheme ? styles.leadBlue : planBrandStyles.lead;
  const tagStyle = useBlueTheme ? styles.tagBlue : planBrandStyles.tag;

  return (
    <View style={[planBrandStyles.card, styles.card, useBlueTheme && styles.cardBlue]}>
      <View style={planBrandStyles.inner}>
        {priceOffer ? (
          <View
            style={[
              styles.priceBadge,
              isMetcon && styles.priceBadgeMetcon,
              isWeeklyChallenge && styles.priceBadgeBlue,
            ]}
          >
            {priceOffer.original ? (
              <Text style={styles.priceOld}>{priceOffer.original}</Text>
            ) : null}
            <Text style={styles.price}>{priceOffer.current}</Text>
            {priceOffer.discountPercent ? (
              <Text style={styles.priceDiscount}>-{priceOffer.discountPercent}%</Text>
            ) : null}
          </View>
        ) : null}

        <View style={styles.header}>
          <PlanBrandSilverIcon name={program.icon} iconSize={22} />
          <View style={[styles.headerText, priceOffer?.original && styles.headerTextWithDiscount]}>
            <View style={styles.titleRow}>
              <Text style={leadStyle}>{program.name}</Text>
              {program.catalogNameTag ? <Text style={tagStyle}>{program.catalogNameTag}</Text> : null}
            </View>
            {hasDetails ? (
              <Pressable
                onPress={() => setInfoOpen(true)}
                accessibilityRole="button"
                accessibilityLabel={`Más información sobre ${program.name}`}
                style={({ pressed }) => [styles.moreInfoBtn, pressed && styles.moreInfoBtnPressed]}
              >
                <AppIcon
                  name="info"
                  size={15}
                  color={useBlueTheme ? colors.metcon : withAlpha(brandColors.orangeSecondary, 'CC')}
                />
                <Text style={[planBrandStyles.metaText, useBlueTheme && styles.moreInfoBlue]}>
                  Más información
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <Button
          title={buttonTitle}
          onPress={() => void handlePress()}
          variant={actionDisabled ? 'secondary' : useBlueButton ? 'primary' : 'outline'}
          disabled={actionDisabled}
          loading={creating}
          style={
            actionDisabled
              ? styles.button
              : useBlueButton
                ? { ...styles.button, ...styles.buttonBlue }
                : { ...styles.button, ...planBrandActionButtonStyle }
          }
          textStyle={useBlueButton ? styles.buttonBlueText : planBrandActionButtonTextStyle}
        />
      </View>

      <ProgramDetailsModal visible={infoOpen} program={program} onClose={() => setInfoOpen(false)} />
      <ConfirmModal
        visible={purchaseOpen}
        title={HYPE_CATALOG_PURCHASE_PENDING_TITLE}
        message={HYPE_CATALOG_PURCHASE_PENDING_MESSAGE}
        confirmLabel="Entendido"
        cancelLabel="Cerrar"
        onCancel={() => setPurchaseOpen(false)}
        onConfirm={() => setPurchaseOpen(false)}
      />
    </View>
  );
}

function ProgramDetailsModal({
  visible,
  program,
  onClose,
}: {
  visible: boolean;
  program: Program;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={modalStyles.overlay} onPress={onClose}>
        <Pressable style={modalStyles.card} onPress={(event) => event.stopPropagation()}>
          <Text style={modalStyles.title}>{program.name}</Text>
          {program.catalogNameTag ? <Text style={modalStyles.tag}>{program.catalogNameTag}</Text> : null}

          {program.description ? <Text style={modalStyles.description}>{program.description}</Text> : null}

          {program.catalogDesignedFor ? (
            <View style={modalStyles.block}>
              <Text style={modalStyles.label}>Diseñado para</Text>
              <Text style={modalStyles.value}>{program.catalogDesignedFor}</Text>
            </View>
          ) : null}

          {program.catalogMonitor ? (
            <View style={modalStyles.block}>
              <Text style={modalStyles.label}>Profesional</Text>
              <Text style={modalStyles.value}>{program.catalogMonitor}</Text>
            </View>
          ) : null}

          {program.equipment.length > 0 ? (
            <View style={modalStyles.block}>
              <Text style={modalStyles.label}>Material necesario</Text>
              {program.equipment.map((item) => (
                <Text key={item} style={modalStyles.value}>
                  · {item}
                </Text>
              ))}
            </View>
          ) : null}

          <Button title="Cerrar" variant="secondary" onPress={onClose} style={modalStyles.closeBtn} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const PRICE_GREEN = '#4ADE80';

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    position: 'relative',
  },
  cardBlue: {
    borderColor: withAlpha(colors.metcon, '66'),
  },
  priceBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(15,20,25,0.72)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 2,
    alignItems: 'flex-end',
    gap: 1,
    borderWidth: 1,
    borderColor: `${PRICE_GREEN}55`,
  },
  priceBadgeMetcon: {
    borderColor: `${PRICE_GREEN}40`,
  },
  priceBadgeBlue: {
    borderColor: `${colors.metcon}40`,
  },
  price: {
    ...typography.caption,
    color: PRICE_GREEN,
    fontWeight: '700',
  },
  priceOld: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
    textDecorationLine: 'line-through',
  },
  priceDiscount: {
    ...typography.caption,
    color: PRICE_GREEN,
    fontWeight: '700',
    fontSize: 10,
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
  headerTextWithDiscount: {
    paddingRight: 118,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  leadBlue: {
    ...planBrandStyles.lead,
    color: colors.metcon,
    textShadowColor: withAlpha(colors.metcon, '55'),
  },
  tagBlue: {
    ...planBrandStyles.tag,
    color: colors.metcon,
  },
  moreInfoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: spacing.sm,
    cursor: 'pointer',
  },
  moreInfoBtnPressed: {
    opacity: 0.8,
  },
  moreInfoBlue: {
    color: withAlpha(colors.metcon, 'CC'),
  },
  button: {
    marginTop: spacing.xs,
  },
  buttonBlue: {
    backgroundColor: '#3B7DD8',
    borderColor: 'rgba(255,255,255,0.16)',
    shadowColor: '#3B7DD8',
  },
  buttonBlueText: {
    color: colors.white,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  tag: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginTop: -spacing.sm,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  block: {
    gap: 4,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  value: {
    ...typography.bodySmall,
    color: colors.text,
    lineHeight: 20,
  },
  closeBtn: {
    marginTop: spacing.xs,
  },
});
