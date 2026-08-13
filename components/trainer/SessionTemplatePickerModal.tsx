import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { useSessionTemplates } from '@/hooks/useSessionTemplates';
import type { SessionTemplate } from '@/lib/sessionTemplateService';
import { describeSessionTemplate } from '@/lib/sessionTemplates';

interface SessionTemplatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (template: SessionTemplate) => void;
  subtitle?: string;
  saving?: boolean;
}

export function SessionTemplatePickerModal({
  visible,
  onClose,
  onSelect,
  subtitle = 'Se aplicará y guardará en la sesión seleccionada.',
  saving = false,
}: SessionTemplatePickerModalProps) {
  const { templates, isLoading } = useSessionTemplates();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>Elegir plantilla</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          {saving ? (
            <Text style={styles.hint}>Guardando plantilla…</Text>
          ) : isLoading ? (
            <Text style={styles.hint}>Cargando plantillas…</Text>
          ) : templates.length === 0 ? (
            <Text style={styles.hint}>
              Todavía no tienes plantillas guardadas. Créalas desde el editor de sesiones.
            </Text>
          ) : (
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {templates.map((template) => {
                const summary = describeSessionTemplate(template.content);
                const details = [
                  `${summary.blockCount} bloque${summary.blockCount === 1 ? '' : 's'}`,
                  summary.duration,
                ]
                  .filter(Boolean)
                  .join(' · ');

                return (
                  <Pressable
                    key={template.id}
                    onPress={() => onSelect(template)}
                    disabled={saving}
                    style={({ pressed }) => [
                      styles.row,
                      saving && styles.rowDisabled,
                      pressed && !saving && styles.rowPressed,
                    ]}
                  >
                    <Text style={styles.rowName} numberOfLines={1}>
                      {template.name}
                    </Text>
                    <Text style={styles.rowDetails} numberOfLines={1}>
                      {details}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          <Button
            title="Cancelar"
            variant="outline"
            onPress={onClose}
            disabled={saving}
            style={styles.cancelBtn}
          />
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
    maxHeight: '80%',
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
  hint: {
    ...typography.bodySmall,
    color: colors.textMuted,
    paddingVertical: spacing.md,
  },
  list: {
    maxHeight: 320,
  },
  row: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 2,
  },
  rowPressed: {
    opacity: 0.85,
    backgroundColor: `${colors.accent}08`,
  },
  rowDisabled: {
    opacity: 0.5,
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
  cancelBtn: {
    marginTop: spacing.xs,
  },
});
