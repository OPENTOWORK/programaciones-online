import { Redirect, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

import { SupportTicketsTable } from '@/components/support/SupportTicketsTable';
import { TrainerOverviewKpis, type TrainerKpi } from '@/components/trainer/TrainerOverviewKpis';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useAdminSupportTickets } from '@/hooks/useAdminSupportTickets';
import { useAuth } from '@/hooks/useAuth';
import { isAdminRole } from '@/lib/athleteService';
import {
  SUPPORT_CATEGORY_LABELS,
  SUPPORT_CATEGORY_ORDER,
  SUPPORT_PRIORITY_LABELS,
  SUPPORT_PRIORITY_ORDER,
  SUPPORT_STATUS_LABELS,
  SUPPORT_STATUS_ORDER,
} from '@/lib/supportService';
import type { SupportTicketFilters } from '@/lib/supportTickets';

const TABLE_BREAKPOINT = 1000;
const SUPPORT_GREEN = '#4ADE80';

interface FilterOption {
  key: string;
  label: string;
  changes: Partial<SupportTicketFilters>;
  isActive: (filters: SupportTicketFilters) => boolean;
}

export default function AdminSupportScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const {
    visibleTickets,
    tickets,
    kpis,
    filters,
    patchFilters,
    isLoading,
    error,
    refresh,
  } = useAdminSupportTickets();

  // La RLS ya protege los datos; esto evita además que se abra la pantalla por URL.
  if (!isAdminRole(user?.role)) {
    return <Redirect href="/tabs/trainer" />;
  }

  const wide = width >= TABLE_BREAKPOINT;

  const kpiCards = useMemo<TrainerKpi[]>(
    () => [
      {
        key: 'open',
        label: 'Abiertos',
        value: kpis.open,
        icon: 'chat',
        tone: kpis.open > 0 ? 'warning' : 'neutral',
        onPress: () => patchFilters({ status: 'open' }),
      },
      {
        key: 'in-progress',
        label: 'En curso',
        value: kpis.inProgress,
        icon: 'time',
        tone: 'neutral',
        onPress: () => patchFilters({ status: 'in_progress' }),
      },
      {
        key: 'waiting',
        label: 'Esperando respuesta',
        value: kpis.waitingUser,
        icon: 'info',
        tone: 'neutral',
        onPress: () => patchFilters({ status: 'waiting_user' }),
      },
      {
        key: 'resolved-today',
        label: 'Resueltos hoy',
        value: kpis.resolvedToday,
        icon: 'check',
        tone: 'positive',
        onPress: () => patchFilters({ status: 'resolved' }),
      },
    ],
    [kpis, patchFilters],
  );

  const statusOptions = useMemo<FilterOption[]>(
    () => [
      {
        key: 'status-all',
        label: 'Todos',
        changes: { status: 'all' },
        isActive: (current) => current.status === 'all',
      },
      ...SUPPORT_STATUS_ORDER.map((status) => ({
        key: `status-${status}`,
        label: SUPPORT_STATUS_LABELS[status],
        changes: { status } as Partial<SupportTicketFilters>,
        isActive: (current: SupportTicketFilters) => current.status === status,
      })),
    ],
    [],
  );

  const roleOptions = useMemo<FilterOption[]>(
    () => [
      {
        key: 'role-all',
        label: 'Todos',
        changes: { role: 'all' },
        isActive: (current) => current.role === 'all',
      },
      {
        key: 'role-atleta',
        label: 'Atletas',
        changes: { role: 'atleta' },
        isActive: (current) => current.role === 'atleta',
      },
      {
        key: 'role-entrenador',
        label: 'Entrenadores',
        changes: { role: 'entrenador' },
        isActive: (current) => current.role === 'entrenador',
      },
    ],
    [],
  );

  const priorityOptions = useMemo<FilterOption[]>(
    () => [
      {
        key: 'priority-all',
        label: 'Todas',
        changes: { priority: 'all' },
        isActive: (current) => current.priority === 'all',
      },
      ...[...SUPPORT_PRIORITY_ORDER].reverse().map((priority) => ({
        key: `priority-${priority}`,
        label: SUPPORT_PRIORITY_LABELS[priority],
        changes: { priority } as Partial<SupportTicketFilters>,
        isActive: (current: SupportTicketFilters) => current.priority === priority,
      })),
    ],
    [],
  );

  const categoryOptions = useMemo<FilterOption[]>(
    () => [
      {
        key: 'category-all',
        label: 'Todas',
        changes: { category: 'all' },
        isActive: (current) => current.category === 'all',
      },
      ...SUPPORT_CATEGORY_ORDER.map((category) => ({
        key: `category-${category}`,
        label: SUPPORT_CATEGORY_LABELS[category],
        changes: { category } as Partial<SupportTicketFilters>,
        isActive: (current: SupportTicketFilters) => current.category === category,
      })),
    ],
    [],
  );

  const hasTickets = tickets.length > 0;

  return (
    <ScreenWrapper>
      <View style={[styles.header, !wide && styles.headerStacked]}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Soporte</Text>
          <Text style={styles.subtitle}>Gestiona las consultas de atletas y entrenadores.</Text>
        </View>
        <Button title="Actualizar" variant="outline" size="compact" onPress={refresh} />
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Reintentar" variant="outline" size="compact" onPress={refresh} />
        </View>
      ) : null}

      <View style={styles.kpis}>
        <TrainerOverviewKpis kpis={kpiCards} loading={isLoading} columns={wide ? 4 : 2} />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Solicitudes</Text>
          <View style={styles.countChip}>
            <Text style={styles.countChipText}>{visibleTickets.length}</Text>
          </View>
        </View>

        <View style={styles.searchBar}>
          <AppIcon name="search" size={15} color={colors.textMuted} />
          <TextInput
            value={filters.query}
            onChangeText={(value) => patchFilters({ query: value })}
            placeholder="Buscar por ticket, nombre, email o asunto..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            accessibilityLabel="Buscar solicitud"
          />
          {filters.query ? (
            <Pressable
              onPress={() => patchFilters({ query: '' })}
              hitSlop={8}
              accessibilityLabel="Limpiar búsqueda"
            >
              <AppIcon name="close" size={15} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        <FilterRow label="Estado" options={statusOptions} filters={filters} onChange={patchFilters} />
        <FilterRow label="Rol" options={roleOptions} filters={filters} onChange={patchFilters} />
        <FilterRow
          label="Prioridad"
          options={priorityOptions}
          filters={filters}
          onChange={patchFilters}
        />
        <FilterRow
          label="Categoría"
          options={categoryOptions}
          filters={filters}
          onChange={patchFilters}
        />

        {!isLoading && !hasTickets ? (
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: withAlpha(SUPPORT_GREEN, '1F') }]}>
              <AppIcon name="check" size={18} color={SUPPORT_GREEN} />
            </View>
            <Text style={styles.emptyTitle}>Todo al día</Text>
            <Text style={styles.emptyText}>No hay solicitudes de soporte pendientes.</Text>
          </View>
        ) : !isLoading && visibleTickets.length === 0 ? (
          <Text style={styles.noResults}>Ninguna solicitud coincide con estos filtros.</Text>
        ) : (
          <SupportTicketsTable
            tickets={visibleTickets}
            loading={isLoading}
            wide={wide}
            onOpenTicket={(ticketId) =>
              router.push({ pathname: '/trainer/support/[id]', params: { id: ticketId } })
            }
          />
        )}
      </View>
    </ScreenWrapper>
  );
}

