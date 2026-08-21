import 'dotenv/config';
import pg from 'pg';

const PLAN_DESCRIPTION = 'Estandar';
const RETIRE_NAMES = ['Estáticos', 'Abdomen de hierro', 'Anillas'];

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

    for (const name of RETIRE_NAMES) {
      const programs = (
        await client.query(
          `select id, name, descripcion
           from public.programas
           where id_planes = $1
             and name = $2
             and coalesce(descripcion, '') ilike '%@venue:calisthenics%'`,
          [plan.id, name],
        )
      ).rows;

      if (programs.length === 0) {
        console.log(`· ${name} no está en calistenia`);
        continue;
      }

      for (const program of programs) {
        const sessions = await client.query(
          'select id from public.entrenos_diarios where program_id = $1',
          [program.id],
        );
        const sessionIds = sessions.rows.map((row) => row.id);

        if (sessionIds.length > 0) {
          await client
            .query('delete from public.entrenos_ejercicios where entreno_id = any($1::uuid[])', [
              sessionIds,
            ])
            .catch(() => {});
          const deleted = await client.query(
            'delete from public.entrenos_diarios where program_id = $1',
            [program.id],
          );
          console.log(`  − sesiones ${program.name}: ${deleted.rowCount ?? sessionIds.length}`);
        } else {
          console.log(`  · sin sesiones ${program.name}`);
        }

        await client
          .query('delete from public.user_programs where program_id = $1', [program.id])
          .catch(() => {});

        await client.query('delete from public.programas where id = $1', [program.id]);
        console.log(`  − programa ${program.name} (${program.id})`);
      }
    }

    console.log('\n✓ Plantillas no se han tocado.');
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
