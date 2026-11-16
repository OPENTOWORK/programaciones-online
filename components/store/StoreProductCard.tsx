import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { StoreButton } from '@/components/store/StoreButton';
import { AppIcon } from '@/components/ui/AppIcon';
import { fontUiBold, fontUiRegular, fontUiSemibold } from '@/constants/fonts';
import { storeColors } from '@/constants/storeColors';
import { billingPeriodLabel, entitlementSourceLabel, priceWithPeriod, renewalInfo } from '@/lib/iap/entitlements';
import type { ProductOwnership, PurchaseProgress, PurchaseRecord, StoreCatalogProduct, StoreOffer } from '@/lib/iap/types';

const STORE_NAME = Platform.OS === 'ios' ? 'App Store' : 'Google Play';

/** Condiciones de renovación que las tiendas exigen mostrar antes de suscribirse. */
export function subscriptionTerms(offer?: StoreOffer) {
  const period = billingPeriodLabel(offer?.period ?? null);
  const price = offer && period ? ` (${offer.displayPrice} ${period})` : '';
  return `Suscripción con renovación automática${price}. El cargo se hace en tu cuenta de ${STORE_NAME} al confirmar y se renueva sola salvo que la canceles al menos 24 horas antes de que termine el periodo. Puedes gestionarla o cancelarla cuando quieras desde tu cuenta de ${STORE_NAME}.`;
}

function subscriptionBadge(purchase: PurchaseRecord | null): { label: string; warning: boolean } {
  if (purchase?.status === 'grace_period') return { label: 'Problema con el pago', warning: true };
  if (purchase?.status === 'active' && purchase.autoRenew === false) return { label: 'Cancelada', warning: true };
  return { label: 'Suscripción activa', warning: false };
}

interface StoreProductCardProps {
  product: StoreCatalogProduct;
  offer?: StoreOffer;
  ownership: ProductOwnership;
  progress?: PurchaseProgress;
  /** La tienda del dispositivo está conectada. En la web solo se informa. */
  storeReady: boolean;
  onBuy: () => void;
  onManage?: () => void;
  onOpenProgram?: () => void;
  onDismiss?: () => void;
}

