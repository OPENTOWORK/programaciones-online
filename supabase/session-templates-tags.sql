-- Etiqueta de agrupación para plantillas de sesión.
alter table public.trainer_session_templates
  add column if not exists tag text;

alter table public.trainer_session_templates
  drop constraint if exists trainer_session_templates_tag_check;

alter table public.trainer_session_templates
  add constraint trainer_session_templates_tag_check
  check (
    tag is null
    or tag in (
      'Tren inferior',
      'Tren superior',
      'Core',
      'Metcon',
      'Descanso'
    )
  );

create index if not exists trainer_session_templates_tag_idx
  on public.trainer_session_templates (trainer_id, tag, name);
