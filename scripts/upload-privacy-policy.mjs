import 'dotenv/config';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
const BUCKET = 'public-legal';
const HTML_PATH = 'privacy.html';
const PUBLIC_PATH = 'privacy.svg';
const PUBLIC_URL = 'https://nsdurlikkuoxqobabixr.supabase.co/functions/v1/privacy-policy';

function buildSvgWrapper(html) {
  const dataUri = `data:text/html;base64,${Buffer.from(html, 'utf8').toString('base64')}`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 900 5200" preserveAspectRatio="xMinYMin meet">
  <foreignObject width="900" height="5200">
    <iframe xmlns="http://www.w3.org/1999/xhtml"
      src="${dataUri}"
      width="900"
      height="5200"
      style="border:0;background:#0f1419;"
      title="Política de privacidad" />
  </foreignObject>
</svg>`;
}

async function ensureBucket() {
  if (!DATABASE_URL) {
    throw new Error('Falta DATABASE_URL en .env');
  }

  const sql = readFileSync(join(__dirname, '..', 'supabase', 'public-legal-storage.sql'), 'utf8');
  const client = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query(sql);
  await client.end();
  console.log('✓ Bucket public-legal listo');
}

async function uploadObject(path, body, contentType) {
  const uploadKey = PUBLISHABLE_KEY;
  if (!SUPABASE_URL || !uploadKey) {
    throw new Error('Faltan EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_ANON_KEY en .env');
  }

  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`;
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      apikey: uploadKey,
      Authorization: `Bearer ${uploadKey}`,
      'Content-Type': contentType,
      'x-upsert': 'true',
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Upload fallido (${path}, ${response.status}): ${text}`);
  }
}

async function uploadPrivacyPolicy() {
  const htmlPath = join(__dirname, '..', 'docs', 'privacy.html');
  const html = readFileSync(htmlPath, 'utf8');
  const svg = buildSvgWrapper(html);
  console.log(`· Generado privacy.svg (${svg.length} bytes)`);

  await uploadObject(HTML_PATH, html, 'text/html');
  await uploadObject(PUBLIC_PATH, svg, 'image/svg+xml');

  console.log('✓ Política de privacidad publicada');
  console.log(PUBLIC_URL);
  return PUBLIC_URL;
}

async function main() {
  await ensureBucket();
  await uploadPrivacyPolicy();
}

main().catch((error) => {
  console.error('Error:', error.message ?? error);
  process.exit(1);
});
