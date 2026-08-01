import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { ExerciseVideoEmbed } from '@/components/workout/ExerciseVideoEmbed';
import { Card } from '@/components/ui/Card';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { useExerciseLibrary } from '@/hooks/useExerciseLibrary';
import {
  filterExerciseLibrary,
  getYoutubeThumbnailUrl,
  type ExerciseLibraryItem,
} from '@/lib/exerciseLibrary';
import { getYoutubeWatchUrl } from '@/lib/exerciseVideoService';

const MIN_CARD_WIDTH = 220;

export default function ExerciseLibraryScreen() {
  const { width } = useWindowDimensions();
  const { items, isLoading, error, refresh } = useExerciseLibrary();

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ExerciseLibraryItem | null>(null);

  const results = useMemo(() => filterExerciseLibrary(items, query), [items, query]);

  const columns = Math.max(1, Math.min(4, Math.floor((width - spacing.md * 2) / MIN_CARD_WIDTH)));

  // El reproductor se abre debajo de la fila del vídeo elegido, no al principio de la lista.
  const rows = useMemo(() => {
    const chunks: ExerciseLibraryItem[][] = [];
    for (let index = 0; index < results.length; index += columns) {
      chunks.push(results.slice(index, index + columns));
    }
    return chunks;
  }, [results, columns]);

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

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.title}>Biblioteca de ejercicios</Text>
        <Text style={styles.subtitle}>
          Todos los vídeos del canal de YouTube, listos para consultar la técnica de cada movimiento.
        </Text>
      </View>

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

      <View style={styles.resultsRow}>
        <Text style={styles.resultsCount}>
          {results.length} {results.length === 1 ? 'ejercicio' : 'ejercicios'}
        </Text>
        {isLoading ? <ActivityIndicator size="small" color={colors.accent} /> : null}
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
            No hay ningún ejercicio que coincida con «{query}». Prueba con otro nombre.
          </Text>
        </Card>
      ) : (
        rows.map((row) => {
          const playing = selected
            ? row.find((item) => item.videoId === selected.videoId) ?? null
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
                        <Image
                          source={{ uri: getYoutubeThumbnailUrl(item.videoId) }}
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
                      {item.aliases.length > 0 ? (
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
    </ScreenWrapper>
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
    borderColor: `${colors.accent}55`,
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
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  resultsCount: {
    ...typography.caption,
    color: colors.textMuted,
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
