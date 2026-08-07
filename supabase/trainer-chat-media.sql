-- Adjuntos de mensajes del chat entrenador-atleta.

create table if not exists public.trainer_message_media (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.trainer_messages(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  uploader_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('video', 'audio', 'image', 'file', 'gif')),
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  duration_seconds numeric,
  created_at timestamptz not null default now()
);

create index if not exists trainer_message_media_message_idx
  on public.trainer_message_media (message_id, created_at);

create index if not exists trainer_message_media_user_idx
  on public.trainer_message_media (user_id, created_at desc);

alter table public.trainer_message_media enable row level security;

drop policy if exists "Athletes can view own chat media" on public.trainer_message_media;
create policy "Athletes can view own chat media"
  on public.trainer_message_media for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Trainers can view athlete chat media" on public.trainer_message_media;
create policy "Trainers can view athlete chat media"
  on public.trainer_message_media for select
  to authenticated
  using (public.is_entrenador());

drop policy if exists "Users can upload own chat media" on public.trainer_message_media;
create policy "Users can upload own chat media"
  on public.trainer_message_media for insert
  to authenticated
  with check (
    uploader_id = auth.uid()
    and exists (
      select 1
      from public.trainer_messages m
      where m.id = message_id
        and m.user_id = trainer_message_media.user_id
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'chat-media',
  'chat-media',
  false,
  104857600,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif',
    'video/mp4',
    'video/quicktime',
    'video/webm',
    'video/x-m4v',
    'audio/webm',
    'audio/mp4',
    'audio/m4a',
    'audio/x-m4a',
    'audio/mpeg',
    'audio/aac',
    'audio/ogg',
    'audio/wav',
    'audio/x-wav',
    'audio/3gpp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can upload chat media" on storage.objects;
create policy "Users can upload chat media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'chat-media');

drop policy if exists "Users can view chat media" on storage.objects;
create policy "Users can view chat media"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'chat-media'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_entrenador()
    )
  );

drop policy if exists "Users can delete own chat media" on storage.objects;
create policy "Users can delete own chat media"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'chat-media'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_entrenador()
    )
  );
