import 'dotenv/config';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

import { resolveDatabaseUrl, resolveProgramId } from './lib/annualWorkoutImport.mjs';
import {
  WEEKLY_CHALLENGE_PROGRAM_NAME,
  buildWeeklyChallengeYear,
  summarizeWeeklyChallengeYear,
  toWorkoutRows,
} from './lib/weeklyChallengeProgram.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');
const PROJECT_REF = 'nsdurlikkuoxqobabixr';
const DEFAULT_YEAR = 2026;

function parseArgs(argv) {
  const valueOf = (flag, fallback = null) => {
    const index = argv.indexOf(flag);
    return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback;
  };

  const year = Number(valueOf('--year', String(DEFAULT_YEAR)));
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error(`--year debe ser un año entre 2000 y 2100, no "${year}"`);
  }

  return {
    program: valueOf('--program', WEEKLY_CHALLENGE_PROGRAM_NAME),
    programId: valueOf('--program-id'),
    year,
    from: valueOf('--from', `${year}-01-01`),
    to: valueOf('--to', `${year}-12-31`),
    sql: valueOf('--sql'),
    apply: argv.includes('--apply'),
    clean: argv.includes('--clean'),
    quiet: argv.includes('--quiet'),
  };
}

function sqlLiteral(value) {
  if (value == null) return 'null';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function buildSqlFile(rows, { program, programId, from, to }) {
  const lines = [
    `-- Desafíos semanales generados por scripts/generate-weekly-challenge-year.mjs`,
    `-- Rango ${from} → ${to} · ${rows.length} semanas.`,
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
    `    and schedule_config->>'startDate' >= ${sqlLiteral(from)}`,
    `    and schedule_config->>'startDate' <= ${sqlLiteral(to)};`,
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

async function applyToDatabase(rows, options, { firstMonday, lastMonday }) {
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

    const junkDeleted = await client.query(
      `delete from public.entrenos_diarios
       where program_id = $1
         and (
           schedule_config->>'heroId' is null
           or coalesce(schedule_config->>'kind', '') <> 'metcon'
         )`,
      [resolvedId],
    );
    if (junkDeleted.rowCount > 0) {
      console.log(`· Eliminadas ${junkDeleted.rowCount} sesiones que no son heroes del desafío`);
    }

    if (options.clean) {
      const deleted = await client.query(
        `delete from public.entrenos_diarios
         where program_id = $1
           and schedule_config->>'startDate' >= $2
           and schedule_config->>'startDate' <= $3`,
        [resolvedId, firstMonday, lastMonday],
      );
      console.log(`· Eliminadas ${deleted.rowCount} sesiones previas entre ${firstMonday} y ${lastMonday}`);
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
         and schedule_config->>'startDate' >= $2
         and schedule_config->>'startDate' <= $3`,
      [resolvedId, firstMonday, lastMonday],
    );
    console.log(`✓ ${rows.length} desafíos guardados en ${options.program} (${resolvedId})`);
    console.log(`✓ Verificado en Supabase: ${check.rows[0].sessions} semanas publicadas`);
  } catch (error) {
    await client.query('rollback').catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const challenges = buildWeeklyChallengeYear({
    year: options.year,
    from: options.from,
    to: options.to,
  });

  if (!challenges.length) {
    throw new Error(`No hay semanas entre ${options.from} y ${options.to}`);
  }

  const summary = summarizeWeeklyChallengeYear(challenges);
  const rows = challenges.flatMap((challenge) => toWorkoutRows(challenge));
  const firstMonday = challenges[0].monday;
  const lastMonday = challenges.at(-1).monday;

  console.log(
    `Desafío de la semana · ${summary.weeks} semanas · ${summary.from} → ${summary.to}`,
  );
  console.log(
    `Modalidades: ${Object.entries(summary.byModality)
      .map(([modality, count]) => `${modality} ${count}`)
      .join(' · ')}`,
  );

  if (!options.quiet) {
    for (const challenge of challenges) {
      const { hero } = challenge;
      console.log(
        `  ${challenge.monday} → ${challenge.sunday} · ${hero.modality} · ${hero.hero.name}`,
      );
    }
  }

  if (options.sql) {
    const target = join(ROOT_DIR, options.sql);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, buildSqlFile(rows, { ...options, from: firstMonday, to: lastMonday }), 'utf8');
    console.log(`\n✓ SQL exportado a ${target}`);
  }

  if (!options.apply) {
    console.log('\nNada escrito en Supabase. Añade --apply --clean para publicarlo.');
    return;
  }

  await applyToDatabase(rows, options, { firstMonday, lastMonday });
}

main().catch((error) => {
  console.error('Error:', error.message ?? error);
  process.exit(1);
});
