import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SessionTemplateGroupList } from '@/components/trainer/SessionTemplateGroupList';
import { ActionSheetModal } from '@/components/ui/ActionSheetModal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { useSessionTemplates } from '@/hooks/useSessionTemplates';
import { safeGoBack } from '@/lib/navigation';
import { resolveTemplateDropTarget } from '@/lib/sessionTemplateDrag';
import type { SessionTemplate } from '@/lib/sessionTemplateService';
import {
  groupTemplatesByFormatTag,
  groupTemplatesByTag,
  SESSION_TEMPLATE_FORMAT_TAGS,
  SESSION_TEMPLATE_ZONE_TAGS,
  type SessionTemplateFormatTag,
  type SessionTemplateTag,
} from '@/lib/sessionTemplateTags';

function confirmDelete(name: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`¿Eliminar la plantilla "${name}"?`)) onConfirm();
    return;
  }
  Alert.alert('Eliminar plantilla', `Se eliminará "${name}".`, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Eliminar', style: 'destructive', onPress: onConfirm },
  ]);
}

type GroupViewMode = 'zone' | 'format';

function GroupModeToggle({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`Agrupar por ${label.toLowerCase()}`}
      style={({ pressed }) => [styles.modeToggle, pressed && styles.pressed]}
    >
      <View style={[styles.modeRadio, active && styles.modeRadioActive]}>
        {active ? <View style={styles.modeRadioDot} /> : null}
      </View>
      <Text style={[styles.tagLabel, active && styles.tagLabelActive]}>{label}</Text>
    </Pressable>
  );
}

