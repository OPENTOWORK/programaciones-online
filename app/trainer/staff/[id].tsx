import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { TrainerActivityFeed } from '@/components/trainer/TrainerActivityFeed';
import { TrainerAttentionList } from '@/components/trainer/TrainerAttentionList';
import { TrainerClientsTable } from '@/components/trainer/TrainerClientsTable';
import { TrainerInternalNotes } from '@/components/trainer/TrainerInternalNotes';
import { TrainerOverviewKpis, type TrainerKpi } from '@/components/trainer/TrainerOverviewKpis';
import { TrainerProfessionalInfo } from '@/components/trainer/TrainerProfessionalInfo';
import { ActionSheetModal, type ActionSheetAction } from '@/components/ui/ActionSheetModal';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useAthlete } from '@/hooks/useAthletes';
import { useAuth } from '@/hooks/useAuth';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { isAdminRole } from '@/lib/athleteService';
import { getTrainerAthleteProfileHref, isStaffLeadRole, safeGoBack } from '@/lib/navigation';
import { openExternalUrl } from '@/lib/openExternalUrl';
import { setCrmLeadRole } from '@/lib/trainerCrm';
import { addCrmActivity } from '@/lib/trainerCrmActivity';
import {
  clientsNeedingAttention,
  EMPTY_TRAINER_OVERVIEW,
  fetchTrainerOverview,
  PLAN_ENDING_SOON_DAYS,
  type TrainerOverview,
} from '@/lib/trainerOverview';
import {
  EMPTY_PROFESSIONAL_PROFILE,
  fetchTrainerInternalNote,
  fetchTrainerProfessionalProfile,
  saveTrainerInternalNote,
  saveTrainerProfessionalProfile,
  type TrainerInternalNote,
  type TrainerProfessionalProfile,
} from '@/lib/trainerProfessionalProfile';
import type { UserRole } from '@/lib/types';

const WIDE_BREAKPOINT = 960;
const TABLE_BREAKPOINT = 900;
const RECENT_ACTIVITY_DAYS = 30;

type RoleChange = Exclude<UserRole, 'atleta'> | 'atleta';

function roleLabel(role?: UserRole) {
  if (role === 'administrador') return 'Administrador';
  if (role === 'entrenador') return 'Entrenador';
  return 'Staff';
}

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

