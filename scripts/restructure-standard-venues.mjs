import 'dotenv/config';
import pg from 'pg';

const PLAN_DESCRIPTION = 'Estandar';

const KEEP_CALISTHENICS = true;

const GYM_KEEP_NAMES = new Set([
  'base',
  'basico',
  'básico',
  'strength',
  'intermedio',
  'performance',
  'avanzado',
  'metcon',
]);

const GYM_NEW_PROGRAMS = [
  {
    name: 'Base',
    description: 'Programación de entrada para aprender técnica y construir una base sólida de fuerza. @venue:gym',
  },
  {
    name: 'Strength',
    description: 'Más volumen e intensidad con bloques compuestos y accesorios exigentes. @venue:gym',
  },
  {
    name: 'Performance',
    description: 'Para atletas con experiencia: carga alta, densidad de trabajo y exigencia técnica. @venue:gym',
  },
];

function normalizeName(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function venueFromDescription(description) {
  const match = String(description ?? '').match(/@venue:(home|gym|calisthenics)\b/i);
  return match?.[1]?.toLowerCase() ?? null;
}

function shouldKeepProgram(program) {
  const venue = venueFromDescription(program.descripcion);
  const name = normalizeName(program.name);

  if (venue === 'calisthenics') return KEEP_CALISTHENICS;
  if (venue === 'home') return false;
  if (venue === 'gym') return GYM_KEEP_NAMES.has(name);
  // Programas Estándar sin marca de espacio (antiguo catálogo de gym).
  return GYM_KEEP_NAMES.has(name);
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('Falta DATABASE_URL en .env');

  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    const plan = (
      await client.query('select id from public.planes where descripcion = $1 limit 1', [
        PLAN_DESCRIPTION,
      ])
    ).rows[0];
    if (!plan) throw new Error(`No existe el plan "${PLAN_DESCRIPTION}"`);

    for (const program of GYM_NEW_PROGRAMS) {
      const existing = await client.query(
        `select id from public.programas
         where id_planes = $1 and name = $2
           and coalesce(descripcion, '') ilike '%@venue:gym%'
         limit 1`,
        [plan.id, program.name],
      );
      if (existing.rows[0]) {
        console.log(`· [gym] ${program.name} ya existe (${existing.rows[0].id})`);
        continue;
      }

      const inserted = await client.query(
        'insert into public.programas (name, id_planes, descripcion) values ($1, $2, $3) returning id',
        [program.name, plan.id, program.description],
      );
      console.log(`✓ [gym] ${program.name} → ${inserted.rows[0].id}`);
    }

    const programs = (
      await client.query(
        `select id, name, descripcion from public.programas where id_planes = $1 order by name`,
        [plan.id],
      )
    ).rows;

    const retired = programs.filter((program) => !shouldKeepProgram(program));
    console.log(`\nA retirar: ${retired.length}`);

    for (const program of retired) {
      const venue = venueFromDescription(program.descripcion) ?? 'sin-venue';
      const sessions = await client.query(
        'select id from public.entrenos_diarios where program_id = $1',
        [program.id],
      );
      const sessionIds = sessions.rows.map((row) => row.id);

      if (sessionIds.length > 0) {
        await client.query('delete from public.entrenos_ejercicios where entreno_id = any($1::uuid[])', [
          sessionIds,
        ]).catch(() => {});
        const deleted = await client.query(
          'delete from public.entrenos_diarios where program_id = $1',
          [program.id],
        );
        console.log(
          `  − sesiones [${venue}] ${program.name}: ${deleted.rowCount ?? sessionIds.length}`,
        );
      } else {
        console.log(`  · sin sesiones [${venue}] ${program.name}`);
      }

      await client.query('delete from public.user_programs where program_id = $1', [program.id]).catch(
        () => {},
      );

      try {
        await client.query('delete from public.programas where id = $1', [program.id]);
        console.log(`  − programa [${venue}] ${program.name}`);
      } catch (error) {
        console.warn(
          `  ⚠️ no se pudo borrar el programa ${program.name}: ${error.message ?? error}`,
        );
      }
    }

    console.log('\n✓ Reestructuración Estándar lista. Plantillas no se tocan.');
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
