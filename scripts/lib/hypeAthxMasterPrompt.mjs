import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Prompt maestro HYPE + ATHX (docs/HYPE_ATHX_PROGRAMMING_PROMPT.md). */
export const HYPE_ATHX_MASTER_PROMPT = readFileSync(
  join(__dirname, '..', '..', 'docs', 'HYPE_ATHX_PROGRAMMING_PROMPT.md'),
  'utf8',
);

export const HYPE_ATHX_MASTER_PROMPT_PATH = join(
  __dirname,
  '..',
  '..',
  'docs',
  'HYPE_ATHX_PROGRAMMING_PROMPT.md',
);
