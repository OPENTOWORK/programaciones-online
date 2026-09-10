export type ShopProductCategory =
  | 'supplement'
  | 'apparel'
  | 'equipment'
  | 'beverage'
  | 'accessory'
  | 'service';

const CATEGORY_LABELS: Record<ShopProductCategory, string> = {
  supplement: 'Suplemento',
  apparel: 'Ropa',
  equipment: 'Material',
  beverage: 'Bebida',
  accessory: 'Accesorio',
  service: 'Servicio',
};

const CATEGORY_COLORS: Record<ShopProductCategory, { bg: string; accent: string }> = {
  supplement: { bg: '#1f3d32', accent: '#7dcea0' },
  apparel: { bg: '#3d2430', accent: '#ff8a80' },
  equipment: { bg: '#243041', accent: '#90caf9' },
  beverage: { bg: '#1f3348', accent: '#81d4fa' },
  accessory: { bg: '#2f2948', accent: '#b39ddb' },
  service: { bg: '#3d341f', accent: '#ffd54f' },
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrapLines(text: string, maxChars = 18) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines.slice(0, 3);
}

export function isGymProductService(product: Pick<{ name: string; sku?: string }, 'name' | 'sku'>) {
  const sku = (product.sku ?? '').trim().toLowerCase().replace(/\s+/g, '-');
  if (sku === 'drop-in' || sku === 'dropin') return true;
  return inferShopProductCategory(product.name) === 'service';
}

export function inferShopProductCategory(name: string): ShopProductCategory {
  const normalized = name.toLowerCase();

  if (
    normalized.includes('bono') ||
    normalized.includes('drop in') ||
    normalized.includes('drop-in') ||
    normalized.includes('staff') ||
    normalized.includes('batido staff') ||
    normalized.includes('barrita staff')
  ) {
    return 'service';
  }

  if (
    normalized.includes('batido') ||
    normalized.includes('agua') ||
    normalized.includes('red bull') ||
    normalized.includes('vitamin well') ||
    normalized.includes('barrita') ||
    normalized.includes('chocolatina')
  ) {
    return 'beverage';
  }

  if (
    normalized.includes('shirt') ||
    normalized.includes('t-shirt') ||
    normalized.includes('leggin') ||
    normalized.includes('legging') ||
    normalized.includes('sudadera') ||
    normalized.includes('crop top') ||
    normalized.includes('hybrid') ||
    normalized.includes('minimal') ||
    normalized.includes('short') ||
    normalized.includes('calcetines') ||
    normalized.includes('gorra') ||
    normalized.includes('gorro')
  ) {
    return 'apparel';
  }

  if (
    normalized.includes('comba') ||
    normalized.includes('calleras') ||
    normalized.includes('cinturon') ||
    normalized.includes('cinturón') ||
    normalized.includes('muñequeras') ||
    normalized.includes('munequeras') ||
    normalized.includes('foam roller') ||
    normalized.includes('lija')
  ) {
    return 'equipment';
  }

  if (
    normalized.includes('belevels') ||
    normalized.includes('qns') ||
    normalized.includes('vitamina') ||
    normalized.includes('creatina') ||
    normalized.includes('magnesio') ||
    normalized.includes('magnesium') ||
    normalized.includes('omega') ||
    normalized.includes('eaas') ||
    normalized.includes('carnitina') ||
    normalized.includes('crema') ||
    normalized.includes('protein') ||
    normalized.includes('colageno') ||
    normalized.includes('colágeno')
  ) {
    return 'supplement';
  }

  return 'accessory';
}

export function getShopProductPlaceholderMeta(name: string, category = inferShopProductCategory(name)) {
  return {
    category,
    label: CATEGORY_LABELS[category],
    lines: wrapLines(name.trim() || 'Producto'),
    palette: CATEGORY_COLORS[category],
  };
}

export function isShopProductPlaceholderPath(imagePath?: string) {
  return !imagePath || imagePath.startsWith('placeholder:');
}

export function buildShopProductPlaceholder(name: string, category = inferShopProductCategory(name)) {
  const palette = CATEGORY_COLORS[category];
  const lines = wrapLines(name.trim() || 'Producto');
  const lineStartY = 150 - ((lines.length - 1) * 12);
  const lineMarkup = lines
    .map(
      (line, index) =>
        `<text x="200" y="${lineStartY + index * 24}" text-anchor="middle" fill="#ffffff" font-size="18" font-family="Arial, sans-serif" font-weight="700">${escapeXml(line)}</text>`,
    )
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.bg}" />
      <stop offset="100%" stop-color="#111722" />
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bg)" />
  <circle cx="200" cy="118" r="52" fill="${palette.accent}" opacity="0.18" />
  <circle cx="200" cy="118" r="34" fill="${palette.accent}" opacity="0.35" />
  <text x="200" y="126" text-anchor="middle" fill="${palette.accent}" font-size="13" font-family="Arial, sans-serif" font-weight="700">${CATEGORY_LABELS[category]}</text>
  ${lineMarkup}
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function placeholderPathForProduct(name: string) {
  return `placeholder:${inferShopProductCategory(name)}`;
}

export function resolveShopProductImageUrl(
  imagePath: string | undefined,
  productName: string,
  cacheKey?: string,
) {
  if (!imagePath) return undefined;
  if (imagePath.startsWith('placeholder:')) {
    const category = imagePath.slice('placeholder:'.length) as ShopProductCategory;
    return buildShopProductPlaceholder(productName, category);
  }
  if (imagePath.startsWith('data:') || imagePath.startsWith('blob:') || imagePath.startsWith('http')) {
    return imagePath;
  }
  return undefined;
}
