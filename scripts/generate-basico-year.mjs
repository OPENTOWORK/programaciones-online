import 'dotenv/config';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

import { resolveDatabaseUrl, resolveProgramId } from './lib/annualWorkoutImport.mjs';
import {
  DEFAULT_YEAR,
  GENERATED_RATE_ID_RANGE,
  LEGACY_PROGRAM_NAME,
  PHASES,
  PROGRAM_NAME,
  WEEK_ROLE_LABELS,
  buildBasicoYear,
  describeWeek,
  summarizeYear,
  toWorkoutRows,
} from './lib/basicoYearProgram.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');
const PROJECT_REF = 'nsdurlikkuoxqobabixr';

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
    program: valueOf('--program', PROGRAM_NAME),
    programId: valueOf('--program-id'),
    year,
    restDays: !argv.includes('--no-rest-days'),
    preview: valueOf('--preview'),
    out: valueOf('--out'),
    sql: valueOf('--sql'),
    parts: Math.max(1, Number(valueOf('--parts', '1'))),
    apply: argv.includes('--apply'),
    clean: argv.includes('--clean'),
    replaceProgram: argv.includes('--replace-program'),
  };
}

function printPlanOverview(days) {
  console.log('\nEstructura anual\n');
  for (const phase of PHASES) {
    console.log(`  ${phase.name} · mesociclos ${phase.mesocycles.join(', ')}`);
    console.log(`    ${phase.goal}`);
  }

  console.log('\nVolumen por fase\n');
  for (const row of summarizeYear(days)) {
    console.log(
      `  ${row.phase.padEnd(20)} mesociclos ${row.mesocycles.padEnd(8)} ${String(row.weeks).padStart(2)} semanas · ${row.days} días de entreno · ${row.restDays} de descanso · ${row.sessions} sesiones`,
    );
  }
}

function printWeekPreview(days, week) {
  const { mesocycle, weekInMesocycle, role, phase, isExtraWeek } = describeWeek(week);
  console.log(
    `\n── Semana ${week} · Mesociclo ${mesocycle} (${weekInMesocycle}/4) · ${phase.name} · ${WEEK_ROLE_LABELS[role]}${isExtraWeek ? ' · cierre de año' : ''} ──`,
  );

  for (const day of days.filter((entry) => entry.week === week)) {
    console.log(`\n${day.weekdayLabel} · ${day.date}`);
    for (const session of day.sessions) {
      console.log(`\n  [${session.kind}] ${session.name} · ${session.estimatedDuration}`);
      if (session.main) {
        for (const line of session.main.split('\n')) console.log(`    ${line}`);
      }
      if (session.cooldown) console.log(`    Cooldown: ${session.cooldown}`);
    }
  }
}

