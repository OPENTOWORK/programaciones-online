-- Permite quitar fichas del tablero CRM sin borrar la cuenta del atleta

alter table public.trainer_crm_leads
  add column if not exists archived_at timestamptz;

create index if not exists trainer_crm_leads_archived_idx
  on public.trainer_crm_leads (trainer_id, archived_at);
