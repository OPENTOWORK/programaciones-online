import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AlertDismissButton } from '@/components/trainer/AlertDismissButton';
import { AppIcon } from '@/components/ui/AppIcon';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { NavCountBadge } from '@/components/ui/NavCountBadge';
import { colors, spacing, typography } from '@/constants/theme';
import type { AppIconName } from '@/constants/icons';
import { useTrainerNotifications } from '@/hooks/useTrainerNotifications';
import {
  formatNotificationWhen,
  notificationDismissalKey,
  type TrainerNotification,
  type TrainerNotificationKind,
} from '@/lib/trainerNotifications';

const KIND_ICON: Record<TrainerNotificationKind, AppIconName> = {
  chat: 'chat',
  sessions: 'stats',
  intake: 'info',
  appointment: 'calendar',
};

const DONE_GREEN = '#4ADE80';

export function ProfileNotificationsCard() {
  const router = useRouter();
  const { items, count, isLoading, toggle, removeMany } = useTrainerNotifications();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [pendingDelete, setPendingDelete] = useState<TrainerNotification[] | null>(null);
  const [removing, setRemoving] = useState(false);
  const removingRef = useRef(false);

  const itemKeys = useMemo(() => items.map(notificationDismissalKey), [items]);

  useEffect(() => {
    const valid = new Set(itemKeys);
    setSelectedKeys((current) => current.filter((key) => valid.has(key)));
  }, [itemKeys]);

  const pending = !isLoading && count > 0;
  const firstPending = items.find((item) => !item.done);
  const selectedCount = selectedKeys.length;
  const allSelected = items.length > 0 && selectedCount === items.length;
  const subtitle = isLoading
    ? 'Comprobando avisos…'
    : pending
      ? firstPending
        ? `${count} aviso${count === 1 ? '' : 's'} pendiente${count === 1 ? '' : 's'} · ${firstPending.title}`
        : `${count} aviso${count === 1 ? '' : 's'} pendiente${count === 1 ? '' : 's'}`
      : items.length > 0
        ? 'Avisos revisados'
        : 'Mensajes, entrenos, formularios y citas';

  const toggleSelected = (key: string) => {
    setSelectedKeys((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  };

  const toggleSelectAll = () => {
    setSelectedKeys(allSelected ? [] : itemKeys);
  };

  const selectedItems = items.filter((item) => selectedKeys.includes(notificationDismissalKey(item)));
  const deleteTarget = pendingDelete ?? [];
  const deletingMany = deleteTarget.length > 1;

  const confirmDelete = async () => {
    if (deleteTarget.length === 0 || removingRef.current) return;
    removingRef.current = true;
    setRemoving(true);
    try {
      await removeMany(deleteTarget);
      setSelectedKeys((current) =>
        current.filter((key) => !deleteTarget.some((item) => notificationDismissalKey(item) === key)),
      );
      setPendingDelete(null);
    } finally {
      removingRef.current = false;
      setRemoving(false);
    }
  };

  return (
    <CollapsibleSection
      title="Notificaciones"
      subtitle={subtitle}
      tone={pending ? 'warning' : 'default'}
      headerActions={<NavCountBadge count={count} />}
      style={styles.card}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : items.length === 0 ? (
        <Text style={styles.empty}>
          No tienes avisos pendientes. Aquí aparecerán chats sin responder, entrenos nuevos,
          formularios actualizados y citas por confirmar.
        </Text>
      ) : (
        <>
          <View style={styles.toolbar}>
            <Pressable
              onPress={toggleSelectAll}
              accessibilityRole="button"
              accessibilityLabel={allSelected ? 'Quitar selección' : 'Seleccionar todos los avisos'}
              style={({ pressed }) => [styles.toolbarButton, pressed && styles.rowPressed]}
            >
              <Text style={styles.toolbarButtonText}>{allSelected ? 'Quitar selección' : 'Seleccionar todo'}</Text>
            </Pressable>
            <Pressable
              onPress={() => setPendingDelete(selectedItems)}
              disabled={selectedCount === 0 || removing}
              accessibilityRole="button"
              accessibilityLabel={`Eliminar ${selectedCount} avisos`}
              style={({ pressed }) => [
                styles.toolbarButton,
                styles.toolbarDanger,
                selectedCount === 0 && styles.toolbarDisabled,
                pressed && selectedCount > 0 && styles.rowPressed,
              ]}
            >
              <AppIcon name="trash" size={14} color={selectedCount === 0 ? colors.textMuted : colors.danger} />
              <Text style={[styles.toolbarDangerText, selectedCount === 0 && styles.toolbarDisabledText]}>
                {selectedCount > 0 ? `Eliminar (${selectedCount})` : 'Eliminar'}
              </Text>
            </Pressable>
          </View>
          {items.map((item) => {
            const done = Boolean(item.done);
            const tint = done ? DONE_GREEN : colors.warning;
            const when = formatNotificationWhen(item.occurredAt);
            const key = notificationDismissalKey(item);
            const checked = selectedKeys.includes(key);
            return (
              <View key={key} style={[styles.row, done ? styles.rowDone : styles.rowPending]}>
                <Pressable
                  onPress={() => toggleSelected(key)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked }}
                  accessibilityLabel={`Seleccionar ${item.title}`}
                  style={({ pressed }) => [styles.checkboxHit, pressed && styles.rowPressed]}
                >
                  <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                    {checked ? <AppIcon name="check" size={12} color={colors.white} /> : null}
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => router.push(item.href)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    when ? `${item.title}. ${when.date} a las ${when.time}` : item.title
                  }
                  style={({ pressed }) => [styles.rowMain, pressed && styles.rowPressed]}
                >
                  <AppIcon name={KIND_ICON[item.kind]} size={18} color={tint} />
                  <View style={styles.rowCopy}>
                    <Text
                      style={[styles.rowTitle, done ? styles.rowTitleDone : styles.rowTitlePending]}
                      numberOfLines={1}
                    >
                      {done ? `Hecho · ${item.title}` : item.title}
                    </Text>
                    <Text
                      style={[styles.rowMeta, done ? styles.rowMetaDone : styles.rowMetaPending]}
                      numberOfLines={2}
                    >
                      {item.subtitle}
                    </Text>
                  </View>
                  {when ? (
                    <View style={styles.when} accessibilityElementsHidden>
                      <Text
                        style={[styles.whenDate, done ? styles.whenDone : styles.whenPending]}
                        numberOfLines={1}
                      >
                        {when.date}
                      </Text>
                      <Text
                        style={[styles.whenTime, done ? styles.whenDone : styles.whenPending]}
                        numberOfLines={1}
                      >
                        {when.time}
                      </Text>
                    </View>
                  ) : null}
                </Pressable>
                <AlertDismissButton
                  completed={done}
                  onPress={() => void toggle(item)}
                  accessibilityLabel={done ? 'Desmarcar aviso' : 'Marcar aviso como hecho'}
                />
                <Pressable
                  onPress={() => setPendingDelete([item])}
                  disabled={removing}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Eliminar aviso: ${item.title}`}
                  style={({ pressed }) => [styles.deleteButton, pressed && styles.rowPressed]}
                >
                  <AppIcon name="trash" size={16} color={colors.danger} />
                </Pressable>
              </View>
            );
          })}
        </>
      )}

      <ConfirmModal
        visible={deleteTarget.length > 0}
        title={deletingMany ? 'Eliminar avisos' : 'Eliminar aviso'}
        message={
          deletingMany
            ? `Se quitarán ${deleteTarget.length} avisos de esta lista. Si hay actividad nueva, volverán a aparecer.`
            : 'Este aviso dejará de mostrarse. Si hay actividad nueva, volverá a aparecer.'
        }
        checkboxLabel={
          deletingMany ? 'Quiero eliminar los avisos seleccionados' : 'Quiero eliminar este aviso'
        }
        confirmLabel={removing ? 'Eliminando…' : 'Eliminar'}
        cancelLabel="Cancelar"
        destructive
        busy={removing}
        onCancel={() => {
          if (!removing) setPendingDelete(null);
        }}
        onConfirm={() => void confirmDelete()}
      />
    </CollapsibleSection>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.md,
  },
  loader: {
    marginVertical: spacing.sm,
  },
  empty: {
    ...typography.bodySmall,
    color: colors.textMuted,
    lineHeight: 20,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 2,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  toolbarDanger: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${colors.danger}44`,
    backgroundColor: `${colors.danger}12`,
  },
  toolbarDisabled: {
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
    ...(Platform.OS === 'web' ? ({ cursor: 'default' } as object) : null),
  },
  toolbarButtonText: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '600',
  },
  toolbarDangerText: {
    ...typography.bodySmall,
    color: colors.danger,
    fontWeight: '700',
  },
  toolbarDisabledText: {
    color: colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginHorizontal: -spacing.sm,
    borderRadius: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowPending: {
    backgroundColor: 'rgba(255, 179, 0, 0.16)',
    borderBottomColor: 'rgba(255, 179, 0, 0.28)',
  },
  rowDone: {
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
    borderBottomColor: 'rgba(74, 222, 128, 0.22)',
  },
  checkboxHit: {
    paddingVertical: 4,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    minWidth: 0,
  },
  rowPressed: {
    opacity: 0.72,
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
  },
  when: {
    flexShrink: 0,
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 72,
    paddingLeft: spacing.xs,
  },
  whenDate: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  whenTime: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  whenDone: {
    color: 'rgba(74, 222, 128, 0.9)',
  },
  whenPending: {
    color: colors.warning,
  },
  rowTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  rowTitlePending: {
    color: colors.warning,
  },
  rowTitleDone: {
    color: DONE_GREEN,
  },
  rowMeta: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 18,
  },
  rowMetaPending: {
    color: colors.warning,
  },
  rowMetaDone: {
    color: 'rgba(74, 222, 128, 0.82)',
  },
  deleteButton: {
    padding: 4,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
});
