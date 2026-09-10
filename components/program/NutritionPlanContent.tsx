import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import {
  getTodayWeekDay,
  groupMealsByDay,
  WEEK_DAY_LABELS,
  WEEK_DAY_SHORT_LABELS,
  WEEK_DAYS,
} from '@/lib/nutritionPlanContent';
import type { NutritionPlanData, NutritionWeekDay } from '@/lib/types';

interface NutritionPlanContentProps {
  data: NutritionPlanData;
}

export function NutritionPlanContent({ data }: NutritionPlanContentProps) {
  const mealsByDay = useMemo(() => groupMealsByDay(data.meals), [data.meals]);
  const daysWithMeals = useMemo(
    () => WEEK_DAYS.filter((day) => (mealsByDay.get(day)?.length ?? 0) > 0),
    [mealsByDay],
  );

  const [selectedDay, setSelectedDay] = useState<NutritionWeekDay>(() => {
    const today = getTodayWeekDay();
    if (mealsByDay.get(today)?.length) return today;
    return daysWithMeals[0] ?? today;
  });

  const macros = data.macros;
  const macroChips = macros
    ? [
        macros.calories ? { label: 'Kcal', value: macros.calories } : null,
        macros.protein ? { label: 'Prot', value: macros.protein } : null,
        macros.carbs ? { label: 'Carbs', value: macros.carbs } : null,
        macros.fat ? { label: 'Grasas', value: macros.fat } : null,
      ].filter((chip): chip is { label: string; value: string } => Boolean(chip))
    : [];

  const mealsForSelectedDay = mealsByDay.get(selectedDay) ?? [];

  return (
    <View style={styles.container}>
      {macroChips.length > 0 ? (
        <View style={styles.macroRow}>
          {macroChips.map((chip) => (
            <View key={chip.label} style={styles.macroChip}>
              <Text style={styles.macroValue}>{chip.value}</Text>
              <Text style={styles.macroLabel}>{chip.label}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {daysWithMeals.length > 0 ? (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.dayTabsScroll}
            contentContainerStyle={styles.dayTabsRow}
          >
            {WEEK_DAYS.map((day) => {
              const isActive = day === selectedDay;
              const hasMeals = daysWithMeals.includes(day);
              return (
                <Pressable
                  key={day}
                  onPress={() => setSelectedDay(day)}
                  disabled={!hasMeals}
                  style={[styles.dayTab, isActive && styles.dayTabActive, !hasMeals && styles.dayTabDisabled]}
                >
                  <Text
                    style={[
                      styles.dayTabText,
                      isActive && styles.dayTabTextActive,
                      !hasMeals && styles.dayTabTextDisabled,
                    ]}
                  >
                    {WEEK_DAY_SHORT_LABELS[day]}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.dayHeading}>{WEEK_DAY_LABELS[selectedDay]}</Text>

          {mealsForSelectedDay.length === 0 ? (
            <Text style={styles.emptyDayText}>Sin comidas planificadas para este día.</Text>
          ) : (
            mealsForSelectedDay.map((meal) => (
              <View key={meal.id} style={styles.mealBlock}>
                <View style={styles.mealHeader}>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  {meal.time ? <Text style={styles.mealTime}>{meal.time}</Text> : null}
                </View>
                {meal.items.map((item) => (
                  <View key={item.id} style={styles.foodRow}>
                    <Text style={styles.foodBullet}>•</Text>
                    <Text style={styles.foodText}>
                      {item.name}
                      {item.quantity ? <Text style={styles.foodQuantity}> — {item.quantity}</Text> : null}
                      {item.notes ? <Text style={styles.foodNotes}> ({item.notes})</Text> : null}
                    </Text>
                  </View>
                ))}
              </View>
            ))
          )}
        </>
      ) : null}

      {data.hydration ? (
        <View style={styles.detailRow}>
          <AppIcon name="measure" size={16} color={colors.accentBlue} />
          <View style={styles.detailTextWrap}>
            <Text style={styles.detailLabel}>Hidratación</Text>
            <Text style={styles.detailText}>{data.hydration}</Text>
          </View>
        </View>
      ) : null}

      {data.supplements ? (
        <View style={styles.detailRow}>
          <AppIcon name="stats" size={16} color={colors.accentBlue} />
          <View style={styles.detailTextWrap}>
            <Text style={styles.detailLabel}>Suplementación</Text>
            <Text style={styles.detailText}>{data.supplements}</Text>
          </View>
        </View>
      ) : null}

      {data.notes ? (
        <View style={styles.detailRow}>
          <AppIcon name="info" size={16} color={colors.textMuted} />
          <View style={styles.detailTextWrap}>
            <Text style={styles.detailLabel}>Notas</Text>
            <Text style={styles.detailText}>{data.notes}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  macroRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  macroChip: {
    backgroundColor: withAlpha(colors.accent, '18'),
    borderWidth: 1,
    borderColor: withAlpha(colors.accent, '33'),
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    minWidth: 68,
  },
  macroValue: { ...typography.bodySmall, color: colors.text, fontWeight: '700' },
  macroLabel: { ...typography.caption, color: colors.textMuted },
  dayTabsScroll: {
    marginTop: -spacing.xs,
  },
  dayTabsRow: {
    gap: spacing.xs,
    paddingRight: spacing.sm,
  },
  dayTab: {
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
  },
  dayTabActive: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '18'),
  },
  dayTabDisabled: {
    opacity: 0.4,
  },
  dayTabText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  dayTabTextActive: {
    color: colors.text,
  },
  dayTabTextDisabled: {
    color: colors.textMuted,
  },
  dayHeading: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  emptyDayText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  mealBlock: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  mealName: { ...typography.body, color: colors.text, fontWeight: '700' },
  mealTime: { ...typography.caption, color: colors.textMuted },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    paddingLeft: spacing.xs,
  },
  foodBullet: { color: colors.accent, ...typography.bodySmall, lineHeight: 20 },
  foodText: { ...typography.bodySmall, color: colors.textSecondary, flex: 1, lineHeight: 20 },
  foodQuantity: { color: colors.text, fontWeight: '600' },
  foodNotes: { color: colors.textMuted, fontStyle: 'italic' },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailTextWrap: { flex: 1 },
  detailLabel: { ...typography.caption, color: colors.textMuted, fontWeight: '700', marginBottom: 2 },
  detailText: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 20 },
});
