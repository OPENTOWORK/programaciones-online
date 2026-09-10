import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { gymMemberFullName, gymMemberInitials, type GymClass, type GymMember } from '@/lib/gymTypes';

function formatTime(iso?: string) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

interface GymMemberBookingModalProps {
  visible: boolean;
  gymClass: GymClass | null;
  members: GymMember[];
  onClose: () => void;
  onSelect: (memberId: string) => void;
}

export function GymMemberBookingModal({
  visible,
  gymClass,
  members,
  onClose,
  onSelect,
}: GymMemberBookingModalProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (visible) setQuery('');
  }, [visible, gymClass?.id]);

  const filteredMembers = useMemo(() => {
    const eligible = members.filter((member) => member.status === 'active' || member.status === 'lead');
    const normalized = query.trim().toLowerCase();
    if (!normalized) return eligible;

    return eligible.filter((member) => {
      const haystack = [
        member.firstName,
        member.lastName,
        member.email ?? '',
        member.phone ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [members, query]);

  const full = gymClass ? gymClass.bookedCount >= gymClass.capacity : false;
  const classLabel = gymClass?.classTypeName ?? gymClass?.title ?? 'Clase';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <AppIcon name="add" size={20} color={colors.accent} />
            </View>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Reservar miembro</Text>
              {gymClass ? (
                <View style={styles.classChip}>
                  <AppIcon name="time" size={13} color={colors.textSecondary} />
                  <Text style={styles.classChipText}>
                    {formatTime(gymClass.startAt)} · {classLabel}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {gymClass ? (
            <View style={styles.capacityRow}>
              <View style={styles.capacityCopy}>
                <Text style={styles.capacityLabel}>Aforo</Text>
                <Text style={styles.capacityValue}>
                  {gymClass.bookedCount} / {gymClass.capacity} plazas
                </Text>
              </View>
              <View style={[styles.modeBadge, full && styles.modeBadgeWaiting]}>
                <Text style={[styles.modeBadgeText, full && styles.modeBadgeTextWaiting]}>
                  {full ? 'Lista de espera' : 'Plaza libre'}
                </Text>
              </View>
            </View>
          ) : null}

          <View style={styles.searchWrap}>
            <AppIcon name="search" size={16} color={colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar por nombre, email o teléfono"
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {filteredMembers.length === 0 ? (
              <View style={styles.emptyState}>
                <AppIcon name="profile" size={22} color={colors.textMuted} outlined />
                <Text style={styles.emptyTitle}>
                  {members.length === 0 ? 'No hay miembros activos' : 'Sin resultados'}
                </Text>
                <Text style={styles.emptyText}>
                  {members.length === 0
                    ? 'Añade miembros en el CRM para poder reservar plazas.'
                    : 'Prueba con otro nombre o dato de contacto.'}
                </Text>
              </View>
            ) : (
              filteredMembers.map((member) => (
                <Pressable
                  key={member.id}
                  onPress={() => onSelect(member.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Reservar a ${gymMemberFullName(member)}`}
                  style={({ pressed }) => [styles.memberRow, pressed && styles.memberRowPressed]}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{gymMemberInitials(member)}</Text>
                  </View>
                  <View style={styles.memberCopy}>
                    <Text style={styles.memberName} numberOfLines={1}>
                      {gymMemberFullName(member)}
                    </Text>
                    {member.email || member.phone ? (
                      <Text style={styles.memberMeta} numberOfLines={1}>
                        {member.email ?? member.phone}
                      </Text>
                    ) : null}
                  </View>
                  <AppIcon name="chevronRight" size={16} color={colors.textMuted} />
                </Pressable>
              ))
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Button title="Cancelar" variant="outline" onPress={onClose} style={styles.cancelButton} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '86%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 18px 48px rgba(15, 23, 42, 0.18)',
        } as object)
      : null),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: withAlpha(colors.accent, '14'),
    borderWidth: 1,
    borderColor: withAlpha(colors.accent, '28'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  classChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  classChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  capacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  capacityCopy: {
    flex: 1,
    gap: 2,
  },
  capacityLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 0.4,
  },
  capacityValue: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  modeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    backgroundColor: withAlpha('#4ADE80', '18'),
    borderWidth: 1,
    borderColor: withAlpha('#4ADE80', '35'),
  },
  modeBadgeWaiting: {
    backgroundColor: withAlpha(colors.warning, '18'),
    borderColor: withAlpha(colors.warning, '35'),
  },
  modeBadgeText: {
    ...typography.caption,
    color: '#4ADE80',
    fontWeight: '700',
    fontSize: 11,
  },
  modeBadgeTextWaiting: {
    color: colors.warning,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.text,
    paddingVertical: Platform.OS === 'web' ? 10 : spacing.sm,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
  },
  list: {
    flexGrow: 0,
    maxHeight: 320,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  memberRowPressed: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.border,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: withAlpha(colors.accent, '16'),
    borderWidth: 1,
    borderColor: withAlpha(colors.accent, '30'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '800',
    fontSize: 11,
  },
  memberCopy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  memberName: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  memberMeta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
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
    maxWidth: 280,
  },
  footer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    width: '100%',
  },
});
