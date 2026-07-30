import 'dotenv/config';
import pg from 'pg';

const email = (process.argv[2] || 'charly-7-8@hotmail.com').toLowerCase();
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const auth = await client.query(
  'select id, email, email_confirmed_at, created_at from auth.users where lower(email) = $1',
  [email],
);
const perfil = await client.query(
  'select id, email, name from "Perfil" where lower(email) = $1',
  [email],
);

console.log('Email:', email);
console.log('\nauth.users (autenticación Supabase):', auth.rows.length ? auth.rows : 'NO EXISTE');
console.log('\nPerfil (tabla de la app):', perfil.rows.length ? perfil.rows : 'NO EXISTE');

if (perfil.rows.length > 0) {
  const roleRes = await client.query(
    `select r.slug as role, p.id_roles
     from "Perfil" p
     left join roles r on r.id = p.id_roles
     where lower(p.email) = $1`,
    [email],
  );
  console.log('Rol:', roleRes.rows[0]?.role ?? 'SIN ROL (id_roles:', roleRes.rows[0]?.id_roles, ')');
}

await client.end();
