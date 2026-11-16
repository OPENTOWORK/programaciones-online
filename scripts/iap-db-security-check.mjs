import 'dotenv/config';
import { randomUUID } from 'crypto';

import { withDatabase } from './lib/supabaseDb.mjs';

/**
 * Pruebas de permisos de las compras integradas contra la base de datos real.
 * Todo ocurre dentro de una transacción que siempre se deshace (ROLLBACK): no queda
 * ningún dato de prueba y nadie más ve los productos temporales.
 */

const results = [];

function record(label, ok, detail = '') {
  results.push({ label, ok, detail });
}

async function pickUsers(db) {
  const { rows } = await db.query(`
    select p.id, r.slug
    from public."Perfil" p
    join public.roles r on r.id = p.id_roles
    join auth.users u on u.id = p.id
    where r.slug in ('atleta', 'administrador', 'entrenador')
    order by u.created_at
  `);
  const bySlug = (slug) => rows.filter((row) => row.slug === slug).map((row) => row.id);
  const [athlete, otherAthlete] = bySlug('atleta');
  const [admin] = bySlug('administrador');
  const [trainer] = bySlug('entrenador');
  if (!athlete || !otherAthlete || !admin || !trainer) {
    throw new Error('Hacen falta dos atletas, un administrador y un entrenador para las pruebas');
  }
  return { athlete, otherAthlete, admin, trainer };
}

async function pickPrograms(db) {
  const { rows } = await db.query(`select id from public.programas order by id limit 2`);
  if (rows.length < 2) throw new Error('Hacen falta dos programaciones');
  return { live: rows[0].id, testing: rows[1].id };
}

