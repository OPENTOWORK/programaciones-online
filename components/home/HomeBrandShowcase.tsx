import { useRouter } from 'expo-router';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AppIcon } from '@/components/ui/AppIcon';
import { AppLogo } from '@/components/ui/AppLogo';
import { borderRadius, colors, shadows, spacing, typography } from '@/constants/theme';

const heroBackground = require('@/assets/home-hero.jpg');

const APP_PURPOSE = [
  {
    icon: 'programs' as const,
    title: 'Tus programaciones en un solo sitio',
    text: 'Accede a los planes que te asigna tu entrenador y al catálogo de programaciones disponibles.',
  },
  {
    icon: 'main' as const,
    title: 'Entrena sesión a sesión',
    text: 'Sigue cada entreno con instrucciones claras, vídeos de ejercicios y registro de lo que completas.',
  },
  {
    icon: 'progress' as const,
    title: 'Mide tu progreso',
    text: 'Consulta tu evolución, registra sensaciones y mantén constancia con tu planificación.',
  },
  {
    icon: 'trainer' as const,
    title: 'Conecta con tu entrenador',
    text: 'Tu coach puede prepararte planes personalizados y hacer seguimiento de tu trabajo.',
  },
];

export function HomeBrandShowcase() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => router.push('/tabs/programs')}
        accessibilityRole="button"
        accessibilityLabel="Explorar programaciones"
        style={({ pressed }) => [styles.heroCard, pressed && styles.pressed]}
      >
        <ImageBackground
          source={heroBackground}
          style={styles.heroBackground}
          imageStyle={styles.heroBackgroundImage}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(15,20,25,0.2)', 'rgba(15,20,25,0.78)', colors.background]}
            locations={[0, 0.5, 1]}
            style={styles.heroOverlay}
          >
            <View style={styles.heroBrandRow}>
              <AppLogo size={40} />
              <View style={styles.heroBrandCopy}>
                <Text style={styles.heroEyebrow}>HY-PE</Text>
                <Text style={styles.heroBrandTagline}>Programaciones a tu medida</Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>Tu entrenamiento,{'\n'}organizado</Text>
            <Text style={styles.heroSubtitle}>
              Explora el catálogo o continúa donde lo dejaste.
            </Text>

            <View style={styles.heroCta}>
              <Text style={styles.heroCtaText}>Explorar catálogo</Text>
              <AppIcon name="programs" size={16} color={colors.black} />
            </View>
          </LinearGradient>
        </ImageBackground>
      </Pressable>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Qué es Training ProgLine</Text>
        <Text style={styles.sectionIntro}>
          Una app para que entrenes con método: tu entrenador te prepara la planificación y tú la
          ejecutas con claridad, seguimiento y continuidad.
        </Text>

        <View style={styles.purposeList}>
          {APP_PURPOSE.map((item) => (
            <View key={item.title} style={styles.purposeCard}>
              <View style={styles.purposeIconWrap}>
                <AppIcon name={item.icon} size={18} color={colors.accent} outlined />
              </View>
              <View style={styles.purposeCopy}>
                <Text style={styles.purposeTitle}>{item.title}</Text>
                <Text style={styles.purposeText}>{item.text}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  pressed: {
    opacity: 0.94,
  },
  heroCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${colors.accent}40`,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  heroBackground: {
    minHeight: 220,
  },
  heroBackgroundImage: {
    opacity: 0.88,
  },
  heroOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.lg,
    minHeight: 220,
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
    letterSpacing: 1.4,
    textTransform: 'uppercase',
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
  },
  heroSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
    maxWidth: 300,
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
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
  },
  heroCtaText: {
    ...typography.button,
    color: colors.black,
    fontWeight: '700',
    fontSize: 14,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  sectionIntro: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  purposeList: {
    gap: spacing.sm,
  },
  purposeCard: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  purposeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.accent}14`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purposeCopy: {
    flex: 1,
    gap: 4,
  },
  purposeTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  purposeText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
