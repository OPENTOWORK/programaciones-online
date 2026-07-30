import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import {
  cloneMealForDay,
  createEmptyFoodItem,
  createEmptyMeal,
  getSuggestedMealNames,
  WEEK_DAY_LABELS,
  WEEK_DAY_SHORT_LABELS,
  WEEK_DAYS,
} from '@/lib/nutritionPlanContent';
import type { NutritionMacros, NutritionMeal, NutritionPlanData, NutritionWeekDay } from '@/lib/types';

interface NutritionPlanBuilderProps {
  value: NutritionPlanData;
  onChange: (value: NutritionPlanData) => void;
}

function IconButton({ icon, onPress, color = colors.textMuted }: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void; color?: string }) {
  return (
    <Pressable onPress={onPress} hitSlop={10} style={styles.iconButton}>
      <Ionicons name={icon} size={18} color={color} />
    </Pressable>
  );
}

export function NutritionPlanBuilder({ value, onChange }: NutritionPlanBuilderProps) {
  const macros = value.macros ?? {};
  const suggestedMealNames = getSuggestedMealNames();
  const [selectedDay, setSelectedDay] = useState<NutritionWeekDay>('lunes');

  const mealsForDay = value.meals.filter((meal) => (meal.day ?? 'lunes') === selectedDay);
  const daysWithMeals = new Set(value.meals.filter((meal) => meal.items.length > 0).map((meal) => meal.day ?? 'lunes'));

  const updateMacro = (field: keyof NutritionMacros, text: string) => {
    onChange({ ...value, macros: { ...macros, [field]: text } });
  };

  const updateField = (field: 'hydration' | 'supplements' | 'notes', text: string) => {
    onChange({ ...value, [field]: text });
  };

  const updateMeal = (mealId: string, patch: Partial<NutritionMeal>) => {
    onChange({
      ...value,
      meals: value.meals.map((meal) => (meal.id === mealId ? { ...meal, ...patch } : meal)),
    });
  };

  const removeMeal = (mealId: string) => {
    onChange({ ...value, meals: value.meals.filter((meal) => meal.id !== mealId) });
  };

  const addMeal = () => {
    onChange({ ...value, meals: [...value.meals, createEmptyMeal(mealsForDay.length, selectedDay)] });
  };

  const addFoodItem = (mealId: string) => {
    onChange({
      ...value,
      meals: value.meals.map((meal) =>
        meal.id === mealId ? { ...meal, items: [...meal.items, createEmptyFoodItem()] } : meal,
      ),
    });
  };

  const updateFoodItem = (mealId: string, itemId: string, field: 'name' | 'quantity' | 'notes', text: string) => {
    onChange({
      ...value,
      meals: value.meals.map((meal) => {
        if (meal.id !== mealId) return meal;
        return {
          ...meal,
          items: meal.items.map((item) => (item.id === itemId ? { ...item, [field]: text } : item)),
        };
      }),
    });
  };

  const removeFoodItem = (mealId: string, itemId: string) => {
    onChange({
      ...value,
      meals: value.meals.map((meal) => {
        if (meal.id !== mealId) return meal;
        return { ...meal, items: meal.items.filter((item) => item.id !== itemId) };
      }),
    });
  };

  const copyDayToAllDays = () => {
    if (mealsForDay.length === 0) return;

    const message = `Esto reemplazará las comidas de los demás días con las de ${WEEK_DAY_LABELS[selectedDay]}. ¿Continuar?`;

    const proceed = () => {
      const otherDaysMeals = WEEK_DAYS.filter((day) => day !== selectedDay).flatMap((day) =>
        mealsForDay.map((meal) => cloneMealForDay(meal, day)),
      );
      onChange({ ...value, meals: [...mealsForDay, ...otherDaysMeals] });
    };

    if (Platform.OS === 'web') {
      if (window.confirm(message)) proceed();
      return;
    }

    Alert.alert('Copiar comidas a toda la semana', message, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Copiar', onPress: proceed },
    ]);
  };

  return (
    <View>
      <Text style={styles.sectionLabel}>Objetivo de macros (opcional)</Text>
      <Card style={styles.macroCard}>
        <View style={styles.macroRow}>
          <View style={styles.macroField}>
            <Input
              label="Calorías"
              placeholder="Ej. 2200 kcal"
              value={macros.calories ?? ''}
              onChangeText={(text) => updateMacro('calories', text)}
            />
          </View>
          <View style={styles.macroField}>
            <Input
              label="Proteína"
              placeholder="Ej. 150g"
              value={macros.protein ?? ''}
              onChangeText={(text) => updateMacro('protein', text)}
            />
          </View>
        </View>
        <View style={styles.macroRow}>
          <View style={styles.macroField}>
            <Input
              label="Carbohidratos"
              placeholder="Ej. 220g"
              value={macros.carbs ?? ''}
              onChangeText={(text) => updateMacro('carbs', text)}
            />
          </View>
          <View style={styles.macroField}>
            <Input
              label="Grasas"
              placeholder="Ej. 70g"
              value={macros.fat ?? ''}
              onChangeText={(text) => updateMacro('fat', text)}
            />
          </View>
        </View>
      </Card>

      <Text style={styles.sectionLabel}>Comidas de la semana</Text>
      <Text style={styles.sectionHint}>
        Elige un día para ver o añadir sus comidas. Puedes copiar las comidas de un día a toda la semana.
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayTabsScroll} contentContainerStyle={styles.dayTabsRow}>
        {WEEK_DAYS.map((day) => {
          const isActive = day === selectedDay;
          return (
            <Pressable
              key={day}
              onPress={() => setSelectedDay(day)}
              style={[styles.dayTab, isActive && styles.dayTabActive]}
            >
              <Text style={[styles.dayTabText, isActive && styles.dayTabTextActive]}>
                {WEEK_DAY_SHORT_LABELS[day]}
              </Text>
              {daysWithMeals.has(day) ? <View style={[styles.dayDot, isActive && styles.dayDotActive]} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>

      {mealsForDay.length === 0 ? (
        <Card style={styles.emptyDayCard}>
          <Text style={styles.emptyDayText}>
            Todavía no hay comidas para {WEEK_DAY_LABELS[selectedDay]}. Añade una con el botón de abajo.
          </Text>
        </Card>
      ) : (
        mealsForDay.map((meal) => (
          <Card key={meal.id} style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <View style={styles.mealHeaderField}>
                <Input
                  label="Nombre de la comida"
                  value={meal.name}
                  onChangeText={(text) => updateMeal(meal.id, { name: text })}
                  placeholder="Ej. Desayuno"
                />
              </View>
              <View style={styles.mealTimeField}>
                <Input
                  label="Hora"
                  value={meal.time ?? ''}
                  onChangeText={(text) => updateMeal(meal.id, { time: text })}
                  placeholder="08:00"
                />
              </View>
              <IconButton icon="trash-outline" onPress={() => removeMeal(meal.id)} color={colors.danger} />
            </View>

            <View style={styles.chipsRow}>
              {suggestedMealNames.map((name) => (
                <Pressable key={name} style={styles.chip} onPress={() => updateMeal(meal.id, { name })}>
                  <Text style={styles.chipText}>{name}</Text>
                </Pressable>
              ))}
            </View>

            {meal.items.map((item) => (
              <View key={item.id} style={styles.foodRow}>
                <View style={styles.foodNameField}>
                  <Input
                    value={item.name}
                    onChangeText={(text) => updateFoodItem(meal.id, item.id, 'name', text)}
                    placeholder="Alimento (ej. Pechuga de pollo)"
                  />
                </View>
                <View style={styles.foodQuantityField}>
                  <Input
                    value={item.quantity}
                    onChangeText={(text) => updateFoodItem(meal.id, item.id, 'quantity', text)}
                    placeholder="Cantidad"
                  />
                </View>
                <IconButton icon="close-circle-outline" onPress={() => removeFoodItem(meal.id, item.id)} />
              </View>
            ))}

            <Button
              title="Añadir alimento"
              variant="ghost"
              onPress={() => addFoodItem(meal.id)}
              style={styles.addFoodBtn}
              textStyle={styles.addFoodBtnText}
            />
          </Card>
        ))
      )}

      <Button
        title={`Añadir comida a ${WEEK_DAY_LABELS[selectedDay]}`}
        variant="outline"
        onPress={addMeal}
        style={styles.addMealBtn}
      />

      {mealsForDay.length > 0 ? (
        <Button
          title="Copiar comidas de este día a toda la semana"
          variant="ghost"
          onPress={copyDayToAllDays}
          style={styles.copyDaysBtn}
          textStyle={styles.copyDaysBtnText}
        />
      ) : null}

      <Text style={styles.sectionLabel}>Otros detalles (opcional)</Text>
      <Input
        label="Hidratación"
        value={value.hydration ?? ''}
        onChangeText={(text) => updateField('hydration', text)}
        placeholder="Ej. 2,5-3L de agua al día"
        multiline
        numberOfLines={2}
        textAlignVertical="top"
        style={styles.textAreaSmall}
      />
      <Input
        label="Suplementación"
        value={value.supplements ?? ''}
        onChangeText={(text) => updateField('supplements', text)}
        placeholder="Ej. Creatina 5g, Whey post-entreno"
        multiline
        numberOfLines={2}
        textAlignVertical="top"
        style={styles.textAreaSmall}
      />
      <Input
        label="Notas generales"
        value={value.notes ?? ''}
        onChangeText={(text) => updateField('notes', text)}
        placeholder="Recomendaciones, sustituciones permitidas, horarios..."
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        style={styles.textAreaSmall}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '700',
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  sectionHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  macroCard: { marginBottom: spacing.md, gap: spacing.xs },
  macroRow: { flexDirection: 'row', gap: spacing.sm },
  macroField: { flex: 1 },
  dayTabsScroll: {
    marginBottom: spacing.md,
  },
  dayTabsRow: {
    gap: spacing.xs,
    paddingRight: spacing.sm,
  },
  dayTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
  },
  dayTabActive: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}18`,
  },
  dayTabText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  dayTabTextActive: {
    color: colors.text,
  },
  dayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textMuted,
  },
  dayDotActive: {
    backgroundColor: colors.accent,
  },
  emptyDayCard: {
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  emptyDayText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  mealCard: { marginBottom: spacing.md },
  mealHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  mealHeaderField: { flex: 2 },
  mealTimeField: { flex: 1 },
  iconButton: {
    marginTop: spacing.md + 14,
    padding: spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  foodNameField: { flex: 2 },
  foodQuantityField: { flex: 1 },
  addFoodBtn: {
    alignSelf: 'flex-start',
    minHeight: 36,
    paddingHorizontal: spacing.sm,
    marginTop: -spacing.sm,
  },
  addFoodBtnText: {
    ...typography.bodySmall,
    color: colors.accent,
  },
  addMealBtn: {
    marginBottom: spacing.sm,
  },
  copyDaysBtn: {
    marginBottom: spacing.lg,
  },
  copyDaysBtnText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  textAreaSmall: { minHeight: 72, paddingTop: 14 },
});
