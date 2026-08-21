import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { STANDARD_VENUES, type StandardVenueId } from '@/lib/standardVenues';

const VENUE_SHORT_LABELS: Record<StandardVenueId, string> = {
  gym: 'Gym',
  calisthenics: 'Calistenia',
};

interface StandardVenueTabsProps {
  value: StandardVenueId;
  onChange: (venue: StandardVenueId) => void;
}

export function StandardVenueTabs({ value, onChange }: StandardVenueTabsProps) {
  const { width } = useWindowDimensions();
  const compact = width < 720;

  return (
    <View style={styles.wrap}>
      <Text style={styles.caption}>Espacio</Text>
      <View style={styles.track}>
        {STANDARD_VENUES.map((venue) => {
          const isActive = venue.id === value;
          const label = compact ? VENUE_SHORT_LABELS[venue.id] : venue.label;

          return (
            <Pressable
              key={venue.id}
              onPress={() => onChange(venue.id)}
              style={({ pressed }) => [
                styles.tab,
                isActive && styles.tabActive,
                pressed && !isActive && styles.tabPressed,
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={venue.label}
            >
              <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
                <AppIcon
                  name={venue.icon}
                  size={16}
                  color={isActive ? colors.white : colors.textMuted}
                  outlined={!isActive}
                />
              </View>
              <View style={styles.copy}>
                <Text style={[styles.tabText, isActive && styles.tabTextActive]} numberOfLines={1}>
                  {label}
                </Text>
                {!compact ? (
                  <Text style={[styles.tabHint, isActive && styles.tabHintActive]} numberOfLines={1}>
                    {venue.description}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  caption: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  track: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
    maxWidth: 560,
  },
  tab: {
    flex: 1,
    minWidth: 0,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabActive: {
    backgroundColor: colors.accentDark,
    borderColor: 'rgba(255,255,255,0.16)',
    shadowColor: colors.accentDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
  tabPressed: {
    opacity: 0.78,
    backgroundColor: colors.surfaceLight,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  tabText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  tabTextActive: {
    color: colors.white,
  },
  tabHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  tabHintActive: {
    color: 'rgba(255,255,255,0.72)',
  },
});