function FilterRow({
  label,
  options,
  filters,
  onChange,
}: {
  label: string;
  options: FilterOption[];
  filters: SupportTicketFilters;
  onChange: (changes: Partial<SupportTicketFilters>) => void;
}) {
  return (
    <View style={styles.filterRow}>
      <Text style={styles.filterLabel}>{label}</Text>
      <View style={styles.filterChips}>
        {options.map((option) => {
          const active = option.isActive(filters);
          return (
            <Pressable
              key={option.key}
              onPress={() => onChange(option.changes)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.filterChip,
                active && styles.filterChipActive,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    flexWrap: 'wrap',
    marginTop: spacing.md,
    padding: spacing.sm + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: withAlpha(colors.danger, '4D'),
    backgroundColor: withAlpha(colors.danger, '10'),
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    flex: 1,
  },
  kpis: {
    marginTop: spacing.md,
  },
  section: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  countChip: {
    minWidth: 22,
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
  },
  countChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 38,
    maxWidth: 420,
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
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  filterLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    minWidth: 62,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    flex: 1,
  },
  filterChip: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  filterChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 11,
  },
  filterChipTextActive: {
    color: colors.black,
  },
  pressed: {
    opacity: 0.85,
  },
  empty: {
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  emptyIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  emptyTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  emptyText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  noResults: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontStyle: 'italic',
    paddingVertical: spacing.md,
  },
});
