import 'dotenv/config';
import pg from 'pg';
import { resolveDatabaseUrl } from '../scripts/lib/annualWorkoutImport.mjs';

const client = new pg.Client({
  connectionString: resolveDatabaseUrl('nsdurlikkuoxqobabixr'),
  ssl: { rejectUnauthorized: false },
});
await client.connect();
const res = await client.query(`
  select
    count(*)::int as total,
    count(*) filter (
      where 'night' = any(coalesce(image_themes, '{}'))
        or (image_path is not null and image_path ~* '\\.(png|jpe?g|webp)$')
    )::int as night,
    count(*) filter (where 'day' = any(coalesce(image_themes, '{}')))::int as day,
    count(*) filter (where 'navy' = any(coalesce(image_themes, '{}')))::int as navy,
    count(*) filter (where 'forest' = any(coalesce(image_themes, '{}')))::int as forest,
    count(*) filter (where 'sand' = any(coalesce(image_themes, '{}')))::int as sand,
    count(*) filter (where 'slate' = any(coalesce(image_themes, '{}')))::int as slate,
    count(*) filter (where 'teal' = any(coalesce(image_themes, '{}')))::int as teal,
    count(*) filter (where 'wine' = any(coalesce(image_themes, '{}')))::int as wine,
    count(*) filter (where 'lavender' = any(coalesce(image_themes, '{}')))::int as lavender,
    count(*) filter (where 'olive' = any(coalesce(image_themes, '{}')))::int as olive,
    count(*) filter (where 'rose' = any(coalesce(image_themes, '{}')))::int as rose
  from public.gym_products
  where gym_id = (select id from public.gyms where slug = 'hype' limit 1)
    and active = true
`);
console.log(res.rows[0]);
await client.end();
