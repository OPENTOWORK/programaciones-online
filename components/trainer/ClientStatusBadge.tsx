import { StyleSheet, Text, View } from 'react-native';

import { borderRadius, colors, typography, withAlpha } from '@/constants/theme';
import {
  TRAINER_CLIENT_STATUS_LABELS,
  type TrainerClientStatus,
} from '@/lib/trainerOverview';

/** Verde de la paleta de niveles: en este tema `colors.success` es rojo de marca. */
const OK_GREEN = '#4ADE80';

const STATUS_COLORS: Record<TrainerClientStatus, string> = {
  active: OK_GREEN,
  upcoming: colors.accentBlue,
  ending_soon: colors.warning,
  ended: colors.danger,
  no_plan: colors.danger,
};

export function clientStatusColor(status: TrainerClientStatus) {
  return STATUS_COLORS[status];
}

export function ClientStatusBadge({ status }: { status: TrainerClientStatus }) {
  const color = STATUS_COLORS[status];

  return (
    <View style={[styles.badge, { backgroundColor: withAlpha(color, '1F'), borderColor: withAlpha(color, '4D') }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]} numberOfLines={1}>
        {TRAINER_CLIENT_STATUS_LABELS[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: borderRadius.full,
  },
  label: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 11,
  },
});
