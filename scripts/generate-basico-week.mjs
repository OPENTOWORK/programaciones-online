import 'dotenv/config';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

import { resolveDatabaseUrl, resolveProgramId } from './lib/annualWorkoutImport.mjs';
import {
  GENERATED_RATE_ID_RANGE,
  LEGACY_PROGRAM_NAME,
  PROGRAM_NAME,
  WEEK_MONDAY,
  buildBasicoWeek,
  toWorkoutRows,
} from './lib/basicoProgram.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');
const PROJECT_REF = 'nsdurlikkuoxqobabixr';

function parseArgs(argv) {
  const valueOf = (flag, fallback = null) => {
    const index = argv.indexOf(flag);
    return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback;
  };

  const monday = valueOf('--start', WEEK_MONDAY);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(monday)) {
    throw new Error(`--start debe ser una fecha YYYY-MM-DD, no "${monday}"`);
  }

  return {
    program: valueOf('--program', PROGRAM_NAME),
    programId: valueOf('--program-id'),
    monday,
    sql: valueOf('--sql'),
    apply: argv.includes('--apply'),
    clean: argv.includes('--clean'),
    quiet: argv.includes('--quiet'),
  };
}

function printWeek({ monday, sunday, days }) {
  console.log(
    `\n${'='.repeat(88)}\nBásico · del ${monday} al ${sunday}\n${'='.repeat(88)}`,
  );

  for (const day of days) {
    for (const session of day.sessions) {
      console.log(
        `\n── ${day.weekdayLabel} ${day.date} · ${session.name} · ${session.estimatedDuration} ──`,
      );
      if (session.main) {
        for (const line of session.main.split('\n')) console.log(`   ${line}`);
      }
      if (session.cooldown) {
        console.log(`   Cooldown: ${session.cooldown}`);
      }
    }
  }
}

function sqlLiteral(value) {
  if (value == null) return 'null';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function buildSqlFile(rows, { program, programId }, window) {
  const lines = [
    `-- Semana de ${program} generada por scripts/generate-basico-week.mjs`,
    `-- Cubre del ${window.from} al ${window.to} (${rows.length} sesiones).`,
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
    '  delete from public.entrenos_diarios',
    '  where program_id = target_program',
    `    and coalesce(schedule_config->>'startDate', workout_date::text) between ${sqlLiteral(window.from)} and ${sqlLiteral(window.to)};`,
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

async function resolveBasicoProgramId(client, { program, programId }) {
  if (programId) return programId;

  const current = await resolveProgramId(client, program);
  if (current) return current;

  if (program === PROGRAM_NAME) {
    const legacyId = await resolveProgramId(client, LEGACY_PROGRAM_NAME);
    if (legacyId) {
      await client.query(`update public.programas set name = $1 where id = $2`, [PROGRAM_NAME, legacyId]);
      console.log(`· Programa "${LEGACY_PROGRAM_NAME}" renombrado a "${PROGRAM_NAME}"`);
      return legacyId;
    }
  }

  return null;
}

/** Plantillas Aimharder antiguas (sin schedule_config) que siguen repitiéndose cada semana. */
async function cleanLegacyWeeklyTemplates(client, programId) {
  const deleted = await client.query(
    `delete from public.entrenos_diarios
     where program_id = $1
       and schedule_config is null`,
    [programId],
  );
  if (deleted.rowCount > 0) {
    console.log(`· Eliminadas ${deleted.rowCount} plantillas semanales heredadas (sin schedule_config)`);
  }
}

async function applyToDatabase(rows, options, window) {
  const databaseUrl = resolveDatabaseUrl(PROJECT_REF);
  if (!databaseUrl) {
    throw new Error('Falta DATABASE_URL (o SUPABASE_DB_PASSWORD) en .env. Usa --sql para generar el script.');
  }

  const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    await client.query('begin');
    const resolvedId = await resolveBasicoProgramId(client, options);
    if (!resolvedId) {
      throw new Error(`No se encontró el programa "${options.program}" en Supabase`);
    }

    if (options.clean) {
      await cleanLegacyWeeklyTemplates(client, resolvedId);

      const deleted = await client.query(
        `delete from public.entrenos_diarios
         where program_id = $1
           and coalesce(schedule_config->>'startDate', workout_date::text) between $2 and $3`,
        [resolvedId, window.from, window.to],
      );
      console.log(`· Eliminadas ${deleted.rowCount} sesiones previas entre ${window.from} y ${window.to}`);
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
      `select count(*)::int as sessions,
              count(*) filter (where schedule_config->>'kind' = 'activation')::int as activation,
              count(*) filter (where schedule_config->>'kind' = 'rest')::int as rest
       from public.entrenos_diarios
       where program_id = $1
         and coalesce(schedule_config->>'startDate', workout_date::text) between $2 and $3`,
      [resolvedId, window.from, window.to],
    );
    const { sessions, activation, rest } = check.rows[0];
    console.log(`✓ ${rows.length} filas guardadas en ${options.program} (${resolvedId})`);
    console.log(`✓ La semana tiene ${sessions} sesiones (${activation} de activación, ${rest} de descanso)`);
  } catch (error) {
    await client.query('rollback').catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const built = buildBasicoWeek(options.monday);
  const rows = toWorkoutRows(built);
  const window = { from: built.monday, to: built.sunday };

  console.log(`Básico · del ${window.from} al ${window.to} · ${rows.length} sesiones`);

  if (!options.quiet) printWeek(built);

  if (options.sql) {
    const target = join(ROOT_DIR, options.sql);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, buildSqlFile(rows, options, window), 'utf8');
    console.log(`\n✓ SQL exportado a ${target}`);
  }

  if (!options.apply) {
    console.log('\nNada escrito en Supabase. Añade --apply --clean para guardarlo.');
    return;
  }

  await applyToDatabase(rows, options, window);
}

main().catch((error) => {
  console.error('Error:', error.message ?? error);
  process.exit(1);
});
