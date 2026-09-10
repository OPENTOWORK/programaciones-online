import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';
import * as XLSX from 'xlsx';

import type { GymProduct, GymProductInput } from '@/lib/gymTypes';

export type GymShopDataFormat = 'csv' | 'excel';

export interface GymShopImportRow extends GymProductInput {
  productId?: string;
}

export interface GymShopExportRow {
  id_interno: string;
  nombre: string;
  descripcion: string;
  referencia: string;
  precio: string;
  stock: string;
  alerta_stock: string;
  unidad: string;
  activo: string;
  imagen_url: string;
  creado_en: string;
  actualizado_en: string;
}

export interface GymShopImportResult {
  rows: GymShopImportRow[];
  skipped: number;
}

const EXPORT_HEADERS = [
  'id_interno',
  'nombre',
  'descripcion',
  'referencia',
  'precio',
  'stock',
  'alerta_stock',
  'unidad',
  'activo',
  'imagen_url',
  'creado_en',
  'actualizado_en',
] as const;

const HEADER_ALIASES: Record<string, string> = {
  id_interno: 'productId',
  id: 'productId',
  product_id: 'productId',
  nombre: 'name',
  name: 'name',
  producto: 'name',
  descripcion: 'description',
  description: 'description',
  referencia: 'sku',
  sku: 'sku',
  codigo: 'sku',
  precio: 'price',
  price: 'price',
  stock: 'stock',
  inventario: 'stock',
  alerta_stock: 'lowStockAlert',
  low_stock_alert: 'lowStockAlert',
  stock_minimo: 'lowStockAlert',
  unidad: 'unit',
  unit: 'unit',
  activo: 'active',
  active: 'active',
  imagen_url: 'skip',
  image_url: 'skip',
  creado_en: 'skip',
  actualizado_en: 'skip',
};

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeMatch(value?: string) {
  return (value ?? '').trim().toLowerCase();
}

