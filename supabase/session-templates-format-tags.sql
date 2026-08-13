-- Etiqueta de formato (EMOM, For Time, etc.) aparte de la zona.
alter table public.trainer_session_templates
  add column if not exists format_tag text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'trainer_session_templates_format_tag_check'
  ) then
    alter table public.trainer_session_templates
      add constraint trainer_session_templates_format_tag_check
      check (
        format_tag is null
        or format_tag in (
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
  end if;
end $$;

create index if not exists trainer_session_templates_format_tag_idx
  on public.trainer_session_templates (trainer_id, format_tag, name);
