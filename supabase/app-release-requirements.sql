-- Versión mínima obligatoria por plataforma.
--
-- Cuando la app instalada es anterior a `min_supported_version` (o a `min_supported_build`),
-- el cliente no carga y muestra una pantalla que lleva a la tienda a actualizar.
-- Se lee sin sesión: el bloqueo tiene que funcionar también antes de iniciar sesión.

create table if not exists public.app_release_requirements (
  platform text primary key check (platform in ('android', 'ios')),
  min_supported_version text not null,
  min_supported_build integer,
  latest_version text,
  store_url text,
  update_message text,
  updated_at timestamptz not null default now()
);

alter table public.app_release_requirements enable row level security;

drop policy if exists "App release requirements are public" on public.app_release_requirements;
create policy "App release requirements are public"
  on public.app_release_requirements for select
  to anon, authenticated
  using (true);

-- Valores iniciales: no bloquean nada todavía (la versión publicada es la 1.0.15).
insert into public.app_release_requirements (platform, min_supported_version, min_supported_build, latest_version, store_url)
values
  (
    'android',
    '1.0.0',
    1,
    '1.0.15',
    'https://play.google.com/store/apps/details?id=com.trainingprogline.app'
  ),
  ('ios', '1.0.0', 1, '1.0.15', null)
on conflict (platform) do nothing;
