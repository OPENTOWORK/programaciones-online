import { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { useAthletePreviewMode } from '@/hooks/useAthletePreviewMode';

import { PlanBrandSilverIcon } from '@/components/program/planBrandUi';
import { ProgramPurchaseSheet } from '@/components/store/ProgramPurchaseSheet';
import { AppIcon } from '@/components/ui/AppIcon';
import { fontSportBold, fontUiBold, fontUiRegular, fontUiSemibold } from '@/constants/fonts';
import { borderRadius, spacing, colors, brandColor, brandColors, withAlpha } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { usePrograms } from '@/hooks/usePrograms';
import { usePurchases } from '@/hooks/usePurchases';
import { isAdminRole, isTrainerRole } from '@/lib/athleteService';
import { priceWithPeriod } from '@/lib/iap/entitlements';
import { ensureHypeWeeklyChallengeProgram, ensureVenueCatalogProgram } from '@/lib/programEditService';
import {
  canEnterHypeCatalogProgram,
  isHypeWeeklyChallengePlaceholder,
  isPaidHypeCatalogProgram,
} from '@/lib/hypeCatalog';
import { isVenuePlaceholderProgram } from '@/lib/standardVenueCatalog';
import { CATALOG_ACCESS_REQUEST_MESSAGE } from '@/lib/storeCompliance';
import type { Program } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface ProgramCardProps {
  program: Program;
  /** Una programación ocupa toda la página y se desliza en horizontal. */
  layout?: 'compact' | 'page';
}

const CATALOG_ICON_SIZE = 44;

const CATALOG_BLURBS: Array<[string, string]> = [
  ['basico', 'Construye una base sólida de fuerza y condición física.'],
  ['calistenia', 'Domina tu cuerpo, mejora tu fuerza y desarrolla nuevas habilidades.'],
  ['athx', 'Entrenamiento híbrido de fuerza, resistencia y rendimiento.'],
  ['crosstraining', 'Mejora tu capacidad física con entrenamientos variados e intensos.'],
  ['hype', 'Entrena con intensidad, supera tus límites y mejora tu rendimiento.'],
  ['hyrox', 'Prepárate para combinar carrera, fuerza y resistencia.'],
];

function foldCatalogName(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function catalogSummary(program: Program) {
  const existing = program.description?.trim();
  if (existing) return existing;

  const folded = foldCatalogName(program.name);
  const match = CATALOG_BLURBS.find(([key]) => folded === key || folded.startsWith(`${key} `));
  return match?.[1] ?? '';
}

export function ProgramCard({ program, layout = 'compact' }: ProgramCardProps) {
  const router = useAppNavigation();
  const preview = useAthletePreviewMode();
  const viewingAsAthlete = preview.enabled;
  const { user } = useAuth();
  const { refresh } = usePrograms();
  const purchases = usePurchases();
  const isAdmin = !viewingAsAthlete && isAdminRole(user?.role);
  const isStaff = !viewingAsAthlete && isTrainerRole(user?.role);
  const isPaidCatalog = isPaidHypeCatalogProgram(program);
  const isComingSoon = isVenuePlaceholderProgram(program);
  const isWeeklyChallengePlaceholder = isHypeWeeklyChallengePlaceholder(program);
  const isPlaceholder = isComingSoon || isWeeklyChallengePlaceholder;
  const canManagePlaceholder = isPlaceholder && (isPaidCatalog ? isAdmin : isStaff);
  // Solo cuenta el derecho que el servidor ha verificado con la tienda.
  const storeProducts = isPaidCatalog ? purchases.productsForProgram(program.id) : [];
  const soldInStore = storeProducts.length > 0;
  const isEntitled = isPaidCatalog && purchases.hasProgramEntitlement(program.id);
  const canEnter = !isPaidCatalog || canEnterHypeCatalogProgram(user?.role) || isEntitled;
  const showStoreBuy = soldInStore && !isEntitled && !isAdmin;
  // Solo se vende lo que tiene producto en la tienda; el resto no muestra precio ni botón de compra.
  const showRequestAccess = isPaidCatalog && !canEnter && !soldInStore;
  const isLocked = !isPaidCatalog && program.status === 'bloqueada' && !canManagePlaceholder;
  const [creating, setCreating] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [storeSheetOpen, setStoreSheetOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const hasDetails = Boolean(
    program.description || program.catalogDesignedFor || program.catalogMonitor || program.equipment.length > 0,
  );
  const storeOffer = storeProducts
    .map((product) => purchases.offers.get(product.productKey))
    .find((offer) => offer !== undefined);
  // El único precio que se muestra es el que devuelve la tienda para un producto a la venta.
  const priceOffer: { current: string; original?: string; discountPercent?: number } | null =
    !isEntitled && soldInStore && storeOffer
      ? { current: priceWithPeriod(storeOffer.displayPrice, storeOffer.period) }
      : null;

  const handlePress = async () => {
    if (showStoreBuy) {
      setStoreSheetOpen(true);
      return;
    }

    if (showRequestAccess) {
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
    : showStoreBuy
      ? storeProducts.some((product) => product.productType === 'non_consumable')
        ? 'Comprar programación'
        : 'Suscribirme'
      : showRequestAccess
        ? 'Cómo conseguir acceso'
        : isPlaceholder
          ? 'Próximamente'
          : isLocked
            ? 'Bloqueada'
            : 'Ver programación';

  const actionDisabled =
    creating ||
    (!showRequestAccess && !showStoreBuy && (isLocked || (isPlaceholder && !canManagePlaceholder)));
  const showExampleDay = !isPlaceholder;
  const summary = catalogSummary(program);
  const cardEnabled = !actionDisabled;

  const openSampleWeek = () => {
    router.push({
      pathname: '/program/[id]',
      params: { id: program.id, sample: '1' },
    });
  };

  const page = layout === 'page';

  return (
    <View style={page ? styles.pageRoot : undefined}>
    <View style={[styles.card, page && styles.cardPage]}>
      {page ? <View style={styles.pageShift} /> : null}
      <Pressable
        onPress={cardEnabled ? () => void handlePress() : undefined}
        disabled={!cardEnabled}
        accessibilityRole="button"
        accessibilityLabel={program.name}
        accessibilityState={{ disabled: !cardEnabled }}
        style={({ pressed }) => [styles.top, page && styles.topPage, pressed && cardEnabled && styles.cardPressed]}
      >
        {page ? null : (
          <PlanBrandSilverIcon name={program.icon} size={CATALOG_ICON_SIZE} iconSize={22} />
        )}
        <View style={[styles.copy, page && styles.copyPage]}>
          <View style={[styles.titleRow, page && styles.titleRowPage]}>
            <Text style={[styles.name, page && styles.namePage]}>{program.name}</Text>
            {program.catalogNameTag ? (
              <Text style={[styles.tag, page && styles.tagPage]}>{program.catalogNameTag}</Text>
            ) : null}
          </View>
          {summary ? (
            <Text style={[styles.summary, page && styles.summaryPage]} numberOfLines={page ? 4 : 2}>
              {summary}
            </Text>
          ) : null}
        </View>
        {!page && isEntitled ? (
          <View style={styles.priceBadge}>
            <Text style={styles.price}>Adquirida</Text>
          </View>
        ) : null}
        {!page && priceOffer ? (
          <View style={styles.priceBadge}>
            {priceOffer.original ? <Text style={styles.priceOld}>{priceOffer.original}</Text> : null}
            <Text style={styles.price}>{priceOffer.current}</Text>
            {priceOffer.discountPercent ? (
              <Text style={styles.priceDiscount}>-{priceOffer.discountPercent}%</Text>
            ) : null}
          </View>
        ) : null}
      </Pressable>

      {hasDetails || showExampleDay ? (
        <View style={[styles.metaLinks, page && styles.metaLinksPage]}>
          {hasDetails ? (
            <Pressable
              onPress={() => setInfoOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={`Más información sobre ${program.name}`}
              style={({ pressed }) => [styles.metaBtn, pressed && styles.metaBtnPressed]}
            >
              <AppIcon name="info" size={13} color={brandColor('tag', withAlpha(brandColors.orangeSecondary, 'CC'))} />
              <Text style={styles.metaText}>Más información</Text>
            </Pressable>
          ) : null}
          {showExampleDay ? (
            <Pressable
              onPress={openSampleWeek}
              accessibilityRole="button"
              accessibilityLabel={`Ver la semana de prueba de ${program.name}`}
              style={({ pressed }) => [styles.metaBtn, pressed && styles.metaBtnPressed]}
            >
              <AppIcon name="calendar" size={13} color={brandColor('trial', colors.success)} />
              <Text style={styles.metaTextTrial}>Semana de prueba</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      {page ? (
        <View style={styles.pageRest}>
          {isEntitled ? (
            <View style={styles.priceBadgePage}>
              <Text style={styles.priceDiscountPage}>Adquirida</Text>
            </View>
          ) : null}
          {priceOffer ? (
            <View style={styles.priceBadgePage}>
              {priceOffer.original ? <Text style={styles.priceOldPage}>{priceOffer.original}</Text> : null}
              <Text style={styles.pricePage}>{priceOffer.current}</Text>
              {priceOffer.discountPercent ? (
                <Text style={styles.priceDiscountPage}>-{priceOffer.discountPercent}%</Text>
              ) : null}
            </View>
          ) : null}
        </View>
      ) : null}

      <Button
        title={buttonTitle}
        size="compact"
        onPress={() => void handlePress()}
        variant={actionDisabled ? 'secondary' : 'primary'}
        disabled={actionDisabled}
        loading={creating}
        style={
          actionDisabled
            ? styles.buttonDisabled
            : page
              ? { ...styles.button, ...styles.buttonPage }
              : styles.button
        }
        textStyle={
          actionDisabled
            ? styles.buttonDisabledText
            : page
              ? { ...styles.buttonText, ...styles.buttonTextPage }
              : styles.buttonText
        }
      />
    </View>

      <ProgramDetailsModal visible={infoOpen} program={program} onClose={() => setInfoOpen(false)} />
      {soldInStore ? (
        <ProgramPurchaseSheet
          visible={storeSheetOpen}
          programId={program.id}
          programName={program.name}
          onClose={() => setStoreSheetOpen(false)}
          onOpenProgram={() => {
            setStoreSheetOpen(false);
            router.push(`/program/${program.id}`);
          }}
        />
      ) : null}
      <ConfirmModal
        visible={purchaseOpen}
        title="Acceso a la programación"
        message={CATALOG_ACCESS_REQUEST_MESSAGE}
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

          <Button
            title="Cerrar"
            variant="secondary"
            onPress={onClose}
            style={modalStyles.closeBtn}
            textStyle={styles.buttonDisabledText}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const PRICE_GREEN = '#4ADE80';

const styles = StyleSheet.create({
  pageRoot: {
    flex: 1,
    height: '100%',
  },
  card: {
    backgroundColor: brandColor('card', colors.black),
    borderWidth: 1,
    borderColor: brandColor('cardBorder', '#2C313A'),
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
    cursor: 'pointer',
  },
  cardPage: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 18,
    paddingVertical: 22,
    gap: 18,
  },
  cardPressed: {
    opacity: 0.86,
  },
  top: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: 10,
  },
  topPage: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 14,
  },
  pageShift: {
    flex: 0.62,
  },
  pageRest: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 16,
  },
  copy: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 150,
    minWidth: 0,
    gap: 6,
  },
  copyPage: {
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: 'auto',
    width: '100%',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  titleRowPage: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontFamily: fontSportBold,
    fontWeight: 'normal',
    color: brandColor('title', brandColors.orangeHighlight),
    fontSize: 19,
    lineHeight: 24,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    flexShrink: 1,
    maxWidth: '100%',
  },
  namePage: {
    color: brandColor('title', '#FF6A40'),
    fontSize: 40,
    lineHeight: 46,
    textAlign: 'center',
  },
  tag: {
    fontFamily: fontUiSemibold,
    fontWeight: 'normal',
    color: brandColor('tag', brandColors.orangeSecondary),
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  tagPage: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  summary: {
    fontFamily: fontUiRegular,
    fontWeight: 'normal',
    color: brandColor('body', '#C5CAD3'),
    fontSize: 13,
    lineHeight: 18,
  },
  summaryPage: {
    width: '100%',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  priceBadge: {
    flexShrink: 0,
    alignSelf: 'flex-start',
    marginLeft: 'auto',
    maxWidth: 140,
    backgroundColor: brandColor('pill', 'rgba(15, 20, 25, 0.9)'),
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
    alignItems: 'flex-end',
    gap: 1,
    borderWidth: 1,
    borderColor: brandColor('pillBorder', `${PRICE_GREEN}66`),
  },
  priceBadgePage: {
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 2,
  },
  pricePage: {
    fontFamily: fontUiBold,
    fontWeight: 'normal',
    color: brandColor('price', '#00E5FF'),
    fontSize: 22,
    lineHeight: 28,
    textAlign: 'center',
  },
  priceOldPage: {
    fontFamily: fontUiRegular,
    fontWeight: 'normal',
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 18,
    textDecorationLine: 'line-through',
    textAlign: 'center',
  },
  priceDiscountPage: {
    fontFamily: fontUiBold,
    fontWeight: 'normal',
    color: brandColor('price', PRICE_GREEN),
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
  },
  price: {
    fontFamily: fontUiBold,
    fontWeight: 'normal',
    color: brandColor('price', PRICE_GREEN),
    fontSize: 13,
    lineHeight: 16,
    textAlign: 'right',
  },
  priceOld: {
    fontFamily: fontUiRegular,
    fontWeight: 'normal',
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 15,
    textDecorationLine: 'line-through',
    textAlign: 'right',
  },
  priceDiscount: {
    fontFamily: fontUiBold,
    fontWeight: 'normal',
    color: brandColor('price', PRICE_GREEN),
    fontSize: 12,
    lineHeight: 15,
  },
  metaLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  metaLinksPage: {
    justifyContent: 'center',
    alignSelf: 'center',
  },
  metaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    cursor: 'pointer',
  },
  metaBtnPressed: {
    opacity: 0.7,
  },
  metaText: {
    fontFamily: fontUiSemibold,
    fontWeight: 'normal',
    color: brandColor('tag', withAlpha(brandColors.orangeSecondary, 'CC')),
    fontSize: 12,
    lineHeight: 16,
  },
  metaTextTrial: {
    fontFamily: fontUiSemibold,
    fontWeight: 'normal',
    color: brandColor('trial', colors.success),
    fontSize: 12,
    lineHeight: 16,
  },
  button: {
    backgroundColor: brandColor('action', brandColors.orangeAction),
    borderColor: brandColor('action', brandColors.orangeAction),
    borderRadius: 12,
    minHeight: 40,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    fontFamily: fontUiBold,
    fontWeight: 'normal',
    color: colors.black,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  buttonPage: {
    minHeight: 48,
    backgroundColor: brandColor('action', '#FF6A40'),
    borderColor: brandColor('action', '#FF6A40'),
  },
  buttonTextPage: {
    fontSize: 16,
    lineHeight: 20,
  },
  buttonDisabled: {
    borderRadius: 12,
    minHeight: 40,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonDisabledText: {
    fontFamily: fontUiBold,
    fontWeight: 'normal',
    fontSize: 14,
    lineHeight: 18,
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
    fontFamily: fontSportBold,
    fontWeight: 'normal',
    color: brandColor('title', brandColors.orangeHighlight),
    fontSize: 22,
    lineHeight: 26,
    textTransform: 'uppercase',
  },
  tag: {
    fontFamily: fontUiSemibold,
    fontWeight: 'normal',
    color: brandColor('tag', brandColors.orangeSecondary),
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: -spacing.sm,
  },
  description: {
    fontFamily: fontUiRegular,
    fontWeight: 'normal',
    color: brandColor('body', '#C5CAD3'),
    fontSize: 14,
    lineHeight: 20,
  },
  block: {
    gap: 4,
  },
  label: {
    fontFamily: fontUiSemibold,
    fontWeight: 'normal',
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontFamily: fontUiRegular,
    fontWeight: 'normal',
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  closeBtn: {
    marginTop: spacing.xs,
  },
});
