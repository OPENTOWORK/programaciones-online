import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';

import { AppIcon } from '@/components/ui/AppIcon';
import { NavCountBadge } from '@/components/ui/NavCountBadge';
import { colors } from '@/constants/theme';
import type { AppIconName } from '@/constants/icons';
import { useAuth } from '@/hooks/useAuth';
import { useTrainerNotifications } from '@/hooks/useTrainerNotifications';
import { isTrainerRole } from '@/lib/athleteService';
import { useBottomSafeInset } from '@/lib/mobileInsets';

type TabHref = '/tabs/home' | '/tabs/programs' | '/tabs/progress' | '/tabs/trainer' | '/tabs/profile';

type TabItem = {
  href: TabHref;
  label: string;
  icon: AppIconName;
  badge?: number;
  match: (pathname: string) => boolean;
};

export function AthleteTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const bottomInset = useBottomSafeInset();
  const { user } = useAuth();
  const isTrainer = isTrainerRole(user?.role);
  const { counts } = useTrainerNotifications();

  const tabs: TabItem[] = [
    {
      href: '/tabs/home',
      label: 'Inicio',
      icon: 'home',
      match: (path) =>
        path.startsWith('/tabs/home') ||
        path.startsWith('/calendar/') ||
        path === '/',
    },
    {
      href: '/tabs/programs',
      label: 'Programas',
      icon: 'programs',
      match: (path) =>
        path.startsWith('/tabs/programs') ||
        path.startsWith('/plan/') ||
        path.startsWith('/program/') ||
        path.startsWith('/workout/') ||
        path.startsWith('/athlete/plan/') ||
        path.startsWith('/library'),
    },
    {
      href: '/tabs/progress',
      label: 'Progreso',
      icon: 'progress',
      match: (path) => path.startsWith('/tabs/progress'),
    },
    {
      href: '/tabs/trainer',
      label: isTrainer ? 'Atletas' : 'Entrenador',
      icon: 'trainer',
      badge: isTrainer ? counts.sessions + counts.intake + counts.appointment : 0,
      match: (path) => path.startsWith('/tabs/trainer'),
    },
    {
      href: '/tabs/profile',
      label: 'Perfil',
      icon: 'profile',
      badge: isTrainer ? counts.total : 0,
      match: (path) =>
        path.startsWith('/tabs/profile') || path.startsWith('/profile/'),
    },
  ];

  return (
    <View style={[styles.bar, { paddingBottom: bottomInset }]}>
      {tabs.map((tab) => {
        const focused = tab.match(pathname);

        return (
          <Pressable
            key={tab.href}
            onPress={() => router.push(tab.href)}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={
              tab.badge
                ? `${tab.label}, ${tab.badge} aviso${tab.badge === 1 ? '' : 's'}`
                : tab.label
            }
            style={styles.item}
          >
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <AppIcon
                name={tab.icon}
                size={22}
                color={focused ? colors.accent : colors.textMuted}
                outlined={!focused}
              />
              {tab.badge ? (
                <View style={styles.badgeWrap}>
                  <NavCountBadge count={tab.badge} />
                </View>
              ) : null}
            </View>
            <Text style={[styles.label, focused && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: 8,
    width: '100%',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    cursor: 'pointer',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeWrap: {
    position: 'absolute',
    top: -8,
    right: -14,
  },
  iconWrapActive: {
    transform: [{ scale: 1.05 }],
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.accent,
  },
});
