import { usePathname, useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/AppIcon';
import { AppLogo } from '@/components/ui/AppLogo';
import { Button } from '@/components/ui/Button';
import { ThemePicker } from '@/components/ui/ThemePicker';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import type { AppIconName } from '@/constants/icons';
import { useAuth } from '@/hooks/useAuth';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useGym } from '@/hooks/useGym';

const SIDEBAR_WIDTH = 236;
const WIDE_BREAKPOINT = 1024;

type GymNavItem = {
  label: string;
  href:
    | '/gym'
    | '/gym/finance'
    | '/gym/shop'
    | '/gym/bookings'
    | '/gym/schedule'
    | '/gym/tasks'
    | '/gym/members'
    | '/gym/chat'
    | '/gym/classes'
    | '/gym/library'
    | '/gym/training'
    | '/gym/training-calendar'
    | '/gym/tv'
    | '/gym/settings';
  icon: AppIconName;
  /** Solo lo ven los roles de gestión del gimnasio. */
  manageOnly?: boolean;
  match: (pathname: string) => boolean;
};

const NAV_ITEMS: GymNavItem[] = [
  { label: 'Panel de control', href: '/gym', icon: 'stats', match: (path) => path === '/gym' },
  {
    label: 'Panel financiero',
    href: '/gym/finance',
    icon: 'wallet',
    manageOnly: true,
    match: (path) => path.startsWith('/gym/finance'),
  },
  {
    label: 'Tienda',
    href: '/gym/shop',
    icon: 'shop',
    match: (path) => path.startsWith('/gym/shop'),
  },
  {
    label: 'Reservas',
    href: '/gym/bookings',
    icon: 'check',
    match: (path) => path.startsWith('/gym/bookings'),
  },
  {
    label: 'Horario',
    href: '/gym/schedule',
    icon: 'calendar',
    match: (path) => path.startsWith('/gym/schedule'),
  },
  {
    label: 'Tareas',
    href: '/gym/tasks',
    icon: 'templates',
    match: (path) => path.startsWith('/gym/tasks'),
  },
  {
    label: 'Miembros',
    href: '/gym/members',
    icon: 'profile',
    match: (path) => path.startsWith('/gym/members'),
  },
  {
    label: 'Chat',
    href: '/gym/chat',
    icon: 'chat',
    match: (path) => path.startsWith('/gym/chat'),
  },
  {
    label: 'Clases y tarifas',
    href: '/gym/classes',
    icon: 'programs',
    manageOnly: true,
    match: (path) => path.startsWith('/gym/classes'),
  },
  {
    label: 'Biblioteca de vídeos',
    href: '/gym/library',
    icon: 'video',
    match: (path) => path.startsWith('/gym/library'),
  },
  {
    label: 'Entrenamientos',
    href: '/gym/training',
    icon: 'strength',
    match: (path) => path === '/gym/training',
  },
  {
    label: 'Calendario de entrenos',
    href: '/gym/training-calendar',
    icon: 'frequency',
    match: (path) => path.startsWith('/gym/training-calendar'),
  },
  {
    label: 'Configuración',
    href: '/gym/settings',
    icon: 'settings',
    manageOnly: true,
    match: (path) => path.startsWith('/gym/settings'),
  },
];

