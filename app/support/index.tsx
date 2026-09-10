import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { SupportForm } from '@/components/support/SupportForm';
import {
  SupportTicketCard,
  SupportTicketCardSkeleton,
} from '@/components/support/SupportTicketCard';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SUPPORT_EMAIL } from '@/constants/support';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useMySupportTickets } from '@/hooks/useMySupportTickets';
import { openExternalUrl } from '@/lib/openExternalUrl';
import { takeSupportPrefill } from '@/lib/supportPrefill';
import { createSupportTicket, type SupportCategory } from '@/lib/supportService';

type SupportTab = 'new' | 'mine';

export default function SupportScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { tickets, isLoading, error, refresh } = useMySupportTickets();
  const [tab, setTab] = useState<SupportTab>('new');
  const [sending, setSending] = useState(false);
  const supportPrefill = useMemo(() => takeSupportPrefill(), []);

  const handleSubmit = useCallback(
    async (input: { category: SupportCategory; subject: string; message: string }) => {
      if (sending) return { error: 'Ya se está enviando tu solicitud.' };

      setSending(true);
      const result = await createSupportTicket(input);
      setSending(false);

      if (!result.error) refresh();
      return result;
    },
    [refresh, sending],
  );

  if (!user) {
    return (
      <ScreenWrapper>
        <Text style={styles.title}>Contacto</Text>
        <Text style={styles.subtitle}>
          Entra en tu cuenta para enviarnos una consulta y poder seguir su estado.
        </Text>
        <Button title="Iniciar sesión" onPress={() => router.push('/auth/login')} />
      </ScreenWrapper>
    );
  }

  const unreadTotal = tickets.reduce((sum, ticket) => sum + ticket.unreadForUser, 0);

  return (
    <ScreenWrapper>
      <Text style={styles.title}>Contacto</Text>
      <Text style={styles.subtitle}>
        ¿Necesitas ayuda? Envíanos tu consulta y nuestro equipo de soporte te responderá lo antes
        posible.
      </Text>

      <View style={styles.tabs}>
        <Pressable
          onPress={() => setTab('new')}
          accessibilityRole="button"
          accessibilityState={{ selected: tab === 'new' }}
          style={({ pressed }) => [
            styles.tab,
            tab === 'new' && styles.tabActive,
            pressed && styles.tabPressed,
          ]}
        >
          <Text style={[styles.tabText, tab === 'new' && styles.tabTextActive]}>
            Nueva solicitud
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('mine')}
          accessibilityRole="button"
          accessibilityState={{ selected: tab === 'mine' }}
          style={({ pressed }) => [
            styles.tab,
            tab === 'mine' && styles.tabActive,
            pressed && styles.tabPressed,
          ]}
        >
          <Text style={[styles.tabText, tab === 'mine' && styles.tabTextActive]}>
            Mis solicitudes
          </Text>
          {unreadTotal > 0 ? (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{unreadTotal > 9 ? '9+' : unreadTotal}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {tab === 'new' ? (
        <SupportForm
          sending={sending}
          onSubmit={handleSubmit}
          onSeeTickets={() => setTab('mine')}
          initialCategory={supportPrefill?.category ?? 'technical'}
          initialSubject={supportPrefill?.subject ?? ''}
          initialMessage={supportPrefill?.message ?? ''}
        />
      ) : (
        <View style={styles.list}>
          {isLoading ? (
            <>
              <SupportTicketCardSkeleton />
              <SupportTicketCardSkeleton />
            </>
          ) : tickets.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <AppIcon name="support" size={19} color={colors.textMuted} outlined />
              </View>
              <Text style={styles.emptyTitle}>No tienes solicitudes de soporte.</Text>
              <Text style={styles.emptyText}>
                Si necesitas ayuda, puedes enviarnos una consulta desde aquí.
              </Text>
              <Button
                title="Nueva solicitud"
                variant="outline"
                size="compact"
                onPress={() => setTab('new')}
              />
            </View>
          ) : (
            tickets.map((ticket) => (
              <SupportTicketCard
                key={ticket.id}
                ticket={ticket}
                onPress={() =>
                  router.push({ pathname: '/support/[id]', params: { id: ticket.id } })
                }
              />
            ))
          )}
        </View>
      )}

      <Pressable
        onPress={() => void openExternalUrl(`mailto:${SUPPORT_EMAIL}`)}
        accessibilityRole="link"
        accessibilityLabel={`Escribir a ${SUPPORT_EMAIL}`}
        style={({ pressed }) => [styles.emailRow, pressed && styles.tabPressed]}
      >
        <Text style={styles.emailText}>
          También puedes escribirnos a <Text style={styles.emailLink}>{SUPPORT_EMAIL}</Text>
        </Text>
      </Pressable>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    padding: 2,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  tabActive: {
    backgroundColor: colors.accent,
  },
  tabPressed: {
    opacity: 0.85,
  },
  tabText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  tabTextActive: {
    color: colors.black,
  },
  tabBadge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: borderRadius.full,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '800',
    fontSize: 10,
    lineHeight: 13,
  },
  list: {
    gap: spacing.sm,
  },
  empty: {
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  emptyIcon: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  emailRow: {
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  emailText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  emailLink: {
    ...typography.caption,
    color: colors.accentBlue,
    fontWeight: '700',
  },
});
