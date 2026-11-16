import { Redirect } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StoreButton } from '@/components/store/StoreButton';
import { StoreLegalFooter } from '@/components/store/StoreLegalFooter';
import { StoreProductCard } from '@/components/store/StoreProductCard';
import { fontUiBold, fontUiRegular, fontUiSemibold } from '@/constants/fonts';
import { storeColors } from '@/constants/storeColors';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { useAuth } from '@/hooks/useAuth';
import { usePurchases } from '@/hooks/usePurchases';
import { STORE_ON_WEB_MESSAGE } from '@/lib/iap/messages';
import type { StoreCatalogProduct, UserMessage } from '@/lib/iap/types';

const STORE_NAME = Platform.OS === 'ios' ? 'App Store' : 'Google Play';

export default function StoreScreen() {
  const insets = useSafeAreaInsets();
  const router = useAppNavigation();
  const { user, isLoading: authLoading } = useAuth();
  const {
    catalog,
    offers,
    progress,
    storeReady,
    isLoading,
    isRestoring,
    purchase,
    restore,
    refresh,
    retryStore,
    manageSubscriptions,
    clearProgress,
    ownershipOf,
  } = usePurchases();
  const [notice, setNotice] = useState<UserMessage | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const programs = catalog.filter((product) => product.productType === 'non_consumable');
  const subscriptions = catalog.filter((product) => product.productType === 'subscription');
  const hasTestProducts = catalog.some((product) => product.testOnly);
  const isNative = Platform.OS !== 'web';
  const storeUnreachable = isNative && !isLoading && catalog.length > 0 && !storeReady;
  const nothingPublished = isNative && !isLoading && catalog.length > 0 && storeReady && offers.size === 0;

  if (!user && !authLoading) {
    return <Redirect href="/auth/login" />;
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh().catch(() => undefined);
    setRefreshing(false);
  };

  const renderProduct = (product: StoreCatalogProduct) => {
    const programId = product.programIds[0];
    return (
      <StoreProductCard
        key={product.id}
        product={product}
        offer={offers.get(product.productKey)}
        ownership={ownershipOf(product)}
        progress={progress[product.productKey]}
        storeReady={storeReady}
        onBuy={() => void purchase(product)}
        onManage={() => void manageSubscriptions(product)}
        onOpenProgram={programId ? () => router.push(`/program/${programId}`) : undefined}
        onDismiss={() => clearProgress(product.productKey)}
      />
    );
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void handleRefresh()} tintColor={storeColors.primary} />}
    >
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Programaciones</Text>
        <Text style={styles.heroText}>
          Cada programación tiene su propia suscripción: contrata las que quieras, a la vez. El acceso se activa en cuanto
          la tienda confirma el pago y te sirve en Android, iPhone y la web con tu cuenta.
        </Text>
      </View>

      {Platform.OS === 'web' ? <Text style={styles.webNote}>{STORE_ON_WEB_MESSAGE}</Text> : null}

      {hasTestProducts ? (
        <View style={[styles.banner, styles.bannerWarning]}>
          <Text style={styles.bannerTitle}>Modo pruebas</Text>
          <Text style={styles.bannerText}>
            Lo marcado «Solo pruebas» aún no está a la venta: solo lo ven los administradores y las cuentas de prueba. Si
            tu cuenta de {STORE_NAME} no es de pruebas, la tienda cobrará de verdad.
          </Text>
        </View>
      ) : null}

      {storeUnreachable || nothingPublished ? (
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>
            {storeUnreachable ? `No hay conexión con ${STORE_NAME}` : `Aún no se pueden contratar en ${STORE_NAME}`}
          </Text>
          <Text style={styles.bannerText}>
            {storeUnreachable
              ? `Comprueba tu conexión y que has iniciado sesión en ${STORE_NAME}. Lo que ya tienes contratado sigue disponible.`
              : 'Estamos terminando de publicarlas. Lo que ya tienes contratado sigue disponible.'}
          </Text>
          <StoreButton
            title="Reintentar"
            tone="outline"
            onPress={() => (storeUnreachable ? retryStore() : void handleRefresh())}
          />
        </View>
      ) : null}

      {isLoading && catalog.length === 0 ? <ActivityIndicator color={storeColors.primary} style={styles.loader} /> : null}

      {!isLoading && catalog.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>La tienda aún no está abierta</Text>
          <Text style={styles.emptyText}>
            Muy pronto podrás suscribirte a las programaciones desde aquí. Todo lo demás de la app funciona como siempre.
          </Text>
        </View>
      ) : null}

      {programs.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compra única</Text>
          <Text style={styles.sectionLead}>Pago único: la programación es tuya para siempre.</Text>
          {programs.map(renderProduct)}
        </View>
      ) : null}

      {subscriptions.length > 0 ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.sectionTitleSecondary]}>Suscripciones</Text>
          <Text style={styles.sectionLead}>
            Cada una es independiente: puedes tener varias a la vez y cancelar cada una cuando quieras.
          </Text>
          {subscriptions.map(renderProduct)}
        </View>
      ) : null}

      {notice ? (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>{notice.title}</Text>
          <Text style={styles.noticeText}>{notice.message}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <StoreButton title="Mis compras" tone="outline" onPress={() => router.push('/store/purchases')} />
        {storeReady ? (
          <>
            <StoreButton
              title="Restaurar compras"
              tone="outline"
              loading={isRestoring}
              disabled={isRestoring}
              onPress={() => void restore().then(setNotice)}
            />
            <StoreButton title="Gestionar suscripciones" tone="ghost" onPress={() => void manageSubscriptions()} />
          </>
        ) : null}
      </View>

      <StoreLegalFooter showSubscriptionTerms={subscriptions.length > 0} />
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
    gap: 20,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  hero: {
    gap: 6,
    backgroundColor: storeColors.primarySoft,
    borderRadius: 18,
    padding: 18,
    borderLeftWidth: 4,
    borderLeftColor: storeColors.secondary,
  },
  heroTitle: {
    fontFamily: fontUiBold,
    fontWeight: 'normal',
    fontSize: 22,
    lineHeight: 28,
    color: storeColors.text,
  },
  heroText: {
    fontFamily: fontUiRegular,
    fontWeight: 'normal',
    fontSize: 14,
    lineHeight: 21,
    color: storeColors.textSecondary,
  },
  webNote: {
    fontFamily: fontUiRegular,
    fontWeight: 'normal',
    fontSize: 14,
    lineHeight: 21,
    color: storeColors.text,
    backgroundColor: storeColors.surface,
    borderWidth: 1,
    borderColor: storeColors.border,
    borderRadius: 12,
    padding: 12,
  },
  banner: {
    gap: 8,
    backgroundColor: storeColors.surface,
    borderWidth: 1,
    borderColor: storeColors.border,
    borderRadius: 14,
    padding: 14,
  },
  bannerWarning: {
    backgroundColor: storeColors.warningSoft,
    borderColor: storeColors.warningSoft,
  },
  bannerTitle: {
    fontFamily: fontUiSemibold,
    fontWeight: 'normal',
    fontSize: 15,
    lineHeight: 20,
    color: storeColors.text,
  },
  bannerText: {
    fontFamily: fontUiRegular,
    fontWeight: 'normal',
    fontSize: 13,
    lineHeight: 19,
    color: storeColors.textSecondary,
  },
  loader: { marginVertical: 24 },
  empty: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 24,
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
  section: { gap: 12 },
  sectionTitle: {
    fontFamily: fontUiBold,
    fontWeight: 'normal',
    fontSize: 18,
    lineHeight: 24,
    color: storeColors.primaryInk,
  },
  sectionTitleSecondary: { color: storeColors.secondaryInk },
  sectionLead: {
    fontFamily: fontUiRegular,
    fontWeight: 'normal',
    fontSize: 13,
    lineHeight: 19,
    color: storeColors.textSecondary,
    marginTop: -6,
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
  actions: { gap: 10 },
});
