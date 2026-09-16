import { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  PlanBrandSilverIcon,
  planBrandActionButtonStyle,
  planBrandActionButtonTextStyle,
  planBrandCatalogStyles,
  PLAN_BRAND_CATALOG_ICON_SIZE,
  planBrandStyles,
} from '@/components/program/planBrandUi';
import { AppIcon } from '@/components/ui/AppIcon';
import { borderRadius, spacing, typography, colors, brandColors, withAlpha } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { usePrograms } from '@/hooks/usePrograms';
import { isAdminRole, isTrainerRole } from '@/lib/athleteService';
import { pickCatalogExampleWorkout } from '@/lib/catalogExampleDay';
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
import { CATALOG_ACCESS_REQUEST_MESSAGE, SHOW_CATALOG_PRICING } from '@/lib/storeCompliance';
import type { Program } from '@/lib/types';
import { fetchWorkoutsByProgram } from '@/lib/workoutService';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface ProgramCardProps {
  program: Program;
  /** Reparte la altura disponible en listas de catálogo a pantalla completa. */
  fillHeight?: boolean;
}

export function ProgramCard({ program, fillHeight = false }: ProgramCardProps) {
  const router = useRouter();
  const { user, isDemoMode } = useAuth();
  const { refresh, workouts: catalogWorkouts } = usePrograms();
  const isAdmin = isAdminRole(user?.role);
  const isStaff = isTrainerRole(user?.role);
  const isPaidCatalog = isPaidHypeCatalogProgram(program);
  const isComingSoon = isVenuePlaceholderProgram(program);
  const isWeeklyChallengePlaceholder = isHypeWeeklyChallengePlaceholder(program);
  const isWeeklyChallenge = isWeeklyChallengePlaceholder || isHypeWeeklyChallengeProgram(program);
  const isPlaceholder = isComingSoon || isWeeklyChallengePlaceholder;
  const canManagePlaceholder = isPlaceholder && (isPaidCatalog ? isAdmin : isStaff);
  const canEnter = !isPaidCatalog || canEnterHypeCatalogProgram(user?.role);
  // En iOS no se ofrece compra de contenido digital: lo asigna el entrenador.
  const showBuy = isPaidCatalog && !isAdmin && SHOW_CATALOG_PRICING;
  const showRequestAccess = isPaidCatalog && !canEnter && !SHOW_CATALOG_PRICING;
  const isLocked = !isPaidCatalog && program.status === 'bloqueada' && !canManagePlaceholder;
  const isMetcon = isMetconCatalogProgram(program);
  const useBlueTheme = isMetcon || isWeeklyChallenge;
  const [creating, setCreating] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [exampleLoading, setExampleLoading] = useState(false);
  const hasDetails = Boolean(
    program.description || program.catalogDesignedFor || program.catalogMonitor || program.equipment.length > 0,
  );
  const priceOffer = !SHOW_CATALOG_PRICING
    ? null
    : isPaidCatalog
      ? getCatalogPriceOffer(program.catalogPrice, user?.role)
      : program.catalogPrice
        ? { current: program.catalogPrice }
        : null;

  const handlePress = async () => {
    if (showBuy || showRequestAccess) {
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
      : showRequestAccess
        ? 'Cómo conseguir acceso'
        : isPlaceholder
          ? 'Próximamente'
          : isLocked
            ? 'Bloqueada'
            : 'Ver programación';

  const actionDisabled =
    creating ||
    (!showBuy &&
      !showRequestAccess &&
      (isLocked || (isPlaceholder && !canManagePlaceholder)));
  const useBlueButton = useBlueTheme && !actionDisabled;

  const leadStyle = useBlueTheme ? styles.leadBlue : planBrandCatalogStyles.lead;
  const tagStyle = useBlueTheme ? styles.tagBlue : planBrandCatalogStyles.tag;
  const showExampleDay = !isPlaceholder;
  const linkIconColor = useBlueTheme ? colors.metcon : withAlpha(brandColors.orangeSecondary, 'CC');
  const linkTextStyle = [planBrandCatalogStyles.metaText, useBlueTheme && styles.moreInfoBlue];

  const openExampleDay = async () => {
    setExampleLoading(true);
    try {
      let programWorkouts = catalogWorkouts.filter((workout) => workout.programId === program.id);
      if (!isDemoMode && programWorkouts.length === 0) {
        programWorkouts = await fetchWorkoutsByProgram(program.id);
      }

      const example = pickCatalogExampleWorkout(programWorkouts);
      if (!example) {
        Alert.alert(
          'Ejemplo no disponible',
          'Todavía no hay una sesión de muestra publicada en esta programación.',
        );
        return;
      }

      router.push({
        pathname: '/workout/[id]',
        params: { id: example.id, preview: '1' },
      });
    } finally {
      setExampleLoading(false);
    }
  };

  return (
    <View
      style={[
        planBrandStyles.card,
        styles.card,
        fillHeight && styles.cardFill,
        useBlueTheme && styles.cardBlue,
      ]}
    >
      <View style={[planBrandStyles.inner, planBrandCatalogStyles.inner, fillHeight && styles.innerFill]}>
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
          <PlanBrandSilverIcon
            name={program.icon}
            size={fillHeight ? PLAN_BRAND_CATALOG_ICON_SIZE : PLAN_BRAND_CATALOG_ICON_SIZE - 4}
            iconSize={fillHeight ? 22 : 20}
          />
          <View style={[styles.headerText, priceOffer?.original && styles.headerTextWithDiscount]}>
            <View style={styles.titleRow}>
              <Text style={leadStyle}>{program.name}</Text>
              {program.catalogNameTag ? <Text style={tagStyle}>{program.catalogNameTag}</Text> : null}
            </View>
            {hasDetails || showExampleDay ? (
              <View style={styles.metaLinks}>
                {hasDetails ? (
                  <Pressable
                    onPress={() => setInfoOpen(true)}
                    accessibilityRole="button"
                    accessibilityLabel={`Más información sobre ${program.name}`}
                    style={({ pressed }) => [styles.moreInfoBtn, pressed && styles.moreInfoBtnPressed]}
                  >
                    <AppIcon name="info" size={14} color={linkIconColor} />
                    <Text style={linkTextStyle}>Más información</Text>
                  </Pressable>
                ) : null}
                {showExampleDay ? (
                  <Pressable
                    onPress={() => void openExampleDay()}
                    disabled={exampleLoading}
                    accessibilityRole="button"
                    accessibilityLabel={`Ver un día de ejemplo de ${program.name}`}
                    style={({ pressed }) => [
                      styles.moreInfoBtn,
                      pressed && !exampleLoading && styles.moreInfoBtnPressed,
                      exampleLoading && styles.moreInfoBtnDisabled,
                    ]}
                  >
                    {exampleLoading ? (
                      <AppIcon name="time" size={14} color={linkIconColor} />
                    ) : (
                      <AppIcon name="calendar" size={14} color={linkIconColor} />
                    )}
                    <Text style={linkTextStyle}>Un día de ejemplo</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>

        <Button
          title={buttonTitle}
          size={fillHeight ? 'default' : 'compact'}
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
        title={showRequestAccess ? 'Acceso a la programación' : HYPE_CATALOG_PURCHASE_PENDING_TITLE}
        message={
          showRequestAccess ? CATALOG_ACCESS_REQUEST_MESSAGE : HYPE_CATALOG_PURCHASE_PENDING_MESSAGE
        }
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
    marginBottom: spacing.sm,
    position: 'relative',
  },
  cardFill: {
    flex: 1,
    height: '100%',
    marginBottom: 0,
  },
  innerFill: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardBlue: {
    borderColor: withAlpha(colors.metcon, '66'),
  },
  priceBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(15,20,25,0.72)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
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
    fontSize: 11,
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
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
    paddingRight: 84,
  },
  headerTextWithDiscount: {
    paddingRight: 104,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  leadBlue: {
    ...planBrandCatalogStyles.lead,
    color: colors.metcon,
    textShadowColor: withAlpha(colors.metcon, '55'),
  },
  tagBlue: {
    ...planBrandCatalogStyles.tag,
    color: colors.metcon,
  },
  metaLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4,
  },
  moreInfoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    cursor: 'pointer',
  },
  moreInfoBtnPressed: {
    opacity: 0.8,
  },
  moreInfoBtnDisabled: {
    opacity: 0.55,
  },
  moreInfoBlue: {
    color: withAlpha(colors.metcon, 'CC'),
  },
  button: {
    marginTop: 2,
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
