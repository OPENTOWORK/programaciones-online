import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import {
  GymEmptyState,
  GymErrorBanner,
  GymScreen,
  GymScreenHeader,
  GymSectionTitle,
} from '@/components/gym/GymScreen';
import { TrainerOverviewKpis, type TrainerKpi } from '@/components/trainer/TrainerOverviewKpis';
import { Button } from '@/components/ui/Button';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useGym } from '@/hooks/useGym';
import { useGymDashboard } from '@/hooks/useGymData';
import {
  GYM_SUBSCRIPTION_STATUS_LABELS,
  gymMemberFullName,
  type GymClass,
} from '@/lib/gymTypes';

const WIDE_BREAKPOINT = 1024;

function formatClassTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function occupancy(gymClass: GymClass) {
  return `${gymClass.bookedCount} / ${gymClass.capacity}`;
}

export default function GymDashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { gym } = useGym();
  const { stats, subscription, upcomingClasses, recentMembers, isLoading, error, refresh } =
    useGymDashboard();

  const wide = width >= WIDE_BREAKPOINT;

  const kpis = useMemo<TrainerKpi[]>(
    () => [
      {
        key: 'active-members',
        label: 'Miembros activos',
        value: stats?.activeMembers ?? 0,
        icon: 'profile',
        tone: 'positive',
        onPress: () => router.push('/gym/members'),
      },
      {
        key: 'new-members',
        label: 'Nuevos este mes',
        value: stats?.newMembersThisMonth ?? 0,
        icon: 'streak',
        tone: 'neutral',
        onPress: () => router.push('/gym/members'),
      },
      {
        key: 'bookings-today',
        label: 'Reservas de hoy',
        value: stats?.bookingsToday ?? 0,
        icon: 'check',
        tone: 'neutral',
        onPress: () => router.push('/gym/bookings'),
      },
      {
        key: 'wellhub-bookings-today',
        label: 'Reservas de Wellhub',
        value: stats?.wellhubBookingsToday ?? 0,
        icon: 'stats',
        tone: 'neutral',
        onPress: () => router.push('/gym/members?tab=wellhub'),
      },
      {
        key: 'classes-today',
        label: 'Clases de hoy',
        value: stats?.classesToday ?? 0,
        icon: 'calendar',
        tone: 'neutral',
        onPress: () => router.push('/gym/schedule'),
      },
    ],
    [router, stats],
  );

  const averageOccupancy = useMemo(() => {
    const withCapacity = upcomingClasses.filter((item) => item.capacity > 0);
    if (withCapacity.length === 0) return null;

    const ratio =
      withCapacity.reduce((sum, item) => sum + item.bookedCount / item.capacity, 0) /
      withCapacity.length;
    return Math.round(ratio * 100);
  }, [upcomingClasses]);

  const fullClasses = upcomingClasses.filter((item) => item.bookedCount >= item.capacity);

  return (
    <GymScreen>
      <ScreenWrapper>
        <GymScreenHeader
          title="Panel de control"
          subtitle={gym ? `${gym.name}${gym.city ? ` · ${gym.city}` : ''}` : undefined}
          action={<Button title="Actualizar" variant="outline" size="compact" onPress={refresh} />}
        />

        {error ? <GymErrorBanner message={error} onRetry={refresh} /> : null}

        <View style={styles.kpis}>
          <TrainerOverviewKpis kpis={kpis} loading={isLoading} columns={wide ? 5 : 2} />
        </View>

        <View style={[styles.secondaryRow, !wide && styles.secondaryRowStacked]}>
          <SecondaryCard
            label="Ocupación media"
            value={averageOccupancy === null ? 'Sin datos' : `${averageOccupancy}%`}
            hint="Próximas clases de esta semana"
          />
          <SecondaryCard
            label="Ingresos del mes"
            value="Sin datos"
            hint="Aún no se registran cobros en el CRM"
          />
          <SecondaryCard
            label="Membresías por vencer"
            value={String(stats?.membershipsExpiringSoon ?? 0)}
            hint="Próximos 15 días"
            tone={stats && stats.membershipsExpiringSoon > 0 ? 'warning' : 'default'}
          />
        </View>

        {fullClasses.length > 0 ? (
          <View style={styles.alertCard}>
            <Text style={styles.alertTitle}>
              {fullClasses.length === 1
                ? '1 clase completa esta semana'
                : `${fullClasses.length} clases completas esta semana`}
            </Text>
            <Text style={styles.alertText}>
              Las nuevas reservas entrarán en lista de espera. Revisa el aforo o añade otra sesión.
            </Text>
            <Button
              title="Ver horario"
              variant="outline"
              size="compact"
              onPress={() => router.push('/gym/schedule')}
              style={styles.alertButton}
            />
          </View>
        ) : null}

        <GymSectionTitle title="Próximas clases" count={upcomingClasses.length} />
        {upcomingClasses.length === 0 ? (
          <GymEmptyState
            icon="calendar"
            title="No hay clases programadas"
            text="Crea tus clases desde el horario para empezar a recibir reservas."
            action={
              <Button
                title="Ir al horario"
                variant="outline"
                size="compact"
                onPress={() => router.push('/gym/schedule')}
              />
            }
          />
        ) : (
          <View style={styles.list}>
            {upcomingClasses.map((gymClass) => (
              <View key={gymClass.id} style={styles.row}>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {gymClass.classTypeName ?? gymClass.title ?? 'Clase'}
                  </Text>
                  <Text style={styles.rowMeta} numberOfLines={1}>
                    {formatClassTime(gymClass.startAt)}
                    {gymClass.coachName ? ` · ${gymClass.coachName}` : ''}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.rowValue,
                    gymClass.bookedCount >= gymClass.capacity && styles.rowValueFull,
                  ]}
                >
                  {occupancy(gymClass)}
                </Text>
              </View>
            ))}
          </View>
        )}

        <GymSectionTitle title="Últimos miembros" count={recentMembers.length} />
        {recentMembers.length === 0 ? (
          <GymEmptyState
            icon="profile"
            title="Todavía no hay miembros"
            text="Da de alta a tus clientes para gestionar reservas y tarifas."
            action={
              <Button
                title="Añadir miembro"
                variant="outline"
                size="compact"
                onPress={() => router.push('/gym/members')}
              />
            }
          />
        ) : (
          <View style={styles.list}>
            {recentMembers.map((member) => (
              <View key={member.id} style={styles.row}>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {gymMemberFullName(member)}
                  </Text>
                  <Text style={styles.rowMeta} numberOfLines={1}>
                    {member.email ?? member.phone ?? 'Sin contacto'}
                  </Text>
                </View>
                <Text style={styles.rowValue}>{member.joinedAt}</Text>
              </View>
            ))}
          </View>
        )}

        {subscription ? (
          <Text style={styles.footerNote}>
            Suscripción de tu gimnasio a Training ProgLine:{' '}
            {GYM_SUBSCRIPTION_STATUS_LABELS[subscription.status]}
            {subscription.trialEndsAt && subscription.status === 'trial'
              ? ` · prueba hasta ${new Date(subscription.trialEndsAt).toLocaleDateString('es-ES')}`
              : ''}
          </Text>
        ) : null}
      </ScreenWrapper>
    </GymScreen>
  );
}

