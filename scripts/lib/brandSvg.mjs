/**
 * Utilidades para componer imágenes a partir de los maestros vectoriales del logotipo
 * (assets/brand/*.svg). Los maestros llevan la tinta en BRAND_COLORS.charcoal y cada salida
 * la sustituye (negro sobre fondo claro, blanco sobre fondo oscuro); el cobre es fijo.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export const assetsDir = path.join(rootDir, 'assets');
export const brandDir = path.join(assetsDir, 'brand');

export const BRAND_COLORS = {
  /** Negro del logotipo y fondo del icono de la app. */
  charcoal: '#1B1B1D',
  white: '#FFFFFF',
};

export function loadBrandSvg(fileName) {
  const svg = fs.readFileSync(path.join(brandDir, fileName), 'utf8');
  const match = /<svg\b[^>]*\bviewBox="([^"]+)"[^>]*>([\s\S]*)<\/svg>/.exec(svg);
  if (!match) throw new Error(`assets/brand/${fileName} no tiene viewBox`);
  const [, , width, height] = match[1].trim().split(/\s+/).map(Number);
  return { viewBox: match[1], width, height, inner: match[2] };
}

/**
 * Coloca un maestro dentro de otro SVG con el ancho indicado.
 * `monochrome` pinta también la franja de cobre con la tinta (iconos temáticos de Android).
 */
export function placeBrandSvg(master, { x, y, width, ink, monochrome = false }) {
  const height = (width * master.height) / master.width;
  let inner = master.inner.replaceAll(`fill="${BRAND_COLORS.charcoal}"`, `fill="${ink}"`);
  if (monochrome) inner = inner.replaceAll('fill="url(#progline-copper)"', `fill="${ink}"`);
  return `<svg x="${x}" y="${y}" width="${width}" height="${height}" viewBox="${master.viewBox}">${inner}</svg>`;
}

/** Centra el maestro en un lienzo cuadrado; `offsetY` (fracción del lienzo) compensa el peso visual. */
export function centerBrandSvg(master, { canvas, widthRatio, offsetY = 0, ...options }) {
  const width = canvas * widthRatio;
  const height = (width * master.height) / master.width;
  return placeBrandSvg(master, {
    x: (canvas - width) / 2,
    y: (canvas - height) / 2 + canvas * offsetY,
    width,
    ...options,
  });
}

export function svgDocument(width, height, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`;
}

export function renderSvg(svg) {
  return sharp(Buffer.from(svg));
}
