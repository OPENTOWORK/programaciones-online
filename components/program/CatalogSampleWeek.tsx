import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fontUiRegular, fontUiSemibold } from '@/constants/fonts';
import { brandColor, brandColors, colors, spacing } from '@/constants/theme';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import type { CatalogSampleDay } from '@/lib/catalogSampleWeek';

interface CatalogSampleWeekProps {
  days: CatalogSampleDay[];
}

export function CatalogSampleWeek({ days }: CatalogSampleWeekProps) {
  const router = useAppNavigation();

  const openSession = (workoutId: string) => {
    router.push({
      pathname: '/workout/[id]',
      params: { id: workoutId, preview: 'week' },
    });
  };

  return (
    <View style={styles.wrap}>
      {days.map((day) => {
        const sessions = day.sessions.filter((session) => !session.rest);
        const isRest = sessions.length === 0;

        return (
          <View key={day.weekday} style={styles.dayCard}>
            <Text style={styles.dayLabel}>{day.label}</Text>
            {isRest ? <Text style={styles.rest}>Descanso</Text> : null}
            {sessions.map((session, index) => (
              <Pressable
                key={session.id}
                onPress={() => openSession(session.id)}
                accessibilityRole="button"
                accessibilityLabel={`Ver la sesión de ejemplo del ${day.label}: ${session.name}`}
                style={({ pressed }) => [
                  styles.session,
                  index > 0 && styles.sessionDivider,
                  pressed && styles.sessionPressed,
                ]}
              >
                <View style={styles.sessionCopy}>
                  <Text style={styles.sessionName}>{session.name}</Text>
                  {session.duration ? <Text style={styles.sessionMeta}>{session.duration}</Text> : null}
                </View>
                <Text style={styles.sessionHint}>Ver formato</Text>
              </Pressable>
            ))}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  dayCard: {
    backgroundColor: brandColor('card', '#12161C'),
    borderWidth: 1,
    borderColor: brandColor('cardBorder', '#2C313A'),
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  dayLabel: {
    fontFamily: fontUiSemibold,
    fontWeight: 'normal',
    color: colors.text,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 6,
  },
  rest: {
    fontFamily: fontUiRegular,
    fontWeight: 'normal',
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    paddingBottom: 10,
  },
  session: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 12,
  },
  sessionDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brandColor('cardBorder', '#2C313A'),
  },
  sessionPressed: {
    opacity: 0.72,
  },
  sessionCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  sessionName: {
    fontFamily: fontUiSemibold,
    fontWeight: 'normal',
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
  },
  sessionMeta: {
    fontFamily: fontUiRegular,
    fontWeight: 'normal',
    color: brandColor('body', '#C5CAD3'),
    fontSize: 13,
    lineHeight: 18,
  },
  sessionHint: {
    fontFamily: fontUiSemibold,
    fontWeight: 'normal',
    color: brandColor('actionInk', brandColors.orangeAction),
    fontSize: 13,
    lineHeight: 18,
  },
});
