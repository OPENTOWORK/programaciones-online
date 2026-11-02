import 'dotenv/config';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

import { resolveDatabaseUrl } from './lib/annualWorkoutImport.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

function readOption(name) {
  const prefix = `--${name}=`;
  const withEquals = process.argv.find((arg) => arg.startsWith(prefix));
  if (withEquals) return withEquals.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0) return process.argv[index + 1];
  return undefined;
}

const platform = readOption('platform')?.trim().toLowerCase();
const minVersion = readOption('min-version')?.trim();
const minBuildRaw = readOption('min-build');
const latestVersion = readOption('latest-version')?.trim();
const message = readOption('message')?.trim();
const fromAppJson = process.argv.includes('--from-app-json');

if (!platform || !['android', 'ios'].includes(platform)) {
  console.error(
    'Uso: node scripts/set-app-release-requirement.mjs --platform android [--from-app-json] [--min-version 1.0.16] [--min-build 17] [--latest-version 1.0.16] [--message "Oye, actualiza"]',
  );
  process.exit(1);
}

let resolvedMinVersion = minVersion;
let resolvedMinBuild = minBuildRaw ? Number.parseInt(minBuildRaw, 10) : undefined;
let resolvedLatestVersion = latestVersion;

if (fromAppJson) {
  const appJson = JSON.parse(readFileSync(join(__dirname, '..', 'app.json'), 'utf8'));
  resolvedMinVersion = resolvedMinVersion ?? appJson.expo.version;
  resolvedLatestVersion = resolvedLatestVersion ?? appJson.expo.version;
  if (platform === 'android') {
    resolvedMinBuild = resolvedMinBuild ?? appJson.expo.android?.versionCode;
  } else {
    const buildNumber = appJson.expo.ios?.buildNumber;
    resolvedMinBuild = resolvedMinBuild ?? (buildNumber ? Number.parseInt(buildNumber, 10) : undefined);
  }
}

if (!resolvedMinVersion) {
  console.error('Indica --min-version o usa --from-app-json');
  process.exit(1);
}

const dbUrl = resolveDatabaseUrl('nsdurlikkuoxqobabixr') ?? process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error('Falta DATABASE_URL o SUPABASE_DB_PASSWORD en .env');
}

const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
await client.connect();

try {
  const { rows } = await client.query(
    `update public.app_release_requirements
     set min_supported_version = $2,
         min_supported_build = coalesce($3, min_supported_build),
         latest_version = coalesce($4, latest_version),
         update_message = coalesce($5, update_message),
         updated_at = now()
     where platform = $1
     returning platform, min_supported_version, min_supported_build, latest_version, update_message`,
    [
      platform,
      resolvedMinVersion,
      Number.isFinite(resolvedMinBuild) ? resolvedMinBuild : null,
      resolvedLatestVersion ?? null,
      message ?? null,
    ],
  );

  if (rows.length === 0) {
    throw new Error(`No existe fila para platform=${platform}. Ejecuta npm run supabase:app-updates primero.`);
  }

  console.log('✓ Requisito de actualización actualizado:');
  console.log(rows[0]);
} finally {
  await client.end();
}
