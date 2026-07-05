import { normalizeExerciseName } from './aimharderVideoExtract.mjs';

export async function upsertExerciseVideos(client, entries) {
  let upserted = 0;

  for (const entry of entries) {
    if (!entry?.youtubeVideoId) continue;

    const nameKey = entry.nameKey ?? normalizeExerciseName(entry.name);
    if (!nameKey) continue;

    await client.query(
      `insert into public.ejercicios_videos (aimharder_ejer_id, name, name_key, youtube_video_id, updated_at)
       values ($1, $2, $3, $4, now())
       on conflict (name_key) do update set
         aimharder_ejer_id = coalesce(excluded.aimharder_ejer_id, ejercicios_videos.aimharder_ejer_id),
         name = excluded.name,
         youtube_video_id = excluded.youtube_video_id,
         updated_at = now()`,
      [entry.ejerId ?? null, entry.name, nameKey, entry.youtubeVideoId],
    );
    upserted += 1;
  }

  return upserted;
}
