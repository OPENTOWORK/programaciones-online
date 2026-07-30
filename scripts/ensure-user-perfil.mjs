import 'dotenv/config';
import pg from 'pg';

const email = (process.argv[2] || '').trim().toLowerCase();
const roleSlug = (process.argv[3] || 'atleta').trim().toLowerCase();
const nameOverride = process.argv[4]?.trim();

if (!email) {
  console.error('Uso: node scripts/ensure-user-perfil.mjs email@dominio.com [atleta|entrenador] [nombre]');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('Falta DATABASE_URL en .env');
  process.exit(1);
}

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const userRes = await client.query(
  `select id, email, raw_user_meta_data->>'name' as name
   from auth.users
   where lower(email) = $1`,
  [email],
);

if (userRes.rows.length === 0) {
  console.error(`No existe en auth.users: ${email}`);
  process.exit(1);
}

const user = userRes.rows[0];
const displayName = nameOverride || user.name?.trim() || 'Usuario';

const roleRes = await client.query('select id from roles where slug = $1 limit 1', [roleSlug]);
if (roleRes.rows.length === 0) {
  console.error(`Rol no encontrado: ${roleSlug}`);
  process.exit(1);
}

const roleId = roleRes.rows[0].id;

await client.query(
  `insert into "Perfil" (id, email, name, id_roles)
   values ($1, $2, $3, $4)
   on conflict (id) do update set
     email = excluded.email,
     name = excluded.name,
     id_roles = excluded.id_roles`,
  [user.id, user.email, displayName, roleId],
);

const verify = await client.query(
  `select p.id, p.email, p.name, r.slug as role, u.email_confirmed_at is not null as email_confirmado
   from "Perfil" p
   join auth.users u on u.id = p.id
   left join roles r on r.id = p.id_roles
   where p.id = $1`,
  [user.id],
);

console.log('Listo. Perfil configurado:');
console.log(verify.rows[0]);

await client.end();
