import 'dotenv/config';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATABASE_URL = process.env.DATABASE_URL;

const BOARDS_QUERY = `
  select
    s.trainer_id,
    u.email,
    p.name,
    r.slug as rol,
    count(distinct s.id) as columnas,
    (select count(*) from public.trainer_crm_leads l where l.trainer_id = s.trainer_id) as fichas,
    string_agg(s.name, ' | ' order by s.position) as nombres
  from public.trainer_crm_stages s
  left join auth.users u on u.id = s.trainer_id
  left join public."Perfil" p on p.id = s.trainer_id
  left join public.roles r on r.id = p.id_roles
  group by s.trainer_id, u.email, p.name, r.slug
  order by columnas desc, u.email
`;

function readOption(name) {
  const prefix = `--${name}=`;
  const withEquals = process.argv.find((arg) => arg.startsWith(prefix));
  if (withEquals) return withEquals.slice(prefix.length);

  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0) return process.argv[index + 1];

  return undefined;
}

async function listBoards(client) {
  const { rows } = await client.query(BOARDS_QUERY);

  if (rows.length === 0) {
    console.log('No hay ningún tablero CRM creado todavía.');
    return;
  }

  console.log(`Tableros CRM actuales (${rows.length}):\n`);
  for (const row of rows) {
    console.log(`  ${row.email ?? row.trainer_id}  ·  ${row.name ?? 'sin nombre'}  ·  rol: ${row.rol ?? 'desconocido'}`);
    console.log(`     ${row.columnas} columnas, ${row.fichas} fichas`);
    console.log(`     ${row.nombres}\n`);
  }
  console.log('Elige uno y ejecútalo con: npm run supabase:trainer-team -- --owner-email <email>');
}

async function applyMigration(client, ownerEmail) {
  const sql = readFileSync(join(__dirname, '..', 'supabase', 'trainer-team.sql'), 'utf8');

  // El email viaja como ajuste de sesión para no interpolarlo dentro del SQL.
  // set_config(..., true) es local a la transacción, así que ambos van juntos.
  await client.query('begin');
  try {
    await client.query('select set_config($1, $2, true)', ['app.trainer_team_owner_email', ownerEmail]);
    await client.query(sql);
    await client.query('commit');
  } catch (error) {
    await client.query('rollback');
    throw error;
  }

  console.log(`✓ Entrenadores unificados como equipo sobre el tablero de ${ownerEmail}`);
}

async function main() {
  if (!DATABASE_URL) {
    throw new Error('Falta DATABASE_URL en .env');
  }

  const wantsList = process.argv.includes('--list');
  const ownerEmail = readOption('owner-email');

  if (!wantsList && !ownerEmail) {
    throw new Error(
      'Indica el entrenador de referencia con --owner-email <email>, o revisa los tableros con --list',
    );
  }

  const client = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  client.on('notice', (notice) => {
    if (notice.message) console.log(`  ${notice.message}`);
  });

  await client.connect();
  try {
    if (wantsList) {
      await listBoards(client);
    } else {
      await applyMigration(client, ownerEmail);
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Error:', error.message ?? error);
  process.exit(1);
});
