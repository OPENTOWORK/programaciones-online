import { Redirect } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StoreButton } from '@/components/store/StoreButton';
import { fontUiBold, fontUiRegular, fontUiSemibold } from '@/constants/fonts';
import { storeColors } from '@/constants/storeColors';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { useAuth } from '@/hooks/useAuth';
import { usePrograms } from '@/hooks/usePrograms';
import { usePurchases } from '@/hooks/usePurchases';
import {
  accessiblePrograms,
  currentSubscriptions,
  entitlementSourceLabel,
  formatPurchaseDate,
  purchaseStatusLabel,
  purchaseStoreLabel,
  renewalInfo,
  type StatusTone,
} from '@/lib/iap/entitlements';
import type { PurchaseRecord, UserMessage } from '@/lib/iap/types';

const TONE_COLORS: Record<StatusTone, { text: string; background: string }> = {
  success: { text: storeColors.success, background: storeColors.successSoft },
  warning: { text: storeColors.warning, background: storeColors.warningSoft },
  danger: { text: storeColors.danger, background: storeColors.dangerSoft },
  muted: { text: storeColors.textSecondary, background: storeColors.surface },
};

function subscriptionState(purchase: PurchaseRecord): { label: string; tone: StatusTone } {
  switch (purchase.status) {
    case 'active':
      return purchase.autoRenew === false ? { label: 'Cancelada', tone: 'warning' } : { label: 'Activa', tone: 'success' };
    case 'grace_period':
      return { label: 'Problema con el pago', tone: 'warning' };
    case 'on_hold':
      return { label: 'Suspendida', tone: 'danger' };
    case 'paused':
      return { label: 'En pausa', tone: 'muted' };
    case 'pending':
      return { label: 'Pago pendiente', tone: 'warning' };
    default:
      return purchaseStatusLabel(purchase);
  }
}

