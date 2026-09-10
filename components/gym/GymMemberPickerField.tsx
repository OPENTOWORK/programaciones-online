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
import { gymMemberFullName, gymMemberInitials, type GymMember } from '@/lib/gymTypes';

interface GymMemberPickerFieldProps {
  label?: string;
  members: GymMember[];
  value: GymMember | null;
  onChange: (member: GymMember | null) => void;
  optional?: boolean;
}

export function GymMemberPickerField({
  label = 'Atleta',
  members,
  value,
  onChange,
  optional = true,
}: GymMemberPickerFieldProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const filteredMembers = useMemo(() => {
    const eligible = members.filter(
      (member) => member.status === 'active' || member.status === 'lead',
    );
    const normalized = query.trim().toLowerCase();
    if (!normalized) return eligible;

    return eligible.filter((member) => {
      const haystack = [member.firstName, member.lastName, member.email ?? '', member.phone ?? '']
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [members, query]);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {optional ? ' (opcional)' : ''}
      </Text>

      {value ? (
        <View style={styles.selectedRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{gymMemberInitials(value)}</Text>
          </View>
          <View style={styles.selectedCopy}>
            <Text style={styles.selectedName} numberOfLines={1}>{gymMemberFullName(value)}</Text>
            {value.email || value.phone ? (
              <Text style={styles.selectedMeta} numberOfLines={1}>
                {value.email ?? value.phone}
              </Text>
            ) : null}
          </View>
          <Pressable
            onPress={() => onChange(null)}
            accessibilityRole="button"
            accessibilityLabel="Quitar atleta"
            hitSlop={6}
            style={({ pressed }) => [styles.clearBtn, pressed && styles.pressed]}
          >
            <AppIcon name="close" size={14} color={colors.textMuted} />
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={() => setOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Seleccionar atleta"
          style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
        >
          <AppIcon name="profile" size={16} color={colors.textMuted} outlined />
          <Text style={styles.triggerText}>Seleccionar atleta</Text>
          <AppIcon name="chevronRight" size={14} color={colors.textMuted} />
        </Pressable>
      )}

      {value ? (
        <Pressable
          onPress={() => setOpen(true)}
          accessibilityRole="button"
          style={({ pressed }) => [styles.changeLink, pressed && styles.pressed]}
        >
          <Text style={styles.changeLinkText}>Cambiar atleta</Text>
        </Pressable>
      ) : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
            onPress={() => setOpen(false)}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.card}>
            <Text style={styles.title}>Seleccionar atleta</Text>
            <Text style={styles.subtitle}>La venta quedará vinculada a su ficha y balance.</Text>

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
                <Text style={styles.empty}>No hay miembros que coincidan con la búsqueda.</Text>
              ) : (
                filteredMembers.map((member, index) => (
                  <Pressable
                    key={member.id}
                    onPress={() => {
                      onChange(member);
                      setOpen(false);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Seleccionar ${gymMemberFullName(member)}`}
                    style={({ pressed }) => [
                      styles.memberRow,
                      index > 0 && styles.memberRowBorder,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{gymMemberInitials(member)}</Text>
                    </View>
                    <View style={styles.selectedCopy}>
                      <Text style={styles.selectedName} numberOfLines={1}>
                        {gymMemberFullName(member)}
                      </Text>
                      {member.email || member.phone ? (
                        <Text style={styles.selectedMeta} numberOfLines={1}>
                          {member.email ?? member.phone}
                        </Text>
                      ) : null}
                    </View>
                    <AppIcon name="chevronRight" size={16} color={colors.textMuted} />
                  </Pressable>
                ))
              )}
            </ScrollView>

            <Button title="Cancelar" variant="outline" onPress={() => setOpen(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  triggerText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    flex: 1,
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: withAlpha(colors.accent, '55'),
    borderRadius: borderRadius.md,
    backgroundColor: withAlpha(colors.accent, '12'),
  },
  selectedCopy: {
    flex: 1,
    minWidth: 0,
  },
  selectedName: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  selectedMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  changeLink: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  changeLinkText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: withAlpha(colors.black, '88'),
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '80%',
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    minHeight: 42,
    backgroundColor: colors.background,
  },
  searchInput: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.text,
    paddingVertical: Platform.OS === 'web' ? 8 : 6,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
  },
  list: {
    maxHeight: 320,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
  },
  empty: {
    ...typography.caption,
    color: colors.textMuted,
    padding: spacing.md,
    textAlign: 'center',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  memberRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(colors.accent, '22'),
    flexShrink: 0,
  },
  avatarText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.85,
  },
});
