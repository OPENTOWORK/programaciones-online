-- Edición de programaciones Estándar e Hype por entrenadores

alter table if exists public.programas
  add column if not exists descripcion text default '';

create or replace function public.is_editable_catalog_program(program_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.programas pr
    join public.planes pl on pl.id = pr.id_planes
    where pr.id = program_id
      and (
        lower(pl.descripcion) like '%hype%'
        or lower(pl.descripcion) like '%intensiv%'
        or lower(pl.descripcion) like '%estandar%'
        or lower(pl.descripcion) like '%estándar%'
        or (
          lower(pl.descripcion) not like '%personaliz%'
          and lower(pl.descripcion) not like '%nutrici%'
          and lower(pl.descripcion) not like '%domicilio%'
          and lower(pl.descripcion) not like '%casa%'
        )
      )
  );
$$;

grant execute on function public.is_editable_catalog_program(uuid) to authenticated;

drop policy if exists "Trainers can update editable catalog programs" on public.programas;
create policy "Trainers can update editable catalog programs"
  on public.programas for update
  to authenticated
  using (public.is_entrenador() and public.is_editable_catalog_program(id))
  with check (public.is_entrenador() and public.is_editable_catalog_program(id));

drop policy if exists "Trainers can update editable catalog workouts" on public.entrenos_diarios;
create policy "Trainers can update editable catalog workouts"
  on public.entrenos_diarios for update
  to authenticated
  using (public.is_entrenador() and public.is_editable_catalog_program(program_id))
  with check (public.is_entrenador() and public.is_editable_catalog_program(program_id));

drop policy if exists "Trainers can update editable catalog exercises" on public.entrenos_ejercicios;
create policy "Trainers can update editable catalog exercises"
  on public.entrenos_ejercicios for update
  to authenticated
  using (
    public.is_entrenador()
    and exists (
      select 1
      from public.entrenos_diarios e
      where e.id = entrenos_ejercicios.entreno_id
        and public.is_editable_catalog_program(e.program_id)
    )
  )
  with check (
    public.is_entrenador()
    and exists (
      select 1
      from public.entrenos_diarios e
      where e.id = entrenos_ejercicios.entreno_id
        and public.is_editable_catalog_program(e.program_id)
    )
  );

drop policy if exists "Trainers can insert editable catalog programs" on public.programas;
create policy "Trainers can insert editable catalog programs"
  on public.programas for insert
  to authenticated
  with check (
    public.is_entrenador()
    and exists (
      select 1
      from public.planes pl
      where pl.id = id_planes
        and (
          lower(pl.descripcion) like '%hype%'
          or lower(pl.descripcion) like '%intensiv%'
          or lower(pl.descripcion) like '%estandar%'
          or lower(pl.descripcion) like '%estándar%'
          or (
            lower(pl.descripcion) not like '%personaliz%'
            and lower(pl.descripcion) not like '%nutrici%'
            and lower(pl.descripcion) not like '%domicilio%'
            and lower(pl.descripcion) not like '%casa%'
          )
        )
    )
  );

drop policy if exists "Trainers can insert editable catalog workouts" on public.entrenos_diarios;
create policy "Trainers can insert editable catalog workouts"
  on public.entrenos_diarios for insert
  to authenticated
  with check (public.is_entrenador() and public.is_editable_catalog_program(program_id));

drop policy if exists "Trainers can insert editable catalog exercises" on public.entrenos_ejercicios;
create policy "Trainers can insert editable catalog exercises"
  on public.entrenos_ejercicios for insert
  to authenticated
  with check (
    public.is_entrenador()
    and exists (
      select 1
      from public.entrenos_diarios e
      where e.id = entrenos_ejercicios.entreno_id
        and public.is_editable_catalog_program(e.program_id)
    )
  );

drop policy if exists "Trainers can delete editable catalog workouts" on public.entrenos_diarios;
create policy "Trainers can delete editable catalog workouts"
  on public.entrenos_diarios for delete
  to authenticated
  using (public.is_entrenador() and public.is_editable_catalog_program(program_id));

alter table public.entrenos_ejercicios
  add column if not exists metric_type text,
  add column if not exists male_target text,
  add column if not exists female_target text;

alter table public.entrenos_diarios
  add column if not exists schedule_config jsonb;