export default function StaffDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, isDemoMode, resetPassword } = useAuth();
  const { width } = useWindowDimensions();
  const isAdmin = isAdminRole(user?.role);

  const { athlete: member, isLoading, refresh: refreshMember } = useAthlete(id ?? '');
  const [overview, setOverview] = useState<TrainerOverview>(EMPTY_TRAINER_OVERVIEW);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [professional, setProfessional] = useState<TrainerProfessionalProfile>(
    EMPTY_PROFESSIONAL_PROFILE,
  );
  const [professionalPersistent, setProfessionalPersistent] = useState(true);
  const [internalNote, setInternalNote] = useState<TrainerInternalNote>({ note: '' });
  const [notePersistent, setNotePersistent] = useState(true);

  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingRole, setPendingRole] = useState<RoleChange | null>(null);
  const [passwordResetOpen, setPasswordResetOpen] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const scrollRef = useRef<ScrollView>(null);
  const clientsOffset = useRef(0);
  const attentionOffset = useRef(0);

  const wide = width >= WIDE_BREAKPOINT;
  const tableLayout = width >= TABLE_BREAKPOINT;

  const canLoadOverview = Boolean(id) && isAdmin && Boolean(member) && isStaffLeadRole(member?.role);

  const loadOverview = useCallback(async () => {
    if (!id || !canLoadOverview) {
      setOverview(EMPTY_TRAINER_OVERVIEW);
      setOverviewLoading(false);
      return;
    }

    setOverviewLoading(true);
    setOverviewError(null);
    try {
      const [nextOverview, nextProfessional, nextNote] = await Promise.all([
        fetchTrainerOverview(id),
        fetchTrainerProfessionalProfile(id),
        fetchTrainerInternalNote(id),
      ]);

      setOverview(nextOverview);
      setProfessional(nextProfessional.data);
      setProfessionalPersistent(nextProfessional.persistent);
      setInternalNote(nextNote.data);
      setNotePersistent(nextNote.persistent);
    } catch (error) {
      setOverview(EMPTY_TRAINER_OVERVIEW);
      setOverviewError(
        error instanceof Error ? error.message : 'No se pudieron cargar los datos del entrenador.',
      );
    } finally {
      setOverviewLoading(false);
    }
  }, [canLoadOverview, id]);

  const handleSaveProfessional = useCallback(
    async (input: TrainerProfessionalProfile) => {
      if (!id) return { error: 'Entrenador no válido.' };

      const result = await saveTrainerProfessionalProfile(id, input);
      if (!result.error) setProfessional(input);
      return result;
    },
    [id],
  );

  const handleSaveNote = useCallback(
    async (value: string) => {
      if (!id) return { error: 'Entrenador no válido.' };

      const result = await saveTrainerInternalNote(id, value, user?.id);
      if (!result.error) {
        setInternalNote({ note: value.trim(), updatedAt: new Date().toISOString() });
      }
      return result;
    },
    [id, user?.id],
  );

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  useFocusRefresh(() => loadOverview());

  const attention = useMemo(() => clientsNeedingAttention(overview.clients), [overview.clients]);

  const openClient = useCallback(
    (athleteId: string) => router.push(getTrainerAthleteProfileHref(athleteId)),
    [router],
  );

  const scrollTo = useCallback((offset: number) => {
    scrollRef.current?.scrollTo({ y: Math.max(offset - 16, 0), animated: true });
  }, []);

  const kpis = useMemo<TrainerKpi[]>(
    () => [
      {
        key: 'active-clients',
        label: 'Clientes activos',
        value: overview.activeClients,
        icon: 'profile',
        tone: 'positive',
        hint: 'Con programación asignada',
        onPress: () => scrollTo(clientsOffset.current),
      },
      {
        key: 'active-plans',
        label: 'Programaciones activas',
        value: overview.activePlanGroups,
        icon: 'programs',
        tone: 'neutral',
        hint: 'Vigentes hoy',
        onPress: () => scrollTo(clientsOffset.current),
      },
      {
        key: 'attention',
        label: 'Requieren atención',
        value: overview.needsAttention,
        icon: 'info',
        tone: overview.needsAttention > 0 ? 'warning' : 'neutral',
        hint: overview.needsAttention > 0 ? 'Revisar programaciones' : 'Nada pendiente',
        onPress: () => scrollTo(attentionOffset.current),
      },
      {
        key: 'total-clients',
        label: 'Total clientes',
        value: overview.totalClients,
        icon: 'stats',
        tone: 'neutral',
        hint: 'Asignados en el tablero',
        onPress: () => scrollTo(clientsOffset.current),
      },
    ],
    [overview, scrollTo],
  );

  const lastActivityAt = overview.activity[0]?.at;
  const hasRecentActivity = useMemo(() => {
    if (!lastActivityAt) return false;
    const diff = Date.now() - new Date(lastActivityAt).getTime();
    return diff <= RECENT_ACTIVITY_DAYS * 86_400_000;
  }, [lastActivityAt]);

  const applyRoleChange = useCallback(
    async (role: RoleChange) => {
      if (!id || !member || !user?.id || member.id === user.id) return;

      setActionBusy(true);
      const { error } = await setCrmLeadRole(id, role, isDemoMode);
      setActionBusy(false);
      setPendingRole(null);

      if (error) {
        setNotice({ kind: 'error', message: error });
        return;
      }

      void addCrmActivity(
        user.id,
        id,
        role === 'administrador'
          ? 'Cambiado a rol administrador'
          : role === 'entrenador'
            ? 'Cambiado a rol entrenador'
            : 'Devuelto a rol atleta',
        'stage_change',
        isDemoMode,
      );

      if (role === 'atleta') {
        router.replace(getTrainerAthleteProfileHref(id));
        return;
      }

      setNotice({
        kind: 'success',
        message: `${member.name} pasa a rol ${roleLabel(role).toLowerCase()}. Se aplica al volver a entrar en la app.`,
      });
      refreshMember();
    },
    [id, isDemoMode, member, refreshMember, router, user?.id],
  );

  const sendPasswordReset = useCallback(async () => {
    if (!member?.email) return;

    setActionBusy(true);
    const result = await resetPassword(member.email);
    setActionBusy(false);
    setPasswordResetOpen(false);

    setNotice(
      result.error
        ? { kind: 'error', message: result.error }
        : {
            kind: 'success',
            message: `Correo de restablecimiento enviado a ${member.email}.`,
          },
    );
  }, [member?.email, resetPassword]);

  if (!isAdmin) {
    return (
      <ScreenWrapper>
        <Text style={styles.error}>Solo un administrador puede ver la ficha de un entrenador.</Text>
        <Button title="Volver" variant="secondary" onPress={() => safeGoBack(router, '/tabs/trainer')} />
      </ScreenWrapper>
    );
  }

  if (isLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.headerCard}>
          <SkeletonBlock height={56} width={56} radius={borderRadius.full} />
          <View style={styles.headerSkeletonCopy}>
            <SkeletonBlock height={20} width="38%" />
            <SkeletonBlock height={14} width="52%" />
            <SkeletonBlock height={20} width={110} radius={borderRadius.full} />
          </View>
        </View>
        <View style={styles.kpiSpacer}>
          <TrainerOverviewKpis kpis={kpis} loading columns={wide ? 4 : 2} />
        </View>
      </ScreenWrapper>
    );
  }

  if (!member || !isStaffLeadRole(member.role)) {
    return (
      <ScreenWrapper>
        <Text style={styles.error}>Miembro del equipo no encontrado</Text>
        <Button title="Volver" variant="secondary" onPress={() => safeGoBack(router, '/tabs/trainer')} />
      </ScreenWrapper>
    );
  }

  const isSelf = member.id === user?.id;
  const isTrainer = member.role === 'entrenador';

  const menuActions: ActionSheetAction[] = [];
  if (!isSelf) {
    menuActions.push({
      key: 'role',
      label: isTrainer ? 'Pasar a rol administrador' : 'Pasar a rol entrenador',
      onPress: () => {
        setMenuOpen(false);
        setPendingRole(isTrainer ? 'administrador' : 'entrenador');
      },
    });
    menuActions.push({
      key: 'password',
      label: 'Enviar correo de restablecer contraseña',
      onPress: () => {
        setMenuOpen(false);
        setPasswordResetOpen(true);
      },
    });
    menuActions.push({
      key: 'demote',
      label: 'Devolver a rol atleta',
      destructive: true,
      onPress: () => {
        setMenuOpen(false);
        setPendingRole('atleta');
      },
    });
  }

  return (
    <ScreenWrapper scrollRef={scrollRef}>
      {/* --- Cabecera --- */}
      <View style={[styles.headerCard, !wide && styles.headerCardStacked]}>
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{member.avatarInitials}</Text>
          </View>
          <View style={styles.identityCopy}>
            <Text style={styles.name} numberOfLines={1}>
              {member.name}
            </Text>
            <Pressable
              onPress={() => void openExternalUrl(`mailto:${member.email}`)}
              accessibilityRole="link"
              accessibilityLabel={`Escribir a ${member.email}`}
            >
              <Text style={styles.email} numberOfLines={1}>
                {member.email}
              </Text>
            </Pressable>

            <View style={styles.chips}>
              <View style={[styles.chip, styles.chipRole]}>
                <Text style={styles.chipRoleText}>{roleLabel(member.role)}</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>
                  {overview.totalClients === 0
                    ? 'Sin clientes asignados'
                    : hasRecentActivity
                      ? 'Con actividad reciente'
                      : `Sin actividad en ${RECENT_ACTIVITY_DAYS} días`}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.headerActions, !wide && styles.headerActionsStacked]}>
          <Button
            title="Ver clientes"
            variant="outline"
            size="compact"
            onPress={() => scrollTo(clientsOffset.current)}
          />
          {menuActions.length > 0 ? (
            <Pressable
              onPress={() => setMenuOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Más acciones"
              style={({ pressed }) => [styles.menuButton, pressed && styles.pressed]}
            >
              <AppIcon name="menuDots" size={18} color={colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <Text style={styles.headerHint}>
        Ficha interna de gestión · visible solo para administradores
      </Text>

      {notice ? (
        <Pressable
          onPress={() => setNotice(null)}
          style={[styles.notice, notice.kind === 'error' && styles.noticeError]}
        >
          <Text style={[styles.noticeText, notice.kind === 'error' && styles.noticeTextError]}>
            {notice.message}
          </Text>
          <AppIcon name="close" size={14} color={colors.textMuted} />
        </Pressable>
      ) : null}

      {overviewError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{overviewError}</Text>
          <Button title="Reintentar" variant="outline" size="compact" onPress={() => void loadOverview()} />
        </View>
      ) : null}

      {/* --- KPIs --- */}
      <View style={styles.kpiSpacer}>
        <TrainerOverviewKpis kpis={kpis} loading={overviewLoading} columns={wide ? 4 : 2} />
      </View>

      {/* --- Requieren atención --- */}
      <View
        style={styles.section}
        onLayout={(event) => {
          attentionOffset.current = event.nativeEvent.layout.y;
        }}
      >
        <SectionTitle
          title="Requieren atención"
          subtitle={`Sin programación, terminada o con menos de ${PLAN_ENDING_SOON_DAYS} días restantes`}
          count={attention.length}
        />
        <TrainerAttentionList
          clients={attention}
          loading={overviewLoading}
          onOpenClient={openClient}
        />
      </View>

      {/* --- Clientes --- */}
      <View
        style={styles.section}
        onLayout={(event) => {
          clientsOffset.current = event.nativeEvent.layout.y;
        }}
      >
        <SectionTitle
          title="Clientes"
          subtitle="Clientes asignados a este entrenador en el tablero"
          count={overview.totalClients}
        />
        <TrainerClientsTable
          clients={overview.clients}
          loading={overviewLoading}
          wide={tableLayout}
          onOpenClient={openClient}
        />
      </View>

      {/* --- Estadísticas + actividad / información --- */}
      <View style={[styles.columns, !wide && styles.columnsStacked]}>
        <View style={[styles.mainColumn, !wide && styles.fullColumn]}>
          <View style={styles.section}>
            <SectionTitle title="Estadísticas" subtitle="Programaciones y actividad de sus clientes" />
            <View style={styles.statsGrid}>
              <StatCell label="Programaciones creadas" value={overview.stats.plansCreated} />
              <StatCell label="Activas" value={overview.stats.plansActive} />
              <StatCell label="Finalizadas" value={overview.stats.plansEnded} />
              <StatCell label="Clientes sin programa" value={overview.stats.clientsWithoutPlan} />
              <StatCell label="Terminan pronto" value={overview.stats.clientsEndingSoon} />
              <StatCell label="Entrenos registrados" value={overview.stats.totalWorkoutLogs} />
              <StatCell label="Planes nutricionales" value={overview.stats.nutritionPlans} />
              <StatCell label="Planes a domicilio" value={overview.stats.homeTrainingPlans} />
            </View>
            <View style={styles.statsFooter}>
              <InfoRow label="Última programación creada" value={formatDateTime(overview.stats.lastPlanCreatedAt)} />
              <InfoRow
                label="Última modificación"
                value={formatDateTime(overview.stats.lastPlanUpdatedAt)}
                last
              />
            </View>
          </View>

          <View style={styles.section}>
            <SectionTitle title="Actividad reciente" subtitle="Programaciones y entrenos de sus clientes" />
            <TrainerActivityFeed items={overview.activity} loading={overviewLoading} />
          </View>
        </View>

        <View style={[styles.sideColumn, !wide && styles.fullColumn]}>
          <CollapsibleSection
            title="Información profesional"
            subtitle="Especialidad, titulación y modalidad"
            style={styles.sideCard}
          >
            <TrainerProfessionalInfo
              profile={professional}
              persistent={professionalPersistent}
              canEdit
              onSave={handleSaveProfessional}
            />
          </CollapsibleSection>

          <CollapsibleSection
            title="Notas internas"
            subtitle="Privadas del administrador"
            style={styles.sideCard}
          >
            <TrainerInternalNotes
              note={internalNote}
              persistent={notePersistent}
              onSave={handleSaveNote}
            />
          </CollapsibleSection>

          <CollapsibleSection
            title="Rol y permisos"
            subtitle="Qué puede ver y gestionar"
            style={styles.sideCard}
          >
            <View>
              <InfoRow label="Rol" value={roleLabel(member.role)} />
              <InfoRow label="Panel" value={isTrainer ? 'Entrenador' : 'Administración'} />
              <InfoRow
                label="Clientes"
                value={isTrainer ? 'Solo los asignados' : 'Todo el equipo'}
              />
              <InfoRow label="Chat 1:1" value={isTrainer ? 'Con sus clientes' : 'Con sus clientes propios'} />
              <InfoRow label="Calendario global" value={isTrainer ? 'No' : 'Sí'} />
              <InfoRow label="Columnas de rol en CRM" value={isTrainer ? 'No' : 'Sí'} />
              <InfoRow label="Clientes cedidos" value={isTrainer ? 'No' : 'Sí'} last />
            </View>
            <Text style={styles.permissionNote}>
              {isTrainer
                ? 'El chat y el seguimiento diario de estos clientes los gestiona este entrenador. Como administrador puedes abrir sus fichas, no su chat.'
                : 'Ve el tablero completo, los clientes cedidos y puede cambiar roles.'}
            </Text>
          </CollapsibleSection>

          {isSelf ? (
            <Text style={styles.selfHint}>Es tu propia cuenta: no puedes cambiar tu rol aquí.</Text>
          ) : null}
        </View>
      </View>

      <Button title="Volver al tablero" variant="secondary" onPress={() => safeGoBack(router, '/tabs/trainer')} />

      <ActionSheetModal
        visible={menuOpen}
        title={member.name}
        subtitle="Acciones de administración"
        actions={menuActions}
        onClose={() => setMenuOpen(false)}
      />

      <ConfirmModal
        visible={pendingRole !== null}
        title={
          pendingRole === 'administrador'
            ? `¿Pasar a ${member.name} a administrador?`
            : pendingRole === 'entrenador'
              ? `¿Pasar a ${member.name} a entrenador?`
              : `¿Devolver a ${member.name} a rol atleta?`
        }
        message={
          pendingRole === 'administrador'
            ? 'Verá el tablero completo, los clientes cedidos y podrá cambiar roles.'
            : pendingRole === 'entrenador'
              ? 'Pasará a ver solo los clientes de su tablero.'
              : 'Dejará de ver el panel de entrenador y volverá a la app de atleta.'
        }
        busy={actionBusy}
        destructive={pendingRole === 'atleta'}
        onCancel={() => setPendingRole(null)}
        onConfirm={() => {
          if (pendingRole) void applyRoleChange(pendingRole);
        }}
      />

      <ConfirmModal
        visible={passwordResetOpen}
        title="¿Enviar correo de restablecimiento?"
        message={`Se enviará un enlace de nueva contraseña a ${member.email}.`}
        busy={actionBusy}
        onCancel={() => setPasswordResetOpen(false)}
        onConfirm={() => void sendPasswordReset()}
      />
    </ScreenWrapper>
  );
}

function SectionTitle({
  title,
  subtitle,
  count,
}: {
  title: string;
  subtitle?: string;
  count?: number;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionTitleCopy}>
        <View style={styles.sectionTitleLine}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {count !== undefined ? (
            <View style={styles.sectionCount}>
              <Text style={styles.sectionCountText}>{count}</Text>
            </View>
          ) : null}
        </View>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

function StatCell({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

function InfoRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.infoRow, last && styles.infoRowLast]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  error: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  headerCardStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  headerSkeletonCopy: {
    flex: 1,
    gap: spacing.sm,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
    minWidth: 0,
  },
  identityCopy: {
    flex: 1,
    minWidth: 0,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: withAlpha(colors.accentBlue, '22'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.h3,
    color: colors.accentBlue,
    fontWeight: '700',
  },
  name: {
    ...typography.h2,
    color: colors.text,
  },
  email: {
    ...typography.bodySmall,
    color: colors.accentBlue,
    fontWeight: '600',
    marginTop: 1,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  chip: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceLight,
  },
  chipRole: {
    backgroundColor: withAlpha(colors.accentBlue, '22'),
  },
  chipRoleText: {
    ...typography.caption,
    color: colors.accentBlue,
    fontWeight: '700',
  },
  chipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 0,
  },
  headerActionsStacked: {
    justifyContent: 'flex-start',
  },
  menuButton: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  pressed: {
    opacity: 0.75,
  },
  headerHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.sm + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: withAlpha(colors.accentBlue, '4D'),
    backgroundColor: withAlpha(colors.accentBlue, '14'),
  },
  noticeError: {
    borderColor: withAlpha(colors.danger, '4D'),
    backgroundColor: withAlpha(colors.danger, '14'),
  },
  noticeText: {
    ...typography.caption,
    color: colors.text,
    flex: 1,
    lineHeight: 17,
  },
  noticeTextError: {
    color: colors.danger,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    padding: spacing.sm + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: withAlpha(colors.danger, '4D'),
    backgroundColor: withAlpha(colors.danger, '10'),
  },
  errorBannerText: {
    ...typography.caption,
    color: colors.danger,
    flex: 1,
  },
  kpiSpacer: {
    marginTop: spacing.md,
  },
  section: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  sectionTitleCopy: {
    flex: 1,
    minWidth: 0,
  },
  sectionTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  sectionCount: {
    minWidth: 22,
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
  },
  sectionCountText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  columns: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  columnsStacked: {
    flexDirection: 'column',
  },
  mainColumn: {
    flex: 7,
    minWidth: 0,
  },
  sideColumn: {
    flex: 3,
    minWidth: 0,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  fullColumn: {
    flex: 0,
    width: '100%',
  },
  sideCard: {
    marginTop: 0,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCell: {
    flexGrow: 1,
    flexBasis: '22%',
    minWidth: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm + 2,
  },
  statValue: {
    ...typography.h3,
    color: colors.text,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  statsFooter: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
    flexShrink: 0,
  },
  permissionNote: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: spacing.sm,
  },
  selfHint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
