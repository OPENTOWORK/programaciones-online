-- Añade Metcon a las etiquetas de zona de plantillas.
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
