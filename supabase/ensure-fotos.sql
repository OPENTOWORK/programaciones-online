-- Fotos de progreso (antes + mensuales)
create table if not exists public.fotos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  tipo text not null check (tipo in ('antes', 'mensual')),
  mes text check (mes is null or mes ~ '^\d{4}-\d{2}$'),
  storage_path text not null,
  created_at timestamptz default now()
);

create unique index if not exists fotos_user_antes_idx
  on public.fotos (user_id)
  where tipo = 'antes';

create unique index if not exists fotos_user_mes_idx
  on public.fotos (user_id, mes)
  where tipo = 'mensual';

alter table public.fotos enable row level security;

drop policy if exists "Users can view own photos" on public.fotos;
create policy "Users can view own photos"
  on public.fotos for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own photos" on public.fotos;
create policy "Users can insert own photos"
  on public.fotos for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own photos" on public.fotos;
create policy "Users can update own photos"
  on public.fotos for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own photos" on public.fotos;
create policy "Users can delete own photos"
  on public.fotos for delete
  to authenticated
  using (auth.uid() = user_id);

-- Bucket privado para fotos de progreso
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'fotos',
  'fotos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can upload own progress photos" on storage.objects;
create policy "Users can upload own progress photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'fotos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can view own progress photos" on storage.objects;
create policy "Users can view own progress photos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'fotos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can update own progress photos" on storage.objects;
create policy "Users can update own progress photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'fotos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can delete own progress photos" on storage.objects;
create policy "Users can delete own progress photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'fotos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