export function StoreProductCard({
  product,
  offer,
  ownership,
  progress,
  storeReady,
  onBuy,
  onManage,
  onOpenProgram,
  onDismiss,
}: StoreProductCardProps) {
  const isSubscription = product.productType === 'subscription';
  const busy = progress?.kind === 'purchasing';
  const hasAccess = ownership.kind !== 'none';

  return (
    <View style={[styles.card, hasAccess && styles.cardOwned]}>
      <View style={styles.header}>
        <Text style={styles.title}>{product.title}</Text>
        <View style={styles.pills}>
          {product.testOnly ? (
            <View style={[styles.kind, styles.kindTesting]}>
              <Text style={[styles.kindText, styles.kindTextTesting]}>Solo pruebas</Text>
            </View>
          ) : null}
          <View style={[styles.kind, isSubscription ? styles.kindSubscription : styles.kindProgram]}>
            <Text style={[styles.kindText, isSubscription ? styles.kindTextSubscription : styles.kindTextProgram]}>
              {isSubscription ? 'Suscripción' : 'Programación'}
            </Text>
          </View>
        </View>
      </View>

      {product.description ? <Text style={styles.description}>{product.description}</Text> : null}

      {product.benefits.length > 0 ? (
        <View style={styles.benefits}>
          <Text style={styles.benefitsTitle}>Incluye</Text>
          {product.benefits.map((benefit) => (
            <View key={benefit} style={styles.benefitRow}>
              <AppIcon name="check" size={16} color={storeColors.primary} />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {offer && !hasAccess ? <Text style={styles.price}>{priceWithPeriod(offer.displayPrice, offer.period)}</Text> : null}

      {isSubscription && offer && !hasAccess ? <Text style={styles.terms}>{subscriptionTerms(offer)}</Text> : null}

      <StatusArea progress={progress} onDismiss={onDismiss} />

      {ownership.kind === 'owned' ? (
        <OwnedArea
          isSubscription={isSubscription}
          ownership={ownership}
          canManage={ownership.manageable && storeReady && Boolean(onManage)}
          onManage={onManage}
          onOpenProgram={onOpenProgram}
        />
      ) : ownership.kind === 'covered' ? (
        <View style={styles.ownedRow}>
          <View style={styles.ownedBadge}>
            <AppIcon name="check" size={16} color={storeColors.success} />
            <Text style={styles.ownedText}>Ya tienes acceso</Text>
          </View>
          <Text style={styles.ownedMeta}>Tu cuenta ya tiene acceso a esta programación: no hace falta contratarla.</Text>
          {onOpenProgram ? <StoreButton title="Abrir programación" onPress={onOpenProgram} /> : null}
        </View>
      ) : !storeReady ? (
        <Text style={styles.unavailable}>
          {Platform.OS === 'web'
            ? 'Se contrata desde la app de Training ProgLine para Android o iPhone.'
            : `No hay conexión con ${STORE_NAME} en este momento.`}
        </Text>
      ) : !offer ? (
        <Text style={styles.unavailable}>Todavía no está disponible en {STORE_NAME}.</Text>
      ) : progress?.kind === 'verifying' || progress?.kind === 'pending' ? null : (
        <StoreButton
          title={isSubscription ? 'Suscribirme' : 'Comprar programación'}
          onPress={onBuy}
          loading={busy}
          disabled={busy}
        />
      )}
    </View>
  );
}

function OwnedArea({
  isSubscription,
  ownership,
  canManage,
  onManage,
  onOpenProgram,
}: {
  isSubscription: boolean;
  ownership: Extract<ProductOwnership, { kind: 'owned' }>;
  canManage: boolean;
  onManage?: () => void;
  onOpenProgram?: () => void;
}) {
  const badge = isSubscription ? subscriptionBadge(ownership.purchase) : { label: 'Adquirida', warning: false };
  const renewal = ownership.purchase ? renewalInfo(ownership.purchase) : null;
  const origin = entitlementSourceLabel(ownership.source);
  const fromStore = ownership.source === 'google_play' || ownership.source === 'app_store';

  return (
    <View style={styles.ownedRow}>
      <View style={[styles.ownedBadge, badge.warning && styles.ownedBadgeWarning]}>
        <AppIcon name={badge.warning ? 'time' : 'check'} size={16} color={badge.warning ? storeColors.warning : storeColors.success} />
        <Text style={[styles.ownedText, badge.warning && styles.ownedTextWarning]}>{badge.label}</Text>
      </View>
      {renewal ? (
        <Text style={styles.ownedMeta}>
          {renewal.label === 'Próxima renovación' ? `Próxima renovación: ${renewal.date}` : `${renewal.label} ${renewal.date}`}
        </Text>
      ) : null}
      <Text style={styles.ownedMeta}>{fromStore ? `Contratada en ${origin}` : origin}</Text>
      {onOpenProgram ? <StoreButton title="Abrir programación" onPress={onOpenProgram} /> : null}
      {canManage && onManage ? (
        <StoreButton title="Gestionar suscripción" tone="outline" onPress={onManage} style={styles.manageButton} />
      ) : isSubscription && fromStore && !ownership.manageable ? (
        <Text style={styles.unavailable}>
          El cobro lo gestiona {origin}: para cambiarla o cancelarla, entra en {origin} con la cuenta con la que la contrataste.
        </Text>
      ) : null}
    </View>
  );
}

function StatusArea({ progress, onDismiss }: { progress?: PurchaseProgress; onDismiss?: () => void }) {
  if (!progress || progress.kind === 'purchasing') return null;

  if (progress.kind === 'verifying') {
    return (
      <View style={[styles.status, styles.statusInfo]}>
        <ActivityIndicator color={storeColors.primary} size="small" />
        <Text style={styles.statusText}>Verificando la compra con la tienda… El acceso se activará en cuanto se confirme.</Text>
      </View>
    );
  }

  if (progress.kind === 'pending') {
    return (
      <View style={[styles.status, styles.statusWarning]}>
        <AppIcon name="time" size={18} color={storeColors.warning} />
        <Text style={styles.statusText}>
          Pago pendiente. Te daremos acceso automáticamente cuando la tienda lo confirme; no hace falta volver a comprar.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.status, styles.statusDanger]}>
      <View style={styles.statusCopy}>
        <Text style={styles.statusTitle}>{progress.title}</Text>
        <Text style={styles.statusText}>{progress.message}</Text>
      </View>
      {onDismiss ? (
        <Pressable onPress={onDismiss} accessibilityRole="button" accessibilityLabel="Cerrar aviso" hitSlop={8}>
          <AppIcon name="close" size={18} color={storeColors.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: storeColors.background,
    borderWidth: 1,
    borderColor: storeColors.border,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  cardOwned: {
    borderColor: storeColors.success,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  title: {
    flex: 1,
    fontFamily: fontUiBold,
    fontWeight: 'normal',
    fontSize: 18,
    lineHeight: 24,
    color: storeColors.text,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 6,
    flexShrink: 1,
  },
  kind: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  kindProgram: { backgroundColor: storeColors.primarySoft },
  kindSubscription: { backgroundColor: storeColors.secondarySoft },
  kindTesting: { backgroundColor: storeColors.warningSoft },
  kindText: {
    fontFamily: fontUiSemibold,
    fontWeight: 'normal',
    fontSize: 12,
    lineHeight: 16,
  },
  kindTextProgram: { color: storeColors.primaryInk },
  kindTextSubscription: { color: storeColors.secondaryInk },
  kindTextTesting: { color: storeColors.warning },
  description: {
    fontFamily: fontUiRegular,
    fontWeight: 'normal',
    fontSize: 14,
    lineHeight: 21,
    color: storeColors.textSecondary,
  },
  benefits: { gap: 6 },
  benefitsTitle: {
    fontFamily: fontUiSemibold,
    fontWeight: 'normal',
    fontSize: 13,
    lineHeight: 18,
    color: storeColors.text,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  benefitText: {
    flex: 1,
    fontFamily: fontUiRegular,
    fontWeight: 'normal',
    fontSize: 14,
    lineHeight: 20,
    color: storeColors.text,
  },
  price: {
    fontFamily: fontUiBold,
    fontWeight: 'normal',
    fontSize: 22,
    lineHeight: 28,
    color: storeColors.primaryInk,
  },
  terms: {
    fontFamily: fontUiRegular,
    fontWeight: 'normal',
    fontSize: 12,
    lineHeight: 18,
    color: storeColors.textMuted,
  },
  ownedRow: { gap: 10 },
  ownedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: storeColors.successSoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  ownedBadgeWarning: { backgroundColor: storeColors.warningSoft },
  ownedText: {
    fontFamily: fontUiSemibold,
    fontWeight: 'normal',
    fontSize: 14,
    lineHeight: 18,
    color: storeColors.success,
  },
  ownedTextWarning: { color: storeColors.warning },
  ownedMeta: {
    fontFamily: fontUiRegular,
    fontWeight: 'normal',
    fontSize: 13,
    lineHeight: 19,
    color: storeColors.text,
  },
  manageButton: { marginTop: 0 },
  unavailable: {
    fontFamily: fontUiRegular,
    fontWeight: 'normal',
    fontSize: 13,
    lineHeight: 19,
    color: storeColors.textSecondary,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 12,
    padding: 12,
  },
  statusInfo: { backgroundColor: storeColors.primarySoft },
  statusWarning: { backgroundColor: storeColors.warningSoft },
  statusDanger: { backgroundColor: storeColors.dangerSoft },
  statusCopy: { flex: 1, gap: 2 },
  statusTitle: {
    fontFamily: fontUiSemibold,
    fontWeight: 'normal',
    fontSize: 14,
    lineHeight: 19,
    color: storeColors.text,
  },
  statusText: {
    flex: 1,
    fontFamily: fontUiRegular,
    fontWeight: 'normal',
    fontSize: 13,
    lineHeight: 19,
    color: storeColors.text,
  },
});
