import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  GymErrorBanner,
  GymScreen,
  GymScreenHeader,
} from '@/components/gym/GymScreen';
import { GymShopSalesBalancePanel } from '@/components/gym/GymShopSalesBalance';
import { AppIcon } from '@/components/ui/AppIcon';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, spacing, typography } from '@/constants/theme';
import { useGymShop } from '@/hooks/useGymData';

export default function GymShopSalesScreen() {
  const router = useRouter();
  const { movements, isLoading, error, refresh } = useGymShop();

  return (
    <GymScreen>
      <ScreenWrapper>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Volver a tienda"
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <AppIcon name="chevronLeft" size={18} color={colors.text} />
            <Text style={styles.backLabel}>Tienda</Text>
          </Pressable>
        </View>

        <GymScreenHeader
          title="Balance de ventas"
          subtitle="Importe cobrado y cliente de cada compra en la tienda"
        />

        {error ? <GymErrorBanner message={error} onRetry={refresh} /> : null}

        <GymShopSalesBalancePanel movements={movements} isLoading={isLoading} />
      </ScreenWrapper>
    </GymScreen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    marginBottom: spacing.sm,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  backLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
  },
});
