import type {
  GymBillingPeriod,
  GymMembershipPlan,
  GymPromotion,
  GymPromotionDiscountType,
} from '@/lib/gymTypes';

export function normalizeGymCatalogName(name: string) {
  return name.trim().toLowerCase();
}

export interface HypeGymRateTemplate {
  name: string;
  price: number;
  billingPeriod: GymBillingPeriod;
  maxBookings?: number;
  description?: string;
}

export interface HypeGymDiscountTemplate {
  name: string;
  discountType: GymPromotionDiscountType;
  discountValue: number;
  description?: string;
}

/** Catálogo oficial de tarifas de Hype (referencia del panel anterior). */
export const HYPE_GYM_RATES: HypeGymRateTemplate[] = [
  { name: 'BONO 10 SESIONES', price: 130, billingPeriod: 'one_time', maxBookings: 10 },
  { name: 'BONO 5', price: 75, billingPeriod: 'one_time', maxBookings: 5 },
  {
    name: 'Bono Entrenamiento Personal',
    price: 400,
    billingPeriod: 'one_time',
    description: 'Pack de entrenamiento personal',
  },
  { name: 'Bono Flexible', price: 34, billingPeriod: 'monthly' },
  { name: 'BONO SESION FOTOS - FREE', price: 0, billingPeriod: 'one_time', maxBookings: 1 },
  { name: 'Clase de Prueba', price: 10, billingPeriod: 'one_time', maxBookings: 1 },
  { name: 'Drop in', price: 17, billingPeriod: 'one_time', maxBookings: 1 },
  { name: 'HY-PE BASIC', price: 95, billingPeriod: 'monthly' },
  { name: 'HY-PE MAX', price: 115, billingPeriod: 'monthly' },
  { name: 'HY-PE MED', price: 105, billingPeriod: 'monthly' },
  { name: 'HY-PE UNLIMITED', price: 135, billingPeriod: 'monthly' },
  { name: 'HY-PE UNLIMITED FOUNDER', price: 100, billingPeriod: 'monthly' },
  {
    name: 'HY-PE UNLIMITED FOUNDER PACK',
    price: 270,
    billingPeriod: 'quarterly',
    description: 'Pack trimestral founder',
  },
  { name: 'Tarifa Verano', price: 270, billingPeriod: 'quarterly', description: 'Tarifa de verano' },
  { name: 'Tarifa Wellhub Extended +', price: 40, billingPeriod: 'monthly' },
];

/** Descuentos habituales de Hype. */
export const HYPE_GYM_DISCOUNTS: HypeGymDiscountTemplate[] = [
  {
    name: 'CCSS y Sanitarios',
    discountType: 'percentage',
    discountValue: 10,
    description: 'Descuento para personal sanitario y CCSS',
  },
  { name: 'F&F', discountType: 'percentage', discountValue: 50, description: 'Friends & Family' },
  { name: 'Founder', discountType: 'fixed', discountValue: 30, description: 'Descuento founder en €' },
  { name: 'Mañanas', discountType: 'percentage', discountValue: 20, description: 'Horario de mañana' },
  { name: 'Staff', discountType: 'percentage', discountValue: 100, description: 'Personal del gimnasio' },
];

export function isHypeGymCatalogTarget(gym?: { slug?: string; email?: string } | null) {
  if (!gym) return false;
  const slug = gym.slug?.toLowerCase();
  const email = gym.email?.toLowerCase();
  return slug === 'hype' || email === 'info@trainwithhype.com';
}

function hasDuplicateNames(items: Array<{ name: string }>) {
  const seen = new Set<string>();
  for (const item of items) {
    const key = normalizeGymCatalogName(item.name);
    if (seen.has(key)) return true;
    seen.add(key);
  }
  return false;
}

export function isHypeCatalogNeedsSync(
  plans: GymMembershipPlan[],
  promotions: GymPromotion[],
) {
  const planNames = new Set(plans.map((plan) => normalizeGymCatalogName(plan.name)));
  const promoNames = new Set(promotions.map((promo) => normalizeGymCatalogName(promo.name)));

  const missingPlans = HYPE_GYM_RATES.some(
    (rate) => !planNames.has(normalizeGymCatalogName(rate.name)),
  );
  const missingPromotions = HYPE_GYM_DISCOUNTS.some(
    (discount) => !promoNames.has(normalizeGymCatalogName(discount.name)),
  );

  return missingPlans || missingPromotions || hasDuplicateNames(plans) || hasDuplicateNames(promotions);
}
