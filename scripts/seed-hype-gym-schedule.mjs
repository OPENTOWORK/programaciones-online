import 'dotenv/config';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

import { resolveDatabaseUrl } from './lib/annualWorkoutImport.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEEKS = 16;
const GYM_SLUG = 'hype';

const schedule = JSON.parse(
  readFileSync(join(__dirname, '..', 'data', 'hype-gym-weekly-schedule.json'), 'utf8'),
);

function mondayOnOrBefore(date) {
  const copy = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const weekday = copy.getUTCDay();
  copy.setUTCDate(copy.getUTCDate() + (weekday === 0 ? -6 : 1 - weekday));
  return copy;
}

function addUtcDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function ymd(date) {
  return date.toISOString().slice(0, 10);
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

    const typeIds = new Map();
    for (const type of schedule.classTypes) {
      const existing = await client.query(
        `select id from public.gym_class_types
         where gym_id = $1 and lower(name) = lower($2)
         limit 1`,
        [gym.id, type.name],
      );

      if (existing.rows[0]) {
        await client.query(
          `update public.gym_class_types
           set color = $2, duration_minutes = $3, capacity = $4, description = $5, active = true, updated_at = now()
           where id = $1`,
          [existing.rows[0].id, type.color, type.durationMinutes, type.capacity, type.description],
        );
        typeIds.set(type.name, existing.rows[0].id);
      } else {
        const inserted = await client.query(
          `insert into public.gym_class_types
             (gym_id, name, description, duration_minutes, capacity, color, active)
           values ($1, $2, $3, $4, $5, $6, true)
           returning id`,
          [gym.id, type.name, type.description, type.durationMinutes, type.capacity, type.color],
        );
        typeIds.set(type.name, inserted.rows[0].id);
      }
    }

    const weekStart = mondayOnOrBefore(new Date());
    let inserted = 0;
    let skipped = 0;

    for (let week = 0; week < WEEKS; week += 1) {
      const monday = addUtcDays(weekStart, week * 7);

      for (const slot of schedule.slots) {
        const typeId = typeIds.get(slot.type);
        if (!typeId) throw new Error(`Falta el tipo ${slot.type}`);

        const date = ymd(addUtcDays(monday, slot.day));
        const result = await client.query(
          `insert into public.gym_classes
             (gym_id, class_type_id, start_at, end_at, capacity, status)
           select $1, $2,
             ($3::date + $4::time) at time zone 'Europe/Madrid',
             ($3::date + $5::time) at time zone 'Europe/Madrid',
             $6, 'scheduled'
           where not exists (
             select 1 from public.gym_classes c
             where c.gym_id = $1
               and c.class_type_id = $2
               and c.start_at = ($3::date + $4::time) at time zone 'Europe/Madrid'
           )`,
          [gym.id, typeId, date, slot.start, slot.end, slot.capacity],
        );
        if (result.rowCount) inserted += 1;
        else skipped += 1;
      }
    }

    await client.query('commit');
    console.log(
      `Horario de ${gym.name}: ${schedule.slots.length} clases/semana, ${inserted} nuevas, ${skipped} ya existían (${WEEKS} semanas)`,
    );
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
