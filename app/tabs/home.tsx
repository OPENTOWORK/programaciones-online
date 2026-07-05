import * as Linking from 'expo-linking';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AppIcon } from '@/components/ui/AppIcon';
import { HomeBrandShowcase } from '@/components/home/HomeBrandShowcase';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { colors, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';

const HYPE_WEBSITE_URL = 'https://trainwithhype.com/';

function formatToday() {
  return new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function HypeWebsitePromo() {
  const openWebsite = () => {
    void Linking.openURL(HYPE_WEBSITE_URL);
  };

  return (
    <Pressable
      onPress={openWebsite}
      accessibilityRole="link"
      accessibilityLabel="Visitar trainwithhype.com"
      style={({ pressed }) => [styles.websiteCard, pressed && styles.websiteCardPressed]}
    >
      <LinearGradient colors={[colors.surfaceLight, `${colors.accent}14`]} style={styles.websiteGradient}>
        <View style={styles.websiteRow}>
          <View style={styles.websiteIconWrap}>
            <AppIcon name="logo" size={22} color={colors.accent} />
          </View>
          <View style={styles.websiteCopy}>
            <Text style={styles.websiteEyebrow}>HY-PE</Text>
            <Text style={styles.websiteTitle}>Menos ego, más progreso</Text>
            <Text style={styles.websiteSubtitle}>Entrenamiento híbrido en Madrid</Text>
          </View>
        </View>
        <View style={styles.websiteFooter}>
          <Text style={styles.websiteUrl}>trainwithhype.com</Text>
          <Text style={styles.websiteCta}>Visitar web</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {user?.name.split(' ')[0]}</Text>
          <Text style={styles.date}>{formatToday()}</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.avatarInitials}</Text>
        </View>
      </View>

      <HypeWebsitePromo />
      <HomeBrandShowcase />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: { ...typography.h2, color: colors.text },
  date: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 4, textTransform: 'capitalize' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.body, color: colors.black, fontWeight: '700' },
  websiteCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${colors.accent}33`,
  },
  websiteCardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  websiteGradient: {
    padding: spacing.md,
  },
  websiteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  websiteIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${colors.accent}18`,
    borderWidth: 1,
    borderColor: `${colors.accent}33`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  websiteCopy: {
    flex: 1,
  },
  websiteEyebrow: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  websiteTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.xs,
  },
  websiteSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  websiteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: `${colors.accent}22`,
  },
  websiteUrl: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  websiteCta: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '700',
  },
});
