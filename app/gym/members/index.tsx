import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { GymCoachFormModal } from '@/components/gym/GymCoachFormModal';
import { GymMemberDataActions } from '@/components/gym/GymMemberDataActions';
import { GymMemberCrmBoard } from '@/components/gym/GymMemberCrmBoard';
import { GymMemberFormModal } from '@/components/gym/GymMemberFormModal';
import {
  WellhubActivatedBanner,
  WellhubActivationCard,
} from '@/components/gym/WellhubActivationCard';
import {
  GymEmptyState,
  GymErrorBanner,
  GymScreen,
  GymScreenHeader,
} from '@/components/gym/GymScreen';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useGym } from '@/hooks/useGym';
import { useGymMembers, useGymStaff } from '@/hooks/useGymData';
import { inviteGymCoach, type InviteGymCoachInput } from '@/lib/gymCoachService';
import { linkGymMemberAccount } from '@/lib/athleteGymService';
import { findMemberImportMatch, type GymMemberImportRow } from '@/lib/gymMemberDataTransfer';
import { fetchWellhubPlanMemberIds } from '@/lib/gymWellhubService';
import { isWellhubMember } from '@/lib/gymWellhub';
import {
  assignMemberMembership,
  createGymMember,
  fetchGymMembershipPlans,
  updateGymMember,
  type GymMemberInput,
} from '@/lib/gymService';
import {
  GYM_MEMBER_STATUS_LABELS,
  GYM_USER_ROLE_LABELS,
  gymMemberFullName,
  gymMemberInitials,
  gymUserDisplayName,
  gymUserInitials,
  isGymPotentialMember,
  type GymMember,
  type GymMemberStatus,
} from '@/lib/gymTypes';

const TABLE_BREAKPOINT = 900;

const STATUS_COLORS: Record<GymMemberStatus, string> = {
  active: '#4ADE80',
  lead: colors.accentBlue,
  inactive: colors.textMuted,
  blocked: colors.danger,
};

type MemberKind = 'members' | 'crm' | 'wellhub' | 'coaches';
type MemberStatusFilter = Exclude<GymMemberStatus, 'lead'> | 'all';

const KIND_TABS: Array<{ key: MemberKind; label: string }> = [
  { key: 'members', label: 'Miembros' },
  { key: 'crm', label: 'Potenciales · CRM' },
  { key: 'wellhub', label: 'Wellhub' },
  { key: 'coaches', label: 'Entrenadores' },
];

const MEMBER_STATUS_FILTERS: Array<{ key: MemberStatusFilter; label: string }> = [
  { key: 'all', label: 'Todos' },
  { key: 'active', label: 'Activos' },
  { key: 'inactive', label: 'Inactivos' },
  { key: 'blocked', label: 'Bloqueados' },
];

function WellhubBadge() {
  return (
    <View style={styles.wellhubBadge}>
      <Text style={styles.wellhubBadgeText}>Wellhub</Text>
    </View>
  );
}

function MemberStatusBadge({ status }: { status: GymMemberStatus }) {
  const color = STATUS_COLORS[status];
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: withAlpha(color, '1F'), borderColor: withAlpha(color, '4D') },
      ]}
    >
      <View style={[styles.badgeDot, { backgroundColor: color }]} />
      <Text style={[styles.badgeText, { color }]}>{GYM_MEMBER_STATUS_LABELS[status]}</Text>
    </View>
  );
}

function inviteNoticeFor(
  email: string,
  result: { alreadyExisted?: boolean; welcomeEmailSent?: boolean; temporaryPassword?: string },
) {
  if (result.welcomeEmailSent) {
    return result.alreadyExisted
      ? `Ya tenía cuenta. Le hemos enviado un correo a ${email} para entrar al panel.`
      : `Invitación enviada a ${email}. Le hemos mandado un correo con el acceso.`;
  }

  if (result.temporaryPassword) {
    return `Entrenador añadido, pero el correo no se pudo enviar. Contraseña temporal: ${result.temporaryPassword}`;
  }

  return `Entrenador añadido. Pídele que entre en trainingprogline.es con ${email}.`;
}

function memberLinkNotice(email: string, linked: boolean) {
  if (linked) {
    return `${email} ya tiene cuenta en la app. Verá este gimnasio en Inicio → Acceso a tus gimnasios.`;
  }
  return `Miembro guardado. Cuando ${email} se registre en Training ProgLine, vuelve a guardar su ficha para vincular la cuenta.`;
}

