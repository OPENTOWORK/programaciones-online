import { Platform, StyleSheet, Text, View } from 'react-native';

import type { GymTrainingSession } from '@/lib/gymTraining';
import { gymSessionBoardText } from '@/lib/gymTraining';

export function GymTrainingSessionCard({
  session,
  compact = false,
}: {
  session: GymTrainingSession;
  compact?: boolean;
}) {
  const ink = '#1A1A1A';
  const boardText = session.body ? gymSessionBoardText(session) : '';
  return (
    <View style={[styles.card, compact && styles.cardCompact, { backgroundColor: session.color }]}>
      <Text style={[styles.program, { color: ink }]}>{session.programName}</Text>
      {boardText ? (
        <Text style={[styles.body, compact && styles.bodyCompact, { color: ink }]}>
          {boardText}
        </Text>
      ) : (
        <Text style={[styles.title, compact && styles.titleCompact, { color: ink }]}>{session.name}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
    ...(Platform.OS === 'web' ? ({ cursor: 'default' } as object) : null),
  },
  cardCompact: {
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
  program: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    opacity: 0.75,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  titleCompact: {
    fontSize: 10,
  },
  body: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
    marginTop: 6,
  },
  bodyCompact: {
    fontSize: 9,
    lineHeight: 12,
    marginTop: 4,
  },
});
