import catalog from '@/data/hype-gym-shop-products.json';

export interface HypeGymShopCatalogItem {
  name: string;
  price: number;
  stock: number;
  sku?: string;
  active?: boolean;
}

export const HYPE_GYM_SHOP_PRODUCTS = catalog as HypeGymShopCatalogItem[];

export function normalizeShopProductName(name: string) {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function skuFromShopProductName(name: string) {
  return normalizeShopProductName(name).replace(/\s+/g, '-').slice(0, 48);
}

export function findShopCatalogMatch<T extends { name: string; sku?: string }>(
  items: T[],
  target: { name: string; sku?: string },
) {
  const sku = target.sku?.trim().toLowerCase();
  if (sku) {
    const bySku = items.find((item) => item.sku?.trim().toLowerCase() === sku);
    if (bySku) return bySku;
  }

  const name = normalizeShopProductName(target.name);
  return items.find((item) => normalizeShopProductName(item.name) === name);
}
