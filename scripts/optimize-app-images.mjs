/**
 * Recomprime las imágenes que se empaquetan en la app (web y nativo) sin cambiar
 * sus dimensiones ni su formato: mismo aspecto, muchos menos bytes.
 *
 * No toca los iconos ni las capturas de tienda (assets/icon.png, splash, playstore…)
 * porque los generan otros scripts y los consumen las builds de tienda.
 *
 * Uso: node scripts/optimize-app-images.mjs [--dry]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assetsDir = path.join(rootDir, 'assets');
const dryRun = process.argv.includes('--dry');

/** Ficheros sueltos que la app importa con `require`. */
const SINGLE_FILES = [
  'home-hero-banner.jpg',
  'home-hero.jpg',
  'logo-watermark.png',
  'logo-watermark-on-light.png',
  'app-logo.png',
];

/** Carpetas cuyas imágenes se usan como portadas dentro de la app. */
const DIRECTORIES = ['catalog', 'gyms'];

const JPEG_OPTIONS = { quality: 82, mozjpeg: true, chromaSubsampling: '4:2:0' };
const PNG_OPTIONS = { palette: true, quality: 90, effort: 10, compressionLevel: 9 };

function collectTargets() {
  const targets = [];

  for (const name of SINGLE_FILES) {
    const filePath = path.join(assetsDir, name);
    if (fs.existsSync(filePath)) targets.push(filePath);
  }

  for (const dir of DIRECTORIES) {
    const dirPath = path.join(assetsDir, dir);
    if (!fs.existsSync(dirPath)) continue;
    for (const name of fs.readdirSync(dirPath)) {
      const filePath = path.join(dirPath, name);
      if (fs.statSync(filePath).isFile()) targets.push(filePath);
    }
  }

  return targets;
}

async function optimize(filePath) {
  const original = fs.readFileSync(filePath);
  const { format } = await sharp(original).metadata();
  if (format !== 'jpeg' && format !== 'png') return null;

  // La extensión manda: algunos .jpg estaban guardados como PNG y pesaban 20 veces más.
  const wantsJpeg = /\.jpe?g$/i.test(filePath);
  const pipeline = sharp(original);
  const optimized = await (wantsJpeg
    ? pipeline.jpeg(JPEG_OPTIONS)
    : pipeline.png(PNG_OPTIONS)
  ).toBuffer();

  if (optimized.length >= original.length) return null;
  if (!dryRun) fs.writeFileSync(filePath, optimized);

  return { before: original.length, after: optimized.length };
}

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

let totalBefore = 0;
let totalAfter = 0;

for (const filePath of collectTargets()) {
  const result = await optimize(filePath);
  const relative = path.relative(rootDir, filePath);
  if (!result) {
    console.log(`= ${relative} (ya optimizado)`);
    continue;
  }
  totalBefore += result.before;
  totalAfter += result.after;
  console.log(`✔ ${relative}: ${kb(result.before)} → ${kb(result.after)}`);
}

console.log(
  `\n${dryRun ? '[dry-run] ' : ''}Total: ${kb(totalBefore)} → ${kb(totalAfter)} ` +
    `(${((1 - totalAfter / (totalBefore || 1)) * 100).toFixed(0)} % menos)`,
);
