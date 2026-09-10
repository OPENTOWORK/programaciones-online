-- Comentarios del atleta por bloque de entreno (texto y/o nota de voz)

create table if not exists public.session_log_block_comments (
  id uuid primary key default gen_random_uuid(),
  workout_log_id uuid not null references public.workout_logs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  block_key text not null,
  text text,
  audio_storage_path text,
  audio_file_name text,
  audio_mime_type text,
  audio_duration_seconds integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workout_log_id, block_key)
);

create index if not exists session_log_block_comments_log_idx
  on public.session_log_block_comments (workout_log_id, block_key);

create index if not exists session_log_block_comments_user_idx
  on public.session_log_block_comments (user_id, updated_at desc);

alter table public.session_log_block_comments enable row level security;

drop policy if exists "Athletes can view own block comments" on public.session_log_block_comments;
create policy "Athletes can view own block comments"
  on public.session_log_block_comments for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Trainers can view athlete block comments" on public.session_log_block_comments;
create policy "Trainers can view athlete block comments"
  on public.session_log_block_comments for select
  to authenticated
  using (
    public.is_entrenador()
    and exists (
      select 1
      from public."Perfil" p
      join public.roles r on r.id = p.id_roles
      where p.id = session_log_block_comments.user_id
        and r.slug = 'atleta'
    )
  );

drop policy if exists "Athletes can insert own block comments" on public.session_log_block_comments;
create policy "Athletes can insert own block comments"
  on public.session_log_block_comments for insert
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

drop policy if exists "Athletes can update own block comments" on public.session_log_block_comments;
create policy "Athletes can update own block comments"
  on public.session_log_block_comments for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Athletes can delete own block comments" on public.session_log_block_comments;
create policy "Athletes can delete own block comments"
  on public.session_log_block_comments for delete
  to authenticated
  using (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'session-block-audio',
  'session-block-audio',
  false,
  15728640,
  array['audio/m4a', 'audio/mp4', 'audio/mpeg', 'audio/webm', 'audio/ogg', 'audio/wav', 'audio/x-m4a']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Athletes can upload own block audio" on storage.objects;
create policy "Athletes can upload own block audio"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'session-block-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Athletes can view own block audio storage" on storage.objects;
create policy "Athletes can view own block audio storage"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'session-block-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Trainers can view athlete block audio storage" on storage.objects;
create policy "Trainers can view athlete block audio storage"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'session-block-audio'
    and public.is_entrenador()
    and (storage.foldername(name))[1] in (
      select p.id::text
      from public."Perfil" p
      join public.roles r on r.id = p.id_roles
      where r.slug = 'atleta'
    )
  );

drop policy if exists "Athletes can delete own block audio storage" on storage.objects;
create policy "Athletes can delete own block audio storage"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'session-block-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
