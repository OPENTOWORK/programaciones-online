import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type View as RNView } from 'react-native';

import { DraggableTemplateRow } from '@/components/trainer/DraggableTemplateRow';
import { Card } from '@/components/ui/Card';
import { colors, spacing, typography, withAlpha } from '@/constants/theme';
import {
  resolveTemplateDropTarget,
  templateGroupKey,
  type TemplateGroupViewMode,
} from '@/lib/sessionTemplateDrag';
import type { SessionTemplate } from '@/lib/sessionTemplateService';

export interface SessionTemplateGroup {
  label: string;
  templates: SessionTemplate[];
}

interface GroupBounds {
  label: string;
  y: number;
  height: number;
}

interface SessionTemplateGroupListProps {
  groups: SessionTemplateGroup[];
  groupMode: TemplateGroupViewMode;
  onMoveTemplate: (template: SessionTemplate, targetLabel: string) => void;
  onEdit: (templateId: string) => void;
  onOptions: (template: SessionTemplate) => void;
}

export function SessionTemplateGroupList({
  groups,
  groupMode,
  onMoveTemplate,
  onEdit,
  onOptions,
}: SessionTemplateGroupListProps) {
  const groupRefs = useRef(new Map<string, RNView | null>());
  const groupBoundsRef = useRef<GroupBounds[]>([]);
  const pendingMeasuresRef = useRef(0);

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set());
  const [draggingTemplateId, setDraggingTemplateId] = useState<string | null>(null);
  const [dropTargetLabel, setDropTargetLabel] = useState<string | null>(null);

  const draggingTemplate = useMemo(
    () => groups.flatMap((group) => group.templates).find((template) => template.id === draggingTemplateId),
    [draggingTemplateId, groups],
  );

  const measureGroupBounds = useCallback(() => {
    const entries = groups.map((group) => group.label);
    if (entries.length === 0) {
      groupBoundsRef.current = [];
      return;
    }

    pendingMeasuresRef.current = entries.length;
    const nextBounds: GroupBounds[] = [];

    entries.forEach((label) => {
      const node = groupRefs.current.get(label);
      if (!node) {
        pendingMeasuresRef.current -= 1;
        return;
      }

      node.measureInWindow((_x, y, _width, height) => {
        nextBounds.push({ label, y, height });
        pendingMeasuresRef.current -= 1;
        if (pendingMeasuresRef.current <= 0) {
          groupBoundsRef.current = nextBounds.sort((left, right) => left.y - right.y);
        }
      });
    });
  }, [groups]);

  const findGroupAt = useCallback((pageY: number) => {
    return (
      groupBoundsRef.current.find((bounds) => pageY >= bounds.y && pageY <= bounds.y + bounds.height)?.label ??
      null
    );
  }, []);

  const handleDragStart = useCallback(
    (templateId: string) => {
      measureGroupBounds();
      setDraggingTemplateId(templateId);
      setDropTargetLabel(null);
    },
    [measureGroupBounds],
  );

  const handleDragMove = useCallback(
    (_templateId: string, _pageX: number, pageY: number) => {
      const nextLabel = findGroupAt(pageY);
      setDropTargetLabel((current) => (current === nextLabel ? current : nextLabel));
      if (nextLabel) {
        setExpandedGroups((current) => {
          if (current.has(nextLabel)) return current;
          const next = new Set(current);
          next.add(nextLabel);
          return next;
        });
      }
    },
    [findGroupAt],
  );

  const handleDragEnd = useCallback(
    (templateId: string, _pageX: number, pageY: number) => {
      const template = groups.flatMap((group) => group.templates).find((entry) => entry.id === templateId);
      const targetLabel = findGroupAt(pageY);

      setDraggingTemplateId(null);
      setDropTargetLabel(null);

      if (!template || !targetLabel) return;

      const sourceLabel = templateGroupKey(template, groupMode);
      if (sourceLabel === targetLabel) return;
      if (!resolveTemplateDropTarget(groupMode, targetLabel)) return;

      onMoveTemplate(template, targetLabel);
    },
    [findGroupAt, groupMode, groups, onMoveTemplate],
  );

  const toggleGroup = useCallback((label: string) => {
    setExpandedGroups((current) => {
      const next = new Set(current);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!draggingTemplateId) return;
    const frame = requestAnimationFrame(() => {
      measureGroupBounds();
    });
    return () => cancelAnimationFrame(frame);
  }, [draggingTemplateId, expandedGroups, measureGroupBounds]);

  return (
    <View style={styles.list}>
      {draggingTemplateId ? (
        <Text style={styles.dragHint}>
          Arrastra la plantilla a otro grupo
          {groupMode === 'format'
            ? ' de formato'
            : groupMode === 'modality'
              ? ' de modalidad'
              : ' de zona'}{' '}
          y suéltala.
        </Text>
      ) : null}

      {groups.map((group) => {
        const expanded = expandedGroups.has(group.label);
        const isDropTarget = dropTargetLabel === group.label && draggingTemplateId !== null;
        const isDragSource =
          draggingTemplate?.id != null &&
          group.templates.some((template) => template.id === draggingTemplate.id);

        return (
          <View
            key={group.label}
            ref={(node) => {
              groupRefs.current.set(group.label, node);
            }}
            collapsable={false}
            style={styles.groupWrap}
          >
            <Card
              style={[
                styles.groupCard,
                isDropTarget && styles.groupCardDropTarget,
                isDragSource && styles.groupCardDragSource,
              ]}
            >
            <Pressable
              onPress={() => toggleGroup(group.label)}
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              style={({ pressed }) => [styles.groupHeader, pressed && styles.pressed]}
            >
              <View style={styles.groupHeaderCopy}>
                <Text style={styles.groupTitle}>{group.label}</Text>
                <Text style={[styles.groupSubtitle, isDropTarget && styles.groupSubtitleDropTarget]}>
                  {isDropTarget
                    ? 'Suelta aquí para mover la plantilla'
                    : `${group.templates.length} plantilla${group.templates.length === 1 ? '' : 's'}`}
                </Text>
              </View>
              <Ionicons
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={isDropTarget ? colors.accent : colors.textSecondary}
              />
            </Pressable>

            {expanded ? (
              <View style={styles.groupList}>
                {group.templates.length === 0 ? (
                  <Text style={[styles.emptyGroup, isDropTarget && styles.emptyGroupDropTarget]}>
                    {isDropTarget ? 'Suelta aquí' : 'Sin plantillas en este grupo'}
                  </Text>
                ) : (
                  group.templates.map((template) => (
                    <DraggableTemplateRow
                      key={template.id}
                      template={template}
                      onEdit={() => onEdit(template.id)}
                      onOptions={() => onOptions(template)}
                      onDragStart={handleDragStart}
                      onDragMove={handleDragMove}
                      onDragEnd={handleDragEnd}
                    />
                  ))
                )}
              </View>
            ) : isDropTarget ? (
              <View style={styles.collapsedDropHint}>
                <Text style={styles.collapsedDropHintText}>Suelta aquí</Text>
              </View>
            ) : null}
            </Card>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  groupWrap: {
    overflow: 'visible',
  },
  dragHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  groupCard: {
    marginBottom: 0,
    overflow: 'visible',
  },
  groupCardDropTarget: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '10'),
  },
  groupCardDragSource: {
    overflow: 'visible',
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  groupHeaderCopy: {
    flex: 1,
    minWidth: 0,
  },
  groupTitle: {
    ...typography.h3,
    color: colors.text,
  },
  groupSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  groupSubtitleDropTarget: {
    color: colors.accent,
    fontWeight: '600',
  },
  groupList: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  emptyGroup: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  emptyGroupDropTarget: {
    color: colors.accent,
    fontWeight: '600',
  },
  collapsedDropHint: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: withAlpha(colors.accent, '44'),
    borderStyle: 'dashed',
  },
  collapsedDropHintText: {
    ...typography.caption,
    color: colors.accent,
    textAlign: 'center',
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
