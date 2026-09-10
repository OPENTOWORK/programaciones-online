import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const assetsDir = path.join(projectRoot, 'assets', 'playstore', 'screenshots');

const BASE_URL = process.env.SCREENSHOT_BASE_URL?.trim() || 'https://trainingprogline.es';
const EMAIL = process.env.SCREENSHOT_EMAIL?.trim() || 'charly-7-8@hotmail.com';
const PASSWORD = process.env.SCREENSHOT_PASSWORD?.trim() || '5191996Ca';

const VIEWPORT = { width: 428, height: 926 };
const OUTPUT_SIZES = [
  { label: '1284x2778', width: 1284, height: 2778 },
  { label: '1242x2688', width: 1242, height: 2688 },
];

const CAPTURES = [
  {
    slug: '01-portada',
    path: '/',
    caption: 'Tu entrenamiento, centralizado',
    auth: false,
    waitMs: 2500,
  },
  {
    slug: '02-programaciones',
    path: '/tabs/programs',
    caption: 'Explora programaciones',
    auth: true,
    waitMs: 3500,
  },
  {
    slug: '03-inicio',
    path: '/tabs/home',
    caption: 'Tu plan, adaptado a ti',
    auth: true,
    waitMs: 3500,
  },
  {
    slug: '04-progreso',
    path: '/tabs/progress',
    caption: 'Mide tu progreso',
    auth: true,
    waitMs: 3500,
  },
  {
    slug: '05-atletas',
    path: '/tabs/trainer',
    caption: 'Gestiona a tus atletas',
    auth: true,
    waitMs: 3500,
  },
];

function ensurePlaywright() {
  const install = spawnSync('npx', ['playwright', 'install', 'chromium'], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true,
  });
  if (install.status !== 0) {
    throw new Error('No se pudo instalar Chromium para Playwright.');
  }
}

async function login(page) {
  await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
  await page.locator('input[placeholder="tu@email.com"]').fill(EMAIL);
  await page.locator('input[placeholder="••••••••"]').fill(PASSWORD);
  await page.getByText('Iniciar sesión', { exact: true }).click();
  await page.waitForURL((url) => !url.pathname.includes('/auth/login'), { timeout: 30000 });
  await page.waitForTimeout(2000);
}

async function captureScreenshots(page) {
  const rawDir = path.join(assetsDir, 'raw');
  fs.mkdirSync(rawDir, { recursive: true });

  for (const capture of CAPTURES) {
    if (capture.auth) {
      await page.goto(`${BASE_URL}${capture.path}`, { waitUntil: 'networkidle' });
    } else {
      await page.goto(`${BASE_URL}${capture.path}`, { waitUntil: 'networkidle' });
    }
    await page.waitForTimeout(capture.waitMs);
    const outputPath = path.join(rawDir, `${capture.slug}.png`);
    await page.screenshot({ path: outputPath, fullPage: false });
    console.log(`✓ Captura: ${capture.slug}`);
  }
}

