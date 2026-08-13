import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { STANDARD_VENUES, type StandardVenueId } from '@/lib/standardVenues';

const VENUE_SHORT_LABELS: Record<StandardVenueId, string> = {
  home: 'Casa',
  gym: 'Gym',
  calisthenics: 'Parque',
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
      <View style={styles.row}>
        {STANDARD_VENUES.map((venue) => {
          const isActive = venue.id === value;
          const label = compact ? VENUE_SHORT_LABELS[venue.id] : venue.label;

          return (
            <Pressable
              key={venue.id}
              onPress={() => onChange(venue.id)}
              style={({ pressed }) => [
                styles.tab,
                compact && styles.tabCompact,
                isActive && styles.tabActive,
                pressed && styles.tabPressed,
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={venue.label}
            >
              <AppIcon
                name={venue.icon}
                size={compact ? 18 : 16}
                color={isActive ? colors.accent : colors.textMuted}
                outlined={!isActive}
              />
              <Text
                style={[
                  styles.tabText,
                  compact && styles.tabTextCompact,
                  isActive && styles.tabTextActive,
                ]}
                numberOfLines={compact ? 1 : 2}
              >
                {label}
              </Text>
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
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minWidth: 0,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
  },
  tabCompact: {
    flexDirection: 'column',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xs,
    gap: 4,
  },
  tabActive: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}14`,
  },
  tabPressed: {
    opacity: 0.88,
  },
  tabText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    flexShrink: 1,
  },
  tabTextCompact: {
    fontSize: 11,
    lineHeight: 14,
  },
  tabTextActive: {
    color: colors.text,
  },
});
