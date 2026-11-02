/**
 * Genera iconos, splash, favicon y logo interno a partir de los maestros vectoriales
 * de assets/brand (logotipo TP · PROGLINE).
 *
 * Uso: node scripts/generate-app-icons.mjs
 */
import path from 'node:path';

import sharp from 'sharp';

import {
  BRAND_COLORS,
  assetsDir,
  centerBrandSvg,
  loadBrandSvg,
  placeBrandSvg,
  renderSvg,
  svgDocument,
} from './lib/brandSvg.mjs';

const CANVAS = 1024;
const mark = loadBrandSvg('progline-mark.svg');
const compactLogo = loadBrandSvg('progline-logo-compact.svg');

/** Proporciones del icono de referencia: la TP ocupa ~3/4 del ancho, un pelo por debajo del centro. */
const ICON_MARK_WIDTH = 0.76;
const BADGE_MARK_WIDTH = 0.78;
const BADGE_CORNER_RADIUS = 0.165;
const OPTICAL_OFFSET_Y = 0.015;
/** Android recorta el icono adaptativo con máscaras de hasta 66/108 del lienzo (círculo seguro). */
const ADAPTIVE_MARK_WIDTH = 0.48;
const ADAPTIVE_SAFE_RADIUS = (66 / 108 / 2) * CANVAS;

const output = (name) => path.join(assetsDir, name);

function fullBleedIconSvg(size) {
  return svgDocument(
    size,
    size,
    `<rect width="${size}" height="${size}" fill="${BRAND_COLORS.charcoal}"/>` +
      centerBrandSvg(mark, { canvas: size, widthRatio: ICON_MARK_WIDTH, offsetY: OPTICAL_OFFSET_Y, ink: BRAND_COLORS.white }),
  );
}

/** Icono con esquinas redondeadas ya recortadas (logo dentro de la app y favicon). */
function badgeSvg(size) {
  return svgDocument(
    size,
    size,
    `<rect width="${size}" height="${size}" rx="${size * BADGE_CORNER_RADIUS}" fill="${BRAND_COLORS.charcoal}"/>` +
      centerBrandSvg(mark, { canvas: size, widthRatio: BADGE_MARK_WIDTH, offsetY: OPTICAL_OFFSET_Y, ink: BRAND_COLORS.white }),
  );
}

function adaptiveLayerSvg({ monochrome }) {
  return svgDocument(
    CANVAS,
    CANVAS,
    centerBrandSvg(mark, {
      canvas: CANVAS,
      widthRatio: ADAPTIVE_MARK_WIDTH,
      offsetY: OPTICAL_OFFSET_Y,
      ink: BRAND_COLORS.white,
      monochrome,
    }),
  );
}

async function assertInsideAdaptiveSafeZone(filePath) {
  const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const center = info.width / 2;
  let maxDistance = 0;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      if (data[(y * info.width + x) * 4 + 3] < 8) continue;
      maxDistance = Math.max(maxDistance, Math.hypot(x + 0.5 - center, y + 0.5 - center));
    }
  }
  if (maxDistance > ADAPTIVE_SAFE_RADIUS) {
    throw new Error(
      `${path.basename(filePath)} se sale de la zona segura de Android (${maxDistance.toFixed(0)} px > ${ADAPTIVE_SAFE_RADIUS.toFixed(0)} px)`,
    );
  }
}

/** App Store rechaza iconos con canal alfa: los iconos a sangre se guardan sin transparencia. */
async function writeOpaque(svg, filePath) {
  await renderSvg(svg).flatten({ background: BRAND_COLORS.charcoal }).removeAlpha().png().toFile(filePath);
}

async function main() {
  await writeOpaque(fullBleedIconSvg(CANVAS), output('icon.png'));
  await writeOpaque(fullBleedIconSvg(CANVAS), output('ios-icon.png'));

  await renderSvg(adaptiveLayerSvg({ monochrome: false })).png().toFile(output('android-icon-foreground.png'));
  await renderSvg(adaptiveLayerSvg({ monochrome: true })).png().toFile(output('android-icon-monochrome.png'));
  await assertInsideAdaptiveSafeZone(output('android-icon-foreground.png'));
  await sharp({ create: { width: CANVAS, height: CANVAS, channels: 3, background: BRAND_COLORS.charcoal } })
    .png()
    .toFile(output('android-icon-background.png'));

  // Splash: marca + PROGLINE en blanco; app.json fija el ancho con `imageWidth`.
  const splashWidth = CANVAS;
  const splashHeight = Math.round((splashWidth * compactLogo.height) / compactLogo.width);
  await renderSvg(
    svgDocument(
      splashWidth,
      splashHeight,
      placeBrandSvg(compactLogo, { x: 0, y: 0, width: splashWidth, ink: BRAND_COLORS.white }),
    ),
  )
    .png()
    .toFile(output('splash-icon.png'));

  const badge = await renderSvg(badgeSvg(512)).png().toBuffer();
  await sharp(badge).png().toFile(output('app-logo.png'));
  await sharp(badge).resize(48, 48, { kernel: 'lanczos3' }).png().toFile(output('favicon.png'));

  console.log('Iconos generados en assets/ desde assets/brand/');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
