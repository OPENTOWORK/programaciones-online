-- Storage para PDFs de planes asignados a atletas

alter table public.athlete_plans
  add column if not exists pdf_storage_path text,
  add column if not exists pdf_file_name text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'athlete-plan-pdfs',
  'athlete-plan-pdfs',
  false,
  10485760,
  array['application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Trainers can upload athlete plan pdfs" on storage.objects;
create policy "Trainers can upload athlete plan pdfs"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'athlete-plan-pdfs'
    and public.is_entrenador()
    and (storage.foldername(name))[1]::uuid in (
      select p.id
      from public."Perfil" p
      join public.roles r on r.id = p.id_roles
      where r.slug = 'atleta'
    )
  );

drop policy if exists "Trainers can update athlete plan pdfs" on storage.objects;
create policy "Trainers can update athlete plan pdfs"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'athlete-plan-pdfs'
    and public.is_entrenador()
  );

drop policy if exists "Trainers can read athlete plan pdfs" on storage.objects;
create policy "Trainers can read athlete plan pdfs"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'athlete-plan-pdfs'
    and public.is_entrenador()
  );

drop policy if exists "Athletes can read own plan pdfs" on storage.objects;
create policy "Athletes can read own plan pdfs"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'athlete-plan-pdfs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
