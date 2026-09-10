import 'dotenv/config';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

import { resolveDatabaseUrl } from './lib/annualWorkoutImport.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GYM_SLUG = 'hype';
const IMAGE_BUCKET = 'gym-product-images';
const MODELS = ['gpt-image-1.5', 'gpt-image-1'];
const PROJECT_REF = 'nsdurlikkuoxqobabixr';
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() || `https://${PROJECT_REF}.supabase.co`;

const themeBackgrounds = JSON.parse(
  readFileSync(join(__dirname, '..', 'data', 'gym-shop-image-themes.json'), 'utf8'),
);
const THEME_IDS = Object.keys(themeBackgrounds);

const CATEGORY_SHOT = {
  supplement: 'Bote o bote de suplemento deportivo premium, etiqueta limpia sin texto legible',
  apparel: 'Prenda deportiva doblada o en plano, textura visible, estilo ecommerce premium',
  equipment: 'Material de entrenamiento aislado, acabado realista y detallado',
  beverage: 'Botella o envase de bebida fría, gotas sutiles, estilo catálogo premium',
  accessory: 'Accesorio de gimnasio o lifestyle sport, composición centrada y elegante',
  service: 'Tarjeta o pase de servicio abstracto sin texto legible, estilo premium minimal',
};

function inferCategory(name) {
  const normalized = name.toLowerCase();
  if (normalized.includes('bono') || normalized.includes('drop in') || normalized.includes('staff')) {
    return 'service';
  }
  if (
    normalized.includes('batido') ||
    normalized.includes('agua') ||
    normalized.includes('red bull') ||
    normalized.includes('vitamin well') ||
    normalized.includes('barrita') ||
    normalized.includes('chocolatina')
  ) {
    return 'beverage';
  }
  if (
    normalized.includes('shirt') ||
    normalized.includes('t-shirt') ||
    normalized.includes('leggin') ||
    normalized.includes('legging') ||
    normalized.includes('sudadera') ||
    normalized.includes('crop top') ||
    normalized.includes('hybrid') ||
    normalized.includes('minimal') ||
    normalized.includes('short') ||
    normalized.includes('calcetines') ||
    normalized.includes('gorra') ||
    normalized.includes('gorro')
  ) {
    return 'apparel';
  }
  if (
    normalized.includes('comba') ||
    normalized.includes('calleras') ||
    normalized.includes('cinturon') ||
    normalized.includes('muñequeras') ||
    normalized.includes('munequeras') ||
    normalized.includes('foam roller') ||
    normalized.includes('lija')
  ) {
    return 'equipment';
  }
  if (
    normalized.includes('belevels') ||
    normalized.includes('qns') ||
    normalized.includes('vitamina') ||
    normalized.includes('creatina') ||
    normalized.includes('magnesio') ||
    normalized.includes('magnesium') ||
    normalized.includes('omega') ||
    normalized.includes('eaas') ||
    normalized.includes('carnitina') ||
    normalized.includes('crema') ||
    normalized.includes('protein') ||
    normalized.includes('colageno')
  ) {
    return 'supplement';
  }
  return 'accessory';
}

function buildPrompt(name, description, themeId) {
  const theme = themeBackgrounds[themeId] ?? themeBackgrounds.night;
  const category = inferCategory(name);
  const detail = description?.trim() ? ` Detalles del producto: ${description.trim()}.` : '';

  return [
    'Fotografía profesional de producto para ecommerce de gimnasio, fotorealista, 1:1.',
    `Producto: ${name.trim()}.${detail}`,
    CATEGORY_SHOT[category],
    `Fondo: ${theme.background}.`,
    'Iluminación de estudio suave, sombras realistas, producto centrado, nítido, composición limpia.',
    'Sin texto, sin logotipos inventados, sin marcas de agua, sin personas, sin manos.',
  ].join(' ');
}

function parseArg(name, fallback) {
  const match = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  return match?.split('=').slice(1).join('=') || fallback;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithOpenAI(apiKey, prompt) {
  let lastError = 'No se pudo generar la imagen.';

  for (const model of MODELS) {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt,
        n: 1,
        size: '1024x1024',
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      lastError = payload.error?.message ?? `OpenAI ${response.status}`;
      if (/model|not found|does not exist|unsupported/i.test(lastError)) continue;
      throw new Error(lastError);
    }

    const image = payload.data?.[0];
    if (image?.b64_json) {
      return { buffer: Buffer.from(image.b64_json, 'base64'), mimeType: 'image/png' };
    }

    if (image?.url) {
      const file = await fetch(image.url);
      if (!file.ok) throw new Error('No se pudo descargar la imagen generada.');
      const mimeType = file.headers.get('content-type') || 'image/png';
      return { buffer: Buffer.from(await file.arrayBuffer()), mimeType };
    }
  }

  throw new Error(lastError);
}

async function createStorageClient() {
  const email = parseArg('email', process.env.GYM_UPLOAD_EMAIL?.trim() || 'carlosgarciacano87@gmail.com');
  const password = parseArg('password', process.env.GYM_UPLOAD_PASSWORD?.trim() || '5191996Ca');
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!anonKey) throw new Error('Falta EXPO_PUBLIC_SUPABASE_ANON_KEY en .env');

  const supabase = createClient(SUPABASE_URL, anonKey, { auth: { persistSession: false } });
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    throw new Error(`No se pudo iniciar sesión para subir imágenes (${email}): ${error?.message ?? 'sin sesión'}`);
  }
  return supabase;
}