export default function TrainerSessionTemplatesScreen() {
  const router = useRouter();
  const { templates, isLoading, saving, persistent, error, isTrainer, remove, update } =
    useSessionTemplates();
  const [optionsFor, setOptionsFor] = useState<SessionTemplate | null>(null);
  const [groupMode, setGroupMode] = useState<GroupViewMode>('zone');
  const [zoneFilter, setZoneFilter] = useState<SessionTemplateTag | null>(null);
  const [formatFilter, setFormatFilter] = useState<SessionTemplateFormatTag | null>(null);

  const selectGroupMode = (mode: GroupViewMode) => {
    setGroupMode(mode);
    if (mode === 'zone') {
      setFormatFilter(null);
      return;
    }
    setZoneFilter(null);
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      if (groupMode === 'zone') {
        if (zoneFilter && template.tag !== zoneFilter) return false;
        return true;
      }
      if (formatFilter && template.formatTag !== formatFilter) return false;
      return true;
    });
  }, [templates, groupMode, zoneFilter, formatFilter]);

  const groups = useMemo(() => {
    return groupMode === 'zone'
      ? groupTemplatesByTag(filteredTemplates)
      : groupTemplatesByFormatTag(filteredTemplates);
  }, [filteredTemplates, groupMode]);

  const handleMoveTemplate = useCallback(
    (template: SessionTemplate, targetLabel: string) => {
      const changes = resolveTemplateDropTarget(groupMode, targetLabel);
      if (!changes) return;
      void update(template, changes);
    },
    [groupMode, update],
  );

  if (!isTrainer) {
    return (
      <ScreenWrapper>
        <Text style={styles.empty}>Solo el entrenador puede gestionar plantillas.</Text>
      </ScreenWrapper>
    );
  }

  const openEditor = (templateId = 'new') => {
    router.push(`/trainer/template/${templateId}`);
  };

  const handleDelete = (template: SessionTemplate) => {
    setOptionsFor(null);
    confirmDelete(template.name, () => {
      void remove(template);
    });
  };

  return (
    <ScreenWrapper>
      <SectionHeader
        title="Plantillas"
        subtitle="Agrupa por zona o formato y arrastra una plantilla a otro grupo para reclasificarla."
      />

      {!persistent ? (
        <Text style={styles.warning}>
          Las plantillas se guardan solo en este dispositivo. Ejecuta npm run
          supabase:session-templates-tags para guardarlas en Supabase.
        </Text>
      ) : null}

      <Button
        title="Crear plantilla nueva"
        onPress={() => openEditor()}
        loading={saving}
        style={styles.createButton}
      />

      {templates.length > 0 ? (
        <Card style={styles.filterCard}>
          <GroupModeToggle
            label="Zona"
            active={groupMode === 'zone'}
            onPress={() => selectGroupMode('zone')}
          />
          <View style={styles.tagRow}>
            {SESSION_TEMPLATE_ZONE_TAGS.map((option) => {
              const selected = groupMode === 'zone' && zoneFilter === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => {
                    if (groupMode !== 'zone') {
                      selectGroupMode('zone');
                      setZoneFilter(option);
                      return;
                    }
                    setZoneFilter(selected ? null : option);
                  }}
                  style={({ pressed }) => [
                    styles.tagChip,
                    selected && styles.tagChipSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.tagChipText, selected && styles.tagChipTextSelected]}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <GroupModeToggle
            label="Formato"
            active={groupMode === 'format'}
            onPress={() => selectGroupMode('format')}
          />
          <View style={styles.tagRow}>
            {SESSION_TEMPLATE_FORMAT_TAGS.map((option) => {
              const selected = groupMode === 'format' && formatFilter === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => {
                    if (groupMode !== 'format') {
                      selectGroupMode('format');
                      setFormatFilter(option);
                      return;
                    }
                    setFormatFilter(selected ? null : option);
                  }}
                  style={({ pressed }) => [
                    styles.tagChip,
                    selected && styles.tagChipSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.tagChipText, selected && styles.tagChipTextSelected]}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>
      ) : null}

      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : templates.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Sin plantillas todavía</Text>
          <Text style={styles.emptyText}>
            Crea plantillas desde el menú de una sesión y asígnales una etiqueta (All, Tren inferior,
            Tren superior, Core, Metcon o Descanso).
          </Text>
        </Card>
      ) : filteredTemplates.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Sin resultados</Text>
          <Text style={styles.emptyText}>
            No hay plantillas con ese filtro. Quita la etiqueta activa tocándola otra vez.
          </Text>
        </Card>
      ) : (
        <SessionTemplateGroupList
          groups={groups}
          groupMode={groupMode}
          onMoveTemplate={handleMoveTemplate}
          onEdit={openEditor}
          onOptions={setOptionsFor}
        />
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        title="Volver"
        variant="secondary"
        onPress={() => safeGoBack(router, '/tabs/programs')}
        style={styles.backButton}
      />

      <ActionSheetModal
        visible={optionsFor != null}
        title={optionsFor?.name}
        subtitle="Qué quieres hacer con esta plantilla"
        onClose={() => setOptionsFor(null)}
        actions={[
          {
            key: 'edit',
            label: 'Editar la plantilla',
            onPress: () => optionsFor && openEditor(optionsFor.id),
          },
          {
            key: 'delete',
            label: 'Eliminar',
            destructive: true,
            onPress: () => optionsFor && handleDelete(optionsFor),
          },
        ]}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  warning: {
    ...typography.caption,
    color: colors.warning,
    marginBottom: spacing.sm,
  },
  createButton: {
    marginBottom: spacing.md,
  },
  filterCard: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
  },
  modeRadio: {
    width: 18,
    height: 18,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  modeRadioActive: {
    borderColor: colors.accent,
  },
  modeRadioDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
  },
  tagLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  tagLabelActive: {
    color: colors.text,
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
    backgroundColor: `${colors.accent}18`,
  },
  tagChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tagChipTextSelected: {
    color: colors.accent,
  },
  loader: {
    marginTop: spacing.xl,
  },
  emptyCard: {
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  empty: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  error: {
    ...typography.bodySmall,
    color: colors.danger,
    marginBottom: spacing.md,
  },
  backButton: {
    marginTop: spacing.sm,
  },
  pressed: {
    opacity: 0.75,
  },
});
