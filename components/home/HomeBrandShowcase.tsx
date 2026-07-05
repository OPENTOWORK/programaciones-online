import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { colors, spacing, typography } from '@/constants/theme';
import type { AppIconName } from '@/constants/icons';

const HYPE_WEBSITE_URL = 'https://trainwithhype.com/';
const HERO_IMAGE_URL = 'https://trainwithhype.com/wp-content/uploads/2025/07/2-1024x576.webp';

const METHODOLOGY = [
  {
    icon: 'goal' as AppIconName,
    title: 'Conecta con tu propósito',
    text: 'Entrenas por ti, no por expectativas externas. Adaptamos cada sesión a tu contexto.',
  },
  {
    icon: 'progress' as AppIconName,
    title: 'Diseña tu progreso',
    text: 'Fuerza, resistencia y funcional con técnica y evolución real, sin presión.',
  },
  {
    icon: 'trainer' as AppIconName,
    title: 'Entrena en comunidad',
    text: 'Un entorno respetuoso y motivador donde la energía colectiva impulsa tu constancia.',
  },
];

const DISCIPLINES = ['ATHX', 'HYROX', 'HY-PE', 'Cross Training', 'Calistenia', 'Styrkur'];

function DisciplinesGrid() {
  return (
    <View style={styles.disciplinesCard}>
      <Text style={styles.disciplinesTitle}>Nuestras disciplinas</Text>
      <View style={styles.disciplinesGrid}>
        {DISCIPLINES.map((discipline) => (
          <View key={discipline} style={styles.disciplinePill}>
            <Text style={styles.disciplineText}>{discipline}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function HomeBrandShowcase() {
  const router = useRouter();

  const openWebsite = () => {
    void Linking.openURL(HYPE_WEBSITE_URL);
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={openWebsite}
        accessibilityRole="button"
        accessibilityLabel="Reservar clase de prueba en trainwithhype.com"
        style={({ pressed }) => [styles.heroCard, pressed && styles.heroCardPressed]}
      >
        <Image source={{ uri: HERO_IMAGE_URL }} style={styles.heroImage} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', `${colors.background}CC`, colors.background]}
          style={styles.heroOverlay}
        >
          <Text style={styles.heroEyebrow}>Entrenamiento híbrido en Madrid</Text>
          <Text style={styles.heroTitle}>Tu primera clase es gratis</Text>
          <Text style={styles.heroSubtitle}>
            Sesiones que te retan, te cuidan y se adaptan a tu nivel.
          </Text>
          <View style={styles.heroCtaRow}>
            <Text style={styles.heroCta}>Reservar clase de prueba</Text>
            <AppIcon name="programs" size={16} color={colors.accent} />
          </View>
        </LinearGradient>
      </Pressable>

      <View style={styles.programsCtaShell}>
        <Button
          title="Explorar programaciones"
          onPress={() => router.push('/tabs/programs')}
          style={styles.programsBtn}
          textStyle={styles.programsBtnText}
        />
      </View>

      <DisciplinesGrid />

      <Text style={styles.sectionTitle}>Nuestra metodología</Text>
      <View style={styles.methodologyList}>
        {METHODOLOGY.map((item) => (
          <View key={item.title} style={styles.methodCard}>
            <View style={styles.methodIconWrap}>
              <AppIcon name={item.icon} size={18} color={colors.accent} outlined />
            </View>
            <View style={styles.methodCopy}>
              <Text style={styles.methodTitle}>{item.title}</Text>
              <Text style={styles.methodText}>{item.text}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.locationCard}>
        <View style={styles.locationIconWrap}>
          <AppIcon name="home" size={18} color={colors.accentBlue} outlined />
        </View>
        <View style={styles.locationCopy}>
          <Text style={styles.locationTitle}>Centro HY-PE · Prosperidad</Text>
          <Text style={styles.locationText}>Calle del General Zabala, 17 · 28002 Madrid</Text>
          <Text style={styles.locationHours}>L-V 07:00–22:00 · S-D 09:00–14:00</Text>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  heroCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${colors.accent}33`,
    minHeight: 280,
    backgroundColor: colors.surface,
  },
  heroCardPressed: {
    opacity: 0.94,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.md,
    minHeight: 280,
  },
  heroEyebrow: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  heroTitle: {
    ...typography.h2,
    color: colors.text,
  },
  heroSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 20,
    maxWidth: 320,
  },
  heroCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  heroCta: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '700',
  },
  disciplinesCard: {
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disciplinesTitle: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  disciplinesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  disciplinePill: {
    width: '48%',
    flexGrow: 1,
    minWidth: '46%',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm + 2,
    borderRadius: 12,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disciplineText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.xs,
  },
  methodologyList: {
    gap: spacing.sm,
  },
  methodCard: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  methodIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${colors.accent}14`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodCopy: {
    flex: 1,
  },
  methodTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  methodText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  locationCard: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: `${colors.accentBlue}10`,
    borderWidth: 1,
    borderColor: `${colors.accentBlue}33`,
  },
  locationIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${colors.accentBlue}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationCopy: {
    flex: 1,
  },
  locationTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  locationText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  locationHours: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  programsCtaShell: {
    borderRadius: 16,
    padding: 3,
    backgroundColor: `${colors.accent}22`,
    borderWidth: 1,
    borderColor: `${colors.accent}55`,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: spacing.xs,
  },
  programsBtn: {
    minHeight: 58,
    borderWidth: 1,
    borderColor: `${colors.white}30`,
  },
  programsBtnText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
