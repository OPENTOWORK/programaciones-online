import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';

import { AppIcon } from '@/components/ui/AppIcon';
import { AppLogo } from '@/components/ui/AppLogo';
import { Button } from '@/components/ui/Button';
import { colors, spacing, typography } from '@/constants/theme';
import type { AppIconName } from '@/constants/icons';
import { useAuth } from '@/hooks/useAuth';

const SIDEBAR_WIDTH = 248;
const SIDEBAR_COLLAPSED_KEY = 'trainer-desktop-sidebar-collapsed';

type NavItem = {
  label: string;
  href: '/tabs/programs' | '/tabs/trainer' | '/library' | '/tabs/profile' | '/trainer/template';
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
  {
    label: 'Plantillas',
    href: '/trainer/template',
    icon: 'templates',
    match: (pathname) => pathname.startsWith('/trainer/template'),
  },
];

interface TrainerDesktopShellProps {
  children: React.ReactNode;
}

function readCollapsedPreference() {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
}

export function TrainerDesktopShell({ children }: TrainerDesktopShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(readCollapsedPreference());
  }, []);

  const setSidebarCollapsed = (next: boolean) => {
    setCollapsed(next);
    try {
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0');
    } catch {
      // ignore storage failures
    }
  };

  return (
    <View style={styles.page}>
      {!collapsed ? (
        <View style={styles.sidebar}>
          <View style={styles.brand}>
            <AppLogo size={36} />
            <View style={styles.brandText}>
              <Text style={styles.brandTitle}>Programaciones</Text>
              <Text style={styles.brandSubtitle}>Panel entrenador</Text>
            </View>
            <Pressable
              onPress={() => setSidebarCollapsed(true)}
              accessibilityLabel="Ocultar menú"
              hitSlop={8}
              style={({ pressed }) => [styles.toggleBtn, pressed && styles.toggleBtnPressed]}
            >
              <AppIcon name="chevronLeft" size={18} color={colors.textMuted} />
            </Pressable>
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
                  <AppIcon
                    name={item.icon}
                    size={18}
                    color={isActive ? colors.accent : colors.textMuted}
                    outlined={!isActive}
                  />
                  <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                    {item.label}
                  </Text>
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
            <Button
              title="Cerrar sesión"
              variant="ghost"
              onPress={() => void signOut()}
              style={styles.signOutBtn}
              textStyle={styles.signOutText}
            />
          </View>
        </View>
      ) : null}

      <View style={styles.main}>
        {collapsed ? (
          <Pressable
            onPress={() => setSidebarCollapsed(false)}
            accessibilityLabel="Mostrar menú"
            style={({ pressed }) => [styles.showMenuBtn, pressed && styles.toggleBtnPressed]}
          >
            <AppLogo size={22} />
            <AppIcon name="chevronRight" size={16} color={colors.textMuted} />
            <Text style={styles.showMenuLabel}>Menú</Text>
          </Pressable>
        ) : null}
        <View style={styles.content}>{children}</View>
      </View>
    </View>
  );
}

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
    minWidth: 0,
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
  toggleBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  toggleBtnPressed: {
    opacity: 0.85,
  },
  showMenuBtn: {
    position: 'absolute',
    top: spacing.md,
    left: 0,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  showMenuLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
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
