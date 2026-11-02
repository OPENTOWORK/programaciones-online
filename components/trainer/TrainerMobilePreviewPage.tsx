import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TrainerMobilePreviewFrame } from '@/components/trainer/TrainerMobilePreview';
import { HeaderBackButton } from '@/components/ui/HeaderBackButton';
import { colors, spacing, typography } from '@/constants/theme';

export function TrainerMobilePreviewPage({ onOpenAthlete }: { onOpenAthlete: () => void }) {
  return (
    <View style={styles.page}>
      <View style={styles.intro}>
        <View style={styles.backRow}>
          <HeaderBackButton />
        </View>
        <Text style={styles.title}>Vista móvil del entrenador</Text>
        <Text style={styles.subtitle}>
          Así se ve la app cuando el entrenador entra desde el móvil o con el navegador en pantalla
          estrecha: inicio con avisos y accesos, planes, atletas, chats y perfil.
        </Text>
        <View style={styles.modeRow}>
          <Pressable
            onPress={onOpenAthlete}
            style={({ pressed }) => [styles.modeChip, pressed && styles.modeChipPressed]}
            accessibilityRole="button"
            accessibilityLabel="Volver a vista móvil del atleta"
          >
            <Text style={styles.modeChipText}>Vista del atleta</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.previewArea}>
        <TrainerMobilePreviewFrame />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    minHeight: 0,
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  intro: {
    gap: spacing.xs,
    maxWidth: 720,
  },
  backRow: {
    alignSelf: 'flex-start',
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  modeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  modeChipPressed: {
    opacity: 0.9,
  },
  modeChipText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  previewArea: {
    flex: 1,
    minHeight: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.md,
  },
});