export function GymShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const { user, signOut } = useAuth();
  const { gym, gymRole, memberships, permissions, selectGym } = useGym();
  const { nightMode, canChooseTheme, canToggleNightMode, toggleNightMode } = useAppTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const wide = width >= WIDE_BREAKPOINT;
  const navItems = NAV_ITEMS.filter((item) => !item.manageOnly || permissions.canManage);
  const programsActive =
    pathname.startsWith('/tabs/programs') ||
    pathname.startsWith('/plan/') ||
    pathname.startsWith('/program/');

  const go = (href: GymNavItem['href'] | '/tabs/programs') => {
    setDrawerOpen(false);
    router.push(href as Href);
  };

  const nav = (
    <ScrollView style={styles.navScroll} contentContainerStyle={styles.nav} showsVerticalScrollIndicator={false}>
      {navItems.map((item) => {
        const active = item.match(pathname);

        return (
          <Pressable
            key={item.href}
            onPress={() => go(item.href)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [
              styles.navItem,
              active && styles.navItemActive,
              pressed && styles.navItemPressed,
            ]}
          >
            <AppIcon
              name={item.icon}
              size={17}
              color={active ? colors.accent : colors.textMuted}
              outlined={!active}
            />
            <Text style={[styles.navLabel, active && styles.navLabelActive]} numberOfLines={1}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}

      <Pressable
        onPress={() => go('/tabs/programs')}
        accessibilityRole="button"
        accessibilityState={{ selected: programsActive }}
        style={({ pressed }) => [
          styles.programsNavItem,
          programsActive && styles.programsNavItemActive,
          pressed && styles.navItemPressed,
        ]}
      >
        <AppIcon
          name="programs"
          size={17}
          color={programsActive ? '#1A1500' : '#3D3200'}
          outlined={!programsActive}
        />
        <Text
          style={[styles.programsNavLabel, programsActive && styles.programsNavLabelActive]}
          numberOfLines={1}
        >
          Programaciones
        </Text>
      </Pressable>
    </ScrollView>
  );

  const sidebarContent = (
    <>
      <Pressable
        onPress={() => go('/gym/tv')}
        accessibilityRole="button"
        accessibilityLabel="Ver entrenos para las TVs"
        style={({ pressed }) => [styles.brand, pressed && styles.navItemPressed]}
      >
        <AppLogo size={32} />
        <View style={styles.brandCopy}>
          <Text style={styles.brandTitle} numberOfLines={1}>
            {gym?.name ?? 'Gimnasio'}
          </Text>
          <Text style={styles.brandSubtitle} numberOfLines={1}>
            {gymRole ? `Panel · ${gymRole}` : 'CRM Gimnasios'}
          </Text>
        </View>
        {!wide ? (
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              setDrawerOpen(false);
            }}
            hitSlop={8}
            accessibilityLabel="Cerrar menú"
            style={({ pressed }) => [styles.iconBtn, pressed && styles.navItemPressed]}
          >
            <AppIcon name="close" size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </Pressable>

      {memberships.length > 1 ? (
        <View style={styles.gymSwitcher}>
          {memberships.map((entry) => (
            <Pressable
              key={entry.gym.id}
              onPress={() => selectGym(entry.gym.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: entry.gym.id === gym?.id }}
              style={({ pressed }) => [
                styles.gymChip,
                entry.gym.id === gym?.id && styles.gymChipActive,
                pressed && styles.navItemPressed,
              ]}
            >
              <Text
                style={[
                  styles.gymChipText,
                  entry.gym.id === gym?.id && styles.gymChipTextActive,
                ]}
                numberOfLines={1}
              >
                {entry.gym.name}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {nav}

      <View style={styles.footer}>
        <Text style={styles.footerName} numberOfLines={1}>
          {user?.name ?? 'Usuario'}
        </Text>
        <Text style={styles.footerEmail} numberOfLines={1}>
          {user?.email ?? ''}
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
              pressed && styles.navItemPressed,
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
          size="compact"
          onPress={() => void signOut()}
          style={styles.footerButton}
        />
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.page} edges={['top']}>
      <View style={styles.row}>
        {wide ? <View style={styles.sidebar}>{sidebarContent}</View> : null}

        <View style={styles.main}>
          {!wide ? (
            <View style={styles.topBar}>
              <Pressable
                onPress={() => setDrawerOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Abrir menú"
                style={({ pressed }) => [styles.iconBtn, pressed && styles.navItemPressed]}
              >
                <AppIcon name="dragHandle" size={20} color={colors.textSecondary} />
              </Pressable>
              <Pressable
                onPress={() => go('/gym/tv')}
                accessibilityRole="button"
                accessibilityLabel="Ver entrenos para las TVs"
                style={({ pressed }) => [styles.topBarTitleBtn, pressed && styles.navItemPressed]}
              >
                <Text style={styles.topBarTitle} numberOfLines={1}>
                  {gym?.name ?? 'CRM Gimnasios'}
                </Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.content}>{children}</View>
        </View>

        {!wide && drawerOpen ? (
          <View style={styles.drawerOverlay}>
            <Pressable
              style={StyleSheet.absoluteFill}
              accessibilityLabel="Cerrar menú"
              accessibilityRole="button"
              onPress={() => setDrawerOpen(false)}
            />
            <View style={styles.drawer}>{sidebarContent}</View>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 0,
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    flexDirection: 'column',
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingVertical: spacing.md,
  },
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    flexDirection: 'row',
    zIndex: 50,
  },
  drawer: {
    width: SIDEBAR_WIDTH,
    flexDirection: 'column',
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingVertical: spacing.md,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  brandCopy: {
    flex: 1,
    minWidth: 0,
  },
  brandTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '800',
  },
  brandSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  gymSwitcher: {
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  gymChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  gymChipActive: {
    backgroundColor: withAlpha(colors.accent, '1A'),
  },
  gymChipText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  gymChipTextActive: {
    color: colors.accent,
    fontWeight: '700',
  },
  navScroll: {
    flex: 1,
  },
  nav: {
    paddingHorizontal: spacing.sm,
    gap: 2,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 9,
    borderRadius: borderRadius.sm,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  navItemActive: {
    backgroundColor: withAlpha(colors.accent, '14'),
  },
  navItemPressed: {
    opacity: 0.75,
  },
  navLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    flex: 1,
  },
  navLabelActive: {
    color: colors.accent,
    fontWeight: '800',
  },
  programsNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#FFD400',
    backgroundColor: '#FFE566',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 0 14px rgba(255, 212, 0, 0.55)',
        } as object)
      : {
          shadowColor: '#FFD400',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.65,
          shadowRadius: 10,
          elevation: 6,
        }),
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  programsNavItemActive: {
    backgroundColor: '#FFD84D',
    borderColor: '#FFC700',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 0 18px rgba(255, 200, 0, 0.75)',
        } as object)
      : {
          shadowOpacity: 0.85,
          shadowRadius: 12,
        }),
  },
  programsNavLabel: {
    ...typography.caption,
    color: '#3D3200',
    fontWeight: '800',
    flex: 1,
  },
  programsNavLabelActive: {
    color: '#1A1500',
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerName: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
  },
  footerEmail: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
    marginBottom: spacing.xs,
  },
  nightModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'stretch',
    marginBottom: spacing.xs,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
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
  footerButton: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  main: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  topBarTitleBtn: {
    flex: 1,
    minWidth: 0,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  topBarTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  iconBtn: {
    padding: 4,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  content: {
    flex: 1,
    minHeight: 0,
  },
});
