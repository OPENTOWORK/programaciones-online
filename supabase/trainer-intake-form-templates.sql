-- Formularios personalizables por el equipo de entrenadores.
-- Cada plantilla define campos dinámicos (schema jsonb) y los atletas responden en athlete_intake_submissions.

create table if not exists public.trainer_intake_form_templates (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120),
  description text,
  is_default boolean not null default false,
  is_active boolean not null default true,
  schema jsonb not null default '{"fields":[]}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trainer_intake_form_templates_name_idx
  on public.trainer_intake_form_templates (name);

create index if not exists trainer_intake_form_templates_default_idx
  on public.trainer_intake_form_templates (is_default)
  where is_default = true;

alter table public.trainer_intake_form_templates enable row level security;

drop policy if exists "Trainers can view team intake form templates"
  on public.trainer_intake_form_templates;
create policy "Trainers can view team intake form templates"
  on public.trainer_intake_form_templates for select
  to authenticated
  using (public.is_entrenador());

drop policy if exists "Trainers can create team intake form templates"
  on public.trainer_intake_form_templates;
create policy "Trainers can create team intake form templates"
  on public.trainer_intake_form_templates for insert
  to authenticated
  with check (public.is_entrenador() and trainer_id = auth.uid());

drop policy if exists "Trainers can update team intake form templates"
  on public.trainer_intake_form_templates;
create policy "Trainers can update team intake form templates"
  on public.trainer_intake_form_templates for update
  to authenticated
  using (public.is_entrenador())
  with check (public.is_entrenador());

drop policy if exists "Trainers can delete team intake form templates"
  on public.trainer_intake_form_templates;
create policy "Trainers can delete team intake form templates"
  on public.trainer_intake_form_templates for delete
  to authenticated
  using (public.is_entrenador());

drop policy if exists "Athletes can view active intake form templates"
  on public.trainer_intake_form_templates;
create policy "Athletes can view active intake form templates"
  on public.trainer_intake_form_templates for select
  to authenticated
  using (
    is_active = true
    and exists (
      select 1
      from public."Perfil" p
      join public.roles r on r.id = p.id_roles
      where p.id = auth.uid()
        and r.slug = 'atleta'
    )
  );

create table if not exists public.athlete_intake_submissions (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references auth.users(id) on delete cascade,
  template_id uuid not null references public.trainer_intake_form_templates(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (athlete_id, template_id)
);

create index if not exists athlete_intake_submissions_athlete_idx
  on public.athlete_intake_submissions (athlete_id);

create index if not exists athlete_intake_submissions_template_idx
  on public.athlete_intake_submissions (template_id);

alter table public.athlete_intake_submissions enable row level security;

drop policy if exists "Athletes can view own intake submissions"
  on public.athlete_intake_submissions;
create policy "Athletes can view own intake submissions"
  on public.athlete_intake_submissions for select
  to authenticated
  using (auth.uid() = athlete_id);

drop policy if exists "Athletes can insert own intake submissions"
  on public.athlete_intake_submissions;
create policy "Athletes can insert own intake submissions"
  on public.athlete_intake_submissions for insert
  to authenticated
  with check (auth.uid() = athlete_id);

drop policy if exists "Athletes can update own intake submissions"
  on public.athlete_intake_submissions;
create policy "Athletes can update own intake submissions"
  on public.athlete_intake_submissions for update
  to authenticated
  using (auth.uid() = athlete_id)
  with check (auth.uid() = athlete_id);

drop policy if exists "Trainers can view athlete intake submissions"
  on public.athlete_intake_submissions;
create policy "Trainers can view athlete intake submissions"
  on public.athlete_intake_submissions for select
  to authenticated
  using (
    public.is_entrenador()
    and exists (
      select 1
      from public."Perfil" p
      join public.roles r on r.id = p.id_roles
      where p.id = athlete_intake_submissions.athlete_id
        and r.slug = 'atleta'
    )
  );
