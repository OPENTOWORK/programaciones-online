import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/AppIcon';
import { colors } from '@/constants/theme';
import type { AppIconName } from '@/constants/icons';
import { useAuth } from '@/hooks/useAuth';

type TabHref = '/tabs/home' | '/tabs/programs' | '/tabs/progress' | '/tabs/trainer' | '/tabs/profile';

type TabItem = {
  href: TabHref;
  label: string;
  icon: AppIconName;
  match: (pathname: string) => boolean;
};

export function AthleteTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

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
      label: user?.role === 'entrenador' ? 'Atletas' : 'Entrenador',
      icon: 'trainer',
      match: (path) => path.startsWith('/tabs/trainer'),
    },
    {
      href: '/tabs/profile',
      label: 'Perfil',
      icon: 'profile',
      match: (path) =>
        path.startsWith('/tabs/profile') || path.startsWith('/profile/'),
    },
  ];

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {tabs.map((tab) => {
        const focused = tab.match(pathname);

        return (
          <Pressable
            key={tab.href}
            onPress={() => router.push(tab.href)}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={tab.label}
            style={styles.item}
          >
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <AppIcon
                name={tab.icon}
                size={22}
                color={focused ? colors.accent : colors.textMuted}
                outlined={!focused}
              />
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
