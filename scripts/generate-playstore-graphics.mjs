import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, '..', 'assets');
const playstoreDir = path.join(assetsDir, 'playstore');
const sourcePath = path.join(assetsDir, 'logo-source.png');
const iconPath = path.join(assetsDir, 'icon.png');
const backgroundColor = '#0F1419';

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

async function createFeatureGraphic() {
  const width = 1024;
  const height = 500;
  const { data, info } = await sharp(sourcePath)
    .resize(420, 420, { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  applyLuminanceAlpha(data);
  const left = Math.floor((width - info.width) / 2);
  const top = Math.floor((height - info.height) / 2);
  const { r, g, b } = hexToRgb(backgroundColor);

  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r, g, b, alpha: 1 },
    },
  })
    .composite([
      {
        input: data,
        raw: { width: info.width, height: info.height, channels: 4 },
        left,
        top,
      },
    ])
    .png()
    .toFile(path.join(playstoreDir, 'feature-graphic.png'));
}

async function main() {
  fs.mkdirSync(playstoreDir, { recursive: true });
  await sharp(iconPath).resize(512, 512).png().toFile(path.join(playstoreDir, 'store-icon-512.png'));
  await createFeatureGraphic();
  console.log('Play Store graphics generated in assets/playstore/');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
