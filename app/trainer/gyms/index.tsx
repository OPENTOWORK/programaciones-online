import { Redirect, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { TrainerOverviewKpis, type TrainerKpi } from '@/components/trainer/TrainerOverviewKpis';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { Modal } from 'react-native';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useAdminGyms } from '@/hooks/useAdminGyms';
import { useAuth } from '@/hooks/useAuth';
import { isAdminRole } from '@/lib/athleteService';
import { createGym } from '@/lib/gymAdminService';
import { GYM_STATUS_LABELS, type GymStatus } from '@/lib/gymTypes';

const TABLE_BREAKPOINT = 1000;

const STATUS_COLORS: Record<GymStatus, string> = {
  active: '#4ADE80',
  trial: colors.accentBlue,
  suspended: colors.warning,
  cancelled: colors.danger,
};

const STATUS_FILTERS: Array<{ key: GymStatus | 'all'; label: string }> = [
  { key: 'all', label: 'Todos' },
  { key: 'active', label: 'Activos' },
  { key: 'trial', label: 'En prueba' },
  { key: 'suspended', label: 'Suspendidos' },
  { key: 'cancelled', label: 'Cancelados' },
];

function GymStatusBadge({ status }: { status: GymStatus }) {
  const color = STATUS_COLORS[status];
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: withAlpha(color, '1F'), borderColor: withAlpha(color, '4D') },
      ]}
    >
      <View style={[styles.badgeDot, { backgroundColor: color }]} />
      <Text style={[styles.badgeText, { color }]}>{GYM_STATUS_LABELS[status]}</Text>
    </View>
  );
}

