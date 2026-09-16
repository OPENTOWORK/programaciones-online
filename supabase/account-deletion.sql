-- Borrado de cuenta iniciado por el propio usuario.
-- Exigido por App Store (guía 5.1.1(v)) y Google Play.
--
-- Se resuelve con una función `security definer` en vez de una Edge Function
-- para no depender de un SUPABASE_ACCESS_TOKEN de despliegue: se aplica con
-- `npm run supabase:account-deletion`, que solo necesita acceso a la base.

-- 1. El usuario tiene que poder borrar sus propios ficheros de Storage.
--    `fotos` y `session-videos` ya traían política de borrado propio
--    (igual que `session-block-audio` y `chat-media` cuando se creen);
--    en estos dos buckets solo podía borrar el entrenador.

drop policy if exists "Athletes can delete own plan pdfs" on storage.objects;
create policy "Athletes can delete own plan pdfs"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'athlete-plan-pdfs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Athletes can delete own feedback media" on storage.objects;
create policy "Athletes can delete own feedback media"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'feedback-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 2. Función de borrado. La identidad sale de `auth.uid()`, así que un usuario
--    solo puede borrarse a sí mismo: no acepta ningún parámetro.

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_uid uuid := auth.uid();
begin
  if current_uid is null then
    raise exception 'No hay sesión activa.' using errcode = '28000';
  end if;

  -- Los ficheros de Storage se borran antes desde el cliente con la Storage
  -- API: Supabase bloquea el DELETE directo sobre storage.objects
  -- ("Direct deletion from storage tables is not allowed"), así que aquí no
  -- se puede hacer de red de seguridad. Por eso `deleteOwnAccount` los borra
  -- primero y las políticas de arriba le dan permiso para hacerlo.

  -- El resto de los datos cuelga de auth.users con `on delete cascade`
  -- (perfil, entrenos, medidas, mensajes, sesiones de auth, identidades...).
  -- Lo que es de otros (gimnasios, citas del entrenador) queda con `set null`.
  delete from auth.users where id = current_uid;
end;
$$;

-- Solo un usuario autenticado puede llamarla.
revoke all on function public.delete_own_account() from public;
revoke all on function public.delete_own_account() from anon;
grant execute on function public.delete_own_account() to authenticated;

comment on function public.delete_own_account() is
  'Borra de forma permanente la cuenta del usuario autenticado y todos sus datos. App Store 5.1.1(v).';
