-- Panel financiero del gimnasio: ingresos y gastos con origen/destino.

create table if not exists public.gym_finance_entries (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  kind text not null check (kind in ('income', 'expense')),
  category text not null,
  amount numeric(10, 2) not null check (amount > 0),
  entry_date date not null default current_date,
  concept text,
  counterparty text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists gym_finance_entries_gym_idx
  on public.gym_finance_entries (gym_id, entry_date desc, created_at desc);

alter table public.gym_finance_entries enable row level security;

drop policy if exists "Gym read gym_finance_entries" on public.gym_finance_entries;
create policy "Gym read gym_finance_entries"
  on public.gym_finance_entries for select
  to authenticated
  using (public.has_gym_access(gym_id));

drop policy if exists "Gym operate gym_finance_entries" on public.gym_finance_entries;
create policy "Gym operate gym_finance_entries"
  on public.gym_finance_entries for all
  to authenticated
  using (public.can_operate_gym(gym_id))
  with check (public.can_operate_gym(gym_id));

grant select, insert, update, delete on public.gym_finance_entries to authenticated;

notify pgrst, 'reload schema';
