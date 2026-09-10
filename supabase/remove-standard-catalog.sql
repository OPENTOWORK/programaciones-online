-- Retira el catálogo Base · Training (plan "Estandar") y su contenido.
-- No toca trainer_session_templates ni las plantillas guardadas en Plantillas.

do $$
declare
  plan_row record;
  program_row record;
  session_ids uuid[];
begin
  select id, descripcion into plan_row
  from public.planes
  where descripcion = 'Estandar'
  limit 1;

  if plan_row.id is null then
    raise notice 'No existe el plan Estandar.';
    return;
  end if;

  for program_row in
    select id, name from public.programas where id_planes = plan_row.id
  loop
    select array_agg(id) into session_ids
    from public.entrenos_diarios
    where program_id = program_row.id;

    if session_ids is not null then
      delete from public.entrenos_ejercicios where entreno_id = any(session_ids);
      delete from public.entrenos_diarios where program_id = program_row.id;
    end if;

    delete from public.user_programs where program_id = program_row.id;
    delete from public.programas where id = program_row.id;
    raise notice 'Programa eliminado: %', program_row.name;
  end loop;

  delete from public.planes where id = plan_row.id;
  raise notice 'Plan Estandar eliminado.';
end $$;
