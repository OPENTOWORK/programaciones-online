-- Chat grupal por programación de catálogo.
-- Acceso: atletas con user_programs.status = 'activa' o staff (entrenador/administrador).

create table if not exists public.program_chat_messages (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programas(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  sender text not null check (sender in ('user', 'trainer')),
  text text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists program_chat_messages_program_created_idx
  on public.program_chat_messages (program_id, created_at);

create index if not exists program_chat_messages_author_idx
  on public.program_chat_messages (author_id, created_at desc);

alter table public.program_chat_messages enable row level security;

create or replace function public.is_enrolled_in_program(p_program_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_programs up
    where up.user_id = auth.uid()
      and up.program_id = p_program_id
      and up.status = 'activa'
  );
$$;

create or replace function public.can_access_program_chat(p_program_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_enrolled_in_program(p_program_id) or public.is_entrenador();
$$;

drop policy if exists "Members can view program chat" on public.program_chat_messages;
create policy "Members can view program chat"
  on public.program_chat_messages for select
  to authenticated
  using (public.can_access_program_chat(program_id));

drop policy if exists "Members can post in program chat" on public.program_chat_messages;
create policy "Members can post in program chat"
  on public.program_chat_messages for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and public.can_access_program_chat(program_id)
    and (
      (sender = 'user' and not public.is_entrenador())
      or (sender = 'trainer' and public.is_entrenador())
    )
  );
