import 'dotenv/config';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const PROJECT_REF = 'nsdurlikkuoxqobabixr';
const PUBLIC_URL = `https://${PROJECT_REF}.supabase.co/functions/v1/privacy-policy`;

function main() {
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  if (!accessToken) {
    console.error('Falta SUPABASE_ACCESS_TOKEN en .env');
    console.error('Crea un token en: https://supabase.com/dashboard/account/tokens');
    process.exit(1);
  }

  const result = spawnSync(
    'npx',
    [
      'supabase@latest',
      'functions',
      'deploy',
      'privacy-policy',
      '--project-ref',
      PROJECT_REF,
      '--no-verify-jwt',
    ],
    {
      cwd: projectRoot,
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        SUPABASE_ACCESS_TOKEN: accessToken,
      },
    },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  console.log('✓ Edge Function desplegada');
  console.log(PUBLIC_URL);
}

main();
