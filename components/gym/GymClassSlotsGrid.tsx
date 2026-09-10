import { Image, StyleSheet, Text, View } from 'react-native';

import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import type { GymClassRoster } from '@/lib/athleteGymService';

const SLOT_SIZE = 36;

function SlotAvatar({
  initials,
  photoUrl,
  highlighted,
}: {
  initials: string;
  photoUrl?: string;
  highlighted?: boolean;
}) {
  if (photoUrl) {
    return (
      <Image
        source={{ uri: photoUrl }}
        style={[styles.slot, highlighted && styles.slotHighlighted]}
        accessibilityLabel={initials}
      />
    );
  }

  return (
    <View style={[styles.slot, styles.slotFilled, highlighted && styles.slotHighlighted]}>
      <Text style={styles.slotInitials} numberOfLines={1}>
        {initials}
      </Text>
    </View>
  );
}

export function GymClassSlotsGrid({ roster, capacity }: { roster?: GymClassRoster; capacity: number }) {
  const slots = roster?.slots ?? Array.from({ length: capacity }, () => null);
  const waiting = roster?.waiting ?? [];
  const filledCount = slots.filter(Boolean).length;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        Plazas · {filledCount}/{capacity}
      </Text>

      <View style={styles.grid}>
        {slots.map((slot, index) =>
          slot ? (
            <SlotAvatar
              key={slot.bookingId}
              initials={slot.initials}
              photoUrl={slot.photoUrl}
              highlighted={slot.isViewer}
            />
          ) : (
            <View key={`empty-${index}`} style={[styles.slot, styles.slotVacant]} accessibilityLabel="Plaza libre" />
          ),
        )}
      </View>

      {waiting.length > 0 ? (
        <View style={styles.waitingBlock}>
          <Text style={styles.waitingLabel}>
            Lista de espera · {waiting.length} {waiting.length === 1 ? 'persona' : 'personas'}
          </Text>
          <View style={styles.waitingRow}>
            {waiting.map((slot, index) => (
              <View key={slot.bookingId} style={styles.waitingSlot}>
                <Text style={styles.waitingPosition}>{index + 1}</Text>
                <SlotAvatar
                  initials={slot.initials}
                  photoUrl={slot.photoUrl}
                  highlighted={slot.isViewer}
                />
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
    width: '100%',
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  slot: {
    width: SLOT_SIZE,
    height: SLOT_SIZE,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceLight,
  },
  slotVacant: {
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: withAlpha(colors.surfaceLight, '44'),
  },
  slotFilled: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  slotHighlighted: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  slotInitials: {
    fontSize: 11,
    lineHeight: 13,
    color: colors.text,
    fontWeight: '700',
  },
  waitingBlock: {
    gap: spacing.xs,
  },
  waitingLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  waitingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  waitingSlot: {
    alignItems: 'center',
    gap: 2,
  },
  waitingPosition: {
    fontSize: 10,
    lineHeight: 12,
    color: colors.textMuted,
    fontWeight: '700',
  },
});