export default function GymMembersScreen() {
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: string | string[] }>();
  const { width } = useWindowDimensions();
  const { gym, permissions } = useGym();
  const { members, isLoading, error, refresh } = useGymMembers();
  const {
    staff,
    isLoading: staffLoading,
    error: staffError,
    refresh: refreshStaff,
  } = useGymStaff();

  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<MemberKind>('members');
  const [memberStatus, setMemberStatus] = useState<MemberStatusFilter>('all');
  const [creating, setCreating] = useState(false);
  const [invitingCoach, setInvitingCoach] = useState(false);
  const [inviteNotice, setInviteNotice] = useState<string | null>(null);
  const [memberNotice, setMemberNotice] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [wellhubPlanMemberIds, setWellhubPlanMemberIds] = useState<Set<string>>(new Set());
  const [wellhubActivated, setWellhubActivated] = useState(false);

  const wide = width >= TABLE_BREAKPOINT;
  const showingWellhub = kind === 'wellhub';
  const showingCoaches = kind === 'coaches';
  const showingCrm = kind === 'crm';
  const addingPotential = showingCrm;

  useEffect(() => {
    const requested = Array.isArray(tab) ? tab[0] : tab;
    if (requested === 'coaches') setKind('coaches');
    if (requested === 'crm' || requested === 'potentials') setKind('crm');
    if (requested === 'wellhub') setKind('wellhub');
  }, [tab]);

  useEffect(() => {
    if ((kind as string) === 'potentials') setKind('crm');
  }, [kind]);

  useEffect(() => {
    if (!gym?.id) return;
    void fetchWellhubPlanMemberIds(gym.id).then(setWellhubPlanMemberIds);
  }, [gym?.id, members]);

  const coaches = useMemo(() => staff.filter((person) => person.role === 'coach'), [staff]);

  const kindCounts = useMemo(() => {
    let membersCount = 0;
    let crmCount = 0;
    const statuses: Record<Exclude<GymMemberStatus, 'lead'>, number> = {
      active: 0,
      inactive: 0,
      blocked: 0,
    };

    let wellhubCount = 0;

    for (const member of members) {
      if (isWellhubMember(member, wellhubPlanMemberIds)) wellhubCount += 1;
      crmCount += 1;
      if (isGymPotentialMember(member.status)) continue;
      membersCount += 1;
      statuses[member.status] += 1;
    }

    return {
      members: membersCount,
      wellhub: wellhubCount,
      coaches: coaches.length,
      crm: crmCount,
      statuses,
      allMembers: membersCount,
    };
  }, [coaches.length, members, wellhubPlanMemberIds]);

  const inKind = useMemo(
    () =>
      members.filter((member) => {
        if (kind === 'wellhub') return isWellhubMember(member, wellhubPlanMemberIds);
        if (kind === 'crm') return true;
        return !isGymPotentialMember(member.status);
      }),
    [kind, members, wellhubPlanMemberIds],
  );

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return inKind.filter((member) => {
      if (kind === 'members' && memberStatus !== 'all' && member.status !== memberStatus) return false;
      if (!normalized) return true;

      return (
        gymMemberFullName(member).toLowerCase().includes(normalized) ||
        (member.email ?? '').toLowerCase().includes(normalized) ||
        (member.phone ?? '').includes(normalized)
      );
    });
  }, [inKind, kind, memberStatus, query]);

  const visibleCoaches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return coaches;

    return coaches.filter((person) => {
      const name = gymUserDisplayName(person).toLowerCase();
      const email = (person.email ?? '').toLowerCase();
      return name.includes(normalized) || email.includes(normalized);
    });
  }, [coaches, query]);

  const visibleCrmMembers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return members;

    return members.filter((member) => {
      return (
        gymMemberFullName(member).toLowerCase().includes(normalized) ||
        (member.email ?? '').toLowerCase().includes(normalized) ||
        (member.phone ?? '').includes(normalized)
      );
    });
  }, [members, query]);

  const handleCreate = async (input: GymMemberInput) => {
    if (!gym) return { error: 'No hay gimnasio activo.' };

    const result = await createGymMember(gym.id, {
      ...input,
      signupSource: showingWellhub ? 'wellhub' : input.signupSource,
      pipelineStage:
        input.status === 'lead' || showingCrm ? 'potencial' : input.status === 'active' ? 'activo' : undefined,
    });

    if (!result.error && result.data) {
      const email = input.email?.trim().toLowerCase();
      if (email) {
        const link = await linkGymMemberAccount(gym.id, result.data.id, email);
        if (!link.error) {
          setMemberNotice(memberLinkNotice(email, Boolean(link.linked)));
        }
      }
      refresh();
    }

    return result;
  };

  const handleInviteCoach = async (input: Omit<InviteGymCoachInput, 'gymId'>) => {
    if (!gym) return { error: 'No hay gimnasio activo.' };

    const result = await inviteGymCoach({ ...input, gymId: gym.id });
    if (!result.error) {
      refreshStaff();
      setInviteNotice(inviteNoticeFor(input.email.trim().toLowerCase(), result));
    }
    return result;
  };

  const handleImportMembers = async (rows: GymMemberImportRow[]) => {
    if (!gym) return { created: 0, updated: 0, failed: rows.length, skipped: 0, memberships: 0 };

    const plansResult = await fetchGymMembershipPlans(gym.id);
    const plans = plansResult.data ?? [];
    const planByName = new Map(
      plans.map((plan) => [plan.name.trim().toLowerCase(), plan]),
    );

    let created = 0;
    let updated = 0;
    let failed = 0;
    let memberships = 0;

    for (const row of rows) {
      const existing = findMemberImportMatch(members, row);
      const payload: GymMemberInput = {
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        phone: row.phone,
        birthDate: row.birthDate,
        status: row.status ?? (showingCrm ? 'lead' : 'active'),
        pipelineStage:
          row.pipelineStage ??
          (row.status === 'lead' || showingCrm
            ? 'potencial'
            : row.status === 'active'
              ? 'activo'
              : undefined),
        notes: row.notes,
        joinedAt: row.joinedAt,
      };

      let memberId = existing?.id;
      if (existing) {
        const result = await updateGymMember(existing.id, payload);
        if (result.error) {
          failed += 1;
          continue;
        }
        updated += 1;
      } else {
        const result = await createGymMember(gym.id, payload);
        if (result.error || !result.data) {
          failed += 1;
          continue;
        }
        created += 1;
        memberId = result.data.id;
      }

      if (row.membership?.planName && memberId) {
        const plan = planByName.get(row.membership.planName.trim().toLowerCase());
        if (plan) {
          const membershipResult = await assignMemberMembership({
            gymId: gym.id,
            memberId,
            planId: plan.id,
            startsAt: row.membership.startsAt ?? new Date().toISOString().slice(0, 10),
            endsAt: row.membership.endsAt,
          });
          if (!membershipResult.error) memberships += 1;
        }
      }

      const email = row.email?.trim().toLowerCase();
      if (email && memberId) {
        await linkGymMemberAccount(gym.id, memberId, email);
      }
    }

    if (created > 0 || updated > 0) refresh();
    return { created, updated, failed, skipped: 0, memberships };
  };

  const exportMembers = showingCrm ? visibleCrmMembers : visible;
  const exportStem =
    kind === 'wellhub'
      ? 'wellhub-miembros'
      : showingCrm
        ? 'crm-contactos'
        : 'contactos-gimnasio';

  const openMember = (member: GymMember) =>
    router.push({ pathname: '/gym/members/[id]', params: { id: member.id } });

  return (
    <GymScreen>
      <ScreenWrapper scrollable={!showingCrm} style={showingCrm ? styles.crmPage : undefined}>
        <GymScreenHeader
          title="Miembros"
          subtitle={
            showingCoaches
              ? 'Equipo con acceso al panel para entrenamientos y tareas'
              : 'Clientes y posibles clientes de tu gimnasio'
          }
          action={
            showingCoaches
              ? permissions.canManage ? (
                  <Button title="Invitar entrenador" size="compact" onPress={() => setInvitingCoach(true)} />
                ) : undefined
              : permissions.canOperate ? (
                  <Button
                    title={
                      showingCrm
                        ? 'Añadir miembro potencial'
                        : showingWellhub
                          ? 'Añadir miembro Wellhub'
                          : 'Añadir miembro'
                    }
                    size="compact"
                    onPress={() => setCreating(true)}
                  />
                ) : undefined
          }
        />

        {showingCoaches
          ? staffError
            ? <GymErrorBanner message={staffError} onRetry={refreshStaff} />
            : null
          : error
            ? <GymErrorBanner message={error} onRetry={refresh} />
            : null}

        {inviteNotice ? <Text style={styles.notice}>{inviteNotice}</Text> : null}
        {memberNotice ? <Text style={styles.notice}>{memberNotice}</Text> : null}
        {importError ? <GymErrorBanner message={importError} onRetry={() => setImportError(null)} /> : null}

        <View style={styles.toolbar}>
          <View style={styles.toolbarTop}>
            <View style={styles.searchBar}>
              <AppIcon name="search" size={15} color={colors.textMuted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={
                  showingCoaches
                    ? 'Buscar entrenador por nombre o email...'
                    : showingWellhub
                      ? 'Buscar miembro Wellhub...'
                    : 'Buscar por nombre, email o teléfono...'
                }
                placeholderTextColor={colors.textMuted}
                style={styles.searchInput}
                accessibilityLabel={
                  showingCoaches
                    ? 'Buscar entrenador'
                    : showingCrm
                      ? 'Buscar en el CRM...'
                      : showingWellhub
                        ? 'Buscar miembro Wellhub'
                        : 'Buscar miembro'
                }
              />
              {query ? (
                <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel="Limpiar">
                  <AppIcon name="close" size={15} color={colors.textMuted} />
                </Pressable>
              ) : null}
            </View>

            {permissions.canOperate && !showingCoaches ? (
              <GymMemberDataActions
                gymId={gym?.id ?? ''}
                members={exportMembers}
                fileStem={exportStem}
                disabled={!gym}
                onImport={handleImportMembers}
                onNotice={(message) => {
                  setImportError(null);
                  setMemberNotice(message);
                }}
                onError={(message) => {
                  setMemberNotice(null);
                  setImportError(message);
                }}
              />
            ) : null}
          </View>

          <View style={styles.filters}>
            {KIND_TABS.map((option) => {
              const selected = kind === option.key;
              return (
                <Pressable
                  key={option.key}
                  onPress={() => setKind(option.key)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={({ pressed }) => [
                    styles.chip,
                    selected && styles.chipActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                    {option.label} · {kindCounts[option.key]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {kind === 'members' && !showingCoaches && !showingCrm ? (
            <View style={styles.filters}>
              {MEMBER_STATUS_FILTERS.map((option) => {
                const selected = memberStatus === option.key;
                const count =
                  option.key === 'all' ? kindCounts.allMembers : kindCounts.statuses[option.key];

                return (
                  <Pressable
                    key={option.key}
                    onPress={() => setMemberStatus(option.key)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    style={({ pressed }) => [
                      styles.subChip,
                      selected && styles.subChipActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.subChipText, selected && styles.subChipTextActive]}>
                      {option.label} · {count}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>

        {showingCrm ? (
          <GymMemberCrmBoard
            members={visibleCrmMembers}
            isLoading={isLoading}
            error={error}
            canOperate={permissions.canOperate}
            onRetry={refresh}
            onAdd={() => setCreating(true)}
          />
        ) : (showingCoaches ? staffLoading : isLoading) ? (
          <View style={styles.skeletonList}>
            {[0, 1, 2].map((index) => (
              <View key={index} style={styles.skeletonRow}>
                <SkeletonBlock height={34} width={34} radius={borderRadius.full} />
                <View style={styles.flex}>
                  <SkeletonBlock height={14} width="38%" />
                  <SkeletonBlock height={12} width="55%" style={styles.skeletonSpacer} />
                </View>
                <SkeletonBlock height={20} width={78} radius={borderRadius.full} />
              </View>
            ))}
          </View>
        ) : showingCoaches && coaches.length === 0 ? (
          <GymEmptyState
            icon="profile"
            title="Todavía no tienes entrenadores"
            text="Añade a tu equipo para que puedan entrar al panel, publicar entrenamientos y gestionar las tareas."
            action={
              permissions.canManage ? (
                <Button
                  title="Añadir el primero"
                  variant="outline"
                  size="compact"
                  onPress={() => setInvitingCoach(true)}
                />
              ) : undefined
            }
          />
        ) : showingCoaches && visibleCoaches.length === 0 ? (
          <Text style={styles.noResults}>Ningún entrenador coincide con esta búsqueda.</Text>
        ) : showingCoaches && wide ? (
          <View style={styles.table}>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.colMember]}>Entrenador</Text>
              <Text style={[styles.headerCell, styles.colStatus]}>Rol</Text>
              <Text style={[styles.headerCell, styles.colContact]}>Email</Text>
              <Text style={[styles.headerCell, styles.colDate]}>Acceso</Text>
            </View>

            {visibleCoaches.map((person, index) => (
              <View
                key={person.id}
                style={[styles.bodyRow, index === visibleCoaches.length - 1 && styles.bodyRowLast]}
              >
                <View style={[styles.colMember, styles.memberCell]}>
                  <View style={[styles.avatar, styles.coachAvatar]}>
                    <Text style={[styles.avatarText, styles.coachAvatarText]}>
                      {gymUserInitials(person)}
                    </Text>
                  </View>
                  <Text style={styles.memberName} numberOfLines={1}>
                    {gymUserDisplayName(person)}
                  </Text>
                </View>
                <View style={styles.colStatus}>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: withAlpha(colors.accent, '1F'),
                        borderColor: withAlpha(colors.accent, '4D'),
                      },
                    ]}
                  >
                    <Text style={[styles.badgeText, { color: colors.accent }]}>
                      {GYM_USER_ROLE_LABELS[person.role]}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.cell, styles.colContact]} numberOfLines={1}>
                  {person.email ?? '—'}
                </Text>
                <Text style={[styles.cell, styles.colDate]} numberOfLines={1}>
                  Panel de gimnasio
                </Text>
              </View>
            ))}
          </View>
        ) : showingCoaches ? (
          <View style={styles.cardList}>
            {visibleCoaches.map((person) => (
              <View key={person.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.avatar, styles.coachAvatar]}>
                    <Text style={[styles.avatarText, styles.coachAvatarText]}>
                      {gymUserInitials(person)}
                    </Text>
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.memberName} numberOfLines={1}>
                      {gymUserDisplayName(person)}
                    </Text>
                    <Text style={styles.cell} numberOfLines={1}>
                      {person.email ?? 'Sin email'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: withAlpha(colors.accent, '1F'),
                        borderColor: withAlpha(colors.accent, '4D'),
                      },
                    ]}
                  >
                    <Text style={[styles.badgeText, { color: colors.accent }]}>
                      {GYM_USER_ROLE_LABELS[person.role]}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : showingWellhub && !wellhubActivated && permissions.canManage ? (
          <WellhubActivationCard onActivate={() => setWellhubActivated(true)} />
        ) : showingWellhub && !wellhubActivated ? (
          <GymEmptyState
            icon="profile"
            title="Wellhub no está activado"
            text="Pide al administrador del gimnasio que active Wellhub desde esta pestaña."
          />
        ) : inKind.length === 0 ? (
          <>
            {showingWellhub && wellhubActivated ? <WellhubActivatedBanner /> : null}
            <GymEmptyState
            icon="profile"
            title={
              showingWellhub
                ? 'Todavía no hay miembros de Wellhub'
                : 'Todavía no tienes miembros'
            }
            text={
              showingWellhub
                ? 'Cuando alguien se apunte desde Wellhub aparecerá aquí. También puedes marcar un miembro manualmente o asignarle una tarifa Wellhub.'
                : 'Da de alta a tus clientes para poder gestionar reservas, asistencia y tarifas.'
            }
            action={
              permissions.canOperate ? (
                <Button
                  title="Añadir el primero"
                  variant="outline"
                  size="compact"
                  onPress={() => setCreating(true)}
                />
              ) : undefined
            }
          />
          </>
        ) : visible.length === 0 ? (
          <Text style={styles.noResults}>
            {showingWellhub
              ? 'Ningún miembro Wellhub coincide con esta búsqueda.'
              : 'Ningún miembro coincide con esta búsqueda.'}
          </Text>
        ) : (
          <>
            {showingWellhub && wellhubActivated ? <WellhubActivatedBanner /> : null}
            {wide ? (
          <View style={styles.table}>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.colMember]}>Cliente</Text>
              <Text style={[styles.headerCell, styles.colStatus]}>Estado</Text>
              <Text style={[styles.headerCell, styles.colContact]}>Contacto</Text>
              <Text style={[styles.headerCell, styles.colDate]}>Alta</Text>
              <View style={styles.colChevron} />
            </View>

            {visible.map((member, index) => (
              <Pressable
                key={member.id}
                onPress={() => openMember(member)}
                accessibilityRole="button"
                accessibilityLabel={`Abrir ficha de ${gymMemberFullName(member)}`}
                style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
                  styles.bodyRow,
                  index === visible.length - 1 && styles.bodyRowLast,
                  hovered && styles.bodyRowHovered,
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.colMember, styles.memberCell]}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{gymMemberInitials(member)}</Text>
                  </View>
                  <Text style={styles.memberName} numberOfLines={1}>
                    {gymMemberFullName(member)}
                  </Text>
                  {isWellhubMember(member, wellhubPlanMemberIds) ? <WellhubBadge /> : null}
                </View>

                <View style={styles.colStatus}>
                  <MemberStatusBadge status={member.status} />
                </View>

                <Text style={[styles.cell, styles.colContact]} numberOfLines={1}>
                  {member.email ?? member.phone ?? '—'}
                </Text>
                <Text style={[styles.cell, styles.colDate]} numberOfLines={1}>
                  {member.joinedAt}
                </Text>
                <View style={styles.colChevron}>
                  <AppIcon name="chevronRight" size={15} color={colors.textMuted} />
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.cardList}>
            {visible.map((member) => (
              <Pressable
                key={member.id}
                onPress={() => openMember(member)}
                accessibilityRole="button"
                accessibilityLabel={`Abrir ficha de ${gymMemberFullName(member)}`}
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{gymMemberInitials(member)}</Text>
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.memberName} numberOfLines={1}>
                      {gymMemberFullName(member)}
                    </Text>
                    <Text style={styles.cell} numberOfLines={1}>
                      {member.email ?? member.phone ?? 'Sin contacto'}
                    </Text>
                  </View>
                  <View style={styles.cardBadges}>
                    {isWellhubMember(member, wellhubPlanMemberIds) ? <WellhubBadge /> : null}
                    <MemberStatusBadge status={member.status} />
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
            )}
          </>
        )}

        <GymMemberFormModal
          visible={creating}
          defaultStatus={addingPotential ? 'lead' : 'active'}
          defaultSignupSource={showingWellhub ? 'wellhub' : undefined}
          onCancel={() => setCreating(false)}
          onSubmit={handleCreate}
        />

        <GymCoachFormModal
          visible={invitingCoach}
          gymName={gym?.name}
          onCancel={() => setInvitingCoach(false)}
          onSubmit={handleInviteCoach}
        />
      </ScreenWrapper>
    </GymScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  crmPage: {
    flex: 1,
    minHeight: 0,
  },
  toolbar: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  toolbarTop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 38,
    flexGrow: 1,
    flexBasis: 240,
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
  chipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 11,
  },
  chipTextActive: {
    color: colors.black,
  },
  subChip: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  subChipActive: {
    backgroundColor: withAlpha(colors.accent, '22'),
    borderColor: colors.accent,
  },
  subChipText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 11,
  },
  subChipTextActive: {
    color: colors.accent,
  },
  pressed: {
    opacity: 0.85,
  },
  table: {
    marginTop: spacing.md,
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
  colMember: { flex: 2.4 },
  colStatus: { flex: 1.2 },
  colContact: { flex: 2 },
  colDate: { flex: 1 },
  colChevron: { width: 18, alignItems: 'flex-end' },
  memberCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.full,
    backgroundColor: withAlpha(colors.accentBlue, '22'),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    ...typography.caption,
    color: colors.accentBlue,
    fontWeight: '700',
  },
  memberName: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    flexShrink: 1,
  },
  cell: {
    ...typography.caption,
    color: colors.textMuted,
  },
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
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 11,
  },
  cardList: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    padding: spacing.sm + 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  noResults: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: spacing.lg,
  },
  skeletonList: {
    marginTop: spacing.md,
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
  notice: {
    ...typography.bodySmall,
    color: colors.text,
    backgroundColor: withAlpha(colors.accent, '14'),
    borderWidth: 1,
    borderColor: withAlpha(colors.accent, '4D'),
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  coachAvatar: {
    backgroundColor: withAlpha(colors.accent, '22'),
  },
  coachAvatarText: {
    color: colors.accent,
  },
  wellhubBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    backgroundColor: withAlpha('#7C3AED', '1F'),
    borderWidth: 1,
    borderColor: withAlpha('#7C3AED', '4D'),
    flexShrink: 0,
  },
  wellhubBadgeText: {
    ...typography.caption,
    color: '#7C3AED',
    fontWeight: '700',
    fontSize: 11,
  },
  cardBadges: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
});