function captionSvg(caption, width, height) {
  const safeCaption = caption.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const barHeight = Math.round(height * 0.14);
  const fontSize = Math.round(width * 0.044);
  const textY = height - Math.round(barHeight * 0.38);

  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(15,20,25,0)" />
          <stop offset="55%" stop-color="rgba(15,20,25,0.55)" />
          <stop offset="100%" stop-color="rgba(15,20,25,0.92)" />
        </linearGradient>
      </defs>
      <rect x="0" y="${height - barHeight}" width="${width}" height="${barHeight}" fill="url(#shade)" />
      <text
        x="50%"
        y="${textY}"
        text-anchor="middle"
        fill="#FFFFFF"
        font-family="Segoe UI, Arial, sans-serif"
        font-size="${fontSize}"
        font-weight="700"
      >${safeCaption}</text>
      <text
        x="50%"
        y="${textY + fontSize * 1.15}"
        text-anchor="middle"
        fill="#FF8A3D"
        font-family="Segoe UI, Arial, sans-serif"
        font-size="${Math.round(fontSize * 0.42)}"
        font-weight="600"
        letter-spacing="6"
      >TRAINING PROGLINE</text>
    </svg>
  `);
}

async function exportSizedScreenshots() {
  const rawDir = path.join(assetsDir, 'raw');
  const exportDir = path.join(assetsDir, 'export');
  fs.mkdirSync(exportDir, { recursive: true });

  for (const size of OUTPUT_SIZES) {
    const sizeDir = path.join(exportDir, size.label);
    fs.mkdirSync(sizeDir, { recursive: true });

    for (const capture of CAPTURES) {
      const rawPath = path.join(rawDir, `${capture.slug}.png`);
      const outputPath = path.join(sizeDir, `${capture.slug}.png`);
      const resized = await sharp(rawPath)
        .resize(size.width, size.height, { fit: 'cover', position: 'centre' })
        .png()
        .toBuffer();

      await sharp(resized)
        .composite([{ input: captionSvg(capture.caption, size.width, size.height), top: 0, left: 0 }])
        .png()
        .toFile(outputPath);
    }

    console.log(`✓ Exportadas ${CAPTURES.length} capturas en ${size.label}`);
  }
}

function buildReviewGallery(reviewToken) {
  const exportDir = path.join(assetsDir, 'export');
  const reviewDir = path.join(projectRoot, 'public', 'store-review', reviewToken);
  fs.mkdirSync(reviewDir, { recursive: true });

  const sections = OUTPUT_SIZES.map((size) => {
    const files = CAPTURES.map((capture) => {
      const source = path.join(exportDir, size.label, `${capture.slug}.png`);
      const targetName = `${size.label}-${capture.slug}.png`;
      fs.copyFileSync(source, path.join(reviewDir, targetName));
      return {
        file: targetName,
        caption: capture.caption,
      };
    });

    return { size, files };
  });

  const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow, noarchive" />
  <title>Capturas Play Store · Training ProgLine</title>
  <style>
    :root { color-scheme: dark; }
    body {
      margin: 0;
      font-family: "Segoe UI", Arial, sans-serif;
      background: #0f1419;
      color: #f4f6f8;
      padding: 32px 20px 48px;
    }
    h1 { margin: 0 0 8px; font-size: 28px; }
    p { margin: 0 0 28px; color: #9aa7b5; line-height: 1.5; }
    section { margin-bottom: 40px; }
    h2 { font-size: 20px; margin: 0 0 16px; color: #ff8a3d; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
    }
    figure {
      margin: 0;
      background: #171d24;
      border: 1px solid #27313d;
      border-radius: 16px;
      overflow: hidden;
    }
    img { display: block; width: 100%; height: auto; }
    figcaption {
      padding: 12px 14px 16px;
      font-size: 14px;
      color: #c7d0da;
    }
    a { color: #ff8a3d; text-decoration: none; }
  </style>
</head>
<body>
  <h1>Capturas Play Store</h1>
  <p>Revisión privada para Google Play. No indexar. Generado ${new Date().toISOString()}.</p>
  ${sections
    .map(
      (section) => `
  <section>
    <h2>${section.size.label}</h2>
    <div class="grid">
      ${section.files
        .map(
          (file) => `
      <figure>
        <a href="./${file.file}" download>
          <img src="./${file.file}" alt="${file.caption}" loading="lazy" />
        </a>
        <figcaption>${file.caption}</figcaption>
      </figure>`,
        )
        .join('')}
    </div>
  </section>`,
    )
    .join('')}
</body>
</html>`;

  fs.writeFileSync(path.join(reviewDir, 'index.html'), html, 'utf8');
  return reviewDir;
}

function deployPreview(reviewToken) {
  const result = spawnSync(
    'npx',
    ['vercel', 'deploy', '--yes', '--scope', 'carlos-projects-fef4821d'],
    {
      cwd: projectRoot,
      stdio: 'pipe',
      shell: true,
      encoding: 'utf8',
    },
  );

  const output = `${result.stdout || ''}\n${result.stderr || ''}`;
  if (result.status !== 0) {
    console.error(output);
    throw new Error('Falló el deploy de preview en Vercel.');
  }

  const urlMatch =
    output.match(/https:\/\/programaciones-online-[a-z0-9-]+-carlos-projects-fef4821d\.vercel\.app/gi) ||
    output.match(/https:\/\/[^\s]+vercel\.app/gi);

  const deploymentUrl = urlMatch?.[urlMatch.length - 1];
  if (!deploymentUrl) {
    throw new Error('No se pudo obtener la URL del deploy de preview.');
  }

  return `${deploymentUrl.replace(/\/$/, '')}/store-review/${reviewToken}/`;
}

async function main() {
  ensurePlaywright();
  const { chromium, devices } = await import('playwright');

  fs.mkdirSync(assetsDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...devices['iPhone 14 Pro Max'],
    viewport: VIEWPORT,
    deviceScaleFactor: 3,
    locale: 'es-ES',
  });
  const page = await context.newPage();

  let loggedIn = false;
  for (const capture of CAPTURES) {
    if (capture.auth && !loggedIn) {
      await login(page);
      loggedIn = true;
    }
    await page.goto(`${BASE_URL}${capture.path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(capture.waitMs);
    const rawDir = path.join(assetsDir, 'raw');
    fs.mkdirSync(rawDir, { recursive: true });
    await page.screenshot({
      path: path.join(rawDir, `${capture.slug}.png`),
      fullPage: false,
    });
    console.log(`✓ Captura: ${capture.slug}`);
  }

  await browser.close();

  await exportSizedScreenshots();

  const reviewToken = crypto.randomBytes(18).toString('base64url');
  buildReviewGallery(reviewToken);
  const privateUrl = deployPreview(reviewToken);

  const manifest = {
    generatedAt: new Date().toISOString(),
    privateUrl,
    reviewToken,
    sizes: OUTPUT_SIZES.map((size) => size.label),
    captures: CAPTURES.map((capture) => capture.slug),
  };
  fs.writeFileSync(path.join(assetsDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

  console.log('\n✓ Galería privada lista:');
  console.log(privateUrl);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
