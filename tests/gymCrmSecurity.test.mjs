import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, '..', 'supabase', 'gym-crm.sql'), 'utf8');

/** SQL sin comentarios, para comprobar solo lo que se ejecuta. */
const statements = sql
  .split('\n')
  .filter((line) => !line.trimStart().startsWith('--'))
  .join('\n');

/** Tablas del CRM que deben estar acotadas por gimnasio. */
const TENANT_TABLES = [
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
  'gym_subscriptions',
  'gym_admin_activity',
];

describe('rol gimnasio', () => {
  it('amplía el CHECK de roles sin quitar los existentes', () => {
    const match = statements.match(/check \(slug in \(([^)]+)\)\)/);
    assert.ok(match, 'Falta el CHECK de roles.slug');

    for (const slug of ['atleta', 'entrenador', 'administrador', 'gimnasio']) {
      assert.match(match[1], new RegExp(`'${slug}'`), `El CHECK debe admitir ${slug}`);
    }
  });

  it('no crea un segundo sistema de roles', () => {
    assert.doesNotMatch(statements, /create table if not exists public\.roles/);
    assert.match(statements, /insert into public\.roles/);
  });

  it('no borra ni vacía tablas existentes', () => {
    assert.doesNotMatch(statements, /drop table/i);
    assert.doesNotMatch(statements, /truncate/i);
    assert.doesNotMatch(statements, /drop column/i);
  });
});

describe('multi-tenancy', () => {
  it('cada tabla del CRM lleva gym_id', () => {
    for (const table of TENANT_TABLES) {
      const start = statements.indexOf(`create table if not exists public.${table} (`);
      assert.notEqual(start, -1, `Falta la tabla ${table}`);

      const body = statements.slice(start, statements.indexOf(');', start));
      assert.match(body, /gym_id uuid not null references public\.gyms\(id\) on delete cascade/);
    }
  });

  it('activa RLS en todas las tablas del CRM', () => {
    for (const table of [...TENANT_TABLES, 'gyms', 'gym_saas_plans']) {
      assert.match(
        statements,
        new RegExp(`alter table public\\.${table} enable row level security`),
        `Falta RLS en ${table}`,
      );
    }
  });

  it('los helpers de permisos son security definer para no recursar en gym_users', () => {
    for (const fn of ['gym_role_in', 'has_gym_access', 'can_operate_gym', 'can_manage_gym']) {
      const start = statements.indexOf(`create or replace function public.${fn}`);
      assert.notEqual(start, -1, `Falta la función ${fn}`);

      const body = statements.slice(start, statements.indexOf('$$;', start));
      assert.match(body, /security definer/, `${fn} debe ser security definer`);
    }
  });

  it('los helpers deniegan por defecto: null in (...) daría null, no false', () => {
    for (const fn of ['can_operate_gym', 'can_manage_gym']) {
      const start = statements.indexOf(`create or replace function public.${fn}`);
      const body = statements.slice(start, statements.indexOf('$$;', start));

      assert.match(
        body,
        /coalesce\(public\.gym_role_in\(target_gym\), ''\) in \(/,
        `${fn} debe envolver gym_role_in en coalesce para no devolver null`,
      );
    }
  });

  it('las políticas se apoyan en los helpers de gimnasio, no en filtros del cliente', () => {
    const policyBlocks = statements.split('create policy').slice(1);
    assert.ok(policyBlocks.length > 0);

    for (const block of policyBlocks) {
      assert.match(
        block,
        /has_gym_access|can_operate_gym|can_manage_gym|is_administrador|using \(true\)/,
        'Cada política debe comprobar el gimnasio o el rol de administrador',
      );
    }
  });
});

describe('separación de responsabilidades', () => {
  it('solo el administrador crea gimnasios y cambia suscripciones', () => {
    const gymsAdmin = statements.slice(
      statements.indexOf('create policy "Admins manage gyms"'),
    );
    assert.match(gymsAdmin.slice(0, 400), /public\.is_administrador\(\)/);

    const subscriptions = statements.slice(
      statements.indexOf('create policy "Admins manage subscriptions"'),
    );
    assert.match(subscriptions.slice(0, 400), /public\.is_administrador\(\)/);
  });

  it('create_gym exige administrador', () => {
    const start = statements.indexOf('create or replace function public.create_gym');
    const body = statements.slice(start, statements.indexOf('grant execute on function public.create_gym'));

    assert.match(body, /security definer/);
    assert.match(body, /if not public\.is_administrador\(\) then/);
  });

  it('distingue tarifas de clientes de la suscripción del gimnasio', () => {
    assert.match(statements, /create table if not exists public\.gym_membership_plans/);
    assert.match(statements, /create table if not exists public\.gym_saas_plans/);
    assert.match(statements, /create table if not exists public\.gym_subscriptions/);
  });
});

describe('reglas de negocio en la base de datos', () => {
  it('el aforo nunca se supera: pasa a lista de espera', () => {
    const start = statements.indexOf(
      'create or replace function public.gym_bookings_enforce_capacity',
    );
    assert.notEqual(start, -1);

    const body = statements.slice(start, statements.indexOf('$$;', start));
    assert.match(body, /v_taken >= v_capacity/);
    assert.match(body, /new\.status := 'waiting'/);
  });

  it('al cancelar una plaza, promueve al primero en lista de espera', () => {
    const start = statements.indexOf(
      'create or replace function public.gym_bookings_promote_waitlist',
    );
    assert.notEqual(start, -1);

    const body = statements.slice(start, statements.indexOf('$$;', start));
    assert.match(body, /status = 'waiting'/);
    assert.match(body, /order by b\.booked_at asc/);
    assert.match(body, /set status = 'confirmed'/);
    assert.match(statements, /gym_bookings_promote_waitlist_trg/);
  });

  it('la vista de métricas respeta la RLS de quien consulta', () => {
    assert.match(statements, /create view public\.gym_dashboard_stats\s*\nwith \(security_invoker = true\)/);
  });

  it('crea los índices de las columnas que se consultan', () => {
    for (const fragment of [
      'gym_users (gym_id)',
      'gym_members (gym_id, status)',
      'gym_classes (gym_id, start_at)',
      'gym_bookings (class_id, status)',
      'gym_subscriptions (status)',
    ]) {
      assert.ok(statements.includes(fragment), `Falta índice para ${fragment}`);
    }
  });
});
