import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import type { GymClassTypeInput } from '@/lib/gymService';
import type { GymClassType } from '@/lib/gymTypes';

const COLOR_PRESETS = [
  '#E85BB8',
  '#4CAF50',
  '#9E9E9E',
  '#FF9800',
  '#FFC107',
  '#F44336',
  '#2196F3',
  '#9C27B0',
  '#00BCD4',
  '#795548',
  '#607D8B',
  '#8BC34A',
];

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      style={({ pressed }) => [styles.toggleRow, pressed && styles.pressed]}
    >
      <Text style={styles.toggleLabel}>{label}</Text>
      <View style={[styles.toggleBox, value && styles.toggleBoxActive]}>
        {value ? <Text style={styles.toggleMark}>✓</Text> : null}
      </View>
    </Pressable>
  );
}

export function GymClassTypeFormModal({
  visible,
  classType,
  title,
  subtitle,
  onCancel,
  onSubmit,
}: {
  visible: boolean;
  classType?: GymClassType | null;
  title?: string;
  subtitle?: string;
  onCancel: () => void;
  onSubmit: (input: GymClassTypeInput) => Promise<{ error?: string }>;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('60');
  const [capacity, setCapacity] = useState('12');
  const [color, setColor] = useState(COLOR_PRESETS[0]);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setName(classType?.name ?? '');
    setDescription(classType?.description ?? '');
    setDuration(String(classType?.durationMinutes ?? 60));
    setCapacity(String(classType?.capacity ?? 12));
    setColor(classType?.color ?? COLOR_PRESETS[0]);
    setActive(classType?.active ?? true);
    setError(null);
  }, [classType, visible]);

  const handleSubmit = async () => {
    const durationValue = Number(duration);
    const capacityValue = Number(capacity);

    if (!name.trim()) return setError('El nombre es obligatorio.');
    if (!Number.isFinite(durationValue) || durationValue < 5) {
      return setError('La duración debe ser de al menos 5 minutos.');
    }
    if (!Number.isFinite(capacityValue) || capacityValue < 1) {
      return setError('El aforo debe ser de al menos 1 plaza.');
    }

    setSaving(true);
    setError(null);
    const result = await onSubmit({
      name,
      description,
      durationMinutes: durationValue,
      capacity: capacityValue,
      color,
      active,
    });
    setSaving(false);

    if (result.error) return setError(result.error);
    onCancel();
  };

  const modalTitle = title ?? (classType ? 'Editar modalidad' : 'Nueva modalidad');
  const modalSubtitle =
    subtitle ?? 'Define nombre, color y valores por defecto para programar clases en el horario.';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          onPress={onCancel}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.card}>
          <Text style={styles.modalTitle}>{modalTitle}</Text>
          <Text style={styles.modalSubtitle}>{modalSubtitle}</Text>
          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <Input label="Nombre" value={name} onChangeText={setName} placeholder="Pilates" />
            <Input
              label="Descripción"
              value={description}
              onChangeText={setDescription}
              placeholder="Opcional"
            />
            <Input
              label="Duración (minutos)"
              value={duration}
              onChangeText={(value) => setDuration(value.replace(/[^\d]/g, ''))}
              keyboardType="number-pad"
            />
            <Input
              label="Aforo"
              value={capacity}
              onChangeText={(value) => setCapacity(value.replace(/[^\d]/g, ''))}
              keyboardType="number-pad"
            />

            <Text style={styles.colorLabel}>Color en el horario</Text>
            <View style={styles.colorGrid}>
              {COLOR_PRESETS.map((preset) => {
                const selected = color === preset;
                return (
                  <Pressable
                    key={preset}
                    onPress={() => setColor(preset)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`Color ${preset}`}
                    style={({ pressed }) => [
                      styles.colorSwatch,
                      { backgroundColor: preset },
                      selected && styles.colorSwatchSelected,
                      pressed && styles.pressed,
                    ]}
                  />
                );
              })}
            </View>

            <ToggleRow label="Activa" value={active} onChange={setActive} />
          </ScrollView>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.actions}>
            <Button title="Cancelar" variant="secondary" onPress={onCancel} style={styles.actionButton} />
            <Button title="Guardar" onPress={() => void handleSubmit()} loading={saving} style={styles.actionButton} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
  },
  modalSubtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  form: {
    maxHeight: 420,
  },
  colorLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: 'transparent',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  colorSwatchSelected: {
    borderColor: colors.text,
    transform: [{ scale: 1.08 }],
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  toggleLabel: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  toggleBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  toggleBoxActive: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '22'),
  },
  toggleMark: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '800',
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  pressed: {
    opacity: 0.8,
  },
});
