import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AppLogo } from '@/components/ui/AppLogo';
import {
  borderRadius,
  colors,
  darkSurfacePalette,
  shadows,
  spacing,
  typography,
  withAlpha,
} from '@/constants/theme';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { usePrograms } from '@/hooks/usePrograms';

const heroBackground = require('@/assets/home-hero-banner.jpg');

interface HomeBrandShowcaseProps {
  fillAvailable?: boolean;
}

export function HomeBrandShowcase({ fillAvailable = false }: HomeBrandShowcaseProps) {
  const navigation = useAppNavigation();
  const { plans } = usePrograms();

  const openCatalog = () => {
    const catalog = plans.find((plan) => plan.category === 'hype');
    if (catalog) {
      navigation.push(`/plan/${catalog.id}`);
      return;
    }
    navigation.push('/tabs/programs');
  };

  return (
    <Pressable
      onPress={openCatalog}
      accessibilityRole="button"
      accessibilityLabel="Programaciones a tu medida"
      style={({ pressed }) => [
        styles.heroCard,
        fillAvailable && styles.heroCardFill,
        pressed && styles.heroPressed,
      ]}
    >
      <View style={[styles.heroBackground, fillAvailable && styles.heroBackgroundFill]}>
        <Image source={heroBackground} style={styles.heroImage} resizeMode="cover" accessibilityIgnoresInvertColors />
        <LinearGradient
          colors={['rgba(8,12,16,0.78)', 'rgba(8,12,16,0.42)', 'rgba(8,12,16,0.12)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          locations={[0, 0.5, 1]}
          style={styles.heroGradient}
          pointerEvents="none"
        />
        <View style={[styles.heroOverlay, fillAvailable && styles.heroOverlayFill]} pointerEvents="none">
          <View style={styles.heroBrandRow}>
            <AppLogo size={36} />
            <Text style={styles.heroBrandTagline} numberOfLines={1}>
              Programaciones a tu medida
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    width: '100%',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: withAlpha(colors.accent, '40'),
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  heroPressed: {
    opacity: 0.88,
  },
  heroCardFill: {
    flex: 1,
    minHeight: 84,
  },
  heroBackground: {
    position: 'relative',
    width: '100%',
    height: 84,
    overflow: 'hidden',
  },
  heroBackgroundFill: {
    flex: 1,
    height: undefined,
    minHeight: 84,
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  heroGradient: {
    ...StyleSheet.absoluteFill,
  },
  heroOverlay: {
    position: 'relative',
    zIndex: 1,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    height: 84,
  },
  heroOverlayFill: {
    height: undefined,
    minHeight: 84,
  },
  heroBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  heroBrandTagline: {
    ...typography.h3,
    flex: 1,
    // Va sobre la foto oscurecida: siempre claro, también con la paleta clara.
    color: darkSurfacePalette.text,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
  },
});
