/**
 * Reduce el bucket gym-product-images: purga variantes huérfanas y recomprime PNG de catálogo.
 *
 * Uso:
 *   node scripts/optimize-gym-product-images.mjs --dry-run
 *   node scripts/optimize-gym-product-images.mjs --apply
 *   node scripts/optimize-gym-product-images.mjs --apply --purge-only
 *   node scripts/optimize-gym-product-images.mjs --apply --compress-only
 *
 * Requiere GYM_UPLOAD_EMAIL y GYM_UPLOAD_PASSWORD (usuario con permiso de gestión del gym).
 */
import 'dotenv/config';
import sharp from 'sharp';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

import { resolveDatabaseUrl } from './lib/annualWorkoutImport.mjs';

const PROJECT_REF = 'nsdurlikkuoxqobabixr';
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() || `https://${PROJECT_REF}.supabase.co`;
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
const BUCKET = 'gym-product-images';
const THEME_IDS = ['day', 'night', 'navy', 'forest', 'sand', 'slate', 'teal', 'wine', 'lavender', 'olive', 'rose'];
const THEME_SEGMENT = new RegExp(`/(${THEME_IDS.join('|')})$`);
const MAX_EDGE = 640;
const MIN_BYTES_BEFORE_COMPRESS = 280 * 1024;
const MIN_SAVED_BYTES = 40 * 1024;

const apply = process.argv.includes('--apply');
const dryRun = process.argv.includes('--dry-run') || !apply;
const purgeOnly = process.argv.includes('--purge-only');
const compressOnly = process.argv.includes('--compress-only');
const doPurge = !compressOnly;
const doCompress = !purgeOnly;

if (!ANON_KEY) {
  console.error('Falta EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const dbUrl = resolveDatabaseUrl(PROJECT_REF);
if (!dbUrl) {
  console.error('Falta DATABASE_URL o SUPABASE_DB_PASSWORD');
  process.exit(1);
}

function normalizeBase(imagePath) {
  if (!imagePath) return null;
  if (
    imagePath.startsWith('placeholder:') ||
    imagePath.startsWith('data:') ||
    imagePath.startsWith('http')
  ) {
    return null;
  }
  let base = imagePath.replace(/\.(png|jpe?g|webp)$/i, '');
  base = base.replace(THEME_SEGMENT, '');
  return base;
}

function buildNeededPaths(products) {
  const needed = new Set();
  for (const row of products) {
    const base = normalizeBase(row.image_path);
    if (!base) continue;
    const themes = Array.isArray(row.image_themes)
      ? row.image_themes.filter((t) => THEME_IDS.includes(t))
      : [];

    if (themes.length === 0) {
      needed.add(`${base}/night.png`);
      continue;
    }

    for (const theme of themes) {
      needed.add(`${base}/${theme}.png`);
    }

    if (themes.includes('night') && row.image_path && /\.(png|jpe?g|webp)$/i.test(row.image_path)) {
      needed.add(row.image_path);
    }
  }
  return needed;
}

async function createStorageClient() {
  const email = process.env.GYM_UPLOAD_EMAIL?.trim();
  const password = process.env.GYM_UPLOAD_PASSWORD?.trim();
  if (!email || !password) {
    throw new Error(
      'Faltan GYM_UPLOAD_EMAIL y GYM_UPLOAD_PASSWORD en .env (administrador o owner/manager del gym con can_manage_gym).',
    );
  }

  const supabase = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    throw new Error(`No se pudo iniciar sesión (${email}): ${error?.message ?? 'sin sesión'}`);
  }

  const gymId = process.env.GYM_ID?.trim() || '86a22776-5438-4114-b321-af21e48bc80b';
  const { data: canManage, error: rpcError } = await supabase.rpc('can_manage_gym', { target_gym: gymId });
  if (rpcError || !canManage) {
    throw new Error(
      `La cuenta ${email} no puede gestionar el gym ${gymId}. Usa un administrador o owner (GYM_UPLOAD_EMAIL).`,
    );
  }

  return supabase;
}

async function compressPng(buffer) {
  return sharp(buffer)
    .resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true, quality: 92, effort: 10 })
    .toBuffer();
}

