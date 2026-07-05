alter table if exists public.planes enable row level security;
alter table if exists public.programas enable row level security;

drop policy if exists "Authenticated can read planes" on public.planes;
create policy "Authenticated can read planes"
  on public.planes for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can read programas" on public.programas;
create policy "Authenticated can read programas"
  on public.programas for select
  to authenticated
  using (true);
