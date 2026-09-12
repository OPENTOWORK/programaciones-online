import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { GymTrainingLinkFormModal } from '@/components/gym/GymTrainingLinkFormModal';
import {
  GymEmptyState,
  GymErrorBanner,
  GymScreen,
  GymScreenHeader,
} from '@/components/gym/GymScreen';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { useGym } from '@/hooks/useGym';
import { useGymTrainingManage } from '@/hooks/useGymTrainingManage';
import {
  deleteGymProgramLink,
  saveGymProgramLink,
  type GymProgramLinkInput,
} from '@/lib/gymService';
import { gymTrainingDateLabel, type GymProgramLink } from '@/lib/gymTypes';
import {
  groupManageItemsByDate,
  hiddenTrainingLinkInput,
  manageItemPreview,
  manageItemToEditLink,
  trainingItemTvParams,
  type GymTrainingManageItem,
} from '@/lib/gymTrainingManage';

function TrainingManageCard({
  item,
  canEdit,
  onEdit,
  onDelete,
  onLaunchTv,
}: {
  item: GymTrainingManageItem;
  canEdit: boolean;
  onEdit: () => void;
  onDelete?: () => void;
  onLaunchTv: () => void;
}) {
  const preview = manageItemPreview(item);
  const previewLines = preview.split('\n').filter(Boolean);
  const headline = previewLines[0] ?? item.name;

  return (
    <View style={styles.card}>
      <View style={[styles.programDot, { backgroundColor: item.color }]} />
      <View style={styles.cardCopy}>
        <Text style={styles.programName}>{headline}</Text>
        <Text style={styles.cardMeta}>{item.classTypeName ?? item.programName}</Text>
        {item.publishedDate ? (
          <Text style={styles.cardMeta}>
            Publicación · {gymTrainingDateLabel(item.publishedDate)}
            {item.publishedTime ? ` · ${item.publishedTime}` : ''}
          </Text>
        ) : null}
        <Text style={styles.cardMeta}>Entrenamiento · {gymTrainingDateLabel(item.dateKey)}</Text>
        {previewLines.length > 1 ? (
          <Text style={styles.cardPreview} numberOfLines={3}>
            {previewLines.slice(1).join('\n')}
          </Text>
        ) : null}
      </View>
      <View style={styles.cardActions}>
        <Pressable
          onPress={onLaunchTv}
          accessibilityLabel="Lanzar a TV"
          style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
        >
          <AppIcon name="tv" size={16} color={colors.accent} />
        </Pressable>
        {canEdit ? (
          <>
            <Pressable
              onPress={onEdit}
              accessibilityLabel="Editar"
              style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            >
              <AppIcon name="edit" size={16} color={colors.textSecondary} />
            </Pressable>
            {onDelete ? (
              <Pressable
                onPress={onDelete}
                accessibilityLabel="Quitar"
                style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
              >
                <AppIcon name="trash" size={16} color={colors.danger} />
              </Pressable>
            ) : null}
          </>
        ) : null}
      </View>
    </View>
  );
}

