-- Archivos legales públicos (política de privacidad, etc.)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'public-legal',
  'public-legal',
  true,
  1048576,
  array['text/html', 'text/plain', 'application/xhtml+xml', 'application/pdf', 'image/svg+xml']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read legal files" on storage.objects;
create policy "Public can read legal files"
  on storage.objects for select
  to public
  using (bucket_id = 'public-legal');

drop policy if exists "Allow upsert privacy policy html" on storage.objects;
create policy "Allow upsert privacy policy html"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'public-legal' and name in ('privacy.html', 'privacy.xhtml', 'privacy.svg', 'privacy.pdf'));

drop policy if exists "Allow update privacy policy html" on storage.objects;
create policy "Allow update privacy policy html"
  on storage.objects for update
  to anon, authenticated
  using (bucket_id = 'public-legal' and name in ('privacy.html', 'privacy.xhtml', 'privacy.svg', 'privacy.pdf'))
  with check (bucket_id = 'public-legal' and name in ('privacy.html', 'privacy.xhtml', 'privacy.svg', 'privacy.pdf'));
