import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { SupportConversation } from '@/components/support/SupportConversation';
import { SupportReplyBox } from '@/components/support/SupportReplyBox';
import { SupportStatusBadge } from '@/components/support/SupportStatusBadge';
import { Button } from '@/components/ui/Button';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { SUPPORT_ROUTE } from '@/constants/support';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { useSupportTicket } from '@/hooks/useSupportTicket';
import { safeGoBack } from '@/lib/navigation';
import { SUPPORT_CATEGORY_LABELS, formatTicketNumber } from '@/lib/supportService';

function formatCreatedAt(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function SupportTicketScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { ticket, messages, isLoading, error, sending, reply } = useSupportTicket(id ?? '');

  if (isLoading) {
    return (
      <ScreenWrapper>
        <SkeletonBlock height={14} width="26%" />
        <SkeletonBlock height={22} width="72%" style={styles.skeletonSpacer} />
        <SkeletonBlock height={20} width={110} radius={borderRadius.full} style={styles.skeletonSpacer} />
        <View style={styles.skeletonThread}>
          <SkeletonBlock height={72} />
          <SkeletonBlock height={72} />
        </View>
      </ScreenWrapper>
    );
  }

  if (!ticket) {
    return (
      <ScreenWrapper>
        <Text style={styles.error}>
          {error ?? 'Esta solicitud no existe o no tienes acceso a ella.'}
        </Text>
        <Button
          title="Volver a Contacto"
          variant="secondary"
          onPress={() => safeGoBack(router, SUPPORT_ROUTE)}
        />
      </ScreenWrapper>
    );
  }

  const closed = ticket.status === 'closed';

  return (
    <ScreenWrapper>
      <Text style={styles.ticketNumber}>{formatTicketNumber(ticket.ticketNumber)}</Text>
      <Text style={styles.subject}>{ticket.subject}</Text>

      <View style={styles.metaRow}>
        <SupportStatusBadge status={ticket.status} />
        <Text style={styles.meta}>{SUPPORT_CATEGORY_LABELS[ticket.category]}</Text>
        <Text style={styles.meta}>·</Text>
        <Text style={styles.meta}>Creada el {formatCreatedAt(ticket.createdAt)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conversación</Text>
        <SupportConversation
          messages={messages}
          requesterId={ticket.requesterId}
          requesterName={ticket.requesterName}
          requesterRole={ticket.requesterRole}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tu respuesta</Text>
        <SupportReplyBox
          sending={sending}
          disabled={closed}
          disabledReason="No se pueden enviar nuevas respuestas a una solicitud cerrada."
          submitLabel="Enviar respuesta"
          placeholder="Añade más detalles o responde al equipo..."
          onSend={(message) => reply(message)}
        />
        {closed ? (
          <Button
            title="Crear nueva solicitud"
            variant="outline"
            size="compact"
            onPress={() => router.replace(SUPPORT_ROUTE)}
            style={styles.newTicketButton}
          />
        ) : null}
      </View>

      <Button
        title="Volver a Contacto"
        variant="secondary"
        onPress={() => safeGoBack(router, SUPPORT_ROUTE)}
        style={styles.backButton}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  ticketNumber: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subject: {
    ...typography.h3,
    color: colors.text,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  section: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  newTicketButton: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  backButton: {
    marginTop: spacing.xl,
  },
  error: {
    ...typography.bodySmall,
    color: colors.danger,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  skeletonSpacer: {
    marginTop: spacing.sm,
  },
  skeletonThread: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
});
