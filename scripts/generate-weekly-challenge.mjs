import 'dotenv/config';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

import { resolveDatabaseUrl, resolveProgramId } from './lib/annualWorkoutImport.mjs';
import {
  GENERATED_RATE_ID_RANGE,
  WEEKLY_CHALLENGE_PROGRAM_NAME,
  buildWeeklyChallenge,
  toWorkoutRows,
} from './lib/weeklyChallengeProgram.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');
const PROJECT_REF = 'nsdurlikkuoxqobabixr';

function parseArgs(argv) {
  const valueOf = (flag, fallback = null) => {
    const index = argv.indexOf(flag);
    return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback;
  };

  let monday = valueOf('--start');
  if (!monday) {
    monday = argv.find((arg) => /^\d{4}-\d{2}-\d{2}$/.test(arg));
  }
  if (!monday || !/^\d{4}-\d{2}-\d{2}$/.test(monday)) {
    throw new Error('Indica el lunes de la semana con --start YYYY-MM-DD');
  }

  return {
    program: valueOf('--program', WEEKLY_CHALLENGE_PROGRAM_NAME),
    programId: valueOf('--program-id'),
    monday,
    sql: valueOf('--sql'),
    apply: argv.includes('--apply'),
    clean: argv.includes('--clean'),
    quiet: argv.includes('--quiet'),
  };
}

function printChallenge(challenge) {
  const entry = challenge.hero;
  console.log(
    `\n${'='.repeat(72)}\nDesafío de la semana · del ${challenge.monday} al ${challenge.sunday}\n${'='.repeat(72)}`,
  );
  console.log(
    `\n── ${entry.modality} · ${entry.hero.name} · ${entry.estimatedDuration} ──\n   En honor a ${entry.hero.honor}`,
  );
  for (const session of challenge.sessions) {
    console.log(`\n   [${session.scheduleConfig.kind}] ${session.name} (${session.estimatedDuration})`);
    if (session.mainPart) {
      for (const line of session.mainPart.split('\n')) {
        console.log(`   ${line}`);
      }
    }
  }
}

function sqlLiteral(value) {
  if (value == null) return 'null';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function buildSqlFile(rows, { program, programId }, monday) {
  const lines = [
    `-- Desafío de la semana generado por scripts/generate-weekly-challenge.mjs`,
    `-- Semana del ${monday} (${rows.length} heroes).`,
    'do $$',
    'declare',
    '  target_program uuid;',
    'begin',
    programId
      ? `  target_program := ${sqlLiteral(programId)}::uuid;`
      : `  select id into target_program from public.programas where lower(trim(name)) = lower(trim(${sqlLiteral(program)})) limit 1;`,
    '  if target_program is null then',
    `    raise exception 'No existe el programa %', ${sqlLiteral(program)};`,
    '  end if;',
    '',
    `  delete from public.entrenos_diarios`,
    `  where program_id = target_program`,
    `    and schedule_config->>'startDate' = ${sqlLiteral(monday)};`,
    '',
  ];

  for (const row of rows) {
    lines.push(
      '  insert into public.entrenos_diarios (',
      '    program_id, workout_date, aimharder_rate_id, name, day_label,',
      '    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at',
      '  ) values (',
      `    target_program, ${sqlLiteral(row.workoutDate)}, ${row.aimharderRateId}, ${sqlLiteral(row.name)}, ${sqlLiteral(row.dayLabel)},`,
      `    ${sqlLiteral(row.estimatedDuration)}, ${sqlLiteral(row.warmup)}, ${sqlLiteral(row.mainPart)}, ${sqlLiteral(row.corePart)}, ${sqlLiteral(row.cooldown)}, ${sqlLiteral(JSON.stringify(row.scheduleConfig))}::jsonb, now()`,
      '  ) on conflict (workout_date, aimharder_rate_id) do update set',
      '    program_id = excluded.program_id,',
      '    name = excluded.name,',
      '    day_label = excluded.day_label,',
      '    estimated_duration = excluded.estimated_duration,',
      '    warmup = excluded.warmup,',
      '    main_part = excluded.main_part,',
      '    core_part = excluded.core_part,',
      '    cooldown = excluded.cooldown,',
      '    schedule_config = excluded.schedule_config,',
      '    synced_at = now();',
      '',
    );
  }

  lines.push('end $$;', '');
  return lines.join('\n');
}

async function applyToDatabase(rows, options, monday) {
  const databaseUrl = resolveDatabaseUrl(PROJECT_REF);
  if (!databaseUrl) {
    throw new Error('Falta DATABASE_URL (o SUPABASE_DB_PASSWORD) en .env. Usa --sql para generar el script.');
  }

  const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    const resolvedId = options.programId ?? (await resolveProgramId(client, options.program));
    if (!resolvedId) {
      throw new Error(
        `No se encontró el programa "${options.program}" en Supabase. Créalo desde la app (Training · Performance → Desafío de la semana).`,
      );
    }

    await client.query('begin');

    if (options.clean) {
      const deleted = await client.query(
        `delete from public.entrenos_diarios
         where program_id = $1
           and schedule_config->>'startDate' = $2`,
        [resolvedId, monday],
      );
      console.log(`· Eliminadas ${deleted.rowCount} sesiones previas de la semana del ${monday}`);
    }

    for (const row of rows) {
      await client.query(
        `insert into public.entrenos_diarios (
           program_id, workout_date, aimharder_rate_id, name, day_label,
           estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
         )
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, now())
         on conflict (workout_date, aimharder_rate_id)
         do update set
           program_id = excluded.program_id,
           name = excluded.name,
           day_label = excluded.day_label,
           estimated_duration = excluded.estimated_duration,
           warmup = excluded.warmup,
           main_part = excluded.main_part,
           core_part = excluded.core_part,
           cooldown = excluded.cooldown,
           schedule_config = excluded.schedule_config,
           synced_at = now()`,
        [
          resolvedId,
          row.workoutDate,
          row.aimharderRateId,
          row.name,
          row.dayLabel,
          row.estimatedDuration,
          row.warmup,
          row.mainPart,
          row.corePart,
          row.cooldown,
          JSON.stringify(row.scheduleConfig),
        ],
      );
    }

    await client.query('commit');

    const check = await client.query(
      `select count(*)::int as sessions
       from public.entrenos_diarios
       where program_id = $1
         and schedule_config->>'startDate' = $2`,
      [resolvedId, monday],
    );
    console.log(`✓ Hero guardado en ${options.program} (${resolvedId})`);
    console.log(`✓ La semana del ${monday} tiene ${check.rows[0].sessions} desafío publicado`);
  } catch (error) {
    await client.query('rollback').catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const challenge = buildWeeklyChallenge(options.monday);
  const rows = toWorkoutRows(challenge);

  console.log(`Desafío de la semana · semana del ${challenge.monday} · ${challenge.hero.modality} · ${challenge.hero.hero.name}`);

  if (!options.quiet) {
    printChallenge(challenge);
  }

  if (options.sql) {
    const target = join(ROOT_DIR, options.sql);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, buildSqlFile(rows, options, challenge.monday), 'utf8');
    console.log(`\n✓ SQL exportado a ${target}`);
  }

  if (!options.apply) {
    console.log('\nNada escrito en Supabase. Añade --apply --clean para publicarlo.');
    return;
  }

  await applyToDatabase(rows, options, challenge.monday);
}

main().catch((error) => {
  console.error('Error:', error.message ?? error);
  process.exit(1);
});
