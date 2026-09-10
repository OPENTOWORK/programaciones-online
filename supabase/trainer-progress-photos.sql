-- El entrenador puede ver las fotos de progreso de sus atletas (ficha y comparativa).

drop policy if exists "Trainers can view athlete photos" on public.fotos;
create policy "Trainers can view athlete photos"
  on public.fotos for select
  to authenticated
  using (
    public.is_entrenador()
    and exists (
      select 1
      from public."Perfil" p
      join public.roles r on r.id = p.id_roles
      where p.id = fotos.user_id
        and r.slug = 'atleta'
    )
  );

drop policy if exists "Trainers can view athlete progress photos" on storage.objects;
create policy "Trainers can view athlete progress photos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'fotos'
    and public.is_entrenador()
  );
