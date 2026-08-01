import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { AppLogo } from '@/components/ui/AppLogo';
import { Button } from '@/components/ui/Button';
import { colors, spacing, typography } from '@/constants/theme';
import type { AppIconName } from '@/constants/icons';
import { useAuth } from '@/hooks/useAuth';

type NavItem = {
  label: string;
  href: '/tabs/programs' | '/tabs/trainer' | '/library' | '/tabs/profile';
  icon: AppIconName;
  match: (pathname: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Programaciones',
    href: '/tabs/programs',
    icon: 'programs',
    match: (pathname) =>
      pathname.startsWith('/tabs/programs') ||
      pathname.startsWith('/plan/') ||
      pathname.startsWith('/program/') ||
      pathname.startsWith('/trainer/program/'),
  },
  {
    label: 'Atletas',
    href: '/tabs/trainer',
    icon: 'trainer',
    match: (pathname) =>
      pathname.startsWith('/tabs/trainer') ||
      pathname.startsWith('/trainer/athlete/') ||
      pathname.startsWith('/trainer/chat/') ||
      pathname.startsWith('/trainer/plan/'),
  },
  {
    label: 'Biblioteca',
    href: '/library',
    icon: 'video',
    match: (pathname) => pathname.startsWith('/library'),
  },
  {
    label: 'Perfil',
    href: '/tabs/profile',
    icon: 'profile',
    match: (pathname) => pathname.startsWith('/tabs/profile') || pathname.startsWith('/profile/'),
  },
];

interface TrainerDesktopShellProps {
  children: React.ReactNode;
}

export function TrainerDesktopShell({ children }: TrainerDesktopShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <View style={styles.page}>
      <View style={styles.sidebar}>
        <View style={styles.brand}>
          <AppLogo size={36} />
          <View style={styles.brandText}>
            <Text style={styles.brandTitle}>Programaciones</Text>
            <Text style={styles.brandSubtitle}>Panel entrenador</Text>
          </View>
        </View>

        <View style={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const isActive = item.match(pathname);
            return (
              <Pressable
                key={item.href}
                onPress={() => router.push(item.href)}
                style={[styles.navItem, isActive && styles.navItemActive]}
              >
                <AppIcon name={item.icon} size={18} color={isActive ? colors.accent : colors.textMuted} outlined={!isActive} />
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.sidebarFooter}>
          <Text style={styles.userName} numberOfLines={1}>
            {user?.name ?? 'Entrenador'}
          </Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {user?.email}
          </Text>
          <Button title="Cerrar sesión" variant="ghost" onPress={() => void signOut()} style={styles.signOutBtn} textStyle={styles.signOutText} />
        </View>
      </View>

      <View style={styles.main}>
        <View style={styles.content}>{children}</View>
      </View>
    </View>
  );
}

const SIDEBAR_WIDTH = 248;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    flexDirection: 'row',
    minHeight: '100vh' as unknown as number,
    backgroundColor: colors.background,
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xs,
  },
  brandText: {
    flex: 1,
  },
  brandTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  brandSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  nav: {
    gap: spacing.xs,
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
  },
  navItemActive: {
    backgroundColor: `${colors.accent}18`,
  },
  navLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  navLabelActive: {
    color: colors.text,
  },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    gap: 2,
  },
  userName: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  userEmail: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  signOutBtn: {
    alignSelf: 'flex-start',
    minHeight: 36,
    paddingHorizontal: 0,
  },
  signOutText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  main: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
  },
  content: {
    flex: 1,
    minHeight: '100vh' as unknown as number,
    width: '100%',
  },
});
