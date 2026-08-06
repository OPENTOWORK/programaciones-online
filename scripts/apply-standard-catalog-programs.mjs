import 'dotenv/config';
import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;
const PLAN_DESCRIPTION = 'Estandar';

const PROGRAMS = [
  { name: 'Core', description: 'Trabajo específico de core y estabilidad.' },
  {
    name: '¿Cuánto tiempo tienes?',
    description: 'Sesiones sueltas por duración: 2 horas, 1 hora, 30, 15 y 10 minutos.',
  },
];

// Se sustituyeron por la programación única "¿Cuánto tiempo tienes?".
const OBSOLETE_PROGRAMS = [
  'Sesión de 2 horas',
  'Sesión de 1 hora',
  'Sesión de 30 min',
  'Sesión de 15 min',
  'Sesión de 10 min',
];

async function main() {
  if (!DATABASE_URL) {
    throw new Error('Falta DATABASE_URL en .env');
  }

  const client = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    const { rows } = await client.query('select id from public.planes where descripcion = $1 limit 1', [
      PLAN_DESCRIPTION,
    ]);
    const plan = rows[0];
    if (!plan) {
      throw new Error(`No existe el plan "${PLAN_DESCRIPTION}"`);
    }

    for (const program of PROGRAMS) {
      const { rows: existing } = await client.query(
        'select id from public.programas where id_planes = $1 and name = $2 limit 1',
        [plan.id, program.name],
      );

      if (existing[0]) {
        console.log(`· ${program.name} ya existe (${existing[0].id})`);
        continue;
      }

      const inserted = await client.query(
        'insert into public.programas (name, id_planes, descripcion) values ($1, $2, $3) returning id',
        [program.name, plan.id, program.description],
      );

      console.log(`✓ ${program.name} → ${inserted.rows[0].id}`);
    }

    for (const name of OBSOLETE_PROGRAMS) {
      const { rows: found } = await client.query(
        `select pr.id,
                (select count(*)::int from public.entrenos_diarios e where e.program_id = pr.id) as sesiones,
                (select count(*)::int from public.user_programs up where up.program_id = pr.id) as asignaciones
         from public.programas pr
         where pr.id_planes = $1 and pr.name = $2
         limit 1`,
        [plan.id, name],
      );

      const program = found[0];
      if (!program) continue;

      // Solo se borran las que quedaron vacías: si alguien ya las usa, se avisa y se conservan.
      if (program.sesiones > 0 || program.asignaciones > 0) {
        console.warn(
          `⚠️  ${name} tiene ${program.sesiones} sesiones y ${program.asignaciones} asignaciones. No se borra.`,
        );
        continue;
      }

      await client.query('delete from public.programas where id = $1', [program.id]);
      console.log(`− ${name} eliminada`);
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Error:', error.message ?? error);
  process.exit(1);
});
