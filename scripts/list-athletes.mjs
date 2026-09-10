import 'dotenv/config';
import pg from 'pg';
import { resolveDatabaseUrl } from './lib/annualWorkoutImport.mjs';

const client = new pg.Client({
  connectionString: resolveDatabaseUrl('nsdurlikkuoxqobabixr'),
  ssl: { rejectUnauthorized: false },
});
await client.connect();
const result = await client.query(`
  select p.id, p.email, p.name, r.slug as role
  from public."Perfil" p
  left join roles r on r.id = p.id_roles
  where r.slug = 'atleta'
  order by p.email
  limit 12
`);
console.log(result.rows);
await client.end();
