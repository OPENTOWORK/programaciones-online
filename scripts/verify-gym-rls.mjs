import 'dotenv/config';
import pg from 'pg';

import { resolveDatabaseUrl } from './lib/annualWorkoutImport.mjs';

const PROJECT_REF = 'nsdurlikkuoxqobabixr';

/** Todas las tablas del CRM deben tener RLS y estar acotadas por gimnasio. */
const GYM_TABLES = [
  'gyms',
  'gym_users',
  'gym_members',
  'gym_class_types',
  'gym_classes',
  'gym_bookings',
  'gym_membership_plans',
  'gym_member_memberships',
  'gym_appointments',
  'gym_tasks',
  'gym_promotions',
  'gym_rewards',
  'gym_loyalty_transactions',
  'gym_program_links',
  'gym_saas_plans',
  'gym_subscriptions',
  'gym_admin_activity',
];

/** Tablas cuyo aislamiento se apoya en `gym_id`. */
const TENANT_TABLES = GYM_TABLES.filter(
  (table) => !['gyms', 'gym_saas_plans'].includes(table),
);

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

  console.log('Rol gimnasio:');
  const { rows: roleRows } = await client.query(
    "select slug from public.roles where slug = 'gimnasio'",
  );
  check('existe el rol gimnasio en la tabla roles', roleRows.length === 1);

  const { rows: constraintRows } = await client.query(
    `select pg_get_constraintdef(oid) as def
     from pg_constraint
     where conrelid = 'public.roles'::regclass and conname = 'roles_slug_check'`,
  );
  check(
    'el CHECK de roles.slug admite gimnasio',
    /gimnasio/.test(constraintRows[0]?.def ?? ''),
  );
  for (const slug of ['atleta', 'entrenador', 'administrador']) {
    check(
      `el CHECK sigue admitiendo ${slug}`,
      new RegExp(slug).test(constraintRows[0]?.def ?? ''),
    );
  }

  console.log('\nRLS activada:');
  const { rows: rlsRows } = await client.query(
    `select relname, relrowsecurity from pg_class where relname = any($1)`,
    [GYM_TABLES],
  );
  for (const table of GYM_TABLES) {
    const row = rlsRows.find((entry) => entry.relname === table);
    check(table, Boolean(row?.relrowsecurity), row ? 'RLS desactivada' : 'tabla ausente');
  }

  const { rows: policies } = await client.query(
    `select tablename, policyname, cmd, qual, with_check
     from pg_policies
     where tablename = any($1)`,
    [GYM_TABLES],
  );

  console.log('\nAislamiento entre gimnasios:');
  for (const table of TENANT_TABLES) {
    const tablePolicies = policies.filter((entry) => entry.tablename === table);

    check(`${table} tiene políticas`, tablePolicies.length > 0, 'sin políticas');

    const allScoped = tablePolicies.every((policy) => {
      const expression = `${policy.qual ?? ''} ${policy.with_check ?? ''}`;
      return /has_gym_access|can_operate_gym|can_manage_gym|is_administrador/.test(expression);
    });

    check(
      `${table} acota por gimnasio o administrador`,
      tablePolicies.length > 0 && allScoped,
      'alguna política no comprueba el gimnasio',
    );
  }

  console.log('\nHelpers de permisos:');
  const { rows: functions } = await client.query(
    `select proname, prosecdef
     from pg_proc
     where proname = any($1)`,
    [
      [
        'is_gimnasio',
        'gym_role_in',
        'has_gym_access',
        'can_operate_gym',
        'can_manage_gym',
        'create_gym',
      ],
    ],
  );
  for (const name of [
    'is_gimnasio',
    'gym_role_in',
    'has_gym_access',
    'can_operate_gym',
    'can_manage_gym',
    'create_gym',
  ]) {
    const fn = functions.find((entry) => entry.proname === name);
    check(`${name} existe y es security definer`, Boolean(fn?.prosecdef), fn ? 'no lo es' : 'no existe');
  }

  console.log('\nGarantías concretas:');

  const gymsSelect = policies.find(
    (entry) => entry.tablename === 'gyms' && entry.policyname === 'Gym members read own gym',
  );
  check(
    'un gimnasio solo lee el suyo',
    /has_gym_access/.test(gymsSelect?.qual ?? ''),
  );

  const gymsAdmin = policies.find((entry) => entry.policyname === 'Admins manage gyms');
  check('crear o borrar gimnasios exige administrador', /is_administrador/.test(gymsAdmin?.qual ?? ''));

  const subscriptionsPolicies = policies.filter(
    (entry) => entry.tablename === 'gym_subscriptions' && ['UPDATE', 'ALL'].includes(entry.cmd),
  );
  check(
    'el gimnasio no puede cambiar su propia suscripción',
    subscriptionsPolicies.length > 0 &&
      subscriptionsPolicies.every((policy) => /is_administrador/.test(policy.qual ?? '')),
  );

  const activityPolicies = policies.filter((entry) => entry.tablename === 'gym_admin_activity');
  check(
    'la actividad administrativa es solo del administrador',
    activityPolicies.length > 0 &&
      activityPolicies.every((policy) => /is_administrador/.test(policy.qual ?? '')),
  );

  const { rows: capacityTrigger } = await client.query(
    `select tgname from pg_trigger where tgname = 'gym_bookings_capacity_trg' and not tgisinternal`,
  );
  check('el aforo se controla con trigger en la base de datos', capacityTrigger.length === 1);

  const { rows: statsView } = await client.query(
    `select reloptions from pg_class where relname = 'gym_dashboard_stats'`,
  );
  check(
    'la vista de métricas usa security_invoker',
    (statsView[0]?.reloptions ?? []).some((option) => option === 'security_invoker=true'),
  );

  // Sin sesión no hay auth.uid(), así que los helpers deben denegar por defecto.
  // Es la garantía de que un gimnasio no alcanza los datos de otro.
  const { rows: denyByDefault } = await client.query(
    `select
       public.has_gym_access(gen_random_uuid()) as access,
       public.can_operate_gym(gen_random_uuid()) as operate,
       public.can_manage_gym(gen_random_uuid()) as manage,
       public.is_administrador() as admin,
       public.is_gimnasio() as gym`,
  );
  const deny = denyByDefault[0] ?? {};
  check('sin sesión, has_gym_access deniega', deny.access === false);
  check('sin sesión, can_operate_gym deniega', deny.operate === false);
  check('sin sesión, can_manage_gym deniega', deny.manage === false);
  check('sin sesión, is_administrador deniega', deny.admin === false);
  check('sin sesión, is_gimnasio deniega', deny.gym === false);

  const { rows: gymIdColumns } = await client.query(
    `select table_name from information_schema.columns
     where table_schema = 'public' and column_name = 'gym_id' and table_name = any($1)`,
    [TENANT_TABLES],
  );
  for (const table of TENANT_TABLES) {
    check(
      `${table} tiene columna gym_id`,
      gymIdColumns.some((row) => row.table_name === table),
    );
  }

  await client.end();

  console.log('');
  if (failures > 0) {
    console.error(`${failures} comprobación(es) han fallado`);
    process.exit(1);
  }
  console.log('✓ Todas las comprobaciones del CRM de gimnasios han pasado');
}

main().catch((error) => {
  console.error('Error:', error.message ?? error);
  process.exit(1);
});