function StatusPill({ label, tone }: { label: string; tone: StatusTone }) {
  const colors = TONE_COLORS[tone];
  return (
    <View style={[styles.status, { backgroundColor: colors.background }]}>
      <Text style={[styles.statusText, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

export default function MyPurchasesScreen() {
  const insets = useSafeAreaInsets();
  const router = useAppNavigation();
  const { user, isLoading: authLoading } = useAuth();
  const { getById } = usePrograms();
  const {
    catalog,
    snapshot,
    storeReady,
    currentStore,
    isLoading,
    isRestoring,
    restore,
    refresh,
    manageSubscriptions,
    requestRefund,
  } = usePurchases();
  const [notice, setNotice] = useState<UserMessage | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const purchases = snapshot?.purchases ?? [];
  const subscriptions = currentSubscriptions(purchases);
  const history = purchases.filter((purchase) => !subscriptions.includes(purchase));
  const access = accessiblePrograms(snapshot?.entitlements ?? []);
  const manageableHere = subscriptions.some((purchase) => purchase.store === currentStore);

  if (!user && !authLoading) {
    return <Redirect href="/auth/login" />;
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh().catch(() => undefined);
    setRefreshing(false);
  };

  const programName = (programId: string, productKey: string | null) =>
    getById(programId)?.name ?? catalog.find((product) => product.productKey === productKey)?.title ?? 'Programación';

  const openProgram = (programId: string) => router.push(`/program/${programId}`);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void handleRefresh()} tintColor={storeColors.primary} />}
    >
      <Text style={styles.lead}>
        Compras verificadas en tu cuenta. Están disponibles en todos tus dispositivos con la misma cuenta.
      </Text>

      {isLoading && !snapshot ? <ActivityIndicator color={storeColors.primary} style={styles.loader} /> : null}

      {!isLoading && purchases.length === 0 && access.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Aún no tienes compras</Text>
          <Text style={styles.emptyText}>
            Si contrataste algo con esta cuenta y no aparece aquí, pulsa «Restaurar compras» desde el móvil con el que pagaste.
          </Text>
        </View>
      ) : null}

      {subscriptions.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suscripciones activas</Text>
          {subscriptions.map((purchase) => {
            const product = catalog.find((item) => item.productKey === purchase.productKey);
            const programId = product?.programIds[0];
            const renewal = renewalInfo(purchase);
            const store = purchaseStoreLabel(purchase);
            const manageHere = purchase.store === currentStore && storeReady;
            return (
              <View key={purchase.id} style={styles.row}>
                <View style={styles.rowHeader}>
                  <Text style={styles.rowTitle}>{purchase.title ?? product?.title ?? purchase.productId}</Text>
                  <StatusPill {...subscriptionState(purchase)} />
                </View>
                {renewal ? (
                  <Text style={styles.detail}>
                    {renewal.label === 'Próxima renovación' ? `Próxima renovación: ${renewal.date}` : `${renewal.label} ${renewal.date}`}
                  </Text>
                ) : null}
                {purchase.status === 'on_hold' ? (
                  <Text style={styles.detail}>Actualiza tu método de pago en {store} para recuperar el acceso.</Text>
                ) : null}
                <Text style={styles.meta}>
                  Contratada en {store}
                  {purchase.purchasedAt ? ` · ${formatPurchaseDate(purchase.purchasedAt)}` : ''}
                  {purchase.environment === 'sandbox' ? ' · Prueba' : ''}
                </Text>
                {programId && purchase.status !== 'on_hold' && purchase.status !== 'pending' ? (
                  <StoreButton title="Abrir programación" onPress={() => openProgram(programId)} />
                ) : null}
                {manageHere ? (
                  <StoreButton title="Gestionar suscripción" tone="outline" onPress={() => void manageSubscriptions(product)} />
                ) : (
                  <Text style={styles.meta}>Se gestiona o cancela desde {store}, con la cuenta con la que la contrataste.</Text>
                )}
                {/* Apple solo genera reembolsos de Sandbox desde la hoja de StoreKit. */}
                {manageHere && product && purchase.store === 'app_store' && purchase.environment === 'sandbox' ? (
                  <StoreButton
                    title="Solicitar un reembolso (prueba)"
                    tone="ghost"
                    onPress={() => void requestRefund(product).then((message) => message && setNotice(message))}
                  />
                ) : null}
              </View>
            );
          })}
        </View>
      ) : null}

      {access.length > 0 ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.sectionTitleSecondary]}>Programaciones con acceso</Text>
          {access.map((item) => (
            <View key={item.programId} style={styles.row}>
              <View style={styles.rowHeader}>
                <Text style={styles.rowTitle}>{programName(item.programId, item.productKey)}</Text>
                <StatusPill label="Con acceso" tone="success" />
              </View>
              <Text style={styles.meta}>
                {entitlementSourceLabel(item.source)}
                {item.expiresAt ? ` · hasta el ${formatPurchaseDate(item.expiresAt)}` : ''}
              </Text>
              <StoreButton title="Abrir" tone="outline" onPress={() => openProgram(item.programId)} />
            </View>
          ))}
        </View>
      ) : null}

      {history.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitleMuted}>Historial</Text>
          {history.map((purchase) => {
            const product = catalog.find((item) => item.productKey === purchase.productKey);
            return (
              <View key={purchase.id} style={styles.row}>
                <View style={styles.rowHeader}>
                  <Text style={styles.rowTitle}>{purchase.title ?? product?.title ?? purchase.productId}</Text>
                  <StatusPill {...purchaseStatusLabel(purchase)} />
                </View>
                <Text style={styles.meta}>
                  {purchase.productType === 'subscription' ? 'Suscripción' : 'Programación'} · {purchaseStoreLabel(purchase)}
                  {purchase.purchasedAt ? ` · ${formatPurchaseDate(purchase.purchasedAt)}` : ''}
                  {purchase.environment === 'sandbox' ? ' · Prueba' : ''}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}

      {notice ? (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>{notice.title}</Text>
          <Text style={styles.noticeText}>{notice.message}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        {storeReady ? (
          <StoreButton
            title="Restaurar compras"
            loading={isRestoring}
            disabled={isRestoring}
            onPress={() => void restore().then(setNotice)}
          />
        ) : null}
        {storeReady && manageableHere ? (
          <StoreButton title="Gestionar suscripciones" tone="ghost" onPress={() => void manageSubscriptions()} />
        ) : null}
        {catalog.length > 0 ? (
          <StoreButton title="Ir a la tienda" tone="outline" onPress={() => router.push('/store')} />
        ) : null}
      </View>

      <Text style={styles.footnote}>
        Las suscripciones se cancelan desde la tienda donde se contrataron (Google Play o App Store); el acceso se mantiene
        hasta el final del periodo pagado. Eliminar tu cuenta no cancela una suscripción activa.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: storeColors.background,
  },
  content: {
    padding: 20,
    gap: 14,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  lead: {
    fontFamily: fontUiRegular,
    fontWeight: 'normal',
    fontSize: 14,
    lineHeight: 21,
    color: storeColors.textSecondary,
  },
  loader: { marginVertical: 24 },
  empty: {
    gap: 6,
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: fontUiSemibold,
    fontWeight: 'normal',
    fontSize: 16,
    lineHeight: 22,
    color: storeColors.text,
  },
  emptyText: {
    fontFamily: fontUiRegular,
    fontWeight: 'normal',
    fontSize: 14,
    lineHeight: 20,
    color: storeColors.textSecondary,
    textAlign: 'center',
  },
  section: { gap: 10 },
  sectionTitle: {
    fontFamily: fontUiBold,
    fontWeight: 'normal',
    fontSize: 17,
    lineHeight: 23,
    color: storeColors.primaryInk,
  },
  sectionTitleSecondary: { color: storeColors.secondaryInk },
  sectionTitleMuted: {
    fontFamily: fontUiBold,
    fontWeight: 'normal',
    fontSize: 17,
    lineHeight: 23,
    color: storeColors.textSecondary,
  },
  row: {
    borderWidth: 1,
    borderColor: storeColors.border,
    borderRadius: 14,
    padding: 14,
    gap: 8,
    backgroundColor: storeColors.background,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  rowTitle: {
    flexShrink: 1,
    fontFamily: fontUiBold,
    fontWeight: 'normal',
    fontSize: 16,
    lineHeight: 22,
    color: storeColors.text,
  },
  status: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontFamily: fontUiSemibold,
    fontWeight: 'normal',
    fontSize: 12,
    lineHeight: 16,
  },
  detail: {
    fontFamily: fontUiSemibold,
    fontWeight: 'normal',
    fontSize: 14,
    lineHeight: 19,
    color: storeColors.text,
  },
  meta: {
    fontFamily: fontUiRegular,
    fontWeight: 'normal',
    fontSize: 13,
    lineHeight: 18,
    color: storeColors.textMuted,
  },
  notice: {
    backgroundColor: storeColors.surface,
    borderWidth: 1,
    borderColor: storeColors.border,
    borderRadius: 12,
    padding: 12,
    gap: 2,
  },
  noticeTitle: {
    fontFamily: fontUiSemibold,
    fontWeight: 'normal',
    fontSize: 14,
    lineHeight: 19,
    color: storeColors.text,
  },
  noticeText: {
    fontFamily: fontUiRegular,
    fontWeight: 'normal',
    fontSize: 13,
    lineHeight: 19,
    color: storeColors.textSecondary,
  },
  actions: { gap: 10, marginTop: 6 },
  footnote: {
    fontFamily: fontUiRegular,
    fontWeight: 'normal',
    fontSize: 12,
    lineHeight: 18,
    color: storeColors.textMuted,
  },
});
