import { useRouter, type Href } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import type { AppIconName } from '@/constants/icons';
import { useAuth } from '@/hooks/useAuth';
import { useSupportUnreadBadge } from '@/hooks/useSupportUnreadBadge';
import { useTrainerNotifications } from '@/hooks/useTrainerNotifications';
import { isAdminRole } from '@/lib/athleteService';
import { formatNotificationWhen } from '@/lib/trainerNotifications';

type QuickLink = {
  href: Href;
  label: string;
  icon: AppIconName;
  badge?: number;
};

function formatToday() {
  return new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function TrainerMobileHome() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, counts, chatUnread, isLoading } = useTrainerNotifications();
  const { count: supportCount } = useSupportUnreadBadge();
  const isAdmin = isAdminRole(user?.role);
  const firstName = user?.name?.split(' ')[0] ?? 'entrenador';
  const pending = items.filter((item) => !item.done).slice(0, 6);

  const links: QuickLink[] = [
    {
      href: '/tabs/trainer',
      label: 'Atletas',
      icon: 'trainer',
      badge: counts.sessions + counts.intake + counts.appointment,
    },
    { href: '/trainer/chats', label: 'Chats', icon: 'chat', badge: chatUnread },
    { href: '/tabs/programs', label: 'Programaciones', icon: 'programs' },
    { href: '/trainer/template', label: 'Plantillas', icon: 'templates' },
    { href: '/library', label: 'Biblioteca', icon: 'video' },
    { href: '/profile/appointments', label: 'Citas', icon: 'calendar', badge: counts.appointment },
  ];

  if (isAdmin) {
    links.push(
      { href: '/trainer/support', label: 'Soporte', icon: 'support', badge: supportCount },
      { href: '/trainer/gyms', label: 'Gimnasios', icon: 'gym' },
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola, {firstName}</Text>
        <Text style={styles.date}>{formatToday()}</Text>
      </View>

      <View style={styles.summaryRow}>
        <SummaryTile label="Avisos" value={counts.total} tone="accent" />
        <SummaryTile label="Entrenos" value={counts.sessions} />
        <SummaryTile label="Mensajes" value={chatUnread} />
      </View>

      <Text style={styles.sectionTitle}>Accesos</Text>
      <View style={styles.linkGrid}>
        {links.map((link) => (
          <Pressable
            key={String(link.href)}
            onPress={() => router.push(link.href)}
            accessibilityRole="button"
            accessibilityLabel={
              link.badge ? `${link.label}, ${link.badge} avisos` : link.label
            }
            style={({ pressed }) => [styles.linkTile, pressed && styles.pressed]}
          >
            <View style={styles.linkIcon}>
              <AppIcon name={link.icon} size={20} color={colors.accent} />
              {link.badge ? (
                <View style={styles.linkBadge}>
                  <Text style={styles.linkBadgeText}>{link.badge > 9 ? '9+' : link.badge}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.linkLabel} numberOfLines={1}>
              {link.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Pendiente de revisar</Text>
      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : pending.length === 0 ? (
        <Text style={styles.empty}>No tienes avisos pendientes. Buen trabajo.</Text>
      ) : (
        <View style={styles.feed}>
          {pending.map((item, index) => {
            const when = formatNotificationWhen(item.occurredAt);
            return (
              <Pressable
                key={`${item.id}-${item.occurredAt ?? ''}`}
                onPress={() => router.push(item.href)}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.feedRow,
                  index > 0 && styles.feedRowBorder,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.feedCopy}>
                  <Text style={styles.feedTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.feedSubtitle} numberOfLines={2}>
                    {item.subtitle}
                  </Text>
                </View>
                {when ? <Text style={styles.feedWhen}>{when.date}</Text> : null}
              </Pressable>
            );
          })}
        </View>
      )}

      {counts.total > pending.length ? (
        <Pressable
          onPress={() => router.push('/tabs/profile')}
          style={({ pressed }) => [styles.moreLink, pressed && styles.pressed]}
        >
          <Text style={styles.moreLinkText}>Ver todos los avisos</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function SummaryTile({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: number;
  tone?: 'default' | 'accent';
}) {
  return (
    <View style={[styles.summaryTile, tone === 'accent' && styles.summaryTileAccent]}>
      <Text style={[styles.summaryValue, tone === 'accent' && styles.summaryValueAccent]}>
        {value}
      </Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  header: {
    gap: 4,
  },
  greeting: {
    ...typography.h2,
    color: colors.text,
  },
  date: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  summaryTile: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  summaryTileAccent: {
    borderColor: withAlpha(colors.accent, '55'),
    backgroundColor: withAlpha(colors.accent, '10'),
  },
  summaryValue: {
    ...typography.h2,
    color: colors.text,
  },
  summaryValueAccent: {
    color: colors.accent,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  sectionTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  linkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  linkTile: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 96,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  linkIcon: {
    position: 'relative',
  },
  linkBadge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  linkBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.black,
  },
  linkLabel: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
  },
  loader: {
    marginTop: spacing.md,
  },
  empty: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  feed: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  feedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  feedRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  feedCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  feedTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  feedSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 16,
  },
  feedWhen: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
    flexShrink: 0,
  },
  moreLink: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  moreLinkText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.88,
  },
});
