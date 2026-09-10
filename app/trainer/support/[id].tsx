import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { SupportConversation } from '@/components/support/SupportConversation';
import { SupportReplyBox } from '@/components/support/SupportReplyBox';
import {
  SupportPriorityBadge,
  SupportStatusBadge,
} from '@/components/support/SupportStatusBadge';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { ADMIN_SUPPORT_ROUTE } from '@/constants/support';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useSupportTicket } from '@/hooks/useSupportTicket';
import { fetchTeamStaffProfiles, isAdminRole } from '@/lib/athleteService';
import { getTrainerLeadProfileHref, safeGoBack } from '@/lib/navigation';
import {
  SUPPORT_CATEGORY_LABELS,
  SUPPORT_PRIORITY_LABELS,
  SUPPORT_PRIORITY_ORDER,
  SUPPORT_STATUS_LABELS,
  SUPPORT_STATUS_ORDER,
  formatTicketNumber,
  type SupportTicketPriority,
  type SupportTicketStatus,
} from '@/lib/supportService';
import { formatRelativeTime } from '@/lib/supportTickets';
import type { AthleteSummary } from '@/lib/types';

const WIDE_BREAKPOINT = 1000;

const ROLE_LABELS: Record<string, string> = {
  atleta: 'Atleta',
  entrenador: 'Entrenador',
  administrador: 'Administrador',
};