const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
await client.connect();

const productsRes = await client.query(
  `select id, image_path, image_themes from gym_products where image_path is not null`,
);
const needed = buildNeededPaths(productsRes.rows);

const objectsRes = await client.query(
  `select name, (metadata->>'size')::bigint as bytes from storage.objects where bucket_id = $1 order by name`,
  [BUCKET],
);

const orphans = objectsRes.rows.filter((row) => !needed.has(row.name));
const toCompress = objectsRes.rows.filter((row) => needed.has(row.name));

let orphanBytes = orphans.reduce((sum, row) => sum + Number(row.bytes ?? 0), 0);
console.log(`Objetos referenciados: ${toCompress.length}`);
console.log(`Huérfanos a purgar: ${orphans.length} (${(orphanBytes / 1024 / 1024).toFixed(1)} MB)`);

if (dryRun) {
  const heavy = toCompress.filter((row) => Number(row.bytes ?? 0) >= MIN_BYTES_BEFORE_COMPRESS);
  console.log(`PNG a recomprimir (>= ${MIN_BYTES_BEFORE_COMPRESS / 1024} KB): ${heavy.length}`);
  console.log('\nModo vista previa. Usa --apply para ejecutar.');
  await client.end();
  process.exit(0);
}

const supabase = await createStorageClient();

if (doPurge && orphans.length > 0) {
  for (let i = 0; i < orphans.length; i += 100) {
    const batch = orphans.slice(i, i + 100).map((row) => row.name);
    const { error } = await supabase.storage.from(BUCKET).remove(batch);
    if (error) throw new Error(`Purge: ${error.message}`);
    console.log(`Purgados ${Math.min(i + batch.length, orphans.length)}/${orphans.length}`);
  }
}

let compressed = 0;
let savedBytes = 0;
let skipped = 0;

if (doCompress) {
  const publicBase = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
  for (let index = 0; index < toCompress.length; index++) {
    const row = toCompress[index];
    const name = row.name;
    const before = Number(row.bytes ?? 0);
    if (before < MIN_BYTES_BEFORE_COMPRESS) {
      skipped++;
      continue;
    }

    const response = await fetch(publicBase + name);
    if (!response.ok) {
      console.warn(`No se pudo descargar ${name}: ${response.status}`);
      continue;
    }
    const original = Buffer.from(await response.arrayBuffer());
    const optimized = await compressPng(original);
    if (before - optimized.length < MIN_SAVED_BYTES) {
      skipped++;
      continue;
    }

    const { error } = await supabase.storage.from(BUCKET).upload(name, optimized, {
      upsert: true,
      contentType: 'image/png',
    });
    if (error) {
      console.warn(`Upload ${name}: ${error.message}`);
      continue;
    }

    compressed++;
    savedBytes += before - optimized.length;
    if (compressed % 25 === 0 || index === toCompress.length - 1) {
      console.log(
        `Comprimidos ${compressed} · ahorrados ${(savedBytes / 1024 / 1024).toFixed(1)} MB · ${index + 1}/${toCompress.length}`,
      );
    }
  }

  if (compressed > 0) {
    await client.query(`update gym_products set updated_at = now() where image_path is not null`);
  }
}

const after = await client.query(
  `select count(*)::int as files, coalesce(sum((metadata->>'size')::bigint), 0)::bigint as bytes
   from storage.objects where bucket_id = $1`,
  [BUCKET],
);

console.log('\nResumen:');
console.log(`  Comprimidos: ${compressed} (omitidos: ${skipped})`);
console.log(`  Ahorro estimado: ${(savedBytes / 1024 / 1024).toFixed(1)} MB`);
console.log(
  `  Bucket ahora: ${after.rows[0].files} ficheros, ${(Number(after.rows[0].bytes) / 1024 / 1024).toFixed(1)} MB`,
);

await supabase.auth.signOut();
await client.end();
