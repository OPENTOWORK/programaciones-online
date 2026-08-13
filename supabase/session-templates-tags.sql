-- Etiqueta de agrupación para plantillas de sesión.
alter table public.trainer_session_templates
  add column if not exists tag text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'trainer_session_templates_tag_check'
  ) then
    alter table public.trainer_session_templates
      add constraint trainer_session_templates_tag_check
      check (
        tag is null
        or tag in ('Tren inferior', 'Tren superior', 'Core', 'Activación', 'Descanso')
      );
  end if;
end $$;

create index if not exists trainer_session_templates_tag_idx
  on public.trainer_session_templates (trainer_id, tag, name);
