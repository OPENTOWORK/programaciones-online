import 'dotenv/config';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

import {
  GENERATED_RATE_ID_RANGE,
  MESOCYCLES,
  PROGRAM_START_MONDAY,
  ROLE_LABELS,
  TOTAL_WEEKS,
  WEEKS_PER_MESOCYCLE,
  buildCrosstrainingWeek,
  mondayForWeekNumber,
  toWorkoutRows,
} from './lib/crosstrainingProgram.mjs';
import { resolveDatabaseUrl, resolveProgramId } from './lib/annualWorkoutImport.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');
const PROJECT_REF = 'nsdurlikkuoxqobabixr';

function parseArgs(argv) {
  const valueOf = (flag, fallback = null) => {
    const index = argv.indexOf(flag);
    return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback;
  };

  const week = valueOf('--week');
  const start = valueOf('--start');

  if (week && start) {
    throw new Error('Usa --week o --start, no los dos a la vez.');
  }

  const monday = start ?? mondayForWeekNumber(Number(week ?? 1));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(monday)) {
    throw new Error(`--start debe ser una fecha YYYY-MM-DD, no "${monday}"`);
  }

  return {
    program: valueOf('--program', 'Crosstraining'),
    programId: valueOf('--program-id'),
    monday,
    count: Math.max(1, Number(valueOf('--count', '1'))),
    sql: valueOf('--sql'),
    apply: argv.includes('--apply'),
    clean: argv.includes('--clean'),
    quiet: argv.includes('--quiet'),
  };
}

function printPlanOverview() {
  console.log('\nMesociclos del bloque\n');
  for (const mesocycle of MESOCYCLES) {
    const doses = mesocycle.weeks
      .map((entry, index) => `S${index + 1} ${entry.percent}% ${entry.sets}×${entry.reps}`)
      .join(' · ');
    console.log(`  Mesociclo ${mesocycle.id} · ${mesocycle.name}`);
    console.log(`    ${mesocycle.goal}`);
    console.log(`    ${doses}`);
  }
  console.log(
    `\n  ${TOTAL_WEEKS} semanas en total · ${WEEKS_PER_MESOCYCLE} por mesociclo · arranque ${PROGRAM_START_MONDAY}`,
  );
}

function printWeek({ monday, plan, days }) {
  console.log(
    `\n${'='.repeat(88)}\nSemana ${plan.week} · Mesociclo ${plan.mesocycle.id} (${plan.mesocycle.name}) · ` +
      `Semana ${plan.weekInMesocycle}/${WEEKS_PER_MESOCYCLE} · ${ROLE_LABELS[plan.role]} · ` +
      `${plan.percent}% · ${plan.sets}×${plan.reps}\nDel ${monday} al ${days.at(-1).date}\n${'='.repeat(88)}`,
  );

  for (const day of days) {
    for (const session of day.sessions) {
      console.log(`\n── ${day.weekdayLabel} ${day.date} · ${session.name} · ${session.estimatedDuration} ──`);
      if (session.main) {
        for (const line of session.main.split('\n')) console.log(`   ${line}`);
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
    `-- Semana de ${program} generada por scripts/generate-crosstraining-week.mjs`,
    `-- Cubre del ${window.from} al ${window.to} (${rows.length} sesiones).`,
    '-- Borra lo que hubiera en esos días dentro del programa y vuelve a insertar.',
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

async function applyToDatabase(rows, options, window) {
  const databaseUrl = resolveDatabaseUrl(PROJECT_REF);
  if (!databaseUrl) {
    throw new Error('Falta DATABASE_URL (o SUPABASE_DB_PASSWORD) en .env. Usa --sql para generar el script.');
  }

  const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    const resolvedId = options.programId ?? (await resolveProgramId(client, options.program));
    if (!resolvedId) {
      throw new Error(`No se encontró el programa "${options.program}" en Supabase`);
    }

    await client.query('begin');

    if (options.clean) {
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
              count(*) filter (where schedule_config->>'kind' = 'rest')::int as rest
       from public.entrenos_diarios
       where program_id = $1 and aimharder_rate_id between $2 and $3`,
      [resolvedId, GENERATED_RATE_ID_RANGE.from, GENERATED_RATE_ID_RANGE.to],
    );
    const { sessions, rest } = check.rows[0];
    console.log(`✓ ${rows.length} filas guardadas en ${options.program} (${resolvedId})`);
    console.log(`✓ El bloque generado tiene ya ${sessions} días (${rest} de descanso)`);
  } catch (error) {
    await client.query('rollback').catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const weeks = [];
  let cursor = options.monday;

  for (let index = 0; index < options.count; index += 1) {
    const built = buildCrosstrainingWeek(cursor);
    weeks.push(built);
    cursor = built.days.at(-1).date;
    cursor = new Date(new Date(`${cursor}T12:00:00Z`).getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
  }

  const rows = weeks.flatMap((entry) => toWorkoutRows(entry));
  const window = { from: weeks[0].days[0].date, to: weeks.at(-1).days.at(-1).date };

  console.log(
    `Crosstraining · ${weeks.length} semana(s) · del ${window.from} al ${window.to} · ${rows.length} días`,
  );

  if (!options.quiet) {
    printPlanOverview();
    for (const entry of weeks) printWeek(entry);
  }

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
