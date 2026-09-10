-- Vídeos que el entrenador/admin añade a la biblioteca (Library · Exercises).

alter table public.ejercicios_videos
  add column if not exists created_by uuid references auth.users (id);

create index if not exists ejercicios_videos_created_by_idx
  on public.ejercicios_videos (created_by);

drop policy if exists "Trainers can delete own library videos" on public.ejercicios_videos;
create policy "Trainers can delete own library videos"
  on public.ejercicios_videos for delete
  to authenticated
  using (public.is_entrenador() and created_by = auth.uid());
