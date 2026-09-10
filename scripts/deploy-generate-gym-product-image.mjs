import 'dotenv/config';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const PROJECT_REF = 'nsdurlikkuoxqobabixr';
const PUBLIC_URL = `https://${PROJECT_REF}.supabase.co/functions/v1/generate-gym-product-image`;

function runSupabase(args) {
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error(
      'Falta SUPABASE_ACCESS_TOKEN en .env. Crea un token en https://supabase.com/dashboard/account/tokens',
    );
  }

  const result = spawnSync('npx', ['supabase@latest', ...args, '--project-ref', PROJECT_REF], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      SUPABASE_ACCESS_TOKEN: accessToken,
    },
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function main() {
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (openaiKey) {
    runSupabase(['secrets', 'set', `OPENAI_API_KEY=${openaiKey}`]);
  } else {
    console.warn('Aviso: no hay OPENAI_API_KEY en .env. Configúrala en Supabase → Edge Functions → Secrets.');
  }

  runSupabase(['functions', 'deploy', 'generate-gym-product-image']);
  console.log('✓ Edge Function generate-gym-product-image desplegada');
  console.log(PUBLIC_URL);
}

main();
