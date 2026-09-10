-- Recorrido del atleta en el CRM de miembros del gimnasio.

alter table public.gym_members
  add column if not exists pipeline_stage text;

update public.gym_members
set pipeline_stage = case status
  when 'lead' then 'potencial'
  when 'inactive' then 'pausa'
  when 'blocked' then 'baja'
  else 'activo'
end
where pipeline_stage is null;

alter table public.gym_members
  alter column pipeline_stage set default 'potencial';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'gym_members_pipeline_stage_check'
  ) then
    alter table public.gym_members
      add constraint gym_members_pipeline_stage_check
      check (
        pipeline_stage in (
          'potencial',
          'contactado',
          'prueba',
          'alta',
          'activo',
          'pausa',
          'baja'
        )
      );
  end if;
end
$$;
