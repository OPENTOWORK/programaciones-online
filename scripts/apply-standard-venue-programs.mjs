import 'dotenv/config';
import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;
const PLAN_DESCRIPTION = 'Estandar';

const VENUE_PROGRAMS = {
  gym: [
    {
      name: 'Base',
      description: 'Programación de entrada para aprender técnica y construir una base sólida de fuerza.',
    },
    {
      name: 'Strength',
      description: 'Más volumen e intensidad con bloques compuestos y accesorios exigentes.',
    },
    {
      name: 'Performance',
      description: 'Para atletas con experiencia: carga alta, densidad de trabajo y exigencia técnica.',
    },
    {
      name: 'Metcon',
      description: 'Sesiones de metcon sueltas para elegir cuando quieras.',
    },
  ],
  calisthenics: [
    {
      name: 'Consigue tu primera dominada',
      description: 'Plan progresivo para lograr tu primera dominada.',
    },
    {
      name: 'Consigue tu primera flexión',
      description: 'Plan progresivo para lograr tu primera flexión.',
    },
    {
      name: 'Consigue tu primer muscle up',
      description: 'Técnica y fuerza para tu primer muscle up.',
    },
    {
      name: 'Metcon',
      description: 'Sesiones de metcon sueltas para elegir cuando quieras.',
    },
  ],
};

function withVenueMarker(description, venue) {
  return `${description.trim()} @venue:${venue}`;
}

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

    for (const [venue, programs] of Object.entries(VENUE_PROGRAMS)) {
      for (const program of programs) {
        const description = withVenueMarker(program.description, venue);
        const { rows: existing } = await client.query(
          `select id, descripcion
           from public.programas
           where id_planes = $1
             and name = $2
             and coalesce(descripcion, '') ilike ('%@venue:' || $3 || '%')
           order by id
           limit 1`,
          [plan.id, program.name, venue],
        );

        if (existing[0]) {
          console.log(`· [${venue}] ${program.name} ya existe (${existing[0].id})`);
          continue;
        }

        const inserted = await client.query(
          'insert into public.programas (name, id_planes, descripcion) values ($1, $2, $3) returning id',
          [program.name, plan.id, description],
        );

        console.log(`✓ [${venue}] ${program.name} → ${inserted.rows[0].id}`);
      }
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
