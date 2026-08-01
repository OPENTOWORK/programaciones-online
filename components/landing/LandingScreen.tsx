import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { AppLogo } from '@/components/ui/AppLogo';
import { PRIVACY_POLICY_ROUTE } from '@/constants/legal';
import { borderRadius, colors, shadows, spacing, typography } from '@/constants/theme';

const heroImage = require('@/assets/home-hero.jpg');

const ANDROID_APP_URL = 'https://play.google.com/store/apps/details?id=com.trainingprogline.app';

const FEATURES = [
  {
    icon: 'programs' as const,
    title: 'Tu plan, sesión a sesión',
    text: 'Tu entrenador te prepara la programación y tú la sigues con instrucciones claras y vídeos de cada ejercicio.',
  },
  {
    icon: 'calendar' as const,
    title: 'Todo en un calendario',
    text: 'Consulta qué te toca cada día, marca lo que completas y no pierdas el hilo de la planificación.',
  },
  {
    icon: 'progress' as const,
    title: 'Mide tu progreso',
    text: 'Registra tus entrenos, sube vídeos de tus series y ve tu evolución con datos reales.',
  },
  {
    icon: 'chat' as const,
    title: 'Habla con tu entrenador',
    text: 'Chat directo y feedback personalizado en texto, audio o vídeo cuando lo necesites.',
  },
];

