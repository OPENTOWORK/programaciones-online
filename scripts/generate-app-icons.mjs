import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, '..', 'assets');
const sourcePath = path.join(assetsDir, 'logo-source.png');
const backgroundColor = '#0F1419';
const canvasSize = 1024;
/** Logo occupies ~66% of the canvas so Android circular masks keep it visible. */
const safeLogoSize = 672;

function hexToRgb(hex) {
  const value = Number.parseInt(hex.slice(1), 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
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

/**
 * Keep logo/border pixels and punch out the dark canvas so adaptive layers
 * can sit on a transparent foreground (required by Android themed icons).
 */
async function extractLogoRgba(size) {
  const { data, info } = await sharp(sourcePath)
    .resize(size, size, { fit: 'cover' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const output = Buffer.from(data);
  for (let i = 0; i < output.length; i += 4) {
    const red = output[i];
    const green = output[i + 1];
    const blue = output[i + 2];
    const alpha = output[i + 3];
    if (alpha < 16) {
      output[i + 3] = 0;
      continue;
    }

    const luminance = 0.299 * red + 0.587 * green + 0.114 * blue;
    const isDarkCanvas = luminance < 48 && Math.max(red, green, blue) < 55;
    if (isDarkCanvas) {
      output[i + 3] = 0;
    }
  }

  return { data: output, width: info.width, height: info.height };
}

async function composeTransparentLogo(size = safeLogoSize) {
  const logo = await extractLogoRgba(size);
  const offset = Math.floor((canvasSize - size) / 2);

  return sharp({
    create: {
      width: canvasSize,
      height: canvasSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: logo.data,
        raw: { width: logo.width, height: logo.height, channels: 4 },
        left: offset,
        top: offset,
      },
    ])
    .png();
}

async function createForegroundIcon() {
  await (await composeTransparentLogo(safeLogoSize)).toFile(
    path.join(assetsDir, 'android-icon-foreground.png'),
  );
}

async function createMonochromeIcon() {
  const logo = await extractLogoRgba(safeLogoSize);
  const output = Buffer.alloc(canvasSize * canvasSize * 4, 0);
  const offset = Math.floor((canvasSize - safeLogoSize) / 2);

  for (let y = 0; y < logo.height; y += 1) {
    for (let x = 0; x < logo.width; x += 1) {
      const index = (y * logo.width + x) * 4;
      const alpha = logo.data[index + 3];
      if (alpha < 24) continue;

      const red = logo.data[index];
      const green = logo.data[index + 1];
      const blue = logo.data[index + 2];
      const luminance = 0.299 * red + 0.587 * green + 0.114 * blue;
      // Only the TP mark + bars — skip the outer coral frame (gets clipped by masks).
      const isCoralLogo = red > 110 && red > green * 1.05 && luminance > 70;
      const isGreyMark = blue >= red * 0.85 && luminance > 45 && luminance < 170;
      if (!isCoralLogo && !isGreyMark) continue;

      const target = ((offset + y) * canvasSize + (offset + x)) * 4;
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

async function main() {
  const fullIcon = sharp(sourcePath).resize(canvasSize, canvasSize, { fit: 'cover' });

  await fullIcon.clone().png().toFile(path.join(assetsDir, 'icon.png'));
  await createForegroundIcon();
  await createMonochromeIcon();
  await writeSolidBackground(path.join(assetsDir, 'android-icon-background.png'), canvasSize);
  await fullIcon.clone().resize(280, 280).png().toFile(path.join(assetsDir, 'splash-icon.png'));
  await fullIcon.clone().resize(48, 48).png().toFile(path.join(assetsDir, 'favicon.png'));
  await fullIcon.clone().resize(512, 512).png().toFile(path.join(assetsDir, 'app-logo.png'));

  console.log('App icons generated in assets/');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
