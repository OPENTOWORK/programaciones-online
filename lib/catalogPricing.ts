import { isGymRole, isTrainerOnlyRole } from '@/lib/athleteService';
import type { UserRole } from '@/lib/types';

export const TRAINER_CATALOG_DISCOUNT_RATE = 0.15;
export const TRAINER_CATALOG_DISCOUNT_PERCENT = 15;

export function hasCatalogStaffDiscount(role?: UserRole) {
  return isTrainerOnlyRole(role) || isGymRole(role);
}

export function parseCatalogPriceAmount(price?: string): number | undefined {
  if (!price) return undefined;
  const match = price.replace(/\./g, '').replace(',', '.').match(/(\d+(?:\.\d+)?)/);
  if (!match) return undefined;
  const amount = Number(match[1]);
  return Number.isFinite(amount) ? amount : undefined;
}

export function formatCatalogPriceFromTemplate(template: string, amount: number) {
  const rounded = Math.round(amount * 100) / 100;
  const formatted = rounded.toFixed(2).replace('.', ',');
  return template.replace(/\d+[.,]\d+/, formatted);
}

export function getCatalogPriceOffer(
  price: string | undefined,
  role?: UserRole,
): { current: string; original?: string; discountPercent?: number } | null {
  if (!price) return null;

  const amount = parseCatalogPriceAmount(price);
  if (amount === undefined || !hasCatalogStaffDiscount(role)) {
    return { current: price };
  }

  const discounted = amount * (1 - TRAINER_CATALOG_DISCOUNT_RATE);
  return {
    current: formatCatalogPriceFromTemplate(price, discounted),
    original: price,
    discountPercent: TRAINER_CATALOG_DISCOUNT_PERCENT,
  };
}
