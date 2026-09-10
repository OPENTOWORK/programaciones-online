import 'dotenv/config';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { AIMHARDER_TRACKS } from './lib/aimharderTracks.mjs';
import {
  fetchCalendarChunks,
  groupAnnualWorkouts,
  loadExistingProgramWorkouts,
  parseCalendarFiles,
  replaceProgramWithAnnualWorkouts,
  resolveDatabaseUrl,
  resolveProgramId,
} from './lib/annualWorkoutImport.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');
const PROJECT_REF = 'nsdurlikkuoxqobabixr';

function parseArgs(argv) {
  const fromIndex = argv.indexOf('--from');
  const toIndex = argv.indexOf('--to');
  const programIndex = argv.indexOf('--program');
  const files = [];

  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--file' && argv[index + 1]) {
      files.push(argv[index + 1]);
    }
  }

  const programFilter = programIndex >= 0 ? argv[programIndex + 1] : null;

  return {
    files,
    fetch: argv.includes('--fetch'),
    fromDb: argv.includes('--from-db'),
    from: fromIndex >= 0 ? argv[fromIndex + 1] : '2023-01-01',
    to: toIndex >= 0 ? argv[toIndex + 1] : new Date().toISOString().slice(0, 10),
    dryRun: argv.includes('--dry-run'),
    replace: argv.includes('--replace'),
    programNames: programFilter
      ? [programFilter]
      : AIMHARDER_TRACKS.map((track) => track.programName),
  };
}

async function loadSourceWorkouts({ fromDb, fetch, files, from, to }) {
  if (fromDb) {
    return null;
  }

  const calendarFiles = [];

  if (fetch) {
    const outDir = join(ROOT_DIR, '.tmp-aimharder');
    if (!existsSync(outDir)) {
      const { mkdirSync } = await import('fs');
      mkdirSync(outDir, { recursive: true });
    }
    calendarFiles.push(...fetchCalendarChunks({ from, to, outDir, rootDir: ROOT_DIR }));
  }

  if (files.length > 0) {
    calendarFiles.push(...files);
  }

  if (calendarFiles.length === 0) {
    const fallback = join(ROOT_DIR, 'aimharder-calendar.json');
    if (existsSync(fallback)) {
      calendarFiles.push(fallback);
    }
  }

  if (calendarFiles.length === 0) {
    throw new Error(
      'No hay calendario AimHarder. Usa --fetch --from YYYY-MM-DD --to YYYY-MM-DD, --file ruta.json o --from-db',
    );
  }

  const sourceWorkouts = parseCalendarFiles(calendarFiles);
  console.log(`· Parseados ${sourceWorkouts.length} entrenos desde ${calendarFiles.length} archivo(s)`);
  return sourceWorkouts;
}

async function main() {
  const { files, fetch, fromDb, from, to, dryRun, replace, programNames } = parseArgs(
    process.argv.slice(2),
  );
  const databaseUrl = resolveDatabaseUrl(PROJECT_REF);

  if (!databaseUrl) {
    throw new Error('Falta DATABASE_URL (o SUPABASE_DB_PASSWORD) en .env');
  }

  const parsedWorkouts = await loadSourceWorkouts({ fromDb, fetch, files, from, to });
  const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    let importedPrograms = 0;
    let importedWorkouts = 0;

    for (const programName of programNames) {
      let sourceWorkouts = parsedWorkouts;

      if (fromDb) {
        const programId = await resolveProgramId(client, programName);
        if (!programId) {
          console.log(`· ${programName}: programa no encontrado, se omite`);
          continue;
        }

        sourceWorkouts = await loadExistingProgramWorkouts(client, programId, programName);
        console.log(`· ${programName}: ${sourceWorkouts.length} entrenos existentes cargados`);
      }

      if (!sourceWorkouts || sourceWorkouts.length === 0) {
        console.log(`· ${programName}: sin entrenos de origen`);
        continue;
      }

      const annualWorkouts = groupAnnualWorkouts(sourceWorkouts, { programName });
      if (annualWorkouts.length === 0) {
        console.log(`· ${programName}: sin días laborables para importar`);
        continue;
      }

      console.log(
        `· ${programName}: ${annualWorkouts.length} días laborables anuales (${annualWorkouts[0].workoutDate} → ${annualWorkouts.at(-1).workoutDate})`,
      );

      if (dryRun) {
        importedPrograms += 1;
        importedWorkouts += annualWorkouts.length;
        continue;
      }

      const programId = await resolveProgramId(client, programName);
      if (!programId) {
        console.log(`· ${programName}: programa no encontrado en Supabase, se omite`);
        continue;
      }

      await replaceProgramWithAnnualWorkouts(client, programId, annualWorkouts, { replace });
      importedPrograms += 1;
      importedWorkouts += annualWorkouts.length;
      console.log(`✓ ${programName}: ${annualWorkouts.length} entrenos anuales importados`);
    }

    if (dryRun) {
      console.log(`Dry run: ${importedPrograms} programas / ${importedWorkouts} entrenos listos`);
      return;
    }

    console.log(`\nListo: ${importedPrograms} programas / ${importedWorkouts} entrenos anuales`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Error:', error.message ?? error);
  process.exit(1);
});
