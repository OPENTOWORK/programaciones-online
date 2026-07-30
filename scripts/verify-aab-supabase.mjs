import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PRODUCTION_SUPABASE_URL = 'https://nsdurlikkuoxqobabixr.supabase.co';
const PRODUCTION_SUPABASE_ANON_KEY =
  'sb_publishable_GZfJfr6RdAgbu9W9fy1O1Q_8DAgtf0k';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const aabPath = path.join(__dirname, '..', 'dist', 'training-progline.aab');

if (!fs.existsSync(aabPath)) {
  console.error('No existe dist/training-progline.aab');
  process.exit(1);
}

const { execSync } = await import('node:child_process');
const tmpDir = path.join(process.env.TEMP ?? '/tmp', 'verify-supabase-aab');
fs.rmSync(tmpDir, { recursive: true, force: true });
fs.mkdirSync(tmpDir, { recursive: true });

const zipPath = path.join(tmpDir, 'app.zip');
fs.copyFileSync(aabPath, zipPath);
execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${path.join(tmpDir, 'extracted')}' -Force"`, {
  stdio: 'inherit',
});

function findBundle(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = findBundle(fullPath);
      if (nested) return nested;
    } else if (entry.name === 'index.android.bundle') {
      return fullPath;
    }
  }
  return null;
}

const bundlePath = findBundle(path.join(tmpDir, 'extracted'));
if (!bundlePath) {
  console.error('No se encontro index.android.bundle en el AAB');
  process.exit(1);
}

const bundle = fs.readFileSync(bundlePath, 'utf8');
const checks = [
  ['URL Supabase', PRODUCTION_SUPABASE_URL],
  ['Anon key Supabase', PRODUCTION_SUPABASE_ANON_KEY],
  ['Modo demo desactivado en nativo', 'isAuthDemoMode'],
];

let failed = false;
for (const [label, needle] of checks) {
  const ok = bundle.includes(needle);
  console.log(`${ok ? 'OK' : 'FAIL'} ${label}`);
  if (!ok) failed = true;
}

if (failed) {
  process.exit(1);
}

console.log('Verificacion Supabase del AAB completada.');