function escapeCsvCell(value: string) {
  if (/[",\n\r;]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatDateTime(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function parseMoney(value: unknown) {
  const normalized = String(value ?? '')
    .trim()
    .replace(/\s/g, '')
    .replace(',', '.');
  if (!normalized) return NaN;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function parseInteger(value: unknown, fallback = 0) {
  const normalized = String(value ?? '')
    .trim()
    .replace(/\s/g, '')
    .replace(',', '.');
  if (!normalized) return fallback;
  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseActive(value: unknown, fallback = true) {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (!normalized) return fallback;
  if (['1', 'true', 'si', 'sí', 'yes', 'activo', 'activa'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'inactivo', 'inactiva'].includes(normalized)) return false;
  return fallback;
}

function productToExportRow(product: GymProduct): GymShopExportRow {
  return {
    id_interno: product.id,
    nombre: product.name,
    descripcion: product.description ?? '',
    referencia: product.sku ?? '',
    precio: String(product.price),
    stock: String(product.stock),
    alerta_stock: String(product.lowStockAlert),
    unidad: product.unit,
    activo: product.active ? 'Sí' : 'No',
    imagen_url: product.imageUrl ?? '',
    creado_en: formatDateTime(product.createdAt),
    actualizado_en: formatDateTime(product.updatedAt),
  };
}

export function buildGymShopExportRows(products: GymProduct[]) {
  return [...products]
    .sort((left, right) => left.name.localeCompare(right.name, 'es', { sensitivity: 'base' }))
    .map(productToExportRow);
}

function rowsToMatrix(rows: GymShopExportRow[]) {
  return [EXPORT_HEADERS.slice(), ...rows.map((row) => EXPORT_HEADERS.map((key) => row[key]))];
}

export function shopRowsToCsv(rows: GymShopExportRow[]) {
  const matrix = rowsToMatrix(rows);
  return matrix.map((row) => row.map((cell) => escapeCsvCell(cell)).join(';')).join('\r\n');
}

export function shopRowsToExcelBuffer(rows: GymShopExportRow[]) {
  const worksheet = XLSX.utils.aoa_to_sheet(rowsToMatrix(rows));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');
  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer;
}

function mapRecordToImportRow(record: Record<string, unknown>): GymShopImportRow | null {
  const mapped: Partial<GymShopImportRow> = {};

  for (const [header, rawValue] of Object.entries(record)) {
    const field = HEADER_ALIASES[normalizeHeader(header)];
    if (!field || field === 'skip') continue;

    const value = String(rawValue ?? '').trim();
    if (!value) continue;

    switch (field) {
      case 'productId':
        mapped.productId = value;
        break;
      case 'name':
        mapped.name = value;
        break;
      case 'description':
        mapped.description = value;
        break;
      case 'sku':
        mapped.sku = value;
        break;
      case 'price':
        mapped.price = parseMoney(value);
        break;
      case 'stock':
        mapped.stock = parseInteger(value, 0);
        break;
      case 'lowStockAlert':
        mapped.lowStockAlert = parseInteger(value, 3);
        break;
      case 'unit':
        mapped.unit = value;
        break;
      case 'active':
        mapped.active = parseActive(value);
        break;
      default:
        break;
    }
  }

  if (!mapped.name?.trim()) return null;
  if (!Number.isFinite(mapped.price) || (mapped.price ?? 0) < 0) return null;

  return {
    name: mapped.name.trim(),
    description: mapped.description?.trim() || undefined,
    sku: mapped.sku?.trim() || undefined,
    price: mapped.price ?? 0,
    stock: mapped.stock ?? 0,
    lowStockAlert: mapped.lowStockAlert ?? 3,
    unit: mapped.unit?.trim() || 'ud',
    active: mapped.active ?? true,
    productId: mapped.productId,
  };
}

function parseDelimitedText(text: string): GymShopImportResult {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return { rows: [], skipped: 0 };

  const delimiter = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(delimiter).map((header) => normalizeHeader(header.replace(/^"|"$/g, '')));
  const rows: GymShopImportRow[] = [];
  let skipped = 0;

  for (const line of lines.slice(1)) {
    const cells = line
      .split(delimiter)
      .map((cell) => cell.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
    const record: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      record[header] = cells[index] ?? '';
    });
    const input = mapRecordToImportRow(record);
    if (input) rows.push(input);
    else skipped += 1;
  }

  return { rows, skipped };
}

function parseWorkbookBuffer(buffer: ArrayBuffer): GymShopImportResult {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return { rows: [], skipped: 0 };

  const sheet = workbook.Sheets[sheetName];
  const records = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
  const rows: GymShopImportRow[] = [];
  let skipped = 0;

  for (const record of records) {
    const input = mapRecordToImportRow(record);
    if (input) rows.push(input);
    else skipped += 1;
  }

  return { rows, skipped };
}

async function readPickerFile(uri: string, format: GymShopDataFormat) {
  const response = await fetch(uri);
  if (!response.ok) throw new Error('No se pudo leer el archivo seleccionado.');

  if (format === 'csv') {
    return parseDelimitedText(await response.text());
  }

  return parseWorkbookBuffer(await response.arrayBuffer());
}

function downloadOnWeb(filename: string, data: BlobPart, mimeType: string) {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return false;

  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return true;
}

export async function exportGymShopProducts(
  products: GymProduct[],
  format: GymShopDataFormat,
  fileStem = 'tienda-productos',
) {
  const rows = buildGymShopExportRows(products);
  const stamp = new Date().toISOString().slice(0, 10);

  if (format === 'csv') {
    const csv = `\uFEFF${shopRowsToCsv(rows)}`;
    if (!downloadOnWeb(`${fileStem}-${stamp}.csv`, csv, 'text/csv;charset=utf-8')) {
      return { error: 'La exportación CSV solo está disponible en la versión web por ahora.' };
    }
    return { data: rows.length };
  }

  const buffer = shopRowsToExcelBuffer(rows);
  if (
    !downloadOnWeb(
      `${fileStem}-${stamp}.xlsx`,
      buffer,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
  ) {
    return { error: 'La exportación Excel solo está disponible en la versión web por ahora.' };
  }
  return { data: rows.length };
}

export async function pickAndParseGymShopProducts(
  format: GymShopDataFormat,
): Promise<{ cancelled: true } | { error: string } | GymShopImportResult> {
  const mimeTypes =
    format === 'csv'
      ? ['text/csv', 'text/comma-separated-values', 'application/csv']
      : [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
        ];

  const result = await DocumentPicker.getDocumentAsync({
    type: mimeTypes,
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || !result.assets?.[0]) {
    return { cancelled: true };
  }

  const asset = result.assets[0];
  const lowerName = asset.name.toLowerCase();
  const resolvedFormat =
    format === 'csv' || lowerName.endsWith('.csv')
      ? 'csv'
      : lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')
        ? 'excel'
        : format;

  try {
    const parsed = await readPickerFile(asset.uri, resolvedFormat);
    if (parsed.rows.length === 0) {
      return {
        error:
          'El archivo no contiene productos válidos. Revisa que incluya al menos la columna nombre.',
      };
    }
    return parsed;
  } catch {
    return { error: 'No se pudo leer el archivo. Comprueba que sea un CSV o Excel válido.' };
  }
}

export function findProductImportMatch(products: GymProduct[], row: GymShopImportRow) {
  if (row.productId) {
    const byId = products.find((product) => product.id === row.productId);
    if (byId) return byId;
  }

  const sku = normalizeMatch(row.sku);
  if (sku) {
    const bySku = products.find((product) => normalizeMatch(product.sku) === sku);
    if (bySku) return bySku;
  }

  const name = normalizeMatch(row.name);
  if (name) {
    const byName = products.find((product) => normalizeMatch(product.name) === name);
    if (byName) return byName;
  }

  return null;
}
