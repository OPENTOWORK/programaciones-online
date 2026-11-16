import 'dotenv/config';

import { evaluateReadiness, IAP_FUNCTIONS } from './lib/iapReadiness.mjs';
import { catalogRow, foldName, loadStoreProducts, validateStoreProducts } from './lib/storeProducts.mjs';
import { FUNCTIONS_URL, PROJECT_REF, withDatabase } from './lib/supabaseDb.mjs';

const USAGE = `Uso: node scripts/iap-admin.mjs <orden>

  seed                                  Crea o actualiza los productos de data/store-products.json (nunca los pone a la venta)
  status                                Estado de cada producto y comprobaciones para ponerlo a la venta
  activate <product_key...|--all> --confirm-manual-tests
                                        Pone a la venta, solo si todas las comprobaciones pasan
  deactivate <product_key...|--all>     Retira de la venta (quien ya pagó conserva el acceso)
  testers [list]                        Cuentas que ven los productos que aún no están a la venta
  testers add <email> [nota]
  testers remove <email>
  grant <email> <product_key|program_id> [--until AAAA-MM-DD]
                                        Acceso manual (sin tienda) a una programación
  revoke <email> <product_key|program_id>
                                        Retira un acceso manual (nunca toca compras de las tiendas)`;

const PURCHASE_EVIDENCE_STATUSES = ['active', 'grace_period', 'on_hold', 'paused', 'expired', 'cancelled', 'refunded', 'revoked'];

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function loadManifest() {
  const manifest = loadStoreProducts();
  const errors = validateStoreProducts(manifest);
  if (errors.length) fail(`data/store-products.json no es válido:\n  ${errors.join('\n  ')}`);
  return manifest;
}

function selectedKeys(manifest, args) {
  if (args.includes('--all')) return manifest.products.map((product) => product.productKey);
  const keys = args.filter((arg) => !arg.startsWith('--'));
  if (keys.length === 0) fail('Indica los product_key o --all');
  const known = new Set(manifest.products.map((product) => product.productKey));
  const unknown = keys.filter((key) => !known.has(key));
  if (unknown.length) fail(`No están en data/store-products.json: ${unknown.join(', ')}`);
  return keys;
}

async function requireStoreSchema(db) {
  const { rows } = await db.query(`
    select
      to_regclass('public.store_products') is not null as products,
      to_regclass('public.store_testers') is not null as testers
  `);
  if (!rows[0].products || !rows[0].testers) {
    fail('Falta el esquema de compras (o está desactualizado): ejecuta antes npm run supabase:store-purchases');
  }
}

async function findUserByEmail(db, email) {
  const { rows } = await db.query('select id, email from auth.users where lower(email) = lower($1)', [email.trim()]);
  if (rows.length === 0) fail(`No hay ninguna cuenta con el email ${email}`);
  return rows[0];
}

// --- seed ---------------------------------------------------------------------

