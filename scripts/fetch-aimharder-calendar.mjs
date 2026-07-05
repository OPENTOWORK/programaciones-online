import 'dotenv/config';
import { writeFileSync } from 'fs';

const BOX = process.env.AIMHARDER_BOX || 'opentowork';
const SESSION_COOKIE = process.env.AIMHARDER_SESSION || process.env.AIMHARDER_PHPSESSID || '';
const CALENDAR_URL =
  process.env.AIMHARDER_CALENDAR_URL ||
  `https://${BOX}.aimharder.com/control/getRatesCalendar`;

function parseArgs(argv) {
  const today = new Date();
  const defaultFrom = today.toISOString().slice(0, 10);
  const defaultToDate = new Date(today);
  defaultToDate.setDate(defaultToDate.getDate() + 13);

  const fromIndex = argv.indexOf('--from');
  const toIndex = argv.indexOf('--to');
  const outIndex = argv.indexOf('--out');

  return {
    from: fromIndex >= 0 ? argv[fromIndex + 1] : defaultFrom,
    to: toIndex >= 0 ? argv[toIndex + 1] : defaultToDate.toISOString().slice(0, 10),
    out: outIndex >= 0 ? argv[outIndex + 1] : 'aimharder-calendar.json',
  };
}

function buildCookieHeader() {
  if (!SESSION_COOKIE) return '';
  if (SESSION_COOKIE.includes('=')) return SESSION_COOKIE;
  return `PHPSESSID=${SESSION_COOKIE}`;
}

async function fetchCalendar({ from, to }) {
  const cookie = buildCookieHeader();

  if (!cookie) {
    throw new Error(
      'Falta la cookie de sesión. Copia PHPSESSID desde DevTools y añádela a .env como AIMHARDER_SESSION=...',
    );
  }

  const body = new URLSearchParams({
    fechaini: from,
    fechafin: to,
  });

  const response = await fetch(CALENDAR_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Cookie: cookie,
      'X-Requested-With': 'XMLHttpRequest',
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`AimHarder respondió ${response.status}. Revisa AIMHARDER_SESSION y AIMHARDER_CALENDAR_URL.`);
  }

  const text = await response.text();
  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('La respuesta de AimHarder no es JSON. Comprueba la URL del calendario en DevTools.');
  }

  if (!data?.workouts) {
    throw new Error('Respuesta sin campo "workouts". Puede que la sesión haya caducado.');
  }

  return data;
}

async function main() {
  const { from, to, out } = parseArgs(process.argv.slice(2));

  console.log(`Descargando calendario AimHarder (${BOX}) ${from} → ${to}...`);
  const calendar = await fetchCalendar({ from, to });
  const dates = Object.keys(calendar.workouts ?? {});

  writeFileSync(out, JSON.stringify(calendar));
  console.log(`✓ Guardado ${out} (${dates.length} días)`);

  if (dates.length > 0) {
    console.log(`  Rango: ${dates[0]} → ${dates[dates.length - 1]}`);
  }
}

main().catch((error) => {
  console.error('Error:', error.message ?? error);
  process.exit(1);
});