function formatDateTime(iso?: string) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminSupportTicketScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const {
    ticket,
    messages,
    isLoading,
    error,
    sending,
    updating,
    reply,
    changeTicket,
  } = useSupportTicket(id ?? '');

  const [admins, setAdmins] = useState<AthleteSummary[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void fetchTeamStaffProfiles()
      .then((staff) => {
        if (!cancelled) {
          setAdmins(staff.filter((member) => member.role === 'administrador'));
        }
      })
      .catch(() => {
        if (!cancelled) setAdmins([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const wide = width >= WIDE_BREAKPOINT;

  const assignOptions = useMemo(() => {
    const options = admins.map((admin) => ({
      id: admin.id,
      label: admin.id === user?.id ? `${admin.name} (tú)` : admin.name,
    }));

    if (user?.id && !options.some((option) => option.id === user.id)) {
      options.unshift({ id: user.id, label: 'Yo' });
    }

    return options;
  }, [admins, user?.id]);

  // La RLS ya protege los datos; esto evita además que se abra la pantalla por URL.
  if (!isAdminRole(user?.role)) {
    return <Redirect href="/tabs/trainer" />;
  }

  if (isLoading) {
    return (
      <ScreenWrapper>
        <SkeletonBlock height={14} width="22%" />
        <SkeletonBlock height={22} width="66%" style={styles.skeletonSpacer} />
        <View style={styles.skeletonThread}>
          <SkeletonBlock height={80} />
          <SkeletonBlock height={80} />
        </View>
      </ScreenWrapper>
    );
  }

  if (!ticket) {
    return (
      <ScreenWrapper>
        <Text style={styles.error}>{error ?? 'Esta solicitud no existe.'}</Text>
        <Button
          title="Volver a Soporte"
          variant="secondary"
          onPress={() => safeGoBack(router, ADMIN_SUPPORT_ROUTE)}
        />
      </ScreenWrapper>
    );
  }

  const applyChange = async (changes: Parameters<typeof changeTicket>[0]) => {
    setActionError(null);
    const result = await changeTicket(changes);
    if (result.error) setActionError(result.error);
  };

  return (
    <ScreenWrapper>
      <Pressable
        onPress={() => safeGoBack(router, ADMIN_SUPPORT_ROUTE)}
        accessibilityRole="button"
        accessibilityLabel="Volver a Soporte"
        style={({ pressed }) => [styles.backLink, pressed && styles.pressed]}
      >
        <AppIcon name="chevronLeft" size={15} color={colors.textMuted} />
        <Text style={styles.backLinkText}>Soporte</Text>
      </Pressable>

      <Text style={styles.ticketNumber}>{formatTicketNumber(ticket.ticketNumber)}</Text>
      <Text style={styles.subject}>{ticket.subject}</Text>
      <View style={styles.badgeRow}>
        <SupportStatusBadge status={ticket.status} />
        <SupportPriorityBadge priority={ticket.priority} />
      </View>

      {actionError ? <Text style={styles.error}>{actionError}</Text> : null}

      <View style={[styles.columns, !wide && styles.columnsStacked]}>
        <View style={[styles.mainColumn, !wide && styles.fullColumn]}>
          <Text style={styles.sectionTitle}>Conversación</Text>
          <SupportConversation
            messages={messages}
            requesterId={ticket.requesterId}
            requesterName={ticket.requesterName}
            requesterRole={ticket.requesterRole}
          />

          <View style={styles.block}>
            <Text style={styles.sectionTitle}>Responder al usuario</Text>
            <SupportReplyBox
              sending={sending}
              disabled={ticket.status === 'closed'}
              disabledReason="Esta solicitud está cerrada. Reábrela cambiando el estado para poder responder."
              submitLabel="Enviar respuesta"
              placeholder="Escribe una respuesta..."
              onSend={(message) => reply(message)}
            />
          </View>

          <View style={styles.block}>
            <Text style={styles.sectionTitle}>Nota interna</Text>
            <Text style={styles.blockHint}>
              Solo la ven los administradores. El usuario nunca la recibe.
            </Text>
            <SupportReplyBox
              sending={sending}
              tone="internal"
              submitLabel="Guardar nota"
              placeholder="Ej. El problema parece relacionado con la última actualización de Android."
              onSend={(message) => reply(message, { isInternal: true })}
            />
          </View>
        </View>

        <View style={[styles.sideColumn, !wide && styles.fullColumn]}>
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Usuario</Text>
            <Text style={styles.panelValue}>{ticket.requesterName}</Text>
            <Text style={styles.panelMuted}>{ticket.requesterEmail}</Text>
            <Text style={styles.panelMuted}>
              {ROLE_LABELS[ticket.requesterRole] ?? 'Usuario'}
            </Text>
            <Button
              title="Ver ficha"
              variant="outline"
              size="compact"
              onPress={() =>
                router.push(
                  getTrainerLeadProfileHref({
                    id: ticket.requesterId,
                    role: ticket.requesterRole,
                  }),
                )
              }
              style={styles.panelButton}
            />
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Ticket</Text>
            <PanelRow label="Número" value={formatTicketNumber(ticket.ticketNumber)} />
            <PanelRow label="Categoría" value={SUPPORT_CATEGORY_LABELS[ticket.category]} />
            <PanelRow label="Creado" value={formatDateTime(ticket.createdAt)} />
            <PanelRow
              label="Última actividad"
              value={formatRelativeTime(ticket.lastMessageAt)}
              last
            />
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Estado</Text>
            <View style={styles.optionChips}>
              {SUPPORT_STATUS_ORDER.map((status) => (
                <OptionChip
                  key={status}
                  label={SUPPORT_STATUS_LABELS[status]}
                  active={ticket.status === status}
                  disabled={updating}
                  onPress={() => void applyChange({ status: status as SupportTicketStatus })}
                />
              ))}
            </View>
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Prioridad</Text>
            <View style={styles.optionChips}>
              {SUPPORT_PRIORITY_ORDER.map((priority) => (
                <OptionChip
                  key={priority}
                  label={SUPPORT_PRIORITY_LABELS[priority]}
                  active={ticket.priority === priority}
                  disabled={updating}
                  onPress={() => void applyChange({ priority: priority as SupportTicketPriority })}
                />
              ))}
            </View>
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Asignado a</Text>
            <View style={styles.optionChips}>
              <OptionChip
                label="Sin asignar"
                active={!ticket.assignedAdminId}
                disabled={updating}
                onPress={() => void applyChange({ assignedAdminId: null })}
              />
              {assignOptions.map((option) => (
                <OptionChip
                  key={option.id}
                  label={option.label}
                  active={ticket.assignedAdminId === option.id}
                  disabled={updating}
                  onPress={() => void applyChange({ assignedAdminId: option.id })}
                />
              ))}
            </View>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
}

function PanelRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.panelRow, last && styles.panelRowLast]}>
      <Text style={styles.panelRowLabel}>{label}</Text>
      <Text style={styles.panelRowValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function OptionChip({
  label,
  active,
  disabled,
  onPress,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || active}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.optionChip,
        active && styles.optionChipActive,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.optionChipText, active && styles.optionChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  backLinkText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
  },
  ticketNumber: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subject: {
    ...typography.h2,
    color: colors.text,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  columns: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  columnsStacked: {
    flexDirection: 'column',
  },
  mainColumn: {
    flex: 7,
    minWidth: 0,
    gap: spacing.sm,
  },
  sideColumn: {
    flex: 3,
    minWidth: 0,
    gap: spacing.sm,
  },
  fullColumn: {
    flex: 0,
    width: '100%',
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  block: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  blockHint: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 17,
    marginTop: -4,
  },
  panel: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: 2,
  },
  panelTitle: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  panelValue: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  panelMuted: {
    ...typography.caption,
    color: colors.textMuted,
  },
  panelButton: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  panelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  panelRowLast: {
    borderBottomWidth: 0,
  },
  panelRowLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  panelRowValue: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
    flexShrink: 1,
  },
  optionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  optionChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  optionChipActive: {
    backgroundColor: withAlpha(colors.accent, '22'),
    borderColor: colors.accent,
  },
  optionChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 11,
  },
  optionChipTextActive: {
    color: colors.accent,
    fontWeight: '800',
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  skeletonSpacer: {
    marginTop: spacing.sm,
  },
  skeletonThread: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
});
