import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useMemo, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { AddYoutubeVideoModal } from '@/components/library/AddYoutubeVideoModal';
import { AlphabetFilter } from '@/components/library/AlphabetFilter';
import { Card } from '@/components/ui/Card';
import { ExerciseVideoEmbed } from '@/components/workout/ExerciseVideoEmbed';
import { YoutubeThumbnail } from '@/components/workout/YoutubeThumbnail';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useExerciseLibrary } from '@/hooks/useExerciseLibrary';
import {
  filterExerciseLibrary,
  filterExerciseLibraryByOrigin,
  type ExerciseLibraryItem,
  type ExerciseLibraryOriginFilter,
} from '@/lib/exerciseLibrary';
import { createExerciseLibraryUpload } from '@/lib/exerciseLibraryUploads';
import { buildAvailableFirstLetters, filterByFirstLetter } from '@/lib/alphabetFilter';
import { getYoutubeWatchUrl } from '@/lib/exerciseVideoService';

const MIN_CARD_WIDTH = 220;

const ORIGIN_FILTERS: Array<{ id: ExerciseLibraryOriginFilter; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'page', label: 'De la página' },
  { id: 'mine', label: 'Subidos por mí' },
];

export function ExerciseLibraryBrowser({
  title,
  subtitle,
  canManage = false,
}: {
  title?: string;
  subtitle?: string;
  canManage?: boolean;
}) {
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const { items, isLoading, error, refresh } = useExerciseLibrary();

  const [query, setQuery] = useState('');
  const [letter, setLetter] = useState<string | null>(null);
  const [origin, setOrigin] = useState<ExerciseLibraryOriginFilter>('all');
  const [selected, setSelected] = useState<ExerciseLibraryItem | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    const byOrigin = canManage ? filterExerciseLibraryByOrigin(items, origin, user?.id) : items;
    return filterExerciseLibrary(byOrigin, query);
  }, [canManage, items, origin, query, user?.id]);

  const availableLetters = useMemo(
    () => buildAvailableFirstLetters(filteredItems.map((item) => item.name)),
    [filteredItems],
  );

  const results = useMemo(
    () => filterByFirstLetter(filteredItems, letter, (item) => item.name),
    [filteredItems, letter],
  );

  useEffect(() => {
    if (letter && !availableLetters.has(letter)) {
      setLetter(null);
    }
  }, [availableLetters, letter]);

  const columns = Math.max(1, Math.min(4, Math.floor((width - spacing.md * 2) / MIN_CARD_WIDTH)));

  const rows = useMemo(() => {
    const chunks: ExerciseLibraryItem[][] = [];
    for (let index = 0; index < results.length; index += columns) {
      chunks.push(results.slice(index, index + columns));
    }
    return chunks;
  }, [columns, results]);

  const renderPlayer = (item: ExerciseLibraryItem) => (
    <Card style={styles.playerCard}>
      <View style={styles.playerHeader}>
        <View style={styles.playerCopy}>
          <Text style={styles.playerLabel}>Reproduciendo</Text>
          <Text style={styles.playerTitle} numberOfLines={2}>
            {item.name}
          </Text>
          {item.aliases.length > 0 ? (
            <Text style={styles.playerAliases} numberOfLines={2}>
              También aparece como: {item.aliases.join(' · ')}
            </Text>
          ) : null}
        </View>
        <Pressable
          onPress={() => setSelected(null)}
          accessibilityLabel="Cerrar vídeo"
          hitSlop={6}
          style={({ pressed }) => [styles.closeBtn, pressed && styles.closeBtnPressed]}
        >
          <Ionicons name="close" size={18} color={colors.text} />
        </Pressable>
      </View>

      <ExerciseVideoEmbed youtubeVideoId={item.videoId} title={`Vídeo de ${item.name}`} />

      <Pressable
        onPress={() => void Linking.openURL(getYoutubeWatchUrl(item.videoId))}
        style={styles.externalLink}
      >
        <Text style={styles.externalLinkText}>Abrir en YouTube</Text>
      </Pressable>
    </Card>
  );

  const handleAddVideo = async (input: { name: string; youtubeUrl: string }) => {
    if (!user?.id) {
      setSaveError('Debes iniciar sesión para añadir un vídeo.');
      return;
    }

    setSaving(true);
    setSaveError(null);
    const result = await createExerciseLibraryUpload({
      name: input.name,
      youtubeUrl: input.youtubeUrl,
      userId: user.id,
    });
    setSaving(false);

    if (result.error) {
      setSaveError(result.error);
      return;
    }

    setAddOpen(false);
    setOrigin('mine');
    await refresh();
  };

  return (
    <View>
      {title ? (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      ) : null}

      <View style={styles.searchRow}>
        <Ionicons name="search" size={16} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar ejercicio (por ejemplo: pull up, snatch, wall ball)"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel="Borrar búsqueda">
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      <AlphabetFilter
        selected={letter}
        availableLetters={availableLetters}
        onSelect={setLetter}
      />

      <View style={styles.resultsRow}>
        <Text style={styles.resultsCount}>
          {results.length} {results.length === 1 ? 'vídeo' : 'vídeos'}
        </Text>
        {isLoading ? <ActivityIndicator size="small" color={colors.accent} /> : null}

        {canManage ? (
          <View style={styles.resultsActions}>
            <View style={styles.filterRow}>
              {ORIGIN_FILTERS.map((filter) => {
                const active = origin === filter.id;
                return (
                  <Pressable
                    key={filter.id}
                    onPress={() => setOrigin(filter.id)}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                      {filter.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable
              onPress={() => {
                setSaveError(null);
                setAddOpen(true);
              }}
              style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
            >
              <Ionicons name="logo-youtube" size={16} color={colors.white} />
              <Text style={styles.addBtnText}>Añadir vídeo de YouTube</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      {error ? (
        <Pressable onPress={() => void refresh()} style={styles.errorBox}>
          <Text style={styles.errorText}>{error} Toca para reintentar.</Text>
        </Pressable>
      ) : null}

      {results.length === 0 && !isLoading ? (
        <Card>
          <Text style={styles.emptyTitle}>Sin resultados</Text>
          <Text style={styles.emptyText}>
            {query
              ? `No hay ningún vídeo que coincida con «${query}». Prueba con otro nombre.`
              : letter
                ? `No hay vídeos que empiecen por «${letter}».`
              : origin === 'mine'
                ? 'Todavía no has subido vídeos. Pulsa «Añadir vídeo de YouTube» para añadir el primero.'
                : 'No hay vídeos en este filtro.'}
          </Text>
        </Card>
      ) : (
        rows.map((row) => {
          const playing = selected
            ? (row.find((item) => item.videoId === selected.videoId) ?? null)
            : null;

          return (
            <View key={row[0].videoId}>
              <View style={styles.grid}>
                {row.map((item) => {
                  const isPlaying = item.videoId === playing?.videoId;
                  return (
                    <Pressable
                      key={item.videoId}
                      onPress={() => setSelected(isPlaying ? null : item)}
                      style={({ pressed }) => [
                        styles.videoCard,
                        { width: `${100 / columns}%` },
                        pressed && styles.videoCardPressed,
                      ]}
                    >
                      <View style={[styles.thumbWrap, isPlaying && styles.thumbWrapActive]}>
                        <YoutubeThumbnail
                          videoId={item.videoId}
                          style={styles.thumb}
                          resizeMode="cover"
                        />
                        <View style={styles.playBadge}>
                          <Ionicons
                            name={isPlaying ? 'close' : 'play'}
                            size={14}
                            color={colors.white}
                          />
                        </View>
                      </View>
                      <Text
                        style={[styles.videoName, isPlaying && styles.videoNameActive]}
                        numberOfLines={2}
                      >
                        {item.name}
                      </Text>
                      {canManage && item.source === 'user' ? (
                        <Text style={styles.videoOrigin}>
                          {item.createdBy === user?.id ? 'Subido por mí' : 'Subido por el equipo'}
                        </Text>
                      ) : item.aliases.length > 0 ? (
                        <Text style={styles.videoAlias} numberOfLines={1}>
                          {item.aliases[0]}
                        </Text>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>

              {playing ? renderPlayer(playing) : null}
            </View>
          );
        })
      )}

      {canManage ? (
        <AddYoutubeVideoModal
          visible={addOpen}
          saving={saving}
          error={saveError}
          onClose={() => {
            if (saving) return;
            setAddOpen(false);
            setSaveError(null);
          }}
          onSave={(input) => void handleAddVideo(input)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    minHeight: 40,
    ...typography.bodySmall,
    color: colors.text,
  },
  playerCard: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    borderColor: withAlpha(colors.accent, '55'),
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  playerCopy: {
    flex: 1,
    minWidth: 0,
  },
  playerLabel: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  playerTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: 2,
  },
  playerAliases: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
  },
  closeBtnPressed: {
    opacity: 0.8,
  },
  externalLink: {
    marginTop: spacing.sm,
    alignSelf: 'center',
    paddingVertical: spacing.xs,
  },
  externalLinkText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  resultsCount: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  resultsActions: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '18'),
  },
  filterChipText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: colors.accent,
    fontWeight: '700',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
  addBtnPressed: {
    opacity: 0.88,
  },
  addBtnText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
  },
  errorBox: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: `${colors.danger}55`,
    backgroundColor: `${colors.danger}14`,
    marginBottom: spacing.sm,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  videoCard: {
    padding: spacing.xs,
  },
  videoCardPressed: {
    opacity: 0.85,
  },
  thumbWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.black,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumbWrapActive: {
    borderColor: colors.accent,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  playBadge: {
    position: 'absolute',
    right: spacing.xs,
    bottom: spacing.xs,
    width: 26,
    height: 26,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.black}CC`,
  },
  videoName: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  videoNameActive: {
    color: colors.accent,
  },
  videoAlias: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  videoOrigin: {
    ...typography.caption,
    color: colors.accent,
    marginTop: 2,
    fontWeight: '600',
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
