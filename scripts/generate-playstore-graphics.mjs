/**
 * Gráficos de la ficha de Google Play a partir de los maestros de assets/brand.
 * Requiere haber generado antes assets/icon.png (scripts/generate-app-icons.mjs).
 *
 * Uso: node scripts/generate-playstore-graphics.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

import sharp from 'sharp';

import { BRAND_COLORS, assetsDir, loadBrandSvg, placeBrandSvg, renderSvg, svgDocument } from './lib/brandSvg.mjs';

const playstoreDir = path.join(assetsDir, 'playstore');
const iconPath = path.join(assetsDir, 'icon.png');
const logo = loadBrandSvg('progline-logo.svg');

async function createFeatureGraphic() {
  const width = 1024;
  const height = 500;
  const logoHeight = 340;
  const logoWidth = (logoHeight * logo.width) / logo.height;

  const svg = svgDocument(
    width,
    height,
    `<rect width="${width}" height="${height}" fill="${BRAND_COLORS.charcoal}"/>` +
      placeBrandSvg(logo, {
        x: (width - logoWidth) / 2,
        y: (height - logoHeight) / 2,
        width: logoWidth,
        ink: BRAND_COLORS.white,
      }),
  );

  await renderSvg(svg).removeAlpha().png().toFile(path.join(playstoreDir, 'feature-graphic.png'));
}

async function main() {
  fs.mkdirSync(playstoreDir, { recursive: true });
  await sharp(iconPath).resize(512, 512, { kernel: 'lanczos3' }).png().toFile(path.join(playstoreDir, 'store-icon-512.png'));
  await createFeatureGraphic();
  console.log('Gráficos de Play Store generados en assets/playstore/');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
