#!/usr/bin/env node
/**
 * Diagnóstico de confirmación de email para un usuario.
 * Uso: node scripts/diagnose-signup-email.mjs tu@email.com
 */
import 'dotenv/config';
import pg from 'pg';

const email = (process.argv[2] || '').trim().toLowerCase();
if (!email) {
  console.error('Uso: node scripts/diagnose-signup-email.mjs tu@email.com');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('Falta DATABASE_URL en .env');
  process.exit(1);
}

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const { rows } = await client.query(
  `select id, email, email_confirmed_at, confirmation_sent_at, created_at, last_sign_in_at
   from auth.users
   where lower(email) = $1
   limit 1`,
  [email],
);

console.log('\n=== Diagnóstico confirmación email ===');
console.log('Email consultado:', email);

if (rows.length === 0) {
  console.log('\nEstado: NO REGISTRADO en auth.users');
  console.log('→ Supabase no ha creado el usuario. Revisa errores al registrarte en la app.');
  console.log('→ Si la app mostró "Revisa tu email" sin error, puede ser rate limit o fallo de red.');
} else {
  const user = rows[0];
  console.log('\nEstado: REGISTRADO');
  console.log('Creado:', user.created_at);
  console.log('Confirmado:', user.email_confirmed_at ?? 'NO');
  console.log('Correo enviado (confirmation_sent_at):', user.confirmation_sent_at ?? 'NUNCA');

  if (user.email_confirmed_at) {
    console.log('\n✓ Email ya confirmado. Puedes iniciar sesión directamente.');
  } else if (user.confirmation_sent_at) {
    console.log('\n→ Supabase SÍ registró envío del correo.');
    console.log('  1. Revisa SPAM / Promociones / Correo no deseado');
    console.log('  2. Remitente: noreply@mail.app.supabase.co');
    console.log('  3. Hotmail/Outlook a veces tarda 5–15 min');
    console.log('  4. Usa "Reenviar email" en la app (espera 60 min si hubo rate limit)');
  } else {
    console.log('\n→ Usuario existe pero confirmation_sent_at es NULL.');
    console.log('  Posible email duplicado sin reenvío, o confirmación desactivada en Supabase.');
    console.log('  Prueba "Reenviar email" o confirma manualmente en Dashboard.');
  }
}

console.log('\n=== Comprobaciones Supabase Dashboard ===');
console.log('Authentication → Providers → Email → Confirm email: ON');
console.log('Authentication → URL Configuration → Redirect URLs incluye:');
console.log('  programaciones-online://**');
console.log('  programaciones-online:///auth/confirm-email');
console.log('Authentication → Rate Limits (plan free: ~4 emails/hora)');

await client.end();
