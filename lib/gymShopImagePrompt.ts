import themeBackgrounds from '@/data/gym-shop-image-themes.json';
import type { AppThemeId } from '@/constants/appThemes';
import { inferShopProductCategory, type ShopProductCategory } from '@/lib/gymShopProductArt';

const CATEGORY_SHOT: Record<ShopProductCategory, string> = {
  supplement: 'Bote o bote de suplemento deportivo premium, etiqueta limpia sin texto legible',
  apparel: 'Prenda deportiva doblada o en plano, textura visible, estilo ecommerce premium',
  equipment: 'Material de entrenamiento aislado, acabado realista y detallado',
  beverage: 'Botella o envase de bebida fría, gotas sutiles, estilo catálogo premium',
  accessory: 'Accesorio de gimnasio o lifestyle sport, composición centrada y elegante',
  service: 'Tarjeta o pase de servicio abstracto sin texto legible, estilo premium minimal',
};

export function buildGymProductImagePrompt(input: {
  name: string;
  description?: string;
  themeId?: AppThemeId | string;
}) {
  const themeKey = (input.themeId ?? 'night') as keyof typeof themeBackgrounds;
  const theme =
    themeBackgrounds[themeKey] ??
    themeBackgrounds.night ??
    themeBackgrounds['night' as keyof typeof themeBackgrounds];
  const category = inferShopProductCategory(input.name);
  const detail = input.description?.trim()
    ? ` Detalles del producto: ${input.description.trim()}.`
    : '';

  return [
    'Fotografía profesional de producto para ecommerce de gimnasio, fotorealista, 1:1.',
    `Producto: ${input.name.trim()}.${detail}`,
    CATEGORY_SHOT[category],
    `Fondo: ${theme.background}.`,
    'Iluminación de estudio suave, sombras realistas, producto centrado, nítido, composición limpia.',
    'Sin texto, sin logotipos inventados, sin marcas de agua, sin personas, sin manos.',
  ].join(' ');
}

export function isPlaceholderShopImagePath(imagePath?: string | null) {
  return !imagePath || imagePath.startsWith('placeholder:');
}
