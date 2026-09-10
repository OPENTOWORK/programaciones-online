import 'dotenv/config';
import pg from 'pg';

import { resolveDatabaseUrl } from './lib/annualWorkoutImport.mjs';

const PROJECT_REF = 'nsdurlikkuoxqobabixr';

/** Comprobaciones de solo lectura sobre la RLS del soporte en la base de datos real. */
const EXPECTED_POLICIES = {
  support_tickets: [
    ['Users view own support tickets', 'SELECT'],
    ['Admins view all support tickets', 'SELECT'],
    ['Users create own support tickets', 'INSERT'],
    ['Admins manage support tickets', 'ALL'],
  ],
  support_messages: [
    ['Users view own ticket messages', 'SELECT'],
    ['Admins view all support messages', 'SELECT'],
    ['Users reply to own support tickets', 'INSERT'],
    ['Admins manage support messages', 'ALL'],
  ],
};

let failures = 0;

function check(label, ok, detail = '') {
  if (ok) {
    console.log(`  ✓ ${label}`);
    return;
  }
  failures += 1;
  console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`);
}

async function main() {
  const databaseUrl = resolveDatabaseUrl(PROJECT_REF);
  if (!databaseUrl) {
    throw new Error('Falta DATABASE_URL o SUPABASE_DB_PASSWORD en .env');
  }

  const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log('RLS activada:');
  const { rows: rlsRows } = await client.query(
    `select relname, relrowsecurity
     from pg_class
     where relname in ('support_tickets', 'support_messages')`,
  );
  for (const table of ['support_tickets', 'support_messages']) {
    const row = rlsRows.find((entry) => entry.relname === table);
    check(table, Boolean(row?.relrowsecurity), row ? 'RLS desactivada' : 'tabla ausente');
  }

  const { rows: policies } = await client.query(
    `select tablename, policyname, cmd, qual, with_check
     from pg_policies
     where tablename in ('support_tickets', 'support_messages')`,
  );

  for (const [table, expected] of Object.entries(EXPECTED_POLICIES)) {
    console.log(`\nPolíticas de ${table}:`);
    for (const [name, cmd] of expected) {
      const policy = policies.find(
        (entry) => entry.tablename === table && entry.policyname === name,
      );
      check(`${name} (${cmd})`, policy?.cmd === cmd, policy ? `es ${policy.cmd}` : 'no existe');
    }
  }

  console.log('\nGarantías concretas:');

  const usersViewTickets = policies.find((p) => p.policyname === 'Users view own support tickets');
  check(
    'el usuario solo consulta sus tickets',
    /requester_id = auth\.uid\(\)/.test(usersViewTickets?.qual ?? ''),
  );

  const usersViewMessages = policies.find((p) => p.policyname === 'Users view own ticket messages');
  check(
    'el usuario no puede leer notas internas',
    /is_internal/.test(usersViewMessages?.qual ?? ''),
  );

  const usersReply = policies.find((p) => p.policyname === 'Users reply to own support tickets');
  check(
    'el usuario solo responde en tickets no cerrados',
    /closed/.test(usersReply?.with_check ?? ''),
  );
  check(
    'el usuario no puede falsear su rol al responder',
    /current_user_role_slug/.test(usersReply?.with_check ?? ''),
  );

  const adminManage = policies.find((p) => p.policyname === 'Admins manage support tickets');
  check(
    'cambiar estado o prioridad exige is_administrador()',
    /is_administrador/.test(adminManage?.qual ?? ''),
  );

  const ticketUpdatePolicies = policies.filter(
    (p) => p.tablename === 'support_tickets' && ['UPDATE', 'ALL'].includes(p.cmd),
  );
  check(
    'ninguna política deja al usuario modificar un ticket',
    ticketUpdatePolicies.length > 0 &&
      ticketUpdatePolicies.every((p) => /is_administrador/.test(p.qual ?? '')),
  );

  const { rows: functions } = await client.query(
    `select proname, prosecdef
     from pg_proc
     where proname in ('create_support_ticket', 'mark_support_messages_read')`,
  );
  for (const name of ['create_support_ticket', 'mark_support_messages_read']) {
    const fn = functions.find((entry) => entry.proname === name);
    check(`${name} es security definer`, Boolean(fn?.prosecdef), fn ? 'no lo es' : 'no existe');
  }

  const { rows: views } = await client.query(
    `select reloptions
     from pg_class
     where relname = 'support_ticket_unread'`,
  );
  check(
    'la vista de no leídos usa security_invoker',
    (views[0]?.reloptions ?? []).some((option) => option === 'security_invoker=true'),
  );

  await client.end();

  console.log('');
  if (failures > 0) {
    console.error(`${failures} comprobación(es) de seguridad han fallado`);
    process.exit(1);
  }
  console.log('✓ Todas las comprobaciones de seguridad del soporte han pasado');
}

main().catch((error) => {
  console.error('Error:', error.message ?? error);
  process.exit(1);
});
