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

import { AlphabetFilter } from '@/components/library/AlphabetFilter';
import { Button } from '@/components/ui/Button';
import { YoutubeThumbnail } from '@/components/workout/YoutubeThumbnail';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { useExerciseLibrary } from '@/hooks/useExerciseLibrary';
import { buildAvailableFirstLetters, filterByFirstLetter } from '@/lib/alphabetFilter';
import { filterExerciseLibrary, type ExerciseLibraryItem } from '@/lib/exerciseLibrary';
import { parseWorkoutItemVideoFromInput } from '@/lib/workoutItemVideo';

export interface ExerciseVideoSelection {
  youtubeVideoId: string;
  label?: string;
}

interface ExerciseVideoPickerModalProps {
  visible: boolean;
  exerciseName?: string;
  currentVideoId?: string;
  onCancel: () => void;
  onConfirm: (selection: ExerciseVideoSelection | null) => void;
}

export function ExerciseVideoPickerModal({
  visible,
  exerciseName,
  currentVideoId,
  onCancel,
  onConfirm,
}: ExerciseVideoPickerModalProps) {
  const { items, isLoading, error, refresh } = useExerciseLibrary();
  const [query, setQuery] = useState('');
  const [letter, setLetter] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setQuery(exerciseName?.trim() ?? '');
    setLetter(null);
    setUrlInput('');
    setUrlError(null);
  }, [exerciseName, visible]);

  const filteredItems = useMemo(() => filterExerciseLibrary(items, query), [items, query]);

  const availableLetters = useMemo(
    () => buildAvailableFirstLetters(filteredItems.map((item) => item.name)),
    [filteredItems],
  );

  const results = useMemo(
    () => filterByFirstLetter(filteredItems, letter, (item) => item.name).slice(0, 24),
    [filteredItems, letter],
  );

  useEffect(() => {
    if (letter && !availableLetters.has(letter)) {
      setLetter(null);
    }
  }, [availableLetters, letter]);

  const handlePickLibrary = (item: ExerciseLibraryItem) => {
    onConfirm({ youtubeVideoId: item.videoId, label: item.name });
  };

  const handlePickUrl = () => {
    const videoId = parseWorkoutItemVideoFromInput(urlInput);
    if (!videoId) {
      setUrlError('Pega un enlace de YouTube válido o un id de 11 caracteres.');
      return;
    }
    onConfirm({ youtubeVideoId: videoId });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Vídeo del ejercicio</Text>
              <Text style={styles.subtitle}>
                {exerciseName?.trim()
                  ? `Elige un vídeo de la biblioteca o pega un enlace de YouTube para ${exerciseName.trim()}.`
                  : 'Elige un vídeo de la biblioteca o pega un enlace de YouTube.'}
              </Text>
            </View>
            <Pressable onPress={onCancel} hitSlop={8} accessibilityLabel="Cerrar">
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          {currentVideoId ? (
            <View style={styles.currentVideoRow}>
              <YoutubeThumbnail videoId={currentVideoId} style={styles.currentThumb} resizeMode="cover" />
              <View style={styles.currentCopy}>
                <Text style={styles.currentLabel}>Vídeo actual</Text>
                <Text style={styles.currentId}>{currentVideoId}</Text>
              </View>
              <Button
                title="Quitar"
                variant="secondary"
                onPress={() => onConfirm(null)}
                style={styles.removeBtn}
                textStyle={styles.removeBtnText}
              />
            </View>
          ) : null}

          <Text style={styles.sectionLabel}>Enlace de YouTube</Text>
          <View style={styles.urlRow}>
            <TextInput
              value={urlInput}
              onChangeText={(value) => {
                setUrlInput(value);
                if (urlError) setUrlError(null);
              }}
              placeholder="https://youtube.com/watch?v=..."
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.urlInput}
            />
            <Pressable onPress={handlePickUrl} style={styles.urlBtn}>
              <Text style={styles.urlBtnText}>Usar</Text>
            </Pressable>
          </View>
          {urlError ? <Text style={styles.urlError}>{urlError}</Text> : null}

          <View style={styles.libraryHeader}>
            <Text style={styles.sectionLabel}>Biblioteca</Text>
            {error ? (
              <Pressable onPress={() => void refresh()}>
                <Text style={styles.retryText}>Reintentar</Text>
              </Pressable>
            ) : null}
          </View>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar en la biblioteca..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />

          <AlphabetFilter
            selected={letter}
            availableLetters={availableLetters}
            onSelect={setLetter}
          />

          {isLoading ? (
            <ActivityIndicator color={colors.accent} style={styles.loader} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : results.length === 0 ? (
            <Text style={styles.emptyText}>No hay vídeos que coincidan con la búsqueda.</Text>
          ) : (
            <ScrollView style={styles.resultsScroll} contentContainerStyle={styles.resultsList}>
              {results.map((item) => (
                <Pressable
                  key={item.videoId}
                  onPress={() => handlePickLibrary(item)}
                  style={({ pressed }) => [styles.resultRow, pressed && styles.resultRowPressed]}
                >
                  <YoutubeThumbnail videoId={item.videoId} style={styles.resultThumb} resizeMode="cover" />
                  <View style={styles.resultCopy}>
                    <Text style={styles.resultTitle} numberOfLines={2}>
                      {item.name}
                    </Text>
                    {item.aliases.length > 0 ? (
                      <Text style={styles.resultAliases} numberOfLines={1}>
                        {item.aliases.join(' · ')}
                      </Text>
                    ) : null}
                  </View>
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
    maxWidth: 520,
    maxHeight: '88%',
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
  currentVideoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currentThumb: {
    width: 72,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceLight,
  },
  currentCopy: {
    flex: 1,
    gap: 2,
  },
  currentLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  currentId: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  removeBtn: {
    minHeight: 34,
    paddingHorizontal: spacing.sm,
    marginTop: 0,
  },
  removeBtnText: {
    fontSize: 13,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  urlInput: {
    flex: 1,
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
  urlBtn: {
    backgroundColor: colors.accentDark,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    minHeight: 40,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  urlBtnText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  urlError: {
    ...typography.caption,
    color: colors.danger,
  },
  libraryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  retryText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
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
  errorText: {
    ...typography.bodySmall,
    color: colors.danger,
    lineHeight: 20,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    lineHeight: 20,
    paddingVertical: spacing.sm,
  },
  resultsScroll: {
    maxHeight: 280,
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
  resultThumb: {
    width: 72,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceLight,
  },
  resultCopy: {
    flex: 1,
    gap: 2,
  },
  resultTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  resultAliases: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
