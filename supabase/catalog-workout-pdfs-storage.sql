-- PDFs adjuntos a sesiones de programaciones de catálogo (Hype, Estándar, etc.)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'catalog-workout-pdfs',
  'catalog-workout-pdfs',
  false,
  10485760,
  array['application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Trainers can upload catalog workout pdfs" on storage.objects;
create policy "Trainers can upload catalog workout pdfs"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'catalog-workout-pdfs'
    and public.is_entrenador()
  );

drop policy if exists "Trainers can update catalog workout pdfs" on storage.objects;
create policy "Trainers can update catalog workout pdfs"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'catalog-workout-pdfs'
    and public.is_entrenador()
  );

drop policy if exists "Authenticated users can read catalog workout pdfs" on storage.objects;
create policy "Authenticated users can read catalog workout pdfs"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'catalog-workout-pdfs');