async function runSecurityChecks(db) {
  await db.query('begin');
  try {
    const users = await pickUsers(db);
    const programs = await pickPrograms(db);
    const tag = randomUUID().slice(0, 8);

    // Como postgres: datos temporales (solo los ve esta transacción).
    const { rows: liveRows } = await db.query(
      `insert into public.store_products (product_key, title, product_type, google_product_id, google_base_plan_id, apple_product_id, active)
       values ($1, 'Prueba a la venta', 'subscription', $2, 'monthly', $3, true) returning id`,
      [`zz.check.live.${tag}`, `zz_check_live_${tag}`, `zz.check.live.${tag}`],
    );
    const { rows: testingRows } = await db.query(
      `insert into public.store_products (product_key, title, product_type, google_product_id, google_base_plan_id, apple_product_id, active)
       values ($1, 'Prueba en pruebas', 'subscription', $2, 'monthly', $3, false) returning id`,
      [`zz.check.testing.${tag}`, `zz_check_testing_${tag}`, `zz.check.testing.${tag}`],
    );
    const live = liveRows[0].id;
    const testing = testingRows[0].id;
    await db.query(`insert into public.store_product_programs (store_product_id, program_id) values ($1, $2), ($3, $4)`, [
      live,
      programs.live,
      testing,
      programs.testing,
    ]);
    const { rows: purchaseRows } = await db.query(
      `insert into public.store_purchases
         (user_id, store_product_id, platform, store, product_id, purchase_key, status, auto_renew, environment,
          purchased_at, expires_at, acknowledged)
       values ($1, $2, 'android', 'google_play', $3, $4, 'active', true, 'sandbox', now(), now() + interval '30 days', true)
       returning id`,
      [users.athlete, live, `zz_check_live_${tag}`, `zz-token-${tag}`],
    );
    const { rows: entitlementRows } = await db.query(
      `insert into public.user_entitlements (user_id, store_product_id, source, store_purchase_id, status, expires_at)
       values ($1, $2, 'google_play', $3, 'active', now() + interval '30 days') returning id`,
      [users.athlete, live, purchaseRows[0].id],
    );
    await db.query(`insert into public.store_testers (user_id, note) values ($1, 'prueba temporal')
                    on conflict (user_id) do nothing`, [users.otherAthlete]);

    async function as(userId, run) {
      await db.query(`select set_config('request.jwt.claims', $1, true)`, [
        JSON.stringify(userId ? { sub: userId, role: 'authenticated' } : { role: 'anon' }),
      ]);
      await db.query(userId ? 'set local role authenticated' : 'set local role anon');
      try {
        return await run();
      } finally {
        await db.query('reset role');
      }
    }

    async function attempt(sql, params = []) {
      await db.query('savepoint check_step');
      try {
        const result = await db.query(sql, params);
        await db.query('release savepoint check_step');
        return { ok: true, rows: result.rows };
      } catch (error) {
        await db.query('rollback to savepoint check_step');
        return { ok: false, code: error.code, message: error.message };
      }
    }

    async function expectDenied(label, userId, sql, params = [], code = '42501') {
      const outcome = await as(userId, () => attempt(sql, params));
      record(label, !outcome.ok && outcome.code === code, outcome.ok ? 'se permitió' : `${outcome.code} ${outcome.message}`);
    }

    const visibleKeys = async (userId) => {
      const outcome = await as(userId, () => attempt('select id from public.store_products'));
      return outcome.ok ? new Set(outcome.rows.map((row) => row.id)) : null;
    };

    // Catálogo: lo inactivo solo lo ven administradores y testers.
    await expectDenied('Sin sesión no se lee el catálogo', null, 'select * from public.store_products');
    const athleteSees = await visibleKeys(users.athlete);
    record('Atleta: ve lo que está a la venta', Boolean(athleteSees?.has(live)));
    record('Atleta: no ve lo que está en pruebas', Boolean(athleteSees && !athleteSees.has(testing)));
    const adminSees = await visibleKeys(users.admin);
    record('Administrador: ve lo que está en pruebas', Boolean(adminSees?.has(testing)));
    const testerSees = await visibleKeys(users.otherAthlete);
    record('Tester: ve lo que está en pruebas', Boolean(testerSees?.has(testing)));
    const athleteLinks = await as(users.athlete, () =>
      attempt('select store_product_id from public.store_product_programs where store_product_id = any($1)', [[live, testing]]),
    );
    record(
      'Atleta: solo ve los vínculos de lo que está a la venta',
      athleteLinks.ok && athleteLinks.rows.length === 1 && athleteLinks.rows[0].store_product_id === live,
    );

    // Tablas privadas: ni lectura ni escritura desde la app.
    await expectDenied('Atleta: no lee store_purchases', users.athlete, 'select * from public.store_purchases');
    await expectDenied('Atleta: no lee user_entitlements', users.athlete, 'select * from public.user_entitlements');
    await expectDenied('Atleta: no lee store_notifications', users.athlete, 'select * from public.store_notifications');
    await expectDenied('Atleta: no lee store_testers', users.athlete, 'select * from public.store_testers');
    await expectDenied(
      'Atleta: no se concede derechos',
      users.otherAthlete,
      `insert into public.user_entitlements (user_id, program_id, source) values ($1, $2, 'manual')`,
      [users.otherAthlete, programs.live],
    );
    await expectDenied(
      'Atleta: no registra compras',
      users.otherAthlete,
      `insert into public.store_purchases (user_id, platform, store, product_id, purchase_key, status)
       values ($1, 'android', 'google_play', 'x', $2, 'active')`,
      [users.otherAthlete, `zz-forged-${tag}`],
    );
    await expectDenied('Atleta: no pone productos a la venta', users.athlete,
      'update public.store_products set active = true where id = $1', [testing]);
    await expectDenied('Atleta: no se hace tester', users.athlete,
      'insert into public.store_testers (user_id) values ($1)', [users.athlete]);
    await expectDenied('Atleta: no ejecuta la función interna de derechos', users.athlete,
      'select public.user_has_program_entitlement($1, $2)', [users.athlete, programs.live]);
    await expectDenied('Sin sesión no se consultan compras', null, 'select * from public.my_store_purchases()');

    // Cada cuenta solo ve lo suyo.
    const ownPurchases = await as(users.athlete, () => attempt('select * from public.my_store_purchases()'));
    const ownRow = ownPurchases.ok ? ownPurchases.rows.find((row) => row.id === purchaseRows[0].id) : null;
    record('Atleta: ve su compra', Boolean(ownRow));
    record('La compra no expone el token de la tienda', Boolean(ownRow) && !('purchase_key' in ownRow));
    const foreignPurchases = await as(users.otherAthlete, () => attempt('select id from public.my_store_purchases()'));
    record('Otro atleta no ve esa compra', foreignPurchases.ok && !foreignPurchases.rows.some((row) => row.id === purchaseRows[0].id));
    const ownAccess = await as(users.athlete, () => attempt('select program_id from public.my_program_entitlements()'));
    record('Atleta: tiene acceso a la programación pagada', ownAccess.ok && ownAccess.rows.some((row) => row.program_id === programs.live));
    const foreignAccess = await as(users.otherAthlete, () => attempt('select program_id from public.my_program_entitlements()'));
    record('Otro atleta no hereda ese acceso', foreignAccess.ok && !foreignAccess.rows.some((row) => row.program_id === programs.live));
    const testerFlag = await as(users.otherAthlete, () => attempt('select public.is_store_tester() as tester'));
    const plainFlag = await as(users.athlete, () => attempt('select public.is_store_tester() as tester'));
    record('is_store_tester() distingue testers', testerFlag.rows?.[0]?.tester === true && plainFlag.rows?.[0]?.tester === false);

    // Una compra caducada deja de dar acceso.
    await db.query(`update public.user_entitlements set expires_at = now() - interval '1 minute' where id = $1`, [entitlementRows[0].id]);
    const expiredAccess = await as(users.athlete, () => attempt('select program_id from public.my_program_entitlements()'));
    record('Caducada: deja de dar acceso', expiredAccess.ok && !expiredAccess.rows.some((row) => row.program_id === programs.live));
    await db.query(`update public.user_entitlements set expires_at = now() + interval '30 days' where id = $1`, [entitlementRows[0].id]);

    // Un token de compra no puede pertenecer a dos cuentas; un webhook no se procesa dos veces.
    const reuse = await attempt(
      `insert into public.store_purchases (user_id, platform, store, product_id, purchase_key, status)
       values ($1, 'android', 'google_play', $2, $3, 'active')`,
      [users.otherAthlete, `zz_check_live_${tag}`, `zz-token-${tag}`],
    );
    record('Token reutilizado en otra cuenta: rechazado', !reuse.ok && reuse.code === '23505', reuse.code ?? 'se permitió');
    const notification = `zz-notification-${tag}`;
    await db.query(`insert into public.store_notifications (store, notification_id, notification_type) values ('google_play', $1, 'test')`, [notification]);
    const duplicate = await attempt(
      `insert into public.store_notifications (store, notification_id, notification_type) values ('google_play', $1, 'test')`,
      [notification],
    );
    record('Notificación repetida: rechazada', !duplicate.ok && duplicate.code === '23505', duplicate.code ?? 'se permitió');

    // Trigger: activar una programación a la venta exige haberla pagado.
    const activate = (userId, programId) =>
      as(userId, () =>
        attempt(
          `insert into public.user_programs (user_id, program_id, status, started_at)
           values ($1, $2, 'activa', now())
           on conflict (user_id, program_id) do update set status = excluded.status, started_at = excluded.started_at`,
          [userId, programId],
        ),
      );
    const unpaid = await activate(users.otherAthlete, programs.live);
    record('Sin pagar no se activa una programación a la venta', !unpaid.ok && unpaid.message.includes('PURCHASE_REQUIRED'),
      unpaid.ok ? 'se permitió' : unpaid.message);
    const paid = await activate(users.athlete, programs.live);
    record('Pagada: se activa', paid.ok, paid.message ?? '');
    const notOnSale = await activate(users.otherAthlete, programs.testing);
    record('En pruebas: no bloquea a nadie', notOnSale.ok, notOnSale.message ?? '');
    const adminSelf = await activate(users.admin, programs.live);
    record('Administrador: no se le bloquea', adminSelf.ok, adminSelf.message ?? '');

    await db.query(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: users.trainer, role: 'authenticated' })]);
    const assigned = await attempt(
      `insert into public.user_programs (user_id, program_id, status, started_at) values ($1, $2, 'activa', now())
       on conflict (user_id, program_id) do update set status = excluded.status`,
      [users.otherAthlete, programs.live],
    );
    record('Asignación del entrenador o del admin: no se bloquea', assigned.ok, assigned.message ?? '');
    const keepGoing = await as(users.otherAthlete, () =>
      attempt(`update public.user_programs set status = 'activa' where user_id = $1 and program_id = $2`, [users.otherAthlete, programs.live]),
    );
    record('Acceso ya asignado: se conserva (sin bloqueo retroactivo)', keepGoing.ok, keepGoing.message ?? '');
  } finally {
    await db.query('rollback');
  }
  return results;
}

withDatabase(runSecurityChecks)
  .then((checks) => {
    for (const check of checks) {
      console.log(`${check.ok ? '✓' : '✗'} ${check.label}${!check.ok && check.detail ? ` — ${check.detail}` : ''}`);
    }
    const failed = checks.filter((check) => !check.ok).length;
    console.log(`\n${checks.length - failed}/${checks.length} comprobaciones superadas (transacción deshecha: no queda ningún dato).`);
    if (failed) process.exit(1);
  })
  .catch((error) => {
    console.error('Error:', error.message ?? error);
    process.exit(1);
  });
