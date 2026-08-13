-- Mueve Activación de etiqueta de zona a etiqueta de formato.
update public.trainer_session_templates
set
  format_tag = coalesce(format_tag, 'Activación'),
  tag = null
where tag = 'Activación';

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

alter table public.trainer_session_templates
  drop constraint if exists trainer_session_templates_format_tag_check;

alter table public.trainer_session_templates
  add constraint trainer_session_templates_format_tag_check
  check (
    format_tag is null
    or format_tag in (
      'Activación',
      'EMOM',
      'For Time',
      'Rounds For Time',
      'AMRAP',
      'Tabata',
      'Reps For Time / Ladder',
      'Estaciones de tiempo',
      'Fuerza',
      'Técnica',
      'Movilidad',
      'Unbroken'
    )
  );
