import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
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
import type { BroadcastGroup, BroadcastProgress } from '@/hooks/useTrainerBroadcast';
import {
  BROADCAST_NAME_TOKEN,
  broadcastTemplateUsesName,
  renderBroadcastMessage,
  type BroadcastOutcome,
  type BroadcastRecipient,
} from '@/lib/trainerBroadcast';

interface TrainerBroadcastModalProps {
  visible: boolean;
  groups: readonly BroadcastGroup[];
  loading?: boolean;
  progress?: BroadcastProgress | null;
  outcome?: BroadcastOutcome | null;
  error?: string | null;
  onClose: () => void;
  onSend: (recipients: BroadcastRecipient[], template: string) => void;
}

export function TrainerBroadcastModal({
  visible,
  groups,
  loading = false,
  progress = null,
  outcome = null,
  error = null,
  onClose,
  onSend,
}: TrainerBroadcastModalProps) {
  const [template, setTemplate] = useState('');
  const [activeStageIds, setActiveStageIds] = useState<string[]>([]);
  const [excludedIds, setExcludedIds] = useState<string[]>([]);
  const [showRecipients, setShowRecipients] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const cursorRef = useRef(0);
  /* Sin evento de selección (algunos navegadores) la etiqueta se añade al final. */
  const cursorKnownRef = useRef(false);

  const allStageIds = useMemo(() => groups.map((group) => group.stageId), [groups]);

  useEffect(() => {
    if (!visible) return;
    setTemplate(`Hola ${BROADCAST_NAME_TOKEN}, `);
    setExcludedIds([]);
    setShowRecipients(false);
    setValidationError(null);
    cursorRef.current = 0;
    cursorKnownRef.current = false;
  }, [visible]);

  /* Al abrir salen todos los estados marcados; los grupos llegan tras cargar el CRM. */
  useEffect(() => {
    if (visible) setActiveStageIds(allStageIds);
  }, [visible, allStageIds]);

  const recipients = useMemo<BroadcastRecipient[]>(() => {
    const active = new Set(activeStageIds);
    const excluded = new Set(excludedIds);

    return groups
      .filter((group) => active.has(group.stageId))
      .flatMap((group) => group.athletes)
      .filter((athlete) => !excluded.has(athlete.id))
      .map((athlete) => ({ id: athlete.id, name: athlete.name }));
  }, [groups, activeStageIds, excludedIds]);

  const visibleAthletes = useMemo(() => {
    const active = new Set(activeStageIds);
    return groups.filter((group) => active.has(group.stageId));
  }, [groups, activeStageIds]);

  const sending = progress !== null;
  const previewName = recipients[0]?.name;
  const preview = previewName ? renderBroadcastMessage(template, previewName).trim() : '';

  const toggleStage = (stageId: string) => {
    setValidationError(null);
    setActiveStageIds((current) =>
      current.includes(stageId)
        ? current.filter((id) => id !== stageId)
        : [...current, stageId],
    );
  };

  const toggleAthlete = (athleteId: string) => {
    setValidationError(null);
    setExcludedIds((current) =>
      current.includes(athleteId)
        ? current.filter((id) => id !== athleteId)
        : [...current, athleteId],
    );
  };

  const insertNameToken = () => {
    const cursor = cursorKnownRef.current
      ? Math.min(cursorRef.current, template.length)
      : template.length;
    const next = `${template.slice(0, cursor)}${BROADCAST_NAME_TOKEN}${template.slice(cursor)}`;
    cursorRef.current = cursor + BROADCAST_NAME_TOKEN.length;
    setTemplate(next);
  };

  const handleSend = () => {
    if (!template.trim()) {
      setValidationError('Escribe el mensaje que quieres enviar.');
      return;
    }
    if (recipients.length === 0) {
      setValidationError('Elige al menos un estado o un atleta.');
      return;
    }

    setValidationError(null);
    onSend(recipients, template);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {visible ? (
        <View style={styles.overlay}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
            onPress={sending ? () => {} : onClose}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.card}>
            <View style={styles.headerRow}>
              <View style={styles.headerCopy}>
                <Text style={styles.title}>Envío masivo</Text>
                <Text style={styles.subtitle}>
                  Un mismo mensaje al chat de varios atletas, personalizado con su nombre.
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                disabled={sending}
                accessibilityRole="button"
                accessibilityLabel="Cerrar"
                style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
              >
                <AppIcon name="close" size={18} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.body}
              contentContainerStyle={styles.bodyContent}
              showsVerticalScrollIndicator={false}
            >
              {loading ? (
                <ActivityIndicator color={colors.accent} style={styles.loader} />
              ) : groups.length === 0 ? (
                <Text style={styles.emptyText}>
                  No hay columnas en tu tablero CRM. Configúralas en Mis atletas.
                </Text>
              ) : (
                <>
                  <View style={styles.section}>
                    <View style={styles.sectionHead}>
                      <Text style={styles.sectionLabel}>Enviar a</Text>
                      <View style={styles.quickActions}>
                        <Pressable
                          onPress={() => setActiveStageIds(allStageIds)}
                          accessibilityRole="button"
                          style={({ pressed }) => [styles.linkBtn, pressed && styles.pressed]}
                        >
                          <Text style={styles.linkText}>Todos</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => setActiveStageIds([])}
                          accessibilityRole="button"
                          style={({ pressed }) => [styles.linkBtn, pressed && styles.pressed]}
                        >
                          <Text style={styles.linkText}>Ninguno</Text>
                        </Pressable>
                      </View>
                    </View>

                    <View style={styles.chipRow}>
                      {groups.map((group) => {
                        const active = activeStageIds.includes(group.stageId);
                        const empty = group.athletes.length === 0;
                        return (
                          <Pressable
                            key={group.stageId}
                            onPress={() => toggleStage(group.stageId)}
                            disabled={sending}
                            accessibilityRole="button"
                            accessibilityLabel={`${group.stageName}, ${group.athletes.length} atletas`}
                            style={({ pressed }) => [
                              styles.chip,
                              empty && !active && styles.chipEmpty,
                              active && styles.chipActive,
                              pressed && styles.pressed,
                            ]}
                          >
                            <Text style={[styles.chipText, active && styles.chipTextActive]}>
                              {group.stageName}
                            </Text>
                            <View style={[styles.chipCount, active && styles.chipCountActive]}>
                              <Text
                                style={[styles.chipCountText, active && styles.chipCountTextActive]}
                              >
                                {group.athletes.length}
                              </Text>
                            </View>
                          </Pressable>
                        );
                      })}
                    </View>

                    <Pressable
                      onPress={() => setShowRecipients((current) => !current)}
                      accessibilityRole="button"
                      style={({ pressed }) => [styles.recipientsToggle, pressed && styles.pressed]}
                    >
                      <Text style={styles.recipientsCount}>
                        {recipients.length === 1
                          ? '1 atleta seleccionado'
                          : `${recipients.length} atletas seleccionados`}
                      </Text>
                      <Text style={styles.linkText}>
                        {showRecipients ? 'Ocultar lista' : 'Ver y ajustar'}
                      </Text>
                    </Pressable>

                    {showRecipients ? (
                      <View style={styles.recipientList}>
                        {visibleAthletes.length === 0 ? (
                          <Text style={styles.emptyText}>
                            Marca algún estado para ver a sus atletas.
                          </Text>
                        ) : (
                          visibleAthletes
                            .filter((group) => group.athletes.length > 0)
                            .map((group) => (
                            <View key={group.stageId} style={styles.recipientGroup}>
                              <Text style={styles.recipientGroupLabel}>{group.stageName}</Text>
                              {group.athletes.map((athlete) => {
                                const included = !excludedIds.includes(athlete.id);
                                return (
                                  <Pressable
                                    key={athlete.id}
                                    onPress={() => toggleAthlete(athlete.id)}
                                    disabled={sending}
                                    accessibilityRole="checkbox"
                                    accessibilityState={{ checked: included }}
                                    accessibilityLabel={athlete.name}
                                    style={({ pressed }) => [
                                      styles.recipientRow,
                                      pressed && styles.pressed,
                                    ]}
                                  >
                                    <View
                                      style={[styles.checkbox, included && styles.checkboxOn]}
                                    >
                                      {included ? (
                                        <AppIcon name="check" size={13} color={colors.white} />
                                      ) : null}
                                    </View>
                                    <Text
                                      style={[
                                        styles.recipientName,
                                        !included && styles.recipientNameOff,
                                      ]}
                                      numberOfLines={1}
                                    >
                                      {athlete.name}
                                    </Text>
                                  </Pressable>
                                );
                              })}
                            </View>
                          ))
                        )}
                        {visibleAthletes.length > 0 &&
                        visibleAthletes.every((group) => group.athletes.length === 0) ? (
                          <Text style={styles.emptyText}>
                            Los estados seleccionados no tienen atletas.
                          </Text>
                        ) : null}
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.section}>
                    <View style={styles.sectionHead}>
                      <Text style={styles.sectionLabel}>Mensaje</Text>
                      <Pressable
                        onPress={insertNameToken}
                        disabled={sending}
                        accessibilityRole="button"
                        accessibilityLabel={`Insertar ${BROADCAST_NAME_TOKEN}`}
                        style={({ pressed }) => [styles.tokenBtn, pressed && styles.pressed]}
                      >
                        <AppIcon name="add" size={14} color={colors.accent} />
                        <Text style={styles.tokenBtnText}>{BROADCAST_NAME_TOKEN}</Text>
                      </Pressable>
                    </View>

                    <TextInput
                      value={template}
                      onChangeText={(value) => {
                        setValidationError(null);
                        setTemplate(value);
                      }}
                      onSelectionChange={(event) => {
                        cursorRef.current = event.nativeEvent.selection.start;
                        cursorKnownRef.current = true;
                      }}
                      editable={!sending}
                      multiline
                      numberOfLines={6}
                      placeholder={`Hola ${BROADCAST_NAME_TOKEN}, esta semana subimos la carga en las dominadas.`}
                      placeholderTextColor={colors.textMuted}
                      style={styles.textArea}
                    />

                    <Text style={styles.hint}>
                      {BROADCAST_NAME_TOKEN} se sustituye por el nombre de cada atleta.
                    </Text>

                    {template.trim() && !broadcastTemplateUsesName(template) ? (
                      <Text style={styles.warning}>
                        Este mensaje no lleva {BROADCAST_NAME_TOKEN}: todos lo recibirán igual.
                      </Text>
                    ) : null}
                  </View>

                  {preview ? (
                    <View style={styles.previewBox}>
                      <Text style={styles.previewLabel}>Así lo recibirá {previewName}</Text>
                      <Text style={styles.previewText}>{preview}</Text>
                    </View>
                  ) : null}
                </>
              )}

              {error ? <Text style={styles.error}>{error}</Text> : null}
              {validationError ? <Text style={styles.error}>{validationError}</Text> : null}

              {progress ? (
                <Text style={styles.progressText}>
                  Enviando… {progress.done} de {progress.total}
                </Text>
              ) : null}

              {outcome ? (
                <Text style={outcome.failed.length > 0 ? styles.warning : styles.success}>
                  {outcome.failed.length > 0
                    ? `Enviado a ${outcome.sent}. No se pudo enviar a: ${outcome.failed
                        .map((recipient) => recipient.name)
                        .join(', ')}.`
                    : `Mensaje enviado a ${outcome.sent} ${outcome.sent === 1 ? 'atleta' : 'atletas'}.`}
                </Text>
              ) : null}
            </ScrollView>

            <View style={styles.actions}>
              <Button
                title="Cancelar"
                variant="secondary"
                onPress={onClose}
                disabled={sending}
                style={styles.actionBtn}
              />
              <Button
                title={
                  recipients.length > 0
                    ? `Enviar a ${recipients.length}`
                    : 'Enviar'
                }
                onPress={handleSend}
                loading={sending}
                disabled={loading || groups.length === 0}
                style={styles.actionBtn}
              />
            </View>
          </View>
        </View>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    zIndex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 20,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    marginTop: spacing.md,
  },
  bodyContent: {
    gap: spacing.md,
    paddingBottom: spacing.xs,
  },
  loader: {
    marginVertical: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  linkBtn: {
    paddingVertical: 2,
  },
  linkText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipEmpty: {
    opacity: 0.72,
  },
  chipActive: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '16'),
  },
  chipText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.text,
  },
  chipCount: {
    minWidth: 20,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 999,
    alignItems: 'center',
    backgroundColor: withAlpha(colors.textMuted, '22'),
  },
  chipCountActive: {
    backgroundColor: colors.accent,
  },
  chipCountText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 11,
  },
  chipCountTextActive: {
    color: colors.white,
  },
  recipientsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  recipientsCount: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  recipientList: {
    maxHeight: 220,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  recipientGroup: {
    gap: 2,
  },
  recipientGroupLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  recipientName: {
    ...typography.bodySmall,
    color: colors.text,
    flex: 1,
  },
  recipientNameOff: {
    color: colors.textMuted,
  },
  tokenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: withAlpha(colors.accent, '55'),
    backgroundColor: withAlpha(colors.accent, '12'),
  },
  tokenBtnText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  textArea: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    ...typography.bodySmall,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  hint: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  previewBox: {
    gap: 4,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: withAlpha(colors.accentBlue, '12'),
    borderWidth: 1,
    borderColor: withAlpha(colors.accentBlue, '33'),
  },
  previewLabel: {
    ...typography.caption,
    color: colors.accentBlue,
    fontWeight: '700',
  },
  previewText: {
    ...typography.bodySmall,
    color: colors.text,
    lineHeight: 20,
  },
  progressText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  success: {
    ...typography.bodySmall,
    color: colors.success,
    fontWeight: '600',
    lineHeight: 20,
  },
  warning: {
    ...typography.caption,
    color: colors.warning,
    lineHeight: 18,
  },
  error: {
    ...typography.bodySmall,
    color: colors.danger,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionBtn: {
    flex: 1,
    marginTop: 0,
    minHeight: 44,
  },
  pressed: {
    opacity: 0.85,
  },
});
