-- Fecha concreta del entreno y fecha de publicación.

alter table public.gym_program_links
  add column if not exists scheduled_date date;

alter table public.gym_program_links
  add column if not exists published_date date;

alter table public.gym_program_links
  add column if not exists published_time time;

alter table public.gym_program_links
  add column if not exists session_draft jsonb;

create index if not exists gym_program_links_date_idx
  on public.gym_program_links (gym_id, scheduled_date);

create index if not exists gym_program_links_published_idx
  on public.gym_program_links (gym_id, published_date);
