import 'dotenv/config';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATABASE_URL = process.env.DATABASE_URL;
const skipBackfill = process.argv.includes('--no-backfill');

async function main() {
  if (!DATABASE_URL) {
    throw new Error('Falta DATABASE_URL en .env');
  }

  const sql = readFileSync(join(__dirname, '..', 'supabase', 'signup-welcome-message.sql'), 'utf8');
  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  await client.query(sql);

  console.log('✓ Mensaje de bienvenida y trigger de registro aplicados');

  if (!skipBackfill) {
    const { rows } = await client.query(
      `insert into public.trainer_messages (user_id, sender, text)
       select p.id, 'trainer', public.build_signup_welcome_message(p.name)
       from public."Perfil" p
       join public.roles r on r.id = p.id_roles
       where r.slug = 'atleta'
         and not exists (
           select 1 from public.trainer_messages tm where tm.user_id = p.id
         )
       returning user_id,
         (select name from public."Perfil" where id = user_id) as name,
         (select email from public."Perfil" where id = user_id) as email`,
    );

    if (rows.length === 0) {
      console.log('· Sin atletas pendientes: todos tienen ya conversación iniciada');
    } else {
      console.log(`✓ Mensaje enviado a ${rows.length} atleta(s) sin conversación:`);
      for (const row of rows) {
        console.log(`  - ${row.name} <${row.email}>`);
      }
    }
  }

  await client.end();
}

main().catch((error) => {
  console.error('Error:', error.message ?? error);
  process.exit(1);
});
