import 'dotenv/config';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

const today = new Date();
const from = formatDate(today);
const to = formatDate(addDays(today, 14));

console.log(`Sync semanal AimHarder (${process.env.AIMHARDER_BOX || 'opentowork'})`);
console.log(`Rango: ${from} → ${to}`);

const result = spawnSync(
  process.execPath,
  [join(__dirname, 'sync-aimharder.mjs'), '--fetch', '--from', from, '--to', to],
  {
    stdio: 'inherit',
    cwd: root,
    env: process.env,
  },
);

process.exit(result.status ?? 1);