async function seed(db, manifest) {
  const programIds = manifest.products.flatMap((product) => product.programs.map((program) => program.id));
  const { rows: programs } = await db.query('select id, name from public.programas where id = any($1::uuid[])', [programIds]);
  const programById = new Map(programs.map((program) => [program.id, program]));

  for (const product of manifest.products) {
    for (const program of product.programs) {
      const found = programById.get(program.id);
      if (!found) fail(`${product.productKey}: la programación ${program.name} (${program.id}) no existe`);
      if (foldName(found.name) !== foldName(program.name)) {
        fail(`${product.productKey}: la programación ${program.id} se llama «${found.name}», no «${program.name}»`);
      }
    }
  }

  await db.query('begin');
  try {
    for (const product of manifest.products) {
      const row = catalogRow(product);
      const { rows: existing } = await db.query(
        `select id, product_type, google_product_id, google_base_plan_id, apple_product_id,
                exists (select 1 from public.store_purchases p where p.store_product_id = sp.id) as has_purchases
         from public.store_products sp where product_key = $1`,
        [row.product_key],
      );
      const current = existing[0];
      if (current?.has_purchases) {
        const changed = ['product_type', 'google_product_id', 'google_base_plan_id', 'apple_product_id'].filter(
          (field) => (current[field] ?? null) !== row[field],
        );
        if (changed.length) {
          throw new Error(`${row.product_key} ya tiene compras: no se cambian sus identificadores (${changed.join(', ')})`);
        }
      }

      const { rows: saved } = await db.query(
        `insert into public.store_products
           (product_key, title, description, benefits, product_type, google_product_id, google_base_plan_id,
            apple_product_id, sort_order, active)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, false)
         on conflict (product_key) do update set
           title = excluded.title,
           description = excluded.description,
           benefits = excluded.benefits,
           product_type = excluded.product_type,
           google_product_id = excluded.google_product_id,
           google_base_plan_id = excluded.google_base_plan_id,
           apple_product_id = excluded.apple_product_id,
           sort_order = excluded.sort_order
         returning id, active, (xmax = 0) as inserted`,
        [
          row.product_key,
          row.title,
          row.description,
          row.benefits,
          row.product_type,
          row.google_product_id,
          row.google_base_plan_id,
          row.apple_product_id,
          row.sort_order,
        ],
      );

      for (const program of product.programs) {
        await db.query(
          `insert into public.store_product_programs (store_product_id, program_id)
           values ($1, $2) on conflict do nothing`,
          [saved[0].id, program.id],
        );
      }

      const { rows: extra } = await db.query(
        `select p.name from public.store_product_programs spp
         join public.programas p on p.id = spp.program_id
         where spp.store_product_id = $1 and not (spp.program_id = any($2::uuid[]))`,
        [saved[0].id, product.programs.map((program) => program.id)],
      );
      const state = saved[0].active ? 'a la venta' : 'solo pruebas';
      console.log(`✓ ${row.product_key} ${saved[0].inserted ? 'creado' : 'actualizado'} (${state})`);
      if (extra.length) {
        console.log(`  Aviso: también abre ${extra.map((item) => item.name).join(', ')} (no se quita: quien pagó lo conserva)`);
      }
    }
    await db.query('commit');
  } catch (error) {
    await db.query('rollback');
    throw error;
  }
}

// --- status / readiness ----------------------------------------------------------

