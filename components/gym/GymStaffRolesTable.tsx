import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionSheetModal, type ActionSheetAction } from '@/components/ui/ActionSheetModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import {
  canChangeGymStaffRole,
  GYM_STAFF_ACCESS_TIER_LABELS,
  gymRoleForAccessTier,
  gymStaffAccessTier,
  type GymStaffAccessTier,
  type GymUser,
} from '@/lib/gymTypes';

interface GymStaffRolesTableProps {
  staff: GymUser[];
  currentUserId?: string;
  busy?: boolean;
  onChangeRole: (member: GymUser, tier: GymStaffAccessTier) => Promise<boolean>;
}

export function GymStaffRolesTable({
  staff,
  currentUserId,
  busy = false,
  onChangeRole,
}: GymStaffRolesTableProps) {
  const [selectedMember, setSelectedMember] = useState<GymUser | null>(null);
  const [pendingTier, setPendingTier] = useState<GymStaffAccessTier | null>(null);

  const sheetActions = useMemo<ActionSheetAction[]>(() => {
    if (!selectedMember) return [];

    const currentTier = gymStaffAccessTier(selectedMember.role);
    const isSelf = selectedMember.userId === currentUserId;
    const locked = !canChangeGymStaffRole(selectedMember.role) || isSelf;

    return (['administrador', 'comercial'] as GymStaffAccessTier[]).map((tier) => ({
      key: tier,
      label: GYM_STAFF_ACCESS_TIER_LABELS[tier],
      disabled: locked || tier === currentTier,
      onPress: () => {
        setPendingTier(tier);
      },
    }));
  }, [currentUserId, selectedMember]);

  if (staff.length === 0) {
    return <Text style={styles.emptyRow}>Todavía no hay usuarios en este gimnasio.</Text>;
  }

  const confirmMember = pendingTier ? selectedMember : null;

  return (
    <>
      <View style={styles.table}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerCell, styles.colRole]}>Rol</Text>
          <Text style={[styles.headerCell, styles.colEmail]}>Email</Text>
        </View>

        {staff.map((member, index) => {
          const tier = gymStaffAccessTier(member.role);
          const isSelf = member.userId === currentUserId;
          const editable = canChangeGymStaffRole(member.role) && !isSelf;

          return (
            <View
              key={member.id}
              style={[styles.bodyRow, index === staff.length - 1 && styles.bodyRowLast]}
            >
              {editable ? (
                <Pressable
                  onPress={() => setSelectedMember(member)}
                  disabled={busy}
                  accessibilityRole="button"
                  accessibilityLabel={`Cambiar rol de ${member.email ?? member.name ?? 'usuario'}`}
                  style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
                    styles.colRole,
                    styles.rolePressable,
                    (pressed || hovered) && styles.rolePressableActive,
                  ]}
                >
                  <Text style={styles.roleText}>{GYM_STAFF_ACCESS_TIER_LABELS[tier]}</Text>
                </Pressable>
              ) : (
                <View style={styles.colRole}>
                  <Text style={[styles.roleText, !editable && styles.roleTextMuted]}>
                    {GYM_STAFF_ACCESS_TIER_LABELS[tier]}
                  </Text>
                  {isSelf ? (
                    <Text style={styles.roleHint}>Tu cuenta</Text>
                  ) : member.role === 'owner' ? (
                    <Text style={styles.roleHint}>Propietario</Text>
                  ) : null}
                </View>
              )}

              <Text style={[styles.cell, styles.colEmail]} numberOfLines={1}>
                {member.email ?? '—'}
              </Text>
            </View>
          );
        })}
      </View>

      <ActionSheetModal
        visible={selectedMember !== null && pendingTier === null}
        title={selectedMember?.name ?? 'Cambiar rol'}
        subtitle={selectedMember?.email}
        actions={sheetActions}
        onClose={() => setSelectedMember(null)}
      />

      <ConfirmModal
        visible={pendingTier !== null && confirmMember !== null}
        title={`¿Cambiar a ${confirmMember ? GYM_STAFF_ACCESS_TIER_LABELS[pendingTier!].toLowerCase() : ''}?`}
        message={
          confirmMember
            ? `${confirmMember.email ?? confirmMember.name ?? 'Este usuario'} pasará a nivel ${GYM_STAFF_ACCESS_TIER_LABELS[pendingTier!].toLowerCase()}.`
            : ''
        }
        busy={busy}
        onCancel={() => {
          setPendingTier(null);
          setSelectedMember(null);
        }}
        onConfirm={() => {
          if (!confirmMember || !pendingTier) return;
          void onChangeRole(confirmMember, pendingTier).then((ok) => {
            if (ok) {
              setPendingTier(null);
              setSelectedMember(null);
            }
          });
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
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
    fontSize: 11,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  bodyRowLast: {
    borderBottomWidth: 0,
  },
  colRole: {
    flex: 0.9,
    minWidth: 120,
  },
  colEmail: {
    flex: 1.4,
    minWidth: 0,
  },
  rolePressable: {
    alignSelf: 'flex-start',
    paddingHorizontal: 2,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  rolePressableActive: {
    backgroundColor: withAlpha(colors.accent, '22'),
  },
  roleText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  roleTextMuted: {
    color: colors.textSecondary,
  },
  roleHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
    textTransform: 'none',
  },
  cell: {
    ...typography.bodySmall,
    color: colors.text,
  },
  emptyRow: {
    ...typography.caption,
    color: colors.textMuted,
    padding: spacing.md,
    fontStyle: 'italic',
  },
});
