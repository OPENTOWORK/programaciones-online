import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { TrainerExerciseNoteModal } from '@/components/trainer/TrainerExerciseNotes';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { isTrainerRole } from '@/lib/athleteService';
import { normalizeExerciseName } from '@/lib/exerciseName';
import {
  countPlanGroupExerciseNotes,
  listPlanGroupExerciseNoteSections,
  sessionLogIdsForPlanGroup,
  type PlanGroupExerciseNotesSection,
} from '@/lib/planGroupExerciseNotes';
import type { SessionLogRecord } from '@/lib/sessionLogService';
import { fetchSessionVideos } from '@/lib/sessionVideoService';
import type { PersonalizedPlanGroup } from '@/lib/personalizedPlanGroups';
import {
  TRAINER_EXERCISE_EXECUTION_LABELS,
  deleteTrainerExerciseNote,
  fetchAthleteExerciseNotes,
  formatTrainerExerciseNoteAge,
  formatTrainerExerciseNoteDate,
  saveTrainerExerciseNote,
  summarizeTrainerExerciseNote,
  type TrainerExerciseExecution,
  type TrainerExerciseNote,
  type TrainerExerciseNoteDraft,
} from '@/lib/trainerExerciseNoteService';

function executionColor(execution: TrainerExerciseExecution) {
  if (execution === 'correct') return colors.success;
  if (execution === 'partial') return colors.warning;
  return colors.danger;
}

function NoteRow({
  note,
  onOpenLog,
  onEdit,
  onDelete,
}: {
  note: TrainerExerciseNote;
  onOpenLog?: (logId: string) => void;
  onEdit: (note: TrainerExerciseNote) => void;
  onDelete: (note: TrainerExerciseNote) => void;
}) {
  const summary = summarizeTrainerExerciseNote(note);
  const setLabel = note.setNumber ? `Serie ${note.setNumber}` : 'General';
  const age = formatTrainerExerciseNoteAge(note.performedOn);
  const date = formatTrainerExerciseNoteDate(note.performedOn);
  const canOpenLog = Boolean(note.sessionLogId && onOpenLog);

  return (
    <View style={styles.noteRow}>
      <Pressable
        onPress={canOpenLog ? () => onOpenLog!(note.sessionLogId!) : undefined}
        disabled={!canOpenLog}
        style={({ pressed }) => [
          styles.noteRowMain,
          canOpenLog && styles.noteRowLink,
          pressed && canOpenLog ? styles.pressed : null,
        ]}
      >
        <View style={styles.noteRowHeader}>
          <View style={styles.ageBadge}>
            <Text style={styles.ageBadgeText}>{age}</Text>
          </View>
          <Text style={styles.noteDate}>{date}</Text>
          {note.execution ? (
            <View style={[styles.execDot, { backgroundColor: executionColor(note.execution) }]} />
          ) : null}
        </View>
        <Text style={styles.noteSummary}>
          {setLabel}
          {summary ? ` · ${summary}` : ''}
        </Text>
        {note.execution ? (
          <Text style={styles.noteMeta}>{TRAINER_EXERCISE_EXECUTION_LABELS[note.execution]}</Text>
        ) : null}
        {note.technique?.trim() ? (
          <Text style={styles.noteDetail} numberOfLines={4}>
            Técnica: {note.technique}
          </Text>
        ) : null}
        {note.notes?.trim() ? (
          <Text style={styles.noteDetail} numberOfLines={4}>
            {note.notes}
          </Text>
        ) : null}
        {canOpenLog ? <Text style={styles.noteLinkHint}>Ver registro de sesión ›</Text> : null}
      </Pressable>
      <View style={styles.noteRowActions}>
        <Pressable
          onPress={() => onEdit(note)}
          accessibilityLabel="Editar apunte"
          hitSlop={6}
          style={({ pressed }) => [styles.noteActionBtn, pressed && styles.pressed]}
        >
          <Ionicons name="create-outline" size={18} color={colors.textSecondary} />
        </Pressable>
        <Pressable
          onPress={() => onDelete(note)}
          accessibilityLabel="Eliminar apunte"
          hitSlop={6}
          style={({ pressed }) => [styles.noteActionBtn, pressed && styles.pressed]}
        >
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </Pressable>
      </View>
    </View>
  );
}

