import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, '..', 'assets');
const sourcePath = path.join(assetsDir, 'logo-source.png');
const outputPath = path.join(assetsDir, 'logo-watermark.png');

/** El texto de la marca ocupa la franja inferior: la marca de agua usa solo el emblema. */
const EMBLEM_HEIGHT_RATIO = 0.74;

/**
 * El logo llega sobre fondo negro. Para usarlo como marca de agua convertimos
 * la luminosidad en alfa: el negro desaparece y el brillo del metal se mantiene
 * con un degradado suave en los bordes.
 */
async function main() {
  const source = sharp(sourcePath);
  const { width, height } = await source.metadata();
  if (!width || !height) throw new Error('No se pudo leer el tamaño de logo-source.png');

  const { data, info } = await source
    .clone()
    .extract({ left: 0, top: 0, width, height: Math.round(height * EMBLEM_HEIGHT_RATIO) })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i + 3] = luminance < 12 ? 0 : Math.min(255, Math.round(luminance * 1.65));
  }

  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ threshold: 1 })
    .png()
    .toFile(outputPath);

  const result = await sharp(outputPath).metadata();
  console.log(`Marca de agua generada: assets/logo-watermark.png (${result.width}x${result.height})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