function sqlLiteral(value) {
  if (value == null) return 'null';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function buildSqlFile(rows, { program, programId, replaceProgram }, { part = 1, totalParts = 1 } = {}) {
  const isFirstPart = part === 1;
  const lines = [
    `-- Programación anual de ${program} generada por scripts/generate-basico-year.mjs`,
    totalParts > 1
      ? `-- Parte ${part} de ${totalParts} · ${rows.length} sesiones.`
      : '-- Pégalo en el editor SQL de Supabase si no tienes DATABASE_URL a mano.',
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
    ...(isFirstPart
      ? [
          '  delete from public.entrenos_diarios',
          `  where program_id = target_program${
            replaceProgram
              ? ''
              : `\n    and aimharder_rate_id between ${GENERATED_RATE_ID_RANGE.from} and ${GENERATED_RATE_ID_RANGE.to}`
          };`,
          ...(replaceProgram
            ? []
            : [
                '  delete from public.entrenos_diarios',
                '  where program_id = target_program and schedule_config is null;',
                '',
              ]),
          '',
        ]
      : []),
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

function writeSqlFiles(rows, options) {
  const totalParts = options.parts;
  const perPart = Math.ceil(rows.length / totalParts);
  const written = [];

  for (let part = 1; part <= totalParts; part += 1) {
    const chunk = rows.slice((part - 1) * perPart, part * perPart);
    if (chunk.length === 0) continue;

    const content = buildSqlFile(chunk, options, { part, totalParts });
    const target = join(
      ROOT_DIR,
      totalParts > 1 ? options.sql.replace(/\.sql$/, `.part${part}.sql`) : options.sql,
    );

    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content, 'utf8');
    written.push({
      path: target,
      rows: chunk.length,
      kb: Math.round(Buffer.byteLength(content) / 1024),
    });
  }

  return written;
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

async function applyToDatabase(rows, options) {
  const databaseUrl = resolveDatabaseUrl(PROJECT_REF);
  if (!databaseUrl) {
    throw new Error(
      'Falta DATABASE_URL (o SUPABASE_DB_PASSWORD) en .env. Usa --sql para generar el script.',
    );
  }

  const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    const resolvedId = await resolveBasicoProgramId(client, options);
    if (!resolvedId) {
      throw new Error(`No se encontró el programa "${options.program}" en Supabase`);
    }

    await client.query('begin');

    if (options.replaceProgram) {
      const deleted = await client.query('delete from public.entrenos_diarios where program_id = $1', [
        resolvedId,
      ]);
      console.log(`· Vaciado el programa: ${deleted.rowCount} sesiones eliminadas`);
    } else if (options.clean) {
      const deleted = await client.query(
        `delete from public.entrenos_diarios
         where program_id = $1 and aimharder_rate_id between $2 and $3`,
        [resolvedId, GENERATED_RATE_ID_RANGE.from, GENERATED_RATE_ID_RANGE.to],
      );
      console.log(`· Eliminadas ${deleted.rowCount} sesiones generadas anteriormente`);

      const legacy = await client.query(
        `delete from public.entrenos_diarios
         where program_id = $1 and schedule_config is null`,
        [resolvedId],
      );
      if (legacy.rowCount > 0) {
        console.log(`· Eliminadas ${legacy.rowCount} plantillas heredadas sin schedule_config`);
      }
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
    console.log(`✓ ${rows.length} sesiones guardadas en ${options.program} (${resolvedId})`);

    const check = await client.query(
      `select count(*)::int as sessions, count(distinct workout_date)::int as days
       from public.entrenos_diarios
       where program_id = $1 and aimharder_rate_id between $2 and $3`,
      [resolvedId, GENERATED_RATE_ID_RANGE.from, GENERATED_RATE_ID_RANGE.to],
    );
    const { sessions, days } = check.rows[0];
    console.log(`✓ Verificado: ${sessions} sesiones en ${days} días`);
  } catch (error) {
    await client.query('rollback').catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const days = buildBasicoYear({ year: options.year, restDays: options.restDays });
  const rows = toWorkoutRows(days);

  const trainingDays = days.filter((day) => !day.isRest).length;
  const restDayCount = days.length - trainingDays;
  const weeks = new Set(days.map((day) => day.week)).size;

  console.log(
    `Programación de ${options.program} · año ${options.year}: ${weeks} semanas · ${trainingDays} días de entreno · ${restDayCount} de descanso · ${rows.length} sesiones`,
  );
  console.log(
    `Fechas: ${rows[0].workoutDate} → ${rows.at(-1).workoutDate} (entreno lunes, martes, jueves y viernes)`,
  );

  printPlanOverview(days);

  if (options.preview) {
    for (const week of String(options.preview).split(',')) {
      printWeekPreview(days, Number(week.trim()));
    }
  }

  if (options.out) {
    const target = join(ROOT_DIR, options.out);
    writeFileSync(target, `${JSON.stringify({ days, rows }, null, 2)}\n`, 'utf8');
    console.log(`\n✓ Plan exportado a ${target}`);
  }

  if (options.sql) {
    for (const file of writeSqlFiles(rows, options)) {
      console.log(`✓ SQL exportado a ${file.path} (${file.rows} sesiones · ${file.kb} KB)`);
    }
  }

  if (!options.apply) {
    console.log('\nNada escrito en Supabase. Añade --apply --replace-program para publicarlo.');
    return;
  }

  await applyToDatabase(rows, options);
}

main().catch((error) => {
  console.error('Error:', error.message ?? error);
  process.exit(1);
});
