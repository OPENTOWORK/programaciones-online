import 'dotenv/config';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

import { resolveDatabaseUrl } from './lib/annualWorkoutImport.mjs';
import {
  inferSessionTemplateModality,
  isCalisteniaMetconContent,
  rebuildTemplateNameWithModality,
  SESSION_TEMPLATE_MODALITY_TAGS,
} from './lib/sessionTemplateModalityRules.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_REF = 'nsdurlikkuoxqobabixr';

async function ensureModalityColumn(client) {
  const sql = readFileSync(
    join(__dirname, '..', 'supabase', 'session-templates-modality-tags.sql'),
    'utf8',
  );
  await client.query(sql);
}

async function main() {
  const databaseUrl = resolveDatabaseUrl(PROJECT_REF);
  if (!databaseUrl) {
    throw new Error('Falta DATABASE_URL (o SUPABASE_DB_PASSWORD) en .env');
  }

  const useSsl = !/localhost|127\.0\.0\.1/.test(databaseUrl);
  const client = new pg.Client({
    connectionString: databaseUrl,
    ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  });

  await client.connect();
  await ensureModalityColumn(client);

  const { rows } = await client.query(`
    select id, name, content, tag, format_tag, modality_tag
    from public.trainer_session_templates
    where tag = 'Metcon'
    order by name
  `);

  console.log(`→ ${rows.length} plantillas Metcon`);

  const counts = Object.fromEntries(SESSION_TEMPLATE_MODALITY_TAGS.map((tag) => [tag, 0]));
  let calisteniaMatches = 0;
  let updated = 0;

  for (const row of rows) {
    const inferred =
      inferSessionTemplateModality({
        name: row.name,
        content: row.content,
        tag: row.tag,
      }) ??
      (isCalisteniaMetconContent(row.content, row.name) ? 'Calistenia' : 'Crosstraining');

    if (!inferred) {
      console.log(`  · Sin modalidad clara: ${row.name}`);
      continue;
    }

    if (inferred === 'Calistenia') calisteniaMatches += 1;

    const nextName = rebuildTemplateNameWithModality({
      name: row.name,
      tag: row.tag,
      formatTag: row.format_tag,
      modalityTag: inferred,
    });

    if (row.modality_tag === inferred && row.name === nextName) {
      counts[inferred] += 1;
      continue;
    }

    await client.query(
      `update public.trainer_session_templates
       set modality_tag = $2, name = $3, updated_at = now()
       where id = $1`,
      [row.id, inferred, nextName],
    );

    counts[inferred] += 1;
    updated += 1;
    console.log(`  ✓ ${row.name} → ${inferred}`);
  }

  console.log('\nResumen:');
  console.log(`  Actualizadas: ${updated}`);
  console.log(`  Calistenia detectadas: ${calisteniaMatches}`);
  for (const modality of SESSION_TEMPLATE_MODALITY_TAGS) {
    console.log(`  ${modality}: ${counts[modality] ?? 0}`);
  }

  await client.end();
}

main().catch((error) => {
  console.error('Error:', error.message ?? error);
  process.exit(1);
});
