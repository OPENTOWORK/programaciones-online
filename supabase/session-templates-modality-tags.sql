-- Modalidad del catálogo (Calistenia, ATHX, Hype, etc.) aparte de zona y formato.
alter table public.trainer_session_templates
  add column if not exists modality_tag text;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'trainer_session_templates_modality_tag_check'
  ) then
    alter table public.trainer_session_templates
      drop constraint trainer_session_templates_modality_tag_check;
  end if;

  alter table public.trainer_session_templates
    add constraint trainer_session_templates_modality_tag_check
    check (
      modality_tag is null
      or modality_tag in (
        'Calistenia',
        'ATHX',
        'Crosstraining',
        'Hype',
        'Hyrox'
      )
    );
end $$;

create index if not exists trainer_session_templates_modality_tag_idx
  on public.trainer_session_templates (trainer_id, modality_tag, name);
