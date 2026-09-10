-- Las plantillas actuales son el catálogo de administradores.
-- Cada entrenador solo ve y gestiona las suyas (visibility = personal).

alter table public.trainer_session_templates
  add column if not exists visibility text;

update public.trainer_session_templates
set visibility = 'admin'
where visibility is null;

alter table public.trainer_session_templates
  alter column visibility set default 'personal';

alter table public.trainer_session_templates
  alter column visibility set not null;

alter table public.trainer_session_templates
  drop constraint if exists trainer_session_templates_visibility_check;

alter table public.trainer_session_templates
  add constraint trainer_session_templates_visibility_check
  check (visibility in ('personal', 'admin'));

create index if not exists trainer_session_templates_visibility_idx
  on public.trainer_session_templates (visibility, trainer_id);

drop index if exists public.trainer_session_templates_unique_name_idx;

create unique index if not exists trainer_session_templates_personal_name_idx
  on public.trainer_session_templates (trainer_id, lower(trim(name)))
  where visibility = 'personal';

create unique index if not exists trainer_session_templates_admin_name_idx
  on public.trainer_session_templates (lower(trim(name)))
  where visibility = 'admin';

drop policy if exists "Trainers can view own session templates" on public.trainer_session_templates;
drop policy if exists "Trainers can create own session templates" on public.trainer_session_templates;
drop policy if exists "Trainers can update own session templates" on public.trainer_session_templates;
drop policy if exists "Trainers can delete own session templates" on public.trainer_session_templates;
drop policy if exists "Trainers can view team session templates" on public.trainer_session_templates;
drop policy if exists "Trainers can create team session templates" on public.trainer_session_templates;
drop policy if exists "Trainers can update team session templates" on public.trainer_session_templates;
drop policy if exists "Trainers can delete team session templates" on public.trainer_session_templates;
drop policy if exists "Admins can view admin session templates" on public.trainer_session_templates;
drop policy if exists "Staff can view session templates" on public.trainer_session_templates;
drop policy if exists "Staff can create session templates" on public.trainer_session_templates;
drop policy if exists "Staff can update session templates" on public.trainer_session_templates;
drop policy if exists "Staff can delete session templates" on public.trainer_session_templates;

create policy "Staff can view session templates"
  on public.trainer_session_templates for select
  to authenticated
  using (
    (
      visibility = 'personal'
      and trainer_id = auth.uid()
      and public.is_entrenador()
    )
    or (
      visibility = 'admin'
      and public.current_user_role_slug() = 'administrador'
    )
  );

create policy "Staff can create session templates"
  on public.trainer_session_templates for insert
  to authenticated
  with check (
    trainer_id = auth.uid()
    and (
      (
        visibility = 'personal'
        and public.is_entrenador()
      )
      or (
        visibility = 'admin'
        and public.current_user_role_slug() = 'administrador'
      )
    )
  );

create policy "Staff can update session templates"
  on public.trainer_session_templates for update
  to authenticated
  using (
    (
      visibility = 'personal'
      and trainer_id = auth.uid()
      and public.is_entrenador()
    )
    or (
      visibility = 'admin'
      and public.current_user_role_slug() = 'administrador'
    )
  )
  with check (
    (
      visibility = 'personal'
      and trainer_id = auth.uid()
      and public.is_entrenador()
    )
    or (
      visibility = 'admin'
      and public.current_user_role_slug() = 'administrador'
    )
  );

create policy "Staff can delete session templates"
  on public.trainer_session_templates for delete
  to authenticated
  using (
    (
      visibility = 'personal'
      and trainer_id = auth.uid()
      and public.is_entrenador()
    )
    or (
      visibility = 'admin'
      and public.current_user_role_slug() = 'administrador'
    )
  );
