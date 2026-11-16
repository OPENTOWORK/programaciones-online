import pg from 'pg';

export const PROJECT_REF = 'nsdurlikkuoxqobabixr';
export const FUNCTIONS_URL = `https://${PROJECT_REF}.supabase.co/functions/v1`;

export function resolveDatabaseUrl() {
  if (process.env.DATABASE_URL?.trim()) return process.env.DATABASE_URL.trim();

  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  if (!password) return null;

  const host = process.env.SUPABASE_DB_HOST?.trim() || `db.${PROJECT_REF}.supabase.co`;
  const user = process.env.SUPABASE_DB_USER?.trim() || 'postgres';
  const database = process.env.SUPABASE_DB_NAME?.trim() || 'postgres';
  const port = process.env.SUPABASE_DB_PORT?.trim() || '5432';

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

/** Abre una conexión, comprueba que es el proyecto de Training ProgLine y la cierra al terminar. */
export async function withDatabase(run) {
  const databaseUrl = resolveDatabaseUrl();
  if (!databaseUrl) throw new Error('Falta DATABASE_URL (o SUPABASE_DB_PASSWORD) en .env');
  if (!databaseUrl.includes(PROJECT_REF)) {
    throw new Error(`La conexión no apunta al proyecto ${PROJECT_REF}: no se continúa`);
  }

  const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    return await run(client);
  } finally {
    await client.end();
  }
}
