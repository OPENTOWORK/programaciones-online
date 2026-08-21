import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
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

import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { useExerciseNameCatalog } from '@/hooks/useExerciseNameCatalog';
import { filterExerciseNameCatalog, type ExerciseNameOption } from '@/lib/exerciseNameCatalog';

interface ExerciseNamePickerModalProps {
  visible: boolean;
  currentName?: string;
  onCancel: () => void;
  onConfirm: (option: ExerciseNameOption) => void;
}

export function ExerciseNamePickerModal({
  visible,
  currentName,
  onCancel,
  onConfirm,
}: ExerciseNamePickerModalProps) {
  const { items, isLoading, error, refresh } = useExerciseNameCatalog();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!visible) return;
    setQuery('');
  }, [visible]);

  const results = useMemo(() => filterExerciseNameCatalog(items, query), [items, query]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Buscar en la biblioteca</Text>
              <Text style={styles.subtitle}>
                Elige un nombre de ejercicio. Si hay vídeo de técnica, se asignará solo.
              </Text>
            </View>
            <Pressable onPress={onCancel} hitSlop={8} accessibilityLabel="Cerrar">
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar ejercicio..."
            placeholderTextColor={colors.textMuted}
            autoFocus
            style={styles.searchInput}
          />

          {isLoading ? (
            <ActivityIndicator color={colors.accent} style={styles.loader} />
          ) : error ? (
            <View style={styles.errorWrap}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable onPress={() => void refresh()}>
                <Text style={styles.retryText}>Reintentar</Text>
              </Pressable>
            </View>
          ) : results.length === 0 ? (
            <Text style={styles.emptyText}>No hay ejercicios que coincidan con la búsqueda.</Text>
          ) : (
            <ScrollView
              style={styles.resultsScroll}
              contentContainerStyle={styles.resultsList}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            >
              {results.map((item) => (
                <Pressable
                  key={`${item.name}-${item.aimharderEjerId ?? 'name'}`}
                  onPress={() => onConfirm(item)}
                  style={({ pressed }) => [styles.resultRow, pressed && styles.resultRowPressed]}
                >
                  <Ionicons name="barbell-outline" size={16} color={colors.textMuted} />
                  <Text style={styles.resultTitle} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </Pressable>
              ))}
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
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
    maxWidth: 480,
    maxHeight: '80%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
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
  searchInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14,
    minHeight: 40,
  },
  loader: {
    marginVertical: spacing.md,
  },
  errorWrap: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.danger,
    lineHeight: 20,
  },
  retryText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    lineHeight: 20,
    paddingVertical: spacing.sm,
  },
  resultsScroll: {
    maxHeight: 320,
  },
  resultsList: {
    gap: spacing.xs,
    paddingBottom: spacing.xs,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  resultRowPressed: {
    backgroundColor: colors.surfaceLight,
  },
  resultTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
  },
});
