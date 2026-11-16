import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { StoreButton } from '@/components/store/StoreButton';
import { StoreLegalFooter } from '@/components/store/StoreLegalFooter';
import { StoreProductCard } from '@/components/store/StoreProductCard';
import { AppIcon } from '@/components/ui/AppIcon';
import { fontUiBold, fontUiRegular, fontUiSemibold } from '@/constants/fonts';
import { storeColors } from '@/constants/storeColors';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { usePurchases } from '@/hooks/usePurchases';
import { STORE_ON_WEB_MESSAGE } from '@/lib/iap/messages';
import type { UserMessage } from '@/lib/iap/types';

interface ProgramPurchaseSheetProps {
  visible: boolean;
  programId: string;
  programName: string;
  onClose: () => void;
  /** Abre la programación cuando el servidor ya ha concedido el acceso. */
  onOpenProgram?: () => void;
}

export function ProgramPurchaseSheet({ visible, programId, programName, onClose, onOpenProgram }: ProgramPurchaseSheetProps) {
  const router = useAppNavigation();
  const {
    offers,
    progress,
    storeReady,
    isRestoring,
    purchase,
    restore,
    manageSubscriptions,
    clearProgress,
    ownershipOf,
    productsForProgram,
    hasProgramEntitlement,
  } = usePurchases();
  const [notice, setNotice] = useState<UserMessage | null>(null);

  useEffect(() => {
    if (!visible) setNotice(null);
  }, [visible]);

  const products = productsForProgram(programId);
  const unlocked = hasProgramEntitlement(programId);
  const hasSubscriptions = products.some((product) => product.productType === 'subscription');

  const handleRestore = async () => {
    setNotice(await restore());
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Cerrar" />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>Acceso a la programación</Text>
              <Text style={styles.title}>{programName}</Text>
            </View>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Cerrar" hitSlop={10}>
              <AppIcon name="close" size={24} color={storeColors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {unlocked ? (
              <>
                <View style={styles.success}>
                  <AppIcon name="check" size={22} color={storeColors.success} />
                  <View style={styles.successCopy}>
                    <Text style={styles.successTitle}>Ya tienes acceso</Text>
                    <Text style={styles.successText}>
                      Tu acceso está verificado. La programación está desbloqueada en todos tus dispositivos.
                    </Text>
                  </View>
                </View>
                {onOpenProgram ? <StoreButton title="Ver programación" onPress={onOpenProgram} /> : null}
              </>
            ) : (
              <>
                {Platform.OS === 'web' ? <Text style={styles.webNote}>{STORE_ON_WEB_MESSAGE}</Text> : null}
                {products.map((product) => (
                  <StoreProductCard
                    key={product.id}
                    product={product}
                    offer={offers.get(product.productKey)}
                    ownership={ownershipOf(product)}
                    progress={progress[product.productKey]}
                    storeReady={storeReady}
                    onBuy={() => void purchase(product)}
                    onManage={() => void manageSubscriptions(product)}
                    onOpenProgram={onOpenProgram}
                    onDismiss={() => clearProgress(product.productKey)}
                  />
                ))}
              </>
            )}

            {notice ? (
              <View style={styles.notice}>
                <Text style={styles.noticeTitle}>{notice.title}</Text>
                <Text style={styles.noticeText}>{notice.message}</Text>
              </View>
            ) : null}

            <View style={styles.actions}>
              {storeReady && !unlocked ? (
                <StoreButton
                  title="Restaurar compras"
                  tone="outline"
                  loading={isRestoring}
                  disabled={isRestoring}
                  onPress={() => void handleRestore()}
                />
              ) : null}
              <StoreButton
                title="Mis compras"
                tone="ghost"
                onPress={() => {
                  onClose();
                  router.push('/store/purchases');
                }}
              />
            </View>

            <StoreLegalFooter showSubscriptionTerms={hasSubscriptions} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  sheet: {
    backgroundColor: storeColors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: storeColors.border,
  },
  headerCopy: { flex: 1, gap: 2 },
  eyebrow: {
    fontFamily: fontUiSemibold,
    fontWeight: 'normal',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: storeColors.secondaryInk,
  },
  title: {
    fontFamily: fontUiBold,
    fontWeight: 'normal',
    fontSize: 20,
    lineHeight: 26,
    color: storeColors.text,
  },
  content: {
    padding: 20,
    paddingBottom: 36,
    gap: 14,
  },
  webNote: {
    fontFamily: fontUiRegular,
    fontWeight: 'normal',
    fontSize: 14,
    lineHeight: 21,
    color: storeColors.text,
    backgroundColor: storeColors.primarySoft,
    borderRadius: 12,
    padding: 12,
  },
  success: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: storeColors.successSoft,
    borderRadius: 14,
    padding: 14,
  },
  successCopy: { flex: 1, gap: 2 },
  successTitle: {
    fontFamily: fontUiBold,
    fontWeight: 'normal',
    fontSize: 16,
    lineHeight: 22,
    color: storeColors.success,
  },
  successText: {
    fontFamily: fontUiRegular,
    fontWeight: 'normal',
    fontSize: 14,
    lineHeight: 20,
    color: storeColors.text,
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
  actions: { gap: 8 },
});
