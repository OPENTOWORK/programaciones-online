import 'dotenv/config';
import pg from 'pg';
import { resolveDatabaseUrl } from './lib/annualWorkoutImport.mjs';

function readOption(name) {
  const prefix = `--${name}=`;
  const withEquals = process.argv.find((arg) => arg.startsWith(prefix));
  if (withEquals) return withEquals.slice(prefix.length);

  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0) return process.argv[index + 1];

  return undefined;
}

const athleteEmail = readOption('athlete-email')?.trim().toLowerCase();
const trainerEmail = readOption('trainer-email')?.trim().toLowerCase();
const stageName = readOption('stage')?.trim() || 'Registrado';

if (!athleteEmail || !trainerEmail) {
  console.error(
    'Uso: node scripts/assign-athlete-to-trainer.mjs --athlete-email atleta@mail.com --trainer-email entrenador@mail.com [--stage Registrado]',
  );
  process.exit(1);
}

const url = resolveDatabaseUrl('nsdurlikkuoxqobabixr');
if (!url) {
  console.error('Falta DATABASE_URL o SUPABASE_DB_PASSWORD en .env');
  process.exit(1);
}

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();

try {
  const athleteRes = await client.query(
    `select u.id, u.email, p.name
     from auth.users u
     left join public."Perfil" p on p.id = u.id
     where lower(u.email) = $1`,
    [athleteEmail],
  );

  if (athleteRes.rows.length === 0) {
    const fuzzy = await client.query(
      `select u.id, u.email, p.name
       from auth.users u
       left join public."Perfil" p on p.id = u.id
       where lower(u.email) like $1
       order by u.email
       limit 5`,
      [`%${athleteEmail.replace(/[%_]/g, '')}%`],
    );

    if (fuzzy.rows.length === 1) {
      athleteRes.rows = fuzzy.rows;
    } else if (fuzzy.rows.length > 1) {
      console.error(`Varios atletas coinciden con "${athleteEmail}":`);
      for (const row of fuzzy.rows) console.error(`  - ${row.email} (${row.name ?? 'sin nombre'})`);
      process.exit(1);
    } else {
      console.error(`No existe atleta con email: ${athleteEmail}`);
      process.exit(1);
    }
  }

  const trainerRes = await client.query(
    `select u.id, u.email, p.name, r.slug as role
     from auth.users u
     join public."Perfil" p on p.id = u.id
     join public.roles r on r.id = p.id_roles
     where lower(u.email) = $1`,
    [trainerEmail],
  );

  if (trainerRes.rows.length === 0) {
    console.error(`No existe entrenador con email: ${trainerEmail}`);
    process.exit(1);
  }

  const athlete = athleteRes.rows[0];
  const trainer = trainerRes.rows[0];

  if (trainer.role !== 'entrenador' && trainer.role !== 'administrador') {
    console.error(`El usuario ${trainerEmail} no es entrenador ni administrador (rol: ${trainer.role})`);
    process.exit(1);
  }

  const stageRes = await client.query(
    `select id, name, position
     from public.trainer_crm_stages
     where trainer_id = $1
       and lower(trim(name)) = lower(trim($2))
     limit 1`,
    [trainer.id, stageName],
  );

  if (stageRes.rows.length === 0) {
    console.error(`No existe la columna "${stageName}" en el tablero de ${trainerEmail}`);
    process.exit(1);
  }

  const stage = stageRes.rows[0];

  const positionRes = await client.query(
    `select coalesce(max(position), -1) + 1 as next_position
     from public.trainer_crm_leads
     where trainer_id = $1 and stage_id = $2`,
    [trainer.id, stage.id],
  );
  const nextPosition = positionRes.rows[0].next_position;

  await client.query('begin');

  const existingRes = await client.query(
    `select id, trainer_id, assigned_trainer_id, stage_id
     from public.trainer_crm_leads
     where athlete_id = $1`,
    [athlete.id],
  );

  let leadId;
  if (existingRes.rows.length === 0) {
    const insertRes = await client.query(
      `insert into public.trainer_crm_leads (
         trainer_id, assigned_trainer_id, athlete_id, stage_id, position, updated_at
       ) values ($1, $2, $3, $4, $5, now())
       returning id`,
      [trainer.id, trainer.id, athlete.id, stage.id, nextPosition],
    );
    leadId = insertRes.rows[0].id;
  } else {
    const existing = existingRes.rows[0];
    const updateRes = await client.query(
      `update public.trainer_crm_leads
       set trainer_id = $1,
           assigned_trainer_id = $2,
           stage_id = $3,
           position = $4,
           updated_at = now()
       where athlete_id = $5
       returning id`,
      [trainer.id, trainer.id, stage.id, nextPosition, athlete.id],
    );
    leadId = updateRes.rows[0].id;
    if (existing.trainer_id !== trainer.id) {
      console.log(`Ficha transferida desde otro tablero (${existing.trainer_id} → ${trainer.id})`);
    }
  }

  await client.query('commit');

  const verify = await client.query(
    `select l.id,
            pn.name as athlete_name,
            au.email as athlete_email,
            tn.name as trainer_name,
            tu.email as trainer_email,
            s.name as stage_name,
            l.position
     from public.trainer_crm_leads l
     join public."Perfil" pn on pn.id = l.athlete_id
     join auth.users au on au.id = l.athlete_id
     join public."Perfil" tn on tn.id = l.trainer_id
     join auth.users tu on tu.id = l.trainer_id
     join public.trainer_crm_stages s on s.id = l.stage_id
     where l.id = $1`,
    [leadId],
  );

  console.log('✓ Atleta asignado al entrenador:');
  console.log(verify.rows[0]);
} catch (error) {
  await client.query('rollback');
  throw error;
} finally {
  await client.end();
}
