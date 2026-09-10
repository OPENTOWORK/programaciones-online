import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ClientStatusBadge } from '@/components/trainer/ClientStatusBadge';
import { AppIcon } from '@/components/ui/AppIcon';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { formatPlanDateDisplay } from '@/lib/planValidity';
import type { TrainerClientRow, TrainerClientStatus } from '@/lib/trainerOverview';

type ClientFilter = 'all' | 'active' | 'no_plan' | 'ending_soon' | 'ended';

const FILTERS: Array<{ key: ClientFilter; label: string }> = [
  { key: 'all', label: 'Todos' },
  { key: 'active', label: 'Activos' },
  { key: 'no_plan', label: 'Sin programa' },
  { key: 'ending_soon', label: 'Terminan pronto' },
  { key: 'ended', label: 'Finalizados' },
];

const ACTIVE_STATUSES: TrainerClientStatus[] = ['active', 'upcoming'];

function matchesFilter(client: TrainerClientRow, filter: ClientFilter) {
  if (filter === 'all') return true;
  if (filter === 'active') return ACTIVE_STATUSES.includes(client.status);
  return client.status === filter;
}

function formatShortDate(iso?: string | null) {
  if (!iso) return '—';
  const date = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function formatValidUntil(client: TrainerClientRow) {
  if (client.status === 'no_plan') return '—';
  if (client.validUntil === null || client.validUntil === undefined) return 'Indefinido';
  return formatPlanDateDisplay(client.validUntil) || '—';
}

function formatValidFrom(client: TrainerClientRow) {
  if (!client.validFrom) return '—';
  return formatPlanDateDisplay(client.validFrom) || '—';
}

export function TrainerClientsTable({
  clients,
  loading = false,
  wide,
  onOpenClient,
}: {
  clients: readonly TrainerClientRow[];
  loading?: boolean;
  wide: boolean;
  onOpenClient: (athleteId: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ClientFilter>('all');

  const counts = useMemo(() => {
    const result: Record<ClientFilter, number> = {
      all: clients.length,
      active: 0,
      no_plan: 0,
      ending_soon: 0,
      ended: 0,
    };

    for (const client of clients) {
      if (ACTIVE_STATUSES.includes(client.status)) result.active += 1;
      if (client.status === 'no_plan') result.no_plan += 1;
      if (client.status === 'ending_soon') result.ending_soon += 1;
      if (client.status === 'ended') result.ended += 1;
    }

    return result;
  }, [clients]);

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return clients.filter((client) => {
      if (!matchesFilter(client, filter)) return false;
      if (!normalized) return true;
      return (
        client.athlete.name.toLowerCase().includes(normalized) ||
        client.athlete.email.toLowerCase().includes(normalized)
      );
    });
  }, [clients, filter, query]);

  if (loading) {
    return (
      <View style={styles.skeletonList}>
        {[0, 1, 2].map((index) => (
          <View key={index} style={styles.skeletonRow}>
            <SkeletonBlock height={32} width={32} radius={borderRadius.full} />
            <View style={styles.flex}>
              <SkeletonBlock height={14} width="34%" />
              <SkeletonBlock height={12} width="52%" style={styles.skeletonSpacer} />
            </View>
            <SkeletonBlock height={20} width={84} radius={borderRadius.full} />
          </View>
        ))}
      </View>
    );
  }

  if (clients.length === 0) {
    return (
      <Text style={styles.emptyText}>
        Este entrenador todavía no tiene clientes asignados en el tablero.
      </Text>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={[styles.toolbar, !wide && styles.toolbarStacked]}>
        <View style={styles.searchBar}>
          <AppIcon name="search" size={15} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar por nombre o email..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            accessibilityLabel="Buscar cliente"
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel="Limpiar búsqueda">
              <AppIcon name="close" size={15} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.filters}>
          {FILTERS.map((option) => {
            const selected = filter === option.key;
            if (option.key !== 'all' && counts[option.key] === 0 && !selected) return null;

            return (
              <Pressable
                key={option.key}
                onPress={() => setFilter(option.key)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={({ pressed }) => [
                  styles.chip,
                  selected && styles.chipActive,
                  pressed && styles.chipPressed,
                ]}
              >
                <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                  {option.label} · {counts[option.key]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {wide ? (
        <View style={styles.table}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, styles.colClient]}>Cliente</Text>
            <Text style={[styles.headerCell, styles.colStatus]}>Estado</Text>
            <Text style={[styles.headerCell, styles.colProgram]}>Programa actual</Text>
            <Text style={[styles.headerCell, styles.colDate]}>Inicio</Text>
            <Text style={[styles.headerCell, styles.colDate]}>Fin</Text>
            <Text style={[styles.headerCell, styles.colLast]}>Último entreno</Text>
            <View style={styles.colChevron} />
          </View>

          {visible.length === 0 ? (
            <Text style={styles.noResults}>Sin resultados para esta búsqueda.</Text>
          ) : (
            visible.map((client, index) => (
              <Pressable
                key={client.athlete.id}
                onPress={() => onOpenClient(client.athlete.id)}
                accessibilityRole="button"
                accessibilityLabel={`Abrir ficha de ${client.athlete.name}`}
                style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
                  styles.bodyRow,
                  index === visible.length - 1 && styles.bodyRowLast,
                  hovered && styles.bodyRowHovered,
                  pressed && styles.bodyRowPressed,
                ]}
              >
                <View style={[styles.colClient, styles.clientCell]}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{client.athlete.avatarInitials}</Text>
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.clientName} numberOfLines={1}>
                      {client.athlete.name}
                    </Text>
                    <Text style={styles.clientEmail} numberOfLines={1}>
                      {client.athlete.email}
                    </Text>
                  </View>
                  {client.pendingAlerts > 0 ? (
                    <View style={styles.alertBadge}>
                      <Text style={styles.alertBadgeText}>
                        {client.pendingAlerts > 99 ? '99+' : client.pendingAlerts}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.colStatus}>
                  <ClientStatusBadge status={client.status} />
                </View>

                <Text style={[styles.cell, styles.colProgram]} numberOfLines={1}>
                  {client.planTitle ?? '—'}
                </Text>
                <Text style={[styles.cell, styles.colDate]} numberOfLines={1}>
                  {formatValidFrom(client)}
                </Text>
                <Text style={[styles.cell, styles.colDate]} numberOfLines={1}>
                  {formatValidUntil(client)}
                </Text>
                <Text style={[styles.cell, styles.colLast]} numberOfLines={1}>
                  {formatShortDate(client.lastWorkoutDate)}
                </Text>
                <View style={styles.colChevron}>
                  <AppIcon name="chevronRight" size={16} color={colors.textMuted} />
                </View>
              </Pressable>
            ))
          )}
        </View>
      ) : (
        <View style={styles.cardList}>
          {visible.length === 0 ? (
            <Text style={styles.noResults}>Sin resultados para esta búsqueda.</Text>
          ) : (
            visible.map((client) => (
              <Pressable
                key={client.athlete.id}
                onPress={() => onOpenClient(client.athlete.id)}
                accessibilityRole="button"
                accessibilityLabel={`Abrir ficha de ${client.athlete.name}`}
                style={({ pressed }) => [styles.card, pressed && styles.bodyRowPressed]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{client.athlete.avatarInitials}</Text>
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.clientName} numberOfLines={1}>
                      {client.athlete.name}
                    </Text>
                    <Text style={styles.clientEmail} numberOfLines={1}>
                      {client.athlete.email}
                    </Text>
                  </View>
                  <ClientStatusBadge status={client.status} />
                </View>

                <View style={styles.cardMeta}>
                  <Text style={styles.cardMetaText} numberOfLines={1}>
                    {client.planTitle ?? 'Sin programación'}
                  </Text>
                  <Text style={styles.cardMetaText}>
                    {formatValidFrom(client)} – {formatValidUntil(client)}
                  </Text>
                  <Text style={styles.cardMetaText}>
                    Último entreno: {formatShortDate(client.lastWorkoutDate)}
                  </Text>
                </View>
              </Pressable>
            ))
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  flex: {
    flex: 1,
    minWidth: 0,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  toolbarStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexGrow: 1,
    maxWidth: 340,
    height: 38,
    paddingHorizontal: spacing.sm + 2,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    ...typography.bodySmall,
    color: colors.text,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipPressed: {
    opacity: 0.85,
  },
  chipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  chipTextActive: {
    color: colors.black,
  },
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerCell: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    fontSize: 10,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  bodyRowLast: {
    borderBottomWidth: 0,
  },
  bodyRowHovered: {
    backgroundColor: colors.surfaceLight,
  },
  bodyRowPressed: {
    opacity: 0.82,
  },
  colClient: {
    flex: 2.4,
  },
  colStatus: {
    flex: 1.2,
  },
  colProgram: {
    flex: 1.8,
  },
  colDate: {
    flex: 1,
  },
  colLast: {
    flex: 1.1,
  },
  colChevron: {
    width: 20,
    alignItems: 'flex-end',
  },
  clientCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.accentBlue}22`,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    ...typography.caption,
    color: colors.accentBlue,
    fontWeight: '700',
  },
  clientName: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  clientEmail: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  cell: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  alertBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: borderRadius.full,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    flexShrink: 0,
  },
  alertBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
    fontSize: 10,
    lineHeight: 12,
  },
  cardList: {
    gap: spacing.sm,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    padding: spacing.sm + 4,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardMeta: {
    gap: 2,
  },
  cardMetaText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  noResults: {
    ...typography.bodySmall,
    color: colors.textMuted,
    padding: spacing.md,
    fontStyle: 'italic',
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    lineHeight: 20,
  },
  skeletonList: {
    gap: spacing.sm,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  skeletonSpacer: {
    marginTop: 6,
  },
});
