-- Cuenta de destino/origen del movimiento financiero: caja (efectivo) o banco (tarjeta/transferencia).

alter table public.gym_finance_entries
  add column if not exists account text not null default 'cash'
  check (account in ('cash', 'bank'));

create index if not exists gym_finance_entries_account_idx
  on public.gym_finance_entries (gym_id, account);

notify pgrst, 'reload schema';
