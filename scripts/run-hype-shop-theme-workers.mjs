import 'dotenv/config';
import { openSync } from 'fs';
import { spawn } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const themes = ['navy', 'forest', 'sand', 'slate', 'teal', 'wine', 'lavender', 'olive', 'rose'];
const delay = process.argv[2] ?? '900';

for (const theme of themes) {
  const logPath = join(root, 'scripts', `generate-hype-theme-${theme}.log`);
  const logFd = openSync(logPath, 'a');
  const child = spawn(
    process.execPath,
    [join(root, 'scripts', 'generate-hype-gym-shop-images.mjs'), `--theme=${theme}`, `--delay=${delay}`],
    {
      cwd: root,
      stdio: ['ignore', logFd, logFd],
      detached: true,
      env: process.env,
    },
  );
  child.unref();
  console.log(`→ ${theme} (pid ${child.pid}) → ${logPath}`);
}

console.log('Lanzados workers por tema. day y night siguen en sus procesos previos.');
