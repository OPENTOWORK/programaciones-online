/**
 * Genera la marca de agua de fondo (la TP del logotipo) desde assets/brand/progline-mark.svg:
 * - logo-watermark.png: tinta blanca, para temas oscuros.
 * - logo-watermark-on-light.png: tinta negra, para temas claros.
 *
 * Uso: node scripts/generate-logo-watermark.mjs
 */
import path from 'node:path';

import { BRAND_COLORS, assetsDir, loadBrandSvg, placeBrandSvg, renderSvg, svgDocument } from './lib/brandSvg.mjs';

const WIDTH = 1200;
const mark = loadBrandSvg('progline-mark.svg');
const height = Math.round((WIDTH * mark.height) / mark.width);

const variants = [
  { fileName: 'logo-watermark.png', ink: BRAND_COLORS.white },
  { fileName: 'logo-watermark-on-light.png', ink: BRAND_COLORS.charcoal },
];

async function main() {
  for (const { fileName, ink } of variants) {
    const svg = svgDocument(WIDTH, height, placeBrandSvg(mark, { x: 0, y: 0, width: WIDTH, ink }));
    await renderSvg(svg).png({ compressionLevel: 9 }).toFile(path.join(assetsDir, fileName));
    console.log(`Marca de agua generada: assets/${fileName} (${WIDTH}x${height})`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
