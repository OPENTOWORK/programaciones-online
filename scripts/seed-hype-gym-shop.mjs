import 'dotenv/config';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

import { resolveDatabaseUrl } from './lib/annualWorkoutImport.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GYM_SLUG = 'hype';

const products = JSON.parse(
  readFileSync(join(__dirname, '..', 'data', 'hype-gym-shop-products.json'), 'utf8'),
);

function normalizeName(name) {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function skuFromName(name) {
  return normalizeName(name).replace(/\s+/g, '-').slice(0, 48);
}

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

async function main() {
  const databaseUrl = resolveDatabaseUrl('nsdurlikkuoxqobabixr');
  if (!databaseUrl) {
    throw new Error('Falta DATABASE_URL o SUPABASE_DB_PASSWORD en .env');
  }

  const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    await client.query('begin');

    const gymRes = await client.query(
      `select id, name from public.gyms
       where slug = $1 or lower(email) = 'info@trainwithhype.com'
       order by case when slug = $1 then 0 else 1 end
       limit 1`,
      [GYM_SLUG],
    );
    const gym = gymRes.rows[0];
    if (!gym) throw new Error('No existe el gimnasio Hype');

    const existingRes = await client.query(
      `select id, name, sku, stock, image_path
       from public.gym_products
       where gym_id = $1`,
      [gym.id],
    );
    const existing = existingRes.rows;

    let created = 0;
    let updated = 0;

    for (const item of products) {
      const sku = skuFromName(item.name);
      const stock = Math.max(0, Number(item.stock) || 0);
      const price = Number(item.price) || 0;
      const match =
        existing.find((row) => row.sku && row.sku.toLowerCase() === sku) ??
        existing.find((row) => normalizeName(row.name) === normalizeName(item.name));

      if (match) {
        await client.query(
          `update public.gym_products
           set name = $2,
               sku = $3,
               price = $4,
               active = true,
               updated_at = now()
           where id = $1`,
          [match.id, item.name, sku, price],
        );

        if (stock !== Number(match.stock)) {
          await client.query(
            `insert into public.gym_product_movements
               (gym_id, product_id, kind, quantity, note)
             values ($1, $2, 'adjustment', $3, 'Catálogo Hype')`,
            [gym.id, match.id, stock],
          );
        }

        updated += 1;
        continue;
      }

      const inserted = await client.query(
        `insert into public.gym_products
           (gym_id, name, sku, price, stock, low_stock_alert, unit, active, image_path)
         values ($1, $2, $3, $4, $5, 3, 'ud', true, $6)
         on conflict (gym_id, sku) where sku is not null and btrim(sku) <> ''
         do update set
           name = excluded.name,
           price = excluded.price,
           active = true,
           image_path = coalesce(public.gym_products.image_path, excluded.image_path),
           updated_at = now()
         returning id, stock`,
        [gym.id, item.name, sku, price, stock, null],
      );

      const row = inserted.rows[0];
      if (Number(row.stock) !== stock) {
        await client.query(
          `insert into public.gym_product_movements
             (gym_id, product_id, kind, quantity, note)
           values ($1, $2, 'adjustment', $3, 'Catálogo Hype')`,
          [gym.id, row.id, stock],
        );
      }

      existing.push({
        id: row.id,
        name: item.name,
        sku,
        stock,
        image_path: null,
      });
      created += 1;
    }

    await client.query('commit');
    console.log(`✓ Tienda Hype: ${created} productos creados, ${updated} actualizados (${products.length} en catálogo)`);
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Error:', error.message ?? error);
  process.exit(1);
});