export default function AdminGymsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const {
    overview,
    visibleRows,
    isLoading,
    error,
    filters,
    setStatus,
    setPlanId,
    setQuery,
    refresh,
  } = useAdminGyms();

  const [creating, setCreating] = useState(false);

  if (!isAdminRole(user?.role)) {
    return <Redirect href="/tabs/trainer" />;
  }

  const wide = width >= TABLE_BREAKPOINT;

  const kpis = useMemo<TrainerKpi[]>(
    () => [
      {
        key: 'total',
        label: 'Gimnasios totales',
        value: overview.totals.total,
        icon: 'gym',
        tone: 'neutral',
        onPress: () => setStatus('all'),
      },
      {
        key: 'active',
        label: 'Activos',
        value: overview.totals.active,
        icon: 'check',
        tone: 'positive',
        onPress: () => setStatus('active'),
      },
      {
        key: 'trial',
        label: 'En prueba',
        value: overview.totals.trial,
        icon: 'time',
        tone: 'neutral',
        onPress: () => setStatus('trial'),
      },
      {
        key: 'suspended',
        label: 'Suspendidos',
        value: overview.totals.suspended,
        icon: 'info',
        tone: overview.totals.suspended > 0 ? 'warning' : 'neutral',
        onPress: () => setStatus('suspended'),
      },
    ],
    [overview.totals, setStatus],
  );

  return (
    <ScreenWrapper>
      <View style={[styles.header, !wide && styles.headerStacked]}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>CRM Gimnasios</Text>
          <Text style={styles.subtitle}>
            Gimnasios que usan Training ProgLine como su CRM.
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Button title="Actualizar" variant="outline" size="compact" onPress={refresh} />
          <Button title="Nuevo gimnasio" size="compact" onPress={() => setCreating(true)} />
        </View>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Reintentar" variant="outline" size="compact" onPress={refresh} />
        </View>
      ) : null}

      <View style={styles.kpis}>
        <TrainerOverviewKpis kpis={kpis} loading={isLoading} columns={wide ? 4 : 2} />
      </View>

      <View style={[styles.metricsRow, !wide && styles.metricsRowStacked]}>
        <MetricCard
          label="Miembros gestionados"
          value={String(overview.totals.managedMembers)}
          hint="Suma de todos los gimnasios"
        />
        <MetricCard
          label="Reservas (30 días)"
          value={String(overview.totals.bookingsLast30Days)}
          hint="Actividad agregada del CRM"
        />
        <MetricCard
          label="MRR del CRM"
          value={overview.totals.mrr > 0 ? `${overview.totals.mrr} €` : 'Sin definir'}
          hint={
            overview.totals.mrrIncomplete
              ? 'Falta precio en algún plan asignado'
              : 'Lo que factura Training ProgLine'
          }
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Gimnasios</Text>
          <View style={styles.countChip}>
            <Text style={styles.countChipText}>{visibleRows.length}</Text>
          </View>
        </View>

        <View style={styles.searchBar}>
          <AppIcon name="search" size={15} color={colors.textMuted} />
          <TextInput
            value={filters.query}
            onChangeText={setQuery}
            placeholder="Buscar por nombre, ciudad o email..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            accessibilityLabel="Buscar gimnasio"
          />
          {filters.query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel="Limpiar">
              <AppIcon name="close" size={15} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Estado</Text>
          <View style={styles.chips}>
            {STATUS_FILTERS.map((option) => {
              const selected = filters.status === option.key;
              return (
                <Pressable
                  key={option.key}
                  onPress={() => setStatus(option.key)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={({ pressed }) => [
                    styles.chip,
                    selected && styles.chipActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {overview.plans.length > 0 ? (
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Plan</Text>
            <View style={styles.chips}>
              <Pressable
                onPress={() => setPlanId('all')}
                accessibilityRole="button"
                accessibilityState={{ selected: filters.planId === 'all' }}
                style={({ pressed }) => [
                  styles.chip,
                  filters.planId === 'all' && styles.chipActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[styles.chipText, filters.planId === 'all' && styles.chipTextActive]}
                >
                  Todos
                </Text>
              </Pressable>
              {overview.plans.map((plan) => {
                const selected = filters.planId === plan.id;
                return (
                  <Pressable
                    key={plan.id}
                    onPress={() => setPlanId(plan.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    style={({ pressed }) => [
                      styles.chip,
                      selected && styles.chipActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                      {plan.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {isLoading ? (
          <View style={styles.skeletonList}>
            <SkeletonBlock height={54} />
            <SkeletonBlock height={54} />
          </View>
        ) : overview.rows.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Todavía no hay gimnasios</Text>
            <Text style={styles.emptyText}>
              Crea el primero para que su propietario acceda al CRM con el rol gimnasio.
            </Text>
            <Button
              title="Crear gimnasio"
              variant="outline"
              size="compact"
              onPress={() => setCreating(true)}
            />
          </View>
        ) : visibleRows.length === 0 ? (
          <Text style={styles.noResults}>Ningún gimnasio coincide con estos filtros.</Text>
        ) : wide ? (
          <View style={styles.table}>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.colGym]}>Gimnasio</Text>
              <Text style={[styles.headerCell, styles.colPlan]}>Plan</Text>
              <Text style={[styles.headerCell, styles.colNumber]}>Miembros</Text>
              <Text style={[styles.headerCell, styles.colNumber]}>Reservas 30d</Text>
              <Text style={[styles.headerCell, styles.colStatus]}>Estado</Text>
              <Text style={[styles.headerCell, styles.colDate]}>Alta</Text>
              <View style={styles.colChevron} />
            </View>

            {visibleRows.map((row, index) => (
              <Pressable
                key={row.gym.id}
                onPress={() =>
                  router.push({ pathname: '/trainer/gyms/[id]', params: { id: row.gym.id } })
                }
                accessibilityRole="button"
                accessibilityLabel={`Abrir ficha de ${row.gym.name}`}
                style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
                  styles.bodyRow,
                  index === visibleRows.length - 1 && styles.bodyRowLast,
                  hovered && styles.bodyRowHovered,
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.colGym, styles.gymCell]}>
                  <View style={styles.logo}>
                    <Text style={styles.logoText}>
                      {row.gym.name.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.gymName} numberOfLines={1}>
                      {row.gym.name}
                    </Text>
                    <Text style={styles.gymMeta} numberOfLines={1}>
                      {row.gym.city ?? row.gym.email ?? 'Sin ubicación'}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.cell, styles.colPlan]} numberOfLines={1}>
                  {row.planName ?? 'Sin plan'}
                </Text>
                <Text style={[styles.cell, styles.colNumber]}>
                  {row.stats?.totalMembers ?? 0}
                </Text>
                <Text style={[styles.cell, styles.colNumber]}>
                  {row.stats?.bookingsLast30Days ?? 0}
                </Text>
                <View style={styles.colStatus}>
                  <GymStatusBadge status={row.gym.status} />
                </View>
                <Text style={[styles.cell, styles.colDate]} numberOfLines={1}>
                  {new Date(row.gym.createdAt).toLocaleDateString('es-ES')}
                </Text>
                <View style={styles.colChevron}>
                  <AppIcon name="chevronRight" size={15} color={colors.textMuted} />
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.cardList}>
            {visibleRows.map((row) => (
              <Pressable
                key={row.gym.id}
                onPress={() =>
                  router.push({ pathname: '/trainer/gyms/[id]', params: { id: row.gym.id } })
                }
                accessibilityRole="button"
                accessibilityLabel={`Abrir ficha de ${row.gym.name}`}
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.logo}>
                    <Text style={styles.logoText}>{row.gym.name.slice(0, 2).toUpperCase()}</Text>
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.gymName} numberOfLines={1}>
                      {row.gym.name}
                    </Text>
                    <Text style={styles.gymMeta} numberOfLines={1}>
                      {row.planName ?? 'Sin plan'} · {row.stats?.totalMembers ?? 0} miembros
                    </Text>
                  </View>
                  <GymStatusBadge status={row.gym.status} />
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <CreateGymModal
        visible={creating}
        onCancel={() => setCreating(false)}
        onCreated={() => {
          setCreating(false);
          refresh();
        }}
      />
    </ScreenWrapper>
  );
}

function MetricCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricHint}>{hint}</Text>
    </View>
  );
}

function CreateGymModal({
  visible,
  onCancel,
  onCreated,
}: {
  visible: boolean;
  onCancel: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('El nombre del gimnasio es obligatorio.');
      return;
    }

    setSaving(true);
    setError(null);
    const result = await createGym({ name, ownerEmail });
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setName('');
    setOwnerEmail('');
    onCreated();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          onPress={onCancel}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Nuevo gimnasio</Text>
          <Text style={styles.modalSubtitle}>
            Se crea con 30 días de prueba. Si indicas el email de una cuenta existente, pasará a
            rol gimnasio como propietario.
          </Text>

          <Input
            label="Nombre del gimnasio"
            value={name}
            onChangeText={setName}
            placeholder="Ej. CrossFit Madrid Centro"
          />
          <Input
            label="Email del propietario (opcional)"
            value={ownerEmail}
            onChangeText={setOwnerEmail}
            placeholder="propietario@email.com"
            autoCapitalize="none"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.modalActions}>
            <Button
              title="Cancelar"
              variant="secondary"
              onPress={onCancel}
              style={styles.modalButton}
            />
            <Button
              title="Crear"
              onPress={() => void handleSubmit()}
              loading={saving}
              style={styles.modalButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerStacked: { flexDirection: 'column', alignItems: 'stretch' },
  headerCopy: { flex: 1, minWidth: 0 },
  headerActions: { flexDirection: 'row', gap: spacing.xs },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
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
  errorText: { ...typography.caption, color: colors.danger, flex: 1 },
  kpis: { marginTop: spacing.md },
  metricsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  metricsRowStacked: { flexDirection: 'column' },
  metricCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  metricLabel: { ...typography.caption, color: colors.textMuted, fontWeight: '600' },
  metricValue: { ...typography.h3, color: colors.text, marginTop: 2 },
  metricHint: { ...typography.caption, color: colors.textMuted, fontSize: 10, marginTop: 1 },
  section: { marginTop: spacing.lg, gap: spacing.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sectionTitle: { ...typography.h3, color: colors.text },
  countChip: {
    minWidth: 22,
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
  },
  countChipText: { ...typography.caption, color: colors.textSecondary, fontWeight: '700' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 38,
    maxWidth: 400,
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
    minWidth: 48,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, flex: 1 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 11,
  },
  chipTextActive: { color: colors.black },
  pressed: { opacity: 0.85 },
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
  bodyRowLast: { borderBottomWidth: 0 },
  bodyRowHovered: { backgroundColor: colors.surfaceLight },
  colGym: { flex: 2.6 },
  colPlan: { flex: 1.2 },
  colNumber: { flex: 0.9 },
  colStatus: { flex: 1.2 },
  colDate: { flex: 1 },
  colChevron: { width: 18, alignItems: 'flex-end' },
  gymCell: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minWidth: 0 },
  logo: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.sm,
    backgroundColor: withAlpha(colors.accentBlue, '22'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { ...typography.caption, color: colors.accentBlue, fontWeight: '800' },
  gymName: { ...typography.bodySmall, color: colors.text, fontWeight: '600' },
  gymMeta: { ...typography.caption, color: colors.textMuted, marginTop: 1 },
  cell: { ...typography.caption, color: colors.textSecondary },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  badgeDot: { width: 6, height: 6, borderRadius: borderRadius.full },
  badgeText: { ...typography.caption, fontWeight: '700', fontSize: 11 },
  cardList: { gap: spacing.sm },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    padding: spacing.sm + 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  empty: {
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  emptyTitle: { ...typography.bodySmall, color: colors.text, fontWeight: '700' },
  emptyText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  noResults: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontStyle: 'italic',
    paddingVertical: spacing.md,
  },
  skeletonList: { gap: spacing.sm },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  modalTitle: { ...typography.h3, color: colors.text },
  modalSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.md,
    lineHeight: 17,
  },
  error: { ...typography.caption, color: colors.danger, marginBottom: spacing.sm },
  modalActions: { flexDirection: 'row', gap: spacing.sm },
  modalButton: { flex: 1 },
});
