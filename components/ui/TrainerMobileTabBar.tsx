import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';

import { AppIcon } from '@/components/ui/AppIcon';
import { NavCountBadge } from '@/components/ui/NavCountBadge';
import { colors } from '@/constants/theme';
import type { AppIconName } from '@/constants/icons';
import { useTrainerNotifications } from '@/hooks/useTrainerNotifications';
import { useBottomSafeInset } from '@/lib/mobileInsets';

type TabHref =
  | '/tabs/home'
  | '/tabs/programs'
  | '/tabs/trainer'
  | '/trainer/chats'
  | '/tabs/profile';

type TabItem = {
  href: TabHref;
  label: string;
  icon: AppIconName;
  badge?: number;
  match: (pathname: string) => boolean;
};

export function TrainerMobileTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const bottomInset = useBottomSafeInset();
  const { counts, chatUnread } = useTrainerNotifications();

  const tabs: TabItem[] = [
    {
      href: '/tabs/home',
      label: 'Inicio',
      icon: 'home',
      badge: counts.total > 0 ? counts.total : undefined,
      match: (path) => path.startsWith('/tabs/home') || path === '/',
    },
    {
      href: '/tabs/programs',
      label: 'Planes',
      icon: 'programs',
      match: (path) =>
        path.startsWith('/tabs/programs') ||
        path.startsWith('/plan/') ||
        path.startsWith('/program/'),
    },
    {
      href: '/tabs/trainer',
      label: 'Atletas',
      icon: 'trainer',
      badge: counts.sessions + counts.intake + counts.appointment,
      match: (path) =>
        path.startsWith('/tabs/trainer') ||
        path.startsWith('/trainer/athlete/'),
    },
    {
      href: '/trainer/chats',
      label: 'Chats',
      icon: 'chat',
      badge: chatUnread,
      match: (path) =>
        path.startsWith('/trainer/chats') || path.startsWith('/trainer/chat/'),
    },
    {
      href: '/tabs/profile',
      label: 'Perfil',
      icon: 'profile',
      match: (path) => path.startsWith('/tabs/profile') || path.startsWith('/profile/'),
    },
  ];

  return (
    <View style={[styles.bar, { paddingBottom: bottomInset }]}>
      {tabs.map((tab) => {
        const focused = tab.match(pathname);
        const badge = tab.badge ?? 0;

        return (
          <Pressable
            key={tab.href}
            onPress={() => router.push(tab.href)}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={
              badge > 0 ? `${tab.label}, ${badge} aviso${badge === 1 ? '' : 's'}` : tab.label
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
              <NavCountBadge count={badge} />
            </View>
            <Text style={[styles.label, focused && styles.labelActive]} numberOfLines={1}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingTop: 6,
    paddingHorizontal: 4,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    minWidth: 0,
    paddingVertical: 4,
  },
  iconWrap: {
    position: 'relative',
    width: 32,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {},
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
  },
  labelActive: {
    color: colors.accent,
    fontWeight: '700',
  },
});
