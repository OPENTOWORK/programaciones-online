import 'dotenv/config';
import pg from 'pg';

const PLAN_DESCRIPTION = 'Estandar';

const RENAMES = [
  {
    from: ['Básico', 'Basico'],
    to: 'Base',
    description: 'Programación de entrada para aprender técnica y construir una base sólida de fuerza. @venue:gym',
  },
  {
    from: ['Intermedio'],
    to: 'Strength',
    description: 'Más volumen e intensidad con bloques compuestos y accesorios exigentes. @venue:gym',
  },
  {
    from: ['Avanzado'],
    to: 'Performance',
    description: 'Para atletas con experiencia: carga alta, densidad de trabajo y exigencia técnica. @venue:gym',
  },
];

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

    for (const entry of RENAMES) {
      for (const oldName of entry.from) {
        const result = await client.query(
          `update public.programas
           set name = $1, descripcion = $2
           where id_planes = $3
             and name = $4
             and coalesce(descripcion, '') ilike '%@venue:gym%'
           returning id, name`,
          [entry.to, entry.description, plan.id, oldName],
        );

        for (const row of result.rows) {
          console.log(`· Renombrado ${oldName} → ${row.name} (${row.id})`);
        }
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
