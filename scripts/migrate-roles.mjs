import 'dotenv/config';
import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

const sql = `
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug in ('atleta', 'entrenador')),
  name text not null,
  created_at timestamptz default now()
);

insert into public.roles (slug, name) values
  ('atleta', 'Atleta'),
  ('entrenador', 'Entrenador')
on conflict (slug) do nothing;

alter table public.roles enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'roles'
      and policyname = 'Roles are viewable by authenticated users'
  ) then
    create policy "Roles are viewable by authenticated users"
      on public.roles for select
      to authenticated
      using (true);
  end if;
end $$;
`;

async function main() {
  if (!DATABASE_URL) {
    throw new Error('Falta DATABASE_URL en .env');
  }

  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  await client.query(sql);

  const { rows } = await client.query(
    'select slug, name from public.roles order by slug',
  );

  console.log('✓ Tabla roles creada');
  for (const row of rows) {
    console.log(`  · ${row.slug} → ${row.name}`);
  }

  await client.end();
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