function ExerciseSection({
  section,
  defaultExpanded,
  onOpenLog,
  onEditNote,
  onDeleteNote,
}: {
  section: PlanGroupExerciseNotesSection;
  defaultExpanded: boolean;
  onOpenLog?: (logId: string) => void;
  onEditNote: (note: TrainerExerciseNote) => void;
  onDeleteNote: (note: TrainerExerciseNote) => void;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const sessionHint = section.sessionLabels.join(' · ');

  return (
    <View style={styles.exerciseSection}>
      <Pressable
        onPress={() => setExpanded((current) => !current)}
        style={({ pressed }) => [styles.exerciseHeader, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <View style={styles.exerciseHeaderMain}>
          <Text style={styles.exerciseTitle}>{section.exerciseName}</Text>
          <Text style={styles.exerciseMeta} numberOfLines={1}>
            {sessionHint}
          </Text>
        </View>
        <View style={styles.exerciseHeaderAside}>
          {section.notes.length > 0 ? (
            <View style={styles.noteCountBadge}>
              <Text style={styles.noteCountBadgeText}>{section.notes.length}</Text>
            </View>
          ) : (
            <Text style={styles.exerciseEmptyHint}>Sin apuntes</Text>
          )}
          <AppIcon
            name={expanded ? 'chevronDown' : 'chevronRight'}
            size={14}
            color={colors.textSecondary}
          />
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.exerciseBody}>
          {section.notes.length === 0 ? (
            <Text style={styles.exerciseBodyEmpty}>
              Aún no hay apuntes de este ejercicio. Escríbelos desde el plan o desde el registro de
              entreno del atleta.
            </Text>
          ) : (
            section.notes.map((note) => (
              <NoteRow
                key={note.id}
                note={note}
                onOpenLog={onOpenLog}
                onEdit={onEditNote}
                onDelete={onDeleteNote}
              />
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}

interface PlanGroupPrivateNotesModalProps {
  visible: boolean;
  group: PersonalizedPlanGroup;
  athleteId: string;
  athleteName?: string;
  sessionLogs?: SessionLogRecord[];
  onClose: () => void;
  onNotesChanged?: () => void;
}

export function PlanGroupPrivateNotesModal({
  visible,
  group,
  athleteId,
  athleteName,
  sessionLogs = [],
  onClose,
  onNotesChanged,
}: PlanGroupPrivateNotesModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const trainerId = isTrainerRole(user?.role) ? user?.id : undefined;

  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<PlanGroupExerciseNotesSection[]>([]);
  const [editingNote, setEditingNote] = useState<TrainerExerciseNote | null>(null);
  const [pendingDeleteNote, setPendingDeleteNote] = useState<TrainerExerciseNote | null>(null);
  const [saving, setSaving] = useState(false);
  const [noteActionError, setNoteActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!trainerId || !athleteId) {
      setSections([]);
      return;
    }

    setLoading(true);
    const notes = await fetchAthleteExerciseNotes({ trainerId, athleteId });
    const sessionLogIds = sessionLogIdsForPlanGroup(group, sessionLogs);
    const sessionVideoExerciseNames = new Map<string, string>();
    const sessionVideoExerciseKeys = new Map<string, string>();

    await Promise.all(
      [...sessionLogIds].map(async (logId) => {
        const videos = await fetchSessionVideos(logId);
        for (const video of videos) {
          const exerciseName = video.exerciseName?.trim();
          if (exerciseName) sessionVideoExerciseNames.set(video.id, exerciseName);

          const rawKey = video.exerciseKey?.trim();
          if (rawKey) {
            sessionVideoExerciseKeys.set(video.id, normalizeExerciseName(rawKey) || rawKey);
          } else if (exerciseName) {
            const derived = normalizeExerciseName(exerciseName);
            if (derived) sessionVideoExerciseKeys.set(video.id, derived);
          }
        }
      }),
    );

    const scope = { sessionLogIds, sessionVideoExerciseNames, sessionVideoExerciseKeys };
    setSections(listPlanGroupExerciseNoteSections(group, notes, scope));
    setLoading(false);
  }, [athleteId, group, sessionLogs, trainerId]);

  useEffect(() => {
    if (visible) void load();
  }, [load, visible]);

  const totalNotes = useMemo(() => countPlanGroupExerciseNotes(sections), [sections]);
  const exerciseCount = sections.length;

  const openFirstSession = () => {
    const first = group.sessions[0];
    if (!first) return;
    onClose();
    router.push({ pathname: '/trainer/plan/[id]', params: { id: first.id } });
  };

  const openSessionLog = useCallback(
    (logId: string) => {
      onClose();
      router.push({
        pathname: '/trainer/athlete/[id]/log/[logId]',
        params: { id: athleteId, logId },
      });
    },
    [athleteId, onClose, router],
  );

  const handleSaveNote = async (draft: TrainerExerciseNoteDraft, noteId?: string) => {
    if (!trainerId || !editingNote) return;
    setSaving(true);
    setNoteActionError(null);

    const result = await saveTrainerExerciseNote({
      noteId,
      trainerId,
      athleteId: editingNote.athleteId,
      sessionLogId: editingNote.sessionLogId,
      sessionVideoId: editingNote.sessionVideoId,
      athletePlanId: editingNote.athletePlanId,
      exerciseKey: editingNote.exerciseKey,
      exerciseName: editingNote.exerciseName,
      performedOn: editingNote.performedOn,
      draft: { ...draft, setNumber: draft.setNumber ?? editingNote.setNumber },
    });

    setSaving(false);

    if (result.error) {
      setNoteActionError(result.error);
      return;
    }

    setEditingNote(null);
    await load();
    onNotesChanged?.();
  };

  const confirmDeleteNote = async () => {
    const note = pendingDeleteNote;
    if (!note) return;

    setSaving(true);
    setNoteActionError(null);
    const result = await deleteTrainerExerciseNote(note.id);
    setSaving(false);
    setPendingDeleteNote(null);

    if (result.error) {
      setNoteActionError(result.error);
      return;
    }

    await load();
    onNotesChanged?.();
  };

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Cerrar apuntes" />
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <View style={styles.headerBadge}>
                <AppIcon name="edit" size={20} color={colors.accentBlue} />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.title}>Apuntes privados</Text>
                <Text style={styles.subtitle} numberOfLines={2}>
                  {group.title}
                  {athleteName ? ` · ${athleteName}` : ''}
                </Text>
                <Text style={styles.privacy}>
                  Solo tú · apuntes de este plan y de sus registros de sesión
                </Text>
              </View>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
            >
              <AppIcon name="close" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Text style={styles.statValue}>{totalNotes}</Text>
              <Text style={styles.statLabel}>apuntes</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statValue}>{exerciseCount}</Text>
              <Text style={styles.statLabel}>ejercicios con apunte</Text>
            </View>
          </View>

          {noteActionError ? <Text style={styles.actionError}>{noteActionError}</Text> : null}

          {loading ? (
            <ActivityIndicator color={colors.accent} style={styles.loader} />
          ) : (
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={Platform.OS === 'web'}
            >
              {sections.length === 0 ? (
                <Text style={styles.empty}>
                  No hay apuntes en este plan. Puedes añadirlos con «Apunte privado» al abrir una sesión del
                  plan o al revisar un registro de entreno de este atleta.
                </Text>
              ) : (
                sections.map((section) => (
                  <ExerciseSection
                    key={section.exerciseKey}
                    section={section}
                    defaultExpanded
                    onOpenLog={openSessionLog}
                    onEditNote={(note) => {
                      setNoteActionError(null);
                      setEditingNote(note);
                    }}
                    onDeleteNote={setPendingDeleteNote}
                  />
                ))
              )}
            </ScrollView>
          )}

          <View style={styles.footer}>
            <Button title="Cerrar" variant="secondary" onPress={onClose} style={styles.footerBtn} />
            {group.sessions[0] ? (
              <Button title="Abrir plan" onPress={openFirstSession} style={styles.footerBtn} />
            ) : null}
          </View>
        </View>
      </View>

      {editingNote ? (
        <TrainerExerciseNoteModal
          visible
          onClose={() => {
            if (saving) return;
            setEditingNote(null);
          }}
          exerciseName={editingNote.exerciseName}
          notes={[editingNote]}
          history={[]}
          isSaving={saving}
          nextSetNumber={editingNote.setNumber ?? 1}
          error={noteActionError}
          onSave={(draft, noteId) => void handleSaveNote(draft, noteId)}
          onRemove={(note) => {
            setEditingNote(null);
            setPendingDeleteNote(note);
          }}
          onRequestHistory={() => undefined}
          initialNote={editingNote}
        />
      ) : null}

      <ConfirmModal
        visible={pendingDeleteNote !== null}
        title="Eliminar apunte"
        message="Se borrará este apunte privado. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        destructive
        onCancel={() => {
          if (saving) return;
          setPendingDeleteNote(null);
        }}
        onConfirm={() => void confirmDeleteNote()}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    ...(Platform.OS === 'web' ? ({ cursor: 'default' } as object) : null),
  },
  card: {
    width: '100%',
    maxWidth: 640,
    maxHeight: '92%',
    flexDirection: 'column',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    zIndex: 1,
    ...(Platform.OS === 'web' ? ({ boxShadow: '0 24px 48px rgba(0,0,0,0.28)' } as object) : null),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerCopy: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minWidth: 0,
  },
  headerBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(colors.accentBlue, '18'),
    borderWidth: 1,
    borderColor: withAlpha(colors.accentBlue, '33'),
  },
  headerText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  privacy: {
    ...typography.caption,
    color: colors.textMuted,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surfaceLight,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  statValue: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '800',
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  loader: {
    marginVertical: spacing.xl,
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  empty: {
    ...typography.bodySmall,
    color: colors.textMuted,
    lineHeight: 22,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  exerciseSection: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: withAlpha(colors.surfaceLight, 'AA'),
  },
  exerciseHeaderMain: {
    flex: 1,
    minWidth: 0,
  },
  exerciseTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '800',
  },
  exerciseMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  exerciseHeaderAside: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 0,
  },
  noteCountBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  noteCountBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '800',
    fontSize: 11,
  },
  exerciseEmptyHint: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  exerciseBody: {
    padding: spacing.sm,
    gap: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  exerciseBodyEmpty: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  noteRowMain: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  noteRowLink: {
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  noteRowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
    paddingTop: 2,
  },
  noteActionBtn: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  actionError: {
    ...typography.caption,
    color: colors.danger,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  noteRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  ageBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: withAlpha(colors.accent, '1F'),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: withAlpha(colors.accent, '44'),
  },
  ageBadgeText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '800',
    fontSize: 10,
  },
  noteDate: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  execDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  noteSummary: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  noteMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  noteDetail: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  noteLinkHint: {
    ...typography.caption,
    color: colors.accentBlue,
    fontWeight: '700',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surfaceLight,
  },
  footerBtn: {
    flex: 1,
  },
  pressed: {
    opacity: 0.85,
  },
});
