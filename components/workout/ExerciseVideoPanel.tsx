import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';

import { ExerciseVideoEmbed } from '@/components/workout/ExerciseVideoEmbed';
import { Card } from '@/components/ui/Card';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { getYoutubeWatchUrl } from '@/lib/exerciseVideoService';

interface ExerciseVideoPanelProps {
  exerciseName: string;
  youtubeVideoId: string;
  onClose: () => void;
}

export function ExerciseVideoPanel({
  exerciseName,
  youtubeVideoId,
  onClose,
}: ExerciseVideoPanelProps) {
  const openInYoutube = () => {
    void Linking.openURL(getYoutubeWatchUrl(youtubeVideoId));
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.label}>Reproduciendo</Text>
          <Text style={styles.title} numberOfLines={2}>
            {exerciseName}
          </Text>
        </View>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Cerrar vídeo"
          style={styles.closeBtn}
        >
          <Ionicons name="close" size={20} color={colors.text} />
        </Pressable>
      </View>

      <ExerciseVideoEmbed
        youtubeVideoId={youtubeVideoId}
        title={`Vídeo de ${exerciseName}`}
      />

      <Pressable onPress={openInYoutube} style={styles.externalLink}>
        <Text style={styles.externalLinkText}>Abrir en YouTube</Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderColor: withAlpha(colors.accent, '55'),
    backgroundColor: colors.surface,
    minHeight: 280,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  headerCopy: {
    flex: 1,
  },
  label: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
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
});
