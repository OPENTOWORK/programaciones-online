import { APP_THEMES, type AppThemeId } from '@/constants/appThemes';
import { resolveShopProductImageUrl } from '@/lib/gymShopProductArt';

export const SHOP_IMAGE_THEME_IDS = APP_THEMES.map((theme) => theme.id);

const THEME_SEGMENT = new RegExp(`/(${SHOP_IMAGE_THEME_IDS.join('|')})$`);

export function shopProductImageBaseKey(gymId: string, productId: string) {
  return `${gymId}/${productId}`;
}

export function normalizeShopProductImageBase(imagePath?: string | null) {
  if (!imagePath) return undefined;
  if (
    imagePath.startsWith('placeholder:') ||
    imagePath.startsWith('data:') ||
    imagePath.startsWith('blob:') ||
    imagePath.startsWith('http')
  ) {
    return undefined;
  }

  let base = imagePath.replace(/\.(png|jpe?g|webp)$/i, '');
  base = base.replace(THEME_SEGMENT, '');
  return base;
}

export function shopProductThemeStoragePath(baseOrLegacy: string, themeId: AppThemeId) {
  const base = normalizeShopProductImageBase(baseOrLegacy) ?? baseOrLegacy.replace(/\.(png|jpe?g|webp)$/i, '');
  return `${base}/${themeId}.png`;
}

export function resolveShopProductStoragePath(imagePath: string | undefined, themeId: AppThemeId) {
  const base = normalizeShopProductImageBase(imagePath);
  if (!base) return undefined;

  if (
    themeId === 'night' &&
    imagePath &&
    /\.(png|jpe?g|webp)$/i.test(imagePath) &&
    !THEME_SEGMENT.test(imagePath.replace(/\.(png|jpe?g|webp)$/i, ''))
  ) {
    return imagePath;
  }

  return shopProductThemeStoragePath(base, themeId);
}

export function parseShopProductImageThemes(value: unknown): AppThemeId[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is AppThemeId =>
    typeof item === 'string' && SHOP_IMAGE_THEME_IDS.includes(item as AppThemeId),
  );
}

export function shopProductHasThemeImage(
  imagePath: string | undefined,
  imageThemes: AppThemeId[] | undefined,
  themeId: AppThemeId,
) {
  if (imageThemes?.includes(themeId)) return true;
  if (themeId !== 'night') return false;
  return Boolean(normalizeShopProductImageBase(imagePath));
}

export function getShopProductImageUrl(
  product: {
    imagePath?: string;
    name: string;
    updatedAt?: string;
  },
  themeId: AppThemeId,
  supabaseBaseUrl: string,
  bucket = 'gym-product-images',
) {
  const storagePath = resolveShopProductStoragePath(product.imagePath, themeId);
  if (!storagePath) {
    return resolveShopProductImageUrl(product.imagePath, product.name, product.updatedAt);
  }

  const placeholder = resolveShopProductImageUrl(product.imagePath, product.name, product.updatedAt);
  if (placeholder?.startsWith('data:')) return placeholder;

  const base = supabaseBaseUrl.replace(/\/$/, '');
  const url = `${base}/storage/v1/object/public/${bucket}/${storagePath}`;
  if (!product.updatedAt) return url;
  return `${url}?t=${encodeURIComponent(product.updatedAt)}`;
}
