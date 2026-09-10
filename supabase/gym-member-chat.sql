-- Chat 1:1 entre el gimnasio (staff) y cada miembro del CRM.

create table if not exists public.gym_chat_messages (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  member_id uuid not null references public.gym_members(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  sender text not null check (sender in ('member', 'staff')),
  text text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists gym_chat_messages_thread_idx
  on public.gym_chat_messages (gym_id, member_id, created_at);

create index if not exists gym_chat_messages_gym_idx
  on public.gym_chat_messages (gym_id, created_at desc);

alter table public.gym_chat_messages enable row level security;

drop policy if exists "Gym staff read chat" on public.gym_chat_messages;
create policy "Gym staff read chat"
  on public.gym_chat_messages for select
  to authenticated
  using (public.can_operate_gym(gym_id));

drop policy if exists "Gym staff send chat" on public.gym_chat_messages;
create policy "Gym staff send chat"
  on public.gym_chat_messages for insert
  to authenticated
  with check (
    public.can_operate_gym(gym_id)
    and sender = 'staff'
    and author_id = auth.uid()
    and exists (
      select 1
      from public.gym_members m
      where m.id = member_id
        and m.gym_id = gym_id
    )
  );

drop policy if exists "Gym member read chat" on public.gym_chat_messages;
create policy "Gym member read chat"
  on public.gym_chat_messages for select
  to authenticated
  using (
    public.is_linked_gym_athlete(gym_id)
    and member_id = public.gym_athlete_member_id(gym_id)
  );

drop policy if exists "Gym member send chat" on public.gym_chat_messages;
create policy "Gym member send chat"
  on public.gym_chat_messages for insert
  to authenticated
  with check (
    public.is_linked_gym_athlete(gym_id)
    and member_id = public.gym_athlete_member_id(gym_id)
    and sender = 'member'
    and author_id = auth.uid()
  );
