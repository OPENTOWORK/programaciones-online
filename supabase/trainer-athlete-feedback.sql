-- Feedback visible para el atleta, enviado desde su ficha por el entrenador.

create table if not exists public.trainer_athlete_feedback (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references auth.users(id) on delete cascade,
  athlete_id uuid not null references auth.users(id) on delete cascade,
  message text not null check (char_length(trim(message)) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trainer_athlete_feedback_athlete_idx
  on public.trainer_athlete_feedback (athlete_id, created_at desc);

create index if not exists trainer_athlete_feedback_trainer_idx
  on public.trainer_athlete_feedback (trainer_id, athlete_id, created_at desc);

alter table public.trainer_athlete_feedback enable row level security;

drop policy if exists "Athletes can view own trainer feedback"
  on public.trainer_athlete_feedback;
create policy "Athletes can view own trainer feedback"
  on public.trainer_athlete_feedback for select
  to authenticated
  using (athlete_id = auth.uid());

drop policy if exists "Trainers can view own feedback"
  on public.trainer_athlete_feedback;
create policy "Trainers can view own feedback"
  on public.trainer_athlete_feedback for select
  to authenticated
  using (public.is_entrenador() and trainer_id = auth.uid());

drop policy if exists "Trainers can create own feedback"
  on public.trainer_athlete_feedback;
create policy "Trainers can create own feedback"
  on public.trainer_athlete_feedback for insert
  to authenticated
  with check (public.is_entrenador() and trainer_id = auth.uid());

drop policy if exists "Trainers can update own feedback"
  on public.trainer_athlete_feedback;
create policy "Trainers can update own feedback"
  on public.trainer_athlete_feedback for update
  to authenticated
  using (public.is_entrenador() and trainer_id = auth.uid())
  with check (public.is_entrenador() and trainer_id = auth.uid());

drop policy if exists "Trainers can delete own feedback"
  on public.trainer_athlete_feedback;
create policy "Trainers can delete own feedback"
  on public.trainer_athlete_feedback for delete
  to authenticated
  using (public.is_entrenador() and trainer_id = auth.uid());

-- El mensaje puede ir vacío cuando el feedback es solo un vídeo o una nota de voz.
alter table public.trainer_athlete_feedback
  drop constraint if exists trainer_athlete_feedback_message_check;

alter table public.trainer_athlete_feedback
  add constraint trainer_athlete_feedback_message_check
  check (char_length(message) <= 2000);

-- Vídeos y notas de voz adjuntos a cada feedback.

create table if not exists public.trainer_feedback_media (
  id uuid primary key default gen_random_uuid(),
  feedback_id uuid not null references public.trainer_athlete_feedback(id) on delete cascade,
  trainer_id uuid not null references auth.users(id) on delete cascade,
  athlete_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('video', 'audio')),
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  duration_seconds numeric,
  created_at timestamptz not null default now()
);

create index if not exists trainer_feedback_media_feedback_idx
  on public.trainer_feedback_media (feedback_id, created_at);

create index if not exists trainer_feedback_media_athlete_idx
  on public.trainer_feedback_media (athlete_id, created_at desc);

alter table public.trainer_feedback_media enable row level security;

drop policy if exists "Athletes can view own feedback media"
  on public.trainer_feedback_media;
create policy "Athletes can view own feedback media"
  on public.trainer_feedback_media for select
  to authenticated
  using (athlete_id = auth.uid());

drop policy if exists "Trainers can view own feedback media"
  on public.trainer_feedback_media;
create policy "Trainers can view own feedback media"
  on public.trainer_feedback_media for select
  to authenticated
  using (public.is_entrenador() and trainer_id = auth.uid());

drop policy if exists "Trainers can create own feedback media"
  on public.trainer_feedback_media;
create policy "Trainers can create own feedback media"
  on public.trainer_feedback_media for insert
  to authenticated
  with check (
    public.is_entrenador()
    and trainer_id = auth.uid()
    and exists (
      select 1
      from public.trainer_athlete_feedback f
      where f.id = feedback_id
        and f.trainer_id = auth.uid()
        and f.athlete_id = trainer_feedback_media.athlete_id
    )
  );

drop policy if exists "Trainers can delete own feedback media"
  on public.trainer_feedback_media;
create policy "Trainers can delete own feedback media"
  on public.trainer_feedback_media for delete
  to authenticated
  using (public.is_entrenador() and trainer_id = auth.uid());

-- Bucket privado para los adjuntos de feedback (ruta: {athlete_id}/{feedback_id}/{archivo})
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'feedback-media',
  'feedback-media',
  false,
  104857600,
  array[
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
    'audio/3gpp'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Trainers can upload feedback media" on storage.objects;
create policy "Trainers can upload feedback media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'feedback-media' and public.is_entrenador());

drop policy if exists "Trainers can view feedback media" on storage.objects;
create policy "Trainers can view feedback media"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'feedback-media' and public.is_entrenador());

drop policy if exists "Trainers can delete feedback media" on storage.objects;
create policy "Trainers can delete feedback media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'feedback-media' and public.is_entrenador());

drop policy if exists "Athletes can view own feedback media storage" on storage.objects;
create policy "Athletes can view own feedback media storage"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'feedback-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
