import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Badge } from '@/components/ui/Badge';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import {
  HOME_TRAINING_SLOT_STATUS_LABELS,
  canBookSlot,
  canCancelSlot,
  slotDayLabel,
  slotTimeRange,
} from '@/lib/homeTrainingSchedule';
import type { HomeTrainingSlot, HomeTrainingSlotStatus } from '@/lib/types';

const STATUS_COLORS: Record<HomeTrainingSlotStatus, string> = {
  open: colors.accent,
  booked: colors.accentBlue,
  cancelled: colors.textMuted,
};

interface HomeTrainingSlotCardProps {
  slot: HomeTrainingSlot;
  viewerId: string;
  isTrainer: boolean;
  busy?: boolean;
  showDay?: boolean;
  onBook: (slot: HomeTrainingSlot) => void;
  onCancel: (slot: HomeTrainingSlot) => void;
}

export function HomeTrainingSlotCard({
  slot,
  viewerId,
  isTrainer,
  busy = false,
  showDay = true,
  onBook,
  onCancel,
}: HomeTrainingSlotCardProps) {
  const router = useRouter();
  const bookable = canBookSlot(slot, isTrainer);
  const cancellable = canCancelSlot(slot, viewerId, isTrainer);

  const withLabel = (() => {
    if (slot.status === 'open') {
      return isTrainer ? 'Sin reservar' : 'Disponible para apuntarte';
    }
    if (isTrainer && slot.athleteId) {
      return null;
    }
    if (!isTrainer && slot.status === 'booked') {
      return slot.trainerName ? `con ${slot.trainerName}` : 'con tu entrenador';
    }
    return null;
  })();

  return (
    <View style={[styles.card, slot.status === 'cancelled' && styles.cardCancelled]}>
      <View style={styles.headerRow}>
        <Text style={styles.time}>{slotTimeRange(slot)}</Text>
        <Badge label={HOME_TRAINING_SLOT_STATUS_LABELS[slot.status]} color={STATUS_COLORS[slot.status]} />
      </View>

      <Text style={styles.title}>{slot.title}</Text>
      <Text style={styles.meta}>
        {showDay ? `${slotDayLabel(slot)} · ` : ''}
        {slot.durationMinutes} min
        {withLabel ? ` · ${withLabel}` : ''}
      </Text>

      {isTrainer && slot.status === 'booked' && slot.athleteId ? (
        <Pressable
          onPress={() =>
            router.push({ pathname: '/trainer/athlete/[id]', params: { id: slot.athleteId! } })
          }
          style={({ pressed }) => pressed && styles.pressed}
          accessibilityRole="link"
        >
          <Text style={styles.athleteLink}>{slot.athleteName ?? 'Ver atleta'}</Text>
        </Pressable>
      ) : null}

      {slot.notes ? <Text style={styles.notes}>{slot.notes}</Text> : null}

      {bookable || cancellable ? (
        <View style={styles.actions}>
          {bookable ? (
            <Pressable
              onPress={() => onBook(slot)}
              disabled={busy}
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed, busy && styles.disabled]}
            >
              <Text style={styles.primaryBtnText}>Apuntarme</Text>
            </Pressable>
          ) : null}
          {cancellable ? (
            <Pressable
              onPress={() => onCancel(slot)}
              disabled={busy}
              style={({ pressed }) => [styles.ghostBtn, pressed && styles.pressed, busy && styles.disabled]}
            >
              <Text style={styles.ghostBtnText}>{isTrainer ? 'Cancelar hueco' : 'Cancelar reserva'}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardCancelled: {
    opacity: 0.55,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  time: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  title: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  athleteLink: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '600',
    textDecorationLine: 'underline',
    marginTop: 2,
  },
  notes: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  primaryBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accentDark,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  primaryBtnText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  ghostBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghostBtnText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
});