async function functionStates() {
  const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  if (token) {
    const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/functions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      const deployed = await response.json();
      return IAP_FUNCTIONS.map((fn) => {
        const found = deployed.find((item) => item.slug === fn.name);
        if (!found) return { name: fn.name, deployed: false, detail: 'no desplegada' };
        const jwtOk = Boolean(found.verify_jwt) === fn.verifyJwt;
        return {
          name: fn.name,
          deployed: found.status === 'ACTIVE' && jwtOk,
          detail: jwtOk ? `versión ${found.version} (${found.status})` : `verify_jwt debería ser ${fn.verifyJwt}`,
        };
      });
    }
  }

  // Sin token de gestión: el gateway responde 404 NOT_FOUND solo si la función no existe.
  return Promise.all(
    IAP_FUNCTIONS.map(async (fn) => {
      try {
        const response = await fetch(`${FUNCTIONS_URL}/${fn.name}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{}',
        });
        const body = await response.text();
        const missing = response.status === 404 && body.includes('NOT_FOUND');
        return { name: fn.name, deployed: !missing, detail: missing ? 'no desplegada (404)' : `responde HTTP ${response.status}` };
      } catch (error) {
        return { name: fn.name, deployed: null, detail: `sin respuesta: ${error.message}` };
      }
    }),
  );
}

async function readinessInputs(db) {
  const { rows: catalog } = await db.query(
    `select id, product_key, product_type, google_product_id, google_base_plan_id, apple_product_id, active, activated_at
     from public.store_products order by sort_order, product_key`,
  );
  const { rows: links } = await db.query(
    `select sp.product_key, spp.program_id from public.store_product_programs spp
     join public.store_products sp on sp.id = spp.store_product_id`,
  );
  const { rows: purchases } = await db.query(
    `select sp.product_key, p.store,
            count(*)::int as verified,
            count(*) filter (where p.acknowledged)::int as acknowledged
     from public.store_purchases p
     join public.store_products sp on sp.id = p.store_product_id
     where p.status = any($1)
     group by sp.product_key, p.store`,
    [PURCHASE_EVIDENCE_STATUSES],
  );
  const { rows: notifications } = await db.query(
    `select store, notification_type, count(*) filter (where status = 'processed')::int as processed
     from public.store_notifications group by store, notification_type`,
  );
  const { rows: counts } = await db.query(
    `select
       (select count(*)::int from public.store_testers) as testers,
       (select count(*)::int from public.store_purchases) as purchases,
       (select count(*)::int from public.store_notifications where status = 'failed') as failed_notifications,
       (select count(*)::int from public.user_entitlements where status = 'active' and source = 'manual') as manual_grants`,
  );
  return { catalog, links, purchases, notifications, counts: counts[0], functions: await functionStates() };
}

function printChecks(checks) {
  let scope = null;
  for (const check of checks) {
    if (check.scope !== scope) {
      scope = check.scope;
      console.log(scope === 'global' ? '\nBackend y notificaciones' : scope === 'manual' ? '\nPruebas manuales' : `\n${scope}`);
    }
    const mark = check.ok ? '✓' : check.blocking ? '✗' : '!';
    console.log(`  ${mark} ${check.label}${check.detail ? ` — ${check.detail}` : ''}`);
  }
}

async function status(db, manifest) {
  const inputs = await readinessInputs(db);
  console.log(`Proyecto ${PROJECT_REF}`);
  console.log('\nCatálogo');
  for (const product of manifest.products) {
    const row = inputs.catalog.find((item) => item.product_key === product.productKey);
    const state = !row ? 'sin crear (npm run iap:seed)' : row.active ? `A LA VENTA desde ${row.activated_at?.toISOString?.() ?? '—'}` : 'solo pruebas';
    console.log(`  ${product.productKey.padEnd(28)} ${state}`);
  }
  const unknown = inputs.catalog.filter((row) => !manifest.products.some((product) => product.productKey === row.product_key));
  for (const row of unknown) console.log(`  ${row.product_key.padEnd(28)} fuera del manifiesto (${row.active ? 'a la venta' : 'inactivo'})`);
  console.log(
    `\nTesters: ${inputs.counts.testers} · compras registradas: ${inputs.counts.purchases} · accesos manuales: ${inputs.counts.manual_grants}` +
      ` · notificaciones con error: ${inputs.counts.failed_notifications}`,
  );

  const { checks, ready } = evaluateReadiness({ manifest, ...inputs });
  printChecks(checks);
  console.log(
    ready
      ? '\nTodo listo: node scripts/iap-admin.mjs activate --all --confirm-manual-tests'
      : '\nNo se puede poner a la venta todavía: faltan las comprobaciones marcadas con ✗.',
  );
}

// --- activate / deactivate ----------------------------------------------------

async function activate(db, manifest, args) {
  const keys = selectedKeys(manifest, args);
  const inputs = await readinessInputs(db);
  const { checks, ready } = evaluateReadiness({
    manifest,
    ...inputs,
    productKeys: keys,
    manualConfirmed: args.includes('--confirm-manual-tests'),
  });
  if (!ready) {
    printChecks(checks.filter((check) => !check.ok && check.blocking));
    fail('No se activa nada: primero tienen que pasar todas las comprobaciones de arriba.');
  }

  const { rows } = await db.query(
    `update public.store_products
     set active = true, activated_at = coalesce(activated_at, now())
     where product_key = any($1) and not active
     returning product_key`,
    [keys],
  );
  console.log(rows.length ? `✓ A la venta: ${rows.map((row) => row.product_key).join(', ')}` : 'Ya estaban a la venta.');
}

async function deactivate(db, manifest, args) {
  const keys = selectedKeys(manifest, args);
  const { rows } = await db.query(
    `update public.store_products set active = false where product_key = any($1) and active returning product_key`,
    [keys],
  );
  console.log(rows.length ? `✓ Retirados de la venta: ${rows.map((row) => row.product_key).join(', ')}` : 'No estaban a la venta.');
  console.log('  Quien ya pagó conserva el acceso hasta que caduque su compra.');
}

// --- testers ----------------------------------------------------------------------

async function testers(db, args) {
  const [action = 'list', email, ...noteParts] = args;
  if (action === 'list') {
    const { rows } = await db.query(
      `select u.email, t.note, t.created_at from public.store_testers t
       join auth.users u on u.id = t.user_id order by t.created_at`,
    );
    if (rows.length === 0) console.log('No hay testers.');
    for (const row of rows) console.log(`  ${row.email}${row.note ? ` — ${row.note}` : ''}`);
    return;
  }
  if (!email) fail('Indica el email');
  const user = await findUserByEmail(db, email);
  if (action === 'add') {
    await db.query(
      `insert into public.store_testers (user_id, note) values ($1, $2)
       on conflict (user_id) do update set note = coalesce(excluded.note, public.store_testers.note)`,
      [user.id, noteParts.join(' ') || null],
    );
    console.log(`✓ ${user.email} ve los productos en pruebas`);
    return;
  }
  if (action === 'remove') {
    const { rowCount } = await db.query('delete from public.store_testers where user_id = $1', [user.id]);
    console.log(rowCount ? `✓ ${user.email} ya no es tester` : `${user.email} no era tester`);
    return;
  }
  fail(`Orden desconocida: testers ${action}`);
}

// --- accesos manuales -----------------------------------------------------------

async function resolvePrograms(db, target) {
  const { rows: byProduct } = await db.query(
    `select spp.program_id, p.name from public.store_products sp
     join public.store_product_programs spp on spp.store_product_id = sp.id
     join public.programas p on p.id = spp.program_id
     where sp.product_key = $1`,
    [target],
  );
  if (byProduct.length) return byProduct;
  if (!/^[0-9a-f-]{36}$/i.test(target)) fail(`«${target}» no es un product_key con programaciones ni un uuid`);
  const { rows } = await db.query('select id as program_id, name from public.programas where id = $1', [target]);
  if (rows.length === 0) fail(`No existe la programación ${target}`);
  return rows;
}

async function grant(db, args) {
  const [email, target] = args.filter((arg) => !arg.startsWith('--'));
  if (!email || !target) fail('Uso: grant <email> <product_key|program_id> [--until AAAA-MM-DD]');
  const untilIndex = args.indexOf('--until');
  const until = untilIndex >= 0 ? args[untilIndex + 1] : null;
  if (until && Number.isNaN(Date.parse(until))) fail(`Fecha no válida: ${until}`);
  const user = await findUserByEmail(db, email);
  const programs = await resolvePrograms(db, target);

  for (const program of programs) {
    const { rowCount } = await db.query(
      `update public.user_entitlements set expires_at = $3, status = 'active'
       where user_id = $1 and program_id = $2 and source = 'manual' and status = 'active'`,
      [user.id, program.program_id, until],
    );
    if (!rowCount) {
      await db.query(
        `insert into public.user_entitlements (user_id, program_id, source, status, expires_at)
         values ($1, $2, 'manual', 'active', $3)`,
        [user.id, program.program_id, until],
      );
    }
    console.log(`✓ ${user.email} tiene acceso a ${program.name}${until ? ` hasta el ${until}` : ' sin fecha de fin'}`);
  }
}

async function revoke(db, args) {
  const [email, target] = args;
  if (!email || !target) fail('Uso: revoke <email> <product_key|program_id>');
  const user = await findUserByEmail(db, email);
  const programs = await resolvePrograms(db, target);
  const { rowCount } = await db.query(
    `update public.user_entitlements set status = 'revoked'
     where user_id = $1 and program_id = any($2::uuid[]) and source = 'manual' and status = 'active'`,
    [user.id, programs.map((program) => program.program_id)],
  );
  console.log(rowCount ? `✓ Acceso manual retirado (${rowCount})` : 'No tenía accesos manuales activos a eso.');
}

// --------------------------------------------------------------------------------

async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (!command || command === 'help' || command === '--help') {
    console.log(USAGE);
    return;
  }
  const manifest = loadManifest();

  await withDatabase(async (db) => {
    await requireStoreSchema(db);
    if (command === 'seed') return seed(db, manifest);
    if (command === 'status') return status(db, manifest);
    if (command === 'activate') return activate(db, manifest, args);
    if (command === 'deactivate') return deactivate(db, manifest, args);
    if (command === 'testers') return testers(db, args);
    if (command === 'grant') return grant(db, args);
    if (command === 'revoke') return revoke(db, args);
    fail(`Orden desconocida: ${command}\n\n${USAGE}`);
  });
}

main().catch((error) => fail(error.message ?? String(error)));
