import { useEffect, useMemo, useState } from 'react';
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
import { useGymTrainingLinks } from '@/hooks/useGymData';
import {
  deleteGymProgramLink,
  saveGymProgramLink,
  type GymProgramLinkInput,
} from '@/lib/gymService';
import {
  GYM_WEEKDAY_LABELS,
  gymTrainingDateLabel,
  type GymProgramLink,
} from '@/lib/gymTypes';
import { fetchHypeTrainingPrograms, HYPE_PROGRAM_COLORS } from '@/lib/gymTraining';
import type { Program } from '@/lib/types';

function groupByScheduledDate(links: readonly GymProgramLink[]) {
  const dated = links.filter((link) => link.scheduledDate);
  const keys = [...new Set(dated.map((link) => link.scheduledDate as string))].sort();
  return keys.map((dateKey) => ({
    key: dateKey,
    label: gymTrainingDateLabel(dateKey),
    links: dated.filter((link) => link.scheduledDate === dateKey),
  }));
}

function groupByWeekday(links: readonly GymProgramLink[]) {
  return GYM_WEEKDAY_LABELS.map((label, weekday) => ({
    weekday,
    label,
    links: links.filter((link) => !link.scheduledDate && link.weekday === weekday),
  })).filter((group) => group.links.length > 0);
}

function TrainingLinkCard({
  link,
  canEdit,
  onEdit,
  onDelete,
}: {
  link: GymProgramLink;
  canEdit: boolean;
  onEdit: () => void;
  onDelete?: () => void;
}) {
  return (
    <View style={styles.card}>
      <View
        style={[
          styles.programDot,
          { backgroundColor: link.classTypeColor ?? HYPE_PROGRAM_COLORS[link.programName ?? ''] ?? colors.accent },
        ]}
      />
      <View style={styles.cardCopy}>
        <Text style={styles.programName}>
          {link.sessionDraft?.name ?? link.label ?? link.classTypeName ?? link.programName ?? 'Entrenamiento'}
        </Text>
        {link.classTypeName && (link.sessionDraft?.name || link.label) ? (
          <Text style={styles.cardMeta}>{link.classTypeName}</Text>
        ) : null}
        {link.publishedDate ? (
          <Text style={styles.cardMeta}>
            Publicación · {gymTrainingDateLabel(link.publishedDate)}
            {link.publishedTime ? ` · ${link.publishedTime}` : ''}
          </Text>
        ) : null}
        {link.scheduledDate || link.weekday != null ? (
          <Text style={styles.cardMeta}>
            Entrenamiento · {gymTrainingDateLabel(link.scheduledDate, link.weekday)}
          </Text>
        ) : null}
      </View>
      {canEdit ? (
        <View style={styles.cardActions}>
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
        </View>
      ) : null}
    </View>
  );
}

export default function GymTrainingScreen() {
  const router = useRouter();
  const { gym, permissions } = useGym();
  const { links, classTypes, isLoading, error, refresh } = useGymTrainingLinks();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<GymProgramLink | null>(null);
  const [pendingDelete, setPendingDelete] = useState<GymProgramLink | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetchHypeTrainingPrograms().then(setPrograms);
  }, []);

  const dateGroups = useMemo(() => groupByScheduledDate(links), [links]);
  const weekdayGroups = useMemo(() => groupByWeekday(links), [links]);
  const unscheduled = useMemo(
    () => links.filter((link) => !link.scheduledDate && link.weekday == null),
    [links],
  );
  const canEdit = permissions.canManage;

  const handleSubmit = async (input: GymProgramLinkInput) => {
    if (!gym) return { error: 'No hay gimnasio activo.' };
    const result = await saveGymProgramLink(gym.id, { ...input, id: editing?.id });
    if (!result.error) refresh();
    return result;
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setBusy(true);
    const result = await deleteGymProgramLink(pendingDelete.id);
    setBusy(false);
    setPendingDelete(null);
    if (!result.error) refresh();
  };

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

        {isLoading ? (
          <View style={styles.skeleton}>
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
        ) : links.length === 0 ? (
          <GymEmptyState
            icon="strength"
            title="Todavía no hay entrenamientos asignados"
            text="Elige la modalidad, la fecha de publicación y la fecha del entrenamiento."
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
                <Text style={styles.dayTitle}>{group.label}</Text>
                {group.links.map((link) => (
                  <TrainingLinkCard
                    key={link.id}
                    link={link}
                    canEdit={canEdit}
                    onEdit={() => {
                      setEditing(link);
                      setFormOpen(true);
                    }}
                    onDelete={() => setPendingDelete(link)}
                  />
                ))}
              </View>
            ))}
            {weekdayGroups.map((group) => (
              <View key={`weekday-${group.weekday}`} style={styles.dayGroup}>
                <Text style={styles.dayTitle}>{group.label}</Text>
                {group.links.map((link) => (
                  <TrainingLinkCard
                    key={link.id}
                    link={link}
                    canEdit={canEdit}
                    onEdit={() => {
                      setEditing(link);
                      setFormOpen(true);
                    }}
                    onDelete={() => setPendingDelete(link)}
                  />
                ))}
              </View>
            ))}
            {unscheduled.length > 0 ? (
              <View style={styles.dayGroup}>
                <Text style={styles.dayTitle}>Sin día</Text>
                {unscheduled.map((link) => (
                  <TrainingLinkCard
                    key={link.id}
                    link={link}
                    canEdit={canEdit}
                    onEdit={() => {
                      setEditing(link);
                      setFormOpen(true);
                    }}
                  />
                ))}
              </View>
            ) : null}
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
          message={`Se dejará de asignar ${pendingDelete?.programName ?? 'esta programación'} a ${pendingDelete?.classTypeName ?? 'esa modalidad'}.`}
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
    alignItems: 'center',
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