export function LandingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  const goToLogin = () => router.push('/auth/login');
  const goToRegister = () => router.push('/auth/register');
  const openAndroidApp = () => {
    void Linking.openURL(ANDROID_APP_URL);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.page, isWide && styles.pageWide]}>
        <View style={styles.nav}>
          <View style={styles.brand}>
            <AppLogo size={40} />
            <View>
              <Text style={styles.brandName}>Training ProgLine</Text>
              <Text style={styles.brandTagline}>Entrenamiento con método</Text>
            </View>
          </View>

          <Pressable
            onPress={goToLogin}
            accessibilityRole="button"
            style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
          >
            <Text style={styles.navButtonText}>Iniciar sesión</Text>
            <AppIcon name="chevronRight" size={15} color={colors.black} />
          </Pressable>
        </View>

        <LinearGradient
          colors={[`${colors.accent}1F`, 'transparent']}
          style={[styles.hero, isWide && styles.heroWide]}
        >
          <View style={[styles.heroCopy, isWide && styles.heroCopyWide]}>
            <Text style={styles.eyebrow}>Programaciones personalizadas</Text>
            <Text style={[styles.heroTitle, isWide && styles.heroTitleWide]}>
              Tu entrenamiento, siempre contigo
            </Text>
            <Text style={styles.heroText}>
              Descarga la app para Android y entrena con la planificación que tu entrenador prepara
              para ti. Si ya tienes cuenta, entra directamente desde aquí.
            </Text>

            <View style={[styles.heroActions, isWide && styles.heroActionsWide]}>
              <Pressable
                onPress={openAndroidApp}
                accessibilityRole="button"
                accessibilityLabel="Descargar la app para Android en Google Play"
                style={({ pressed }) => [styles.storeButton, pressed && styles.pressed]}
              >
                <Ionicons name="logo-google-playstore" size={24} color={colors.black} />
                <View>
                  <Text style={styles.storeButtonEyebrow}>Descárgala en</Text>
                  <Text style={styles.storeButtonText}>Google Play</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={goToLogin}
                accessibilityRole="button"
                style={({ pressed }) => [styles.ghostButton, pressed && styles.pressed]}
              >
                <Text style={styles.ghostButtonText}>Iniciar sesión</Text>
              </Pressable>
            </View>

            <Text style={styles.heroNote}>
              También puedes usarla desde el navegador, sin instalar nada.
            </Text>
          </View>

          {isWide ? (
            <View style={styles.heroArt}>
              <Image source={heroImage} style={styles.heroImage} resizeMode="cover" />
              <LinearGradient
                colors={['transparent', 'rgba(15,20,25,0.85)']}
                style={styles.heroImageFade}
              />
            </View>
          ) : null}
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Qué encontrarás dentro</Text>
          <View style={styles.featureGrid}>
            {FEATURES.map((feature) => (
              <View
                key={feature.title}
                style={[styles.featureCard, isWide && styles.featureCardWide]}
              >
                <View style={styles.featureIcon}>
                  <AppIcon name={feature.icon} size={20} color={colors.accent} outlined />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.downloadCard, isWide && styles.downloadCardWide]}>
          <View style={styles.downloadCopy}>
            <View style={styles.downloadBadge}>
              <Ionicons name="logo-android" size={16} color={colors.accent} />
              <Text style={styles.downloadBadgeText}>Android</Text>
            </View>
            <Text style={styles.downloadTitle}>Llévate tus entrenos al móvil</Text>
            <Text style={styles.downloadText}>
              Instala la app para tener tus sesiones a mano en el gimnasio, marcar lo que completas
              y subir vídeos de tus series desde el propio entreno.
            </Text>
          </View>

          <Pressable
            onPress={openAndroidApp}
            accessibilityRole="button"
            accessibilityLabel="Descargar la app para Android en Google Play"
            style={({ pressed }) => [styles.storeButton, pressed && styles.pressed]}
          >
            <Ionicons name="logo-google-playstore" size={24} color={colors.black} />
            <View>
              <Text style={styles.storeButtonEyebrow}>Descárgala en</Text>
              <Text style={styles.storeButtonText}>Google Play</Text>
            </View>
          </Pressable>
        </View>

        <View style={[styles.accessCard, isWide && styles.accessCardWide]}>
          <View style={styles.downloadCopy}>
            <Text style={styles.accessTitle}>¿Ya entrenas con nosotros?</Text>
            <Text style={styles.downloadText}>
              Entra con tu cuenta para ver tu programación, tu progreso y hablar con tu entrenador.
            </Text>
          </View>

          <View style={styles.accessActions}>
            <Pressable
              onPress={goToLogin}
              accessibilityRole="button"
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
            </Pressable>
            <Pressable
              onPress={goToRegister}
              accessibilityRole="button"
              style={({ pressed }) => [styles.ghostButton, pressed && styles.pressed]}
            >
              <Text style={styles.ghostButtonText}>Crear cuenta</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© {new Date().getFullYear()} Training ProgLine</Text>
          <Pressable onPress={() => router.push(PRIVACY_POLICY_ROUTE)}>
            <Text style={styles.footerLink}>Política de privacidad</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  page: {
    width: '100%',
    maxWidth: 1120,
    gap: spacing.xl,
    paddingTop: spacing.lg,
  },
  pageWide: {
    gap: spacing.xxl,
    paddingTop: spacing.xl,
  },
  pressed: {
    opacity: 0.85,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    flexShrink: 1,
  },
  brandName: {
    ...typography.h3,
    color: colors.text,
  },
  brandTagline: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
  },
  navButtonText: {
    ...typography.button,
    color: colors.black,
    fontSize: 14,
    fontWeight: '700',
  },
  hero: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    padding: spacing.lg,
    gap: spacing.lg,
    ...shadows.card,
  },
  heroWide: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xxl,
    gap: spacing.xxl,
  },
  heroCopy: {
    gap: spacing.sm,
  },
  heroCopyWide: {
    flex: 1,
  },
  eyebrow: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  heroTitle: {
    ...typography.h1,
    color: colors.text,
  },
  heroTitleWide: {
    fontSize: 42,
    lineHeight: 50,
  },
  heroText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    maxWidth: 520,
  },
  heroActions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  heroActionsWide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroNote: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  heroArt: {
    flex: 1,
    maxWidth: 420,
    height: 340,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroImageFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: '55%',
  },
  storeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm + 2,
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent,
  },
  storeButtonEyebrow: {
    ...typography.caption,
    color: colors.black,
    opacity: 0.75,
    fontWeight: '600',
  },
  storeButtonText: {
    ...typography.button,
    color: colors.black,
    fontWeight: '700',
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent,
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.black,
    fontWeight: '700',
  },
  ghostButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
  },
  ghostButtonText: {
    ...typography.button,
    color: colors.text,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  featureCard: {
    flexGrow: 1,
    flexBasis: 240,
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureCardWide: {
    flexBasis: 240,
    maxWidth: 268,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.accent}14`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  featureText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  downloadCard: {
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: `${colors.accent}40`,
  },
  downloadCardWide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.xl,
  },
  downloadCopy: {
    flex: 1,
    gap: spacing.sm,
  },
  downloadBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.accent}14`,
  },
  downloadBadgeText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  downloadTitle: {
    ...typography.h2,
    color: colors.text,
  },
  downloadText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 22,
    maxWidth: 520,
  },
  accessCard: {
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  accessCardWide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.xl,
  },
  accessTitle: {
    ...typography.h3,
    color: colors.text,
  },
  accessActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  footerLink: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
