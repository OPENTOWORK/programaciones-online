import type { NutritionFoodItem, NutritionMeal, NutritionPlanData, NutritionWeekDay } from '@/lib/types';

const DEFAULT_MEAL_NAMES = ['Desayuno', 'Almuerzo', 'Comida', 'Merienda', 'Cena', 'Post-entreno', 'Snack'];

export const WEEK_DAYS: NutritionWeekDay[] = [
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
  'domingo',
];

export const WEEK_DAY_LABELS: Record<NutritionWeekDay, string> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

export const WEEK_DAY_SHORT_LABELS: Record<NutritionWeekDay, string> = {
  lunes: 'Lun',
  martes: 'Mar',
  miercoles: 'Mié',
  jueves: 'Jue',
  viernes: 'Vie',
  sabado: 'Sáb',
  domingo: 'Dom',
};

const DEFAULT_DAY: NutritionWeekDay = 'lunes';

export function getSuggestedMealNames() {
  return DEFAULT_MEAL_NAMES;
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export function createEmptyFoodItem(): NutritionFoodItem {
  return {
    id: createId('food'),
    name: '',
    quantity: '',
  };
}

export function createEmptyMeal(index: number, day: NutritionWeekDay = DEFAULT_DAY): NutritionMeal {
  return {
    id: createId('meal'),
    name: DEFAULT_MEAL_NAMES[index % DEFAULT_MEAL_NAMES.length] ?? `Comida ${index + 1}`,
    time: '',
    day,
    items: [createEmptyFoodItem()],
  };
}

export function cloneMealForDay(meal: NutritionMeal, day: NutritionWeekDay): NutritionMeal {
  return {
    ...meal,
    id: createId('meal'),
    day,
    items: meal.items.map((item) => ({ ...item, id: createId('food') })),
  };
}

export function createEmptyNutritionPlan(): NutritionPlanData {
  return {
    macros: { calories: '', protein: '', carbs: '', fat: '' },
    meals: [createEmptyMeal(0, DEFAULT_DAY)],
    hydration: '',
    supplements: '',
    notes: '',
  };
}

function sanitizeMeal(meal: NutritionMeal): NutritionMeal | null {
  const name = meal.name.trim();
  const items = meal.items
    .map((item) => ({
      ...item,
      name: item.name.trim(),
      quantity: item.quantity.trim(),
      notes: item.notes?.trim() || undefined,
    }))
    .filter((item) => item.name.length > 0);

  if (!name && items.length === 0) return null;

  return {
    ...meal,
    name: name || 'Comida',
    day: meal.day ?? DEFAULT_DAY,
    time: meal.time?.trim() || undefined,
    items,
  };
}

export function sanitizeNutritionPlan(data: NutritionPlanData): NutritionPlanData {
  const macros = data.macros
    ? {
        calories: data.macros.calories?.trim() || undefined,
        protein: data.macros.protein?.trim() || undefined,
        carbs: data.macros.carbs?.trim() || undefined,
        fat: data.macros.fat?.trim() || undefined,
      }
    : undefined;

  const hasMacros = macros && Object.values(macros).some(Boolean);

  const meals = data.meals
    .map((meal) => sanitizeMeal(meal))
    .filter((meal): meal is NutritionMeal => Boolean(meal));

  return {
    macros: hasMacros ? macros : undefined,
    meals,
    hydration: data.hydration?.trim() || undefined,
    supplements: data.supplements?.trim() || undefined,
    notes: data.notes?.trim() || undefined,
  };
}

export function hasNutritionContent(data: NutritionPlanData): boolean {
  const sanitized = sanitizeNutritionPlan(data);
  return Boolean(
    sanitized.macros ||
      sanitized.meals.length > 0 ||
      sanitized.hydration ||
      sanitized.supplements ||
      sanitized.notes,
  );
}

export function getTodayWeekDay(): NutritionWeekDay {
  const mapping: NutritionWeekDay[] = [
    'domingo',
    'lunes',
    'martes',
    'miercoles',
    'jueves',
    'viernes',
    'sabado',
  ];
  return mapping[new Date().getDay()];
}

export function groupMealsByDay(meals: NutritionMeal[]): Map<NutritionWeekDay, NutritionMeal[]> {
  const grouped = new Map<NutritionWeekDay, NutritionMeal[]>();
  for (const meal of meals) {
    const day = meal.day ?? DEFAULT_DAY;
    if (!grouped.has(day)) grouped.set(day, []);
    grouped.get(day)!.push(meal);
  }
  return grouped;
}

export function buildNutritionSummaryText(data: NutritionPlanData): string {
  const sanitized = sanitizeNutritionPlan(data);
  const lines: string[] = [];

  if (sanitized.macros) {
    const macroParts = [
      sanitized.macros.calories ? `${sanitized.macros.calories} kcal` : null,
      sanitized.macros.protein ? `${sanitized.macros.protein} de proteína` : null,
      sanitized.macros.carbs ? `${sanitized.macros.carbs} de carbohidratos` : null,
      sanitized.macros.fat ? `${sanitized.macros.fat} de grasas` : null,
    ].filter(Boolean);

    if (macroParts.length > 0) {
      lines.push(`Objetivo diario: ${macroParts.join(' · ')}`);
    }
  }

  const mealsByDay = groupMealsByDay(sanitized.meals);

  for (const day of WEEK_DAYS) {
    const meals = mealsByDay.get(day);
    if (!meals || meals.length === 0) continue;

    lines.push(WEEK_DAY_LABELS[day]);
    for (const meal of meals) {
      const header = meal.time ? `  ${meal.name} (${meal.time})` : `  ${meal.name}`;
      lines.push(header);
      for (const item of meal.items) {
        const notes = item.notes ? ` — ${item.notes}` : '';
        const quantity = item.quantity ? ` ${item.quantity}` : '';
        lines.push(`  • ${item.name}${quantity}${notes}`);
      }
    }
  }

  if (sanitized.hydration) {
    lines.push(`Hidratación: ${sanitized.hydration}`);
  }

  if (sanitized.supplements) {
    lines.push(`Suplementación: ${sanitized.supplements}`);
  }

  if (sanitized.notes) {
    lines.push(`Notas: ${sanitized.notes}`);
  }

  return lines.join('\n');
}
