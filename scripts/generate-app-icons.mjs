import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, '..', 'assets');
const sourcePath = path.join(assetsDir, 'logo-source.png');
const backgroundColor = '#0F1419';
const canvasSize = 1024;
/** Emblem occupies ~65% of the canvas so Android circular masks keep it visible. */
const emblemMaxSize = 668;
/** The wordmark sits below the emblem in logo-source.png. */
const EMBLEM_HEIGHT_RATIO = 0.74;

function hexToRgb(hex) {
  const value = Number.parseInt(hex.slice(1), 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function applyLuminanceAlpha(data) {
  for (let i = 0; i < data.length; i += 4) {
    const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i + 3] = luminance < 12 ? 0 : Math.min(255, Math.round(luminance * 1.65));
  }
}

async function getSourceMetadata() {
  const metadata = await sharp(sourcePath).metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error('No se pudo leer el tamaño de logo-source.png');
  }
  return metadata;
}

async function getEmblemRgba(maxSize) {
  const { width, height } = await getSourceMetadata();
  const emblemHeight = Math.round(height * EMBLEM_HEIGHT_RATIO);

  const { data, info } = await sharp(sourcePath)
    .extract({ left: 0, top: 0, width, height: emblemHeight })
    .resize(maxSize, maxSize, { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  applyLuminanceAlpha(data);
  return { data, width: info.width, height: info.height };
}

async function getFullLogoRgba(maxWidth) {
  const { data, info } = await sharp(sourcePath)
    .resize(maxWidth, maxWidth, { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  applyLuminanceAlpha(data);
  return { data, width: info.width, height: info.height };
}

async function composeEmblemOnCanvas({ withBackground, emblemMax = emblemMaxSize }) {
  const emblem = await getEmblemRgba(emblemMax);
  const left = Math.floor((canvasSize - emblem.width) / 2);
  const top = Math.floor((canvasSize - emblem.height) / 2);
  const background = withBackground
    ? { ...hexToRgb(backgroundColor), alpha: 1 }
    : { r: 0, g: 0, b: 0, alpha: 0 };

  return sharp({
    create: {
      width: canvasSize,
      height: canvasSize,
      channels: 4,
      background,
    },
  }).composite([
    {
      input: emblem.data,
      raw: { width: emblem.width, height: emblem.height, channels: 4 },
      left,
      top,
    },
  ]);
}

async function createMonochromeIcon() {
  const emblem = await getEmblemRgba(emblemMaxSize);
  const output = Buffer.alloc(canvasSize * canvasSize * 4, 0);
  const left = Math.floor((canvasSize - emblem.width) / 2);
  const top = Math.floor((canvasSize - emblem.height) / 2);

  for (let y = 0; y < emblem.height; y += 1) {
    for (let x = 0; x < emblem.width; x += 1) {
      const index = (y * emblem.width + x) * 4;
      const alpha = emblem.data[index + 3];
      if (alpha < 24) continue;

      const target = ((top + y) * canvasSize + (left + x)) * 4;
      output[target] = 255;
      output[target + 1] = 255;
      output[target + 2] = 255;
      output[target + 3] = 255;
    }
  }

  await sharp(output, {
    raw: {
      width: canvasSize,
      height: canvasSize,
      channels: 4,
    },
  })
    .png()
    .toFile(path.join(assetsDir, 'android-icon-monochrome.png'));
}

async function writeSolidBackground(outputPath, size) {
  const { r, g, b } = hexToRgb(backgroundColor);
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: { r, g, b },
    },
  })
    .png()
    .toFile(outputPath);
}

async function createSplashIcon() {
  const splashSize = 512;
  const logo = await getFullLogoRgba(splashSize);
  const left = Math.floor((splashSize - logo.width) / 2);
  const top = Math.floor((splashSize - logo.height) / 2);

  await sharp({
    create: {
      width: splashSize,
      height: splashSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: logo.data,
        raw: { width: logo.width, height: logo.height, channels: 4 },
        left,
        top,
      },
    ])
    .png()
    .toFile(path.join(assetsDir, 'splash-icon.png'));
}

/** App Store rechaza iconos con canal alfa, así que este se aplana sobre el fondo de marca. */
async function createIosIcon() {
  const { r, g, b } = hexToRgb(backgroundColor);

  await sharp(path.join(assetsDir, 'icon.png'))
    .flatten({ background: { r, g, b } })
    .removeAlpha()
    .png()
    .toFile(path.join(assetsDir, 'ios-icon.png'));
}

async function syncAppLogo() {
  const { height } = await getSourceMetadata();
  const targetHeight = Math.min(height, 1024);

  await sharp(sourcePath)
    .resize({ height: targetHeight, withoutEnlargement: true })
    .png()
    .toFile(path.join(assetsDir, 'app-logo.png'));
}

async function main() {
  await (await composeEmblemOnCanvas({ withBackground: true })).png().toFile(path.join(assetsDir, 'icon.png'));
  await (await composeEmblemOnCanvas({ withBackground: false })).png().toFile(
    path.join(assetsDir, 'android-icon-foreground.png'),
  );
  await createMonochromeIcon();
  await writeSolidBackground(path.join(assetsDir, 'android-icon-background.png'), canvasSize);
  await createSplashIcon();
  await createIosIcon();
  await sharp(path.join(assetsDir, 'icon.png')).resize(48, 48).png().toFile(path.join(assetsDir, 'favicon.png'));
  await syncAppLogo();

  console.log('App icons generated in assets/');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
