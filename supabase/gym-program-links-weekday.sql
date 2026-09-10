-- Qué programación se entrena en cada modalidad y día de la semana.
-- 0 = lunes … 6 = domingo.

alter table public.gym_program_links
  add column if not exists weekday smallint;

alter table public.gym_program_links
  drop constraint if exists gym_program_links_weekday_check;

alter table public.gym_program_links
  add constraint gym_program_links_weekday_check
  check (weekday is null or weekday between 0 and 6);

create index if not exists gym_program_links_weekday_idx
  on public.gym_program_links (gym_id, weekday);
