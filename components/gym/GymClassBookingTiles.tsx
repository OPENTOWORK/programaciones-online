import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import type { GymClassRoster, GymClassRosterSlot } from '@/lib/athleteGymService';
import { GYM_BOOKING_STATUS_LABELS, type GymBooking, type GymBookingStatus } from '@/lib/gymTypes';

const TILE_SIZE = 44;

const STATUS_COLORS: Record<GymBookingStatus, string> = {
  confirmed: '#4ADE80',
  waiting: colors.warning,
  attended: colors.accentBlue,
  no_show: colors.danger,
  cancelled: colors.textMuted,
};

function initialsFromName(name?: string) {
  return (name ?? 'M')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function resolveSlot(booking: GymBooking, roster?: GymClassRoster): GymClassRosterSlot {
  const rosterSlots = [
    ...(roster?.slots ?? []).filter((slot): slot is GymClassRosterSlot => slot !== null),
    ...(roster?.waiting ?? []),
  ];
  const found = rosterSlots.find((slot) => slot.bookingId === booking.id);
  if (found) return found;

  return {
    bookingId: booking.id,
    memberId: booking.memberId,
    name: booking.memberName ?? 'Miembro',
    initials: initialsFromName(booking.memberName),
    status: booking.status,
    isViewer: false,
  };
}

function ProfileAvatar({ slot }: { slot: GymClassRosterSlot }) {
  const statusColor = STATUS_COLORS[slot.status];

  if (slot.photoUrl) {
    return (
      <View style={styles.avatarWrap}>
        <Image source={{ uri: slot.photoUrl }} style={styles.avatar} accessibilityLabel={slot.name} />
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      </View>
    );
  }

  return (
    <View style={styles.avatarWrap}>
      <View style={styles.avatarFallback}>
        <Text style={styles.avatarInitials} numberOfLines={1}>{slot.initials}</Text>
      </View>
      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
    </View>
  );
}

interface GymClassBookingTilesProps {
  bookings: GymBooking[];
  roster?: GymClassRoster;
  onPress?: (booking: GymBooking) => void;
}

export function GymClassBookingTiles({ bookings, roster, onPress }: GymClassBookingTilesProps) {
  if (bookings.length === 0) return null;

  return (
    <View style={styles.grid}>
      {bookings.map((booking) => {
        const slot = resolveSlot(booking, roster);
        const statusColor = STATUS_COLORS[booking.status];

        return (
          <Pressable
            key={booking.id}
            onPress={onPress ? () => onPress(booking) : undefined}
            accessibilityRole={onPress ? 'button' : undefined}
            accessibilityLabel={`${slot.name}, ${GYM_BOOKING_STATUS_LABELS[booking.status]}`}
            style={({ pressed }) => [
              styles.tile,
              onPress && pressed && styles.tilePressed,
            ]}
          >
            <ProfileAvatar slot={slot} />
            <Text style={styles.name} numberOfLines={2}>{slot.name}</Text>
            <Text style={[styles.status, { color: statusColor }]} numberOfLines={1}>
              {GYM_BOOKING_STATUS_LABELS[booking.status]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
  },
  tile: {
    width: 76,
    alignItems: 'center',
    gap: 4,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  tilePressed: {
    opacity: 0.82,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
  },
  avatarFallback: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(colors.accent, '14'),
    borderWidth: 1,
    borderColor: withAlpha(colors.accent, '26'),
  },
  avatarInitials: {
    fontSize: 12,
    lineHeight: 14,
    color: colors.accent,
    fontWeight: '800',
  },
  statusDot: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 10,
    height: 10,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.background,
  },
  name: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
    width: '100%',
  },
  status: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 10,
    lineHeight: 12,
    textAlign: 'center',
    width: '100%',
  },
});