export default function GymTrainingScreen() {
  const router = useRouter();
  const { gym, permissions } = useGym();
  const { items, classTypes, programs, isLoading, error, refresh } = useGymTrainingManage();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<GymProgramLink | null>(null);
  const [pendingDelete, setPendingDelete] = useState<GymTrainingManageItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const dateGroups = useMemo(() => groupManageItemsByDate(items), [items]);
  const canEdit = permissions.canManage;

  const handleSubmit = async (input: GymProgramLinkInput) => {
    if (!gym) return { error: 'No hay gimnasio activo.' };
    const result = await saveGymProgramLink(gym.id, { ...input, id: editing?.id });
    if (!result.error) refresh();
    return result;
  };

  const handleDelete = async () => {
    if (!pendingDelete || !gym) return;
    setBusy(true);
    setActionError(null);

    let result: { error?: string } = { error: undefined };
    if (pendingDelete.link?.id) {
      result = await deleteGymProgramLink(pendingDelete.link.id);
    } else {
      const hiddenInput = hiddenTrainingLinkInput(pendingDelete, classTypes, programs);
      if (!hiddenInput) {
        result = { error: 'No se pudo identificar la modalidad de este entrenamiento.' };
      } else {
        result = await saveGymProgramLink(gym.id, hiddenInput);
      }
    }

    setBusy(false);
    setPendingDelete(null);
    if (result.error) {
      setActionError(result.error);
      return;
    }
    refresh();
  };

  const launchToTv = (item: GymTrainingManageItem) => {
    router.push({
      pathname: '/gym/tv/[workoutId]',
      params: trainingItemTvParams(item),
    });
  };

  const openEditor = (item: GymTrainingManageItem) => {
    if (!gym) return;
    const link = manageItemToEditLink(item, gym.id, classTypes, programs);
    if (!link) {
      setActionError('No se pudo abrir este entrenamiento para editar.');
      return;
    }
    setActionError(null);
    setEditing(link);
    setFormOpen(true);
  };

  const deleteLabel = pendingDelete
    ? `${pendingDelete.classTypeName ?? pendingDelete.programName} · ${gymTrainingDateLabel(pendingDelete.dateKey)}`
    : '';

  return (
    <GymScreen>
      <ScreenWrapper>
        <GymScreenHeader
          title="Entrenamientos"
          subtitle="Qué se entrena en cada modalidad, cuándo se publica y cuándo se entrena"
          action={
            canEdit ? (
              <Button
                title="Generar WOD"
                size="compact"
                onPress={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              />
            ) : undefined
          }
        />

        {error ? <GymErrorBanner message={error} onRetry={refresh} /> : null}
        {actionError ? <GymErrorBanner message={actionError} onRetry={() => setActionError(null)} /> : null}

        {isLoading ? (
          <View style={styles.skeleton}>
            <SkeletonBlock height={88} />
            <SkeletonBlock height={88} />
            <SkeletonBlock height={88} />
          </View>
        ) : classTypes.length === 0 ? (
          <GymEmptyState
            icon="programs"
            title="Primero crea las modalidades"
            text="En Clases y tarifas puedes dar de alta Cross Training, Hyrox, ATHX y el resto de clases."
            action={
              <Button
                title="Ir a clases y tarifas"
                variant="outline"
                size="compact"
                onPress={() => router.push('/gym/classes')}
              />
            }
          />
        ) : items.length === 0 ? (
          <GymEmptyState
            icon="strength"
            title="Todavía no hay entrenamientos en el calendario"
            text="Cuando haya entrenos publicados en el calendario, aparecerán aquí para editarlos o cambiar sus fechas."
            action={
              canEdit ? (
                <Button
                  title="Generar WOD"
                  variant="outline"
                  size="compact"
                  onPress={() => {
                    setEditing(null);
                    setFormOpen(true);
                  }}
                />
              ) : undefined
            }
          />
        ) : (
          <View style={styles.list}>
            {dateGroups.map((group) => (
              <View key={group.key} style={styles.dayGroup}>
                <Text style={styles.dayTitle}>{gymTrainingDateLabel(group.key)}</Text>
                {group.items.map((item) => (
                  <TrainingManageCard
                    key={item.id}
                    item={item}
                    canEdit={canEdit}
                    onEdit={() => openEditor(item)}
                    onDelete={() => setPendingDelete(item)}
                    onLaunchTv={() => launchToTv(item)}
                  />
                ))}
              </View>
            ))}
          </View>
        )}

        <GymTrainingLinkFormModal
          visible={formOpen}
          link={editing}
          programs={programs}
          classTypes={classTypes}
          onCancel={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSubmit={handleSubmit}
        />

        <ConfirmModal
          visible={pendingDelete !== null}
          title="Quitar entrenamiento"
          message={`Se quitará del calendario: ${deleteLabel}.`}
          confirmLabel="Quitar"
          destructive
          busy={busy}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => void handleDelete()}
        />
      </ScreenWrapper>
    </GymScreen>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  list: {
    marginTop: spacing.md,
    gap: spacing.lg,
  },
  dayGroup: {
    gap: spacing.sm,
  },
  dayTitle: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  programDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
    marginTop: 4,
  },
  cardCopy: {
    flex: 1,
    minWidth: 0,
  },
  programName: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  cardMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  cardPreview: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 16,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 4,
  },
  iconBtn: {
    padding: 6,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  pressed: {
    opacity: 0.75,
  },
});
