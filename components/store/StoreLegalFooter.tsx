import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { fontUiRegular, fontUiSemibold } from '@/constants/fonts';
import { APPLE_STANDARD_EULA_URL, PRIVACY_POLICY_ROUTE } from '@/constants/legal';
import { storeColors } from '@/constants/storeColors';
import { useAppNavigation } from '@/hooks/useAppNavigation';

export function StoreLegalFooter({ showSubscriptionTerms }: { showSubscriptionTerms: boolean }) {
  const router = useAppNavigation();

  return (
    <View style={styles.footer}>
      <Text style={styles.note}>
        Tus compras quedan asociadas a tu cuenta de Training ProgLine: las tienes en Android, iPhone y la web con la
        misma cuenta. El precio y la moneda los indica la tienda según tu país.
      </Text>
      <View style={styles.links}>
        <Pressable onPress={() => router.push(PRIVACY_POLICY_ROUTE)} accessibilityRole="link" hitSlop={6}>
          <Text style={styles.link}>Política de privacidad</Text>
        </Pressable>
        {showSubscriptionTerms && Platform.OS === 'ios' ? (
          <Pressable onPress={() => void Linking.openURL(APPLE_STANDARD_EULA_URL)} accessibilityRole="link" hitSlop={6}>
            <Text style={styles.link}>Términos de uso (EULA)</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: 10,
    paddingTop: 8,
  },
  note: {
    fontFamily: fontUiRegular,
    fontWeight: 'normal',
    fontSize: 12,
    lineHeight: 18,
    color: storeColors.textMuted,
  },
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  link: {
    fontFamily: fontUiSemibold,
    fontWeight: 'normal',
    fontSize: 13,
    lineHeight: 18,
    color: storeColors.primaryInk,
    textDecorationLine: 'underline',
  },
});
