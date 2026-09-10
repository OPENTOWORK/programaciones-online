import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useSessionTemplates } from '@/hooks/useSessionTemplates';
import type { SessionTemplate } from '@/lib/sessionTemplateService';
import {
  groupTemplatesByModalityTag,
  groupTemplatesByTag,
  SESSION_TEMPLATE_MODALITY_TAGS,
  type SessionTemplateModalityTag,
  type SessionTemplateTag,
} from '@/lib/sessionTemplateTags';
import { describeSessionTemplate } from '@/lib/sessionTemplates';

interface SessionTemplatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (templates: SessionTemplate[]) => void;
  subtitle?: string;
  confirmLabel?: string;
  saving?: boolean;
  zoneTag?: SessionTemplateTag;
  defaultModality?: SessionTemplateModalityTag | null;
}

export function SessionTemplatePickerModal({
  visible,
  onClose,
  onConfirm,
  subtitle = 'Marca una o varias plantillas para combinarlas en la sesión.',
  confirmLabel = 'Usar plantillas',
  saving = false,
  zoneTag,
  defaultModality = null,
}: SessionTemplatePickerModalProps) {
  const { templates, isLoading, refresh } = useSessionTemplates();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [modalityFilter, setModalityFilter] = useState<SessionTemplateModalityTag | null>(null);
  const metconPicker = zoneTag === 'Metcon';

  useEffect(() => {
    if (!visible) return;
    setSelectedIds(new Set());
    setModalityFilter(defaultModality);
    void refresh();
  }, [visible, refresh, defaultModality]);

  const scopedTemplates = useMemo(() => {
    return templates.filter((template) => {
      if (zoneTag && template.tag !== zoneTag) return false;
      if (metconPicker && modalityFilter && template.modalityTag !== modalityFilter) return false;
      return true;
    });
  }, [templates, zoneTag, metconPicker, modalityFilter]);

  const groups = useMemo(() => {
    return metconPicker
      ? groupTemplatesByModalityTag(scopedTemplates)
      : groupTemplatesByTag(scopedTemplates);
  }, [metconPicker, scopedTemplates]);

  const selectedTemplates = useMemo(
    () => scopedTemplates.filter((template) => selectedIds.has(template.id)),
    [scopedTemplates, selectedIds],
  );

  const toggle = (templateId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(templateId)) next.delete(templateId);
      else next.add(templateId);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(scopedTemplates.map((template) => template.id)));
  const selectNone = () => setSelectedIds(new Set());

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={saving ? undefined : onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>Elegir plantillas</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          {saving ? (
            <Text style={styles.hint}>Aplicando plantillas…</Text>
          ) : isLoading ? (
            <Text style={styles.hint}>Cargando plantillas…</Text>
          ) : scopedTemplates.length === 0 ? (
            <Text style={styles.hint}>
              {metconPicker && modalityFilter
                ? `No hay plantillas Metcon de ${modalityFilter}.`
                : 'Todavía no tienes plantillas guardadas. Créalas desde el menú de una sesión.'}
            </Text>
          ) : (
            <>
              {metconPicker ? (
                <>
                  <Text style={styles.tagLabel}>Modalidad</Text>
                  <View style={styles.tagRow}>
                    {SESSION_TEMPLATE_MODALITY_TAGS.map((option) => {
                      const selected = modalityFilter === option;
                      return (
                        <Pressable
                          key={option}
                          onPress={() => setModalityFilter(selected ? null : option)}
                          style={({ pressed }) => [
                            styles.tagChip,
                            selected && styles.tagChipSelected,
                            pressed && styles.rowPressed,
                          ]}
                        >
                          <Text style={[styles.tagChipText, selected && styles.tagChipTextSelected]}>
                            {option}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              ) : null}

              <View style={styles.selectionBar}>
                <Text style={styles.selectionCount}>
                  {selectedTemplates.length === 0
                    ? 'Ninguna seleccionada'
                    : `${selectedTemplates.length} seleccionada${selectedTemplates.length === 1 ? '' : 's'}`}
                </Text>
                <View style={styles.selectionActions}>
                  <Pressable onPress={selectAll} hitSlop={8}>
                    <Text style={styles.selectionLink}>Todas</Text>
                  </Pressable>
                  <Pressable onPress={selectNone} hitSlop={8}>
                    <Text style={styles.selectionLink}>Ninguna</Text>
                  </Pressable>
                </View>
              </View>

              <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                {groups.map((group) => (
                  <CollapsibleSection
                    key={group.label}
                    title={group.label}
                    subtitle={`${group.templates.length} plantilla${group.templates.length === 1 ? '' : 's'}`}
                    defaultExpanded={metconPicker && group.templates.some((template) => template.modalityTag === defaultModality)}
                    style={styles.groupCard}
                  >
                    <View style={styles.groupList}>
                      {group.templates.map((template) => {
                        const checked = selectedIds.has(template.id);
                        const summary = describeSessionTemplate(template.content);
                        return (
                          <Pressable
                            key={template.id}
                            onPress={() => toggle(template.id)}
                            disabled={saving}
                            style={({ pressed }) => [
                              styles.row,
                              checked && styles.rowChecked,
                              saving && styles.rowDisabled,
                              pressed && !saving && styles.rowPressed,
                            ]}
                          >
                            <Ionicons
                              name={checked ? 'checkbox' : 'square-outline'}
                              size={22}
                              color={checked ? colors.accent : colors.textMuted}
                            />
                            <View style={styles.rowCopy}>
                              <Text style={styles.rowName} numberOfLines={2}>
                                {template.formatTag ?? template.modalityTag ?? template.name}
                              </Text>
                              {template.formatTag || template.modalityTag ? (
                                <Text style={styles.rowDetails} numberOfLines={1}>
                                  {[template.modalityTag, template.tag].filter(Boolean).join(' · ') ||
                                    'Sin zona'}
                                </Text>
                              ) : null}
                              <Text style={styles.rowDetails} numberOfLines={1}>
                                {`${summary.blockCount} bloque${summary.blockCount === 1 ? '' : 's'}`}
                              </Text>
                              {summary.exerciseLines.length > 0 ? (
                                <View style={styles.exerciseList}>
                                  {summary.exerciseLines.slice(0, 8).map((line, index) => (
                                    <Text
                                      key={`${template.id}-${index}`}
                                      style={styles.exerciseLine}
                                      numberOfLines={2}
                                    >
                                      • {line}
                                    </Text>
                                  ))}
                                  {summary.exerciseLines.length > 8 ? (
                                    <Text style={styles.exerciseMore}>
                                      +{summary.exerciseLines.length - 8} más
                                    </Text>
                                  ) : null}
                                </View>
                              ) : null}
                            </View>
                          </Pressable>
                        );
                      })}
                    </View>
                  </CollapsibleSection>
                ))}
              </ScrollView>
            </>
          )}

          <View style={styles.actions}>
            <Button
              title="Cancelar"
              variant="outline"
              onPress={onClose}
              disabled={saving}
              style={styles.actionBtn}
            />
            <Button
              title={confirmLabel}
              onPress={() => onConfirm(selectedTemplates)}
              loading={saving}
              disabled={saving || selectedTemplates.length === 0}
              style={styles.actionBtn}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    maxHeight: '88%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  tagLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tagChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background,
  },
  tagChipSelected: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '18'),
  },
  tagChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tagChipTextSelected: {
    color: colors.accent,
  },
  hint: {
    ...typography.bodySmall,
    color: colors.textMuted,
    paddingVertical: spacing.md,
  },
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  selectionCount: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    flex: 1,
  },
  selectionActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  selectionLink: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  list: {
    maxHeight: 420,
  },
  groupCard: {
    marginBottom: spacing.sm,
    padding: spacing.sm,
  },
  groupList: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  rowChecked: {
    borderColor: withAlpha(colors.accent, '88'),
    backgroundColor: withAlpha(colors.accent, '12'),
  },
  rowPressed: {
    opacity: 0.9,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  rowName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  rowDetails: {
    ...typography.caption,
    color: colors.textMuted,
  },
  exerciseList: {
    marginTop: spacing.xs,
    gap: 2,
  },
  exerciseLine: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  exerciseMore: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionBtn: {
    flex: 1,
  },
});