function SecondaryCard({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string;
  value: string;
  hint: string;
  tone?: 'default' | 'warning';
}) {
  return (
    <View style={[styles.secondaryCard, tone === 'warning' && styles.secondaryCardWarning]}>
      <Text style={styles.secondaryLabel}>{label}</Text>
      <Text style={[styles.secondaryValue, tone === 'warning' && styles.secondaryValueWarning]}>
        {value}
      </Text>
      <Text style={styles.secondaryHint}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  kpis: {
    marginTop: spacing.md,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  secondaryRowStacked: {
    flexDirection: 'column',
  },
  secondaryCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  secondaryCardWarning: {
    borderColor: withAlpha(colors.warning, '55'),
    backgroundColor: withAlpha(colors.warning, '0D'),
  },
  secondaryLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  secondaryValue: {
    ...typography.h3,
    color: colors.text,
    marginTop: 2,
  },
  secondaryValueWarning: {
    color: colors.warning,
  },
  secondaryHint: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 1,
  },
  alertCard: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: withAlpha(colors.warning, '55'),
    backgroundColor: withAlpha(colors.warning, '0D'),
  },
  alertTitle: {
    ...typography.bodySmall,
    color: colors.warning,
    fontWeight: '800',
  },
  alertText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  alertButton: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  list: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  rowMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  rowValue: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  rowValueFull: {
    color: colors.warning,
  },
  footerNote: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xl,
    lineHeight: 18,
  },
});
