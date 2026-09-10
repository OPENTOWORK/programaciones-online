import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useAthleteLinkedGyms } from '@/hooks/useAthleteLinkedGyms';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import type { AthleteLinkedGym } from '@/lib/athleteGymService';
import { resolveGymLogoSource } from '@/lib/gymBranding';

function GymAccessCard({ entry, onPress }: { entry: AthleteLinkedGym; onPress: () => void }) {
  const city = entry.gym.city?.trim();
  const subtitle = city ? `${city} · Reservas y tarifa` : 'Reservas y tarifa';
  const logoSource = resolveGymLogoSource(entry.gym);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${entry.gym.name}`}
      style={({ pressed }) => [styles.gymCard, pressed && styles.gymCardPressed]}
    >
      <View style={styles.gymIcon}>
        {logoSource ? (
          <Image
            source={logoSource}
            style={styles.gymLogo}
            resizeMode="contain"
            accessibilityLabel={`Logo de ${entry.gym.name}`}
          />
        ) : (
          <Ionicons name="barbell-outline" size={22} color={colors.accent} />
        )}
      </View>
      <View style={styles.gymCopy}>
        <Text style={styles.gymName} numberOfLines={1}>{entry.gym.name}</Text>
        <Text style={styles.gymSubtitle} numberOfLines={1}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </Pressable>
  );
}

export function AthleteGymAccess() {
  const router = useRouter();
  const navigation = useNavigation();
  const { gyms, isLoading, error, refresh } = useAthleteLinkedGyms();
  const [menusKey, setMenusKey] = useState(0);

  const collapseMenus = useCallback(() => {
    setMenusKey((current) => current + 1);
  }, []);

  useFocusEffect(
    useCallback(() => {
      collapseMenus();
    }, [collapseMenus]),
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', () => {
      collapseMenus();
    });
    return unsubscribe;
  }, [collapseMenus, navigation]);

  useFocusRefresh(() => {
    void refresh();
  });

  const openGym = (gymId: string) => {
    router.push({ pathname: '/my-gym/[gymId]', params: { gymId } });
  };

  return (
    <View key={menusKey}>
      <CollapsibleSection title="Acceso a tus gimnasios">
        <Text style={styles.intro}>
          Reserva clases y consulta tu tarifa en los centros donde eres miembro.
        </Text>

        {isLoading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : error ? (
          <Text style={styles.emptyText}>{error}</Text>
        ) : gyms.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="business-outline" size={28} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Aún no tienes gimnasios vinculados</Text>
            <Text style={styles.emptyText}>
              Contacta con tu gimnasio para que te den acceso desde su panel. Si ya usas Training
              ProgLine, ellos pueden invitarte con el mismo email de tu cuenta.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {gyms.map((entry) => (
              <GymAccessCard key={entry.member.id} entry={entry} onPress={() => openGym(entry.gym.id)} />
            ))}
          </View>
        )}
      </CollapsibleSection>
    </View>
  );
}

const styles = StyleSheet.create({
  intro: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  list: {
    gap: spacing.sm,
  },
  gymCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
  },
  gymCardPressed: {
    opacity: 0.88,
  },
  gymIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(colors.accent, '18'),
    overflow: 'hidden',
    padding: spacing.xs,
  },
  gymLogo: {
    width: '100%',
    height: '100%',
  },
  gymCopy: {
    flex: 1,
    gap: 2,
  },
  gymName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  gymSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  stateCard: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 72,
  },
  emptyState: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
  },
  emptyTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
