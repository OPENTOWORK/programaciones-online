import 'dotenv/config';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { fetchChannelVideos, fetchChannelVideosViaApi } from './lib/youtubeClient.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PRIMARY_CHANNEL_ID = process.env.YOUTUBE_PRIMARY_CHANNEL_ID || 'UCG8mx9hKMAP1FwFmnzW5rKA';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
const OUTPUT = join(__dirname, '..', 'lib', 'hypeChannelVideos.ts');

async function main() {
  const videos = YOUTUBE_API_KEY
    ? await fetchChannelVideosViaApi(YOUTUBE_API_KEY, PRIMARY_CHANNEL_ID)
    : await fetchChannelVideos(PRIMARY_CHANNEL_ID);

  const payload = videos.map(({ videoId, title }) => ({ videoId, title }));
  const contents = `/** Generado por scripts/export-hype-channel-videos.mjs — no editar a mano */
export interface HypeChannelVideo {
  videoId: string;
  title: string;
}

export const HYPE_CHANNEL_VIDEOS: HypeChannelVideo[] = ${JSON.stringify(payload, null, 2)} as const;
`;

  writeFileSync(OUTPUT, contents, 'utf8');
  console.log(`✓ ${payload.length} vídeos exportados a lib/hypeChannelVideos.ts`);
}

main().catch((error) => {
  console.error('Error:', error.message ?? error);
  process.exit(1);
});
