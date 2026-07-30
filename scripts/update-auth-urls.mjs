import 'dotenv/config';

const PROJECT_REF = 'nsdurlikkuoxqobabixr';
const PRODUCTION_ORIGIN = 'https://trainingprogline.es';

const REDIRECT_URLS = [
  `${PRODUCTION_ORIGIN}/**`,
  `${PRODUCTION_ORIGIN}/auth/confirm-email`,
  `${PRODUCTION_ORIGIN}/auth/update-password`,
  'http://localhost:3000/**',
  'http://localhost:3000/auth/confirm-email',
  'http://localhost:3000/auth/update-password',
  'https://programaciones-online.vercel.app/**',
  'https://programaciones-online.vercel.app/auth/confirm-email',
  'https://programaciones-online.vercel.app/auth/update-password',
  'programaciones-online://**',
  'programaciones-online://auth/confirm-email',
  'programaciones-online://auth/update-password',
  'programaciones-online:///auth/confirm-email',
  'programaciones-online:///auth/update-password',
];

const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error('Falta SUPABASE_ACCESS_TOKEN en .env');
  console.error('Créalo en https://supabase.com/dashboard/account/tokens');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};

const currentRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`, { headers });
if (!currentRes.ok) {
  console.error('No se pudo leer la config auth:', currentRes.status, await currentRes.text());
  process.exit(1);
}

const current = await currentRes.json();
const mergedRedirects = Array.from(
  new Set([...(current.uri_allow_list ? current.uri_allow_list.split(',') : []), ...REDIRECT_URLS].map((v) => v.trim()).filter(Boolean)),
);

const patchBody = {
  ...current,
  site_url: PRODUCTION_ORIGIN,
  uri_allow_list: mergedRedirects.join(','),
};

const patchRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`, {
  method: 'PATCH',
  headers,
  body: JSON.stringify(patchBody),
});

if (!patchRes.ok) {
  console.error('No se pudo actualizar auth:', patchRes.status, await patchRes.text());
  process.exit(1);
}

const updated = await patchRes.json();
console.log('✓ Site URL:', updated.site_url);
console.log('✓ Redirect URLs:', updated.uri_allow_list);
