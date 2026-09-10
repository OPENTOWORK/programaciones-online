import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';

import { AppIcon } from '@/components/ui/AppIcon';
import { AppLogo } from '@/components/ui/AppLogo';
import { Button } from '@/components/ui/Button';
import { NavCountBadge } from '@/components/ui/NavCountBadge';
import { ThemePicker } from '@/components/ui/ThemePicker';
import { colors, spacing, typography, withAlpha } from '@/constants/theme';
import type { AppIconName } from '@/constants/icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuth } from '@/hooks/useAuth';
import { useSupportUnreadBadge } from '@/hooks/useSupportUnreadBadge';
import { useTrainerNotifications } from '@/hooks/useTrainerNotifications';
import { isAdminRole } from '@/lib/athleteService';

const SIDEBAR_WIDTH = 248;
const SIDEBAR_COLLAPSED_KEY = 'trainer-desktop-sidebar-collapsed';

type NavItem = {
  label: string;
  href:
    | '/tabs/programs'
    | '/tabs/trainer'
    | '/library'
    | '/tabs/profile'
    | '/trainer/template'
    | '/trainer/chats'
    | '/trainer/support'
    | '/trainer/gyms';
  icon: AppIconName;
  badge?: 'athletes' | 'chats' | 'profile' | 'support';
  /** Solo visible para administradores (la ruta también lo comprueba). */
  adminOnly?: boolean;
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
    badge: 'athletes',
    match: (pathname) =>
      pathname.startsWith('/tabs/trainer') ||
      pathname.startsWith('/trainer/athlete/') ||
      pathname.startsWith('/trainer/staff/') ||
      pathname.startsWith('/trainer/plan/'),
  },
  {
    label: 'Chats',
    href: '/trainer/chats',
    icon: 'chat',
    badge: 'chats',
    match: (pathname) =>
      pathname.startsWith('/trainer/chats') || pathname.startsWith('/trainer/chat/'),
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
    badge: 'profile',
    match: (pathname) =>
      pathname.startsWith('/tabs/profile') ||
      pathname.startsWith('/profile/'),
  },
  {
    label: 'Plantillas',
    href: '/trainer/template',
    icon: 'templates',
    match: (pathname) => pathname.startsWith('/trainer/template'),
  },
  {
    label: 'Soporte',
    href: '/trainer/support',
    icon: 'support',
    badge: 'support',
    adminOnly: true,
    match: (pathname) => pathname.startsWith('/trainer/support'),
  },
  {
    label: 'CRM Gimnasios',
    href: '/trainer/gyms',
    icon: 'gym',
    adminOnly: true,
    match: (pathname) => pathname.startsWith('/trainer/gyms'),
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
  const { nightMode, canChooseTheme, canToggleNightMode, toggleNightMode } = useAppTheme();
  const { counts, chatUnread } = useTrainerNotifications();
  const { count: supportCount } = useSupportUnreadBadge();
  const [collapsed, setCollapsed] = useState(false);

  const isAdmin = isAdminRole(user?.role);
  const navItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);
  const collapsedBadgeCount = counts.total + (isAdmin ? supportCount : 0);

  const badgeFor = (item: NavItem) => {
    if (item.badge === 'chats') return chatUnread;
    if (item.badge === 'profile') return counts.total;
    if (item.badge === 'support') return supportCount;
    if (item.badge === 'athletes') {
      return counts.sessions + counts.intake + counts.appointment;
    }
    return 0;
  };

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
            {navItems.map((item) => {
              const isActive = item.match(pathname);
              const badgeCount = badgeFor(item);
              return (
                <Pressable
                  key={item.href}
                  onPress={() => router.push(item.href)}
                  accessibilityLabel={
                    badgeCount > 0
                      ? `${item.label}, ${badgeCount} aviso${badgeCount === 1 ? '' : 's'}`
                      : item.label
                  }
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
                  <NavCountBadge count={badgeCount} />
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
            {canToggleNightMode ? (
              <Pressable
                onPress={toggleNightMode}
                accessibilityRole="button"
                accessibilityLabel={nightMode ? 'Activar modo día' : 'Activar modo noche'}
                accessibilityState={{ selected: nightMode }}
                style={({ pressed }) => [
                  styles.nightModeBtn,
                  nightMode && styles.nightModeBtnActive,
                  pressed && styles.toggleBtnPressed,
                ]}
              >
                <AppIcon
                  name={nightMode ? 'sunny' : 'moon'}
                  size={16}
                  color={nightMode ? colors.accent : colors.textSecondary}
                  outlined={!nightMode}
                />
                <Text style={[styles.nightModeLabel, nightMode && styles.nightModeLabelActive]}>
                  {nightMode ? 'Modo día' : 'Modo noche'}
                </Text>
              </Pressable>
            ) : null}
            {canChooseTheme ? <ThemePicker /> : null}
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
          <View style={styles.collapsedTools}>
            <Pressable
              onPress={() => setSidebarCollapsed(false)}
              accessibilityLabel={
                collapsedBadgeCount > 0
                  ? `Mostrar menú, ${collapsedBadgeCount} avisos pendientes`
                  : 'Mostrar menú'
              }
              style={({ pressed }) => [styles.showMenuBtn, pressed && styles.toggleBtnPressed]}
            >
              <AppLogo size={22} />
              <AppIcon name="chevronRight" size={16} color={colors.textMuted} />
              <Text style={styles.showMenuLabel}>Menú</Text>
              <NavCountBadge count={collapsedBadgeCount} />
            </Pressable>
            {canToggleNightMode ? (
              <Pressable
                onPress={toggleNightMode}
                accessibilityRole="button"
                accessibilityLabel={nightMode ? 'Activar modo día' : 'Activar modo noche'}
                accessibilityState={{ selected: nightMode }}
                style={({ pressed }) => [
                  styles.collapsedNightBtn,
                  nightMode && styles.nightModeBtnActive,
                  pressed && styles.toggleBtnPressed,
                ]}
              >
                <AppIcon
                  name={nightMode ? 'sunny' : 'moon'}
                  size={16}
                  color={nightMode ? colors.accent : colors.textSecondary}
                  outlined={!nightMode}
                />
              </Pressable>
            ) : null}
            {canChooseTheme ? <ThemePicker compact /> : null}
          </View>
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
  collapsedTools: {
    position: 'absolute',
    top: spacing.md,
    left: 0,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: spacing.xs,
    maxWidth: 280,
  },
  showMenuBtn: {
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
  collapsedNightBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
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
    backgroundColor: withAlpha(colors.accent, '18'),
  },
  navLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    flex: 1,
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
  nightModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    cursor: 'pointer',
  },
  nightModeBtnActive: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '18'),
  },
  nightModeLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  nightModeLabelActive: {
    color: colors.accent,
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