async function uploadToStorage(supabase, storagePath, buffer, mimeType) {
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(storagePath, buffer, {
    upsert: true,
    contentType: mimeType,
  });
  if (error) throw new Error(error.message);
}

async function removeFromStorage(supabase, storagePath) {
  await supabase.storage.from(IMAGE_BUCKET).remove([storagePath]);
}

async function migrateLegacyProductImages(client, gymId, supabase) {
  const legacy = await client.query(
    `select id, image_path, coalesce(image_themes, '{}') as image_themes
     from public.gym_products
     where gym_id = $1
       and image_path is not null
       and image_path ~* '\\.(png|jpe?g|webp)$'`,
    [gymId],
  );

  for (const row of legacy.rows) {
    const basePath = row.image_path.replace(/\.(png|jpe?g|webp)$/i, '');
    const themedPath = `${basePath}/night.png`;
    if (row.image_path !== themedPath) {
      try {
        const { data, error } = await supabase.storage.from(IMAGE_BUCKET).download(row.image_path);
        if (!error && data) {
          const buffer = Buffer.from(await data.arrayBuffer());
          await uploadToStorage(supabase, themedPath, buffer, 'image/png');
          await removeFromStorage(supabase, row.image_path);
        }
      } catch {
        // Si falla la copia, mantenemos la ruta legacy para night.
      }
    }

    const themes = new Set(Array.isArray(row.image_themes) ? row.image_themes : []);
    themes.add('night');
    await client.query(
      `update public.gym_products
       set image_path = $2,
           image_themes = $3::text[],
           updated_at = now()
       where id = $1`,
      [row.id, basePath, [...themes]],
    );
  }

  if (legacy.rows.length > 0) {
    console.log(`✓ ${legacy.rows.length} productos migrados a rutas por tema`);
  }
}

async function main() {
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (!openaiKey) throw new Error('Falta OPENAI_API_KEY en .env');

  const databaseUrl = resolveDatabaseUrl(PROJECT_REF);
  if (!databaseUrl) throw new Error('Falta DATABASE_URL o SUPABASE_DB_PASSWORD en .env');

  const allThemes = process.argv.includes('--all-themes');
  const themeArg = parseArg('theme', process.env.SHOP_IMAGE_THEME?.trim() || 'night');
  const skipThemes = new Set(
    parseArg('skip-themes', '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  );
  const themes = (allThemes ? THEME_IDS : [themeArg]).filter((item) => !skipThemes.has(item));
  const limit = Number.parseInt(parseArg('limit', '0'), 10) || null;
  const force = process.argv.includes('--force');
  const delayMs = Number.parseInt(parseArg('delay', '1500'), 10) || 1500;
  const supabase = await createStorageClient();

  const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    const gymRes = await client.query(
      `select id, name from public.gyms
       where slug = $1 or lower(email) = 'info@trainwithhype.com'
       order by case when slug = $1 then 0 else 1 end
       limit 1`,
      [GYM_SLUG],
    );
    const gym = gymRes.rows[0];
    if (!gym) throw new Error('No existe el gimnasio Hype');

    await migrateLegacyProductImages(client, gym.id, supabase);

    let generated = 0;
    const failed = [];

    for (const themeId of themes) {
      const productsRes = await client.query(
        `select id, name, description, image_path, coalesce(image_themes, '{}') as image_themes
         from public.gym_products
         where gym_id = $1
           and active = true
           and (
             $2::boolean
             or image_path is null
             or image_path like 'placeholder:%'
             or not ($3 = any(coalesce(image_themes, '{}')))
           )
         order by name
         ${limit ? 'limit $4' : ''}`,
        limit ? [gym.id, force, themeId, limit] : [gym.id, force, themeId],
      );

      const products = productsRes.rows;
      if (products.length === 0) {
        console.log(`· Tema ${themeId}: sin pendientes`);
        continue;
      }

      console.log(`Generando ${products.length} imágenes para ${gym.name} (tema: ${themeId})…`);

      for (const product of products) {
        const label = `${generated + failed.length + 1} ${product.name} · ${themeId}`;
        process.stdout.write(`→ ${label}… `);

        try {
          const prompt = buildPrompt(product.name, product.description, themeId);
          const { buffer, mimeType } = await generateWithOpenAI(openaiKey, prompt);
          const basePath = product.image_path?.startsWith('placeholder:')
            ? `${gym.id}/${product.id}`
            : (product.image_path?.replace(/\.(png|jpe?g|webp)$/i, '') ?? `${gym.id}/${product.id}`);
          const storagePath = `${basePath}/${themeId}.png`;

          await uploadToStorage(supabase, storagePath, buffer, mimeType);

          const currentThemes = new Set(Array.isArray(product.image_themes) ? product.image_themes : []);
          currentThemes.add(themeId);
          await client.query(
            `update public.gym_products
             set image_path = $2,
                 image_themes = (
                   select coalesce(array_agg(distinct theme), '{}')
                   from unnest(coalesce(public.gym_products.image_themes, '{}') || $3::text[]) as theme
                 ),
                 updated_at = now()
             where id = $1`,
            [product.id, basePath, [themeId]],
          );

          product.image_path = basePath;
          product.image_themes = [...currentThemes];
          generated += 1;
          console.log('ok');
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          failed.push({ name: product.name, themeId, message });
          console.log(`error (${message})`);
        }

        if (delayMs > 0) await sleep(delayMs);
      }
    }

    console.log(`✓ ${generated} imágenes generadas${failed.length ? `, ${failed.length} fallos` : ''}.`);
    if (failed.length) {
      for (const item of failed) {
        console.log(`  · ${item.name} (${item.themeId}): ${item.message}`);
      }
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
