-- Videos de entreno subidos por atletas, vinculados a cada registro de sesión (workout_logs)

create table if not exists public.session_log_videos (
  id uuid primary key default gen_random_uuid(),
  workout_log_id uuid not null references public.workout_logs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  mime_type text not null default 'video/mp4',
  exercise_key text,
  exercise_name text,
  created_at timestamptz not null default now()
);

create index if not exists session_log_videos_log_idx
  on public.session_log_videos (workout_log_id, created_at desc);

create index if not exists session_log_videos_user_idx
  on public.session_log_videos (user_id, created_at desc);

alter table public.session_log_videos enable row level security;

drop policy if exists "Athletes can view own session videos" on public.session_log_videos;
create policy "Athletes can view own session videos"
  on public.session_log_videos for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Trainers can view athlete session videos" on public.session_log_videos;
create policy "Trainers can view athlete session videos"
  on public.session_log_videos for select
  to authenticated
  using (
    public.is_entrenador()
    and exists (
      select 1
      from public."Perfil" p
      join public.roles r on r.id = p.id_roles
      where p.id = session_log_videos.user_id
        and r.slug = 'atleta'
    )
  );

drop policy if exists "Athletes can insert own session videos" on public.session_log_videos;
create policy "Athletes can insert own session videos"
  on public.session_log_videos for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.workout_logs wl
      where wl.id = workout_log_id
        and wl.user_id = auth.uid()
    )
  );

drop policy if exists "Athletes can delete own session videos" on public.session_log_videos;
create policy "Athletes can delete own session videos"
  on public.session_log_videos for delete
  to authenticated
  using (auth.uid() = user_id);

-- Bucket privado para videos de sesión
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'session-videos',
  'session-videos',
  false,
  104857600,
  array['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Athletes can upload own session videos" on storage.objects;
create policy "Athletes can upload own session videos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'session-videos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Athletes can view own session videos storage" on storage.objects;
create policy "Athletes can view own session videos storage"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'session-videos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Trainers can view athlete session videos storage" on storage.objects;
create policy "Trainers can view athlete session videos storage"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'session-videos'
    and public.is_entrenador()
    and (storage.foldername(name))[1] in (
      select p.id::text
      from public."Perfil" p
      join public.roles r on r.id = p.id_roles
      where r.slug = 'atleta'
    )
  );

drop policy if exists "Athletes can delete own session videos storage" on storage.objects;
create policy "Athletes can delete own session videos storage"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'session-videos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
