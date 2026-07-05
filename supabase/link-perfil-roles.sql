-- Enlazar Perfil.id_roles con roles.id
alter table public."Perfil" add column if not exists id_roles uuid;

update public."Perfil" p
set id_roles = r.id
from public.roles r
where r.slug = 'atleta'
  and p.id_roles is not null
  and not exists (select 1 from public.roles rr where rr.id = p.id_roles);

update public."Perfil" p
set id_roles = r.id
from public.roles r
where r.slug = 'atleta'
  and p.id_roles is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'Perfil_id_roles_fkey'
      and conrelid = 'public."Perfil"'::regclass
  ) then
    alter table public."Perfil"
      add constraint "Perfil_id_roles_fkey"
      foreign key (id_roles) references public.roles(id);
  end if;
end $$;
