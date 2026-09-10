import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AppIcon } from '@/components/ui/AppIcon';
import { AppLogo } from '@/components/ui/AppLogo';
import { borderRadius, colors, shadows, spacing, typography, withAlpha } from '@/constants/theme';

const heroBackground = require('@/assets/home-hero-banner.jpg');

export function HomeBrandShowcase() {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push('/tabs/programs')}
      accessibilityRole="button"
      accessibilityLabel="Explorar programaciones"
      style={({ pressed }) => [styles.heroCard, pressed && styles.pressed]}
    >
      <View style={styles.heroBackground}>
        <Image source={heroBackground} style={styles.heroImage} resizeMode="cover" accessibilityIgnoresInvertColors />
        <LinearGradient
          colors={['rgba(8,12,16,0.78)', 'rgba(8,12,16,0.42)', 'rgba(8,12,16,0.12)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          locations={[0, 0.5, 1]}
          style={styles.heroGradient}
          pointerEvents="none"
        />
        <View style={styles.heroOverlay} pointerEvents="none">
          <View style={styles.heroBrandRow}>
            <AppLogo size={48} />
            <Text style={styles.heroBrandTagline}>Programaciones a tu medida</Text>
          </View>

          <Text style={styles.heroTitle}>Tu entrenamiento,{'\n'}organizado</Text>

          <View style={styles.heroCta}>
            <Text style={styles.heroCtaText}>Explorar catálogo</Text>
            <AppIcon name="programs" size={16} color={colors.white} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.94,
  },
  heroCard: {
    width: '100%',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: withAlpha(colors.accent, '40'),
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  heroBackground: {
    position: 'relative',
    width: '100%',
    height: 240,
    overflow: 'hidden',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    position: 'relative',
    zIndex: 1,
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.lg,
    height: 240,
    gap: spacing.sm,
  },
  heroBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    marginBottom: spacing.xs,
  },
  heroBrandCopy: {
    flex: 1,
  },
  heroEyebrow: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  heroBrandTagline: {
    ...typography.bodySmall,
    color: colors.text,
    marginTop: 2,
    fontWeight: '500',
  },
  heroTitle: {
    ...typography.h2,
    color: colors.text,
    fontSize: 24,
    lineHeight: 30,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  heroCta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 42,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accentDark,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  heroCtaText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0.4,
  },
});
