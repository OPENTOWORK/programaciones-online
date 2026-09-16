import 'dotenv/config';
import { randomUUID } from 'crypto';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
import { resolveDatabaseUrl } from './lib/annualWorkoutImport.mjs';

function readOption(name) {
  const prefix = `--${name}=`;
  const withEquals = process.argv.find((arg) => arg.startsWith(prefix));
  if (withEquals) return withEquals.slice(prefix.length);

  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0) return process.argv[index + 1];

  return undefined;
}

const fromEmail = readOption('from-email')?.trim().toLowerCase();
const toEmail = readOption('to-email')?.trim().toLowerCase();
const planGroupId = readOption('plan-group-id')?.trim();
const replace = process.argv.includes('--replace');

if (!fromEmail || !toEmail) {
  console.error(
    'Uso: node scripts/copy-athlete-plan-group.mjs --from-email origen@mail.com --to-email destino@mail.com [--plan-group-id uuid] [--replace]',
  );
  process.exit(1);
}

const dbUrl = resolveDatabaseUrl('nsdurlikkuoxqobabixr');
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!dbUrl) {
  console.error('Falta DATABASE_URL o SUPABASE_DB_PASSWORD en .env');
  process.exit(1);
}

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Faltan EXPO_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env');
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
await client.connect();

async function fetchUserByEmail(email) {
  const result = await client.query(
    `select u.id, u.email, p.name
     from auth.users u
     left join public."Perfil" p on p.id = u.id
     where lower(u.email) = $1`,
    [email],
  );
  return result.rows[0] ?? null;
}

async function copyPdf(sourcePath, targetPath) {
  let buffer;

  const downloaded = await admin.storage.from('athlete-plan-pdfs').download(sourcePath);
  if (!downloaded.error && downloaded.data) {
    buffer = Buffer.from(await downloaded.data.arrayBuffer());
  } else {
    await client.query(`update storage.buckets set public = true where id = 'athlete-plan-pdfs'`);
    try {
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/athlete-plan-pdfs/${sourcePath
        .split('/')
        .map((part) => encodeURIComponent(part))
        .join('/')}`;
      const response = await fetch(publicUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      buffer = Buffer.from(await response.arrayBuffer());
    } finally {
      await client.query(`update storage.buckets set public = false where id = 'athlete-plan-pdfs'`);
    }
  }

  const upload = await admin.storage.from('athlete-plan-pdfs').upload(targetPath, buffer, {
    upsert: true,
    contentType: 'application/pdf',
  });

  if (upload.error) {
    const inserted = await client.query(
      `insert into storage.objects (bucket_id, name, owner, metadata)
       select bucket_id, $2, owner, metadata
       from storage.objects
       where bucket_id = 'athlete-plan-pdfs' and name = $1
       on conflict do nothing
       returning name`,
      [sourcePath, targetPath],
    );

    if (inserted.rowCount === 0) {
      throw new Error(`No se pudo subir el PDF (${targetPath}): ${upload.error.message}`);
    }
  }
}

try {
  const sourceUser = await fetchUserByEmail(fromEmail);
  const targetUser = await fetchUserByEmail(toEmail);

  if (!sourceUser) {
    throw new Error(`No existe el atleta origen: ${fromEmail}`);
  }
  if (!targetUser) {
    throw new Error(`No existe el atleta destino: ${toEmail}`);
  }

  let groupFilter = planGroupId;
  if (!groupFilter) {
    const latestGroup = await client.query(
      `select coalesce(plan_group_id, id) as group_id
       from public.athlete_plans
       where athlete_id = $1 and plan_type = 'personalized'
       order by created_at desc
       limit 1`,
      [sourceUser.id],
    );
    groupFilter = latestGroup.rows[0]?.group_id;
  }

  if (!groupFilter) {
    throw new Error(`El atleta origen no tiene planes personalizados`);
  }

  const sourcePlans = await client.query(
    `select id, athlete_id, trainer_id, plan_type, title, content, nutrition_data,
            session_number, plan_group_id, pdf_storage_path, pdf_file_name
     from public.athlete_plans
     where athlete_id = $1
       and coalesce(plan_group_id, id) = $2::uuid
     order by session_number nulls last, created_at`,
    [sourceUser.id, groupFilter],
  );

  if (sourcePlans.rows.length === 0) {
    throw new Error(`No hay sesiones en el grupo ${groupFilter}`);
  }

  const trainerId = sourcePlans.rows[0].trainer_id;
  const title = sourcePlans.rows[0].title;
  const newGroupId = randomUUID();

  if (replace) {
    const existing = await client.query(
      `select id, pdf_storage_path
       from public.athlete_plans
       where athlete_id = $1
         and coalesce(plan_group_id, id) = coalesce($2::uuid, id)`,
      [targetUser.id, planGroupId ?? null],
    );

    if (existing.rows.length > 0) {
      await client.query(`delete from public.athlete_plans where athlete_id = $1`, [targetUser.id]);
      for (const row of existing.rows) {
        if (row.pdf_storage_path) {
          await admin.storage.from('athlete-plan-pdfs').remove([row.pdf_storage_path]);
        }
      }
      console.log(`· Eliminados ${existing.rows.length} planes previos del destino`);
    }
  }

  const existingTarget = await client.query(
    `select count(*)::int as count
     from public.athlete_plans
     where athlete_id = $1`,
    [targetUser.id],
  );
  if (existingTarget.rows[0].count > 0 && !replace) {
    throw new Error(
      `El atleta destino ya tiene planes. Usa --replace si quieres sustituirlos.`,
    );
  }

  await client.query('begin');

  const created = [];
  for (const plan of sourcePlans.rows) {
    let pdfStoragePath = null;
    let pdfFileName = null;

    if (plan.pdf_storage_path && plan.pdf_file_name) {
      pdfFileName = plan.pdf_file_name;
      pdfStoragePath = `${targetUser.id}/${newGroupId}/${pdfFileName}`;
      try {
        await copyPdf(plan.pdf_storage_path, pdfStoragePath);
      } catch (error) {
        console.warn(
          `· Aviso: no se pudo copiar el PDF de la sesión ${plan.session_number} (${error.message}). Se guarda el contenido textual.`,
        );
        pdfStoragePath = null;
        pdfFileName = null;
      }
    }

    const inserted = await client.query(
      `insert into public.athlete_plans (
         athlete_id, trainer_id, plan_type, title, content, nutrition_data,
         plan_group_id, session_number, pdf_storage_path, pdf_file_name
       ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       returning id, session_number`,
      [
        targetUser.id,
        trainerId,
        plan.plan_type,
        title,
        plan.content,
        plan.nutrition_data,
        newGroupId,
        plan.session_number,
        pdfStoragePath,
        pdfFileName,
      ],
    );

    created.push(inserted.rows[0]);
  }

  await client.query('commit');

  console.log(`✓ Copiado "${title}" de ${sourceUser.email} → ${targetUser.email}`);
  console.log(`  Grupo origen: ${groupFilter}`);
  console.log(`  Grupo nuevo:  ${newGroupId}`);
  console.log(`  Entrenador:   ${trainerId}`);
  console.log(`  Sesiones:     ${created.length}`);
  for (const row of created) {
    console.log(`    · sesión ${row.session_number} → ${row.id}`);
  }
} catch (error) {
  await client.query('rollback');
  throw error;
} finally {
  await client.end();
}
