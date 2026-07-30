-- Catálogo de videos de ejercicios (sincronizado desde AimHarder)

create table if not exists public.ejercicios_videos (
  id uuid primary key default gen_random_uuid(),
  aimharder_ejer_id bigint unique,
  name text not null,
  name_key text not null unique,
  youtube_video_id text not null,
  updated_at timestamptz default now()
);

create index if not exists ejercicios_videos_ejer_id_idx
  on public.ejercicios_videos (aimharder_ejer_id);

alter table public.entrenos_ejercicios
  add column if not exists aimharder_ejer_id bigint;

alter table public.ejercicios_videos enable row level security;

drop policy if exists "Authenticated can read ejercicios_videos" on public.ejercicios_videos;
create policy "Authenticated can read ejercicios_videos"
  on public.ejercicios_videos for select
  to authenticated
  using (true);

drop policy if exists "Trainers can insert exercise videos" on public.ejercicios_videos;
create policy "Trainers can insert exercise videos"
  on public.ejercicios_videos for insert
  to authenticated
  with check (public.is_entrenador());

drop policy if exists "Trainers can update exercise videos" on public.ejercicios_videos;
create policy "Trainers can update exercise videos"
  on public.ejercicios_videos for update
  to authenticated
  using (public.is_entrenador())
  with check (public.is_entrenador());
